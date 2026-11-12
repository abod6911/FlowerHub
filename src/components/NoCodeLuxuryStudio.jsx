import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Palette,
  Layout,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  RotateCcw,
  Upload,
  Download,
  Check,
  Smartphone,
  Sliders,
  Layers,
  Zap,
  Search,
  MapPin,
  Clock,
  Plus,
  Heart,
  Crown,
  Star,
  Percent,
  ShieldCheck,
  Box,
  ShoppingBag,
} from 'lucide-react';
import AmbientRosePetals from './AmbientRosePetals';
import { useStudioStore } from '../context/StudioThemeContext';

function StudioSimulatedCard({
  product,
  index,
  config,
  colors,
  catalogFont,
  cardRadius,
  isAdded,
  onAdd,
  cardEntranceMotion,
  staggerDelay,
  cardHoverEffect,
  buyButtonPhysics,
  cardShadow,
  buyButtonStyle,
  fullTitleWrap,
  showBadges,
  badgeStyle,
  showFavoriteButton,
  replayKey,
  isBentoSpan = false,
  cardAspectRatio = 'aspect_4_5',
  cardSurfaceMaterial = 'pure_white',
  cardBorderStyle = 'hairline',
  showImageOverlay = true,
  showDeliveryBadge = true,
  deliveryBadgeText = 'توصيل ساعتين • مبرد ⚡',
  showRatingStars = true,
  showDiscountBadge = true,
  showQuickView = true,
  onQuickView,
  cardIdleMotion = 'none',
  cardImageMotion = 'zoom_in',
  badgeMotion = 'pulse_dot',
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [hapticPop, setHapticPop] = useState(false);
  const [flyingFlower, setFlyingFlower] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [flowerBlooms, setFlowerBlooms] = useState([]);
  const [waxStamp, setWaxStamp] = useState(false);
  const [heartBurst, setHeartBurst] = useState([]);
  const [magnetSnap, setMagnetSnap] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    if (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') {
      setTilt({
        x: -py * 9,
        y: px * 9,
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
    setIsHovered(false);
    if (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') {
      setTilt({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (buyButtonPhysics === 'ripple_wave') {
      const ripId = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id: ripId, x: clickX, y: clickY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripId));
      }, 700);
    } else if (buyButtonPhysics === 'sparkle_burst') {
      const newSparkles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        dx: (Math.random() - 0.5) * 50,
        dy: -20 - Math.random() * 30,
        scale: 0.8 + Math.random() * 0.4,
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 650);
    } else if (buyButtonPhysics === 'fly_to_cart') {
      setFlyingFlower(true);
      setTimeout(() => setFlyingFlower(false), 850);
    } else if (buyButtonPhysics === 'haptic_pop') {
      setHapticPop(true);
      setTimeout(() => setHapticPop(false), 500);
    } else if (buyButtonPhysics === 'flower_bloom') {
      const blooms = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        dx: Math.cos((i * Math.PI) / 3) * 32,
        dy: Math.sin((i * Math.PI) / 3) * 28,
        scale: 0.8 + Math.random() * 0.4,
        rot: i * 60,
      }));
      setFlowerBlooms(blooms);
      setTimeout(() => setFlowerBlooms([]), 750);
    } else if (buyButtonPhysics === 'confetti_shower') {
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#ec4899', '#8b5cf6'];
      const chars = ['✦', '★', '●', '🌸', '✨'];
      const conf = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        dx: (Math.random() - 0.5) * 75,
        dy: -18 - Math.random() * 45,
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
        dx: (Math.random() - 0.5) * 55,
        dy: -20 - Math.random() * 40,
        scale: 0.85 + Math.random() * 0.45,
      }));
      setHeartBurst(hearts);
      setTimeout(() => setHeartBurst([]), 800);
    } else if (buyButtonPhysics === 'magnet_snap') {
      setMagnetSnap(true);
      setTimeout(() => setMagnetSnap(false), 550);
    }

    onAdd(product, {
      clientX: e.clientX,
      clientY: e.clientY,
      targetRect: rect,
    });
  };

  // Entrance variants based on cardEntranceMotion
  const entranceVariants = {
    fade_up: {
      initial: { opacity: 0, y: 22 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * staggerDelay },
    },
    elastic_scale: {
      initial: { opacity: 0, scale: 0.68 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: 'spring', damping: 11, stiffness: 170, delay: index * staggerDelay },
    },
    slide: {
      initial: { opacity: 0, x: 35 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: index * staggerDelay },
    },
    flip_3d: {
      initial: { opacity: 0, rotateX: 25, y: 25 },
      animate: { opacity: 1, rotateX: 0, y: 0 },
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * staggerDelay },
    },
    blur_in: {
      initial: { opacity: 0, filter: 'blur(8px)', scale: 0.94 },
      animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
      transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1], delay: index * staggerDelay },
    },
    pop_bounce: {
      initial: { opacity: 0, scale: 0.6, y: 15 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { type: 'spring', damping: 10, stiffness: 220, delay: index * staggerDelay },
    },
    waterfall_drop: {
      initial: { opacity: 0, y: -45, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { type: 'spring', damping: 13, stiffness: 170, delay: index * staggerDelay },
    },
    spiral_bloom: {
      initial: { opacity: 0, scale: 0.6, rotate: -12 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      transition: { type: 'spring', damping: 12, stiffness: 160, delay: index * staggerDelay },
    },
    cinematic_zoom: {
      initial: { opacity: 0, scale: 1.25, filter: 'blur(8px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: index * staggerDelay },
    },
    none: {
      initial: { opacity: 1, scale: 1 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0 },
    },
  };

  const motionProps = entranceVariants[cardEntranceMotion] || entranceVariants.fade_up;

  // Shadow class
  const shadowClass =
    cardShadow === 'none'
      ? 'shadow-none'
      : cardShadow === 'medium'
      ? 'shadow-md hover:shadow-lg'
      : cardShadow === 'high'
      ? 'shadow-xl hover:shadow-2xl'
      : cardShadow === 'gold_glow'
      ? 'shadow-[0_8px_28px_-6px_rgba(217,119,6,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(217,119,6,0.38)] ring-1 ring-amber-400/30'
      : 'shadow-xs hover:shadow-md';

  // Surface class
  const surfaceClass =
    cardSurfaceMaterial === 'frosted_glass'
      ? 'bg-white/80 backdrop-blur-md backdrop-saturate-150'
      : cardSurfaceMaterial === 'warm_ivory'
      ? 'bg-[#FAF7F2]'
      : cardSurfaceMaterial === 'velvet_dark'
      ? 'bg-stone-950 text-white'
      : 'bg-white';

  // Border class
  const borderClass =
    cardBorderStyle === 'gold_rim'
      ? 'border border-amber-300/80 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.18)]'
      : cardBorderStyle === 'none'
      ? 'border-0'
      : cardBorderStyle === 'glow_rim'
      ? 'border border-rose-300/60 shadow-[0_0_16px_-3px_rgba(190,18,60,0.18)]'
      : 'border border-stone-200/80';

  // Aspect ratio
  const aspectClass = isBentoSpan
    ? 'aspect-[16/9]'
    : cardAspectRatio === 'aspect_1_1'
    ? 'aspect-square'
    : cardAspectRatio === 'aspect_3_4'
    ? 'aspect-[3/4]'
    : 'aspect-[4/5]';

  // Badge style
  const badgeStyleClass =
    badgeStyle === 'solid_pastel'
      ? 'bg-amber-100 text-amber-900 border border-amber-300'
      : badgeStyle === 'royal_gold'
      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black border border-amber-200 shadow-[0_2px_10px_rgba(245,158,11,0.25)]'
      : badgeStyle === 'dark_velvet'
      ? 'bg-stone-950 text-amber-300 font-bold border border-amber-400/40 backdrop-blur-md'
      : 'bg-white/90 backdrop-blur-md text-stone-900 border border-white/60';

  // Framer Motion native whileHover to prevent CSS class vs inline transform matrix collisions
  const getWhileHover = () => {
    if (cardHoverEffect === 'zoom_soft') {
      return {
        scale: 1.035,
        boxShadow: '0 12px 28px -6px rgba(0,0,0,0.15)',
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      };
    }
    if (cardHoverEffect === 'lift_shadow') {
      return {
        y: -7,
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.22)',
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      };
    }
    if (cardHoverEffect === 'gold_glow') {
      return {
        scale: 1.018,
        boxShadow: '0 0 24px rgba(212,175,55,0.45)',
        borderColor: '#fbbf24',
        transition: { duration: 0.22, ease: 'easeOut' },
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

  return (
    <motion.div
      key={`${cardEntranceMotion}-${staggerDelay}-${replayKey}-${product.id}`}
      initial={motionProps.initial}
      animate={{
        ...motionProps.animate,
        ...(cardIdleMotion === 'gentle_float'
          ? { y: [0, -4, 0] }
          : cardIdleMotion === 'breathe_pulse'
          ? { scale: [1, 1.015, 1] }
          : cardIdleMotion === 'gentle_sway'
          ? { rotate: [-0.6, 0.6, -0.6] }
          : {}),
      }}
      whileHover={cardHoverEffect !== 'tilt_3d' && cardHoverEffect !== 'parallax_depth' ? getWhileHover() : undefined}
      transition={{
        ...motionProps.transition,
        ...(cardIdleMotion !== 'none'
          ? {
              y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.35 },
              scale: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.4 },
              rotate: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.3 },
            }
          : {}),
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`p-2.5 flex flex-col justify-between transition-all group overflow-hidden relative cursor-pointer ${surfaceClass} ${borderClass} ${shadowClass} ${
        isBentoSpan ? 'col-span-2' : 'col-span-1'
      }`}
      style={{
        borderRadius: `${cardRadius}px`,
        transform: transformStyle,
        transition: tilt.active
          ? 'transform 0.08s ease-out'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      }}
    >
      {/* 3D Specular Light Sheen */}
      {(cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') && tilt.active && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-200 z-20"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.24) 0%, transparent 65%)`,
          }}
        />
      )}

      {/* Border Light Beam */}
      {cardHoverEffect === 'border_beam' && (
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none border-2 border-transparent group-hover:border-amber-400/90 transition-colors duration-300 shadow-[inset_0_0_12px_rgba(245,158,11,0.25)] z-20 overflow-hidden">
          <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-amber-300/40 to-transparent -skew-x-25 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>
      )}

      {/* Crystal Glass Prism */}
      {cardHoverEffect === 'crystal_glass' && (
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 overflow-hidden bg-gradient-to-tr from-rose-500/10 via-amber-300/15 to-indigo-500/10 backdrop-blur-[1px]" />
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
            background: `radial-gradient(160px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.28), transparent 70%)`,
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

      <div>
        <div
          className={`rounded-xl overflow-hidden mb-2 bg-stone-100 relative ${aspectClass}`}
        >
          <img
            src={product.image}
            alt={product.title}
            className={`w-full h-full object-cover transition-all ${
              cardImageMotion === 'ken_burns'
                ? 'group-hover:scale-115 group-hover:translate-x-1 group-hover:-translate-y-1 duration-700 ease-out'
                : cardImageMotion === 'vivid_chroma'
                ? 'group-hover:scale-106 group-hover:saturate-130 group-hover:contrast-105 duration-500 ease-out'
                : cardImageMotion === 'depth_tilt'
                ? 'group-hover:scale-108 group-hover:-translate-y-1 duration-400 ease-out'
                : 'group-hover:scale-105 duration-500'
            }`}
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
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none" />
          )}

          {/* Specular Liquid Sheen on Hover */}
          {cardHoverEffect === 'sheen_shine' && (
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden z-20">
              <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-25 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </div>
          )}

          {/* Top-Right Badge */}
          {showBadges && (
            <span
              className={`absolute top-1.5 right-1.5 text-[8px] font-bold px-2 py-0.5 rounded-full shadow-2xs z-10 ${badgeStyleClass} ${
                badgeMotion === 'float_badge' ? 'animate-[bounce_3s_infinite]' : ''
              } ${badgeMotion === 'pulse_dot' ? 'animate-pulse' : ''}`}
            >
              {product.tag}
            </span>
          )}

          {/* Top-Left Heart Favorite Button */}
          {showFavoriteButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFav(!isFav);
              }}
              className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xs border border-white/60 z-10 transition-transform active:scale-75"
            >
              <Heart
                className={`w-3 h-3 transition-colors ${
                  isFav ? 'fill-rose-600 text-rose-600' : 'text-stone-400 hover:text-rose-500'
                }`}
              />
            </button>
          )}

          {/* Bottom-Left Quick View Button */}
          {showQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView && onQuickView();
              }}
              title="معاينة سريعة للباقة"
              className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xs border border-white/60 z-10 transition-transform active:scale-75 text-stone-700 hover:text-rose-600 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Title */}
        <h4
          className={`text-xs font-bold leading-snug ${
            fullTitleWrap ? 'line-clamp-2 min-h-[2.3rem]' : 'truncate'
          }`}
          style={{ color: cardSurfaceMaterial === 'velvet_dark' ? '#FAF5FF' : colors.textMain }}
        >
          {product.title}
        </h4>

        {/* Social Proof Rating & Fast Delivery Badge */}
        {(showRatingStars || showDeliveryBadge) && (
          <div className="flex items-center flex-wrap gap-1 mt-1">
            {showRatingStars && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 inline" />
                <span>٤.٩</span>
              </span>
            )}
            {showDeliveryBadge && (
              <span className="text-[9px] text-emerald-700 font-medium">
                {deliveryBadgeText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer / Buy Action Area */}
      <div
        className={`pt-2 mt-1.5 border-t border-stone-100 ${
          buyButtonStyle === 'full_width' || buyButtonStyle === 'split_price'
            ? 'flex flex-col gap-1.5'
            : 'flex items-center justify-between'
        }`}
      >
        {buyButtonStyle !== 'split_price' && (
          <div className="flex flex-col items-start leading-none min-w-0">
            {product.originalPrice && (
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[9px] text-stone-400 line-through">
                  {product.originalPrice}
                </span>
                {showDiscountBadge && (
                  <span className="text-[8px] font-bold text-rose-700 bg-rose-50 px-1 rounded border border-rose-200/60">
                    وفر ١٥٪
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-black" style={{ color: colors.priceColor }}>
                {product.price}
              </span>
              <span className="text-[9px] text-stone-500 font-medium">ر.س</span>
            </div>
          </div>
        )}

        {/* Buy Button */}
        <motion.button
          type="button"
          onClick={handleButtonClick}
          animate={
            magnetSnap
              ? { x: [-8, 4, -2, 0], scaleX: [1.2, 0.95, 1], scaleY: [0.85, 1.05, 1] }
              : hapticPop
              ? { scale: [1, 1.28, 0.94, 1.08, 1] }
              : undefined
          }
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={`font-bold transition-all active:scale-95 shadow-2xs flex items-center justify-center gap-1 relative overflow-hidden ${
            buyButtonStyle === 'circle_plus'
              ? 'w-7 h-7 rounded-full text-white shrink-0'
              : buyButtonStyle === 'split_price'
              ? 'w-full py-1.5 px-2.5 rounded-xl text-white text-[10px] flex items-center justify-between'
              : buyButtonStyle === 'full_width'
              ? 'w-full py-1.5 rounded-xl text-white text-[10px]'
              : 'px-2.5 py-1 rounded-full text-white text-[10px] shrink-0'
          }`}
          style={{
            backgroundColor: isAdded ? '#059669' : colors.primary,
          }}
        >
          {/* Sparkles Burst */}
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

          {/* Ripple Wave Elements */}
          {ripples.map((rip) => (
            <motion.span
              key={rip.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3.8, opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute rounded-full pointer-events-none bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
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
              className="absolute pointer-events-none z-30 text-sm select-none filter drop-shadow-md"
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
              className="absolute inset-0 rounded-[inherit] bg-amber-500/25 border border-amber-300 flex items-center justify-center pointer-events-none z-30 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
            >
              <span className="text-amber-200 text-[9px] font-black">👑 ملكي</span>
            </motion.div>
          )}

          {/* Heart Burst Physics */}
          {heartBurst.map((hb) => (
            <motion.span
              key={hb.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: hb.scale, x: hb.dx, y: hb.dy, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute pointer-events-none z-30 text-rose-400 text-xs select-none"
            >
              💖
            </motion.span>
          ))}

          {/* Morphing Checkmark / Text */}
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.span
                key="added"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="flex items-center gap-1 leading-none"
              >
                <Check className="w-3 h-3 stroke-[3]" />
                {buyButtonStyle !== 'circle_plus' && <span>أُضيف</span>}
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="flex items-center gap-1 leading-none w-full justify-center"
              >
                {buyButtonStyle === 'split_price' ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1">
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>أضف</span>
                    </span>
                    <span className="font-mono text-amber-200 text-[10px] font-black">
                      {product.price} ر.س
                    </span>
                  </div>
                ) : (
                  <>
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    {buyButtonStyle !== 'circle_plus' && <span>أضف</span>}
                  </>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* 🌸 Flying Flower Particle to Cart for Simulated Card */}
      {flyingFlower && (
        <motion.div
          initial={{ y: 0, x: 0, scale: 0.8, opacity: 1 }}
          animate={{
            y: [-10, -70, -150],
            x: [0, -20, -50],
            scale: [0.8, 1.45, 0.35],
            opacity: [1, 1, 0],
            rotate: [0, 90, 270],
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute bottom-10 start-8 pointer-events-none z-50 text-xl filter drop-shadow-md select-none"
        >
          🌸
        </motion.div>
      )}
    </motion.div>
  );
}

function StudioMotionSandboxCard({
  cardHoverEffect = 'zoom_soft',
  buyButtonPhysics = 'sparkle_burst',
  cardIdleMotion = 'none',
  cardImageMotion = 'zoom_in',
  badgeMotion = 'pulse_dot',
  primaryColor = '#7E1529',
  cardRadius = 22,
  triggerCount = 0,
  hoverTriggerCount = 0,
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [isAdded, setIsAdded] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [hapticPop, setHapticPop] = useState(false);
  const [flowerBlooms, setFlowerBlooms] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [waxStamp, setWaxStamp] = useState(false);
  const [heartBurst, setHeartBurst] = useState([]);
  const [magnetSnap, setMagnetSnap] = useState(false);
  const [flyingParticle, setFlyingParticle] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const [cartBounce, setCartBounce] = useState(false);
  const [simulatedHover, setSimulatedHover] = useState(false);

  // Auto-trigger physics whenever triggerCount increments
  useEffect(() => {
    if (triggerCount > 0) {
      triggerPhysics();
    }
  }, [triggerCount]);

  // Auto-trigger hover preview whenever hoverTriggerCount increments
  useEffect(() => {
    if (hoverTriggerCount > 0) {
      setSimulatedHover(true);
      if (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') {
        setTilt({ x: -9, y: 9, active: true, glareX: 75, glareY: 30 });
      }
      const t = setTimeout(() => {
        setSimulatedHover(false);
        setTilt({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [hoverTriggerCount, cardHoverEffect]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setSpotlight({
      x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
    });
    if (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') {
      setTilt({
        x: -py * 10,
        y: px * 10,
        active: true,
        glareX: ((px + 1) / 2) * 100,
        glareY: ((py + 1) / 2) * 100,
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') {
      setTilt({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
    }
  };

  const triggerPhysics = (clientX, clientY, targetRect) => {
    if (buyButtonPhysics === 'ripple_wave') {
      const clickX = clientX && targetRect ? clientX - targetRect.left : 45;
      const clickY = clientY && targetRect ? clientY - targetRect.top : 16;
      const ripId = Date.now();
      setRipples((prev) => [...prev, { id: ripId, x: clickX, y: clickY }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripId)), 700);
    } else if (buyButtonPhysics === 'sparkle_burst') {
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        dx: (Math.random() - 0.5) * 75,
        dy: -25 - Math.random() * 45,
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
        dx: Math.cos((i * Math.PI) / 3) * 32,
        dy: Math.sin((i * Math.PI) / 3) * 28,
        scale: 0.8 + Math.random() * 0.4,
        rot: i * 60,
      }));
      setFlowerBlooms(blooms);
      setTimeout(() => setFlowerBlooms([]), 750);
    } else if (buyButtonPhysics === 'confetti_shower') {
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#ec4899', '#8b5cf6'];
      const chars = ['✦', '★', '●', '🌸', '✨'];
      const conf = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        dx: (Math.random() - 0.5) * 75,
        dy: -18 - Math.random() * 45,
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
        dx: (Math.random() - 0.5) * 55,
        dy: -20 - Math.random() * 40,
        scale: 0.85 + Math.random() * 0.45,
      }));
      setHeartBurst(hearts);
      setTimeout(() => setHeartBurst([]), 800);
    } else if (buyButtonPhysics === 'magnet_snap') {
      setMagnetSnap(true);
      setTimeout(() => setMagnetSnap(false), 550);
    } else if (buyButtonPhysics === 'fly_to_cart') {
      setFlyingParticle(true);
      setTimeout(() => {
        setCartBounce(true);
        setCartCount((c) => c + 1);
        setTimeout(() => setCartBounce(false), 550);
      }, 500);
      setTimeout(() => setFlyingParticle(false), 900);
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const getWhileHover = () => {
    if (cardHoverEffect === 'zoom_soft') {
      return { scale: 1.04, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.18)', transition: { duration: 0.22 } };
    }
    if (cardHoverEffect === 'lift_shadow') {
      return { y: -8, boxShadow: '0 22px 38px -10px rgba(0,0,0,0.24)', transition: { duration: 0.22 } };
    }
    if (cardHoverEffect === 'gold_glow') {
      return { scale: 1.02, boxShadow: '0 0 28px rgba(212,175,55,0.65)', borderColor: '#fbbf24', transition: { duration: 0.22 } };
    }
    if (cardHoverEffect === 'sheen_shine') {
      return { scale: 1.02, transition: { duration: 0.22 } };
    }
    if (cardHoverEffect === 'border_beam') {
      return { scale: 1.025, boxShadow: '0 14px 28px -6px rgba(217,119,6,0.3)', borderColor: '#f59e0b', transition: { duration: 0.22 } };
    }
    if (cardHoverEffect === 'crystal_glass') {
      return { scale: 1.025, boxShadow: '0 16px 36px -8px rgba(99,102,241,0.25)', transition: { duration: 0.24 } };
    }
    if (cardHoverEffect === 'aurora_pulse') {
      return { scale: 1.02, boxShadow: '0 0 32px rgba(244,63,94,0.35), 0 0 45px rgba(245,158,11,0.25)', transition: { duration: 0.25 } };
    }
    if (cardHoverEffect === 'spotlight_glow') {
      return { scale: 1.02, boxShadow: '0 14px 32px -8px rgba(0,0,0,0.18)', transition: { duration: 0.22 } };
    }
    return undefined;
  };

  const transformStyle =
    (cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') && tilt.active
      ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03, 1.03, 1.03)`
      : cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth'
      ? 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
      : undefined;

  const physicsLabels = {
    morph_checkmark: 'تحول للعلامة (Morph)',
    ripple_wave: 'موجة ضوئية (Ripple)',
    fly_to_cart: 'طيران للسلة (Fly to Cart)',
    sparkle_burst: 'تناثر نجوم ذهبية (Sparkles)',
    haptic_pop: 'نبض تفاعلي (Haptic Pop)',
    flower_bloom: 'تفتح زهور الورد (Flower Bloom 🌸)',
    confetti_shower: 'مطر احتفال وقصاصات (Confetti 🎉)',
    golden_stamp: 'ختم الشمع الملكي (Wax Stamp 👑)',
    heart_burst: 'تناثر قلوب إعجاب (Heart Burst 💖)',
    magnet_snap: 'انجذاب مغناطيسي (Magnet Snap 🧲)',
  };

  const hoverLabels = {
    zoom_soft: 'تكبير ناعم (Zoom)',
    tilt_3d: 'ميلان ثلاثي الأبعاد (3D Tilt)',
    gold_glow: 'توهج ذهبي (Glow)',
    lift_shadow: 'ارتفاع عائم فاخر (Lift)',
    sheen_shine: 'انعكاس سائل (Sheen)',
    border_beam: 'شعاع إطار ضوئي (Border Beam)',
    crystal_glass: 'موشور بلوري (Crystal Glass)',
    parallax_depth: 'عمق بارالاكس (Parallax Depth)',
    aurora_pulse: 'شفق قطبي متوهج (Aurora Pulse)',
    spotlight_glow: 'كشاف ضوئي تفاعلي (Spotlight)',
  };

  return (
    <div className="mt-3 p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3 relative overflow-visible">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-stone-900">مختبر التجربة التفاعلية المباشرة</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            {physicsLabels[buyButtonPhysics] || buyButtonPhysics}
          </span>
        </div>

        {/* 🛍️ Interactive Cart Target */}
        <motion.button
          type="button"
          animate={cartBounce ? { scale: [1, 1.35, 0.9, 1.15, 1], rotate: [0, -6, 6, 0] } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onClick={() => triggerPhysics()}
          className="relative flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm cursor-pointer select-none active:scale-95 transition-all"
          style={{ backgroundColor: primaryColor }}
          title="انقر لتجربة حركة الزر الحالية واكتمال وصول الوردة"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
          <span>سلة التجربة ({cartCount})</span>
          <AnimatePresence>
            {cartBounce && (
              <motion.span
                key="bubble"
                initial={{ y: 0, opacity: 1, scale: 0.7 }}
                animate={{ y: -20, opacity: 0, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65 }}
                className="absolute -top-3.5 start-0 text-[10px] font-black text-emerald-300 bg-stone-900/95 px-1.5 py-0.2 rounded-full border border-emerald-400/40 shadow-xs"
              >
                +1 🌸
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="text-[11px] text-stone-500 leading-relaxed flex items-center justify-between">
        <span>💡 مرر الفأرة فوق البطاقة لتجربة التمرير، أو انقر زر الشراء لاختبار الحركة:</span>
        <button
          type="button"
          onClick={() => {
            setSimulatedHover((prev) => !prev);
            if (cardHoverEffect === 'tilt_3d') {
              setTilt({ x: -10, y: 10, active: true, glareX: 80, glareY: 20 });
              setTimeout(() => setTilt({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 }), 1600);
            }
          }}
          className="text-[10px] font-bold text-[#7E1529] hover:underline cursor-pointer"
        >
          {simulatedHover ? 'إلغاء المحاكاة' : '⚡ محاكاة التمرير'}
        </button>
      </div>

      {/* The Interactive Sandbox Card */}
      <div className="flex justify-center p-3 bg-stone-50/80 rounded-xl border border-stone-100 relative overflow-visible">
        {/* 🌸 Flying Flower Particle along Arced Trajectory to Cart Target */}
        {flyingParticle && (
          <motion.div
            initial={{ left: '55%', bottom: '26px', scale: 0.8, opacity: 1 }}
            animate={{
              left: ['55%', '68%', '88%'],
              bottom: ['26px', '160px', '280px'],
              scale: [0.8, 1.6, 0.35],
              opacity: [1, 1, 0],
              rotate: [0, 90, 360],
            }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute pointer-events-none z-50 text-2xl flex items-center justify-center filter drop-shadow-[0_4px_14px_rgba(244,63,94,0.55)] select-none"
          >
            🌸
          </motion.div>
        )}

        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={cardHoverEffect !== 'tilt_3d' && cardHoverEffect !== 'parallax_depth' ? getWhileHover() : undefined}
          animate={
            simulatedHover && cardHoverEffect !== 'tilt_3d' && cardHoverEffect !== 'parallax_depth'
              ? getWhileHover()
              : cardIdleMotion === 'gentle_float'
              ? { y: [0, -4, 0] }
              : cardIdleMotion === 'breathe_pulse'
              ? { scale: [1, 1.015, 1] }
              : cardIdleMotion === 'gentle_sway'
              ? { rotate: [-0.6, 0.6, -0.6] }
              : undefined
          }
          transition={
            cardIdleMotion !== 'none'
              ? {
                  y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
                }
              : undefined
          }
          className="w-56 bg-white border border-stone-200/90 p-3 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden transition-all select-none cursor-pointer group"
          style={{
            borderRadius: `${cardRadius || 22}px`,
            transform: transformStyle,
            transition: tilt.active
              ? 'transform 0.08s ease-out'
              : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          }}
        >
          {/* Specular Glare for 3D Tilt & Parallax */}
          {(cardHoverEffect === 'tilt_3d' || cardHoverEffect === 'parallax_depth') && tilt.active && (
            <div
              className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-200 z-30"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.3) 0%, transparent 65%)`,
              }}
            />
          )}

          {/* Border Light Beam */}
          {cardHoverEffect === 'border_beam' && (
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none border-2 border-transparent group-hover:border-amber-400/90 transition-colors duration-300 shadow-[inset_0_0_12px_rgba(245,158,11,0.25)] z-20 overflow-hidden">
              <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-amber-300/40 to-transparent -skew-x-25 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </div>
          )}

          {/* Crystal Glass Prism */}
          {cardHoverEffect === 'crystal_glass' && (
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 overflow-hidden bg-gradient-to-tr from-rose-500/10 via-amber-300/15 to-indigo-500/10 backdrop-blur-[1px]" />
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
                background: `radial-gradient(160px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.28), transparent 70%)`,
              }}
            />
          )}

          {/* Subtle Sheen Loop Idle Motion */}
          {cardIdleMotion === 'subtle_sheen_loop' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              <motion.div
                animate={{ x: ['-140%', '240%'] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-25"
              />
            </div>
          )}

          {/* Product Image */}
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 mb-2.5">
            <img
              src="./images/products/royal-red-roses.jpg"
              alt="بوكيه الروز الملكي"
              className={`w-full h-full object-cover transition-all ${
                cardImageMotion === 'ken_burns'
                  ? 'group-hover:scale-115 group-hover:translate-x-1 group-hover:-translate-y-1 duration-700 ease-out'
                  : cardImageMotion === 'vivid_chroma'
                  ? 'group-hover:scale-106 group-hover:saturate-130 group-hover:contrast-105 duration-500 ease-out'
                  : cardImageMotion === 'depth_tilt'
                  ? 'group-hover:scale-108 group-hover:-translate-y-1 duration-400 ease-out'
                  : 'group-hover:scale-105 duration-500 ease-out'
              }`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = './images/products/royal-red-roses.jpg';
              }}
            />

            {/* Soft Vignette on image hover */}
            {cardImageMotion === 'soft_vignette' && (
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)] z-10" />
            )}

            {/* Specular Liquid Sheen Sweep */}
            {cardHoverEffect === 'sheen_shine' && (
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden z-20">
                <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-25 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              </div>
            )}

            <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-stone-900 border border-white/60 shadow-2xs ${
              badgeMotion === 'float_badge' ? 'animate-[bounce_3s_infinite]' : ''
            } ${badgeMotion === 'pulse_dot' ? 'animate-pulse' : ''}`}>
              الأكثر طلباً
            </span>
          </div>

          {/* Details */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 truncate">بوكيه الروز الملكي الفاخر</h4>
            <span className="text-[10px] text-stone-400 block mt-0.5">توصيل ساعتين • مبرد</span>
          </div>

          {/* Footer & Interactive Button */}
          <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-black text-[#7E1529]">245</span>
              <span className="text-[9px] text-stone-500 font-bold">ر.س</span>
            </div>

            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                triggerPhysics(e.clientX, e.clientY, rect);
              }}
              animate={
                magnetSnap
                  ? { x: [-8, 4, -2, 0], scaleX: [1.2, 0.95, 1], scaleY: [0.85, 1.05, 1] }
                  : hapticPop
                  ? { scale: [1, 1.32, 0.92, 1.1, 1] }
                  : undefined
              }
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`font-bold px-3 py-1 rounded-full text-white text-xs shadow-xs flex items-center justify-center gap-1 relative overflow-hidden cursor-pointer active:scale-90 transition-colors duration-200 ${
                isAdded ? 'bg-emerald-600' : 'bg-[#7E1529] hover:opacity-95'
              }`}
            >
              {/* Sparkles Burst */}
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

              {/* Ripple Wave */}
              {ripples.map((rip) => (
                <motion.span
                  key={rip.id}
                  initial={{ scale: 0, opacity: 0.85 }}
                  animate={{ scale: 4.2, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute rounded-full pointer-events-none bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
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
                  className="absolute pointer-events-none z-30 text-sm select-none filter drop-shadow-md"
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
                  className="absolute inset-0 rounded-[inherit] bg-amber-500/25 border border-amber-300 flex items-center justify-center pointer-events-none z-30 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                >
                  <span className="text-amber-200 text-[9px] font-black">👑 ملكي</span>
                </motion.div>
              )}

              {/* Heart Burst Physics */}
              {heartBurst.map((hb) => (
                <motion.span
                  key={hb.id}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: hb.scale, x: hb.dx, y: hb.dy, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute pointer-events-none z-30 text-rose-400 text-xs select-none"
                >
                  💖
                </motion.span>
              ))}

              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="flex items-center gap-1 text-[11px]"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>✓ أُضيف</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.14 }}
                    className="flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>+ أضف</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Quick Action Button for Instant Verification */}
      <button
        type="button"
        onClick={() => triggerPhysics()}
        className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-300/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-600" />
        <span>اختبر فيزياء الزر فوراً ({physicsLabels[buyButtonPhysics] || buyButtonPhysics})</span>
      </button>
    </div>
  );
}

function StudioStorefrontLiveSimulation({ config, replayTrigger = 0 }) {
  const colors = {
    primary: config?.colors?.primary || '#7E1529',
    secondary: config?.colors?.secondary || '#BE123C',
    canvasBg: config?.colors?.canvasBg || '#FAF8F5',
    cardSurface: config?.colors?.cardSurface || '#FFFFFF',
    textMain: config?.colors?.textMain || '#1C1917',
    textMuted: config?.colors?.textMuted || '#78716C',
    priceColor: config?.colors?.priceColor || config?.colors?.primary || '#7E1529',
  };

  const headerFont =
    config?.typography?.headerFont === 'Cairo'
      ? "'Cairo', sans-serif"
      : config?.typography?.headerFont === 'Readex Pro'
      ? "'Readex Pro', sans-serif"
      : config?.typography?.headerFont === 'Aref Ruqaa'
      ? "'Aref Ruqaa', serif"
      : config?.typography?.headerFont === 'Playfair'
      ? "'Playfair Display', serif"
      : "'Amiri', serif";

  const catalogFont =
    config?.typography?.catalogFont === 'Amiri'
      ? "'Amiri', serif"
      : config?.typography?.catalogFont === 'Cairo'
      ? "'Cairo', sans-serif"
      : "'Readex Pro', sans-serif";

  const cardRadius = config?.cardBorderRadius ?? 22;
  const cardEntranceMotion = config?.cardEntranceMotion || 'fade_up';
  const staggerDelay = config?.staggerDelay ?? 0.08;
  const buyButtonPhysics = config?.buyButtonPhysics || 'morph_checkmark';
  const cardHoverEffect = config?.cardHoverEffect || 'zoom_soft';
  const cardShadow = config?.cardShadow || 'soft';
  const buyButtonStyle = config?.buyButtonStyle || 'pill_add';
  const fullTitleWrap = config?.fullTitleWrap !== false;
  const showBadges = config?.showBadges !== false;
  const badgeStyle = config?.badgeStyle || 'glassmorphic';
  const showFavoriteButton = config?.showFavoriteButton !== false;
  const gridLayout = config?.gridLayout || 'bento';

  const sampleProducts = [
    {
      id: 'p1',
      title: 'بوكيه الروز الملكي',
      price: 245,
      originalPrice: 290,
      tag: 'الأكثر طلباً',
      image: './images/products/royal-red-roses.jpg',
    },
    {
      id: 'p2',
      title: 'فازة كازابلانكا وأوركيد',
      price: 360,
      originalPrice: 420,
      tag: 'تنسيق فاخر',
      image: './images/products/casablanca-orchid-vase.jpg',
    },
    {
      id: 'p3',
      title: 'هيدرنجيا وروز باستيل',
      price: 280,
      originalPrice: 330,
      tag: 'جاهز اليوم',
      image: './images/products/blush-hydrangea-vase.jpg',
    },
    {
      id: 'p4',
      title: 'بوكس أكريليك الاحتفالات',
      price: 420,
      originalPrice: 490,
      tag: 'إهداء خاص',
      image: './images/products/acrylic-box-celebration.jpg',
    },
  ];

  const [activeItemAdded, setActiveItemAdded] = useState(null);
  const [flyingPetals, setFlyingPetals] = useState([]);
  const [headerPulse, setHeaderPulse] = useState(false);
  const [simulatedCartCount, setSimulatedCartCount] = useState(2);
  const containerRef = useRef(null);

  const handleAddProduct = (product, meta) => {
    setActiveItemAdded(product.id);

    // If fly_to_cart physics is active, spawn an animated particle
    if (buyButtonPhysics === 'fly_to_cart') {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const startX = meta?.clientX && containerRect ? meta.clientX - containerRect.left : 160;
      const startY = meta?.clientY && containerRect ? meta.clientY - containerRect.top : 420;
      const targetX = containerRect ? containerRect.width - 55 : 290;
      const targetY = 32;

      const petalId = Date.now() + Math.random();
      setFlyingPetals((prev) => [
        ...prev,
        { id: petalId, startX, startY, targetX, targetY },
      ]);

      setTimeout(() => {
        setHeaderPulse(true);
        setSimulatedCartCount((c) => c + 1);
        setTimeout(() => setHeaderPulse(false), 500);
      }, 550);

      setTimeout(() => {
        setFlyingPetals((prev) => prev.filter((p) => p.id !== petalId));
      }, 850);
    }

    setTimeout(() => {
      setActiveItemAdded(null);
    }, 1300);
  };

  // Sections management helper
  const sectionsOrder = config?.sections || [
    { id: 'header', visible: true },
    { id: 'occasions', visible: true },
    { id: 'cooler', visible: true },
    { id: 'custom_banner', visible: true },
    { id: 'catalog', visible: true },
  ];

  const isSectionVisible = (secId) => {
    const sec = sectionsOrder.find((s) => s.id === secId);
    return sec ? sec.visible !== false : true;
  };

  return (
    <div
      ref={containerRef}
      className="p-3 sm:p-4 space-y-3 select-none text-start transition-all duration-300 relative min-h-full"
      style={{
        backgroundColor: colors.canvasBg,
        color: colors.textMain,
        fontFamily: catalogFont,
      }}
    >
      {/* 🌸 Live Falling Rose Petals Contained Inside iPhone Simulation */}
      <AmbientRosePetals
        isAbsolute={true}
        enabled={config?.floatingPetalsEnabled}
        count={config?.petalsCount}
        opacity={config?.petalsOpacity}
      />

      {/* 🌸 Flying Rose Petals along Arced Trajectory (Fly to Cart Physics) */}
      {flyingPetals.map((fp) => (
        <motion.div
          key={fp.id}
          initial={{ x: fp.startX, y: fp.startY, scale: 0.9, opacity: 1 }}
          animate={{
            x: [fp.startX, fp.startX - 30, fp.targetX],
            y: [fp.startY, fp.startY - 120, fp.targetY],
            scale: [0.9, 1.4, 0.4],
            opacity: [1, 1, 0],
            rotate: [0, 60, 240],
          }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute pointer-events-none z-50 text-base flex items-center justify-center filter drop-shadow-md"
        >
          🌸
        </motion.div>
      ))}

      {/* Render Sections in Configured Dynamic Order */}
      {sectionsOrder.map((section) => {
        if (!section.visible) return null;

        if (section.id === 'header') {
          return (
            <div
              key="header"
              className="p-3.5 rounded-2xl border border-stone-200/70 shadow-xs space-y-2.5 transition-all duration-300 relative z-20"
              style={{ backgroundColor: colors.cardSurface }}
            >
              <div className="flex items-center justify-between gap-2">
                {/* Rating with Header Confirmation Bounce */}
                <motion.span
                  animate={headerPulse ? { scale: [1, 1.25, 0.95, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-800 border border-amber-300/40 flex items-center gap-1 shadow-2xs"
                >
                  <span className="text-amber-500">★</span> {config?.rating || '4.9'}
                </motion.span>

                {/* Status Pill with Dynamic Pulse */}
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${
                      config?.statusPulse !== false ? 'animate-pulse' : ''
                    }`}
                  />
                  <span className="truncate max-w-[100px]">
                    {config?.statusText || 'مفتوح • ٢٠ د'}
                  </span>
                </span>

                {/* Simulated Cart Badge with Bounce */}
                <motion.div
                  animate={headerPulse ? { scale: [1, 1.35, 0.92, 1.1, 1], rotate: [0, -6, 6, 0] } : {}}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="px-2 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs relative shrink-0"
                  style={{ backgroundColor: colors.primary }}
                  title="سلة المتجر المحاكي"
                >
                  <ShoppingBag className="w-3 h-3 text-amber-300" />
                  <span>{simulatedCartCount}</span>
                  <AnimatePresence>
                    {headerPulse && (
                      <motion.span
                        key="cartPulse"
                        initial={{ y: 0, opacity: 1, scale: 0.7 }}
                        animate={{ y: -16, opacity: 0, scale: 1.25 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55 }}
                        className="absolute -top-3 start-0 text-[9px] font-black text-emerald-300 bg-stone-900/95 px-1 py-0.2 rounded-full border border-emerald-400/40 shadow-xs"
                      >
                        +1 🌸
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Logo / Monogram Seal */}
                <div
                  className="w-8 h-8 rounded-xl overflow-hidden text-amber-300 flex items-center justify-center font-serif text-xs font-bold shadow-xs border border-amber-400/40 shrink-0"
                  style={{ backgroundColor: colors.primary }}
                >
                  {config?.avatarUrl ? (
                    <img src={config.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span>{config?.avatarText || 'د.و'}</span>
                  )}
                </div>
              </div>

              {/* Store Title & Tagline */}
              <div className="text-center pt-0.5">
                <h2
                  className="font-black text-lg leading-tight"
                  style={{ fontFamily: headerFont, color: colors.textMain }}
                >
                  {config?.storeName || 'دار الورد للمناسبات'}
                </h2>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: colors.textMuted }}>
                  {config?.storeSubtitle || 'أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب'}
                </p>
                <div className="inline-flex items-center gap-1 text-[9px] font-medium text-stone-500 mt-1 px-2 py-0.5 rounded-full bg-stone-100/80">
                  <MapPin className="w-2.5 h-2.5 text-stone-400" />
                  <span>{config?.locationLabel || 'الرياض • التوصيل لكافة الأحياء'}</span>
                </div>
              </div>

              {/* Search Mockup */}
              <div className="pt-0.5">
                <div className="w-full py-1.5 px-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[10px] text-stone-400 flex items-center justify-between">
                  <span>ابحث عن باقة، فازة، أو مناسبة...</span>
                  <Search className="w-3 h-3 text-stone-400" />
                </div>
              </div>
            </div>
          );
        }

        if (section.id === 'occasions') {
          return (
            <div key="occasions" className="space-y-1.5 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span style={{ color: colors.textMain }}>المناسبات</span>
                <span className="text-[9px] text-stone-400">تصفح سريع</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'specials', name: 'جاهز اليوم', img: './images/occasions/occasion-ready-today.jpg' },
                  { id: 'grad', name: 'تخرج', img: './images/occasions/occasion-graduation.jpg' },
                  { id: 'romance', name: 'حب ورومانسية', img: './images/occasions/occasion-romance.jpg' },
                  { id: 'newborn', name: 'مواليد', img: './images/occasions/occasion-newborn.jpg' },
                ].map((occ) => (
                  <div key={occ.id} className="flex flex-col items-center gap-1 shrink-0">
                    <div
                      className="w-11 h-11 rounded-full p-0.5 border-2 shadow-2xs overflow-hidden transition-transform active:scale-95"
                      style={{ borderColor: colors.primary }}
                    >
                      <img
                        src={occ.img}
                        alt={occ.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = './images/products/royal-red-roses.jpg';
                        }}
                      />
                    </div>
                    <span
                      className="text-[9px] font-bold truncate max-w-[50px]"
                      style={{ color: colors.textMain }}
                    >
                      {occ.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (section.id === 'cooler') {
          return (
            <div
              key="cooler"
              className="p-2.5 rounded-2xl border border-stone-200/70 shadow-xs flex items-center justify-between gap-2.5 transition-all relative z-10"
              style={{ backgroundColor: colors.cardSurface }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="./images/products/royal-red-roses.jpg"
                  alt="Royal Roses"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 inline-block mb-0.5">
                    جاهز بالثلاجة ❄️
                  </span>
                  <h4 className="text-xs font-bold truncate" style={{ color: colors.textMain }}>
                    بوكيه الروز الملكي
                  </h4>
                  <span className="text-xs font-black" style={{ color: colors.priceColor }}>
                    245 ر.س
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="px-3 py-1.5 rounded-full text-white font-bold text-[10px] shadow-xs active:scale-95 shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                حجز فوري
              </button>
            </div>
          );
        }

        if (section.id === 'custom_banner') {
          return (
            <div
              key="custom_banner"
              className="p-2.5 rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-white flex items-center justify-between shadow-xs relative z-10"
            >
              <div>
                <span className="text-xs font-bold block">🎨 صمم باقتك الخاصة حسب ذوقك</span>
                <span className="text-[10px] text-stone-300 block">ننسقها بعناية حسب ميزانيتك</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] shrink-0 shadow-xs">
                طلب خاص
              </span>
            </div>
          );
        }

        if (section.id === 'catalog') {
          return (
            <div key="catalog" className="space-y-1.5 pt-1 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span style={{ color: colors.textMain }}>جميع التنسيقات الفاخرة</span>
                <span className="text-[9px] text-stone-400">4 باقات مختارة</span>
              </div>

              {/* Dynamic Grid Layout */}
              <div
                className={`grid gap-2 ${
                  gridLayout === '1col'
                    ? 'grid-cols-1'
                    : gridLayout === 'compact'
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : 'grid-cols-2'
                }`}
              >
                {sampleProducts.map((p, idx) => {
                  const isAdded = activeItemAdded === p.id;
                  const isMagazineSpan = gridLayout === 'magazine' && idx === 0;
                  const isBentoSpan = (gridLayout === 'bento' && idx === 0) || isMagazineSpan;

                  return (
                    <StudioSimulatedCard
                      key={p.id}
                      product={p}
                      index={idx}
                      config={config}
                      colors={colors}
                      catalogFont={catalogFont}
                      cardRadius={cardRadius}
                      isAdded={isAdded}
                      onAdd={handleAddProduct}
                      cardEntranceMotion={cardEntranceMotion}
                      staggerDelay={staggerDelay}
                      cardHoverEffect={cardHoverEffect}
                      buyButtonPhysics={buyButtonPhysics}
                      cardIdleMotion={config.cardIdleMotion}
                      cardImageMotion={config.cardImageMotion}
                      badgeMotion={config.badgeMotion}
                      cardShadow={cardShadow}
                      buyButtonStyle={buyButtonStyle}
                      fullTitleWrap={fullTitleWrap}
                      showBadges={showBadges}
                      badgeStyle={badgeStyle}
                      showFavoriteButton={showFavoriteButton}
                      replayKey={replayTrigger}
                      isBentoSpan={isBentoSpan}
                      cardAspectRatio={config.cardAspectRatio}
                      cardSurfaceMaterial={config.cardSurfaceMaterial}
                      cardBorderStyle={config.cardBorderStyle}
                      showImageOverlay={config.showImageOverlay}
                      showDeliveryBadge={config.showDeliveryBadge}
                      deliveryBadgeText={config.deliveryBadgeText}
                      showRatingStars={config.showRatingStars}
                      showDiscountBadge={config.showDiscountBadge}
                      showQuickView={config.showQuickView}
                      onQuickView={() => setToastMessage('معاينة تفاصيل الباقة الفاخرة ✨')}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function NoCodeLuxuryStudio({
  isOpen,
  onClose,
  renderPreviewContent,
}) {
  const {
    config,
    hasUnsavedChanges,
    activeTab,
    setActiveTab,
    updateField,
    applyPalette,
    toggleSection,
    moveSection,
    publishConfig,
    resetConfig,
    exportConfig,
    importConfig,
  } = useStudioStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [replayTrigger, setReplayTrigger] = useState(0);
  const [sandboxTrigger, setSandboxTrigger] = useState(0);
  const [sandboxHoverTrigger, setSandboxHoverTrigger] = useState(0);
  const [activePhysicsDemo, setActivePhysicsDemo] = useState(null);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handlePublish = () => {
    try {
      const ok = publishConfig();
      if (ok) {
        showToast('✨ تم نشر وتثبيت كافة التعديلات على المتجر بنجاح!');
      } else {
        showToast('تعذر حفظ التعديلات في الذاكرة');
      }
    } catch (err) {
      console.error('Failed to handle publish:', err);
      showToast('حدث خطأ أثناء نشر التعديلات');
    }
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية بالكامل؟')) {
      resetConfig();
      showToast('تمت استعادة الإعدادات الافتراضية');
    }
  };

  const handleExport = () => {
    exportConfig();
    showToast('تم تصدير ملف إعدادات الثيم (JSON)!');
  };

  const handleImportSubmit = () => {
    const ok = importConfig(importText);
    if (ok) {
      setShowImportModal(false);
      setImportText('');
      showToast('تم استيراد وتطبيق الثيم بنجاح!');
    } else {
      alert('خطأ: صيغة JSON غير صالحة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-fade-in" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-[#7E1529] text-white px-5 py-2.5 rounded-full shadow-2xl border border-rose-300/40 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Frame */}
      <div className="bg-[#FAF9F6] w-full max-w-7xl h-[95vh] rounded-[2.5rem] border border-stone-200 shadow-2xl flex flex-col overflow-hidden relative">
        {/* ======================================================== */}
        {/* TOP ACTION BAR                                           */}
        {/* ======================================================== */}
        <header className="px-5 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7E1529] text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-stone-900">
                  استوديو المظهر والحركة الفاخر
                </h2>
                {hasUnsavedChanges ? (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                    تعديلات غير منشورة
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    تم النشر والمزامنة
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                تحكم فوري بالهوية، الورود، الحركات، والبطاقات بمرونة No-Code فائقة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              title="تصدير الثيم JSON"
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تصدير</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              title="استيراد ثيم JSON"
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">استيراد</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="إعادة ضبط"
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-rose-600 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-2 rounded-xl bg-[#7E1529] hover:bg-[#600f1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>نشر التعديلات</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-all ms-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* MAIN BODY: SPLIT VIEWPORT & CONTROLS SIDEBAR             */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* IPHONE 16 VIEWPORT SIMULATION (Interactive 60fps) */}
          <div className="hidden lg:flex flex-1 bg-stone-100/80 p-6 items-center justify-center overflow-hidden relative select-none">
            {/* Centered Top Badge */}
            <div className="absolute top-3 inset-x-0 mx-auto w-fit z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-stone-700 shadow-sm border border-stone-200/60">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>معاينة المتجر الحية المباشرة (تفاعلي 60fps)</span>
            </div>

            {/* iPhone 16 Viewport Specification */}
            <div className="w-[380px] h-[760px] rounded-[44px] border-[8px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col relative bg-stone-900 ring-1 ring-stone-800">
              {/* Dynamic Island Pill */}
              <div className="h-7 w-full bg-neutral-900 flex justify-center items-center shrink-0">
                <div className="w-28 h-4 bg-black rounded-full flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                </div>
              </div>

              {/* Scrollable Storefront Preview Content */}
              <div
                className="flex-1 overflow-y-auto no-scrollbar relative transition-colors duration-300"
                style={{ backgroundColor: config?.colors?.canvasBg || '#FAF8F5' }}
              >
                {renderPreviewContent ? (
                  renderPreviewContent()
                ) : (
                  <StudioStorefrontLiveSimulation config={config} replayTrigger={replayTrigger} />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROLS SIDEBAR (Organized Tabs) */}
          <div className="w-full lg:w-[480px] xl:w-[520px] bg-white border-s border-stone-200 flex flex-col h-full overflow-hidden">
            {/* Tabs Header */}
            <div className="grid grid-cols-4 p-2 bg-stone-100/80 border-b border-stone-200 gap-1 shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'identity'
                    ? 'bg-white text-[#7E1529] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-rose-700" />
                <span>الهوية والزهور</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'colors'
                    ? 'bg-white text-[#7E1529] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Palette className="w-4 h-4 text-amber-700" />
                <span>الألوان والخطوط</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('motion')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'motion'
                    ? 'bg-white text-[#7E1529] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-700" />
                <span>الحركة والفيزياء</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'cards'
                    ? 'bg-white text-[#7E1529] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layout className="w-4 h-4 text-indigo-700" />
                <span>البطاقات والأقسام</span>
              </button>
            </div>

            {/* Tabs Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-sm">
              {/* ======================================================== */}
              {/* TAB 1: IDENTITY & BOTANICAL (الهوية والزهور)              */}
              {/* ======================================================== */}
              {activeTab === 'identity' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7E1529]" />
                      معلومات وهوية المتجر
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">اسم المتجر</label>
                      <input
                        type="text"
                        value={config.storeName}
                        onChange={(e) => updateField('storeName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7E1529]/30"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">الوصف الترويجي (السطر التعريفي)</label>
                      <input
                        type="text"
                        value={config.storeSubtitle}
                        onChange={(e) => updateField('storeSubtitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#7E1529]/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">شارة الحالة والتجهيز</label>
                        <input
                          type="text"
                          value={config.statusText}
                          onChange={(e) => updateField('statusText', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">نص التقييم</label>
                        <input
                          type="text"
                          value={config.rating}
                          onChange={(e) => updateField('rating', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">نبض النقطة الخضراء للحالة الحية</span>
                        <span className="text-[11px] text-stone-500">وميض تفاعلي يشير إلى استقبال وتجهيز الطلبات الآن</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('statusPulse', !config.statusPulse)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.statusPulse ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.statusPulse ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">نص أيقونة الشعار (Avatar)</label>
                        <input
                          type="text"
                          value={config.avatarText}
                          onChange={(e) => updateField('avatarText', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">رقم الهاتف (واتساب/اتصال)</label>
                        <input
                          type="text"
                          value={config.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: COLORS & TYPOGRAPHY (الألوان والخطوط)              */}
              {/* ======================================================== */}
              {activeTab === 'colors' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-rose-700" />
                      لوحات الألوان الملكية الجاهزة (One-Click Palettes)
                    </h3>

                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'royalBurgundy', nameAr: 'بورغندي ملكي', nameEn: 'Royal Burgundy', colors: ['#7E1529', '#BE123C', '#FAF8F5'] },
                        { id: 'deepForest', nameAr: 'أخضر الغابات', nameEn: 'Deep Forest', colors: ['#123524', '#10B981', '#FAF9F6'] },
                        { id: 'rosaNoir', nameAr: 'نوار دافئ', nameEn: 'Rosa Noir Luxury', colors: ['#1C1917', '#D4AF37', '#111827'] },
                        { id: 'velvetBlush', nameAr: 'مخمل وزهر', nameEn: 'Velvet Blush', colors: ['#9D174D', '#BE185D', '#FFF8F9'] },
                      ].map((pal) => (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => applyPalette(pal.id)}
                          className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                            config.paletteId === pal.id
                              ? 'border-[#7E1529] ring-2 ring-[#7E1529]/20 bg-white shadow-xs'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {pal.colors.map((c, i) => (
                              <span
                                key={i}
                                className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-stone-900 block">{pal.nameAr}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{pal.nameEn}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900">محدد الألوان المخصص (Custom Pickers)</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">اللون الأساسي (Primary)</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white">
                          <input
                            type="color"
                            value={config.colors?.primary || '#7E1529'}
                            onChange={(e) =>
                              updateField('colors', { ...config.colors, primary: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-stone-600">{config.colors?.primary || '#7E1529'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">اللون الثانوي / الذهب</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white">
                          <input
                            type="color"
                            value={config.colors?.secondary || '#BE123C'}
                            onChange={(e) =>
                              updateField('colors', { ...config.colors, secondary: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-stone-600">{config.colors?.secondary || '#BE123C'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">خلفية الصفحة (Canvas)</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white">
                          <input
                            type="color"
                            value={config.colors?.canvasBg || '#FAF8F5'}
                            onChange={(e) =>
                              updateField('colors', { ...config.colors, canvasBg: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-stone-600">{config.colors?.canvasBg || '#FAF8F5'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">لون عرض الأسعار (Price)</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white">
                          <input
                            type="color"
                            value={config.colors?.priceColor || '#7E1529'}
                            onChange={(e) =>
                              updateField('colors', { ...config.colors, priceColor: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-stone-600">{config.colors?.priceColor || '#7E1529'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography System */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900">التحكم في الخطوط العربية (Typography)</h3>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">خط الهيدر وعنوان المتجر</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'Amiri', label: 'أميري (Amiri الملكي)' },
                          { id: 'Aref Ruqaa', label: 'عارف رقعة (Aref Ruqaa)' },
                          { id: 'Playfair Display', label: 'بلايفير (Playfair)' },
                          { id: 'Cairo', label: 'كايرو عصري (Cairo)' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() =>
                              updateField('typography', { ...config.typography, headerFont: f.id })
                            }
                            className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                              config.typography?.headerFont === f.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                        <span>حجم الخط الأساسي</span>
                        <span className="font-mono text-rose-800 font-bold">{config.typography?.baseFontSize || 15}px</span>
                      </div>
                      <input
                        type="range"
                        min="13"
                        max="18"
                        value={config.typography?.baseFontSize || 15}
                        onChange={(e) =>
                          updateField('typography', { ...config.typography, baseFontSize: Number(e.target.value) })
                        }
                        className="w-full accent-[#7E1529] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: MOTION & PHYSICS (الحركة والفيزياء)                 */}
              {/* ======================================================== */}
              {activeTab === 'motion' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-700" />
                      أنيميشن دخول وظهور البطاقات (Entrance Stagger)
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'fade_up', label: 'انسياب للأعلى (Fade Up)' },
                        { id: 'elastic_scale', label: 'تمدد مرن (Elastic Scale)' },
                        { id: 'slide', label: 'انزلاق جانبي (Slide)' },
                        { id: 'flip_3d', label: 'تدوير ثلاثي الأبعاد (3D Flip)' },
                        { id: 'blur_in', label: 'تلاشي سينمائي (Blur Reveal)' },
                        { id: 'pop_bounce', label: 'ارتداد مبهج (Pop Bounce)' },
                        { id: 'waterfall_drop', label: 'شلال متساقط (Waterfall Drop 💧)' },
                        { id: 'spiral_bloom', label: 'تفتح لولبي (Spiral Bloom 🌸)' },
                        { id: 'cinematic_zoom', label: 'زووم سينمائي (Cinematic Zoom 🎬)' },
                        { id: 'none', label: 'فوري (بدون أنيميشن)' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            updateField('cardEntranceMotion', m.id);
                            setReplayTrigger((prev) => prev + 1);
                          }}
                          className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                            config.cardEntranceMotion === m.id
                              ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                        <span>فارق التتابع الزمني بين البطاقات (Stagger Delay)</span>
                        <span className="font-mono text-rose-800 font-bold">{config.staggerDelay}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.25"
                        step="0.01"
                        value={config.staggerDelay}
                        onChange={(e) => {
                          updateField('staggerDelay', Number(e.target.value));
                          setReplayTrigger((prev) => prev + 1);
                        }}
                        className="w-full accent-[#7E1529] cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setReplayTrigger((prev) => prev + 1)}
                      className="w-full mt-2.5 py-2 px-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                      <span>إعادة تشغيل ومعاينة حركة الدخول والتتابع الآن</span>
                    </button>
                  </div>

                  {/* Physics & Hover */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          فيزياء زر الشراء (Add-to-Cart Physics)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">اضغط لتجربة الحركة</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'morph_checkmark', label: 'تحول للعلامة (Morph ✓)' },
                          { id: 'ripple_wave', label: 'موجة ضوئية (Ripple 🌊)' },
                          { id: 'fly_to_cart', label: 'طيران للسلة (Fly to Cart 🌸)' },
                          { id: 'sparkle_burst', label: 'تناثر نجوم ذهبية (Sparkles ✨)' },
                          { id: 'haptic_pop', label: 'نبض تفاعلي (Haptic Pop 💓)' },
                          { id: 'flower_bloom', label: 'تفتح زهور الورد (Flower Bloom 🌺)' },
                          { id: 'confetti_shower', label: 'مطر احتفال وقصاصات (Confetti 🎉)' },
                          { id: 'golden_stamp', label: 'ختم الشمع الملكي (Wax Stamp 👑)' },
                          { id: 'heart_burst', label: 'تناثر قلوب إعجاب (Heart Burst 💖)' },
                          { id: 'magnet_snap', label: 'انجذاب مغناطيسي (Magnet Snap 🧲)' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              updateField('buyButtonPhysics', b.id);
                              setActivePhysicsDemo(b.id);
                              setSandboxTrigger((prev) => prev + 1);
                              setTimeout(() => setActivePhysicsDemo(null), 1500);
                            }}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 relative overflow-visible ${
                              config.buyButtonPhysics === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {/* Live Demo Particle over Clicked Option */}
                            {activePhysicsDemo === b.id && b.id === 'fly_to_cart' && (
                              <motion.span
                                initial={{ y: 0, opacity: 1, scale: 0.8 }}
                                animate={{ y: -38, opacity: 0, scale: 1.6, rotate: 180 }}
                                transition={{ duration: 0.75, ease: 'easeOut' }}
                                className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none text-base z-30 filter drop-shadow-md"
                              >
                                🌸
                              </motion.span>
                            )}
                            {activePhysicsDemo === b.id && b.id === 'sparkle_burst' && (
                              <motion.span
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 1.4, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-amber-300 font-black z-30"
                              >
                                ✨ ✦ ✨
                              </motion.span>
                            )}
                            {activePhysicsDemo === b.id && b.id === 'flower_bloom' && (
                              <motion.span
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 1.4, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none text-base z-30"
                              >
                                🌺
                              </motion.span>
                            )}
                            {activePhysicsDemo === b.id && b.id === 'confetti_shower' && (
                              <motion.span
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 1.3, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none text-xs z-30"
                              >
                                🎉 ✨ 🎊
                              </motion.span>
                            )}
                            {activePhysicsDemo === b.id && b.id === 'golden_stamp' && (
                              <motion.span
                                initial={{ scale: 1.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none text-xs font-bold text-amber-300 z-30"
                              >
                                👑 ملكي
                              </motion.span>
                            )}
                            {activePhysicsDemo === b.id && b.id === 'heart_burst' && (
                              <motion.span
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 1.4, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-rose-500 z-30"
                              >
                                💖 💖
                              </motion.span>
                            )}
                            {activePhysicsDemo === b.id && b.id === 'morph_checkmark' && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-block me-1 text-emerald-300 font-bold"
                              >
                                ✓
                              </motion.span>
                            )}
                            <span>{b.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Interactive Physics Feedback & 1-Click Tester */}
                      <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50/90 border border-rose-200/80 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg animate-bounce">
                            {config.buyButtonPhysics === 'fly_to_cart'
                              ? '🌸'
                              : config.buyButtonPhysics === 'flower_bloom'
                              ? '🌺'
                              : config.buyButtonPhysics === 'confetti_shower'
                              ? '🎉'
                              : config.buyButtonPhysics === 'golden_stamp'
                              ? '👑'
                              : config.buyButtonPhysics === 'heart_burst'
                              ? '💖'
                              : config.buyButtonPhysics === 'magnet_snap'
                              ? '🧲'
                              : '✨'}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-stone-900 block truncate">
                              {config.buyButtonPhysics === 'fly_to_cart'
                                ? 'حركة طيران للسلة مفعّلة بنجاح 🌸'
                                : config.buyButtonPhysics === 'flower_bloom'
                                ? 'تفتح زهور الورد التفاعلي مفعّل 🌺'
                                : config.buyButtonPhysics === 'confetti_shower'
                                ? 'مطر قصاصات واحتفال مبهج مفعّل 🎉'
                                : config.buyButtonPhysics === 'golden_stamp'
                                ? 'ختم الشمع الذهبي الملكي مفعّل 👑'
                                : config.buyButtonPhysics === 'heart_burst'
                                ? 'تناثر قلوب إعجاب رومانسية 💖'
                                : config.buyButtonPhysics === 'magnet_snap'
                                ? 'انجذاب مغناطيسي حركي سريع 🧲'
                                : config.buyButtonPhysics === 'sparkle_burst'
                                ? 'تناثر نجوم ذهبية متألقة ✨'
                                : config.buyButtonPhysics === 'morph_checkmark'
                                ? 'تحول سلس لعلامة التأكيد ✓'
                                : config.buyButtonPhysics === 'ripple_wave'
                                ? 'موجة ضوئية دائرية انسيابية 🌊'
                                : 'نبض تفاعلي هابتيك 💓'}
                            </span>
                            <span className="text-[10px] text-stone-500 block truncate">
                              {config.buyButtonPhysics === 'fly_to_cart'
                                ? 'تطير الوردة بنعومة فائقة إلى السلة عند نقر زر الشراء'
                                : 'تأثير بصري تفاعلي فاخر فوري عند نقر زر الإضافة'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActivePhysicsDemo(config.buyButtonPhysics || 'fly_to_cart');
                            setSandboxTrigger((prev) => prev + 1);
                            setTimeout(() => setActivePhysicsDemo(null), 1500);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#7E1529] hover:bg-[#600f1f] text-white text-[11px] font-bold shrink-0 shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>🚀 جرّب الحركة فوراً</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          تأثير التمرير والتفاعل مع البطاقة (Card Hover & FX)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">اختر ومرر لتجربة التأثير</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'zoom_soft', label: 'تكبير ناعم (Zoom)' },
                          { id: 'tilt_3d', label: 'ميلان ثلاثي الأبعاد (3D Tilt)' },
                          { id: 'gold_glow', label: 'توهج ذهبي (Glow)' },
                          { id: 'lift_shadow', label: 'ارتفاع عائم فاخر (Lift)' },
                          { id: 'sheen_shine', label: 'انعكاس سائل (Sheen)' },
                          { id: 'border_beam', label: 'شعاع إطار ضوئي (Border Beam ✨)' },
                          { id: 'crystal_glass', label: 'موشور بلوري (Crystal Glass 💎)' },
                          { id: 'parallax_depth', label: 'عمق بارالاكس (Parallax 🌌)' },
                          { id: 'aurora_pulse', label: 'شفق قطبي متوهج (Aurora Pulse 🌈)' },
                          { id: 'spotlight_glow', label: 'كشاف تفاعلي (Spotlight 🔦)' },
                        ].map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => {
                              updateField('cardHoverEffect', h.id);
                              setSandboxHoverTrigger((prev) => prev + 1);
                            }}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              config.cardHoverEffect === h.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* New: Card Idle / Ambient Floating Motion */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          حركة البطاقات أثناء السكون (Card Ambient Motion)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">حركة تلقائية حية وهادئة</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'none', label: 'سكون ثابت (Static)' },
                          { id: 'gentle_float', label: 'طفو انسيابي ناعم (Float 🌊)' },
                          { id: 'breathe_pulse', label: 'نبض تنفس هادئ (Breathe 🫀)' },
                          { id: 'subtle_sheen_loop', label: 'بريق لمعان دوري (Sheen Loop ✨)' },
                          { id: 'gentle_sway', label: 'تمايل نسيم رقيق (Sway 🍃)' },
                        ].map((im) => (
                          <button
                            key={im.id}
                            type="button"
                            onClick={() => updateField('cardIdleMotion', im.id)}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              (config.cardIdleMotion || 'none') === im.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {im.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* New: Image Hover & Reveal FX */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          أنيميشن تفاعل صورة الباقة (Image Hover FX)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">تأثير تفاعلي على زهور الباقة</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'zoom_in', label: 'زووم ناعم (Zoom In)' },
                          { id: 'ken_burns', label: 'كين بيرنز سينمائي (Ken Burns 🎬)' },
                          { id: 'vivid_chroma', label: 'ألوان حيوية (Vivid Chroma 🎨)' },
                          { id: 'depth_tilt', label: 'عمق ورفع بصري (Depth Tilt 📦)' },
                          { id: 'soft_vignette', label: 'تركيز بؤري ناعم (Vignette 👁️)' },
                        ].map((imgFx) => (
                          <button
                            key={imgFx.id}
                            type="button"
                            onClick={() => updateField('cardImageMotion', imgFx.id)}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              (config.cardImageMotion || 'zoom_in') === imgFx.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {imgFx.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* New: Badge Motion */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          أنيميشن شارات التميز (Badge Motion)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">حركة الشارات وشريط جاهز الآن</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { id: 'static', label: 'ثابت هادئ (Static)' },
                          { id: 'pulse_dot', label: 'نبض حي متوهج (Pulse 🟢)' },
                          { id: 'shimmer_gold', label: 'بريق ذهبي ملكي (Shimmer ✨)' },
                          { id: 'float_badge', label: 'طفو بالوني خفيف (Float 🎈)' },
                        ].map((bm) => (
                          <button
                            key={bm.id}
                            type="button"
                            onClick={() => updateField('badgeMotion', bm.id)}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              (config.badgeMotion || 'pulse_dot') === bm.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {bm.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Integrated Interactive Sandbox Card */}
                    <StudioMotionSandboxCard
                      cardHoverEffect={config.cardHoverEffect || 'zoom_soft'}
                      buyButtonPhysics={config.buyButtonPhysics || 'sparkle_burst'}
                      cardIdleMotion={config.cardIdleMotion || 'none'}
                      cardImageMotion={config.cardImageMotion || 'zoom_in'}
                      badgeMotion={config.badgeMotion || 'pulse_dot'}
                      primaryColor={config?.colors?.primary || '#7E1529'}
                      cardRadius={config?.cardBorderRadius || 22}
                      triggerCount={sandboxTrigger}
                      hoverTriggerCount={sandboxHoverTrigger}
                    />
                  </div>

                  {/* Ambient Rose Petals Overlay */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">بتلات الورد العائمة (Floating Petals)</span>
                        <span className="text-[11px] text-stone-500">بتلات زهور تتساقط برقة وانسيابية فوق الشاشة</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('floatingPetalsEnabled', !config.floatingPetalsEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.floatingPetalsEnabled ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.floatingPetalsEnabled ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    {config.floatingPetalsEnabled && (
                      <div className="space-y-3 pt-2 border-t border-stone-200/60 animate-fade-in">
                        <div>
                          <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                            طراز ولون البتلات (Petals Palette)
                          </label>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {[
                              { id: 'rose_red', label: '🌹 روز جوري ملكي' },
                              { id: 'sakura_pink', label: '🌸 ساكورا زهرية' },
                              { id: 'gold_luxury', label: '✨ شذرات ذهبية' },
                            ].map((pt) => (
                              <button
                                key={pt.id}
                                type="button"
                                onClick={() => updateField('petalsType', pt.id)}
                                className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                                  (config.petalsType || 'rose_red') === pt.id
                                    ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                }`}
                              >
                                {pt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                            سرعة الانسياب والسقوط (Fall Pace)
                          </label>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {[
                              { id: 'gentle', label: 'هادئ وبطيء' },
                              { id: 'normal', label: 'طبيعي متوازن' },
                              { id: 'breeze', label: 'نسيم عاطر سريع' },
                            ].map((ps) => (
                              <button
                                key={ps.id}
                                type="button"
                                onClick={() => updateField('petalsSpeed', ps.id)}
                                className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                                  (config.petalsSpeed || 'normal') === ps.id
                                    ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                }`}
                              >
                                {ps.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                            <span>كثافة البتلات</span>
                            <span className="font-mono text-rose-800 font-bold">{config.petalsCount} بتلة</span>
                          </div>
                          <input
                            type="range"
                            min="6"
                            max="24"
                            value={config.petalsCount}
                            onChange={(e) => updateField('petalsCount', Number(e.target.value))}
                            className="w-full accent-[#7E1529] cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                            <span>شفافية البتلات</span>
                            <span className="font-mono text-rose-800 font-bold">{Math.round(config.petalsOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="0.9"
                            step="0.05"
                            value={config.petalsOpacity}
                            onChange={(e) => updateField('petalsOpacity', Number(e.target.value))}
                            className="w-full accent-[#7E1529] cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: CARDS & SECTIONS (البطاقات والأقسام)                */}
              {/* ======================================================== */}
              {activeTab === 'cards' && (
                <div className="space-y-5 animate-fade-in">
                  {/* 1. Grid Layout & Card Geometry */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-indigo-700" />
                      تخطيط الشبكة وهندسة البطاقات
                    </h3>

                    {/* Grid Layouts - 5 Options */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        نمط شبكة المنتجات (Grid Layout)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'bento', label: 'بينتو غير متماثل (Bento)', desc: 'باقة أولى عريضة' },
                          { id: 'magazine', label: 'مجلة تحريرية (Magazine)', desc: 'ستايل دوريات الموضة' },
                          { id: '2cols', label: 'عمودين متناسقين', desc: 'متوازن ومرتب' },
                          { id: '1col', label: 'عمود واحد عريض', desc: 'عرض صور سينمائي كبير' },
                          { id: 'compact', label: 'شبكة مدمجة (Compact)', desc: 'عرض سريع لكافة الباقات' },
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => updateField('gridLayout', g.id)}
                            className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                              config.gridLayout === g.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span className="text-xs font-bold leading-tight">{g.label}</span>
                            <span className={`text-[10px] mt-1 ${config.gridLayout === g.id ? 'text-rose-100' : 'text-stone-400'}`}>
                              {g.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Aspect Ratio - 3 Options */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        نسبة أبعاد صور المنتجات (Image Aspect Ratio)
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'aspect_4_5', label: '٤:٥ عمودي فاخر (Portrait)', icon: '🏛️' },
                          { id: 'aspect_1_1', label: '١:١ مربع كلاسيكي (Square)', icon: '◽' },
                          { id: 'aspect_3_4', label: '٣:٤ سينمائي أنيق (Editorial)', icon: '📐' },
                        ].map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => updateField('cardAspectRatio', a.id)}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                              config.cardAspectRatio === a.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span className="block text-sm mb-0.5">{a.icon}</span>
                            <span className="text-[11px] font-semibold">{a.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                        <span>انحناء زوايا البطاقات (Border Radius)</span>
                        <span className="font-mono text-rose-800 font-bold">{config.cardBorderRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        value={config.cardBorderRadius}
                        onChange={(e) => updateField('cardBorderRadius', Number(e.target.value))}
                        className="w-full accent-[#7E1529] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                        <span>حادة (0px)</span>
                        <span>ناعمة (16px)</span>
                        <span>دائرية كبسولية (32px)</span>
                      </div>
                    </div>

                    {/* Shadow & Depth - 5 Options */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        شدة الظل والعمق (Card Shadow)
                      </label>
                      <div className="grid grid-cols-5 gap-1.5 text-xs">
                        {[
                          { id: 'none', label: 'بدون' },
                          { id: 'soft', label: 'ناعم' },
                          { id: 'medium', label: 'متوسط' },
                          { id: 'high', label: 'مرتفع' },
                          { id: 'gold_glow', label: 'هالة ذهبية ✨' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => updateField('cardShadow', s.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
                              config.cardShadow === s.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span className="text-[11px]">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. Luxury Materials & Rims (فخامة الخامات والأسطح) */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      فخامة الخامات وإطارات البطاقة (Luxury Finish)
                    </h3>

                    {/* Card Surface Material */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        خامة وسطح البطاقة (Card Surface Material)
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'pure_white', label: 'أبيض ناصع (Pure White)', desc: 'نقاء كلاسيكي فاخر' },
                          { id: 'frosted_glass', label: 'زجاج مثلج (Glassmorphic)', desc: 'شفافية عصرية مع بلور ناعم' },
                          { id: 'warm_ivory', label: 'عاجي فرنسي دافئ (Ivory)', desc: 'طابع هدايا باريسي دافئ' },
                          { id: 'velvet_dark', label: 'مخملي ملكي داكن (Dark Velvet)', desc: 'فخامة ليلية عميقة' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateField('cardSurfaceMaterial', m.id)}
                            className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                              config.cardSurfaceMaterial === m.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span className="text-xs font-bold leading-tight">{m.label}</span>
                            <span className={`text-[10px] mt-1 ${config.cardSurfaceMaterial === m.id ? 'text-rose-100' : 'text-stone-400'}`}>
                              {m.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Border & Rim Style */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        نمط إطار وحواف البطاقة (Card Rim & Stroke)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { id: 'hairline', label: 'حد حريري ناعم' },
                          { id: 'gold_rim', label: 'إطار ذهبي ملكي' },
                          { id: 'glow_rim', label: 'هالة وردية مشعة' },
                          { id: 'none', label: 'بدون إطار عائم' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => updateField('cardBorderStyle', r.id)}
                            className={`py-2 px-1 rounded-xl border text-center transition-all ${
                              config.cardBorderStyle === r.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span className="text-[11px]">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cinematic Image Bottom Vignette */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">تدرج سينمائي أسفل الصورة (Cinematic Vignette)</span>
                        <span className="text-[11px] text-stone-500">تظليل متدرج ناعم يحمي تباين العناوين والأسعار على خلفيات الزهور الفاتحة</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('showImageOverlay', !config.showImageOverlay)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.showImageOverlay ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.showImageOverlay ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* 3. Card Anatomy & Conversion Boosters */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      تشريح عناصر البطاقة والتسويق (Card Anatomy & Conversion)
                    </h3>

                    {/* Buy Button Styles - 4 Options */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        شكل زر الشراء التفاعلي
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { id: 'pill_add', label: 'كبسولة (+ أضف)' },
                          { id: 'circle_plus', label: 'دائري (+)' },
                          { id: 'full_width', label: 'شريط كامل' },
                          { id: 'split_price', label: 'زر السعر المدمج' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateField('buyButtonStyle', b.id)}
                            className={`py-2 px-1 rounded-xl border text-center transition-all ${
                              config.buyButtonStyle === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span className="text-[11px] font-semibold">{b.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Express Delivery Badge */}
                    <div className="pt-2 border-t border-stone-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-stone-800 block">شارة سرعة التوصيل والجاهزية (Express Delivery)</span>
                          <span className="text-[11px] text-stone-500">إظهار وسم التوصيل الفوري تحت اسم المنتج لتحفيز الشراء السريع</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateField('showDeliveryBadge', !config.showDeliveryBadge)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            config.showDeliveryBadge ? 'bg-[#7E1529]' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              config.showDeliveryBadge ? 'left-1' : 'right-1'
                            }`}
                          />
                        </button>
                      </div>
                      {config.showDeliveryBadge && (
                        <input
                          type="text"
                          value={config.deliveryBadgeText || 'توصيل ساعتين • مبرد ⚡'}
                          onChange={(e) => updateField('deliveryBadgeText', e.target.value)}
                          placeholder="نص الشارة، مثلاً: توصيل ساعتين • مبرد ⚡"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7E1529]/30"
                        />
                      )}
                    </div>

                    {/* Social Proof Star Rating */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">تقييم النجوم الذهبية وتأكيد الجودة (Social Proof)</span>
                        <span className="text-[11px] text-stone-500">إظهار نجوم التقييم ★ ٤.٩ تحت كل منتج لتعزيز ثقة العميل بالمتجر</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('showRatingStars', !config.showRatingStars)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.showRatingStars ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.showRatingStars ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Original Price & Discount Pill */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">عرض السعر الأصلي وشارة التوفير (Discount Pill)</span>
                        <span className="text-[11px] text-stone-500">إبراز السعر المشطوب مع كبسولة نسبة التوفير الأنيقة (وفر ١٥٪)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('showDiscountBadge', !config.showDiscountBadge)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.showDiscountBadge ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.showDiscountBadge ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Quick View Eye Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">زر نظرة سريعة على الباقة (Quick Look / View)</span>
                        <span className="text-[11px] text-stone-500">أيقونة عين تفاعلية لتكبير ومعاينة تفاصيل الباقة مباشرة دون مغادرة الصفحة</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('showQuickView', !config.showQuickView)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.showQuickView ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.showQuickView ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Full Title Wrap */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">عرض العناوين بالكامل</span>
                        <span className="text-[11px] text-stone-500">التفاف سلس في سطرين دون قطع بالنقاط (...)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('fullTitleWrap', !config.fullTitleWrap)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.fullTitleWrap ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.fullTitleWrap ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Badges Toggle & Styles (4 styles) */}
                    <div className="pt-2 border-t border-stone-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-stone-800 block">شارات التمييز (جاهز الآن / قطعة واحدة)</span>
                          <span className="text-[11px] text-stone-500">إظهار أو إخفاء الشارات بأعلى الصور</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateField('showBadges', !config.showBadges)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            config.showBadges ? 'bg-[#7E1529]' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              config.showBadges ? 'left-1' : 'right-1'
                            }`}
                          />
                        </button>
                      </div>

                      {config.showBadges && (
                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
                          {[
                            { id: 'glassmorphic', label: 'زجاجي مثلج (Glassmorphic)' },
                            { id: 'solid_pastel', label: 'باستيل مصمت (Pastel)' },
                            { id: 'royal_gold', label: 'ذهبي مذهب ملكي (Gold Foil)' },
                            { id: 'dark_velvet', label: 'أسود مخملي فاخر (Dark Velvet)' },
                          ].map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => updateField('badgeStyle', b.id)}
                              className={`py-2 rounded-xl border text-center transition-all ${
                                config.badgeStyle === b.id
                                  ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Heart Favorite Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">زر المفضلة (القلب)</span>
                        <span className="text-[11px] text-stone-500">زر حفظ الإعجابات أعلى الصور لتسهيل مقارنة الباقات</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('showFavoriteButton', !config.showFavoriteButton)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.showFavoriteButton ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.showFavoriteButton ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* 4. Card Motion, Animations & Physics (حركات وأنيميشن وفيزياء البطاقات) */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                      <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        حركات وأنيميشن وفيزياء البطاقات (Card Motion & Physics)
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                        مباشر ⚡
                      </span>
                    </div>

                    {/* Entrance Stagger - 10 Options */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          أنيميشن دخول وظهور البطاقات (Entrance Stagger)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">10 حركات</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'fade_up', label: 'انسياب للأعلى (Fade Up)' },
                          { id: 'elastic_scale', label: 'تمدد مرن (Elastic Scale)' },
                          { id: 'slide', label: 'انزلاق جانبي (Slide)' },
                          { id: 'flip_3d', label: 'تدوير ثلاثي الأبعاد (3D Flip)' },
                          { id: 'blur_in', label: 'تلاشي سينمائي (Blur Reveal)' },
                          { id: 'pop_bounce', label: 'ارتداد مبهج (Pop Bounce)' },
                          { id: 'waterfall_drop', label: 'شلال متساقط (Waterfall Drop 💧)' },
                          { id: 'spiral_bloom', label: 'تفتح لولبي (Spiral Bloom 🌸)' },
                          { id: 'cinematic_zoom', label: 'زووم سينمائي (Cinematic Zoom 🎬)' },
                          { id: 'none', label: 'فوري (بدون أنيميشن)' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              updateField('cardEntranceMotion', m.id);
                              setReplayTrigger((prev) => prev + 1);
                            }}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                              config.cardEntranceMotion === m.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                          <span>فارق التتابع الزمني (Stagger Delay)</span>
                          <span className="font-mono text-rose-800 font-bold">{config.staggerDelay}s</span>
                        </div>
                        <input
                          type="range"
                          min="0.02"
                          max="0.25"
                          step="0.01"
                          value={config.staggerDelay}
                          onChange={(e) => {
                            updateField('staggerDelay', Number(e.target.value));
                            setReplayTrigger((prev) => prev + 1);
                          }}
                          className="w-full accent-[#7E1529] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Buy Button Physics - 10 Options */}
                    <div className="pt-2 border-t border-stone-200/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          فيزياء زر الشراء (Add-to-Cart Physics)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">10 تأثيرات</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'morph_checkmark', label: 'تحول للعلامة (Morph ✓)' },
                          { id: 'ripple_wave', label: 'موجة ضوئية (Ripple 🌊)' },
                          { id: 'fly_to_cart', label: 'طيران للسلة (Fly to Cart 🌸)' },
                          { id: 'sparkle_burst', label: 'تناثر نجوم ذهبية (Sparkles ✨)' },
                          { id: 'haptic_pop', label: 'نبض تفاعلي (Haptic Pop 💓)' },
                          { id: 'flower_bloom', label: 'تفتح زهور الورد (Flower Bloom 🌺)' },
                          { id: 'confetti_shower', label: 'مطر احتفال وقصاصات (Confetti 🎉)' },
                          { id: 'golden_stamp', label: 'ختم الشمع الملكي (Wax Stamp 👑)' },
                          { id: 'heart_burst', label: 'تناثر قلوب إعجاب (Heart Burst 💖)' },
                          { id: 'magnet_snap', label: 'انجذاب مغناطيسي (Magnet Snap 🧲)' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              updateField('buyButtonPhysics', b.id);
                              setActivePhysicsDemo(b.id);
                              setSandboxTrigger((prev) => prev + 1);
                              setTimeout(() => setActivePhysicsDemo(null), 1500);
                            }}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              config.buyButtonPhysics === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span>{b.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Hover Effect - 10 Options */}
                    <div className="pt-2 border-t border-stone-200/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          تأثير التمرير والتفاعل مع البطاقة (Card Hover FX)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">10 تأثيرات</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'zoom_soft', label: 'تكبير ناعم (Zoom)' },
                          { id: 'tilt_3d', label: 'ميلان ثلاثي الأبعاد (3D Tilt)' },
                          { id: 'gold_glow', label: 'توهج ذهبي (Glow)' },
                          { id: 'lift_shadow', label: 'ارتفاع عائم فاخر (Lift)' },
                          { id: 'sheen_shine', label: 'انعكاس سائل (Sheen)' },
                          { id: 'border_beam', label: 'شعاع إطار ضوئي (Border Beam ✨)' },
                          { id: 'crystal_glass', label: 'موشور بلوري (Crystal Glass 💎)' },
                          { id: 'parallax_depth', label: 'عمق بارالاكس (Parallax 🌌)' },
                          { id: 'aurora_pulse', label: 'شفق قطبي متوهج (Aurora Pulse 🌈)' },
                          { id: 'spotlight_glow', label: 'كشاف تفاعلي (Spotlight 🔦)' },
                        ].map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => {
                              updateField('cardHoverEffect', h.id);
                              setSandboxHoverTrigger((prev) => prev + 1);
                            }}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              config.cardHoverEffect === h.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Ambient Motion - 5 Options */}
                    <div className="pt-2 border-t border-stone-200/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          حركة البطاقات أثناء السكون (Card Ambient Motion)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">حركة حية هادئة</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'none', label: 'سكون ثابت (Static)' },
                          { id: 'gentle_float', label: 'طفو انسيابي ناعم (Float 🌊)' },
                          { id: 'breathe_pulse', label: 'نبض تنفس هادئ (Breathe 🫀)' },
                          { id: 'subtle_sheen_loop', label: 'بريق لمعان دوري (Sheen Loop ✨)' },
                          { id: 'gentle_sway', label: 'تمايل نسيم رقيق (Sway 🍃)' },
                        ].map((im) => (
                          <button
                            key={im.id}
                            type="button"
                            onClick={() => updateField('cardIdleMotion', im.id)}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              (config.cardIdleMotion || 'none') === im.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {im.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Hover FX - 5 Options */}
                    <div className="pt-2 border-t border-stone-200/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          أنيميشن تفاعل صورة الباقة (Image Hover FX)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">تفاعل زهور الباقة</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'zoom_in', label: 'زووم ناعم (Zoom In)' },
                          { id: 'ken_burns', label: 'سينمائي (Ken Burns 🎬)' },
                          { id: 'vivid_chroma', label: 'ألوان حيوية (Vivid 🎨)' },
                          { id: 'depth_tilt', label: 'عمق ورفع (Depth Tilt 📦)' },
                          { id: 'soft_vignette', label: 'تركيز بؤري (Vignette 👁️)' },
                        ].map((imgFx) => (
                          <button
                            key={imgFx.id}
                            type="button"
                            onClick={() => updateField('cardImageMotion', imgFx.id)}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              (config.cardImageMotion || 'zoom_in') === imgFx.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {imgFx.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Badge Motion - 4 Options */}
                    <div className="pt-2 border-t border-stone-200/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-stone-700 block">
                          أنيميشن شارات التميز (Badge Motion)
                        </label>
                        <span className="text-[10px] text-stone-400 font-medium">حركة الشارات</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { id: 'static', label: 'ثابت (Static)' },
                          { id: 'pulse_dot', label: 'نبض حي (Pulse 🟢)' },
                          { id: 'shimmer_gold', label: 'بريق (Shimmer ✨)' },
                          { id: 'float_badge', label: 'طفو (Float 🎈)' },
                        ].map((bm) => (
                          <button
                            key={bm.id}
                            type="button"
                            onClick={() => updateField('badgeMotion', bm.id)}
                            className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              (config.badgeMotion || 'pulse_dot') === bm.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {bm.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Integrated Interactive Sandbox Card */}
                    <StudioMotionSandboxCard
                      cardHoverEffect={config.cardHoverEffect || 'zoom_soft'}
                      buyButtonPhysics={config.buyButtonPhysics || 'sparkle_burst'}
                      cardIdleMotion={config.cardIdleMotion || 'none'}
                      cardImageMotion={config.cardImageMotion || 'zoom_in'}
                      badgeMotion={config.badgeMotion || 'pulse_dot'}
                      primaryColor={config?.colors?.primary || '#7E1529'}
                      cardRadius={config?.cardBorderRadius || 22}
                      triggerCount={sandboxTrigger}
                      hoverTriggerCount={sandboxHoverTrigger}
                    />
                  </div>

                  {/* 5. Section Manager & Dividers (مدير أقسام الصفحة والفواصل) */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-700" />
                      مدير أقسام الصفحة والفواصل (Section Manager & Dividers)
                    </h3>

                    {/* Section Divider Style */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        نمط الفواصل الجمالية بين الأقسام
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'none', label: 'بدون فواصل (هواء نقي)' },
                          { id: 'gold_hairline', label: 'خط ذهبي متلاشي ✨' },
                          { id: 'subtle_line', label: 'خط رمادي ناعم' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => updateField('sectionDividerStyle', d.id)}
                            className={`py-2 px-1 rounded-xl border text-center transition-all ${
                              config.sectionDividerStyle === d.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span className="text-[11px] font-semibold">{d.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section Reorder & Visibility */}
                    <div>
                      <p className="text-[11px] text-stone-500 mb-2">
                        أعد ترتيب أقسام المتجر بالأسهم أو قم بإخفاء أي قسم بضغطة زر واحدة
                      </p>

                      <div className="space-y-2">
                        {config.sections?.map((sec, index) => (
                          <div
                            key={sec.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-xs shadow-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-[10px]">
                                {index + 1}
                              </span>
                              <span className={`font-semibold ${sec.visible ? 'text-stone-900' : 'text-stone-400 line-through'}`}>
                                {sec.nameAr}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveSection(index, 'up')}
                                disabled={index === 0}
                                className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30"
                                title="تحريك لأعلى"
                              >
                                <MoveUp className="w-3.5 h-3.5 text-stone-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSection(index, 'down')}
                                disabled={index === config.sections.length - 1}
                                className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30"
                                title="تحريك لأسفل"
                              >
                                <MoveDown className="w-3.5 h-3.5 text-stone-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleSection(sec.id)}
                                className={`p-1 rounded-lg transition-colors ms-1 ${
                                  sec.visible ? 'text-emerald-700 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'
                                }`}
                                title={sec.visible ? 'إخفاء القسم' : 'إظهار القسم'}
                              >
                                {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-base text-stone-900">استيراد إعدادات الثيم (JSON)</h3>
            <p className="text-xs text-stone-500">
              قم بلصق محتوى ملف JSON لتطبيق كافة الإعدادات والأنيميشن مباشرة
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{ "storeName": "دار الورد للمناسبات", ... }'
              className="w-full h-44 p-3 rounded-2xl border border-stone-200 font-mono text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7E1529]/30"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-4 py-2 rounded-xl bg-[#7E1529] hover:bg-[#600f1f] text-white text-xs font-bold"
              >
                تطبيق الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
