import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  User,
  Wand2,
  Check,
  ShieldAlert,
  Store,
} from 'lucide-react';
import { checkRateLimit, recordAttempt, resetRateLimit } from '../services/rateLimiter';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  validateSessionToken,
  generateStrongPassword,
  evaluatePasswordStrength,
  appendAuditLog,
} from '../services/authService';
import { AdminLoginSchema, StrongPasswordSchema } from '../schemas/securitySchemas';
import { verifyStoreOwnerLogin, getStoreBySlugOrId } from '../utils/storesManager';
import { stripHtml } from '../utils/sanitizer';

export const AUTH_STORAGE_KEY = 'flowerhub_florist_session';
export const SUPER_ADMIN_CRED_KEY = 'flowerhub_super_admin_cred';

/**
 * Reads persisted Super Admin PBKDF2 credentials (never plain text).
 */
export function getSuperAdminRecord() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SUPER_ADMIN_CRED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.username && parsed.hash && parsed.salt) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Rotates Super Admin password cleanly after verifying current password.
 */
export async function rotateSuperAdminPassword(currentPassword, newPassword, lang = 'ar') {
  const isAr = lang === 'ar';
  const record = getSuperAdminRecord();
  if (!record) {
    return {
      success: false,
      error: isAr ? 'لم يتم تهيئة حساب مدير المنصة بعد' : 'Platform admin account not initialized',
    };
  }

  const currentValid = await verifyPassword(currentPassword, record.hash, record.salt);
  if (!currentValid) {
    appendAuditLog({
      action: 'super_admin_rotation_failed',
      actor: record.username,
      severity: 'warning',
      details: 'Invalid current password provided during super admin password rotation.',
    });
    return {
      success: false,
      error: isAr ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect',
    };
  }

  const pwdCheck = StrongPasswordSchema.safeParse(newPassword);
  if (!pwdCheck.success) {
    return {
      success: false,
      error: pwdCheck.error.issues[0]?.message || (isAr ? 'كلمة المرور الجديدة ضعيفة' : 'New password is too weak'),
    };
  }

  const { hash, salt } = await hashPassword(newPassword);
  const updated = {
    ...record,
    hash,
    salt,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(SUPER_ADMIN_CRED_KEY, JSON.stringify(updated));

  appendAuditLog({
    action: 'super_admin_password_rotated',
    actor: record.username,
    severity: 'warning',
    details: 'Super admin PBKDF2-SHA256 credentials rotated successfully.',
  });

  return { success: true };
}

export default function AdminAuthGuard({
  children,
  lang = 'ar',
  onClose,
  onAuthChange,
  showTopBar = false,
  requiredRole = 'any', // 'super_admin' | 'any'
  storeContext = null, // { id, slug, shopNameAr, shopNameEn }
}) {
  const isAr = lang === 'ar';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionPayload, setSessionPayload] = useState(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [needsInitialSetup, setNeedsInitialSetup] = useState(false);

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const strength = evaluatePasswordStrength(password);

  // Check existing HMAC session & credential vault initialization on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const superAdmin = getSuperAdminRecord();
        const storeHasCredentials = Boolean(
          storeContext?.slug && getStoreBySlugOrId(storeContext.slug)?.account?.hasCredentials
        );
        const allowStoreLoginWithoutVault = requiredRole !== 'super_admin' && storeHasCredentials;
        setNeedsInitialSetup(!superAdmin && !allowStoreLoginWithoutVault);

        const token = sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (token) {
          const payload = await validateSessionToken(token);
          if (payload && (payload.role === 'super_admin' || payload.role === 'store_owner' || payload.role === 'admin')) {
            // Check RBAC scope
            if (requiredRole === 'super_admin' && payload.role !== 'super_admin' && payload.role !== 'admin') {
              setAccessDeniedReason(
                isAr
                  ? 'صلاحية «مدير المنصة الرئيسي» مطلوبة للوصول إلى إدارة شبكة المتاجر.'
                  : 'Super Admin privileges are required to access the Multi-Store Builder.'
              );
              setSessionPayload(payload);
              setIsAuthenticated(false);
              if (onAuthChange) onAuthChange(payload);
            } else if (
              payload.role === 'store_owner' &&
              storeContext?.id &&
              payload.storeId &&
              payload.storeId !== storeContext.id
            ) {
              setAccessDeniedReason(
                isAr
                  ? 'هذا الحساب مصرح له بإدارة متجره الخاص فقط ولا يمكنه إدارة هذا المتجر.'
                  : 'This merchant account is scoped to its own store and cannot manage another store.'
              );
              setSessionPayload(payload);
              setIsAuthenticated(false);
              if (onAuthChange) onAuthChange(payload);
            } else {
              setSessionPayload(payload);
              setIsAuthenticated(true);
              setAccessDeniedReason('');
              if (onAuthChange) onAuthChange(payload);
            }
          } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            if (onAuthChange) onAuthChange(null);
          }
        }
      } catch {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        if (onAuthChange) onAuthChange(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [requiredRole, storeContext?.id, storeContext?.slug, isAr, onAuthChange]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // First-Time Super Admin Vault Setup (replaces hardcoded weak seed passwords)
  const handleInitialSetup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = stripHtml(username).trim().toLowerCase();
    const userCheck = AdminLoginSchema.safeParse({ username: cleanUser, password });
    if (!userCheck.success) {
      setErrorMsg(userCheck.error.issues[0]?.message || (isAr ? 'اسم المستخدم غير صالح' : 'Invalid username'));
      return;
    }

    const pwdCheck = StrongPasswordSchema.safeParse(password);
    if (!pwdCheck.success) {
      setErrorMsg(pwdCheck.error.issues[0]?.message || (isAr ? 'كلمة المرور ضعيفة' : 'Password does not meet complexity rules'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { hash, salt } = await hashPassword(password);
      const record = {
        username: cleanUser,
        hash,
        salt,
        role: 'super_admin',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(SUPER_ADMIN_CRED_KEY, JSON.stringify(record));

      const token = await generateSessionToken(cleanUser, 'super_admin', { storeId: '*' });
      sessionStorage.setItem(AUTH_STORAGE_KEY, token);

      appendAuditLog({
        action: 'vault_initialized',
        actor: cleanUser,
        severity: 'info',
        details: 'Super Admin cryptographic vault initialized with PBKDF2-SHA256 (100k iterations).',
      });

      setNeedsInitialSetup(false);
      setSessionPayload({ sub: cleanUser, role: 'super_admin', storeId: '*' });
      setIsAuthenticated(true);
      setPassword('');
      setConfirmPassword('');
    } catch {
      setErrorMsg(isAr ? 'تعذر إنشاء الخزنة الأمنية' : 'Failed to initialize security vault');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Hardened Login (Super Admin + Per-Store Owner Credentials)
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setAccessDeniedReason('');

    const rateCheck = checkRateLimit('admin_login');
    if (!rateCheck.allowed) {
      setLockoutRemaining(rateCheck.retryAfterSeconds);
      setErrorMsg(rateCheck.error);
      return;
    }

    const cleanUser = stripHtml(username).trim().toLowerCase();
    const trimmedPassword = password;

    const validation = AdminLoginSchema.safeParse({ username: cleanUser, password: trimmedPassword });
    if (!validation.success) {
      const remaining = recordAttempt('admin_login', 'default', true);
      if (remaining <= 0) {
        const after = checkRateLimit('admin_login');
        setLockoutRemaining(after.retryAfterSeconds);
        setErrorMsg(after.error);
      } else {
        setErrorMsg(validation.error.issues[0]?.message || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
      }
      return;
    }

    setIsLoading(true);
    try {
      const superAdmin = getSuperAdminRecord();
      let matchedRole = null;
      let matchedStoreId = '*';
      let matchedStoreSlug = null;

      // 1. Check Super Admin PBKDF2 verification
      if (superAdmin && superAdmin.username.toLowerCase() === cleanUser) {
        const ok = await verifyPassword(trimmedPassword, superAdmin.hash, superAdmin.salt);
        if (ok) {
          matchedRole = 'super_admin';
        }
      }

      // 2. Check Per-Store Owner Credentials if not Super Admin
      if (!matchedRole) {
        const storeAuth = await verifyStoreOwnerLogin(
          cleanUser,
          trimmedPassword,
          storeContext?.id || null
        );
        if (storeAuth.valid && storeAuth.store) {
          matchedRole = 'store_owner';
          matchedStoreId = storeAuth.store.id;
          matchedStoreSlug = storeAuth.store.slug;
        } else if (storeAuth.reason === 'account_suspended') {
          setErrorMsg(
            isAr
              ? 'تم إيقاف حساب هذا المتجر من قبل إدارة المنصة.'
              : 'This store account has been suspended by platform administration.'
          );
          setIsLoading(false);
          return;
        } else if (storeAuth.reason === 'account_pending') {
          setErrorMsg(
            isAr
              ? 'حساب المتجر قيد المراجعة ولم يُفعّل بعد.'
              : 'This store account is pending activation.'
          );
          setIsLoading(false);
          return;
        }
      }

      if (!matchedRole) {
        const remaining = recordAttempt('admin_login', 'default', true);
        appendAuditLog({
          action: 'login_failed',
          actor: cleanUser || 'unknown',
          targetId: storeContext?.id || null,
          severity: remaining <= 0 ? 'critical' : 'warning',
          details: `Failed authentication attempt (${remaining} attempts remaining).`,
        });

        if (remaining <= 0) {
          const checkAfter = checkRateLimit('admin_login');
          setLockoutRemaining(checkAfter.retryAfterSeconds);
          setErrorMsg(checkAfter.error);
          appendAuditLog({
            action: 'login_rate_locked',
            actor: cleanUser || 'unknown',
            severity: 'critical',
            details: `Account login rate-locked for ${checkAfter.retryAfterSeconds}s after repeated failures.`,
          });
        } else {
          setErrorMsg(
            isAr
              ? `اسم المستخدم أو كلمة المرور غير صحيحة. متبقي ${remaining} محاولات قبل الإغلاق الأمني.`
              : `Invalid username or password. ${remaining} attempts remaining before security lockout.`
          );
        }
        setIsLoading(false);
        return;
      }

      // Enforce RBAC before issuing access
      if (requiredRole === 'super_admin' && matchedRole !== 'super_admin') {
        appendAuditLog({
          action: 'unauthorized_role_attempt',
          actor: cleanUser,
          targetId: matchedStoreId,
          severity: 'critical',
          details: 'Store owner attempted to access Super Admin Multi-Store Portal.',
        });
        setErrorMsg(
          isAr
            ? 'هذا الحساب يمتلك صلاحية متجر واحد فقط، ولا يملك صلاحية مدير المنصة.'
            : 'This account only has single-store privileges and cannot open the Platform Builder.'
        );
        setIsLoading(false);
        return;
      }

      resetRateLimit('admin_login');
      setLockoutRemaining(0);

      const token = await generateSessionToken(cleanUser, matchedRole, {
        storeId: matchedStoreId,
        storeSlug: matchedStoreSlug,
      });
      sessionStorage.setItem(AUTH_STORAGE_KEY, token);

      appendAuditLog({
        action: 'login_success',
        actor: cleanUser,
        targetId: matchedStoreId === '*' ? 'platform' : matchedStoreId,
        severity: 'info',
        details: `Authenticated session started with role=${matchedRole}.`,
      });

      const nextPayload = { sub: cleanUser, role: matchedRole, storeId: matchedStoreId, storeSlug: matchedStoreSlug };
      setSessionPayload(nextPayload);
      setIsAuthenticated(true);
      setPassword('');
      if (onAuthChange) onAuthChange(nextPayload);
    } catch {
      setErrorMsg(isAr ? 'حدث خطأ أثناء المصادقة الأمنية.' : 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    appendAuditLog({
      action: 'logout',
      actor: sessionPayload?.sub || 'admin',
      severity: 'info',
      details: 'Admin session terminated manually.',
    });
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setSessionPayload(null);
    setIsAuthenticated(false);
    setAccessDeniedReason('');
    if (onAuthChange) onAuthChange(null);
    if (onClose) onClose();
  };

  if (isLoading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-4 bg-stone-950 text-stone-200 min-h-screen">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-amber-400/40 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border border-amber-400/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-400/70" />
          </div>
        </div>
        <span className="text-[11px] font-mono tracking-[0.2em] text-stone-400 uppercase">
          {isAr ? 'التحقق من الجلسة الأمنية' : 'Validating Security Session'}
        </span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="relative w-full">
        {showTopBar && (
          <div className="bg-stone-950 text-stone-300 px-4 py-2 text-xs flex items-center justify-between border-b border-stone-800 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-stone-200">
                {sessionPayload?.role === 'super_admin'
                  ? isAr
                    ? `جلسة مدير المنصة (${sessionPayload?.sub})`
                    : `Super Admin Session (${sessionPayload?.sub})`
                  : isAr
                  ? `جلسة صاحب المتجر (${sessionPayload?.sub})`
                  : `Store Owner Session (${sessionPayload?.sub})`}
              </span>
              <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
                | {isAr ? 'صالحة لمدة 15 دقيقة' : '15-min TTL'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          </div>
        )}
        {children}
      </div>
    );
  }

  // Render RBAC Access Denied Screen if authenticated with lower privilege
  if (accessDeniedReason) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/95 backdrop-blur-xl select-none">
        <div className="w-full max-w-sm rounded-[28px] bg-stone-900 border border-rose-500/35 p-7 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/35 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
              403 • RBAC Restricted
            </span>
            <h2 className="text-lg font-serif font-bold text-white">
              {isAr ? 'وصول مقيد بالصلاحيات' : 'Access Restricted'}
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">{accessDeniedReason}</p>
          </div>
          <div className="flex gap-2.5">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
              >
                {isAr ? 'العودة للمتجر' : 'Back to Store'}
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
            >
              {isAr ? 'تبديل الحساب' : 'Switch Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render First-Time Setup OR Hardened Login Gate
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="relative z-10 w-full max-w-md my-auto"
      >
        <div
          className="rounded-[30px] overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1c1917 0%, #0c0a09 60%, #111827 100%)',
            border: '1px solid rgba(217, 175, 55, 0.25)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Gold Top Ribbon */}
          <div
            className="h-[3px] w-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(217,175,55,0.8) 30%, rgba(253,230,138,1) 50%, rgba(217,175,55,0.8) 70%, transparent)',
            }}
          />

          <div className="p-6 sm:p-7 space-y-5">
            {/* Header Medallion */}
            <div className="text-center space-y-2.5">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-stone-900 border border-amber-400/35 shadow-lg">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400/80 uppercase block">
                  {needsInitialSetup
                    ? isAr
                      ? 'تهيئة الخزنة الأمنية الأولى'
                      : 'Initial Security Vault Setup'
                    : requiredRole === 'super_admin'
                    ? isAr
                      ? 'بوابة مدير المنصة الرئيسي'
                      : 'Super Admin Portal'
                    : isAr
                    ? 'بوابة الإدارة المشفرة'
                    : 'Encrypted Admin Suite'}
                </span>
                <h2 className="text-xl font-serif font-black text-white mt-1">
                  {needsInitialSetup
                    ? isAr
                      ? 'إعداد حساب مدير المنصة'
                      : 'Create Super Admin Account'
                    : isAr
                    ? 'تسجيل الدخول الآمن'
                    : 'Secure Sign In'}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  {needsInitialSetup
                    ? isAr
                      ? 'عيّن اسم مستخدم وكلمة مرور قوية لمدير المنصة.'
                      : 'Create Super Admin username & strong password.'
                    : storeContext?.shopNameAr && requiredRole !== 'super_admin'
                    ? isAr
                      ? `${storeContext.shopNameAr}`
                      : `${storeContext.shopNameEn || storeContext.shopNameAr}`
                    : isAr
                    ? 'سجّل الدخول بحسابك المعتمد.'
                    : 'Sign in with your verified account.'}
                </p>
              </div>

              {/* Compact Security Pill */}
              <div className="flex items-center justify-center gap-2 pt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  <span>PBKDF2 · HMAC · RBAC</span>
                </span>
                {storeContext?.slug && requiredRole !== 'super_admin' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-stone-800 border border-stone-700 text-stone-300" dir="ltr">
                    <Store className="w-3 h-3 text-amber-400" />
                    <span>{storeContext.slug}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl p-3.5 bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-200 leading-relaxed flex-1">
                    <p>{errorMsg}</p>
                    {lockoutRemaining > 0 && (
                      <p className="font-mono font-bold text-amber-300 mt-1">
                        {isAr ? `إعادة المحاولة بعد: ${lockoutRemaining} ثانية` : `Retry in: ${lockoutRemaining}s`}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={needsInitialSetup ? handleInitialSetup : handleLogin} className="space-y-3.5">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'اسم المستخدم' : 'Username'}</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading || lockoutRemaining > 0}
                  placeholder={needsInitialSetup ? 'e.g. platform_admin' : isAr ? 'اسم المستخدم للمدير أو صاحب المحل' : 'Admin or store username'}
                  autoComplete="username"
                  dir="ltr"
                  required
                  className="w-full py-3 px-3.5 rounded-xl bg-stone-900/90 border border-stone-700/80 text-white placeholder-stone-500 text-xs font-mono focus:border-amber-400 focus:outline-none text-start"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'كلمة المرور' : 'Password'}</span>
                  </label>

                  {needsInitialSetup && (
                    <button
                      type="button"
                      onClick={() => {
                        const gen = generateStrongPassword(14);
                        setPassword(gen);
                        setConfirmPassword(gen);
                        setShowPassword(true);
                      }}
                      className="text-[10px] font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>{isAr ? 'توليد كلمة مرور قوية' : 'Generate Strong Password'}</span>
                    </button>
                  )}
                </div>

                <div className="relative" dir="ltr">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || lockoutRemaining > 0}
                    placeholder="••••••••••••"
                    autoComplete={needsInitialSetup ? 'new-password' : 'current-password'}
                    dir="ltr"
                    required
                    className="w-full py-3 ps-3.5 pe-10 rounded-xl bg-stone-900/90 border border-stone-700/80 text-white placeholder-stone-500 text-xs font-mono focus:border-amber-400 focus:outline-none text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-300 p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Live Password Strength Meter on Initial Setup */}
                {needsInitialSetup && password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1 rounded-full transition-colors ${
                            strength.score >= step
                              ? strength.score === 4
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                              : 'bg-stone-800'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {[
                        { ok: strength.checks.length, ar: '10+ خانات', en: '10+ chars' },
                        { ok: strength.checks.upperLower, ar: 'كبير وصغير', en: 'Upper & lower' },
                        { ok: strength.checks.digit, ar: 'رقم', en: 'Number' },
                        { ok: strength.checks.symbol, ar: 'رمز خاص', en: 'Symbol' },
                      ].map((c, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                            c.ok ? 'text-emerald-300 bg-emerald-500/10' : 'text-stone-500 bg-stone-900'
                          }`}
                        >
                          {c.ok && <Check className="w-2.5 h-2.5" />}
                          <span>{isAr ? c.ar : c.en}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password on Initial Setup */}
              {needsInitialSetup && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-300 block">
                    {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    dir="ltr"
                    required
                    className="w-full py-3 px-3.5 rounded-xl bg-stone-900/90 border border-stone-700/80 text-white placeholder-stone-500 text-xs font-mono focus:border-amber-400 focus:outline-none text-start"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-2">
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
                  >
                    {isAr ? 'العودة للمتجر' : 'Back to Store'}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || lockoutRemaining > 0}
                  className="flex-1 py-3 rounded-xl font-black text-xs shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                    color: '#0c0a09',
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {needsInitialSetup
                      ? isAr
                        ? 'تفعيل الخزنة والدخول'
                        : 'Initialize & Enter'
                      : isAr
                      ? 'دخول مشفر'
                      : 'Sign In Securely'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
