import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, AlertCircle, Eye, EyeOff, LogOut, KeyRound } from 'lucide-react';
import { checkRateLimit, recordAttempt, resetRateLimit } from '../services/rateLimiter';
import { hashPassword, verifyPassword, generateSessionToken, validateSessionToken } from '../services/authService';
import { AdminLoginSchema } from '../schemas/securitySchemas';

// Default master security credentials (stored as PBKDF2 hash)
// Salt: 9f41a80c2e3346b38c205e4939211c47
// Hash for default password 'Florist@2026'
const DEFAULT_SALT = '9f41a80c2e3346b38c205e4939211c47';
// Pre-computed PBKDF2 100k iteration hash for initial seed
const SEED_HASH = '8cfd3f966ff11707ea6b251a37c95b4528f1e67501710183359d9595d2438848';

const AUTH_STORAGE_KEY = 'flowerhub_florist_session';
const PASS_HASH_KEY = 'flowerhub_admin_phash';

export default function AdminAuthGuard({ children, lang = 'ar', onClose }) {
  const isAr = lang === 'ar';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Validate existing session token on mount
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const token = sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (token) {
          const payload = await validateSessionToken(token);
          if (payload && (payload.role === 'admin' || payload.role === 'florist')) {
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (err) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    }
    checkExistingSession();
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Check Rate Limiter for brute-force attacks
    const rateCheck = checkRateLimit('admin_login');
    if (!rateCheck.allowed) {
      setLockoutRemaining(rateCheck.retryAfterSeconds);
      setErrorMsg(rateCheck.error);
      return;
    }

    // 2. Validate input schema with Zod
    const validation = AdminLoginSchema.safeParse({ username: 'florist_admin', password });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || 'بيانات الدخول غير صحيحة');
      recordAttempt('admin_login', 'default', true);
      return;
    }

    setIsLoading(true);

    try {
      // 3. Verify against stored or seed hash
      const storedHash = localStorage.getItem(PASS_HASH_KEY) || SEED_HASH;
      const isValid = await verifyPassword(password, storedHash, DEFAULT_SALT);

      if (!isValid) {
        const remaining = recordAttempt('admin_login', 'default', true);
        if (remaining <= 0) {
          const checkAfter = checkRateLimit('admin_login');
          setLockoutRemaining(checkAfter.retryAfterSeconds);
          setErrorMsg(checkAfter.error);
        } else {
          setErrorMsg(
            isAr
              ? `كلمة المرور غير صحيحة. متبقي ${remaining} محاولات قبل الإغلاق الأمني.`
              : `Incorrect password. ${remaining} attempts remaining before security lockout.`
          );
        }
        setIsLoading(false);
        return;
      }

      // 4. Success: Reset rate limits, generate signed session token with 15-minute expiration
      resetRateLimit('admin_login');
      const token = await generateSessionToken('master_florist', 'admin');
      sessionStorage.setItem(AUTH_STORAGE_KEY, token);

      setIsAuthenticated(true);
      setPassword('');
    } catch (err) {
      setErrorMsg(isAr ? 'حدث خطأ أثناء المصادقة الأمنية.' : 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    if (onClose) onClose();
  };

  if (isLoading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3 bg-stone-900 text-stone-200 min-h-screen">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-wider">{isAr ? 'التحقق من الجلسة الأمنية...' : 'Validating security session...'}</span>
      </div>
    );
  }

  // If already authenticated with valid token, render protected admin children
  if (isAuthenticated) {
    return (
      <div className="relative w-full">
        {/* Floating Top Security Bar with Session Status and Logout */}
        <div className="bg-stone-950 text-stone-300 px-4 py-2 text-xs flex items-center justify-between border-b border-stone-800 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-stone-200">
              {isAr ? 'جلسة منسق موثقة (RBAC: Admin)' : 'Authenticated Florist Session'}
            </span>
            <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">| صالحة لمدة 15 دقيقة</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
        {children}
      </div>
    );
  }

  // Not authenticated: Render Secure Authentication Gate Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-sm rounded-[28px] bg-stone-900 border border-amber-400/30 p-6 text-white shadow-2xl flex flex-col gap-4 animate-scale-up">
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 text-[10px] font-bold text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'حماية لوحة المنسق' : 'RBAC Protected'}</span>
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-lg font-bold font-serif text-white">
            {isAr ? 'تسجيل دخول منسق المتجر' : 'Florist Management Access'}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {isAr
              ? 'هذه المنطقة مخصصة لإدارة المعروض والأسعار وهوية المتجر وتتطلب مصادقة مشفرة.'
              : 'Restricted area for store coordinator. Requires verified credentials.'}
          </p>
        </div>

        {/* Error / Lockout Banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {lockoutRemaining > 0 && (
                <div className="font-mono font-bold text-amber-300 mt-1">
                  {isAr ? `إعادة المحاولة بعد: ${lockoutRemaining} ثانية` : `Retry in: ${lockoutRemaining}s`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'كلمة المرور / الرمز السري' : 'Admin Password / PIN'}</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={lockoutRemaining > 0 || isLoading}
                placeholder={isAr ? 'أدخل كلمة مرور المنسق...' : 'Enter password...'}
                className="w-full py-2.5 px-3.5 pe-10 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-stone-500 pt-0.5">
              {isAr ? 'الافتراضي التجريبي: Florist@2026' : 'Demo default: Florist@2026'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-semibold transition-all"
            >
              {isAr ? 'العودة للمتجر' : 'Back to Store'}
            </button>

            <button
              type="submit"
              disabled={lockoutRemaining > 0 || isLoading}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isAr ? 'تحقق ومتابعة' : 'Verify Access'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
