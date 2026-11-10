import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const cardRadius = rawStudio?.cardBorderRadius ?? legacyConfig?.catalog?.cardRadius ?? 22;
  const cardEntranceMotion = rawStudio?.cardEntranceMotion || 'fade_up';
  const staggerDelay = rawStudio?.staggerDelay ?? 0.08;
  const buyButtonPhysics = rawStudio?.buyButtonPhysics || 'morph_checkmark';
  const cardHoverEffect = rawStudio?.cardHoverEffect || 'zoom_soft';
  const cardShadow = rawStudio?.cardShadow || 'soft';
  const buyButtonStyle = rawStudio?.buyButtonStyle || 'pill_add';
  const fullTitleWrap = rawStudio?.fullTitleWrap !== false;
  const showBadges = rawStudio?.showBadges !== false;
  const badgeStyle = rawStudio?.badgeStyle || 'glassmorphic';
  const showFavoriteButton = rawStudio?.showFavoriteButton !== false;

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
  const [ripples, setRipples] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [hapticPop, setHapticPop] = useState(false);
  const [flyingFlower, setFlyingFlower] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (cardHoverEffect !== 'tilt_3d') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({
      x: -py * 8.5,
      y: px * 8.5,
      active: true,
      glareX: ((px + 1) / 2) * 100,
      glareY: ((py + 1) / 2) * 100,
    });
  };

  const handleMouseLeave = () => {
    if (cardHoverEffect === 'tilt_3d') {
      setTilt({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
    }
  };

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

    // Trigger physics
    if (buyButtonPhysics === 'ripple_wave') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const ripId = Date.now();
      setRipples((prev) => [...prev, { id: ripId, x: clickX, y: clickY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripId));
      }, 650);
    } else if (buyButtonPhysics === 'fly_to_cart') {
      setFlyingFlower(true);
      setTimeout(() => setFlyingFlower(false), 800);
    } else if (buyButtonPhysics === 'sparkle_burst') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const newSparkles = Array.from({ length: 7 }, (_, i) => ({
        id: Date.now() + i,
        x: clickX,
        y: clickY,
        dx: (Math.random() - 0.5) * 60,
        dy: -25 - Math.random() * 35,
        scale: 0.8 + Math.random() * 0.5,
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 700);
    } else if (buyButtonPhysics === 'haptic_pop') {
      setHapticPop(true);
      setTimeout(() => setHapticPop(false), 500);
    }

    setIsMorphed(true);
    setTimeout(() => setIsMorphed(false), 1200);

    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Entrance variants based on cardEntranceMotion
  const entranceVariants = {
    fade_up: {
      initial: { opacity: 0, y: 22 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: (index % 10) * staggerDelay },
    },
    elastic_scale: {
      initial: { opacity: 0, scale: 0.7 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: 'spring', damping: 11, stiffness: 170, delay: (index % 10) * staggerDelay },
    },
    slide: {
      initial: { opacity: 0, x: 35 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: (index % 10) * staggerDelay },
    },
    flip_3d: {
      initial: { opacity: 0, rotateX: 25, y: 30 },
      animate: { opacity: 1, rotateX: 0, y: 0 },
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: (index % 10) * staggerDelay },
    },
    blur_in: {
      initial: { opacity: 0, filter: 'blur(8px)', scale: 0.94 },
      animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
      transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1], delay: (index % 10) * staggerDelay },
    },
    pop_bounce: {
      initial: { opacity: 0, scale: 0.6, y: 15 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { type: 'spring', damping: 10, stiffness: 220, delay: (index % 10) * staggerDelay },
    },
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    },
  };

  const currentEntrance = entranceVariants[cardEntranceMotion] || entranceVariants.fade_up;

  // Shadow class
  const shadowClass =
    cardShadow === 'none'
      ? 'shadow-none border border-stone-200/80 dark:border-stone-800'
      : cardShadow === 'medium'
      ? 'shadow-md hover:shadow-lg'
      : cardShadow === 'high'
      ? 'shadow-xl hover:shadow-2xl'
      : 'shadow-[0_4px_18px_-4px_rgba(0,0,0,0.04)] hover:shadow-md';

  // Hover transform and visual classes
  let transformStyle = '';
  let hoverClasses = '';
  if (cardHoverEffect === 'tilt_3d') {
    transformStyle = tilt.active
      ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025)`
      : 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  } else if (cardHoverEffect === 'zoom_soft') {
    hoverClasses = 'hover:scale-[1.025] transition-transform duration-300';
  } else if (cardHoverEffect === 'gold_glow') {
    hoverClasses =
      'hover:shadow-[0_0_24px_rgba(212,175,55,0.45)] hover:border-amber-400/80 transition-all duration-300';
  } else if (cardHoverEffect === 'lift_shadow') {
    hoverClasses = 'hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.22)] transition-all duration-300';
  } else if (cardHoverEffect === 'sheen_shine') {
    hoverClasses = 'hover:scale-[1.018] transition-all duration-300';
  }

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
    <motion.div
      ref={cardRef}
      initial={currentEntrance.initial}
      animate={currentEntrance.animate}
      transition={currentEntrance.transition}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className={`bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 flex flex-col justify-between group cursor-pointer overflow-hidden relative active:scale-[0.98] ${shadowClass} ${hoverClasses}`}
      style={{
        borderRadius: `${cardRadius || 22}px`,
        transform: transformStyle,
        transition: tilt.active
          ? 'transform 0.08s ease-out'
          : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      }}
    >
      {/* 3D Specular Light Sheen */}
      {cardHoverEffect === 'tilt_3d' && tilt.active && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-200 z-20"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.22) 0%, transparent 65%)`,
          }}
        />
      )}

      {/* 🌸 Flying Flower Particle to Cart */}
      {flyingFlower && (
        <motion.div
          initial={{ x: 50, y: 150, scale: 0.8, opacity: 1 }}
          animate={{
            x: [50, 10, -60],
            y: [150, 40, -180],
            scale: [0.8, 1.4, 0.3],
            opacity: [1, 1, 0],
            rotate: [0, 90, 270],
          }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="fixed pointer-events-none z-50 text-xl flex items-center justify-center filter drop-shadow-md"
        >
          🌸
        </motion.div>
      )}

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

        {/* Specular Liquid Sheen Shine Effect on Hover */}
        {cardHoverEffect === 'sheen_shine' && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden z-20">
            <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-25 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          </div>
        )}

        {/* 1. TOP-RIGHT CORNER: Status Badge with Mobile Safe Max-Width */}
        {showBadges && badgeConfig && (
          <div className="absolute top-2 right-2 z-10 pointer-events-none max-w-[calc(100%-2.2rem)]">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md shadow-xs truncate ${
                badgeStyle === 'solid_pastel'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : badgeConfig.className
              }`}
            >
              {badgeConfig.icon}
              <span className="leading-none tracking-tight truncate">{badgeConfig.text}</span>
            </span>
          </div>
        )}

        {/* 2. TOP-LEFT CORNER: Reserved Exclusively for Heart Favorite Button */}
        {showFavoriteButton && (
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
        )}
      </div>

      {/* Card Content & Unified Responsive Footer */}
      <div className="flex flex-col justify-between flex-1 p-3 pt-2.5 pb-3 gap-2">
        {/* Title: Respect fullTitleWrap */}
        <h3
          className={`text-xs sm:text-sm font-bold leading-snug text-stone-900 dark:text-stone-100 transition-colors duration-200 ${
            fullTitleWrap ? 'line-clamp-2 min-h-[2.4rem]' : 'truncate'
          }`}
          style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
        >
          {isAr ? product.titleAr : product.titleEn}
        </h3>

        {/* Bottom Bar: Prices and Add Button */}
        <div
          className={`pt-2 mt-auto border-t border-stone-100 dark:border-stone-800 ${
            buyButtonStyle === 'full_width'
              ? 'flex flex-col gap-1.5'
              : 'flex items-center justify-between gap-1'
          }`}
        >
          {/* Price Row */}
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

          {/* Unified "+ Add" Button with Tactile Feedback & Selected Physics */}
          <motion.button
            type="button"
            onClick={handleAddToCart}
            animate={hapticPop ? { scale: [1, 1.28, 0.94, 1.08, 1] } : undefined}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`font-bold text-white transition-all duration-200 active:scale-90 shadow-xs cursor-pointer relative overflow-hidden flex items-center justify-center gap-1 ${
              buyButtonStyle === 'circle_plus'
                ? 'w-7 h-7 rounded-full shrink-0'
                : buyButtonStyle === 'full_width'
                ? 'w-full py-1.5 rounded-xl text-xs mt-1'
                : 'px-2.5 py-1 rounded-full text-xs shrink-0'
            } ${
              isMorphed
                ? 'bg-emerald-600 scale-102 ring-2 ring-emerald-300'
                : 'bg-[var(--accent-primary,#123524)] hover:opacity-90'
            }`}
            aria-label={isAr ? `أضف ${product.titleAr}` : `Add ${product.titleEn}`}
          >
            {/* Sparkles Burst Physics */}
            {sparkles.map((sp) => (
              <motion.span
                key={sp.id}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: sp.scale, x: sp.dx, y: sp.dy, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="absolute pointer-events-none z-30 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] text-xs font-black select-none"
              >
                ✦
              </motion.span>
            ))}

            {/* Ripples */}
            {ripples.map((rip) => (
              <motion.span
                key={rip.id}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3.8, opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute rounded-full pointer-events-none bg-white/60 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                style={{
                  left: rip.x - 12,
                  top: rip.y - 12,
                  width: 24,
                  height: 24,
                }}
              />
            ))}

            <AnimatePresence mode="wait">
              {isMorphed ? (
                <motion.span
                  key="morphed"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="flex items-center gap-1 whitespace-nowrap text-[11px] leading-none"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  {buyButtonStyle !== 'circle_plus' && <span>{isAr ? '✓ أُضيف' : 'Added!'}</span>}
                </motion.span>
              ) : (
                <motion.span
                  key="default"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="flex items-center gap-1 whitespace-nowrap text-[11px] leading-none"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  {buyButtonStyle !== 'circle_plus' && <span>{isAr ? '+ أضف' : '+ Add'}</span>}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default React.memo(ProductCard);
