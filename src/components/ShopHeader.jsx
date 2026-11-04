import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Star,
  MessageCircle,
  Search,
  Sparkles,
  X,
  Crown,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';
import { useStoreTheme } from '../context/StoreThemeContext';
import { BreathingText } from './fancy/breathing-text';
import { FloatingHeroPetals } from './AmbientRosePetals';

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
  onUpdateShopConfig,
  _themeTokens = THEME_TOKENS.botanical,
  _botanicalBrandConfig,
  searchQuery = '',
  onSearchChange,
  bagCount = 0,
  onOpenBag,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const avatarFileInputRef = useRef(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [avatarToast, setAvatarToast] = useState('');

  const [customAvatar, setCustomAvatar] = useState(() => {
    try {
      return localStorage.getItem('flowerhub_store_avatar') || shopConfig?.avatarUrl || null;
    } catch {
      return shopConfig?.avatarUrl || null;
    }
  });

  const [placeholderIdx, setPlaceholderIdx] = useState(0);

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

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(isAr ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت' : 'Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setCustomAvatar(dataUrl);
      try {
        localStorage.setItem('flowerhub_store_avatar', dataUrl);
      } catch {
        // storage quota fallback
      }
      if (onUpdateShopConfig) {
        onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: dataUrl }));
      }
      setIsAvatarModalOpen(false);
      setAvatarToast(isAr ? '✨ تم تحديث صورة الشعار بنجاح!' : 'Logo photo updated successfully!');
      setTimeout(() => setAvatarToast(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUrlAvatar = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    setCustomAvatar(url);
    try {
      localStorage.setItem('flowerhub_store_avatar', url);
    } catch {}
    if (onUpdateShopConfig) {
      onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: url }));
    }
    setCustomUrlInput('');
    setIsAvatarModalOpen(false);
    setAvatarToast(isAr ? '✨ تم حفظ رابط الشعار بنجاح!' : 'Logo URL saved!');
    setTimeout(() => setAvatarToast(''), 3000);
  };

  const handleResetAvatar = () => {
    setCustomAvatar(null);
    try {
      localStorage.removeItem('flowerhub_store_avatar');
    } catch {}
    if (onUpdateShopConfig) {
      onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: null }));
    }
    setIsAvatarModalOpen(false);
    setAvatarToast(isAr ? 'تمت استعادة الشعار الملكي الافتراضي (د.و)' : 'Reset to default seal');
    setTimeout(() => setAvatarToast(''), 3000);
  };

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
  const avatarUrl = customAvatar || shopConfig?.avatarUrl || brand?.avatarUrl;
  const locationLabel = rawStudio?.locationLabel || brand?.locationLabel || (isAr ? 'الرياض • التوصيل لكافة الأحياء' : strings.location);
  const locationUrl = brand?.locationUrl || 'https://maps.google.com';
  const phone = rawStudio?.phone || brand?.phone || shopConfig?.phone || '966500000000';

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
          {/* Right: Store Monogram Royal Seal / Custom Photo */}
          <div className="flex items-center">
            {/* Hidden file input for photo upload */}
            <input
              type="file"
              ref={avatarFileInputRef}
              accept="image/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
              aria-label="Upload store logo"
            />

            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center font-serif text-base font-bold text-amber-100 shadow-md ring-2 ring-amber-400/60 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 cursor-pointer select-none group/avatar hover:scale-105 hover:rotate-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 overflow-visible"
              title={isAr ? 'انقر لتغيير أو رفع شعار المتجر' : 'Click to change store logo'}
            >
              {/* Crown Spark Accent */}
              <div className="absolute -top-1.5 -right-1 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs ring-1 ring-white z-20">
                <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>

              {/* Avatar Image or Monogram */}
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

              {/* Camera Icon Overlay on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white z-10">
                <Camera className="w-4 h-4 text-amber-300" />
              </div>
            </button>
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

          {/* Left: Quick WhatsApp Contact & Rating Badge */}
          <div className="flex items-center justify-end gap-2">
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noreferrer"
              aria-label={isAr ? 'واتساب' : 'WhatsApp'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-800 dark:text-emerald-300 hover:text-white border border-emerald-500/25 transition-all duration-200 active:scale-95 shadow-2xs"
              title={isAr ? 'واتساب مباشر' : 'Direct WhatsApp'}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold">{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </a>

            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-amber-100/60 dark:bg-stone-800 text-amber-950 dark:text-amber-100 border border-amber-300/80 dark:border-stone-700 shadow-2xs whitespace-nowrap">
              <Star className="w-3.5 h-3.5 fill-[var(--accent-gold,#D4AF37)] text-[var(--accent-gold,#D4AF37)] shrink-0" />
              <span className="font-extrabold text-xs tracking-tight">4.9 ★</span>
            </span>
          </div>
        </div>

        {/* 2. MAISON BRAND IDENTITY (Clean, minimal, regal) */}
        <div className="w-full pt-1 pb-1 px-2 relative z-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight select-text text-stone-900 dark:text-stone-50 font-serif leading-tight">
            {shopName}
          </h1>

          {/* Single Clean Tagline & Location Line */}
          <div className="flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1 flex-wrap font-medium">
            <span>{shopTagline}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-amber-400 shrink-0" />
            <a
              href={locationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{locationLabel}</span>
            </a>
          </div>
        </div>

        {/* 3. SEARCH CAPSULE (Clean, intuitive, zero duplicate tags) */}
        <div className="w-full pt-1 relative z-10">
          <div className="relative w-full group">
            {/* Outer Ambient Glow on Hover/Focus */}
            <div className="absolute -inset-0.5 rounded-[22px] bg-gradient-to-r from-amber-400/25 via-emerald-400/15 to-amber-400/25 opacity-0 group-hover:opacity-70 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none" />

            {/* Main Search Pill Shell */}
            <div className="relative w-full flex items-center bg-white dark:bg-stone-800/95 rounded-[20px] border border-stone-200/90 dark:border-stone-700/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] group-hover:border-amber-300 dark:group-hover:border-stone-600 group-focus-within:border-amber-500 dark:group-focus-within:border-amber-400 group-focus-within:ring-2 group-focus-within:ring-amber-500/20 group-focus-within:shadow-[0_4px_20px_-2px_rgba(212,175,55,0.18)] transition-all duration-300 p-1">
              {/* Jewel Search Icon */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 dark:from-amber-500 dark:to-amber-700 text-stone-950 flex items-center justify-center shrink-0 shadow-xs select-none">
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

              {/* Clear Button (when text exists) */}
              {searchQuery && (
                <div className="flex items-center shrink-0 pl-2 pr-1">
                  <button
                    type="button"
                    onClick={() => onSearchChange && onSearchChange('')}
                    className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-900 hover:text-white dark:hover:bg-stone-600 text-stone-500 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Store Logo / Avatar Customizer Modal for Store Owner */}
      {isAvatarModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-amber-300/40 relative z-10 flex flex-col gap-4 text-stone-900 dark:text-stone-100"
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                    {isAr ? 'تخصيص شعار وصورة المتجر' : 'Store Logo & Avatar'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {isAr ? 'اختر صورة من جهازك أو ضع رابط صورة مباشر' : 'Upload photo or enter image URL'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center justify-center py-3 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200/60 dark:border-stone-800">
              <div className="relative w-20 h-20 rounded-2xl shadow-lg ring-3 ring-amber-400/70 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 flex items-center justify-center overflow-hidden">
                <div className="absolute -top-1.5 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs ring-2 ring-white z-20">
                  <Crown className="w-3 h-3 stroke-[2.5]" />
                </div>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-2xl font-bold text-amber-100">{avatarText}</span>
                )}
              </div>
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 mt-2">
                {avatarUrl ? (isAr ? 'شعارك المخصص حالياً' : 'Current Custom Logo') : (isAr ? 'الختم الملكي الافتراضي (د.و)' : 'Default Royal Seal')}
              </span>
            </div>

            {/* Option 1: Upload from device */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-900 to-stone-900 hover:from-emerald-800 hover:to-stone-800 text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'رفع صورة أو شعار من الجهاز' : 'Upload Image from Device'}</span>
              </button>
              <p className="text-[10px] text-stone-400 text-center">
                {isAr ? 'يدعم كاميرا الجوال، ألبوم الصور، وجميع أنواع الصور حتى 5 ميجابايت' : 'Supports mobile camera, photos, PNG, JPG up to 5MB'}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 my-1 text-stone-400 text-xs">
              <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
              <span>{isAr ? 'أو' : 'OR'}</span>
              <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
            </div>

            {/* Option 2: Image URL input */}
            <form onSubmit={handleSaveUrlAvatar} className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                {isAr ? 'أو ضع رابط صورة مباشر (URL):' : 'Or direct image URL:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 py-2 px-3 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!customUrlInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs transition-all active:scale-95 shrink-0"
                >
                  {isAr ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>

            {/* Option 3: Reset to Default */}
            {avatarUrl && (
              <button
                type="button"
                onClick={handleResetAvatar}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'حذف الصورة المخصصة والعودة للختم الملكي الافتراضي' : 'Reset to Default Seal'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Save Toast */}
      {avatarToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-stone-950 text-amber-200 text-xs font-bold shadow-xl border border-amber-400/40">
          {avatarToast}
        </div>
      )}
    </header>
  );
}

export default React.memo(ShopHeader);
