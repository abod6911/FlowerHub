/**
 * Cryptographic Authentication & Password Hashing Service
 * Implements PBKDF2 with SHA-256 (100,000 iterations) and cryptographically secure salts.
 * Enforces constant-time verification to prevent timing attacks.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 32;
const SESSION_TTL_SECONDS = 900; // 15 minutes session token expiration window

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
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time comparison between two Uint8Arrays to prevent side-channel timing attacks.
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
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

  // Generate or reuse cryptographically secure salt
  const salt = existingSaltHex
    ? hexToBuffer(existingSaltHex)
    : cryptoObj.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));

  // Import password as PBKDF2 base key
  const baseKey = await cryptoObj.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive 256-bit key using PBKDF2-SHA256
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
 * @param {string} candidatePassword
 * @param {string} storedHashHex
 * @param {string} storedSaltHex
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(candidatePassword, storedHashHex, storedSaltHex) {
  try {
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
 * Generates an HMAC-SHA256 signed session token with an expiration timestamp.
 * @param {string} subject - e.g. username or user ID
 * @param {string} role - User role (e.g. 'admin')
 * @returns {Promise<string>} - Bearer session token
 */
export async function generateSessionToken(subject, role = 'admin') {
  const enc = new TextEncoder();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL_SECONDS;

  const cryptoObj = getCrypto();
  const payload = JSON.stringify({
    sub: subject,
    role,
    iat: now,
    exp: expiresAt,
    nonce: bufferToHex(cryptoObj.getRandomValues(new Uint8Array(8))),
  });

  const payloadB64 = btoa(payload);

  // Derive ephemeral session signature key
  const secretKeyBuffer = enc.encode('flowerhub_master_auth_secret_key_prod');
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
 * @param {string} token
 * @returns {Promise<{sub: string, role: string, exp: number}|null>}
 */
export async function validateSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigHex] = parts;
  const enc = new TextEncoder();
  const cryptoObj = getCrypto();

  try {
    const secretKeyBuffer = enc.encode('flowerhub_master_auth_secret_key_prod');
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

    const payload = JSON.parse(atob(payloadB64));
    const now = Math.floor(Date.now() / 1000);

    // Check expiration window (15 minutes strict TTL)
    if (payload.exp < now) {
      console.warn('[Auth Security] Expired session token rejected');
      return null;
    }

    return payload;
  } catch (err) {
    console.error('[Auth Security] Invalid session token format', err);
    return null;
  }
}
