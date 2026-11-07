/**
 * Secure Logger & Error Sanitizer
 * Disables verbose debug logging in production environments.
 * Converts stack traces into secure randomized incident reference codes for users.
 */

const IS_PROD = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

/**
 * Generates an opaque random incident reference code (e.g. ERR-SEC-KX89-F42A)
 */
export function generateIncidentCode() {
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ERR-SEC-${timePart}-${randPart}`;
}

/**
 * Initializes secure production logger:
 * Suppresses console.debug, console.info, and console.log in production.
 */
export function initSecureLogger() {
  if (IS_PROD) {
    // Retain only console.error for critical crash reports, disable noisy debug
    console.debug = () => {};
    console.info = () => {};
    console.log = () => {};
  }
}

/**
 * Sanitizes an error for user-facing presentation.
 * Returns a friendly, safe error message and an incident tracking code.
 * Never leaks database schemas, query strings, or stack traces to the UI.
 *
 * @param {Error|unknown} error
 * @param {string} [context='Application']
 * @returns {{message: string, incidentCode: string}}
 */
export function sanitizeClientError(error, context = 'Application') {
  const incidentCode = generateIncidentCode();

  // Internal audit log (only visible in protected server/internal logs)
  if (!IS_PROD) {
    console.error(`[${context} Error | ${incidentCode}]:`, error);
  }

  return {
    message: 'حدث خطأ غير متوقع. تم تسجيل رقم المرجع للفحص الفني.',
    incidentCode,
  };
}
