import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, MessageCircle, Heart, Clock, SlidersHorizontal, Eye, Star, Sparkles } from 'lucide-react';
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
  onAddToCart,
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
  const cardIdleMotion = rawStudio?.cardIdleMotion || 'none';
  const cardImageMotion = rawStudio?.cardImageMotion || 'zoom_in';
  const badgeMotion = rawStudio?.badgeMotion || 'pulse_dot';
  const cardShadow = rawStudio?.cardShadow || 'soft';
  const buyButtonStyle = rawStudio?.buyButtonStyle || 'pill_add';
  const fullTitleWrap = rawStudio?.fullTitleWrap !== false;
  const showBadges = rawStudio?.showBadges !== false;
  const badgeStyle = rawStudio?.badgeStyle || 'glassmorphic';
  const showFavoriteButton = rawStudio?.showFavoriteButton !== false;

  // Luxury & Conversion Fields
  const cardAspectRatio = rawStudio?.cardAspectRatio || 'aspect_4_5';
  const cardSurfaceMaterial = rawStudio?.cardSurfaceMaterial || 'pure_white';
  const cardBorderStyle = rawStudio?.cardBorderStyle || 'hairline';
  const showImageOverlay = rawStudio?.showImageOverlay !== false;
  const showDeliveryBadge = rawStudio?.showDeliveryBadge !== false;
  const deliveryBadgeText = rawStudio?.deliveryBadgeText || (isAr ? 'توصيل ساعتين • مبرد ⚡' : '2h Delivery • Chilled ⚡');
  const showRatingStars = rawStudio?.showRatingStars !== false;
  const showDiscountBadge = rawStudio?.showDiscountBadge !== false;
  const showQuickView = rawStudio?.showQuickView !== false;

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
  const [flyCoords, setFlyCoords] = useState({ x: 0, y: 0 });
  const [confetti, setConfetti] = useState([]);
  const [flowerBlooms, setFlowerBlooms] = useState([]);
  const [waxStamp, setWaxStamp] = useState(false);
  const [heartBurst, setHeartBurst] = useState([]);
  const [magnetSnap, setMagnetSnap] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    if (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') {
      setTilt({
        x: -py * 8.5,
        y: px * 8.5,
        active: true,
        glareX: ((px + 1) / 2) * 100,
        glareY: ((py + 1) / 2) * 100,
      });
    }
    if (cardHoverEffect === 'spotlight_glow') {
      setSpotlight({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') {
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

    // Trigger selected physics
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
      const rect = e.currentTarget.getBoundingClientRect();
      setFlyCoords({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
      setFlyingFlower(true);
      setTimeout(() => setFlyingFlower(false), 850);
    } else if (buyButtonPhysics === 'sparkle_burst') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: clickX,
        y: clickY,
        dx: (Math.random() - 0.5) * 65,
        dy: -25 - Math.random() * 40,
        scale: 0.9 + Math.random() * 0.5,
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 700);
    } else if (buyButtonPhysics === 'haptic_pop') {
      setHapticPop(true);
      setTimeout(() => setHapticPop(false), 500);
    } else if (buyButtonPhysics === 'flower_bloom') {
      const blooms = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        dx: Math.cos((i * Math.PI) / 3) * 38,
        dy: Math.sin((i * Math.PI) / 3) * 32,
        scale: 0.8 + Math.random() * 0.4,
        rot: i * 60,
      }));
      setFlowerBlooms(blooms);
      setTimeout(() => setFlowerBlooms([]), 750);
    } else if (buyButtonPhysics === 'confetti_shower') {
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#ec4899', '#8b5cf6'];
      const chars = ['✦', '★', '●', '🌸', '✨'];
      const conf = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        dx: (Math.random() - 0.5) * 85,
        dy: -20 - Math.random() * 55,
        rot: Math.random() * 360,
        color: colors[i % colors.length],
        char: chars[i % chars.length],
      }));
      setConfetti(conf);
      setTimeout(() => setConfetti([]), 850);
    } else if (buyButtonPhysics === 'golden_stamp') {
      setWaxStamp(true);
      setTimeout(() => setWaxStamp(false), 700);
    } else if (buyButtonPhysics === 'heart_burst') {
      const hearts = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        dx: (Math.random() - 0.5) * 60,
        dy: -25 - Math.random() * 45,
        scale: 0.9 + Math.random() * 0.5,
      }));
      setHeartBurst(hearts);
      setTimeout(() => setHeartBurst([]), 800);
    } else if (buyButtonPhysics === 'magnet_snap') {
      setMagnetSnap(true);
      setTimeout(() => setMagnetSnap(false), 550);
    }

    setIsMorphed(true);
    setTimeout(() => setIsMorphed(false), 1200);

    // If an explicit onAddToCart callback is provided, add item directly to bag with full tactile satisfaction
    if (onAddToCart) {
      const defaultItem = {
        ...product,
        basePrice: product.price,
        price: product.price,
        totalPrice: product.price,
        orderStyle: 'as_is',
        modificationNote: null,
        addons: [],
        giftCardMessage: null,
        handover: {
          type: 'self',
          timing: 'immediate',
          recipientName: null,
          recipientPhone: null,
        },
        trustPhoto: true,
        quantity: 1,
      };
      onAddToCart(defaultItem);
    } else if (onSelectProduct) {
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
    waterfall_drop: {
      initial: { opacity: 0, y: -45, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { type: 'spring', damping: 13, stiffness: 170, delay: (index % 10) * staggerDelay },
    },
    spiral_bloom: {
      initial: { opacity: 0, scale: 0.6, rotate: -12 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      transition: { type: 'spring', damping: 12, stiffness: 160, delay: (index % 10) * staggerDelay },
    },
    cinematic_zoom: {
      initial: { opacity: 0, scale: 1.25, filter: 'blur(8px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: (index % 10) * staggerDelay },
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
      ? 'shadow-none'
      : cardShadow === 'medium'
      ? 'shadow-md hover:shadow-lg'
      : cardShadow === 'high'
      ? 'shadow-xl hover:shadow-2xl'
      : cardShadow === 'gold_glow'
      ? 'shadow-[0_8px_30px_-6px_rgba(217,119,6,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(217,119,6,0.38)] ring-1 ring-amber-400/30'
      : 'shadow-[0_4px_18px_-4px_rgba(0,0,0,0.04)] hover:shadow-md';

  // Surface material
  const surfaceClass =
    cardSurfaceMaterial === 'frosted_glass'
      ? 'bg-white/85 dark:bg-stone-900/85 backdrop-blur-md backdrop-saturate-150'
      : cardSurfaceMaterial === 'warm_ivory'
      ? 'bg-[#FAF7F2] dark:bg-[#1C1917]'
      : cardSurfaceMaterial === 'velvet_dark'
      ? 'bg-stone-950 text-white'
      : 'bg-white dark:bg-stone-900';

  // Border style
  const borderClass =
    cardBorderStyle === 'gold_rim'
      ? 'border border-amber-300/80 dark:border-amber-600/70 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.18)]'
      : cardBorderStyle === 'none'
      ? 'border-0'
      : cardBorderStyle === 'glow_rim'
      ? 'border border-rose-300/60 dark:border-rose-800/60 shadow-[0_0_16px_-3px_rgba(190,18,60,0.18)]'
      : 'border border-stone-200/80 dark:border-stone-800/80';

  // Image aspect ratio
  const aspectClass =
    cardAspectRatio === 'aspect_1_1'
      ? 'aspect-square'
      : cardAspectRatio === 'aspect_3_4'
      ? 'aspect-[3/4]'
      : 'aspect-[4/5]';

  // Framer Motion native whileHover to prevent CSS class vs inline transform matrix collisions
  const getWhileHover = () => {
    if (cardHoverEffect === 'zoom_soft') {
      return {
        scale: 1.035,
        boxShadow: '0 14px 30px -6px rgba(0,0,0,0.16)',
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      };
    }
    if (cardHoverEffect === 'lift_shadow') {
      return {
        y: -7,
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.22)',
        transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
      };
    }
    if (cardHoverEffect === 'gold_glow') {
      return {
        scale: 1.018,
        boxShadow: '0 0 26px rgba(212,175,55,0.55)',
        borderColor: '#fbbf24',
        transition: { duration: 0.25, ease: 'easeOut' },
      };
    }
    if (cardHoverEffect === 'sheen_shine') {
      return {
        scale: 1.02,
        transition: { duration: 0.22, ease: 'easeOut' },
      };
    }
    if (cardHoverEffect === 'border_beam') {
      return {
        scale: 1.025,
        boxShadow: '0 12px 28px -6px rgba(217,119,6,0.28)',
        borderColor: '#f59e0b',
        transition: { duration: 0.22 },
      };
    }
    if (cardHoverEffect === 'crystal_glass') {
      return {
        scale: 1.025,
        boxShadow: '0 16px 36px -8px rgba(99,102,241,0.25)',
        transition: { duration: 0.24 },
      };
    }
    if (cardHoverEffect === 'aurora_pulse') {
      return {
        scale: 1.02,
        boxShadow: '0 0 32px rgba(244,63,94,0.35), 0 0 45px rgba(245,158,11,0.25)',
        transition: { duration: 0.25 },
      };
    }
    if (cardHoverEffect === 'spotlight_glow') {
      return {
        scale: 1.02,
        boxShadow: '0 14px 32px -8px rgba(0,0,0,0.18)',
        transition: { duration: 0.22 },
      };
    }
    return undefined;
  };

  const transformStyle =
    (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') && tilt.active
      ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025)`
      : cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth'
      ? 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
      : undefined;

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
      animate={{
        ...currentEntrance.animate,
        ...(cardIdleMotion === 'gentle_float'
          ? { y: [0, -5, 0] }
          : cardIdleMotion === 'breathe_pulse'
          ? { scale: [1, 1.014, 1] }
          : cardIdleMotion === 'gentle_sway'
          ? { rotate: [-0.6, 0.6, -0.6] }
          : {}),
      }}
      whileHover={cardHoverEffect !== 'tilt_3d' && cardHoverEffect !== 'parallax_depth' ? getWhileHover() : undefined}
      transition={{
        ...currentEntrance.transition,
        ...(cardIdleMotion !== 'none'
          ? {
              y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.35 },
              scale: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.4 },
              rotate: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.3 },
            }
          : {}),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className={`flex flex-col justify-between group cursor-pointer overflow-hidden relative active:scale-[0.98] ${surfaceClass} ${borderClass} ${shadowClass}`}
      style={{
        borderRadius: `${cardRadius || 22}px`,
        transform: transformStyle,
        transition: tilt.active
          ? 'transform 0.08s ease-out'
          : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      }}
    >
      {/* 3D Specular Light Sheen */}
      {(cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') && tilt.active && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-200 z-20"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.22) 0%, transparent 65%)`,
          }}
        />
      )}

      {/* Border Light Beam Effect */}
      {cardHoverEffect === 'border_beam' && (
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none border-2 border-transparent group-hover:border-amber-400/90 transition-colors duration-300 shadow-[inset_0_0_12px_rgba(245,158,11,0.25)] z-20 overflow-hidden">
          <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-amber-300/40 to-transparent -skew-x-25 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>
      )}

      {/* Crystal Glass Prism Effect */}
      {cardHoverEffect === 'crystal_glass' && (
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 overflow-hidden bg-gradient-to-tr from-rose-500/10 via-amber-300/15 to-indigo-500/10 backdrop-blur-[1px] backdrop-saturate-150" />
      )}

      {/* Aurora Pulse Glow Behind Card */}
      {cardHoverEffect === 'aurora_pulse' && (
        <div className="absolute -inset-1 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl bg-gradient-to-r from-rose-500/35 via-amber-400/35 to-emerald-400/35" />
      )}

      {/* Spotlight Follow Glow */}
      {cardHoverEffect === 'spotlight_glow' && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
          style={{
            background: `radial-gradient(220px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.25), transparent 70%)`,
          }}
        />
      )}

      {/* Subtle Sheen Loop Idle Motion */}
      {cardIdleMotion === 'subtle_sheen_loop' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <motion.div
            animate={{ x: ['-140%', '240%'] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut', delay: (index % 4) * 1.2 }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-25"
          />
        </div>
      )}

      {/* 🌸 Flying Flower Particle to Cart via Portal (Unclipped by any parent overflow) */}
      {flyingFlower && typeof document !== 'undefined' && createPortal(
        <motion.div
          initial={{
            left: flyCoords.x || 100,
            top: flyCoords.y || 300,
            scale: 0.8,
            opacity: 1,
          }}
          animate={{
            left: [
              flyCoords.x || 100,
              (flyCoords.x || 100) - 35,
              typeof window !== 'undefined' ? window.innerWidth - 65 : 300,
            ],
            top: [
              flyCoords.y || 300,
              (flyCoords.y || 300) - 140,
              28,
            ],
            scale: [0.8, 1.6, 0.35],
            opacity: [1, 1, 0],
            rotate: [0, 90, 360],
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed pointer-events-none z-[9999] text-3xl flex items-center justify-center filter drop-shadow-[0_4px_16px_rgba(244,63,94,0.6)] select-none"
        >
          🌸
        </motion.div>,
        document.body
      )}

      {/* Dynamic Aspect Ratio Image with Strict Corner Separation */}
      <div className={`relative ${aspectClass} w-full overflow-hidden bg-stone-100 dark:bg-stone-800`}>
        <img
          src={product.image}
          alt={isAr ? product.titleAr : product.titleEn}
          style={{
            transform:
              cardHoverEffect === 'parallax_depth' && tilt.active
                ? `scale(1.09) translate3d(${-tilt.y * 0.9}px, ${tilt.x * 0.9}px, 0)`
                : undefined,
            transition: tilt.active ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
          }}
          className={`w-full h-full object-cover ${
            cardImageMotion === 'ken_burns'
              ? 'group-hover:scale-115 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700 ease-out'
              : cardImageMotion === 'vivid_chroma'
              ? 'group-hover:scale-106 group-hover:saturate-130 group-hover:contrast-105 transition-all duration-500 ease-out'
              : cardImageMotion === 'depth_tilt'
              ? 'group-hover:scale-108 group-hover:-translate-y-1.5 transition-transform duration-400 ease-out'
              : 'group-hover:scale-105 transition-transform duration-500 ease-out'
          }`}
          loading={index < 6 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={index < 2 ? 'high' : 'auto'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = './images/products/royal-red-roses.jpg';
          }}
        />

        {/* Soft Vignette on image hover */}
        {cardImageMotion === 'soft_vignette' && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)] z-10" />
        )}

        {/* Optional Cinematic Image Bottom Vignette */}
        {showImageOverlay && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none" />
        )}

        {/* Specular Liquid Sheen Shine Effect on Hover */}
        {cardHoverEffect === 'sheen_shine' && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden z-20">
            <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-25 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          </div>
        )}

        {/* 1. TOP-RIGHT CORNER: Status Badge with Mobile Safe Max-Width */}
        {showBadges && badgeConfig && (
          <div className={`absolute top-2 right-2 z-10 pointer-events-none max-w-[calc(100%-2.2rem)] ${
            badgeMotion === 'float_badge' ? 'animate-[bounce_3s_infinite]' : ''
          }`}>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-xs truncate ${
                badgeStyle === 'solid_pastel'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : badgeStyle === 'royal_gold'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black border border-amber-200 shadow-[0_2px_10px_rgba(245,158,11,0.25)]'
                  : badgeStyle === 'dark_velvet'
                  ? 'bg-stone-950 text-amber-300 font-bold border border-amber-400/40 backdrop-blur-md'
                  : badgeConfig.className
              } ${badgeMotion === 'pulse_dot' ? 'animate-pulse' : ''}`}
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

        {/* 3. BOTTOM-LEFT: Quick View Eye Button */}
        {showQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct && onSelectProduct(product);
            }}
            title={isAr ? 'نظرة سريعة وتكبير الباقة' : 'Quick View'}
            className="absolute bottom-2 left-2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-md flex items-center justify-center shadow-xs border border-white/60 dark:border-stone-700 hover:scale-110 active:scale-90 transition-all text-stone-700 dark:text-stone-200 hover:text-rose-600 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Card Content & Unified Responsive Footer */}
      <div className="flex flex-col justify-between flex-1 p-3 pt-2.5 pb-3 gap-1.5">
        <div>
          {/* Title: Respect fullTitleWrap */}
          <h3
            className={`text-xs sm:text-sm font-bold leading-snug text-stone-900 dark:text-stone-100 transition-colors duration-200 ${
              fullTitleWrap ? 'line-clamp-2 min-h-[2.4rem]' : 'truncate'
            }`}
            style={{ fontFamily: "var(--font-catalog, 'Readex Pro', 'Cairo', sans-serif)" }}
          >
            {isAr ? product.titleAr : product.titleEn}
          </h3>

          {/* Social Proof Rating & Fast Delivery Badge */}
          {(showRatingStars || showDeliveryBadge) && (
            <div className="flex items-center flex-wrap gap-1.5 mt-1">
              {showRatingStars && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50/90 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 inline" />
                  <span>٤.٩</span>
                </span>
              )}
              {showDeliveryBadge && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {deliveryBadgeText}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar: Prices and Add Button */}
        <div
          className={`pt-2 mt-auto border-t border-stone-100 dark:border-stone-800 ${
            buyButtonStyle === 'full_width' || buyButtonStyle === 'split_price'
              ? 'flex flex-col gap-1.5'
              : 'flex items-center justify-between gap-1'
          }`}
        >
          {/* Price Row (Hidden in split_price since price is embedded inside button) */}
          {buyButtonStyle !== 'split_price' && (
            <div className="flex flex-col items-start leading-none min-w-0">
              {product.originalPrice && (
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] text-stone-400 line-through">
                    {product.originalPrice}
                  </span>
                  {showDiscountBadge && (
                    <span className="text-[8px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1 rounded border border-rose-200/60 dark:border-rose-900/50">
                      {isAr ? 'وفر ١٥٪' : 'Save 15%'}
                    </span>
                  )}
                </div>
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
          )}

          {/* Unified "+ Add" Button with Tactile Feedback & Selected Physics */}
          <motion.button
            type="button"
            onClick={handleAddToCart}
            animate={
              magnetSnap
                ? { x: [-10, 5, -2, 0], scaleX: [1.2, 0.95, 1], scaleY: [0.85, 1.05, 1] }
                : hapticPop
                ? { scale: [1, 1.28, 0.94, 1.08, 1] }
                : undefined
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`font-bold text-white transition-all duration-200 active:scale-90 shadow-xs cursor-pointer relative overflow-hidden flex items-center justify-center gap-1 ${
              buyButtonStyle === 'circle_plus'
                ? 'w-7 h-7 rounded-full shrink-0'
                : buyButtonStyle === 'split_price'
                ? 'w-full py-2 px-3 rounded-xl text-xs flex items-center justify-between'
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

            {/* Flower Bloom Physics */}
            {flowerBlooms.map((fb) => (
              <motion.span
                key={fb.id}
                initial={{ scale: 0, opacity: 1, rotate: 0 }}
                animate={{ scale: fb.scale, x: fb.dx, y: fb.dy, rotate: fb.rot, opacity: 0 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="absolute pointer-events-none z-30 text-base select-none filter drop-shadow-md"
              >
                🌸
              </motion.span>
            ))}

            {/* Confetti Shower Physics */}
            {confetti.map((cf) => (
              <motion.span
                key={cf.id}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 1.2, 0.8], x: cf.dx, y: cf.dy, rotate: cf.rot, opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="absolute pointer-events-none z-30 text-xs font-black select-none"
                style={{ color: cf.color }}
              >
                {cf.char}
              </motion.span>
            ))}

            {/* Golden Wax Stamp Physics */}
            {waxStamp && (
              <motion.div
                initial={{ scale: 2.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 300 }}
                className="absolute inset-0 rounded-[inherit] bg-amber-500/25 border-2 border-amber-300 flex items-center justify-center pointer-events-none z-30 shadow-[0_0_20px_rgba(245,158,11,0.8)]"
              >
                <span className="text-amber-200 text-[10px] font-black">👑 ملكي</span>
              </motion.div>
            )}

            {/* Heart Burst Physics */}
            {heartBurst.map((hb) => (
              <motion.span
                key={hb.id}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: hb.scale, x: hb.dx, y: hb.dy, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute pointer-events-none z-30 text-rose-400 text-sm select-none"
              >
                💖
              </motion.span>
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
                  className="flex items-center gap-1 whitespace-nowrap text-[11px] leading-none w-full justify-center"
                >
                  {buyButtonStyle === 'split_price' ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isAr ? 'أضف للسلة' : 'Add to Bag'}</span>
                      </span>
                      <span className="font-mono text-amber-200 text-xs font-black">
                        {product.price} {strings.sar}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      {buyButtonStyle !== 'circle_plus' && <span>{isAr ? '+ أضف' : '+ Add'}</span>}
                    </>
                  )}
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
