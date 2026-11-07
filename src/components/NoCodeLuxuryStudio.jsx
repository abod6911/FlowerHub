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
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleMouseMove = (e) => {
    if (cardHoverEffect !== 'tilt_3d') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({
      x: -py * 9,
      y: px * 9,
      active: true,
      glareX: ((px + 1) / 2) * 100,
      glareY: ((py + 1) / 2) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardHoverEffect === 'tilt_3d') {
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
      ? 'shadow-none border border-stone-200/80'
      : cardShadow === 'medium'
      ? 'shadow-md hover:shadow-lg'
      : cardShadow === 'high'
      ? 'shadow-xl hover:shadow-2xl'
      : 'shadow-xs hover:shadow-md';

  // Hover transform and visual classes
  let transformStyle = '';
  let hoverClasses = '';
  if (cardHoverEffect === 'tilt_3d') {
    transformStyle = tilt.active
      ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025)`
      : 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  } else if (cardHoverEffect === 'zoom_soft') {
    hoverClasses = 'hover:scale-[1.03] transition-transform duration-300';
  } else if (cardHoverEffect === 'gold_glow') {
    hoverClasses =
      'hover:shadow-[0_0_24px_rgba(212,175,55,0.45)] hover:border-amber-400 transition-all duration-300';
  }

  return (
    <motion.div
      key={`${cardEntranceMotion}-${staggerDelay}-${replayKey}-${product.id}`}
      initial={motionProps.initial}
      animate={motionProps.animate}
      transition={motionProps.transition}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`border border-stone-200/70 p-2.5 flex flex-col justify-between transition-all group overflow-hidden relative cursor-pointer ${shadowClass} ${hoverClasses} ${
        isBentoSpan ? 'col-span-2' : 'col-span-1'
      }`}
      style={{
        backgroundColor: colors.cardSurface,
        borderRadius: `${cardRadius}px`,
        transform: transformStyle,
        transition: tilt.active
          ? 'transform 0.08s ease-out'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      }}
    >
      {/* 3D Specular Light Sheen */}
      {cardHoverEffect === 'tilt_3d' && tilt.active && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-200 z-20"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.24) 0%, transparent 65%)`,
          }}
        />
      )}

      <div>
        <div
          className={`rounded-xl overflow-hidden mb-2 bg-stone-100 relative ${
            isBentoSpan ? 'aspect-[16/9]' : 'aspect-[4/5]'
          }`}
        >
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = './images/products/royal-red-roses.jpg';
            }}
          />

          {/* Top-Right Badge */}
          {showBadges && (
            <span
              className={`absolute top-1.5 right-1.5 text-[8px] font-bold px-2 py-0.5 rounded-full shadow-2xs z-10 ${
                badgeStyle === 'solid_pastel'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-white/90 backdrop-blur-md text-stone-900 border border-white/60'
              }`}
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
        </div>

        {/* Title */}
        <h4
          className={`text-xs font-bold leading-snug ${
            fullTitleWrap ? 'line-clamp-2 min-h-[2.3rem]' : 'truncate'
          }`}
          style={{ color: colors.textMain }}
        >
          {product.title}
        </h4>
        <span className="text-[10px] text-stone-400 block mt-0.5">توصيل ساعتين • مبرد</span>
      </div>

      {/* Footer / Buy Action Area */}
      <div
        className={`pt-2 mt-1.5 border-t border-stone-100 ${
          buyButtonStyle === 'full_width'
            ? 'flex flex-col gap-1.5'
            : 'flex items-center justify-between'
        }`}
      >
        <div className="flex items-baseline gap-0.5">
          <span className="text-xs font-black" style={{ color: colors.priceColor }}>
            {product.price}
          </span>
          <span className="text-[9px] text-stone-500 font-medium">ر.س</span>
        </div>

        {/* Buy Button */}
        <button
          type="button"
          onClick={handleButtonClick}
          className={`font-bold transition-all active:scale-95 shadow-2xs flex items-center justify-center gap-1 relative overflow-hidden ${
            buyButtonStyle === 'circle_plus'
              ? 'w-7 h-7 rounded-full text-white shrink-0'
              : buyButtonStyle === 'full_width'
              ? 'w-full py-1.5 rounded-xl text-white text-[10px]'
              : 'px-2.5 py-1 rounded-full text-white text-[10px] shrink-0'
          }`}
          style={{
            backgroundColor: isAdded ? '#059669' : colors.primary,
          }}
        >
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
                className="flex items-center gap-1 leading-none"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                {buyButtonStyle !== 'circle_plus' && <span>أضف</span>}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
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
      tag: 'الأكثر طلباً',
      image: './images/products/royal-red-roses.jpg',
    },
    {
      id: 'p2',
      title: 'فازة كازابلانكا وأوركيد',
      price: 360,
      tag: 'تنسيق فاخر',
      image: './images/products/casablanca-orchid-vase.jpg',
    },
    {
      id: 'p3',
      title: 'هيدرنجيا وروز باستيل',
      price: 280,
      tag: 'جاهز اليوم',
      image: './images/products/blush-hydrangea-vase.jpg',
    },
    {
      id: 'p4',
      title: 'بوكس أكريليك الاحتفالات',
      price: 420,
      tag: 'إهداء خاص',
      image: './images/products/acrylic-box-celebration.jpg',
    },
  ];

  const [activeItemAdded, setActiveItemAdded] = useState(null);
  const [flyingPetals, setFlyingPetals] = useState([]);
  const [headerPulse, setHeaderPulse] = useState(false);
  const containerRef = useRef(null);

  const handleAddProduct = (product, meta) => {
    setActiveItemAdded(product.id);

    // If fly_to_cart physics is active, spawn an animated particle
    if (buyButtonPhysics === 'fly_to_cart' && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const startX = meta.clientX - containerRect.left;
      const startY = meta.clientY - containerRect.top;
      const targetX = containerRect.width / 2;
      const targetY = 24;

      const petalId = Date.now() + Math.random();
      setFlyingPetals((prev) => [
        ...prev,
        { id: petalId, startX, startY, targetX, targetY },
      ]);

      setTimeout(() => {
        setHeaderPulse(true);
        setTimeout(() => setHeaderPulse(false), 450);
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
                  className="text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${
                      config?.statusPulse !== false ? 'animate-pulse' : ''
                    }`}
                  />
                  <span className="truncate max-w-[130px]">
                    {config?.statusText || 'مفتوح • تجهيز فوري ٢٠ د'}
                  </span>
                </span>

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
                    : gridLayout === 'bento'
                    ? 'grid-cols-2'
                    : 'grid-cols-2'
                }`}
              >
                {sampleProducts.map((p, idx) => {
                  const isAdded = activeItemAdded === p.id;
                  const isBentoSpan = gridLayout === 'bento' && idx === 0;

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
                      cardShadow={cardShadow}
                      buyButtonStyle={buyButtonStyle}
                      fullTitleWrap={fullTitleWrap}
                      showBadges={showBadges}
                      badgeStyle={badgeStyle}
                      showFavoriteButton={showFavoriteButton}
                      replayKey={replayTrigger}
                      isBentoSpan={isBentoSpan}
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

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'fade_up', label: 'انسياب للأعلى (Fade Up)' },
                        { id: 'elastic_scale', label: 'تمدد مرن (Elastic Scale)' },
                        { id: 'slide', label: 'انزلاق جانبي (Slide)' },
                        { id: 'none', label: 'فوري (بدون أنيميشن)' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            updateField('cardEntranceMotion', m.id);
                            setReplayTrigger((prev) => prev + 1);
                          }}
                          className={`py-2 rounded-xl border text-center transition-all ${
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
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        فيزياء زر الشراء (Add-to-Cart Physics)
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'morph_checkmark', label: 'تحول للعلامة (Morph)' },
                          { id: 'ripple_wave', label: 'موجة ضوئية (Ripple)' },
                          { id: 'fly_to_cart', label: 'طيران للسلة' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateField('buyButtonPhysics', b.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
                              config.buyButtonPhysics === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        تأثير التمرير على البطاقة (Card Hover Effect)
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'zoom_soft', label: 'تكبير ناعم (Zoom)' },
                          { id: 'tilt_3d', label: 'ميلان ثلاثي الأبعاد (3D Tilt)' },
                          { id: 'gold_glow', label: 'توهج ذهبي (Glow)' },
                        ].map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => updateField('cardHoverEffect', h.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
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
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-indigo-700" />
                      تخطيط الشبكة وهندسة البطاقات
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        نمط شبكة المنتجات (Grid Layout)
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'bento', label: 'بينتو غير متماثل (Bento)' },
                          { id: '1col', label: 'عمود واحد عريض' },
                          { id: '2cols', label: 'عمودين متناسقين' },
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => updateField('gridLayout', g.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
                              config.gridLayout === g.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                        <span>انحناء زوايا البطاقات (Border Radius)</span>
                        <span className="font-mono text-rose-800 font-bold">{config.cardBorderRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="28"
                        value={config.cardBorderRadius}
                        onChange={(e) => updateField('cardBorderRadius', Number(e.target.value))}
                        className="w-full accent-[#7E1529] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        شدة الظل والعمق (Card Shadow)
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 text-xs">
                        {[
                          { id: 'none', label: 'بدون' },
                          { id: 'soft', label: 'ناعم' },
                          { id: 'medium', label: 'متوسط' },
                          { id: 'high', label: 'مرتفع' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => updateField('cardShadow', s.id)}
                            className={`py-1.5 rounded-xl border text-center transition-all ${
                              config.cardShadow === s.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold'
                                : 'bg-white border-stone-200 text-stone-700'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Anatomy */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900">تشريح عناصر البطاقة (Card Anatomy)</h3>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        شكل زر الشراء التفاعلي
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'pill_add', label: 'كبسولة (+ أضف)' },
                          { id: 'circle_plus', label: 'دائري (+)' },
                          { id: 'full_width', label: 'شريط عريض كامل' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateField('buyButtonStyle', b.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
                              config.buyButtonStyle === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">عرض العناوين بالكامل</span>
                        <span className="text-[11px] text-stone-500">التفاف سلس في سطرين دون قطع بالنقاط</span>
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

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
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
                          { id: 'solid_pastel', label: 'باستيل مصمت (Solid Pastel)' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateField('badgeStyle', b.id)}
                            className={`py-1.5 rounded-xl border text-center transition-all ${
                              config.badgeStyle === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold'
                                : 'bg-white border-stone-200 text-stone-700'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">زر المفضلة (القلب)</span>
                        <span className="text-[11px] text-stone-500">زر حفظ الإعجابات أعلى يمين الصورة</span>
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

                  {/* Section Manager */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-700" />
                      مدير أقسام الصفحة (Section Manager)
                    </h3>
                    <p className="text-[11px] text-stone-500">
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
