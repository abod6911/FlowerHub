import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Star,
  MessageCircle,
  Heart,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  Clock,
  X,
  Crown,
} from 'lucide-react';
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

// Quick interactive discovery search chips
const QUICK_TAGS = [
  { id: 'love', labelAr: '🌷 باقات حب', labelEn: '🌷 Love Bouquets', query: 'حب' },
  { id: 'vases', labelAr: '👑 فازات ملكية', labelEn: '👑 Royal Vases', query: 'فازة' },
  { id: 'grad', labelAr: '🎓 هدايا تخرج', labelEn: '🎓 Graduation', query: 'تخرج' },
  { id: 'ready', labelAr: '⚡ جاهز اليوم', labelEn: '⚡ Ready Today', query: 'جاهز' },
];

// Dynamic Rotating Search Placeholders
const SEARCH_PLACEHOLDERS_AR = [
  'ابحث عن باقة، فازة، أو مناسبة...',
  'ابحث عن: باقات الورد الجوري الملكي...',
  'ابحث عن: فازات السيراميك الفاخرة...',
  'ابحث عن: هدايا التخرج والمواليد...',
  'ابحث عن: زهور عباد الشمس المبهجة...',
];

const SEARCH_PLACEHOLDERS_EN = [
  'Search bouquets, vases, occasions...',
  'Search: Royal Velvet Rose Bouquets...',
  'Search: Luxury Ceramic & Glass Vases...',
  'Search: Graduation & Baby Hampers...',
  'Search: Radiant Golden Sunflowers...',
];

function ShopHeader({
  _heroStyle = 'qlub',
  lang = 'ar',
  shopConfig,
  _themeTokens = THEME_TOKENS.botanical,
  _botanicalBrandConfig,
  searchQuery = '',
  onSearchChange,
  bagCount = 0,
  onOpenBag,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const [favCount, setFavCount] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('flowerhub_favorites') || '[]');
      setFavCount(Array.isArray(favs) ? favs.length : 0);
    } catch {
      setFavCount(0);
    }
  }, []);

  useEffect(() => {
    const list = isAr ? SEARCH_PLACEHOLDERS_AR : SEARCH_PLACEHOLDERS_EN;
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % list.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isAr]);

  const currentPlaceholder = isAr
    ? SEARCH_PLACEHOLDERS_AR[placeholderIdx]
    : SEARCH_PLACEHOLDERS_EN[placeholderIdx];

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

  const handleTagClick = (tagQuery) => {
    if (searchQuery === tagQuery) {
      onSearchChange && onSearchChange('');
    } else {
      onSearchChange && onSearchChange(tagQuery);
    }
  };

  return (
    <header className="px-4 pt-4 pb-2 w-full transition-colors duration-300 relative select-none">
      {/* Luxury Boutique Floating Header Card Container */}
      <div
        className="relative p-5 sm:p-6 shadow-[0_12px_36px_-6px_rgba(212,175,55,0.08),0_4px_18px_-2px_rgba(0,0,0,0.04)] flex flex-col gap-4 transition-all duration-300 overflow-hidden rounded-[26px] border border-amber-200/80 dark:border-stone-800 bg-gradient-to-b from-[#FDFAF6] via-white to-[#FDF8F3] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 backdrop-blur-xl group"
      >
        {/* Poetic floating rose petals drifting gently across background layer */}
        <FloatingHeroPetals className="z-0 opacity-25" />

        {/* Ambient Warm Golden Aura in Background */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-44 bg-gradient-to-b from-amber-200/20 via-rose-100/10 to-transparent rounded-full blur-2xl pointer-events-none z-0" />

        {/* 1. TOP ROW: Monogram Royal Seal | Live Status Capsule | Rating Jewel */}
        <div className="flex items-center justify-between w-full relative z-10">
          {/* Right: Store Monogram Royal Seal */}
          <div className="flex items-center">
            <div
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center font-serif text-base font-bold text-amber-100 shadow-md ring-2 ring-amber-400/50 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 cursor-pointer select-none group/avatar hover:scale-105 hover:rotate-3 transition-all duration-300"
              title={shopName}
            >
              {/* Crown Spark Accent */}
              <div className="absolute -top-1.5 -right-1 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs ring-1 ring-white">
                <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={shopName}
                  className="w-full h-full object-cover rounded-2xl"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <span className="tracking-wider drop-shadow-xs">{avatarText}</span>
              )}
            </div>
          </div>

          {/* Center: Live Status Badge Capsule with Dual-Pulse Radar */}
          <div className="flex items-center justify-center px-1">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-500/25 dark:border-emerald-700/60 shadow-xs backdrop-blur-md transition-all hover:bg-emerald-500/15">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-emerald-200/80" />
              </span>
              <BreathingText
                fromFontVariationSettings="'wght' 500"
                toFontVariationSettings="'wght' 800"
                staggerFrom="center"
                duration={2.2}
                className="tracking-normal whitespace-nowrap text-[11px] sm:text-xs font-bold text-emerald-950 dark:text-emerald-200"
              >
                {isAr ? 'مفتوح الآن • تجهيز فوري' : statusText}
              </BreathingText>
            </span>
          </div>

          {/* Left: Rating Badge - Sparkling Gold Capsule */}
          <div className="flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 dark:bg-stone-800 text-amber-950 dark:text-amber-100 border border-amber-300/80 dark:border-stone-700 shadow-2xs backdrop-blur-md whitespace-nowrap group/rating hover:scale-105 transition-transform">
              <Star className="w-3.5 h-3.5 fill-[var(--accent-gold,#D4AF37)] text-[var(--accent-gold,#D4AF37)] group-hover/rating:rotate-12 transition-transform duration-300 shrink-0" />
              <span className="font-extrabold text-xs tracking-tight">4.9 ★</span>
            </span>
          </div>
        </div>

        {/* 2. MAISON BRAND EMBLEM & TYPOGRAPHY (Crystal clear, regal, high contrast) */}
        <div className="w-full py-1.5 px-2 relative z-10 flex flex-col items-center justify-center text-center">
          {/* Subtle top crown or sparkle */}
          <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-700/90 dark:text-amber-300 font-mono">
              {isAr ? 'بوتيك أزهار فاخرة' : 'Haute Floral Atelier'}
            </span>
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight select-text text-stone-900 dark:text-stone-50 font-serif leading-tight drop-shadow-2xs"
          >
            {shopName}
          </h1>

          {/* Distinctive Atelier Sub-insignia Ribbon with delicate golden dividers */}
          <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-xs">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-amber-500 opacity-60" />
            <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.22em] text-amber-700 dark:text-amber-300 uppercase whitespace-nowrap flex items-center gap-1.5">
              <span>✦</span>
              <span>{isAr ? 'دار الورد • MAISON DES FLEURS' : 'MAISON DES FLEURS • PARIS'}</span>
              <span>✦</span>
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-300 to-amber-500 opacity-60" />
          </div>

          <p className="text-xs font-normal text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed mt-2">
            {shopTagline}
          </p>
        </div>

        {/* 3. SERVICE HIGHLIGHT CHIPS (Organized, clean, informative) */}
        <div className="flex items-center justify-center gap-2 flex-wrap relative z-10">
          {/* Location Badge */}
          <a
            href={locationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-stone-100/90 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/70 dark:border-stone-700 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-900 transition-all duration-200 shadow-2xs"
          >
            <MapPin className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{locationLabel}</span>
          </a>

          {/* Refrigerated delivery chip */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100/90 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/70 dark:border-stone-700 shadow-2xs">
            <Truck className="w-3 h-3 text-sky-600 shrink-0" />
            <span>{isAr ? 'سيارات مبردة' : 'Chilled Fleet'}</span>
          </span>

          {/* Instant prep chip */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100/90 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/70 dark:border-stone-700 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
            <span>{isAr ? 'تنسيق طازج' : 'Fresh Hand-tied'}</span>
          </span>
        </div>

        {/* 4. LUXURY FLOATING ACTIONS DOCK (Clean, tactile, springy micro-interactions) */}
        <div className="flex items-center justify-center relative z-10 pt-1">
          <div className="inline-flex items-center gap-2.5 bg-stone-100/80 dark:bg-stone-800/80 backdrop-blur-md p-1.5 rounded-full border border-stone-200/80 dark:border-stone-700/80 shadow-inner">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noreferrer"
              aria-label={isAr ? 'واتساب' : 'WhatsApp'}
              className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-emerald-200/60 dark:border-emerald-800 shadow-xs flex items-center justify-center text-emerald-600 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 group/btn"
              title={isAr ? 'واتساب مباشر' : 'WhatsApp'}
            >
              <MessageCircle className="w-4 h-4 stroke-[2.2] group-hover/btn:scale-110 transition-transform" />
            </a>

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={isAr ? 'انستقرام' : 'Instagram'}
              className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-rose-200/60 dark:border-rose-800 shadow-xs flex items-center justify-center text-rose-600 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white hover:border-transparent hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 group/btn"
              title={isAr ? 'انستقرام' : 'Instagram'}
            >
              <InstagramIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </a>

            {/* Direct Call */}
            <a
              href={`tel:+${phone}`}
              aria-label={callLabel}
              className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xs flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-stone-900 hover:text-amber-300 hover:border-stone-900 hover:shadow-md hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 group/btn"
              title={callLabel}
            >
              <Phone className="w-4 h-4 stroke-[2.2] group-hover/btn:scale-110 transition-transform" />
            </a>

            {/* Wishlist / Favorites */}
            <button
              type="button"
              onClick={() => {
                if (favCount > 0) {
                  onSearchChange && onSearchChange('');
                }
              }}
              aria-label={isAr ? 'المفضلة' : 'Wishlist'}
              className="relative w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-rose-200/60 dark:border-rose-800 shadow-xs flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 group/btn cursor-pointer"
              title={isAr ? 'المفضلة' : 'Wishlist'}
            >
              <Heart className="w-4 h-4 stroke-[2.2] group-hover/btn:scale-110 group-hover/btn:fill-white transition-all" />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-1 ring-white">
                  {favCount}
                </span>
              )}
            </button>

            {/* Shopping Bag / Cart */}
            <button
              type="button"
              onClick={onOpenBag}
              aria-label={isAr ? 'سلة الطلبات' : 'Cart'}
              className="relative w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-emerald-200/80 dark:border-emerald-800 shadow-xs flex items-center justify-center text-emerald-900 dark:text-emerald-300 hover:bg-emerald-900 hover:text-white hover:border-emerald-900 hover:shadow-md hover:shadow-emerald-900/20 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group/btn"
              title={isAr ? 'سلة الطلبات' : 'Cart'}
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.2] group-hover/btn:scale-110 transition-transform" />
              {bagCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-stone-900 animate-bounce">
                  {bagCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 5. LUXURY ARCHITECTURAL SEARCH CAPSULE & QUICK FILTERS */}
        <div className="w-full pt-1 relative z-10 space-y-2.5">
          <div className="relative w-full group">
            {/* Outer Ambient Glow on Hover/Focus */}
            <div className="absolute -inset-0.5 rounded-[22px] bg-gradient-to-r from-amber-400/25 via-emerald-400/15 to-amber-400/25 opacity-0 group-hover:opacity-70 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none" />

            {/* Main Search Pill Shell */}
            <div className="relative w-full flex items-center bg-white dark:bg-stone-800/95 rounded-[20px] border border-stone-200/90 dark:border-stone-700/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] group-hover:border-amber-300 dark:group-hover:border-stone-600 group-focus-within:border-amber-500 dark:group-focus-within:border-amber-400 group-focus-within:ring-2 group-focus-within:ring-amber-500/20 group-focus-within:shadow-[0_4px_20px_-2px_rgba(212,175,55,0.18)] transition-all duration-300 p-1">
              
              {/* Right Jewel Search Button / Icon */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 dark:from-amber-500 dark:to-amber-700 text-stone-950 flex items-center justify-center shrink-0 shadow-xs group-focus-within:scale-105 group-focus-within:rotate-3 transition-transform duration-300 select-none">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>

              {/* Input Element */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder={currentPlaceholder}
                aria-label={isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets, vases, occasions...'}
                className="w-full py-2 px-3 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs sm:text-sm font-medium focus:outline-none transition-colors"
              />

              {/* Left Actions Area */}
              <div className="flex items-center gap-1.5 shrink-0 pl-2 pr-1">
                {/* Clear Button (when text exists) */}
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange && onSearchChange('')}
                    className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-900 hover:text-white dark:hover:bg-stone-600 text-stone-500 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                ) : (
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-stone-700/80 text-[10px] font-bold text-amber-800 dark:text-amber-200 select-none border border-amber-200/60 dark:border-stone-600">
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>{isAr ? 'بحث ذكي' : 'Smart Search'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Category Chips for Immediate Discovery */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-stone-400 font-medium ml-1 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
              <span>{isAr ? 'الأكثر طلباً:' : 'Trending:'}</span>
            </span>
            {QUICK_TAGS.map((tag) => {
              const isActive = searchQuery === tag.query;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagClick(tag.query)}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-500 shadow-xs scale-105 ring-2 ring-amber-300/40'
                      : 'bg-white/95 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-amber-200/60 dark:border-stone-700 hover:border-amber-400 hover:bg-amber-50/70 hover:-translate-y-0.5'
                  }`}
                >
                  {isAr ? tag.labelAr : tag.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(ShopHeader);
