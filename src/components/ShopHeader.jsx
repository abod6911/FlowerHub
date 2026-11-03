import React, { useRef } from 'react';
import { MapPin, Phone, Star, MessageCircle, Search, X } from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';
import DarAlwardAnimatedTitle from './DarAlwardAnimatedTitle';
import { useStoreTheme } from '../context/StoreThemeContext';
import { BreathingText } from './fancy/breathing-text';

// Clean stroke Instagram Icon
function InstagramIcon({ className = 'w-3.5 h-3.5' }) {
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

export default function ShopHeader({
  heroStyle: _heroStyle = 'qlub',
  lang = 'ar',
  shopConfig,
  themeTokens: _themeTokens = THEME_TOKENS.botanical,
  botanicalBrandConfig,
  searchQuery = '',
  onSearchChange,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';
  const searchInputRef = useRef(null);

  let storeThemeCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeThemeCtx = useStoreTheme();
  } catch {
    // fallback
  }

  const rawStudio = storeThemeCtx?.rawConfig || storeThemeCtx?.config;
  const brand = storeThemeCtx?.config?.brand;
  const colors = storeThemeCtx?.config?.colors;

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

  const statusText = rawStudio?.statusText || brand?.statusText || (isAr ? 'مفتوح الآن • يجهز فوراً' : 'Open Now • Express Prep');
  const statusPulse = rawStudio?.statusPulse !== undefined ? rawStudio.statusPulse : (brand?.statusPulse !== false);
  const ratingText = rawStudio?.rating || brand?.rating || '٤.٩';
  const avatarText = rawStudio?.avatarText || brand?.avatarText || 'د.و';
  const avatarUrl = brand?.avatarUrl;
  const locationLabel = rawStudio?.locationLabel || brand?.locationLabel || (isAr ? 'الرياض • التوصيل لكافة الأحياء' : strings.location);
  const locationUrl = brand?.locationUrl || 'https://maps.google.com';
  const instagramLabel = brand?.instagramLabel || strings.instagram;
  const instagramUrl = brand?.instagramUrl || 'https://instagram.com';
  const phone = rawStudio?.phone || brand?.phone || shopConfig?.phone || '966500000000';
  const callLabel = brand?.callLabel || strings.callUs;

  const effectiveBotanicalConfig = {
    ...(botanicalBrandConfig || {}),
    ...(brand?.botanical || {}),
    text: shopName,
    paletteId: rawStudio?.botanicalPalette || brand?.botanical?.paletteId || colors?.paletteId || 'royalBurgundy',
    motionMode: rawStudio?.botanicalMotion || brand?.botanical?.motionMode || 'gust',
    density: rawStudio?.botanicalDensity || brand?.botanical?.density || 'balanced',
    seed: rawStudio?.botanicalSeed || brand?.botanical?.seed || 48271,
    bloomSize: rawStudio?.bloomSize || brand?.botanical?.bloomSize || 52,
    stemThickness: rawStudio?.stemThickness || brand?.botanical?.stemThickness || 1.8,
    botanicalEnabled: rawStudio?.botanicalEnabled !== undefined ? rawStudio.botanicalEnabled : (brand?.botanical?.enabled !== false),
  };

  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Luxury Glass Floating Header Card */}
        <div
          className="p-5 sm:p-7 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] rounded-3xl border transition-all duration-300 flex flex-col gap-5 relative overflow-hidden backdrop-blur-md"
          style={{
            backgroundColor: 'var(--surface-card, rgba(255, 255, 255, 0.92))',
            borderColor: 'var(--border-subtle, rgba(231, 229, 228, 0.85))',
          }}
        >
          {/* Subtle Ambient Top Accent Glow */}
          <div
            className="absolute top-0 inset-x-0 h-1 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--accent-gold, #D4AF37), var(--accent-primary, #123524), transparent)',
            }}
          />

          {/* Row 1: Status Pill, Rating & Brand Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Identity & Monogram */}
            <div className="flex items-start gap-4">
              {/* Elegant Monogram Avatar */}
              <div
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center font-serif text-2xl font-bold tracking-wider text-white shadow-md transition-all duration-300 border border-white/20"
                style={{
                  backgroundColor: 'var(--accent-primary, #123524)',
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  avatarText
                )}
              </div>

              {/* Title & Tagline */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  {/* Status Badge with Breathing Text */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border border-emerald-500/25 shadow-2xs">
                    {statusPulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                    <BreathingText
                      fromFontVariationSettings="'wght' 400"
                      toFontVariationSettings="'wght' 700"
                      staggerFrom="center"
                      duration={2.2}
                      className="font-medium tracking-normal"
                    >
                      {statusText}
                    </BreathingText>
                  </span>

                  {/* Rating Pill */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{ratingText}</span>
                    <span className="text-stone-400 font-normal text-[10px] hidden sm:inline">(٨٥٠+ تقييم)</span>
                  </div>
                </div>

                {isAr ? (
                  <div className="w-full -my-1">
                    <DarAlwardAnimatedTitle
                      config={effectiveBotanicalConfig}
                      text={shopName}
                      textColor="var(--text-main, #1C1917)"
                    />
                  </div>
                ) : (
                  <h1
                    className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100 truncate"
                  >
                    {shopName}
                  </h1>
                )}

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-1 font-light">
                  {shopTagline}
                </p>
              </div>
            </div>

            {/* Quick Access Action Capsules (واتساب، انستقرام، الموقع، اتصال) */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/25 backdrop-blur-md text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95"
                title="محادثة واتساب مباشرة"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-900 dark:text-rose-300 border border-rose-500/25 backdrop-blur-md text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95"
                title="معرض أعمال انستقرام"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>{instagramLabel}</span>
              </a>

              {/* Location */}
              <a
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 backdrop-blur-md text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95"
                title="موقع المعرض والتوصيل"
              >
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">{locationLabel}</span>
                <span className="sm:hidden">{isAr ? 'الموقع' : 'Maps'}</span>
              </a>

              {/* Direct Phone Call */}
              <a
                href={`tel:+${phone}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 backdrop-blur-md text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95"
                title={callLabel}
              >
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">{callLabel}</span>
              </a>
            </div>
          </div>

          {/* Row 2: Luxury Editorial Search Bar with Focus Animation */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="relative w-full max-w-3xl mx-auto group">
              <Search className="w-4 h-4 text-stone-400 absolute inset-inline-start-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-[var(--accent-primary,#123524)] pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder={isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets, vases, occasions...'}
                className="w-full ps-11 pe-24 py-3 rounded-2xl bg-stone-50/80 dark:bg-stone-800/60 border border-stone-200/90 dark:border-stone-700/80 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary,#123524)]/20 focus:border-[var(--accent-primary,#123524)] focus:bg-white dark:focus:bg-stone-900 shadow-2xs hover:shadow-xs focus:shadow-md transition-all duration-300"
              />
              <div className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange && onSearchChange('')}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-stone-400 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded-md bg-stone-100/70 dark:bg-stone-800 select-none hidden sm:inline">
                    ⌘K
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
