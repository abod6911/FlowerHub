/**
 * Multi-Store Platform, Merchant Provisioning & Store Link Manager
 * Handles multi-tenant stores registry, cryptographic per-store owner accounts,
 * portable share links, Google Maps URL generation, and strict input sanitization.
 */

import { sanitizeText, stripHtml, sanitizeUrl } from './sanitizer.js';
import {
  hashPassword,
  verifyPassword,
  appendAuditLog,
} from '../services/authService.js';
import {
  StoreBuilderSchema,
  StoreAccountSchema,
  StrongPasswordSchema,
} from '../schemas/securitySchemas.js';
import { validateCsrfToken } from './csrf.js';

export const STORES_STORAGE_KEY = 'flowerhub_stores_network';
export const ACTIVE_STORE_KEY = 'flowerhub_active_store_id';

// Theme ID aliases to migrate older stored seeds seamlessly to real THEME_TOKENS keys
const THEME_ALIAS_MAP = {
  royalNoir: 'noir',
  roseGold: 'velvet',
  parisianSilk: 'botanical',
  emeraldLuxe: 'botanical',
  stone: 'minimal',
};

const VALID_THEMES = ['botanical', 'velvet', 'noir', 'minimal'];
const VALID_HERO_STYLES = ['qlub', 'editorial', 'minimal'];
const VALID_SPECIALS_STYLES = [
  'editorial_deck',
  'marquee',
  'coverflow',
  'spotlight',
  'stacked_cards',
  'floating_filmstrip',
];

// Arabic-to-Latin transliteration map for generating clean ASCII URL slugs
const AR_LATIN_MAP = {
  أ: 'a', إ: 'a', آ: 'a', ا: 'a', ب: 'b', ت: 't', ث: 'th', ج: 'j', ح: 'h',
  خ: 'kh', د: 'd', ذ: 'dh', ر: 'r', ز: 'z', س: 's', ش: 'sh', ص: 's', ض: 'd',
  ط: 't', ظ: 'z', ع: 'a', غ: 'gh', ف: 'f', ق: 'q', ك: 'k', ل: 'l', م: 'm',
  ن: 'n', ه: 'h', و: 'w', ي: 'y', ى: 'a', ة: 'a', ؤ: 'o', ئ: 'e', ء: '',
};

// Default Luxury Store Branches
export const DEFAULT_STORES = [
  {
    id: 'store-dar-alward',
    slug: 'dar-alward',
    nameAr: 'دار الورد للمناسبات',
    nameEn: 'Maison des Fleurs Atelier',
    taglineAr: 'أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب وريادة',
    taglineEn: 'Luxury artisanal blooms & bespoke floral arrangements',
    phone: '966500000000',
    supportPhone: '966500000000',
    city: 'الرياض',
    district: 'حي النرجس - شمال الرياض',
    address: 'طريق عثمان بن عفان، مجمع النرجس التجاري',
    crNumber: '1010892001',
    vatNumber: '',
    workingHours: '09:00 AM - 11:30 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Dar+Alward+Riyadh',
    instagramUrl: 'https://instagram.com',
    theme: 'botanical',
    heroStyle: 'qlub',
    specialsStyle: 'editorial_deck',
    defaultLang: 'ar',
    status: 'open',
    isPrimary: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    ordersCount: 142,
    rating: '4.9',
    deliveryFee: 0,
    minOrderFreeDelivery: 300,
    prepMinutes: 20,
    account: {
      ownerName: 'أحمد المنصور',
      ownerEmail: 'owner@daralward.sa',
      ownerPhone: '966500000000',
      username: 'dar_alward_owner',
      role: 'store_owner',
      status: 'active',
      passwordHash: null,
      passwordSalt: null,
      hasCredentials: false,
    },
  },
  {
    id: 'store-jasmine-boutique',
    slug: 'jasmine-boutique',
    nameAr: 'بوتيك الياسمين الملكي',
    nameEn: 'Royal Jasmine Floral Studio',
    taglineAr: 'باقات ملوكية وتنسيقات زهور موسمية مستوردة من هولندا',
    taglineEn: 'Royal Dutch bouquets & signature velvet floral arrangements',
    phone: '966548887766',
    supportPhone: '966548887766',
    city: 'الرياض',
    district: 'شارع التخصصي - حي المحمدية',
    address: 'شارع التخصصي، تقاطع طريق العروبة، برج الياسمين',
    crNumber: '1010774512',
    vatNumber: '',
    workingHours: '10:00 AM - 12:00 AM',
    googleMapsUrl: 'https://maps.google.com/?q=Royal+Jasmine+Riyadh',
    instagramUrl: 'https://instagram.com',
    theme: 'noir',
    heroStyle: 'editorial',
    specialsStyle: 'spotlight',
    defaultLang: 'ar',
    status: 'open',
    isPrimary: false,
    createdAt: '2026-02-01T12:00:00.000Z',
    ordersCount: 89,
    rating: '4.8',
    deliveryFee: 25,
    minOrderFreeDelivery: 350,
    prepMinutes: 25,
    account: {
      ownerName: 'سارة السبيعي',
      ownerEmail: 'sara@royaljasmine.sa',
      ownerPhone: '966548887766',
      username: 'jasmine_owner',
      role: 'store_owner',
      status: 'active',
      passwordHash: null,
      passwordSalt: null,
      hasCredentials: false,
    },
  },
  {
    id: 'store-tulip-atelier',
    slug: 'tulip-atelier',
    nameAr: 'توليب روز ديزاين',
    nameEn: 'Tulip & Rose Couture Atelier',
    taglineAr: 'تنسيقات عصرية راقية وإهداءات خاصة على ساحل جدة',
    taglineEn: 'Contemporary coastal floral couture & premium gift boxes',
    phone: '966551234567',
    supportPhone: '966551234567',
    city: 'جدة',
    district: 'حي الروضة - طريق الكورنيش',
    address: 'طريق الأمير فيصل بن فهد، مجمع شاطئ الكورنيش',
    crNumber: '4030558219',
    vatNumber: '',
    workingHours: '09:30 AM - 11:45 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Tulip+Rose+Jeddah',
    instagramUrl: 'https://instagram.com',
    theme: 'velvet',
    heroStyle: 'minimal',
    specialsStyle: 'coverflow',
    defaultLang: 'ar',
    status: 'open',
    isPrimary: false,
    createdAt: '2026-02-14T09:30:00.000Z',
    ordersCount: 64,
    rating: '5.0',
    deliveryFee: 20,
    minOrderFreeDelivery: 280,
    prepMinutes: 30,
    account: {
      ownerName: 'فيصل الحربي',
      ownerEmail: 'faisal@tulipatelier.sa',
      ownerPhone: '966551234567',
      username: 'tulip_owner',
      role: 'store_owner',
      status: 'active',
      passwordHash: null,
      passwordSalt: null,
      hasCredentials: false,
    },
  },
];

function resolveStoreTheme(rawTheme) {
  const mapped = THEME_ALIAS_MAP[rawTheme] || rawTheme;
  return VALID_THEMES.includes(mapped) ? mapped : 'botanical';
}

function resolveHeroStyle(rawHero) {
  return VALID_HERO_STYLES.includes(rawHero) ? rawHero : 'qlub';
}

function resolveSpecialsStyle(rawStyle) {
  return VALID_SPECIALS_STYLES.includes(rawStyle) ? rawStyle : 'editorial_deck';
}

function migrateStoreRecord(store) {
  if (!store || typeof store !== 'object') return null;
  return {
    ...store,
    theme: resolveStoreTheme(store.theme),
    heroStyle: resolveHeroStyle(store.heroStyle),
    specialsStyle: resolveSpecialsStyle(store.specialsStyle),
    defaultLang: store.defaultLang === 'en' ? 'en' : 'ar',
    prepMinutes: Number(store.prepMinutes || 25),
    workingHours: store.workingHours || '09:00 AM - 11:30 PM',
    crNumber: store.crNumber || '',
    vatNumber: store.vatNumber || '',
    instagramUrl: store.instagramUrl || '',
    account: {
      ownerName: store.account?.ownerName || store.nameAr || 'Owner',
      ownerEmail: store.account?.ownerEmail || '',
      ownerPhone: store.account?.ownerPhone || store.phone || '',
      username: store.account?.username || `${store.slug || 'store'}_admin`.replace(/-/g, '_'),
      role: store.account?.role || 'store_owner',
      status: store.account?.status || 'active',
      passwordHash: store.account?.passwordHash || null,
      passwordSalt: store.account?.passwordSalt || null,
      hasCredentials: Boolean(store.account?.passwordHash && store.account?.passwordSalt),
    },
  };
}

/**
 * Normalizes any store name or slug into a clean RFC-safe ASCII URL slug (`[a-z0-9-]`).
 */
export function normalizeSlug(raw) {
  if (!raw) return '';
  const transliterated = raw
    .toString()
    .trim()
    .split('')
    .map((ch) => (AR_LATIN_MAP[ch] !== undefined ? AR_LATIN_MAP[ch] : ch))
    .join('');

  return transliterated
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes phone numbers to international digits format without symbols.
 */
export function normalizePhone(raw) {
  if (!raw) return '966500000000';
  const clean = raw.toString().replace(/[^0-9]/g, '');
  if (clean.startsWith('05') && clean.length === 10) {
    return `966${clean.slice(1)}`;
  }
  if (clean.startsWith('5') && clean.length === 9) {
    return `966${clean}`;
  }
  if (clean.startsWith('966')) {
    return clean;
  }
  return clean || '966500000000';
}

/**
 * Generates a scoped localStorage key per store ID for tenant isolation.
 */
export function getScopedStoreKey(baseKey, storeId) {
  if (!storeId) return baseKey;
  return `${baseKey}_${storeId}`;
}

/**
 * Retrieves all registered stores from localStorage with fail-safe migration & seed defaults.
 */
export function getAllStores() {
  if (typeof window === 'undefined') return DEFAULT_STORES;
  try {
    const raw = localStorage.getItem(STORES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(DEFAULT_STORES));
      return DEFAULT_STORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(migrateStoreRecord).filter(Boolean);
    }
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(DEFAULT_STORES));
    return DEFAULT_STORES;
  } catch (e) {
    console.warn('Failed to parse stores from localStorage, returning defaults', e);
    return DEFAULT_STORES;
  }
}

/**
 * Finds a store by slug or ID (case-insensitive).
 */
export function getStoreBySlugOrId(identifier) {
  if (!identifier) return null;
  const stores = getAllStores();
  const clean = identifier.toString().trim().toLowerCase();
  return (
    stores.find(
      (s) =>
        s.slug.toLowerCase() === clean ||
        s.id.toLowerCase() === clean ||
        normalizeSlug(s.nameEn).toLowerCase() === clean
    ) || null
  );
}

/**
 * Gets the primary / default store.
 */
export function getPrimaryStore() {
  const stores = getAllStores();
  return stores.find((s) => s.isPrimary) || stores[0] || DEFAULT_STORES[0];
}

/**
 * Strips sensitive account/password fields before exposing a store record publicly.
 */
export function getPublicStoreProjection(store) {
  if (!store) return null;
  return {
    id: store.id,
    slug: store.slug,
    nameAr: store.nameAr,
    nameEn: store.nameEn,
    taglineAr: store.taglineAr,
    taglineEn: store.taglineEn,
    phone: store.phone,
    supportPhone: store.supportPhone,
    city: store.city,
    district: store.district,
    address: store.address,
    crNumber: store.crNumber,
    vatNumber: store.vatNumber,
    workingHours: store.workingHours,
    googleMapsUrl: store.googleMapsUrl,
    instagramUrl: store.instagramUrl,
    theme: resolveStoreTheme(store.theme),
    heroStyle: resolveHeroStyle(store.heroStyle),
    specialsStyle: resolveSpecialsStyle(store.specialsStyle),
    defaultLang: store.defaultLang || 'ar',
    status: store.status,
    deliveryFee: Number(store.deliveryFee || 0),
    minOrderFreeDelivery: Number(store.minOrderFreeDelivery || 300),
    prepMinutes: Number(store.prepMinutes || 25),
    avatarUrl: store.avatarUrl || null,
    logoUrl: store.logoUrl || null,
  };
}

/**
 * Synchronous store upsert (preserved for backwards compatibility).
 */
export function saveStore(storeInput, lang = 'ar') {
  const stores = getAllStores();
  const isEditing = Boolean(storeInput.id && stores.some((s) => s.id === storeInput.id));
  const existingStore = isEditing ? stores.find((s) => s.id === storeInput.id) : null;

  const nameAr = stripHtml(storeInput.nameAr || '').trim();
  const nameEn = stripHtml(storeInput.nameEn || '').trim();
  const taglineAr = stripHtml(storeInput.taglineAr || '').trim();
  const taglineEn = stripHtml(storeInput.taglineEn || '').trim();
  const city = stripHtml(storeInput.city || (lang === 'en' ? 'Riyadh' : 'الرياض')).trim();
  const district = stripHtml(storeInput.district || '').trim();
  const address = stripHtml(storeInput.address || '').trim();
  const phone = normalizePhone(storeInput.phone);

  let baseSlug = normalizeSlug(storeInput.slug || storeInput.nameEn || storeInput.nameAr || 'store');
  if (!baseSlug) baseSlug = `store-${Date.now().toString(36)}`;

  let uniqueSlug = baseSlug;
  let counter = 1;
  while (
    stores.some(
      (s) =>
        s.slug.toLowerCase() === uniqueSlug.toLowerCase() &&
        (!isEditing || s.id !== storeInput.id)
    )
  ) {
    counter += 1;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  const id = isEditing
    ? storeInput.id
    : `store-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const safeGoogleMaps = storeInput.googleMapsUrl ? sanitizeUrl(storeInput.googleMapsUrl, '') : '';
  const safeInstagram = storeInput.instagramUrl ? sanitizeUrl(storeInput.instagramUrl, '') : '';
  const safeLogo =
    storeInput.logoUrl && storeInput.logoUrl.startsWith('data:image/')
      ? storeInput.logoUrl
      : storeInput.logoUrl
      ? sanitizeUrl(storeInput.logoUrl, '')
      : null;

  const storeRecord = migrateStoreRecord({
    id,
    slug: uniqueSlug,
    nameAr: nameAr || 'متجر أزهار جديد',
    nameEn: nameEn || 'Bespoke Floral Studio',
    taglineAr: taglineAr || 'أزهار طبيعية فاخرة لتخليد أجمل المناسبات',
    taglineEn: taglineEn || 'Luxury curated flowers and celebration gifts',
    phone,
    supportPhone: storeInput.supportPhone ? normalizePhone(storeInput.supportPhone) : phone,
    city: city || 'الرياض',
    district: district || 'حي النرجس',
    address,
    crNumber: stripHtml(storeInput.crNumber || '').trim(),
    vatNumber: stripHtml(storeInput.vatNumber || '').trim(),
    workingHours: stripHtml(storeInput.workingHours || '09:00 AM - 11:30 PM').trim(),
    googleMapsUrl: safeGoogleMaps,
    instagramUrl: safeInstagram,
    theme: resolveStoreTheme(storeInput.theme),
    heroStyle: resolveHeroStyle(storeInput.heroStyle),
    specialsStyle: resolveSpecialsStyle(storeInput.specialsStyle),
    defaultLang: storeInput.defaultLang === 'en' ? 'en' : 'ar',
    status: ['open', 'busy_60m', 'closed'].includes(storeInput.status) ? storeInput.status : 'open',
    isPrimary: Boolean(storeInput.isPrimary ?? existingStore?.isPrimary),
    createdAt: storeInput.createdAt || existingStore?.createdAt || new Date().toISOString(),
    ordersCount: Number(storeInput.ordersCount ?? existingStore?.ordersCount ?? 0),
    rating: storeInput.rating || existingStore?.rating || '5.0',
    deliveryFee: Number(storeInput.deliveryFee ?? 0),
    minOrderFreeDelivery: Number(storeInput.minOrderFreeDelivery ?? 300),
    prepMinutes: Number(storeInput.prepMinutes ?? 25),
    avatarUrl: safeLogo || storeInput.avatarUrl || null,
    logoUrl: safeLogo || null,
    account: storeInput.account || existingStore?.account,
  });

  const updatedList = isEditing
    ? stores.map((s) => (s.id === id ? storeRecord : s))
    : [storeRecord, ...stores];

  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to save store to localStorage', e);
  }

  return { success: true, store: storeRecord, allStores: updatedList };
}

/**
 * Hardened async Store & Owner Account Provisioning:
 * - Verifies CSRF double-submit token
 * - Validates full business & merchant payloads with Zod
 * - Enforces username uniqueness
 * - Hashes owner password with PBKDF2-SHA256 (100k iterations + random 16-byte CSPRNG salt)
 * - Logs security audit trail event
 */
export async function provisionStoreWithAccount(
  storeInput,
  { passwordPlain = '', lang = 'ar', csrfToken = null, expectedCsrfToken = null, actor = 'super_admin' } = {}
) {
  const isAr = lang === 'ar';

  if (expectedCsrfToken && !validateCsrfToken(csrfToken, expectedCsrfToken)) {
    appendAuditLog({
      action: 'csrf_validation_failed',
      actor,
      severity: 'critical',
      details: 'Blocked store provisioning mutation with invalid CSRF token.',
    });
    return {
      success: false,
      error: isAr ? 'فشل التحقق الأمني (CSRF). فضلاً أعد المحاولة.' : 'Security validation (CSRF) failed. Please retry.',
    };
  }

  const stores = getAllStores();
  const isEditing = Boolean(storeInput.id && stores.some((s) => s.id === storeInput.id));
  const existingStore = isEditing ? stores.find((s) => s.id === storeInput.id) : null;

  const cleanPhone = normalizePhone(storeInput.phone);
  const cleanSupportPhone = storeInput.supportPhone ? normalizePhone(storeInput.supportPhone) : '';
  const cleanOwnerPhone = storeInput.ownerPhone ? normalizePhone(storeInput.ownerPhone) : cleanPhone;
  const candidateSlug = normalizeSlug(storeInput.slug || storeInput.nameEn || storeInput.nameAr);

  const builderValidation = StoreBuilderSchema.safeParse({
    nameAr: storeInput.nameAr || '',
    nameEn: storeInput.nameEn || storeInput.nameAr || '',
    slug: candidateSlug,
    phone: cleanPhone,
    supportPhone: cleanSupportPhone,
    city: storeInput.city || '',
    district: storeInput.district || '',
    address: storeInput.address || '',
    taglineAr: storeInput.taglineAr || '',
    taglineEn: storeInput.taglineEn || '',
    crNumber: storeInput.crNumber || '',
    vatNumber: storeInput.vatNumber || '',
    workingHours: storeInput.workingHours || '',
    deliveryFee: Number(storeInput.deliveryFee ?? 0),
    minOrderFreeDelivery: Number(storeInput.minOrderFreeDelivery ?? 300),
    prepMinutes: Number(storeInput.prepMinutes ?? 25),
    theme: resolveStoreTheme(storeInput.theme),
    heroStyle: resolveHeroStyle(storeInput.heroStyle),
    specialsStyle: resolveSpecialsStyle(storeInput.specialsStyle),
    defaultLang: storeInput.defaultLang === 'en' ? 'en' : 'ar',
    status: storeInput.status || 'open',
    googleMapsUrl: storeInput.googleMapsUrl || '',
    instagramUrl: storeInput.instagramUrl || '',
    logoUrl: storeInput.logoUrl || '',
  });

  if (!builderValidation.success) {
    return {
      success: false,
      error: builderValidation.error.issues[0]?.message || (isAr ? 'بيانات المتجر غير صالحة' : 'Invalid store details'),
    };
  }

  const accountValidation = StoreAccountSchema.safeParse({
    ownerName: storeInput.ownerName || '',
    ownerEmail: storeInput.ownerEmail || '',
    ownerPhone: cleanOwnerPhone,
    username: (storeInput.username || '').trim().toLowerCase(),
    role: storeInput.role || 'store_owner',
    accountStatus: storeInput.accountStatus || 'active',
  });

  if (!accountValidation.success) {
    return {
      success: false,
      error: accountValidation.error.issues[0]?.message || (isAr ? 'بيانات حساب صاحب المحل غير صالحة' : 'Invalid owner account details'),
    };
  }

  // Enforce unique merchant login username across all stores
  const normalizedUsername = accountValidation.data.username.toLowerCase();
  const duplicateUser = stores.find(
    (s) =>
      s.account?.username?.toLowerCase() === normalizedUsername &&
      (!isEditing || s.id !== storeInput.id)
  );
  if (duplicateUser) {
    return {
      success: false,
      error: isAr
        ? `اسم المستخدم "${normalizedUsername}" مستخدم مسبقاً لمتجر آخر.`
        : `Username "${normalizedUsername}" is already assigned to another store.`,
    };
  }

  // Require strong password on new account creation (or validate if rotating on edit)
  const needsPasswordHash = !isEditing || Boolean(passwordPlain && passwordPlain.length > 0);
  let passwordHash = existingStore?.account?.passwordHash || null;
  let passwordSalt = existingStore?.account?.passwordSalt || null;

  if (needsPasswordHash) {
    const pwdCheck = StrongPasswordSchema.safeParse(passwordPlain);
    if (!pwdCheck.success) {
      return {
        success: false,
        error: pwdCheck.error.issues[0]?.message || (isAr ? 'كلمة المرور ضعيفة' : 'Weak password'),
      };
    }
    const hashed = await hashPassword(passwordPlain);
    passwordHash = hashed.hash;
    passwordSalt = hashed.salt;
  }

  const data = builderValidation.data;
  const acct = accountValidation.data;

  const saved = saveStore(
    {
      ...existingStore,
      ...data,
      id: existingStore?.id,
      isPrimary: existingStore ? existingStore.isPrimary : false,
      account: {
        ownerName: acct.ownerName,
        ownerEmail: acct.ownerEmail,
        ownerPhone: acct.ownerPhone || cleanPhone,
        username: normalizedUsername,
        role: acct.role,
        status: acct.accountStatus,
        passwordHash,
        passwordSalt,
        hasCredentials: Boolean(passwordHash && passwordSalt),
        updatedAt: new Date().toISOString(),
      },
    },
    lang
  );

  if (saved.success) {
    appendAuditLog({
      action: isEditing ? 'store_account_updated' : 'store_account_created',
      actor,
      targetId: saved.store.id,
      targetLabel: `${saved.store.nameEn} (${saved.store.slug})`,
      severity: 'info',
      details: isEditing
        ? `Updated store profile & merchant account (@${normalizedUsername})${passwordPlain ? ' with password rotation' : ''}.`
        : `Provisioned new store website & PBKDF2-protected owner account (@${normalizedUsername}).`,
    });
  }

  return saved;
}

/**
 * Verifies a store owner's login credentials against their store's PBKDF2 hash.
 */
export async function verifyStoreOwnerLogin(username, password, targetStoreId = null) {
  if (!username || !password) return { valid: false, reason: 'missing_fields' };
  const cleanUser = username.trim().toLowerCase();
  const stores = getAllStores();

  const candidateStore = stores.find((s) => {
    const matchesUser = s.account?.username?.toLowerCase() === cleanUser;
    if (!matchesUser) return false;
    if (targetStoreId && s.id !== targetStoreId) return false;
    return true;
  });

  if (!candidateStore || !candidateStore.account?.passwordHash || !candidateStore.account?.passwordSalt) {
    return { valid: false, reason: 'invalid_credentials' };
  }

  if (candidateStore.account.status !== 'active') {
    return {
      valid: false,
      reason: candidateStore.account.status === 'suspended' ? 'account_suspended' : 'account_pending',
      store: candidateStore,
    };
  }

  const matched = await verifyPassword(
    password,
    candidateStore.account.passwordHash,
    candidateStore.account.passwordSalt
  );

  if (!matched) {
    return { valid: false, reason: 'invalid_credentials', store: candidateStore };
  }

  return { valid: true, store: candidateStore };
}

/**
 * Toggles a store owner account status ('active' | 'suspended' | 'pending').
 */
export function toggleStoreAccountStatus(storeId, nextStatus, { lang = 'ar', actor = 'super_admin' } = {}) {
  const isAr = lang === 'ar';
  const stores = getAllStores();
  const target = stores.find((s) => s.id === storeId);
  if (!target) {
    return { success: false, error: isAr ? 'المتجر غير موجود' : 'Store not found' };
  }
  if (target.isPrimary && nextStatus === 'suspended') {
    return {
      success: false,
      error: isAr ? 'لا يمكن إيقاف المتجر الرئيسي للمنصة' : 'Cannot suspend the primary platform store',
    };
  }

  const updated = stores.map((s) =>
    s.id === storeId
      ? {
          ...s,
          account: {
            ...s.account,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          },
        }
      : s
  );

  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update store account status', e);
  }

  appendAuditLog({
    action: nextStatus === 'suspended' ? 'store_account_suspended' : 'store_account_activated',
    actor,
    targetId: target.id,
    targetLabel: `${target.nameEn} (${target.slug})`,
    severity: nextStatus === 'suspended' ? 'warning' : 'info',
    details: `Account status changed to "${nextStatus}" for @${target.account?.username || 'owner'}.`,
  });

  return { success: true, allStores: updated };
}

/**
 * Rotates a store owner's password with PBKDF2-SHA256.
 */
export async function rotateStorePassword(storeId, newPassword, { lang = 'ar', actor = 'super_admin' } = {}) {
  const isAr = lang === 'ar';
  const pwdCheck = StrongPasswordSchema.safeParse(newPassword);
  if (!pwdCheck.success) {
    return {
      success: false,
      error: pwdCheck.error.issues[0]?.message || (isAr ? 'كلمة المرور ضعيفة' : 'Weak password'),
    };
  }

  const stores = getAllStores();
  const target = stores.find((s) => s.id === storeId);
  if (!target) {
    return { success: false, error: isAr ? 'المتجر غير موجود' : 'Store not found' };
  }

  const { hash, salt } = await hashPassword(newPassword);
  const updated = stores.map((s) =>
    s.id === storeId
      ? {
          ...s,
          account: {
            ...s.account,
            passwordHash: hash,
            passwordSalt: salt,
            hasCredentials: true,
            updatedAt: new Date().toISOString(),
          },
        }
      : s
  );

  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to rotate store password', e);
  }

  appendAuditLog({
    action: 'store_password_rotated',
    actor,
    targetId: target.id,
    targetLabel: `${target.nameEn} (${target.slug})`,
    severity: 'warning',
    details: `Rotated PBKDF2-SHA256 credentials for @${target.account?.username || 'owner'}.`,
  });

  return { success: true, allStores: updated };
}

/**
 * Deletes a store (prevents deleting the primary store).
 */
export function deleteStore(storeId, lang = 'ar', actor = 'super_admin') {
  const isAr = lang === 'ar';
  const stores = getAllStores();
  const target = stores.find((s) => s.id === storeId);
  if (!target) {
    return { success: false, error: isAr ? 'المتجر غير موجود' : 'Store not found' };
  }
  if (target.isPrimary) {
    return {
      success: false,
      error: isAr ? 'لا يمكن حذف المتجر الرئيسي للمشروع' : 'Cannot delete the primary platform store',
    };
  }
  if (stores.length <= 1) {
    return {
      success: false,
      error: isAr ? 'يجب أن يبقى متجر واحد على الأقل في المشروع' : 'At least one store must remain',
    };
  }

  const updatedList = stores.filter((s) => s.id !== storeId);
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to delete store from localStorage', e);
  }

  appendAuditLog({
    action: 'store_deleted',
    actor,
    targetId: target.id,
    targetLabel: `${target.nameEn} (${target.slug})`,
    severity: 'critical',
    details: `Deleted store "${target.slug}" and revoked merchant access.`,
  });

  return { success: true, allStores: updatedList };
}

/**
 * Generates Google Maps Ready Link for a store.
 */
export function getStoreGoogleMapsUrl(slug, options = {}) {
  const origin =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://abod6911.github.io/FlowerHub/';

  const cleanOrigin = origin.endsWith('/') ? origin : `${origin}/`;
  const utmSource = options.utmSource || 'google_maps';
  const utmMedium = options.utmMedium || 'gmb_profile';
  const utmCampaign = options.utmCampaign || 'order_online';

  return `${cleanOrigin}?store=${encodeURIComponent(slug)}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
}

/**
 * Generates a clean direct link for sharing.
 */
export function getStoreDirectShareUrl(slug) {
  const origin =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://abod6911.github.io/FlowerHub/';

  const cleanOrigin = origin.endsWith('/') ? origin : `${origin}/`;
  return `${cleanOrigin}?store=${encodeURIComponent(slug)}`;
}

/**
 * Generates a self-contained portable share link containing ONLY sanitized public storefront config
 * (zero passwords, salts, or private owner info) so newly created stores open on any device!
 */
export function getStorePortableShareUrl(store) {
  if (!store) return getStoreDirectShareUrl('');
  const base = getStoreDirectShareUrl(store.slug);
  try {
    const publicCfg = {
      id: store.id,
      slug: store.slug,
      na: store.nameAr,
      ne: store.nameEn,
      ta: store.taglineAr,
      te: store.taglineEn,
      ph: store.phone,
      ct: store.city,
      ds: store.district,
      ad: store.address,
      cr: store.crNumber || '',
      vt: store.vatNumber || '',
      wh: store.workingHours || '',
      gm: store.googleMapsUrl || '',
      ig: store.instagramUrl || '',
      th: resolveStoreTheme(store.theme),
      hs: resolveHeroStyle(store.heroStyle),
      ss: resolveSpecialsStyle(store.specialsStyle),
      dl: store.defaultLang === 'en' ? 'en' : 'ar',
      st: store.status || 'open',
      df: Number(store.deliveryFee || 0),
      mf: Number(store.minOrderFreeDelivery || 300),
      pm: Number(store.prepMinutes || 25),
    };
    const json = JSON.stringify(publicCfg);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    return `${base}&s=${encodeURIComponent(b64)}`;
  } catch {
    return base;
  }
}

/**
 * Generates a private Owner Admin Portal Invite URL (`#admin&invite=...`).
 * Puts ONLY non-plaintext PBKDF2 hash/salt verifier inside URL hash fragment (never sent to HTTP logs).
 */
export function getStoreOwnerAdminInviteUrl(store) {
  const storefrontUrl = getStorePortableShareUrl(store);
  if (!store?.account?.passwordHash || !store?.account?.passwordSalt) {
    return `${storefrontUrl}#admin`;
  }
  try {
    const invitePayload = {
      sid: store.id,
      u: store.account.username,
      h: store.account.passwordHash,
      s: store.account.passwordSalt,
      n: store.account.ownerName || '',
      e: store.account.ownerEmail || '',
      st: store.account.status || 'active',
    };
    const bytes = new TextEncoder().encode(JSON.stringify(invitePayload));
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    return `${storefrontUrl}#admin&invite=${encodeURIComponent(b64)}`;
  } catch {
    return `${storefrontUrl}#admin`;
  }
}

/**
 * Safely decodes & sanitizes a portable storefront snapshot from URL params (?s=...).
 * Never trusts unvalidated input.
 */
export function decodePortableStoreFromUrl(searchString = '') {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(searchString || window.location.search || '');
    const raw = params.get('s') || params.get('store_data');
    if (!raw || raw.length > 4096) return null;

    const binary = atob(raw);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const slug = normalizeSlug(parsed.slug || params.get('store') || 'store');
    return migrateStoreRecord({
      id: sanitizeText(String(parsed.id || `store-${slug}`)).slice(0, 64),
      slug,
      nameAr: stripHtml(String(parsed.na || '')).slice(0, 80),
      nameEn: stripHtml(String(parsed.ne || '')).slice(0, 80),
      taglineAr: stripHtml(String(parsed.ta || '')).slice(0, 160),
      taglineEn: stripHtml(String(parsed.te || '')).slice(0, 160),
      phone: normalizePhone(parsed.ph),
      city: stripHtml(String(parsed.ct || 'الرياض')).slice(0, 50),
      district: stripHtml(String(parsed.ds || '')).slice(0, 80),
      address: stripHtml(String(parsed.ad || '')).slice(0, 160),
      crNumber: stripHtml(String(parsed.cr || '')).slice(0, 20),
      vatNumber: stripHtml(String(parsed.vt || '')).slice(0, 20),
      workingHours: stripHtml(String(parsed.wh || '')).slice(0, 80),
      googleMapsUrl: parsed.gm ? sanitizeUrl(String(parsed.gm), '') : '',
      instagramUrl: parsed.ig ? sanitizeUrl(String(parsed.ig), '') : '',
      theme: resolveStoreTheme(parsed.th),
      heroStyle: resolveHeroStyle(parsed.hs),
      specialsStyle: resolveSpecialsStyle(parsed.ss),
      defaultLang: parsed.dl === 'en' ? 'en' : 'ar',
      status: ['open', 'busy_60m', 'closed'].includes(parsed.st) ? parsed.st : 'open',
      deliveryFee: Math.max(0, Math.min(500, Number(parsed.df || 0))),
      minOrderFreeDelivery: Math.max(0, Math.min(10000, Number(parsed.mf || 300))),
      prepMinutes: Math.max(5, Math.min(360, Number(parsed.pm || 25))),
    });
  } catch {
    return null;
  }
}

/**
 * Decodes portable store snapshot (?s=...) + optional Owner Admin invite (#admin&invite=...)
 * and upserts the store (with hashed verifier if invited) into localStorage on any device.
 */
export function decodeAndImportPortableInviteFromUrl(searchString = '', hashString = '') {
  if (typeof window === 'undefined') return null;
  const portableStore = decodePortableStoreFromUrl(searchString);
  const rawHash = hashString || window.location.hash || '';
  const inviteMatch = rawHash.match(/invite=([^&]+)/);

  let hydrated = portableStore;

  if (inviteMatch && inviteMatch[1]) {
    try {
      const binary = atob(decodeURIComponent(inviteMatch[1]));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const inv = JSON.parse(new TextDecoder().decode(bytes));
      const validHash = typeof inv?.h === 'string' && /^[a-f0-9]{64}$/i.test(inv.h);
      const validSalt = typeof inv?.s === 'string' && /^[a-f0-9]{32}$/i.test(inv.s);
      const validUser = typeof inv?.u === 'string' && /^[a-zA-Z0-9_.-]{3,32}$/.test(inv.u);

      if (validHash && validSalt && validUser) {
        const baseStore =
          hydrated ||
          getStoreBySlugOrId(new URLSearchParams(searchString || window.location.search).get('store'));
        if (baseStore) {
          hydrated = migrateStoreRecord({
            ...baseStore,
            id: inv.sid ? sanitizeText(String(inv.sid)).slice(0, 64) : baseStore.id,
            account: {
              ...baseStore.account,
              ownerName: stripHtml(String(inv.n || baseStore.nameAr || 'Owner')).slice(0, 80),
              ownerEmail: stripHtml(String(inv.e || '')).slice(0, 120),
              username: inv.u.toLowerCase(),
              role: 'store_owner',
              status: ['active', 'suspended', 'pending'].includes(inv.st) ? inv.st : 'active',
              passwordHash: inv.h,
              passwordSalt: inv.s,
              hasCredentials: true,
            },
          });
        }
      }
    } catch {
      // ignore malformed invite fragment
    }
  }

  if (hydrated) {
    try {
      const existing = getAllStores();
      const idx = existing.findIndex(
        (s) => s.slug.toLowerCase() === hydrated.slug.toLowerCase() || s.id === hydrated.id
      );
      const nextList = [...existing];
      if (idx >= 0) {
        const prev = existing[idx];
        const keepCreds = prev.account?.hasCredentials && !hydrated.account?.hasCredentials;
        nextList[idx] = {
          ...prev,
          ...hydrated,
          isPrimary: prev.isPrimary,
          account: keepCreds ? prev.account : hydrated.account,
        };
      } else {
        nextList.push(hydrated);
      }
      localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(nextList));
    } catch {
      // ignore storage errors
    }
  }

  return hydrated;
}

/**
 * Syncs store owner edits made in FloristAdminPanel back into stores registry
 * and returns a fresh portable storefront share URL.
 */
export function syncStoreCustomizationBySlug(slugOrId, shopConfig) {
  if (!slugOrId || !shopConfig) return null;
  const stores = getAllStores();
  const clean = slugOrId.toString().trim().toLowerCase();
  const idx = stores.findIndex(
    (s) => s.slug.toLowerCase() === clean || s.id.toLowerCase() === clean
  );
  if (idx < 0) return null;

  const target = stores[idx];
  const updated = migrateStoreRecord({
    ...target,
    nameAr: shopConfig.shopNameAr || target.nameAr,
    nameEn: shopConfig.shopNameEn || target.nameEn,
    taglineAr: shopConfig.taglineAr ?? target.taglineAr,
    taglineEn: shopConfig.taglineEn ?? target.taglineEn,
    phone: shopConfig.phone ? normalizePhone(shopConfig.phone) : target.phone,
    theme: resolveStoreTheme(shopConfig.theme || target.theme),
    heroStyle: resolveHeroStyle(shopConfig.heroStyle || target.heroStyle),
    specialsStyle: resolveSpecialsStyle(shopConfig.specialsStyle || target.specialsStyle),
    status:
      shopConfig.status === 'closed'
        ? 'closed'
        : shopConfig.status === 'busy_60m'
        ? 'busy_60m'
        : 'open',
    deliveryFee: shopConfig.deliveryFee ?? target.deliveryFee,
    minOrderFreeDelivery: shopConfig.minOrderFreeDelivery ?? target.minOrderFreeDelivery,
    workingHours: shopConfig.workingHours ?? target.workingHours,
    crNumber: shopConfig.crNumber ?? target.crNumber,
    vatNumber: shopConfig.vatNumber ?? target.vatNumber,
    googleMapsUrl: shopConfig.googleMapsUrl ?? target.googleMapsUrl,
    instagramUrl: shopConfig.instagramUrl ?? target.instagramUrl,
    avatarUrl: shopConfig.avatarUrl ?? target.avatarUrl,
    logoUrl: shopConfig.logoUrl ?? target.logoUrl,
  });

  const nextStores = [...stores];
  nextStores[idx] = updated;
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(nextStores));
  } catch {
    // ignore storage errors
  }

  return {
    store: updated,
    portableUrl: getStorePortableShareUrl(updated),
  };
}

/**
 * Converts a Store Branch object into a shopConfig format expected by App.jsx.
 */
export function mapStoreToShopConfig(store) {
  if (!store) return null;
  const resolvedTheme = resolveStoreTheme(store.theme);
  return {
    id: store.id,
    slug: store.slug,
    shopNameAr: store.nameAr,
    shopNameEn: store.nameEn,
    taglineAr: store.taglineAr,
    taglineEn: store.taglineEn,
    locationLabel: `${store.city}${store.district ? ` • ${store.district}` : ''}`,
    phone: normalizePhone(store.phone),
    supportPhone: store.supportPhone ? normalizePhone(store.supportPhone) : normalizePhone(store.phone),
    status:
      store.status === 'closed'
        ? 'closed'
        : store.status === 'busy_60m'
        ? 'busy_60m'
        : 'open_20m',
    specialsStyle: resolveSpecialsStyle(store.specialsStyle),
    theme: resolvedTheme,
    heroStyle: resolveHeroStyle(store.heroStyle),
    defaultLang: store.defaultLang === 'en' ? 'en' : 'ar',
    showStories: true,
    showSpecials: true,
    showCustomBanner: true,
    avatarUrl: store.avatarUrl || null,
    logoUrl: store.logoUrl || null,
    isGoogleMapsBranch: true,
    deliveryFee: Number(store.deliveryFee ?? 0),
    minOrderFreeDelivery: Number(store.minOrderFreeDelivery ?? 300),
    prepMinutes: Number(store.prepMinutes ?? 25),
    fullAddress: store.address || '',
    crNumber: store.crNumber || '',
    vatNumber: store.vatNumber || '',
    workingHours: store.workingHours || '',
    googleMapsUrl: store.googleMapsUrl ? sanitizeUrl(store.googleMapsUrl, '') : '',
    instagramUrl: store.instagramUrl ? sanitizeUrl(store.instagramUrl, '') : '',
    accountStatus: store.account?.status || 'active',
  };
}
