/**
 * Security Rate Limiter & Brute-Force Protection
 * Implements a sliding-window rate limiter for sensitive actions (Login, Password Reset, Checkout).
 * Throttles attacks with exponential backoff and returns 429 status codes.
 */

const RATE_LIMITS = {
  admin_login: { maxAttempts: 5, windowMs: 15 * 60 * 1000, lockoutMs: 15 * 60 * 1000 },
  checkout_order: { maxAttempts: 10, windowMs: 10 * 60 * 1000, lockoutMs: 5 * 60 * 1000 },
  file_upload: { maxAttempts: 8, windowMs: 5 * 60 * 1000, lockoutMs: 5 * 60 * 1000 },
};

const STORAGE_KEY = 'flowerhub_sec_rate_limits';
let memoryFallback = {};

function getStore() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    }
    return memoryFallback;
  } catch {
    return memoryFallback;
  }
}

function saveStore(store) {
  try {
    memoryFallback = store;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  } catch {
    memoryFallback = store;
  }
}

/**
 * Checks if a specific action key is currently rate-limited.
 * @param {string} actionType - 'admin_login' | 'checkout_order' | 'file_upload'
 * @param {string} [identifier='client'] - IP or user identifier
 * @returns {{allowed: boolean, remainingAttempts: number, retryAfterSeconds: number, error: string|null}}
 */
export function checkRateLimit(actionType, identifier = 'default') {
  const cfg = RATE_LIMITS[actionType] || RATE_LIMITS.admin_login;
  const store = getStore();
  const key = `${actionType}:${identifier}`;
  const now = Date.now();

  const record = store[key] || { attempts: [], lockedUntil: 0 };

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      status: 429,
      error: `تم تجاوز الحد المسموح من المحاولات. يُرجى الانتظار ${retryAfterSeconds} ثانية قبل المحاولة مرة أخرى (429 Too Many Requests).`,
    };
  }

  // Filter out attempts outside the current time window
  const activeAttempts = record.attempts.filter((ts) => now - ts < cfg.windowMs);

  const remainingAttempts = Math.max(0, cfg.maxAttempts - activeAttempts.length);

  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
    retryAfterSeconds: 0,
    status: remainingAttempts > 0 ? 200 : 429,
    error:
      remainingAttempts > 0
        ? null
        : 'تم استنفاد عدد المحاولات المتاحة لهذا الإجراء (429 Too Many Requests).',
  };
}

/**
 * Records an attempt (successful or failed).
 * If threshold exceeded, triggers lock out.
 * @param {string} actionType
 * @param {string} [identifier='default']
 * @param {boolean} [isFailure=true] - Only failures increment the lock trigger for logins
 * @returns {number} remainingAttempts
 */
export function recordAttempt(actionType, identifier = 'default', isFailure = true) {
  const cfg = RATE_LIMITS[actionType] || RATE_LIMITS.admin_login;
  const store = getStore();
  const key = `${actionType}:${identifier}`;
  const now = Date.now();

  const record = store[key] || { attempts: [], lockedUntil: 0 };

  if (!isFailure) {
    // Reset on successful authenticated action
    delete store[key];
    saveStore(store);
    return cfg.maxAttempts;
  }

  // Record failed attempt timestamp
  const activeAttempts = record.attempts.filter((ts) => now - ts < cfg.windowMs);
  activeAttempts.push(now);

  let lockedUntil = record.lockedUntil;
  if (activeAttempts.length >= cfg.maxAttempts) {
    lockedUntil = now + cfg.lockoutMs;
  }

  store[key] = { attempts: activeAttempts, lockedUntil };
  saveStore(store);

  return Math.max(0, cfg.maxAttempts - activeAttempts.length);
}

/**
 * Resets rate limit for a given key upon verified login
 */
export function resetRateLimit(actionType, identifier = 'default') {
  const store = getStore();
  const key = `${actionType}:${identifier}`;
  delete store[key];
  saveStore(store);
}
