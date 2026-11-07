import React, { useRef, useState } from 'react';
import { Layers, Flame, Check } from 'lucide-react';
import { INITIAL_OCCASIONS, THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';

function OccasionStories({
  selectedCategory = 'all',
  onSelectCategory,
  lang = 'ar',
  occasions = INITIAL_OCCASIONS,
  themeTokens = THEME_TOKENS.botanical,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';
  const scrollContainerRef = useRef(null);

  // Smooth Drag & Touch Handling
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const handleStoryClick = (id) => {
    if (hasDragged) return;
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  // Only show visible stories
  const visibleOccasions = occasions.filter((occ) => occ.isVisible !== false);

  return (
    <section className="py-2.5 px-4 w-full transition-colors duration-300 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-xs" />
          <h2
            className={`text-sm sm:text-base font-bold tracking-tight ${themeTokens.textMain} transition-colors duration-300`}
          >
            {strings.occasionsTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <span className="text-[10px] w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center font-mono">
                ✕
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Floward-style Story Reel Container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-start gap-4 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 scroll-smooth ${
          isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
        } touch-pan-x`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 1. "All / الكل" Story Disc */}
        <button
          type="button"
          onClick={() => handleStoryClick('all')}
          className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none transition-transform active:scale-92 group snap-start"
        >
          <div
            className={`relative w-[64px] h-[64px] rounded-full p-[2.5px] transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'scale-105 shadow-[0_6px_20px_-3px_rgba(212,175,55,0.4)] ring-2 ring-amber-400/80'
                : 'hover:scale-102 opacity-95 hover:opacity-100 shadow-xs'
            }`}
            style={{
              background:
                selectedCategory === 'all'
                  ? 'linear-gradient(135deg, var(--accent-gold, #D4AF37), var(--accent-primary, #022C22), var(--accent-gold, #D4AF37))'
                  : 'linear-gradient(135deg, rgba(212, 175, 55, 0.45), rgba(180, 180, 180, 0.2))',
            }}
          >
            <div
              className={`w-full h-full rounded-full flex flex-col items-center justify-center transition-colors p-1 border-2 ${
                themeTokens.isDark ? 'border-stone-900 bg-stone-900' : 'border-white bg-white'
              }`}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                  selectedCategory === 'all'
                    ? `${themeTokens.primary} text-white shadow-xs`
                    : `${themeTokens.badge} ${themeTokens.textMain}`
                }`}
              >
                <Layers
                  className={`w-4 h-4 transition-transform ${
                    selectedCategory === 'all' ? 'text-amber-300 scale-105' : 'text-stone-500'
                  }`}
                />
              </div>
            </div>

            {/* Active Checkmark Pill on Top */}
            {selectedCategory === 'all' && (
              <div className="absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-stone-900">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
          </div>

          <span
            className={`text-xs whitespace-nowrap text-center transition-colors duration-200 ${
              selectedCategory === 'all' ? 'font-extrabold text-amber-700 dark:text-amber-400' : 'font-semibold text-stone-700 dark:text-stone-300'
            }`}
          >
            {strings.allOccasions}
          </span>
          {selectedCategory === 'all' && (
            <span
              className="w-1.5 h-1.5 rounded-full shadow-xs -mt-1"
              style={{ backgroundColor: 'var(--accent-gold, #D4AF37)' }}
            />
          )}
        </button>

        {/* 2. Dynamic Occasion Discs */}
        {visibleOccasions.map((occ, idx) => {
          const isSelected = selectedCategory === occ.id;
          const isSpecials = occ.id === 'specials';

          return (
            <button
              key={occ.id}
              type="button"
              onClick={() => handleStoryClick(occ.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none transition-transform active:scale-92 group relative snap-start"
            >
              {/* Outer Luxury Concentric Ring */}
              <div
                className={`relative w-[64px] h-[64px] rounded-full p-[2.5px] transition-all duration-300 ${
                  isSelected
                    ? 'scale-105 shadow-[0_6px_20px_-3px_rgba(212,175,55,0.4)] ring-2 ring-amber-400/80'
                    : 'hover:scale-102 opacity-95 hover:opacity-100 shadow-xs'
                }`}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--accent-gold, #D4AF37), var(--accent-primary, #022C22), var(--accent-gold, #D4AF37))'
                    : isSpecials
                    ? 'linear-gradient(135deg, #10B981, #059669, #34D399)'
                    : 'linear-gradient(135deg, rgba(212, 175, 55, 0.4), rgba(200, 200, 200, 0.25), rgba(2, 44, 34, 0.2))',
                }}
              >
                <div
                  className={`w-full h-full rounded-full p-[1.5px] transition-colors ${
                    themeTokens.isDark ? 'bg-stone-950' : 'bg-white'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-stone-100 relative">
                    <img
                      src={occ.image}
                      alt={isAr ? occ.nameAr : occ.nameEn}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading={idx < 5 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={idx < 2 ? 'high' : 'auto'}
                      draggable={false}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = './images/products/royal-red-roses.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Status Badges: Specials flame OR Selected checkmark (Zero random index numbering) */}
                {isSpecials ? (
                  <div className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 rounded-full bg-emerald-600 text-[8px] font-bold text-white flex items-center gap-0.5 shadow-sm ring-2 ring-white dark:ring-stone-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                    <Flame className="w-2.5 h-2.5 text-amber-300" />
                  </div>
                ) : isSelected ? (
                  <div className="absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-stone-900">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : null}
              </div>

              {/* Story Title Label */}
              <span
                className={`text-xs whitespace-nowrap text-center transition-colors duration-200 ${
                  isSelected ? 'font-extrabold text-amber-700 dark:text-amber-400' : 'font-semibold text-stone-700 dark:text-stone-300'
                }`}
              >
                {isAr ? occ.nameAr : occ.nameEn}
              </span>

              {/* Active Indicator Underline Dot */}
              {isSelected && (
                <span
                  className="w-1.5 h-1.5 rounded-full shadow-xs -mt-1"
                  style={{ backgroundColor: 'var(--accent-gold, #D4AF37)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default React.memo(OccasionStories);
