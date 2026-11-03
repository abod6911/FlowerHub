import React, { useRef, useState } from 'react';
import { Sparkles, Flame, Check } from 'lucide-react';
import { INITIAL_OCCASIONS, THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';

export default function OccasionStories({
  selectedCategory = 'all',
  onSelectCategory,
  lang = 'ar',
  occasions = INITIAL_OCCASIONS,
  themeTokens = THEME_TOKENS.botanical,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';
  const scrollContainerRef = useRef(null);

  // Smooth Desktop Mouse Drag-to-Scroll Support
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
    const walk = (x - startX) * 1.5; // Drag sensitivity multiplier
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const handleStoryClick = (id) => {
    if (hasDragged) return; // Prevent clicking during drag gesture
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  // Only show visible stories
  const visibleOccasions = occasions.filter((occ) => occ.isVisible !== false);

  return (
    <section className="py-3 px-4 w-full transition-colors duration-300 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-1.5">
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
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <span className="text-[10px] w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center font-mono">
                ✕
              </span>
            </button>
          )}
          <span
            className={`text-[11px] font-medium ${themeTokens.textMuted} transition-colors duration-300 hidden sm:inline`}
          >
            {strings.occasionsSubtitle}
          </span>
        </div>
      </div>

      {/* Horizontal Floward-style Story Reel Container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-start gap-3.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 scroll-smooth snap-x snap-mandatory ${
          isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
        } touch-pan-x`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 1. "All / الكل" Story Disc */}
        <button
          type="button"
          onClick={() => handleStoryClick('all')}
          className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none transition-transform active:scale-95 snap-start group"
          style={{ width: '68px' }}
        >
          <div
            className={`relative w-[60px] h-[60px] rounded-full p-[2.5px] transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'scale-105 animate-story-active'
                : 'hover:scale-102 opacity-90 hover:opacity-100'
            }`}
            style={{
              background:
                selectedCategory === 'all'
                  ? 'linear-gradient(135deg, var(--accent-gold, #D4AF37), var(--accent-primary, #022C22), var(--accent-gold, #D4AF37))'
                  : 'linear-gradient(135deg, rgba(212, 175, 55, 0.35), rgba(150, 150, 150, 0.2))',
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
                <Sparkles
                  className={`w-4 h-4 transition-transform ${
                    selectedCategory === 'all' ? 'animate-pulse text-amber-300' : 'text-stone-500'
                  }`}
                />
              </div>
            </div>

            {/* Checkmark badge when active */}
            {selectedCategory === 'all' && (
              <div className="absolute -bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs border border-white dark:border-stone-900">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
          </div>

          <span
            className={`text-[11px] text-center leading-tight truncate w-full transition-colors duration-300 ${
              selectedCategory === 'all'
                ? `font-bold text-amber-600 dark:text-amber-400 scale-102`
                : `${themeTokens.textMuted} group-hover:${themeTokens.textMain}`
            }`}
          >
            {strings.allOccasions}
          </span>
        </button>

        {/* 2. Dynamic Occasion Discs */}
        {visibleOccasions.map((occ) => {
          const isSelected = selectedCategory === occ.id;
          const isSpecials = occ.id === 'specials';

          return (
            <button
              key={occ.id}
              type="button"
              onClick={() => handleStoryClick(occ.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none transition-transform active:scale-95 snap-start group relative"
              style={{ width: '68px' }}
            >
              {/* Outer Golden / Brand Shimmer Ring */}
                <div
                  className={`relative w-[62px] h-[62px] sm:w-[68px] sm:h-[68px] rounded-full p-[2.5px] transition-all duration-300 ${
                    isSelected
                      ? 'scale-105 shadow-md ring-2 ring-amber-400/40'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, var(--accent-gold, #D4AF37), var(--accent-primary, #022C22), var(--accent-gold, #D4AF37))'
                      : isSpecials
                      ? 'linear-gradient(135deg, #10B981, #059669, #34D399)'
                      : 'linear-gradient(135deg, var(--accent-gold, #D4AF37), rgba(212, 175, 55, 0.3), var(--accent-primary, #022C22))',
                  }}
                >
                  {/* 2px Gap Ring (matching canvas or card surface) */}
                  <div
                    className={`w-full h-full rounded-full p-[1.5px] transition-colors ${
                      themeTokens.isDark ? 'bg-stone-950' : 'bg-white'
                    }`}
                  >
                    {/* Inner Image Container */}
                    <div className="w-full h-full rounded-full overflow-hidden bg-stone-100 relative">
                      <img
                        src={occ.image}
                        alt={isAr ? occ.nameAr : occ.nameEn}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        draggable={false}
                      />

                      {/* Subtle overlay gradient on hover */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Live Pulse Badge for Ready Today Specials (Neatly positioned at bottom) */}
                  {isSpecials && (
                    <div className="absolute -bottom-1 inset-x-0 mx-auto w-max px-1.5 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white flex items-center gap-0.5 shadow-xs border border-white dark:border-stone-900 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                      <Flame className="w-2 h-2 text-amber-300" />
                    </div>
                  )}

                  {/* Selected Checkmark Indicator Badge */}
                  {isSelected && !isSpecials && (
                    <div className="absolute -bottom-1 inset-x-0 mx-auto w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs border border-white dark:border-stone-900 z-10">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

              {/* Story Title Label */}
              <div className="flex flex-col items-center w-full px-0.5">
                <span
                  className={`text-[11px] text-center leading-tight truncate w-full transition-colors duration-300 ${
                    isSelected
                      ? `font-bold text-amber-600 dark:text-amber-400 scale-102`
                      : `${themeTokens.textMuted} group-hover:${themeTokens.textMain}`
                  }`}
                >
                  {isAr ? occ.nameAr : occ.nameEn}
                </span>

                {/* Active Indicator Underline Dot */}
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-0.5 shadow-xs"
                    style={{ backgroundColor: 'var(--accent-gold, #D4AF37)' }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
