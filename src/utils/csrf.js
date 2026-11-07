/**
 * CSRF Protection Utility
 * Implements double-submit token pattern for sensitive state-changing operations.
 */

const CSRF_STORAGE_KEY = 'flowerhub_sec_csrf_token';

const getCrypto = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  throw new Error('Web Crypto API not available');
};

/**
 * Generates a fresh cryptographically secure CSRF token.
 * @returns {string}
 */
export function generateCsrfToken() {
  const bytes = getCrypto().getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates and stores a cryptographically random CSRF token in session
 * @returns {string}
 */
export function getOrCreateCsrfToken() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      let token = sessionStorage.getItem(CSRF_STORAGE_KEY);
      if (!token) {
        token = generateCsrfToken();
        sessionStorage.setItem(CSRF_STORAGE_KEY, token);
      }
      return token;
    }
    return generateCsrfToken();
  } catch {
    return generateCsrfToken();
  }
}

/**
 * Validates candidate CSRF token against session token or expected token
 * @param {string} candidateToken
 * @param {string} [expectedToken]
 * @returns {boolean}
 */
export function validateCsrfToken(candidateToken, expectedToken) {
  if (!candidateToken || typeof candidateToken !== 'string') return false;
  try {
    const target = expectedToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CSRF_STORAGE_KEY) : null);
    if (!target) return false;
    // Constant-time length & value check
    if (candidateToken.length !== target.length) return false;
    let diff = 0;
    for (let i = 0; i < candidateToken.length; i++) {
      diff |= candidateToken.charCodeAt(i) ^ target.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}
