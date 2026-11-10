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
  Globe,
} from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';
import { useStoreTheme } from '../context/StoreThemeContext';
import { validateUploadedFile } from '../services/uploadSecurity';
import { sanitizeUrl } from '../utils/sanitizer';

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
  setLang,
  onToggleLang,
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

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Deep inspection of magic bytes, MIME whitelist, and size boundaries
    const validation = await validateUploadedFile(file, 'store');
    if (!validation.isValid) {
      alert(validation.error || (isAr ? 'الملف المرفق غير صالح أمنياً' : 'File is not secure'));
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
    const rawUrl = customUrlInput.trim();
    // Security: Block javascript:, data:, and insecure http schemes
    const safeUrl = sanitizeUrl(rawUrl, '');
    if (!safeUrl) {
      alert(isAr ? 'الرابط غير آمن أو غير صالح. يُشترط استخدام رابط يبدأ بـ https://' : 'Insecure or invalid URL. Only HTTPS URLs are permitted.');
      return;
    }

    setCustomAvatar(safeUrl);
    try {
      localStorage.setItem('flowerhub_store_avatar', safeUrl);
    } catch {}
    if (onUpdateShopConfig) {
      onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: safeUrl, logoUrl: safeUrl }));
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
  const locationLabel = shopConfig?.locationLabel || rawStudio?.locationLabel || brand?.locationLabel || (isAr ? 'الرياض • التوصيل لكافة الأحياء' : strings.location);
  const locationUrl = brand?.locationUrl || 'https://maps.google.com';
  const phone = rawStudio?.phone || brand?.phone || shopConfig?.phone || '966500000000';

  // Render Refined Boutique Royal Seal / Medallion Logo
  const renderAvatarButton = (sizeClass = 'w-12 h-12') => (
    <button
      type="button"
      onClick={() => setIsAvatarModalOpen(true)}
      className={`relative ${sizeClass} rounded-[18px] p-0.5 flex items-center justify-center shadow-[0_4px_16px_rgba(2,44,34,0.18)] border border-amber-400/40 ring-1 ring-amber-400/20 bg-gradient-to-br from-stone-950 via-[#022C22] to-stone-900 cursor-pointer select-none group/avatar hover:scale-105 active:scale-95 transition-all duration-300 shrink-0`}
      title={isAr ? 'شعار وهوية المتجر الملكية (انقر للتعديل)' : 'Store royal hallmark (click to edit)'}
    >
      {/* Outer Golden Hallmark Ring */}
      <div className="w-full h-full rounded-[15px] flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-stone-900/95 via-[#03261E]/95 to-stone-950">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={shopName}
            className="w-full h-full object-cover rounded-[15px]"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-[8px] text-amber-400/90 font-mono tracking-tighter mb-0.5">✦</span>
            <span className="font-serif font-black tracking-wider text-sm bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 bg-clip-text text-transparent drop-shadow-xs">
              {avatarText}
            </span>
          </div>
        )}

        {/* Subtle Camera Overlay on Hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-amber-200 z-10 backdrop-blur-2xs">
          <Camera className="w-4 h-4 text-amber-300 drop-shadow-xs" />
        </div>
      </div>
    </button>
  );

  // Render High-Fashion Luxury Search Capsule
  const renderSearchCapsule = () => (
    <div className="relative w-full">
      <div className="relative w-full flex items-center bg-stone-50/90 dark:bg-stone-900/90 rounded-[20px] border border-stone-200/90 dark:border-stone-700/80 px-4 py-2.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 focus-within:border-amber-500/70 dark:focus-within:border-amber-400/60 focus-within:bg-white dark:focus-within:bg-stone-900 focus-within:ring-3 focus-within:ring-amber-500/10 focus-within:shadow-[0_4px_20px_-4px_rgba(212,175,55,0.12)]">
        <Search className="w-4 h-4 text-amber-600/80 dark:text-amber-400/80 shrink-0 ms-0.5 transition-colors" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder={currentPlaceholder}
          aria-label={isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets, vases, occasions...'}
          className="w-full py-0.5 px-3 bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 text-xs font-medium focus:outline-none"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange && onSearchChange('')}
            className="w-6 h-6 rounded-full bg-stone-200/80 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        ) : (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-500 dark:text-stone-400 shrink-0 select-none hidden sm:inline-block">
            {isAr ? 'بحث سريع' : 'Search'}
          </span>
        )}
      </div>
    </div>
  );

  const handleToggleLanguage = () => {
    if (onToggleLang) {
      onToggleLang();
    } else if (setLang) {
      setLang(isAr ? 'en' : 'ar');
    }
  };

  const renderLanguageButton = () => (
    <button
      type="button"
      onClick={handleToggleLanguage}
      aria-label={isAr ? 'Switch to English' : 'التحويل للغة العربية'}
      title={isAr ? 'Switch to English' : 'التحويل للغة العربية'}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-stone-900/90 dark:bg-stone-800/90 hover:bg-stone-900 text-amber-300 hover:text-amber-200 border border-amber-400/35 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer select-none"
    >
      <Globe className="w-3.5 h-3.5 text-amber-400" />
      <span className="font-mono text-[11px] font-black tracking-wider">{isAr ? 'EN' : 'عربي'}</span>
    </button>
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

            {/* WhatsApp, Rating & Language */}
            <div className="flex items-center justify-end gap-2">
              {renderLanguageButton()}

              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-400/40 transition-all duration-200 active:scale-95 shadow-xs"
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
            <div className="flex items-center justify-center gap-2 mb-1.5 opacity-80 select-none">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-[10px] tracking-widest font-serif text-amber-300 font-bold px-2">✦ MAISON DE FLEURS ✦</span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50 drop-shadow-md leading-tight">
              {shopName}
            </h1>
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

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-50 font-serif leading-tight mt-2.5">
              {shopName}
            </h1>

            <div className="flex items-center justify-center gap-2 mt-2.5 flex-wrap text-xs">
              {renderLanguageButton()}

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
            </div>
          </div>

          <div className="w-full pt-1 relative z-10">
            {renderSearchCapsule()}
          </div>
        </div>
      ) : (
        /* STYLE 3: SIGNATURE ULTRA-LUXURY ATELIER CARD (DEFAULT) */
        <div
          className="relative p-5 sm:p-7 shadow-[0_24px_60px_-12px_rgba(28,25,23,0.08),0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-4.5 transition-all duration-300 overflow-hidden rounded-[30px] sm:rounded-[36px] border border-amber-900/10 dark:border-amber-500/20 bg-gradient-to-b from-white via-[#FCFBF9] to-[#F5F2EA] dark:from-[#18181B] dark:via-[#141416] dark:to-[#0F0F11] backdrop-blur-2xl group ring-1 ring-black/[0.02]"
        >
          {/* Subtle Top Gold Hairline & Warm Champagne Glow */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.07),transparent_70%)] pointer-events-none" />

          {/* 1. TOP ROW: Store Royal Crest on Right | Concierge WhatsApp & Rating on Left */}
          <div className="flex items-center justify-between w-full relative z-10 gap-3">
            <div className="flex items-center">
              {renderAvatarButton('w-12 h-12 sm:w-14 sm:h-14')}
            </div>

            {/* Left Actions: Concierge WhatsApp, Rating & Language */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              {renderLanguageButton()}

              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noreferrer"
                aria-label={isAr ? 'واتساب المنسق' : 'WhatsApp Concierge'}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-950 via-[#022C22] to-emerald-950 hover:from-emerald-900 hover:to-[#044133] text-emerald-100 hover:text-white border border-emerald-500/40 transition-all duration-200 active:scale-95 shadow-[0_2px_12px_rgba(2,44,34,0.22)]"
                title={isAr ? 'تواصل فوري مع منسق الزهور' : 'Private Florist Concierge'}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                <span className="text-[11px] font-bold tracking-wide">{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 text-amber-950 dark:text-amber-200 border border-amber-400/35 shadow-2xs whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0 drop-shadow-[0_1px_2px_rgba(212,175,55,0.3)]" />
                <span className="font-black text-[12px] tracking-tight">4.9 ★</span>
              </span>
            </div>
          </div>

          {/* 2. MAISON BRAND IDENTITY: HIGH-FASHION CENTERPIECE */}
          <div className="w-full py-2 relative z-10 flex flex-col items-center justify-center text-center">
            {/* Elegant Ornamental Hallmark */}
            <div className="flex items-center justify-center gap-3 mb-1.5 opacity-80 select-none">
              <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-amber-400/70 to-amber-400" />
              <span className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-400 font-serif tracking-[0.22em] uppercase font-bold">✦ MAISON DE FLEURS • ATELIER ✦</span>
              <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent via-amber-400/70 to-amber-400" />
            </div>

            {/* Majestic Title */}
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight select-text text-stone-900 dark:text-stone-50 leading-tight py-0.5">
              {shopName}
            </h1>

            {/* Subtle Royal Accent Line */}
            <div className="flex items-center justify-center gap-1.5 mt-2 mb-0.5 opacity-60 select-none">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-amber-400/80" />
              <span className="text-[9px] text-amber-500 font-serif">✦</span>
              <span className="h-px w-6 bg-gradient-to-l from-transparent to-amber-400/80" />
            </div>
          </div>

          {/* 3. SEARCH CAPSULE */}
          <div className="w-full pt-0.5 relative z-10">
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
