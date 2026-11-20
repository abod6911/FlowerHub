/**
 * Multi-Store Platform & Google Maps Hub Manager
 * Handles multi-tenant stores registry, URL generation for Google Maps,
 * branch switching, and persistent storage with fail-safe seed defaults.
 */

import { sanitizeText } from './sanitizer.js';

export const STORES_STORAGE_KEY = 'flowerhub_stores_network';
export const ACTIVE_STORE_KEY = 'flowerhub_active_store_id';

// Default Luxury Store Branches across Saudi Arabia
export const DEFAULT_STORES = [
  {
    id: 'store-dar-alward',
    slug: 'dar-alward',
    nameAr: 'دار الورد للمناسبات',
    nameEn: 'Maison des Fleurs Atelier',
    taglineAr: 'أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب وريادة',
    taglineEn: 'Luxury artisanal blooms & bespoke floral arrangements',
    phone: '966500000000',
    city: 'الرياض',
    district: 'حي النرجس - شمال الرياض',
    address: 'طريق عثمان بن عفان، مجمع النرجس التجاري',
    googleMapsUrl: 'https://maps.google.com/?q=Dar+Alward+Riyadh',
    theme: 'botanical',
    heroStyle: 'qlub',
    specialsStyle: 'editorial_deck',
    status: 'open',
    isPrimary: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    ordersCount: 142,
    rating: '4.9',
    deliveryFee: 0,
    minOrderFreeDelivery: 300,
  },
  {
    id: 'store-jasmine-boutique',
    slug: 'jasmine-boutique',
    nameAr: 'بوتيك الياسمين الملكي',
    nameEn: 'Royal Jasmine Floral Studio',
    taglineAr: 'باقات ملوكية وتنسيقات زهور موسمية مستوردة من هولندا',
    taglineEn: 'Royal Dutch bouquets & signature velvet floral arrangements',
    phone: '966548887766',
    city: 'الرياض',
    district: 'شارع التخصصي - حي المحمدية',
    address: 'شارع التخصصي، تقاطع طريق العروبة، برج الياسمين',
    googleMapsUrl: 'https://maps.google.com/?q=Royal+Jasmine+Riyadh',
    theme: 'royalNoir',
    heroStyle: 'cinematic',
    specialsStyle: 'luxury_carousel',
    status: 'open',
    isPrimary: false,
    createdAt: '2026-02-01T12:00:00.000Z',
    ordersCount: 89,
    rating: '4.8',
    deliveryFee: 25,
    minOrderFreeDelivery: 350,
  },
  {
    id: 'store-tulip-atelier',
    slug: 'tulip-atelier',
    nameAr: 'توليب روز ديزاين',
    nameEn: 'Tulip & Rose Couture Atelier',
    taglineAr: 'تنسيقات عصرية راقية وإهداءات خاصة على ساحل جدة',
    taglineEn: 'Contemporary coastal floral couture & premium gift boxes',
    phone: '966551234567',
    city: 'جدة',
    district: 'حي الروضة - طريق الكورنيش',
    address: 'طريق الأمير فيصل بن فهد، مجمع شاطئ الكورنيش',
    googleMapsUrl: 'https://maps.google.com/?q=Tulip+Rose+Jeddah',
    theme: 'roseGold',
    heroStyle: 'cards',
    specialsStyle: 'magazine_strip',
    status: 'open',
    isPrimary: false,
    createdAt: '2026-02-14T09:30:00.000Z',
    ordersCount: 64,
    rating: '5.0',
    deliveryFee: 20,
    minOrderFreeDelivery: 280,
  },
];

/**
 * Normalizes a slug to be URL-safe (lowercase, letters, numbers, hyphens only)
 */
export function normalizeSlug(raw) {
  if (!raw) return '';
  return raw
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes phone numbers to Saudi international format without symbols
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
 * Retrieves all registered stores from localStorage with fail-safe seed defaults
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
      return parsed;
    }
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(DEFAULT_STORES));
    return DEFAULT_STORES;
  } catch (e) {
    console.warn('Failed to parse stores from localStorage, returning defaults', e);
    return DEFAULT_STORES;
  }
}

/**
 * Finds a store by slug or ID (case-insensitive)
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
 * Gets the primary / default store
 */
export function getPrimaryStore() {
  const stores = getAllStores();
  return stores.find((s) => s.isPrimary) || stores[0] || DEFAULT_STORES[0];
}

/**
 * Creates or updates a store in the network
 */
export function saveStore(storeInput) {
  const stores = getAllStores();
  const isEditing = Boolean(storeInput.id && stores.some((s) => s.id === storeInput.id));

  // Sanitize texts
  const nameAr = sanitizeText(storeInput.nameAr || '').trim();
  const nameEn = sanitizeText(storeInput.nameEn || '').trim();
  const taglineAr = sanitizeText(storeInput.taglineAr || '').trim();
  const taglineEn = sanitizeText(storeInput.taglineEn || '').trim();
  const city = sanitizeText(storeInput.city || 'الرياض').trim();
  const district = sanitizeText(storeInput.district || '').trim();
  const address = sanitizeText(storeInput.address || '').trim();
  const phone = normalizePhone(storeInput.phone);

  // Generate unique slug
  let baseSlug = normalizeSlug(storeInput.slug || storeInput.nameEn || storeInput.nameAr || 'store');
  if (!baseSlug) baseSlug = `store-${Date.now().toString(36)}`;

  // Ensure slug uniqueness among other stores
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

  const storeRecord = {
    id,
    slug: uniqueSlug,
    nameAr: nameAr || 'متجر أزهار جديد',
    nameEn: nameEn || 'Bespoke Floral Studio',
    taglineAr: taglineAr || 'أزهار طبيعية فاخرة لتخليد أجمل المناسبات',
    taglineEn: taglineEn || 'Luxury curated flowers and celebration gifts',
    phone,
    city: city || 'الرياض',
    district: district || 'حي النرجس',
    address: address || '',
    googleMapsUrl: storeInput.googleMapsUrl ? sanitizeText(storeInput.googleMapsUrl) : '',
    theme: storeInput.theme || 'botanical',
    heroStyle: storeInput.heroStyle || 'qlub',
    specialsStyle: storeInput.specialsStyle || 'editorial_deck',
    status: storeInput.status || 'open',
    isPrimary: Boolean(storeInput.isPrimary),
    createdAt: storeInput.createdAt || new Date().toISOString(),
    ordersCount: Number(storeInput.ordersCount || 0),
    rating: storeInput.rating || '5.0',
    deliveryFee: Number(storeInput.deliveryFee || 0),
    minOrderFreeDelivery: Number(storeInput.minOrderFreeDelivery || 300),
    avatarUrl: storeInput.avatarUrl || null,
    logoUrl: storeInput.logoUrl || null,
  };

  let updatedList;
  if (isEditing) {
    updatedList = stores.map((s) => (s.id === id ? storeRecord : s));
  } else {
    updatedList = [storeRecord, ...stores];
  }

  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to save store to localStorage', e);
  }

  return { success: true, store: storeRecord, allStores: updatedList };
}

/**
 * Deletes a store (prevents deleting the primary store)
 */
export function deleteStore(storeId) {
  const stores = getAllStores();
  const target = stores.find((s) => s.id === storeId);
  if (!target) {
    return { success: false, error: 'المتجر غير موجود' };
  }
  if (target.isPrimary) {
    return { success: false, error: 'لا يمكن حذف المتجر الرئيسي للمشروع' };
  }
  if (stores.length <= 1) {
    return { success: false, error: 'يجب أن يبقى متجر واحد على الأقل في المشروع' };
  }

  const updatedList = stores.filter((s) => s.id !== storeId);
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to delete store from localStorage', e);
  }

  return { success: true, allStores: updatedList };
}

/**
 * Generates Google Maps Ready Link for a store
 * Compatible with Google Business Profile Order Online Links
 */
export function getStoreGoogleMapsUrl(slug, options = {}) {
  const origin = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://abod6911.github.io/FlowerHub/';

  const cleanOrigin = origin.endsWith('/') ? origin : `${origin}/`;
  const utmSource = options.utmSource || 'google_maps';
  const utmMedium = options.utmMedium || 'gmb_profile';
  const utmCampaign = options.utmCampaign || 'order_online';

  return `${cleanOrigin}?store=${encodeURIComponent(slug)}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
}

/**
 * Generates a clean direct link for sharing on WhatsApp or social media
 */
export function getStoreDirectShareUrl(slug) {
  const origin = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://abod6911.github.io/FlowerHub/';

  const cleanOrigin = origin.endsWith('/') ? origin : `${origin}/`;
  return `${cleanOrigin}?store=${encodeURIComponent(slug)}`;
}

/**
 * Converts a Store Branch object into a shopConfig format expected by App.jsx
 */
export function mapStoreToShopConfig(store) {
  if (!store) return null;
  return {
    id: store.id,
    slug: store.slug,
    shopNameAr: store.nameAr,
    shopNameEn: store.nameEn,
    taglineAr: store.taglineAr,
    taglineEn: store.taglineEn,
    locationLabel: `${store.city} • ${store.district}`,
    phone: normalizePhone(store.phone),
    status: store.status === 'open' ? 'open_20m' : 'closed',
    specialsStyle: store.specialsStyle || 'editorial_deck',
    theme: store.theme || 'botanical',
    heroStyle: store.heroStyle || 'qlub',
    showStories: true,
    showSpecials: true,
    showCustomBanner: true,
    avatarUrl: store.avatarUrl || null,
    logoUrl: store.logoUrl || null,
    isGoogleMapsBranch: true,
    deliveryFee: store.deliveryFee,
    minOrderFreeDelivery: store.minOrderFreeDelivery,
    fullAddress: store.address,
    googleMapsUrl: store.googleMapsUrl,
  };
}
