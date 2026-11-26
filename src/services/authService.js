/**
 * Cryptographic Authentication, Password Hashing & Security Audit Trail Service
 * Implements PBKDF2 with SHA-256 (100,000 iterations) and cryptographically secure random salts.
 * Enforces constant-time verification to prevent side-channel timing attacks.
 */

import { stripHtml } from '../utils/sanitizer.js';

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 32;
const SESSION_TTL_SECONDS = 900; // 15 minutes strict session expiration window
const EPHEMERAL_HMAC_STORAGE_KEY = 'flowerhub_ephemeral_hmac_k';
const AUDIT_LOG_STORAGE_KEY = 'flowerhub_security_audit_logs';
const MAX_AUDIT_LOGS = 120;

let processRuntimeSecret = null;

const getCrypto = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  throw new Error('Web Crypto API not available');
};

/**
 * Converts ArrayBuffer to Hex string
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts Hex string to Uint8Array
 */
function hexToBuffer(hex) {
  if (!hex || typeof hex !== 'string' || hex.length % 2 !== 0) {
    return new Uint8Array(0);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * UTF-8 safe Base64 encoding & decoding
 */
function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64Utf8(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Retrieves or generates a cryptographically random per-session HMAC signing key
 * (Avoids embedding static production secrets in client bundles).
 */
function getRuntimeSessionSecret() {
  if (processRuntimeSecret) return processRuntimeSecret;

  const cryptoObj = getCrypto();
  if (typeof sessionStorage !== 'undefined') {
    try {
      const existing = sessionStorage.getItem(EPHEMERAL_HMAC_STORAGE_KEY);
      if (existing && /^[a-f0-9]{64}$/i.test(existing)) {
        processRuntimeSecret = existing;
        return processRuntimeSecret;
      }
      const generated = bufferToHex(cryptoObj.getRandomValues(new Uint8Array(32)));
      sessionStorage.setItem(EPHEMERAL_HMAC_STORAGE_KEY, generated);
      processRuntimeSecret = generated;
      return processRuntimeSecret;
    } catch {
      // Fallback to in-memory random secret if sessionStorage is restricted
    }
  }

  processRuntimeSecret = bufferToHex(cryptoObj.getRandomValues(new Uint8Array(32)));
  return processRuntimeSecret;
}

/**
 * Constant-time comparison between two Uint8Arrays to prevent side-channel timing attacks.
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Securely hashes a plain-text password using PBKDF2-SHA256 and a random salt.
 * @param {string} password - Raw password
 * @param {string} [existingSaltHex] - Optional salt for verification
 * @returns {Promise<{hash: string, salt: string, iterations: number}>}
 */
export async function hashPassword(password, existingSaltHex = null) {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const cryptoObj = getCrypto();

  const salt = existingSaltHex
    ? hexToBuffer(existingSaltHex)
    : cryptoObj.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));

  const baseKey = await cryptoObj.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await cryptoObj.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    KEY_BYTE_LENGTH * 8
  );

  return {
    hash: bufferToHex(derivedBits),
    salt: bufferToHex(salt),
    iterations: PBKDF2_ITERATIONS,
  };
}

/**
 * Verifies a candidate password against an existing PBKDF2 hash and salt.
 * Uses timingSafeEqual to avoid timing side-channels.
 */
export async function verifyPassword(candidatePassword, storedHashHex, storedSaltHex) {
  try {
    if (!candidatePassword || !storedHashHex || !storedSaltHex) return false;
    const { hash: computedHash } = await hashPassword(candidatePassword, storedSaltHex);
    const computedBuffer = hexToBuffer(computedHash);
    const storedBuffer = hexToBuffer(storedHashHex);
    return timingSafeEqual(computedBuffer, storedBuffer);
  } catch (err) {
    console.error('[Auth Security] Error during password verification:', err);
    return false;
  }
}

/**
 * Generates a cryptographically strong password using rejection sampling on CSPRNG.
 */
export function generateStrongPassword(length = 14) {
  const cryptoObj = getCrypto();
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*-_+=';
  const all = upper + lower + digits + symbols;

  const pickChar = (charset) => {
    const limit = Math.floor(256 / charset.length) * charset.length;
    const buf = new Uint8Array(1);
    while (true) {
      cryptoObj.getRandomValues(buf);
      if (buf[0] < limit) {
        return charset[buf[0] % charset.length];
      }
    }
  };

  // Guarantee at least one character from every complexity class
  const chars = [
    pickChar(upper),
    pickChar(lower),
    pickChar(digits),
    pickChar(symbols),
  ];

  while (chars.length < Math.max(10, length)) {
    chars.push(pickChar(all));
  }

  // Fisher-Yates shuffle using CSPRNG
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const buf = new Uint32Array(1);
    cryptoObj.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

/**
 * Evaluates password complexity across 4 strict criteria.
 */
export function evaluatePasswordStrength(password = '') {
  const checks = {
    length: password.length >= 10,
    upperLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, maxScore: 4, checks, isStrong: score === 4 };
}

/**
 * Generates an HMAC-SHA256 signed session token with expiration and optional RBAC metadata.
 * @param {string} subject - Username or account ID
 * @param {string} role - e.g. 'super_admin' | 'store_owner' | 'admin'
 * @param {Object} [metadata] - Optional scope metadata (e.g. { storeId, storeSlug })
 */
export async function generateSessionToken(subject, role = 'admin', metadata = {}) {
  const enc = new TextEncoder();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL_SECONDS;

  const cryptoObj = getCrypto();
  const payload = JSON.stringify({
    ...metadata,
    sub: subject,
    role,
    iat: now,
    exp: expiresAt,
    nonce: bufferToHex(cryptoObj.getRandomValues(new Uint8Array(8))),
  });

  const payloadB64 = toBase64Utf8(payload);
  const secretKeyBuffer = enc.encode(getRuntimeSessionSecret());
  const cryptoKey = await cryptoObj.subtle.importKey(
    'raw',
    secretKeyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await cryptoObj.subtle.sign('HMAC', cryptoKey, enc.encode(payloadB64));
  const sigHex = bufferToHex(signature);

  return `${payloadB64}.${sigHex}`;
}

/**
 * Validates a signed session token.
 * Returns decoded payload if valid and not expired; null otherwise.
 */
export async function validateSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigHex] = parts;
  if (!/^[a-f0-9]+$/i.test(sigHex)) return null;

  const enc = new TextEncoder();
  const cryptoObj = getCrypto();

  try {
    const secretKeyBuffer = enc.encode(getRuntimeSessionSecret());
    const cryptoKey = await cryptoObj.subtle.importKey(
      'raw',
      secretKeyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await cryptoObj.subtle.verify(
      'HMAC',
      cryptoKey,
      hexToBuffer(sigHex),
      enc.encode(payloadB64)
    );

    if (!isValid) return null;

    const payload = JSON.parse(fromBase64Utf8(payloadB64));
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp < now) {
      console.warn('[Auth Security] Expired session token rejected');
      return null;
    }

    return payload;
  } catch (err) {
    console.error('[Auth Security] Invalid session token format', err);
    return null;
  }
}

/**
 * Appends a sanitized security event to the bounded audit trail.
 */
export function appendAuditLog({
  action,
  actor = 'system',
  targetId = null,
  targetLabel = null,
  severity = 'info',
  details = '',
}) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  const entry = {
    id: `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    action: stripHtml(String(action || 'unknown')).slice(0, 64),
    actor: stripHtml(String(actor || 'system')).slice(0, 64),
    targetId: targetId ? stripHtml(String(targetId)).slice(0, 64) : null,
    targetLabel: targetLabel ? stripHtml(String(targetLabel)).slice(0, 100) : null,
    severity: ['info', 'warning', 'critical'].includes(severity) ? severity : 'info',
    details: stripHtml(String(details || '')).slice(0, 240),
  };

  try {
    const existingRaw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const list = Array.isArray(existing) ? [entry, ...existing].slice(0, MAX_AUDIT_LOGS) : [entry];
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }

  return entry;
}

/**
 * Retrieves security audit trail entries (newest first).
 */
export function getAuditLogs() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
