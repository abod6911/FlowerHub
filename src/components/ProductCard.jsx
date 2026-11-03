import React, { useState, useRef } from 'react';
import { Plus, Check, MessageCircle, Heart, Clock, Sparkles, SlidersHorizontal } from 'lucide-react';
import { THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';
import { useStoreTheme } from '../context/StoreThemeContext';
import { Float } from './fancy/float';

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

  // Read centralized live studio configuration
  let storeThemeCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeThemeCtx = useStoreTheme();
  } catch {
    // fallback if outside provider
  }
  const rawStudio = storeThemeCtx?.rawConfig || storeThemeCtx?.config;
  const legacyConfig = storeThemeCtx?.legacyConfig || storeThemeCtx?.config;

  const catalogConfig = {
    cardRadius: rawStudio?.cardBorderRadius ?? legacyConfig?.catalog?.cardRadius ?? 22,
    shadowIntensity: rawStudio?.cardShadow ?? legacyConfig?.catalog?.shadowIntensity ?? 'soft',
    titleDisplay: (rawStudio?.fullTitleWrap !== undefined ? rawStudio.fullTitleWrap : (legacyConfig?.catalog?.titleDisplay !== 'truncate')) ? 'wrap' : 'truncate',
    buyButtonStyle: rawStudio?.buyButtonStyle === 'pill_add' ? 'capsule' : rawStudio?.buyButtonStyle === 'circle_plus' ? 'circle' : rawStudio?.buyButtonStyle === 'full_width' ? 'full' : (legacyConfig?.catalog?.buyButtonStyle || 'capsule'),
    showBadges: rawStudio?.showBadges !== undefined ? rawStudio.showBadges : (legacyConfig?.catalog?.showBadges !== false),
    badgeStyle: rawStudio?.badgeStyle === 'solid_pastel' ? 'solid' : (legacyConfig?.catalog?.badgeStyle || 'glassmorphism'),
    showFavorites: rawStudio?.showFavoriteButton !== undefined ? rawStudio.showFavoriteButton : (legacyConfig?.catalog?.showFavorites !== false),
  };
  const animConfig = {
    cardEntrance: rawStudio?.cardEntranceMotion ?? legacyConfig?.animations?.cardEntrance ?? 'fade_up',
    staggerDelay: rawStudio?.staggerDelay ?? legacyConfig?.animations?.staggerDelay ?? 0.08,
    addToCartPhysics: rawStudio?.buyButtonPhysics === 'morph_checkmark' ? 'morph' : rawStudio?.buyButtonPhysics === 'ripple_wave' ? 'ripple' : (legacyConfig?.animations?.addToCartPhysics || 'morph'),
    cardHoverEffect: rawStudio?.cardHoverEffect === 'zoom_soft' ? 'zoom' : rawStudio?.cardHoverEffect === 'tilt_3d' ? 'tilt' : rawStudio?.cardHoverEffect === 'gold_glow' ? 'glow' : (legacyConfig?.animations?.cardHoverEffect || 'zoom'),
  };

  // 3D Perspective Tilt on Card Hover
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isMorphed, setIsMorphed] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  const handleMouseMove = (e) => {
    if (animConfig.cardHoverEffect !== 'tilt' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / (rect.height / 2)) * 6,
      ry: (x / (rect.width / 2)) * 6,
    });
  };

  const handleMouseLeave = () => {
    if (animConfig.cardHoverEffect === 'tilt') {
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

  // Add-to-cart click handler with configurable physics
  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (animConfig.addToCartPhysics === 'morph') {
      setIsMorphed(true);
      setTimeout(() => setIsMorphed(false), 1400);
    } else if (animConfig.addToCartPhysics === 'ripple') {
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 800);
    }

    onSelectProduct(product);
  };

  // Determine badge styling based on badgeStyle ('glassmorphism' vs 'solid')
  const isSolid = catalogConfig.badgeStyle === 'solid';
  let badgeConfig = null;
  if (product.isOneTimeSpecial) {
    badgeConfig = {
      text: strings.oneTimeBadge || 'قطعة واحدة فقط',
      icon: <Sparkles className="w-3 h-3 text-rose-700 shrink-0" />,
      className: isSolid
        ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-xs'
        : 'bg-rose-500/15 backdrop-blur-md text-rose-950 border border-rose-300/40 shadow-xs',
    };
  } else if (product.isReadyNow) {
    badgeConfig = {
      text: strings.readyNowBadge || 'جاهز الآن',
      icon: <Clock className="w-3 h-3 text-amber-700 shrink-0" />,
      className: isSolid
        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
        : 'bg-amber-500/15 backdrop-blur-md text-amber-950 border border-amber-300/40 shadow-xs',
    };
  } else if (product.type === 'editable' || product.allowCustomColors || product.allowCustomText) {
    badgeConfig = {
      text: strings.customizableBadge || 'قابل للتخصيص',
      icon: <SlidersHorizontal className="w-3 h-3 text-emerald-800 shrink-0" />,
      className: isSolid
        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
        : 'bg-emerald-600/15 backdrop-blur-md text-emerald-950 border border-emerald-400/40 shadow-xs',
    };
  }

  // Shadow class mapping
  const shadowClass =
    catalogConfig.shadowIntensity === 'none'
      ? 'shadow-none'
      : catalogConfig.shadowIntensity === 'medium'
      ? 'shadow-md hover:shadow-xl'
      : catalogConfig.shadowIntensity === 'elevated'
      ? 'shadow-lg hover:shadow-2xl'
      : 'shadow-xs hover:shadow-md';

  // Hover effect class
  const hoverClass =
    animConfig.cardHoverEffect === 'glow'
      ? 'hover:ring-2 hover:ring-[var(--accent-gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)]'
      : animConfig.cardHoverEffect === 'zoom'
      ? 'hover:-translate-y-1'
      : '';

  // Entrance animation style: Render INSTANTLY with 0 delay (no hidden opacity: 0)
  const entranceStyle = {};

  const tiltStyle =
    animConfig.cardHoverEffect === 'tilt'
      ? {
          transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: tilt.rx === 0 && tilt.ry === 0 ? 'transform 0.4s ease-out' : 'none',
        }
      : {};

  // Portfolio items (Our Past Work)
  if (isPortfolio) {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`bg-white border border-neutral-100 ${shadowClass} ${hoverClass} transition-all duration-300 flex flex-col justify-between group cursor-pointer overflow-hidden relative`}
        style={{
          borderRadius: `${catalogConfig.cardRadius}px`,
          ...entranceStyle,
          ...tiltStyle,
        }}
        onClick={() => onRequestPortfolio(product)}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={isAr ? product.titleAr : product.titleEn}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {catalogConfig.showBadges && (
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <Float
                speed={0.4}
                amplitude={[4, 8, 5]}
                rotationRange={[3, 3, 2]}
                timeOffset={(index * 0.4) % 3}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-neutral-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
                  {isAr ? product.tagAr : product.tagEn}
                </span>
              </Float>
            </div>
          )}

          {catalogConfig.showFavorites && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label="Add to favorites"
              className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs backdrop-blur-md border border-white/60 ${
                isFavorite
                  ? 'bg-white/95 text-[#BE123C] scale-105 shadow-sm'
                  : 'bg-white/75 text-neutral-600 hover:text-[#BE123C] hover:bg-white hover:scale-105'
              } active:scale-125`}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'fill-[#BE123C] text-[#BE123C]' : 'stroke-[1.8]'
                }`}
              />
            </button>
          )}
        </div>

        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
          <div>
            <h3
              className={`font-bold text-sm sm:text-base leading-snug text-[var(--text-main,#1A1A1A)] transition-colors duration-200 ${
                catalogConfig.titleDisplay === 'truncate' ? 'truncate h-6' : 'min-h-[2.75rem] line-clamp-2'
              }`}
              style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
            >
              {isAr ? product.titleAr : product.titleEn}
            </h3>
            <p className="text-xs mt-1 text-[var(--text-muted,#78716C)] truncate font-medium">
              {isAr ? product.venueAr : product.venueEn}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestPortfolio(product);
            }}
            className="w-full py-2.5 px-3.5 bg-[var(--accent-primary,#123524)] hover:opacity-90 text-white font-medium text-xs flex items-center justify-center gap-2 rounded-full transition-all active:scale-98 shadow-xs hover:shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{strings.requestSimilar}</span>
          </button>
        </div>
      </div>
    );
  }

  // Regular Catalog Item
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectProduct(product)}
      className={`bg-white border border-neutral-100 ${shadowClass} ${hoverClass} transition-all duration-300 flex flex-col justify-between group cursor-pointer overflow-hidden relative`}
      style={{
        borderRadius: `${catalogConfig.cardRadius}px`,
        ...entranceStyle,
        ...tiltStyle,
      }}
    >
      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardElastic {
          0% { opacity: 0; transform: scale(0.9); }
          60% { opacity: 1; transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cardSlide {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes rippleWave {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Ripple Animation Overlay on Buy */}
      {showRipple && (
        <span
          className="absolute inset-0 pointer-events-none rounded-inherit bg-[var(--accent-primary,#123524)]/10 z-20"
          style={{ animation: 'rippleWave 0.6s ease-out forwards' }}
        />
      )}

      {/* 4:5 Tall Portrait Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={isAr ? product.titleAr : product.titleEn}
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
        />

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

        {/* Top-Left: Clean Glassmorphic Badge */}
        {catalogConfig.showBadges && badgeConfig && (
          <div className="absolute top-2.5 start-2.5 z-10 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeConfig.className}`}
            >
              {badgeConfig.icon}
              <span>{badgeConfig.text}</span>
            </span>
          </div>
        )}

        {/* Top-Right: Heart Favorite Toggle */}
        {catalogConfig.showFavorites && (
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label="Add to favorites"
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs backdrop-blur-md border border-white/60 ${
              isFavorite
                ? 'bg-white/95 text-[#BE123C] scale-105 shadow-sm'
                : 'bg-white/75 text-neutral-600 hover:text-[#BE123C] hover:bg-white hover:scale-105'
            } active:scale-125`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-[#BE123C] text-[#BE123C]' : 'stroke-[1.8]'
              }`}
            />
          </button>
        )}
      </div>

      {/* Card Content & Footer */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-3">
        {/* Product Title */}
        <h3
          className={`font-bold text-sm sm:text-base leading-snug text-[var(--text-main,#1A1A1A)] transition-colors duration-200 ${
            catalogConfig.titleDisplay === 'truncate' ? 'truncate h-6' : 'min-h-[2.75rem] line-clamp-2'
          }`}
          style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
        >
          {isAr ? product.titleAr : product.titleEn}
        </h3>

        {/* Full Width Bottom Bar Buy Button Style */}
        {catalogConfig.buyButtonStyle === 'full' ? (
          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span
                  className="text-base sm:text-lg font-bold text-[var(--color-price,var(--accent-primary,#123524))] tracking-tight"
                  style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
                >
                  {isAr ? toArabicDigits(product.price) : product.price}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-muted,#78716C)]">
                  {strings.sar}
                </span>
              </div>
              {product.originalPrice && (
                <span className="text-[11px] line-through text-neutral-400 font-normal">
                  {isAr ? toArabicDigits(product.originalPrice) : product.originalPrice} {strings.sar}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-2 px-3 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-xs ${
                isMorphed
                  ? 'bg-emerald-600 scale-102 ring-2 ring-emerald-300'
                  : 'bg-[var(--accent-primary,#123524)] hover:opacity-90'
              }`}
            >
              {isMorphed ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
                  <span>{isAr ? 'تمت الإضافة للسلة!' : 'Added!'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{product.isOneTimeSpecial ? (isAr ? 'أضف للسلة' : 'Add to Cart') : (isAr ? 'أضف' : 'Add')}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Capsule or Circle Buy Button Row */
          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-neutral-100">
            {/* Price Container */}
            <div className="flex items-baseline gap-1 flex-wrap">
              <span
                className="text-base sm:text-lg font-bold text-[var(--color-price,var(--accent-primary,#123524))] tracking-tight"
                style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
              >
                {isAr ? toArabicDigits(product.price) : product.price}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-muted,#78716C)]">
                {strings.sar}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] line-through text-neutral-400 ms-1 font-normal">
                  {isAr ? toArabicDigits(product.originalPrice) : product.originalPrice}
                </span>
              )}
            </div>

            {/* Circular (+) Button Style */}
            {catalogConfig.buyButtonStyle === 'circle' ? (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-xs hover:scale-110 active:scale-95 ${
                  isMorphed
                    ? 'bg-emerald-600 scale-110 ring-2 ring-emerald-300'
                    : 'bg-[var(--accent-primary,#123524)] hover:opacity-90'
                }`}
                aria-label={isAr ? `أضف ${product.titleAr}` : `Add ${product.titleEn}`}
              >
                {isMorphed ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            ) : (
              /* Pill Capsule Style (Default: + أضف) */
              <button
                type="button"
                onClick={handleAddToCart}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 group/btn ${
                  isMorphed
                    ? 'bg-emerald-600 ring-2 ring-emerald-300'
                    : 'bg-[var(--accent-primary,#123524)] hover:opacity-90'
                }`}
                aria-label={isAr ? `أضف ${product.titleAr}` : `Add ${product.titleEn}`}
              >
                {isMorphed ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="font-semibold text-[11px] sm:text-xs">
                      {isAr ? 'تمت!' : 'Done'}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 group-hover/btn:rotate-90 shrink-0" />
                    <span className="whitespace-nowrap font-medium text-[11px] sm:text-xs">
                      {product.isOneTimeSpecial
                        ? (isAr ? 'أضف للسلة' : 'Add to Bag')
                        : (isAr ? 'أضف' : 'Add')}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
