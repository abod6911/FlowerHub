import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Star,
  MessageCircle,
  Search,
  X,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';
import { useStoreTheme } from '../context/StoreThemeContext';

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
  heroStyle = 'qlub',
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
      return (
        localStorage.getItem('flowerhub_store_avatar') ||
        shopConfig?.avatarUrl ||
        shopConfig?.logoUrl ||
        null
      );
    } catch {
      return shopConfig?.avatarUrl || shopConfig?.logoUrl || null;
    }
  });

  // Re-sync avatar whenever shopConfig avatarUrl or logoUrl changes
  useEffect(() => {
    if (shopConfig?.avatarUrl !== undefined || shopConfig?.logoUrl !== undefined) {
      setCustomAvatar(shopConfig?.avatarUrl || shopConfig?.logoUrl || null);
    }
  }, [shopConfig?.avatarUrl, shopConfig?.logoUrl]);

  const currentPlaceholder = isAr
    ? 'ابحث عن باقة، فازة، أو مناسبة...'
    : 'Search bouquets, vases, occasions...';

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
        onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: dataUrl, logoUrl: dataUrl }));
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
      onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: url, logoUrl: url }));
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
      onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: null, logoUrl: null }));
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

  // Real-time prioritization of shopConfig values set by Florist in admin
  const shopName = isAr
    ? (shopConfig?.shopNameAr || rawStudio?.storeName || brand?.storeName || 'دار الورد للمناسبات')
    : (shopConfig?.shopNameEn || rawStudio?.storeName || brand?.storeName || 'Dar Alward Florist');

  const shopTagline = isAr
    ? (shopConfig?.taglineAr || rawStudio?.storeSubtitle || brand?.subtitle || 'أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب')
    : (shopConfig?.taglineEn || rawStudio?.storeSubtitle || brand?.subtitle || strings.shopTagline);

  const isBusy = shopConfig?.status === 'busy_60m';
  const isClosed = shopConfig?.status === 'closed';

  const statusText = isClosed
    ? (isAr ? 'مغلق مؤقتاً' : 'Temporarily Closed')
    : isBusy
    ? (isAr ? 'مشغول • تجهيز خلال ٦٠ د' : 'Busy • 60m prep')
    : (rawStudio?.statusText || brand?.statusText || (isAr ? 'مفتوح الآن • تجهيز فوري' : 'Open Now • Instant Prep'));

  const statusColorClasses = isClosed
    ? 'bg-stone-500/10 dark:bg-stone-900/60 text-stone-700 dark:text-stone-300 border-stone-500/25 dark:border-stone-700'
    : isBusy
    ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-500/25 dark:border-amber-700/60'
    : 'bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-500/25 dark:border-emerald-700/60';

  const radarDotClasses = isClosed ? 'bg-stone-500' : isBusy ? 'bg-amber-500' : 'bg-emerald-500';
  const radarPingClasses = isClosed ? 'bg-stone-400' : isBusy ? 'bg-amber-400' : 'bg-emerald-400';
  const radarRingClasses = isClosed ? 'ring-stone-300' : isBusy ? 'ring-amber-200/80' : 'ring-emerald-200/80';

  const avatarText = rawStudio?.avatarText || brand?.avatarText || 'د.و';
  const avatarUrl = shopConfig?.avatarUrl || shopConfig?.logoUrl || customAvatar || brand?.avatarUrl;
  const locationLabel = rawStudio?.locationLabel || brand?.locationLabel || (isAr ? 'الرياض • التوصيل لكافة الأحياء' : strings.location);
  const locationUrl = brand?.locationUrl || 'https://maps.google.com';
  const phone = rawStudio?.phone || brand?.phone || shopConfig?.phone || '966500000000';

  // Render Refined Boutique Seal / Logo
  const renderAvatarButton = (sizeClass = 'w-11 h-11') => (
    <button
      type="button"
      onClick={() => setIsAvatarModalOpen(true)}
      className={`relative ${sizeClass} rounded-2xl flex items-center justify-center font-serif text-sm font-bold text-stone-100 shadow-sm border border-stone-200/60 dark:border-stone-700 bg-stone-900 dark:bg-stone-850 cursor-pointer select-none group/avatar hover:opacity-90 active:scale-95 transition-all overflow-hidden shrink-0`}
      title={isAr ? 'شعار وهوية المتجر (انقر للتعديل)' : 'Store logo (click to edit)'}
    >
      {/* Avatar Image or Clean Monogram */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={shopName}
          className="w-full h-full object-cover rounded-2xl"
          loading="eager"
          decoding="async"
        />
      ) : (
        <span className="tracking-widest font-serif text-stone-100 font-bold">{avatarText}</span>
      )}

      {/* Subtle Camera Overlay on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white z-10">
        <Camera className="w-3.5 h-3.5 text-stone-200" />
      </div>
    </button>
  );

  // Render Clean Luxury Search Pill
  const renderSearchCapsule = () => (
    <div className="relative w-full">
      <div className="relative w-full flex items-center bg-stone-100/80 dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 px-3.5 py-2 transition-all duration-200 focus-within:border-stone-800 dark:focus-within:border-stone-300 focus-within:bg-white dark:focus-within:bg-stone-900 focus-within:shadow-xs">
        <Search className="w-4 h-4 text-stone-400 shrink-0 ms-0.5" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder={currentPlaceholder}
          aria-label={isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets, vases, occasions...'}
          className="w-full py-1 px-2.5 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs font-medium focus:outline-none"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange && onSearchChange('')}
            className="w-6 h-6 rounded-full bg-stone-200/70 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <header className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 w-full transition-colors duration-300 relative select-none">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={avatarFileInputRef}
        accept="image/*"
        onChange={handleAvatarFileSelect}
        className="hidden"
        aria-label="Upload store logo"
      />

      {/* STYLE 1: EDITORIAL ATELIER COVER HERO */}
      {heroStyle === 'editorial' ? (
        <div className="relative p-5 sm:p-7 shadow-[0_16px_40px_-6px_rgba(0,0,0,0.35)] flex flex-col justify-between min-h-[270px] sm:min-h-[300px] transition-all duration-300 overflow-hidden rounded-[26px] border border-amber-500/40 bg-stone-950 text-white backdrop-blur-xl group">
          {/* Cover background image with fallback */}
          <img
            src="./images/hero/hero-atelier-banner.jpg"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80';
            }}
            alt="Store Cover"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.40] transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-stone-950/60 to-black/45 pointer-events-none" />

          {/* Top Row */}
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center">
              {renderAvatarButton('w-12 h-12')}
            </div>

            {/* Status Capsule */}
            <div className="flex items-center justify-center px-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs transition-all border ${statusColorClasses}`}>
                <span className={`inline-flex rounded-full h-2 w-2 ${radarDotClasses}`} />
                <span className="text-[11px] sm:text-xs font-bold text-white tracking-normal whitespace-nowrap">
                  {statusText}
                </span>
              </span>
            </div>

            {/* WhatsApp & Rating */}
            <div className="flex items-center justify-end gap-2">
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-400/40 transition-all duration-200 active:scale-95 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px] font-bold">{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-extrabold text-xs">4.9 ★</span>
              </span>
            </div>
          </div>

          {/* Center Brand Identity */}
          <div className="w-full py-4 relative z-10 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] tracking-widest uppercase font-serif text-amber-300 font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-400/40 mb-1.5">
              ⚜ MAISON DES FLEURS • دار الورد ⚜
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50 drop-shadow-md leading-tight">
              {shopName}
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs text-stone-200 mt-1 flex-wrap font-medium">
              <span>{shopTagline}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-amber-400 shrink-0" />
              <a
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-300 hover:underline font-semibold"
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{locationLabel}</span>
              </a>
            </div>
          </div>

          {/* Search Capsule */}
          <div className="w-full pt-1 relative z-10">
            {renderSearchCapsule()}
          </div>
        </div>
      ) : heroStyle === 'minimal' ? (
        /* STYLE 2: MINIMAL SCANDINAVIAN CLEAN HERO */
        <div className="relative p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] flex flex-col gap-3.5 transition-all duration-300 overflow-hidden rounded-[24px] border border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg">
          <div className="flex flex-col items-center justify-center text-center pt-1 relative z-10">
            {renderAvatarButton('w-14 h-14')}

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-50 font-serif leading-tight mt-2.5">
              {shopName}
            </h1>

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium max-w-sm">
              {shopTagline}
            </p>

            <div className="flex items-center justify-center gap-2 mt-2.5 flex-wrap text-xs">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] border backdrop-blur-md ${statusColorClasses}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${radarPingClasses}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${radarDotClasses}`} />
                </span>
                <span>{statusText}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-stone-800 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-stone-700">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <span>4.9 ★</span>
              </span>

              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 hover:bg-emerald-100"
              >
                <MessageCircle className="w-3 h-3" />
                <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              <a
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 hover:text-emerald-600 font-medium"
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{locationLabel}</span>
              </a>
            </div>
          </div>

          <div className="w-full pt-1 relative z-10">
            {renderSearchCapsule()}
          </div>
        </div>
      ) : (
        /* STYLE 3: SIGNATURE QLUB COMPACT BOUTIQUE CARD (DEFAULT) */
        <div
          className="relative p-4 sm:p-6 shadow-[0_12px_36px_-6px_rgba(212,175,55,0.08),0_4px_18px_-2px_rgba(0,0,0,0.04)] flex flex-col gap-3 sm:gap-4 transition-all duration-300 overflow-hidden rounded-[22px] sm:rounded-[26px] border border-amber-200/80 dark:border-stone-800 bg-gradient-to-b from-[#FDFAF6] via-white to-[#FDF8F3] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 backdrop-blur-xl group"
        >
          {/* 1. TOP ROW: Store Seal | Calm Status Indicator | Contact & Rating */}
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center">
              {renderAvatarButton('w-11 h-11')}
            </div>

            {/* Center: Live Status Badge Capsule */}
            <div className="flex items-center justify-center px-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${statusColorClasses}`}>
                <span className={`inline-flex rounded-full h-2 w-2 ${radarDotClasses}`} />
                <span className="tracking-normal whitespace-nowrap text-[11px] font-bold">
                  {statusText}
                </span>
              </span>
            </div>

            {/* Left: Quick WhatsApp Contact & Rating Badge */}
            <div className="flex items-center justify-end gap-2">
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noreferrer"
                aria-label={isAr ? 'واتساب' : 'WhatsApp'}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-800 dark:text-emerald-300 hover:text-white border border-emerald-500/25 transition-all duration-200 active:scale-95 shadow-2xs"
                title={isAr ? 'واتساب مباشر' : 'Direct WhatsApp'}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px] font-bold">{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-2xs whitespace-nowrap">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-extrabold text-xs tracking-tight">4.9 ★</span>
              </span>
            </div>
          </div>

          {/* 2. MAISON BRAND IDENTITY */}
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

          {/* 3. SEARCH CAPSULE */}
          <div className="w-full pt-1 relative z-10">
            {renderSearchCapsule()}
          </div>
        </div>
      )}

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
