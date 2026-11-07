/**
 * Cookie Security Utilities
 * Formats production-grade secure cookie headers with HttpOnly, Secure, and SameSite flags.
 * Manages one-time token expiration windows.
 */

// Crypto provider helper (works in Browser and Node.js environments)
const getCrypto = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  throw new Error('Web Crypto API not available');
};

/**
 * Creates a secure cookie directive string for session storage.
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value (e.g. encrypted session token)
 * @param {number} [maxAgeSeconds=900] - 15 minutes default TTL
 * @returns {string} - Cookie header string
 */
export function buildSecureCookie(name, value, maxAgeSeconds = 900) {
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAgeSeconds}`,
    'Path=/',
    'SameSite=Strict',
    'HttpOnly', // Server-side directive; marks architectural requirement
    'Secure',   // Enforce Secure flag for HTTPS production
  ];

  return parts.join('; ');
}

export const formatSecureCookie = buildSecureCookie;

/**
 * Generates a one-time cryptographic reset token with strict 15-minute expiration window.
 * @param {string} userId - User or florist ID
 * @returns {Promise<{token: string, expiresAt: number}>}
 */
export async function generateOneTimeResetToken(userId) {
  const cryptoObj = getCrypto();
  const nonce = Array.from(cryptoObj.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes strict

  const raw = `${userId}:${nonce}:${expiresAt}`;
  const enc = new TextEncoder();
  const hashBuf = await cryptoObj.subtle.digest('SHA-256', enc.encode(raw));
  const token = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { token, expiresAt };
}

/**
 * Validates a one-time token against expiration.
 */
export function verifyPasswordResetToken(token, record) {
  if (!token || !record || !record.token) return false;
  if (Date.now() > record.expiresAt) return false;
  return token === record.token;
}
