import React, { useState } from 'react';
import { Plus, Check, MessageCircle, Heart, Clock, SlidersHorizontal } from 'lucide-react';
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

  // Determine badge config with strict restraint (no badge clutter on every single card)
  const getBadgeConfig = () => {
    if (product.badge && typeof product.badge === 'string' && product.badge.trim() !== '') {
      return {
        text: product.badge.trim(),
        icon: null,
        className: 'bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700 shadow-2xs font-bold',
      };
    }
    if (product.isOneTimeSpecial) {
      return {
        text: isAr ? 'قطعة واحدة فقط' : '1 Piece Only',
        icon: null,
        className: 'bg-stone-900/90 text-white backdrop-blur-md shadow-2xs font-bold border border-white/20',
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
        className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative active:scale-98 animate-card-entrance"
        style={{
          animationDelay: `${(index % 8) * 0.045}s`,
        }}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={product.image}
            alt={isAr ? product.titleAr : product.titleEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index < 2 ? 'high' : 'auto'}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = './images/products/royal-red-roses.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Top-Right: Category Tag */}
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 border border-stone-200/90 dark:border-stone-700 shadow-md">
              {isAr ? product.tagAr : product.tagEn}
            </span>
          </div>

          {/* Top-Left: Heart Toggle */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label="Add to favorites"
            className={`absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/60 dark:border-stone-700 transition-all duration-200 active:scale-90 ${
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
            <h3 className="font-bold text-sm leading-snug text-stone-900 dark:text-stone-100 line-clamp-2 min-h-[2.75rem]">
              {isAr ? product.titleAr : product.titleEn}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate font-medium mt-0.5">
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
            className="w-full py-2 px-3 bg-[var(--accent-primary,#123524)] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-1.5 rounded-full transition-all active:scale-95 shadow-xs"
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
      className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer overflow-hidden relative active:scale-[0.98] animate-card-entrance rounded-[22px]"
      style={{
        borderRadius: `${cardRadius || 22}px`,
        animationDelay: `${(index % 8) * 0.045}s`,
      }}
    >
      {/* 4:5 Aspect Ratio Image with Strict Corner Separation */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={product.image}
          alt={isAr ? product.titleAr : product.titleEn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading={index < 6 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={index < 2 ? 'high' : 'auto'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = './images/products/royal-red-roses.jpg';
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

        {/* 1. TOP-RIGHT CORNER: Status Badge with Mobile Safe Max-Width */}
        {badgeConfig && (
          <div className="absolute top-2 right-2 z-10 pointer-events-none max-w-[calc(100%-2.2rem)]">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md shadow-xs truncate ${badgeConfig.className}`}
            >
              {badgeConfig.icon}
              <span className="leading-none tracking-tight truncate">{badgeConfig.text}</span>
            </span>
          </div>
        )}

        {/* 2. TOP-LEFT CORNER: Reserved Exclusively for Heart Favorite Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isAr ? 'إضافة إلى المفضلة' : 'Add to favorites'}
          className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-md flex items-center justify-center shadow-xs border border-white/60 dark:border-stone-700 transition-all duration-200 active:scale-90 shrink-0 ${
            heartPop ? 'scale-125' : 'scale-100'
          } ${isFavorite ? 'text-rose-600' : 'text-stone-500 dark:text-stone-400 hover:text-rose-600'}`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite ? 'fill-[#BE123C] text-[#BE123C]' : 'stroke-[2]'
            }`}
          />
        </button>
      </div>

      {/* Card Content & Unified Responsive Footer */}
      <div className="flex flex-col justify-between flex-1 p-3 pt-2.5 pb-3 gap-2">
        {/* Title: Exactly 2 lines max with uniform height */}
        <h3
          className="line-clamp-2 min-h-[2.4rem] text-xs sm:text-sm font-bold leading-snug text-stone-900 dark:text-stone-100 transition-colors duration-200"
          style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
        >
          {isAr ? product.titleAr : product.titleEn}
        </h3>

        {/* Unified Bottom Bar: Prices on Right, + Add Button on Left (Zero Wrap on Mobile) */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-stone-100 dark:border-stone-800 gap-1">
          {/* Right Side: Consistent Price Row */}
          <div className="flex flex-col items-start leading-none min-w-0">
            {product.originalPrice && (
              <span className="text-[10px] text-stone-400 line-through mb-0.5">
                {product.originalPrice}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span
                className="text-sm font-extrabold text-[var(--accent-primary,#123524)] dark:text-emerald-400 tracking-tight"
                style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
              >
                {product.price}
              </span>
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                {strings.sar}
              </span>
            </div>
          </div>

          {/* Left Side: Unified "+ Add" Button with Tactile Feedback & Spring Morph */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white transition-all duration-200 active:scale-90 shadow-xs cursor-pointer shrink-0 ${
              isMorphed
                ? 'bg-emerald-600 scale-102 ring-2 ring-emerald-300'
                : 'bg-[var(--accent-primary,#123524)] hover:opacity-90'
            }`}
            aria-label={isAr ? `أضف ${product.titleAr}` : `Add ${product.titleEn}`}
          >
            {isMorphed ? (
              <>
                <Check className="w-3 h-3 stroke-[3] animate-bounce" />
                <span className="whitespace-nowrap font-bold text-[11px]">
                  {isAr ? '✓ أُضيف' : 'Added!'}
                </span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span className="whitespace-nowrap font-bold text-[11px]">
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
