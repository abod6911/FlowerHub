/**
 * Security Sanitization Utilities
 * Prevents Cross-Site Scripting (XSS), URL injection, and HTML tag smuggling.
 */

// HTML entity mapping for output encoding
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escapes HTML characters to prevent stored/reflected XSS.
 * @param {string} str - Raw untrusted user input
 * @returns {string} - Sanitized string safe for DOM interpolation
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=\/]/g, (char) => HTML_ENTITIES[char] || char).trim();
}

/**
 * Strips all HTML/XML tags and executable script/style blocks completely, leaving only clean plain text.
 * @param {string} str - Raw untrusted user input
 * @returns {string} - Clean plain text
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

/**
 * Validates and sanitizes URLs to prevent `javascript:`, `data:`, or `vbscript:` attacks.
 * Only `https://` and relative URLs (e.g. `./images/...`) are permitted.
 * @param {string} url - Candidate URL
 * @param {string} fallback - Fallback URL if invalid
 * @returns {string} - Safe sanitized URL
 */
export function sanitizeUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();

  // Explicitly block dangerous script protocols
  if (/^(javascript|vbscript|data|file):/i.test(trimmed)) {
    console.warn('[Security Alert] Blocked attempt to inject dangerous URI scheme:', trimmed);
    return fallback;
  }

  // Allow relative URLs starting with ./ or /
  if (trimmed.startsWith('./') || (trimmed.startsWith('/') && !trimmed.startsWith('//'))) {
    return trimmed;
  }

  // Ensure absolute URLs use HTTPS strictly
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') {
      return parsed.toString();
    }
    // Downgrade or reject insecure http: in production
    console.warn('[Security Alert] Insecure URL protocol rejected. Only HTTPS allowed:', trimmed);
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Validates that an image file name does not contain directory traversal attempts.
 * @param {string} fileName - File name to test
 * @returns {boolean}
 */
export function isSafeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') return false;
  // Disallow directory traversal sequences like ../ or ..\
  if (/\.\.[\/\\]/.test(fileName)) return false;
  // Disallow control characters
  if (/[\x00-\x1f\x80-\x9f]/.test(fileName)) return false;
  // Allow only alphanumeric, dashes, underscores, and safe extensions
  return /^[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp|svg)$/i.test(fileName);
}
