/**
 * Automated Security Hardening Verification Suite
 * Verifies all 12 security features implemented across the application.
 */
import { hashPassword, verifyPassword, generateSessionToken, validateSessionToken } from '../src/services/authService.js';
import { checkRateLimit, recordAttempt, resetRateLimit } from '../src/services/rateLimiter.js';
import { verifyAndRecalculateOrder } from '../src/services/priceVerificationService.js';
import { detectMagicBytes } from '../src/services/uploadSecurity.js';
import { sanitizeText, stripHtml, sanitizeUrl } from '../src/utils/sanitizer.js';
import { AdminLoginSchema, OrderItemSchema, CustomOrderSchema } from '../src/schemas/securitySchemas.js';
import { formatSecureCookie, generateOneTimeResetToken, verifyPasswordResetToken } from '../src/utils/cookieSecurity.js';
import { generateCsrfToken, validateCsrfToken } from '../src/utils/csrf.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS: ${message}`);
}

async function runSecurityTests() {
  console.log('====================================================');
  console.log('🔒 EXECUTING FULL APPLICATION SECURITY AUDIT SUITE');
  console.log('====================================================\n');

  // --- Check 1: Authentication & PBKDF2 Password Hashing ---
  console.log('--- Step 1: Authentication & Password Hashing ---');
  const salt = '9f41a80c2e3346b38c205e4939211c47';
  const plainPassword = 'Florist@Password2026!';
  const { hash: hashedPassword } = await hashPassword(plainPassword, salt);
  assert(typeof hashedPassword === 'string' && hashedPassword.length === 64, 'PBKDF2-SHA256 generates 64-char hex hash');
  
  const isMatch = await verifyPassword(plainPassword, hashedPassword, salt);
  assert(isMatch === true, 'Valid password verifies correctly');
  
  const isWrongMatch = await verifyPassword('WrongPassword123!', hashedPassword, salt);
  assert(isWrongMatch === false, 'Invalid password is rejected');

  // --- Step 2: Session Token Generation & Expiration ---
  console.log('\n--- Step 2 & 7: HMAC-Signed Session Tokens & Token Expiry ---');
  const sessionToken = await generateSessionToken('admin_user', 'admin');
  assert(typeof sessionToken === 'string' && sessionToken.includes('.'), 'Token is split into payload and HMAC signature');
  
  const validatedPayload = await validateSessionToken(sessionToken);
  assert(validatedPayload && validatedPayload.sub === 'admin_user' && validatedPayload.role === 'admin', 'Valid token payload verified');

  const tamperedToken = sessionToken.slice(0, -4) + 'abcd';
  const invalidPayload = await validateSessionToken(tamperedToken);
  assert(invalidPayload === null, 'Tampered token HMAC signature check fails');

  // One-time password reset token expiry test
  const resetTokenObj = await generateOneTimeResetToken('user@domain.com');
  assert(resetTokenObj.token && resetTokenObj.expiresAt > Date.now(), 'Reset token generated with valid expiry');
  assert(verifyPasswordResetToken(resetTokenObj.token, resetTokenObj) === true, 'Fresh reset token is valid');
  assert(verifyPasswordResetToken('fake-token', resetTokenObj) === false, 'Bogus reset token rejected');

  // --- Step 4 & 5: Input Validation & XSS Sanitization ---
  console.log('\n--- Step 4 & 5: Input Validation (Zod) & XSS Sanitization ---');
  const maliciousInput = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">Hello & Welcome!';
  const sanitized = sanitizeText(maliciousInput);
  assert(!sanitized.includes('<script>') && !sanitized.includes('onerror='), 'HTML tags and event handlers escaped');
  assert(sanitized.includes('&lt;script&gt;'), 'Special characters encoded to HTML entities');

  const cleanStripped = stripHtml(maliciousInput);
  assert(cleanStripped === 'Hello & Welcome!', 'All HTML tags stripped cleanly');

  // URL Sanitization
  const jsUrl = 'javascript:alert(document.cookie)';
  assert(sanitizeUrl(jsUrl, '') === '', 'Dangerous javascript: URL blocked');
  const dataUrl = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
  assert(sanitizeUrl(dataUrl, '') === '', 'Dangerous data: HTML URL blocked');
  const safeHttpsUrl = 'https://images.unsplash.com/photo-1518895949257';
  assert(sanitizeUrl(safeHttpsUrl, '') === safeHttpsUrl, 'Valid HTTPS URL permitted');

  // Zod Schemas
  const validAdmin = AdminLoginSchema.safeParse({ username: 'florist_admin', password: 'ValidPassword123' });
  assert(validAdmin.success === true, 'Admin login schema accepts valid credentials');
  
  const shortPass = AdminLoginSchema.safeParse({ username: 'florist_admin', password: '123' });
  assert(shortPass.success === false, 'Admin login schema rejects weak passwords');

  // --- Step 6: Rate Limiting & CSRF Protection ---
  console.log('\n--- Step 6: Rate Limiting & CSRF Tokens ---');
  resetRateLimit('admin_login', 'test-ip');
  let allowedStatus = checkRateLimit('admin_login', 'test-ip');
  assert(allowedStatus.allowed === true && allowedStatus.remainingAttempts === 5, 'Initial rate limit allows attempts');

  // Simulate 5 failed attempts
  for (let i = 0; i < 5; i++) {
    recordAttempt('admin_login', 'test-ip', true);
  }
  const lockedStatus = checkRateLimit('admin_login', 'test-ip');
  assert(lockedStatus.allowed === false, 'Rate limiter triggers lockout after maximum attempts');
  assert(lockedStatus.status === 429, 'Rate limiter returns HTTP 429 status code');
  assert(lockedStatus.retryAfterSeconds > 0, 'Retry-After countdown provided');

  // CSRF Tokens
  const csrfToken = generateCsrfToken();
  assert(typeof csrfToken === 'string' && csrfToken.length === 64, 'CSRF token is 64-char crypto hex');
  assert(validateCsrfToken(csrfToken, csrfToken) === true, 'Matching CSRF token validated');
  assert(validateCsrfToken(csrfToken, 'mismatched-csrf-token') === false, 'Mismatched CSRF token rejected');

  // --- Step 7: Cookie Security Flags ---
  console.log('\n--- Step 7: Cookie Security Flags ---');
  const cookieString = formatSecureCookie('flowerhub_session', 'test-jwt-token', 900);
  assert(cookieString.includes('HttpOnly'), 'Cookie includes HttpOnly flag');
  assert(cookieString.includes('Secure'), 'Cookie includes Secure flag');
  assert(cookieString.includes('SameSite=Strict'), 'Cookie includes SameSite=Strict flag');
  assert(cookieString.includes('Max-Age=900'), 'Cookie enforces 15-minute Max-Age');

  // --- Step 8: Magic Bytes Validation & Server-Side Price Verification ---
  console.log('\n--- Step 8: Magic Bytes & Price Recalculation Integrity ---');
  // 1. Magic bytes
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]).buffer;
  assert(detectMagicBytes(jpegHeader) === 'jpeg', 'JPEG magic bytes correctly identified');

  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).buffer;
  assert(detectMagicBytes(pngHeader) === 'png', 'PNG magic bytes correctly identified');

  const exeFakeHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]).buffer; // DOS MZ header
  assert(detectMagicBytes(exeFakeHeader) === null, 'Disguised executable/binary rejected');

  // 2. Server-side price recalculation (Anti-tampering)
  const tamperedCart = [
    {
      id: 'prod-1', // Canonical price is 245 SAR
      titleAr: 'بوكيه الروز الأحمر المخملي',
      price: 1, // Tampered client price of 1 SAR!
      quantity: 2,
      addons: [{ id: 'addon-chocolate', phrase: 'مبروك' }], // 65 SAR
    },
  ];

  const priceResult = verifyAndRecalculateOrder(tamperedCart);
  assert(priceResult.isValid === true, 'Order structure parsed');
  assert(priceResult.tamperingDetected === true, 'Price manipulation attempt detected and flagged');
  assert(priceResult.verifiedItems[0].basePrice === 245, 'Base price restored to canonical 245 SAR');
  // (245 + 65) * 2 = 620 SAR subtotal. Subtotal >= 300 -> Free delivery.
  assert(priceResult.subtotal === 620, 'Subtotal correctly recalculated from canonical database: 620 SAR');
  assert(priceResult.deliveryFee === 0, 'Free delivery applied on orders >= 300 SAR');
  assert(priceResult.grandTotal === 620, 'Grand total correctly recalculated: 620 SAR');

  // Negative quantity attack
  const negativeCart = [
    {
      id: 'prod-1',
      price: 245,
      quantity: -5,
    },
  ];
  const negativeResult = verifyAndRecalculateOrder(negativeCart);
  assert(negativeResult.tamperingDetected === true, 'Negative quantity attack detected');
  assert(negativeResult.verifiedItems[0].quantity === 1, 'Negative quantity normalized to safe minimum 1');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} SECURITY AUDIT TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runSecurityTests().catch((err) => {
  console.error('\n❌ Security test suite failed with error:', err);
  process.exit(1);
});
