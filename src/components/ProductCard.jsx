import React, { useState } from 'react';
import { Plus, Check, MessageCircle, Heart, Clock, Sparkles, SlidersHorizontal } from 'lucide-react';
import { THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';
import { useStoreTheme } from '../context/StoreThemeContext';

// Helper to convert standard digits to Eastern Arabic numerals for luxury typography
const toArabicDigits = (num) => {
  if (num === null || num === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[d]);
};

function ProductCard({
  product,
  index = 0,
  isPortfolio = false,
  onSelectProduct,
  onRequestPortfolio,
  lang = 'ar',
  _themeTokens = THEME_TOKENS.botanical,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  let storeThemeCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeThemeCtx = useStoreTheme();
  } catch {
    // fallback if outside provider
  }
  const rawStudio = storeThemeCtx?.rawConfig || storeThemeCtx?.config;
  const legacyConfig = storeThemeCtx?.legacyConfig || storeThemeCtx?.config;

  const cardRadius = rawStudio?.cardBorderRadius ?? legacyConfig?.catalog?.cardRadius ?? 20;

  // Local state for heart favorite with localStorage persistence
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('flowerhub_favorites') || '[]');
      return Array.isArray(favs) && favs.includes(product.id);
    } catch {
      return false;
    }
  });

  const [heartPop, setHeartPop] = useState(false);
  const [isMorphed, setIsMorphed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 380);

    setIsFavorite((prev) => {
      const next = !prev;
      try {
        const favs = JSON.parse(localStorage.getItem('flowerhub_favorites') || '[]');
        const updated = next
          ? [...new Set([...(Array.isArray(favs) ? favs : []), product.id])]
          : (Array.isArray(favs) ? favs : []).filter((id) => id !== product.id);
        localStorage.setItem('flowerhub_favorites', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsMorphed(true);
    setTimeout(() => setIsMorphed(false), 1200);

    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Determine badge config with strict check to prevent empty badges
  const getBadgeConfig = () => {
    if (product.badge && typeof product.badge === 'string' && product.badge.trim() !== '') {
      return {
        text: product.badge.trim(),
        icon: <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />,
        className: 'bg-stone-900/85 backdrop-blur-md text-white border border-white/20 shadow-xs',
      };
    }
    if (product.isOneTimeSpecial) {
      return {
        text: strings.oneTimeBadge || 'قطعة واحدة فقط',
        icon: <Sparkles className="w-2.5 h-2.5 text-rose-700 shrink-0" />,
        className: 'bg-rose-500/15 backdrop-blur-md text-rose-950 border border-rose-300/40 shadow-xs',
      };
    }
    if (product.isReadyNow) {
      return {
        text: strings.readyNowBadge || 'جاهز الآن',
        icon: <Clock className="w-2.5 h-2.5 text-amber-700 shrink-0" />,
        className: 'bg-amber-500/15 backdrop-blur-md text-amber-950 border border-amber-300/40 shadow-xs',
      };
    }
    if (product.type === 'editable' || product.allowCustomColors || product.allowCustomText) {
      return {
        text: strings.customizableBadge || 'قابل للتخصيص',
        icon: <SlidersHorizontal className="w-2.5 h-2.5 text-emerald-800 shrink-0" />,
        className: 'bg-emerald-600/15 backdrop-blur-md text-emerald-950 border border-emerald-400/40 shadow-xs',
      };
    }
    return null;
  };

  const badgeConfig = getBadgeConfig();

  // Portfolio Item Style
  if (isPortfolio) {
    return (
      <div
        onClick={() => onRequestPortfolio && onRequestPortfolio(product)}
        className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative active:scale-98 animate-card-entrance"
        style={{
          animationDelay: `${(index % 8) * 0.045}s`,
        }}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
          {/* Skeleton Shimmer while loading */}
          <div
            className={`absolute inset-0 bg-stone-200/50 animate-shimmer transition-opacity duration-300 pointer-events-none ${
              imgLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <img
            src={product.image}
            alt={isAr ? product.titleAr : product.titleEn}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${
              imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Top-Right: Category Tag */}
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
              {isAr ? product.tagAr : product.tagEn}
            </span>
          </div>

          {/* Top-Left: Heart Toggle */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label="Add to favorites"
            className={`absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/60 transition-all duration-200 active:scale-90 ${
              heartPop ? 'scale-125' : 'scale-100'
            } ${isFavorite ? 'text-rose-600' : 'text-stone-500 hover:text-rose-600'}`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-[#BE123C] text-[#BE123C]' : 'stroke-[2]'
              }`}
            />
          </button>
        </div>

        <div className="p-3 flex flex-col justify-between flex-1 gap-2">
          <div>
            <h3 className="font-bold text-sm leading-snug text-stone-900 line-clamp-2 min-h-[2.75rem]">
              {isAr ? product.titleAr : product.titleEn}
            </h3>
            <p className="text-xs text-stone-500 truncate font-medium mt-0.5">
              {isAr ? product.venueAr : product.venueEn}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onRequestPortfolio) {
                onRequestPortfolio(product);
              }
            }}
            className="w-full py-2 px-3 bg-[var(--accent-primary,#123524)] hover:opacity-90 text-white font-medium text-xs flex items-center justify-center gap-1.5 rounded-full transition-all active:scale-95 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{strings.requestSimilar}</span>
          </button>
        </div>
      </div>
    );
  }

  // Standard Product Catalog Card
  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="bg-white border border-neutral-100/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer overflow-hidden relative active:scale-[0.98] animate-card-entrance"
      style={{
        borderRadius: `${cardRadius}px`,
        animationDelay: `${(index % 8) * 0.045}s`,
      }}
    >
      {/* 4:5 Aspect Ratio Image with Strict Corner Separation */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        {/* Skeleton Shimmer while loading */}
        <div
          className={`absolute inset-0 bg-stone-200/50 animate-shimmer transition-opacity duration-300 pointer-events-none ${
            imgLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        <img
          src={product.image}
          alt={isAr ? product.titleAr : product.titleEn}
          className={`w-full h-full object-cover group-hover:scale-104 transition-all duration-500 ease-out ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          loading={index < 4 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={index === 0 ? 'high' : 'auto'}
          onLoad={() => setImgLoaded(true)}
        />

        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* 1. TOP-RIGHT CORNER (top-2.5 right-2.5): Reserved Exclusively for Status Badge */}
        {badgeConfig && (
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs ${badgeConfig.className}`}
            >
              {badgeConfig.icon}
              <span className="leading-none">{badgeConfig.text}</span>
            </span>
          </div>
        )}

        {/* 2. TOP-LEFT CORNER (top-2.5 left-2.5): Reserved Exclusively for Heart Favorite Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isAr ? 'إضافة إلى المفضلة' : 'Add to favorites'}
          className={`absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/60 transition-all duration-200 active:scale-90 ${
            heartPop ? 'scale-125' : 'scale-100'
          } ${isFavorite ? 'text-rose-600' : 'text-stone-500 hover:text-rose-600'}`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-[#BE123C] text-[#BE123C]' : 'stroke-[2]'
            }`}
          />
        </button>
      </div>

      {/* Card Content & Unified Footer */}
      <div className="flex flex-col justify-between flex-1 p-3 gap-2">
        {/* Title: Exactly 2 lines max with uniform height */}
        <h3
          className="line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-stone-900 transition-colors duration-200"
          style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
        >
          {isAr ? product.titleAr : product.titleEn}
        </h3>

        {/* Unified Bottom Bar: Prices on Right, + Add Button on Left */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-stone-100 gap-1.5">
          {/* Right Side: Consistent Price Row */}
          <div className="flex flex-col items-start leading-none min-w-0">
            {product.originalPrice && (
              <span className="text-[11px] text-stone-400 line-through mb-0.5">
                {isAr ? toArabicDigits(product.originalPrice) : product.originalPrice}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span
                className="text-base font-extrabold text-[var(--accent-primary,#123524)] tracking-tight"
                style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
              >
                {isAr ? toArabicDigits(product.price) : product.price}
              </span>
              <span className="text-[11px] font-semibold text-stone-500">
                {strings.sar}
              </span>
            </div>
          </div>

          {/* Left Side: Unified "+ Add" Button with Tactile Feedback & Spring Morph */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium text-white transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
              isMorphed
                ? 'bg-emerald-600 scale-102 ring-2 ring-emerald-300'
                : 'bg-[var(--accent-primary,#123524)] hover:opacity-90'
            }`}
            aria-label={isAr ? `أضف ${product.titleAr}` : `Add ${product.titleEn}`}
          >
            {isMorphed ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
                <span className="whitespace-nowrap font-bold text-xs">
                  {isAr ? '✓ تمت الإضافة' : 'Added!'}
                </span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="whitespace-nowrap font-medium text-xs">
                  {isAr ? '+ أضف' : '+ Add'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductCard);
