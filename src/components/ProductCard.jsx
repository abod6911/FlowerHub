import React, { useState, useRef } from 'react';
import { Plus, Check, MessageCircle, Heart, Clock, Sparkles, SlidersHorizontal } from 'lucide-react';
import { THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';
import { useStudioStore } from '../context/StudioThemeContext';

// Helper to convert standard digits to Eastern Arabic numerals for luxury typography
const toArabicDigits = (num) => {
  if (num === null || num === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[d]);
};

export default function ProductCard({
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

  let studioStore = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    studioStore = useStudioStore();
  } catch {
    // outside provider fallback
  }

  const rawConfig = studioStore?.config;
  const cardLayout = rawConfig?.cardLayout || 'grid_compact'; // 'grid_compact' | 'grid_large' | 'list_classic'
  const cardRadius = rawConfig?.cardBorderRadius ?? 22;
  const cardHoverEffect = rawConfig?.cardHoverEffect || 'zoom_soft';

  // State for buy button physics micro-interaction
  const [isAdded, setIsAdded] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  // 3D Tilt Ref & State
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e) => {
    if (cardHoverEffect !== 'tilt_3d' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / (rect.height / 2)) * 6,
      ry: (x / (rect.width / 2)) * 6,
    });
  };

  const handleMouseLeave = () => {
    if (cardHoverEffect === 'tilt_3d') {
      setTilt({ rx: 0, ry: 0 });
    }
  };

  // Local state for heart favorite with localStorage persistence
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('flowerhub_favorites') || '[]');
      return Array.isArray(favs) && favs.includes(product.id);
    } catch {
      return false;
    }
  });

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
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
    setIsAdded(true);
    setShowRipple(true);
    setTimeout(() => {
      setIsAdded(false);
      setShowRipple(false);
    }, 1200);

    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Badge determination
  let badgeConfig = null;
  if (product.isOneTimeSpecial) {
    badgeConfig = {
      text: strings.oneTimeBadge || 'قطعة واحدة فقط',
      icon: <Sparkles className="w-3 h-3 text-rose-700 shrink-0" />,
      className: 'bg-rose-50/90 text-rose-950 border border-rose-200/60 shadow-2xs',
    };
  } else if (product.isReadyNow) {
    badgeConfig = {
      text: strings.readyNowBadge || 'جاهز الآن',
      icon: <Clock className="w-3 h-3 text-amber-700 shrink-0" />,
      className: 'bg-amber-50/90 text-amber-950 border border-amber-200/60 shadow-2xs',
    };
  } else if (product.type === 'editable' || product.allowCustomColors || product.allowCustomText) {
    badgeConfig = {
      text: strings.customizableBadge || 'قابل للتخصيص',
      icon: <SlidersHorizontal className="w-3 h-3 text-emerald-800 shrink-0" />,
      className: 'bg-emerald-50/90 text-emerald-950 border border-emerald-200/60 shadow-2xs',
    };
  }

  // Animation delay for staggered entrance
  const entranceDelay = `${Math.min(index * 0.05, 0.4)}s`;

  const tiltStyle =
    cardHoverEffect === 'tilt_3d'
      ? {
          transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: tilt.rx === 0 && tilt.ry === 0 ? 'transform 0.4s ease-out' : 'none',
        }
      : {};

  // =========================================================================
  // CASE 1: PORTFOLIO ARCHIVE ITEM
  // =========================================================================
  if (isPortfolio) {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (onRequestPortfolio) onRequestPortfolio(product);
        }}
        className="bg-white border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer overflow-hidden relative"
        style={{
          borderRadius: `${cardRadius}px`,
          animation: 'cardFadeUp 0.45s ease-out both',
          animationDelay: entranceDelay,
          ...tiltStyle,
        }}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={isAr ? product.titleAr : product.titleEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute top-3 start-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/85 backdrop-blur-md text-stone-900 border border-white/60 shadow-2xs">
              {isAr ? 'قطعة أرشيفية' : 'Archive'}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between flex-1 gap-2.5">
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-snug text-stone-900 line-clamp-2">
              {isAr ? product.titleAr : product.titleEn}
            </h3>
            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
              {isAr ? product.venueAr : product.venueEn}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onRequestPortfolio) onRequestPortfolio(product);
            }}
            className="w-full py-2 px-3.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center gap-2 rounded-full transition-all active:scale-98 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{strings.requestSimilar}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: CLASSIC HORIZONTAL LIST LAYOUT (list_classic)
  // =========================================================================
  if (cardLayout === 'list_classic') {
    return (
      <div
        ref={cardRef}
        onClick={() => onSelectProduct && onSelectProduct(product)}
        className="w-full bg-white border border-stone-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex items-stretch p-3 sm:p-4 gap-3 sm:gap-4 group cursor-pointer overflow-hidden relative"
        style={{
          borderRadius: `${cardRadius}px`,
          animation: 'cardFadeUp 0.45s ease-out both',
          animationDelay: entranceDelay,
        }}
      >
        {/* Aspect 4:5 Thumbnail with Zoom */}
        <div className="relative w-28 sm:w-36 aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 shrink-0">
          <img
            src={product.image}
            alt={isAr ? product.titleAr : product.titleEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading={index < 4 ? 'eager' : 'lazy'}
          />

          {badgeConfig && (
            <div className="absolute top-2 start-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold backdrop-blur-md ${badgeConfig.className}`}>
                {badgeConfig.icon}
                <span className="hidden sm:inline">{badgeConfig.text}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm sm:text-base leading-snug text-stone-900 line-clamp-2">
                {isAr ? product.titleAr : product.titleEn}
              </h3>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-stone-400 hover:text-rose-600 transition-colors"
                aria-label="Favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>
            </div>
            {product.descAr && (
              <p className="text-xs text-stone-500 line-clamp-1 hidden sm:block">
                {isAr ? product.descAr : product.descEn}
              </p>
            )}
          </div>

          {/* Pricing & Action Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
            {/* Price on Start (Right in RTL) */}
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold font-serif text-[var(--accent-primary,#123524)] tracking-tight">
                {isAr ? toArabicDigits(product.price) : product.price}
              </span>
              <span className="text-[11px] font-semibold text-stone-500">
                {strings.sar}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] line-through text-stone-400 ms-1">
                  {isAr ? toArabicDigits(product.originalPrice) : product.originalPrice}
                </span>
              )}
            </div>

            {/* Buy Capsule Button on End (Left in RTL) */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold shadow-xs transition-all active:scale-95 ${
                isAdded ? 'bg-emerald-600' : 'bg-[var(--accent-primary,#123524)] hover:opacity-90'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isAr ? 'تمت!' : 'Done'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isAr ? 'أضف للسلة' : 'Add to Bag'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 3 & 4: COMPACT GRID OR LARGE SHOWCASE (grid_compact | grid_large)
  // =========================================================================
  const isLarge = cardLayout === 'grid_large';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className={`bg-white border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer overflow-hidden relative ${
        isLarge ? 'p-1' : ''
      }`}
      style={{
        borderRadius: `${cardRadius}px`,
        animation: 'cardFadeUp 0.45s ease-out both',
        animationDelay: entranceDelay,
        ...tiltStyle,
      }}
    >
      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rippleWave {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Ripple Animation Overlay on Buy */}
      {showRipple && (
        <span
          className="absolute inset-0 pointer-events-none bg-[var(--accent-primary,#123524)]/10 z-20"
          style={{ animation: 'rippleWave 0.6s ease-out forwards' }}
        />
      )}

      {/* 4:5 Aspect Ratio Photo Container with Slow Smooth Zoom */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 rounded-t-[calc(var(--radius-card,22px)-2px)]">
        <img
          src={product.image}
          alt={isAr ? product.titleAr : product.titleEn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading={index < 4 ? 'eager' : 'lazy'}
          decoding="async"
        />

        {/* Soft bottom vignette shadow */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Top-Start (Right in RTL): Status Badge in Glass Capsule */}
        {badgeConfig && (
          <div className="absolute top-2.5 start-2.5 z-10 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md ${badgeConfig.className}`}
            >
              {badgeConfig.icon}
              <span>{badgeConfig.text}</span>
            </span>
          </div>
        )}

        {/* Top-End (Left in RTL): Favorite Heart Button in Semi-transparent Glass */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label="Add to favorites"
          className={`absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs backdrop-blur-md border border-white/50 ${
            isFavorite
              ? 'bg-white/95 text-rose-600 scale-105 shadow-sm'
              : 'bg-white/75 text-stone-600 hover:text-rose-600 hover:bg-white hover:scale-105'
          } active:scale-125 cursor-pointer`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-rose-600 text-rose-600' : 'stroke-[1.8]'
            }`}
          />
        </button>
      </div>

      {/* Bottom Information Area */}
      <div className={`p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-3`}>
        {/* Product Title (Max 2 Lines with comfortable whitespace) */}
        <div>
          <h3
            className={`font-bold leading-snug text-stone-900 transition-colors duration-200 line-clamp-2 ${
              isLarge ? 'text-base sm:text-lg min-h-[3rem]' : 'text-xs sm:text-sm min-h-[2.5rem]'
            }`}
            style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
          >
            {isAr ? product.titleAr : product.titleEn}
          </h3>

          {isLarge && product.descAr && (
            <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-light">
              {isAr ? product.descAr : product.descEn}
            </p>
          )}
        </div>

        {/* Bottom Bar: Final Price on Right, Add to Bag Capsule on Left */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-stone-100">
          {/* Final Price Container */}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span
              className={`font-bold tracking-tight text-[var(--accent-primary,#123524)] ${
                isLarge ? 'text-lg sm:text-xl font-serif' : 'text-base sm:text-lg font-serif'
              }`}
            >
              {isAr ? toArabicDigits(product.price) : product.price}
            </span>
            <span className="text-[11px] font-semibold text-stone-500">
              {strings.sar}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-[11px] line-through text-stone-400 ms-1 font-normal">
                {isAr ? toArabicDigits(product.originalPrice) : product.originalPrice}
              </span>
            )}
          </div>

          {/* Interactive (+ أضف للسلة) Capsule Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 group/btn cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 ring-2 ring-emerald-300'
                : 'bg-[var(--accent-primary,#123524)] hover:opacity-90'
            }`}
            aria-label={isAr ? `أضف ${product.titleAr}` : `Add ${product.titleEn}`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
                <span className="font-semibold text-[11px]">{isAr ? 'تمت!' : 'Added'}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 group-hover/btn:rotate-90 shrink-0" />
                <span className="whitespace-nowrap font-medium text-[11px] sm:text-xs">
                  {isAr ? 'أضف للسلة' : 'Add to Bag'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
