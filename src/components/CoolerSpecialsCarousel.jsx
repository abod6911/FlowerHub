import React, { useState, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { PRODUCTS, THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';

// Helper to convert standard digits to Eastern Arabic numerals for luxury typography
const toArabicDigits = (num) => {
  if (num === null || num === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[d]);
};

function CoolerSpecialsCarousel({
  onSelectProduct,
  lang = 'ar',
  _themeTokens = THEME_TOKENS.botanical,
  specialsStyle = 'marquee',
  customizerConfig,
  products = PRODUCTS,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const coolerItems = products.filter(
    (p) => (p.isReadyNow || p.isOneTimeSpecial) && !p.isSoldOut
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  if (coolerItems.length === 0) return null;

  const safeIndex = activeIndex < coolerItems.length ? activeIndex : 0;
  const currentItem = coolerItems[safeIndex] || coolerItems[0];
  const motionSpeed = customizerConfig?.motion?.specialsSpeed || 28;

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : coolerItems.length - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev < coolerItems.length - 1 ? prev + 1 : 0));
  };

  const getBadgeConfig = (product) => {
    if (product.isOneTimeSpecial || product.coolerStock === 1) {
      return {
        text: isAr ? 'قطعة واحدة فقط' : '1 Piece Only',
        icon: null,
        className: 'bg-stone-900/90 text-white backdrop-blur-md shadow-2xs font-bold border border-white/20',
      };
    }
    return null;
  };

  const getBadgeText = (product) => {
    if (product?.isOneTimeSpecial || product?.coolerStock === 1) {
      return isAr ? 'قطعة واحدة فقط' : '1 Piece Only';
    }
    return null;
  };

  // ==========================================
  // 1. MARQUEE MODE (Smooth Continuous Auto-Scroll)
  // ==========================================
  if (specialsStyle === 'marquee') {
    const marqueeItems = [...coolerItems, ...coolerItems];

    return (
      <section className="py-2 px-3.5 sm:px-4 w-full overflow-hidden transition-colors duration-300 select-none">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <h2 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
              {isAr ? 'جاهز للاستلام والتوصيل اليوم' : (strings.coolerTitle || 'Ready for Pickup Today')}
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            {isAr ? 'توصيل فوري ⚡' : 'Express Delivery'}
          </span>
        </div>

        <div
          className="relative w-full overflow-hidden py-1 group"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onTouchCancel={() => setIsPaused(false)}
        >
          <div
            className={`${
              isAr ? 'animate-marquee-rtl' : 'animate-marquee-ltr'
            } flex items-stretch gap-3 hover-pause cursor-grab active:cursor-grabbing touch-pan-x`}
            style={{
              animationDuration: `${Math.max(motionSpeed, 30)}s`,
              animationPlayState: isPaused ? 'paused' : 'running',
              willChange: 'transform',
            }}
          >
            {marqueeItems.map((product, index) => {
              const badgeCfg = getBadgeConfig(product);
              return (
                <div
                  key={`${product.id}-${index}`}
                  onClick={() => onSelectProduct(product)}
                  className="flex-none w-44 sm:w-48 rounded-[22px] bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group/card flex flex-col justify-between active:scale-[0.97]"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={product.image}
                      alt={isAr ? product.titleAr : product.titleEn}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                      loading={index < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={index < 2 ? 'high' : 'auto'}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = './images/products/royal-red-roses.jpg';
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    {badgeCfg && (
                      <div className="absolute top-2 right-2 z-10">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm ${badgeCfg.className}`}
                        >
                          {badgeCfg.icon}
                          <span className="leading-none">{badgeCfg.text}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                    <h3
                      className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-2 min-h-[2.5rem] leading-snug transition-colors duration-200"
                      style={{ fontFamily: "'Readex Pro', 'Cairo', 'Alexandria', sans-serif" }}
                    >
                      {isAr ? product.titleAr : product.titleEn}
                    </h3>

                    <div className="pt-2 flex items-center justify-between gap-1 border-t border-stone-100 dark:border-stone-800">
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-sm sm:text-base font-extrabold text-[var(--accent-primary,#123524)] dark:text-emerald-400 tracking-tight"
                          style={{ fontFamily: "'Readex Pro', 'Cairo', 'Alexandria', sans-serif" }}
                        >
                          {product.price}
                        </span>
                        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                          {strings.sar}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] line-through text-stone-400 ms-1">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-primary,#123524)] hover:opacity-90 text-white text-xs font-bold shadow-xs active:scale-90 transition-all duration-200"
                        aria-label="Add to order"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>{isAr ? '+ أضف' : '+ Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // 2. COVERFLOW MODE (3D Center Focus & Perspective)
  // ==========================================
  if (specialsStyle === 'coverflow') {
    return (
      <section className="py-2.5 px-4 w-full transition-colors duration-300">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h2
              className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif"
            >
              {isAr ? 'جاهز للاستلام والتوصيل اليوم' : (strings.coolerTitle || 'Ready for Pickup Today')}
            </h2>
            <p
              className="text-[11px]"
              style={{ color: 'var(--text-muted, #78716C)' }}
            >
              {strings.coolerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="w-7 h-7 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-xs"
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
                color: 'var(--text-main, #1C1917)',
              }}
              aria-label="Previous"
            >
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-xs"
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
                color: 'var(--text-main, #1C1917)',
              }}
              aria-label="Next"
            >
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3D Perspective Viewport */}
        <div
          ref={scrollRef}
          className="perspective-1000 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar py-4 px-2 -mx-2 snap-x snap-mandatory"
        >
          {coolerItems.map((product, idx) => {
            const isFocused = idx === safeIndex;
            const isBefore = idx < safeIndex;
            const isAfter = idx > safeIndex;
            const badgeText = getBadgeText(product);

            let tiltTransform = 'perspective(1000px) rotateY(0deg) scale(1)';
            if (isFocused) {
              tiltTransform = 'perspective(1000px) rotateY(0deg) scale(1.06)';
            } else if (isBefore) {
              tiltTransform = isAr
                ? 'perspective(1000px) rotateY(-18deg) scale(0.92)'
                : 'perspective(1000px) rotateY(18deg) scale(0.92)';
            } else if (isAfter) {
              tiltTransform = isAr
                ? 'perspective(1000px) rotateY(18deg) scale(0.92)'
                : 'perspective(1000px) rotateY(-18deg) scale(0.92)';
            }

            return (
              <div
                key={product.id}
                onClick={() => {
                  setActiveIndex(idx);
                  onSelectProduct(product);
                }}
                className={`snap-center flex-none w-52 sm:w-56 overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-500 ease-out border ${
                  isFocused
                    ? 'z-20 shadow-2xl ring-2'
                    : 'z-10 opacity-70 hover:opacity-95 shadow-md'
                }`}
                style={{
                  transform: tiltTransform,
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  borderColor: isFocused ? 'var(--accent-gold, #D4AF37)' : 'var(--border-subtle, #E7E5E4)',
                  borderRadius: 'var(--radius-unit, 16px)',
                  boxShadow: isFocused ? '0 15px 35px -5px rgba(0, 0, 0, 0.15)' : 'none',
                }}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                  <img
                    src={product.image}
                    alt={isAr ? product.titleAr : product.titleEn}
                    className="w-full h-full object-cover transition-transform duration-500"
                    loading={idx < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = './images/products/royal-red-roses.jpg';
                    }}
                  />
                  {badgeText && (
                    <div className="absolute top-2.5 end-2.5">
                      <span className="bg-white/95 backdrop-blur-md text-stone-900 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs border border-white/60">
                        {badgeText}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex flex-col justify-between flex-1">
                  <h3
                    className="text-sm font-semibold line-clamp-1"
                    style={{ color: 'var(--text-main, #1C1917)' }}
                  >
                    {isAr ? product.titleAr : product.titleEn}
                  </h3>

                  <div className="mt-2 flex items-center justify-between gap-1">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-sm font-bold"
                        style={{ color: 'var(--text-main, #1C1917)' }}
                      >
                        {product.price}
                      </span>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: 'var(--text-muted, #78716C)' }}
                      >
                        {strings.sar}
                      </span>
                      {product.originalPrice && (
                        <span
                          className="text-[11px] line-through ms-1 opacity-60"
                          style={{ color: 'var(--text-muted, #78716C)' }}
                        >
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-all active:scale-90 shadow-xs"
                      style={{
                        backgroundColor: 'var(--accent-primary, #022C22)',
                      }}
                      aria-label="Add to order"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {coolerItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: idx === safeIndex ? '22px' : '6px',
                backgroundColor:
                  idx === safeIndex
                    ? 'var(--accent-primary, #022C22)'
                    : 'var(--border-subtle, #D6D3D1)',
              }}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>
    );
  }

  // ==========================================
  // 3. SPOTLIGHT MODE (Luxury Contrast Stage with Accent Gold Glow)
  // ==========================================
  if (specialsStyle === 'spotlight') {
    return (
      <section className="py-2.5 px-4 w-full transition-colors duration-300">
        <div
          className="p-4 sm:p-5 relative overflow-hidden shadow-2xl text-white transition-all duration-300"
          style={{
            background: 'linear-gradient(145deg, #18181B 0%, #0F0F10 100%)',
            borderRadius: 'var(--radius-unit, 24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Subtle Ambient Gold Glow Derived from --accent-gold */}
          <div
            className="absolute top-0 end-0 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: 'var(--accent-gold, #D4AF37)' }}
          />

          <div className="flex items-start justify-between mb-3.5 relative z-10">
            <div>
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold mb-1 border"
                style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--accent-gold, #F59E0B)',
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                }}
              >
                <span>{isAr ? 'مختارات اليوم الفاخرة' : 'Curated Selection'}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-serif">
                {isAr ? 'جاهز للاستلام والتوصيل اليوم' : (strings.coolerTitle || 'Ready for Pickup Today')}
              </h2>
              <p className="text-[11px] text-white/80">
                {strings.coolerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 scroll-smooth relative z-10">
            {coolerItems.map((product) => {
              const badgeText = getBadgeText(product);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="flex-none w-48 sm:w-52 bg-white text-stone-900 overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-white/20"
                  style={{
                    borderRadius: 'calc(var(--radius-unit, 16px) * 0.85)',
                  }}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                    <img
                      src={product.image}
                      alt={isAr ? product.titleAr : product.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = './images/products/royal-red-roses.jpg';
                      }}
                    />
                    {badgeText && (
                      <div className="absolute top-2.5 end-2.5">
                        <span className="bg-stone-950/85 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs border border-white/10">
                          {badgeText}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col justify-between flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-1">
                      {isAr ? product.titleAr : product.titleEn}
                    </h3>

                    <div className="mt-2 flex items-center justify-between gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-stone-900">
                          {product.price}
                        </span>
                        <span className="text-[10px] font-medium text-stone-500">
                          {strings.sar}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-stone-400 line-through ms-1">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform active:scale-90 shadow-md"
                        style={{
                          backgroundColor: 'var(--accent-primary, #022C22)',
                        }}
                        aria-label="Add to order"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // 4. EDITORIAL DECK MODE (Full-Width 16:9 Split / Floating Glass Strip)
  // ==========================================
  const badgeText = getBadgeText(currentItem);

  return (
    <section className="py-2.5 px-4 w-full transition-colors duration-300">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2
            className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif"
          >
            {isAr ? 'جاهز للاستلام والتوصيل اليوم' : (strings.coolerTitle || 'Ready for Pickup Today')}
          </h2>
          <p
            className="text-[11px]"
            style={{ color: 'var(--text-muted, #78716C)' }}
          >
            {strings.coolerSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono font-medium"
            style={{ color: 'var(--text-muted, #78716C)' }}
          >
            {String(safeIndex + 1).padStart(2, '0')} / {String(coolerItems.length).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="w-7 h-7 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-xs"
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
                color: 'var(--text-main, #1C1917)',
              }}
              aria-label="Previous"
            >
              {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-xs"
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
                color: 'var(--text-main, #1C1917)',
              }}
              aria-label="Next"
            >
              {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 16:9 Ratio Card with Floating Glass Pricing Strip */}
      <div
        onClick={() => onSelectProduct(currentItem)}
        className="w-full overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300 relative border"
        style={{
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          borderColor: 'var(--border-subtle, #E7E5E4)',
          borderRadius: 'var(--radius-unit, 20px)',
        }}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
          <img
            src={currentItem.image}
            alt={isAr ? currentItem.titleAr : currentItem.titleEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.88]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = './images/products/royal-red-roses.jpg';
            }}
          />
          {badgeText && (
            <div className="absolute top-3 start-3 z-10">
              <span className="bg-white/95 backdrop-blur-md text-stone-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md border border-white/60">
                {badgeText}
              </span>
            </div>
          )}

          {/* Floating Glassmorphism Strip at the Bottom */}
          <div
            className="absolute bottom-2.5 inset-x-2.5 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between gap-3 text-white shadow-xl border border-white/20 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.60)',
              borderRadius: 'calc(var(--radius-unit, 16px) * 0.75)',
            }}
          >
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-85 block truncate">
                {currentItem.flowerType || (isAr ? 'زهور طبيعية مختارة' : 'Curated Fresh Blooms')}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {isAr ? currentItem.titleAr : currentItem.titleEn}
              </h3>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-sm sm:text-base font-extrabold">
                  {currentItem.price}
                </span>
                <span className="text-[10px] font-medium opacity-80">
                  {strings.sar}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(currentItem);
                }}
                className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md text-white"
                style={{
                  backgroundColor: 'var(--accent-primary, #022C22)',
                  borderRadius: 'var(--radius-btn, 9999px)',
                }}
              >
                <span>{isAr ? 'طلب فوري' : 'Order Now'}</span>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {coolerItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: idx === safeIndex ? '24px' : '8px',
              backgroundColor:
                idx === safeIndex
                  ? 'var(--accent-primary, #022C22)'
                  : 'var(--border-subtle, #D6D3D1)',
            }}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default React.memo(CoolerSpecialsCarousel);
