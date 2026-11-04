import React from 'react';
import { MapPin, Phone, Star, MessageCircle, Heart, Search } from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';
import { useStoreTheme } from '../context/StoreThemeContext';
import { BreathingText } from './fancy/breathing-text';
import { FloatingHeroPetals } from './AmbientRosePetals';

// Clean stroke Instagram Icon
function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function ShopHeader({
  _heroStyle = 'qlub',
  lang = 'ar',
  shopConfig,
  _themeTokens = THEME_TOKENS.botanical,
  _botanicalBrandConfig,
  searchQuery = '',
  onSearchChange,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  let storeThemeCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeThemeCtx = useStoreTheme();
  } catch {
    // fallback
  }

  const rawStudio = storeThemeCtx?.rawConfig || storeThemeCtx?.config;
  const brand = storeThemeCtx?.config?.brand;

  const shopName =
    rawStudio?.storeName ||
    brand?.storeName ||
    brand?.name ||
    (isAr
      ? shopConfig?.shopNameAr || 'دار الورد للمناسبات'
      : shopConfig?.shopNameEn || 'Dar Alward Florist');

  const shopTagline =
    rawStudio?.storeSubtitle ||
    brand?.subtitle ||
    (isAr
      ? shopConfig?.taglineAr || 'أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب'
      : shopConfig?.taglineEn || strings.shopTagline);

  const statusText = rawStudio?.statusText || brand?.statusText || (isAr ? 'مفتوح الآن • تجهيز فوري' : 'Open Now');
  const avatarText = rawStudio?.avatarText || brand?.avatarText || 'د.و';
  const avatarUrl = brand?.avatarUrl;
  const locationLabel = rawStudio?.locationLabel || brand?.locationLabel || (isAr ? 'الرياض • التوصيل لكافة الأحياء' : strings.location);
  const locationUrl = brand?.locationUrl || 'https://maps.google.com';
  const instagramUrl = brand?.instagramUrl || 'https://instagram.com';
  const phone = rawStudio?.phone || brand?.phone || shopConfig?.phone || '966500000000';
  const callLabel = brand?.callLabel || strings.callUs;

  return (
    <header className="px-4 pt-4 pb-2 w-full transition-colors duration-300 relative select-none">
      {/* Floating Header Card Container with overflow-visible to prevent botanical clipping */}
      <div
        className="relative p-4 sm:p-5 shadow-xs flex flex-col gap-3 transition-all duration-300 overflow-visible"
        style={{
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          borderRadius: 'var(--radius-unit, 20px)',
          border: '1px solid var(--border-subtle, #E7E5E4)',
          boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Subtle, non-intrusive floating petals in the header background */}
        <FloatingHeroPetals />

        {/* 1. TOP ROW: Avatar Right | Status Badge Center | Rating Left */}
        <div className="flex items-center justify-between w-full relative z-10">
          {/* Right: Store Monogram Icon (د.و) */}
          <div className="flex items-center">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-serif text-base font-bold text-white shadow-xs ring-1 ring-emerald-950/20 shrink-0 select-none"
              style={{ backgroundColor: 'var(--accent-primary, #022C22)' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={shopName} className="w-full h-full object-cover rounded-2xl" loading="eager" decoding="async" />
              ) : (
                avatarText
              )}
            </div>
          </div>

          {/* Center: Live Status Badge Capsule with Dual-Pulse Glow */}
          <div className="flex items-center justify-center px-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800 shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <BreathingText
                fromFontVariationSettings="'wght' 450"
                toFontVariationSettings="'wght' 700"
                staggerFrom="center"
                duration={2.2}
                className="tracking-normal whitespace-nowrap text-[11px] sm:text-xs font-semibold"
              >
                {isAr ? 'مفتوح الآن • تجهيز فوري' : statusText}
              </BreathingText>
            </span>
          </div>

          {/* Left: Rating Badge - Fixed full label "4.9 ★" inside robust capsule */}
          <div className="flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50/90 dark:bg-stone-800 text-stone-900 dark:text-amber-100 border border-amber-200/70 dark:border-stone-700 shadow-xs backdrop-blur-md whitespace-nowrap">
              <Star className="w-3.5 h-3.5 fill-[var(--accent-gold,#D4AF37)] text-[var(--accent-gold,#D4AF37)] shrink-0" />
              <span className="font-bold text-xs tracking-tight">4.9 ★</span>
            </span>
          </div>
        </div>

        {/* 2. PURE ELEGANT BRAND TYPOGRAPHY HEADER (Only Text, Clean & Fast) */}
        <div className="w-full py-3 px-2 sm:px-4 my-1 relative z-10 flex flex-col items-center justify-center text-center">
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight select-text transition-colors duration-300"
            style={{
              color: 'var(--text-main, #1C1917)',
            }}
          >
            {shopName}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[var(--accent-gold,#D4AF37)]" />
            <span
              className="text-[11px] sm:text-xs font-serif font-semibold tracking-[0.22em] uppercase"
              style={{ color: 'var(--accent-gold, #D4AF37)' }}
            >
              {isAr ? 'دار الورد • MAISON DES FLEURS' : 'MAISON DES FLEURS • ATELIER'}
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[var(--accent-gold,#D4AF37)]" />
          </div>
        </div>

        {/* 3. ELEGANT SINGLE TAGLINE & RIYADH LOCATION CAPSULE */}
        <div className="flex flex-col items-center gap-1 text-center relative z-10">
          <p
            className="text-xs font-light text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed"
            style={{ color: 'var(--text-muted, #78716C)' }}
          >
            {shopTagline}
          </p>

          <a
            href={locationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-[11px] font-medium bg-stone-100/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700 hover:bg-stone-200/80 transition-colors"
          >
            <MapPin className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{locationLabel}</span>
          </a>
        </div>

        {/* 4. UNIFIED ACTIONS ROW (WhatsApp, Instagram, Call, Wishlist) */}
        <div className="flex items-center justify-center gap-3 pt-1.5 relative z-10">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noreferrer"
            aria-label={isAr ? 'واتساب' : 'WhatsApp'}
            className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95 transition-transform"
            title={isAr ? 'واتساب' : 'WhatsApp'}
          >
            <MessageCircle className="w-4 h-4 stroke-[2.2]" />
          </a>

          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={isAr ? 'انستقرام' : 'Instagram'}
            className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-xs flex items-center justify-center text-rose-600 dark:text-rose-400 hover:scale-105 active:scale-95 transition-transform"
            title={isAr ? 'انستقرام' : 'Instagram'}
          >
            <InstagramIcon className="w-4 h-4" />
          </a>

          {/* Direct Call */}
          <a
            href={`tel:+${phone}`}
            aria-label={callLabel}
            className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-xs flex items-center justify-center text-stone-700 dark:text-stone-300 hover:scale-105 active:scale-95 transition-transform"
            title={callLabel}
          >
            <Phone className="w-4 h-4 stroke-[2.2]" />
          </a>

          {/* Wishlist / Favorites */}
          <button
            type="button"
            aria-label={isAr ? 'المفضلة' : 'Wishlist'}
            className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-xs flex items-center justify-center text-rose-500 hover:scale-105 active:scale-95 transition-transform"
            title={isAr ? 'المفضلة' : 'Wishlist'}
          >
            <Heart className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* 5. 100% FULL-WIDTH SEARCH BAR (Unclipped, Crisp Focus Animation) */}
        <div className="w-full pt-1.5 relative z-10">
          <div className="relative w-full group">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets, vases, occasions...'}
              aria-label={isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets, vases, occasions...'}
              className="w-full py-2.5 pr-10 pl-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800/30 dark:focus:ring-emerald-500/40 focus:border-emerald-800 dark:focus:border-emerald-500 transition-all duration-200 shadow-xs"
            />
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-emerald-700 transition-colors">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(ShopHeader);
