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
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 shadow-[0_2px_6px_rgba(212,175,55,0.4)]" />
          <h2
            className={`text-sm sm:text-base font-serif font-black tracking-tight ${themeTokens.textMain} transition-colors duration-300 flex items-center gap-1.5`}
          >
            <span>{strings.occasionsTitle}</span>
            <span className="text-[11px] font-sans text-amber-600 dark:text-amber-400">✨</span>
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
          className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none transition-transform active:scale-92 group snap-start cursor-pointer"
        >
          <div
            className={`relative w-[64px] h-[64px] rounded-full p-[2px] transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'scale-105 shadow-[0_4px_18px_rgba(217,175,55,0.35)]'
                : 'hover:scale-103 opacity-90 hover:opacity-100'
            }`}
            style={{
              background:
                selectedCategory === 'all'
                  ? 'linear-gradient(135deg, #d4af37 0%, #f59e0b 50%, #d4af37 100%)'
                  : 'linear-gradient(135deg, rgba(217,175,55,0.3), rgba(0,0,0,0.08))',
            }}
          >
            <div
              className="w-full h-full rounded-full flex flex-col items-center justify-center transition-colors p-[2px]"
              style={{
                background: selectedCategory === 'all' ? '#0c0a09' : '#1c1917',
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center transition-all"
                style={{
                  background:
                    selectedCategory === 'all'
                      ? 'radial-gradient(circle at 35% 35%, rgba(217,175,55,0.25), transparent 70%)'
                      : 'transparent',
                }}
              >
                <Layers
                  className={`w-4 h-4 transition-transform ${
                    selectedCategory === 'all' ? 'text-amber-400 scale-110' : 'text-stone-400'
                  }`}
                />
              </div>
            </div>

            {/* Active Gold Star Badge */}
            {selectedCategory === 'all' && (
              <div
                className="absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full text-stone-950 flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-stone-950 text-[9px] font-black"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                }}
              >
                ✓
              </div>
            )}
          </div>

          <span
            className={`text-xs whitespace-nowrap text-center transition-colors duration-200 ${
              selectedCategory === 'all'
                ? 'font-bold text-amber-600 dark:text-amber-400 font-serif'
                : 'font-medium text-stone-600 dark:text-stone-400'
            }`}
          >
            {strings.allOccasions}
          </span>
          {selectedCategory === 'all' && (
            <span
              className="w-1.5 h-1.5 rounded-full shadow-xs -mt-1"
              style={{ backgroundColor: '#d4af37' }}
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
              className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none transition-transform active:scale-92 group relative snap-start cursor-pointer"
            >
              {/* Outer Luxury Circle */}
              <div
                className={`relative w-[62px] h-[62px] rounded-full p-[2px] transition-all duration-300 ${
                  isSelected
                    ? 'scale-105 shadow-[0_4px_18px_rgba(217,175,55,0.35)]'
                    : 'opacity-90 hover:opacity-100 hover:scale-103'
                }`}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #d4af37 0%, #f59e0b 50%, #d4af37 100%)'
                    : isSpecials
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, rgba(217,175,55,0.25), rgba(0,0,0,0.06))',
                }}
              >
                <div
                  className={`w-full h-full rounded-full p-[2px] transition-colors ${
                    themeTokens.isDark ? 'bg-stone-950' : 'bg-white'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-stone-100 relative shadow-inner">
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
                  </div>
                </div>

                {/* Subtle Clean Badge for Specials */}
                {isSpecials && (
                  <div
                    className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white shadow-xs ring-1 ring-white"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    <span>{isAr ? 'جاهز' : 'Now'}</span>
                  </div>
                )}
              </div>

              {/* Story Title Label */}
              <span
                className={`text-[11px] whitespace-nowrap text-center transition-colors duration-200 ${
                  isSelected
                    ? 'font-bold text-stone-950 dark:text-stone-50 font-serif'
                    : 'font-medium text-stone-600 dark:text-stone-400'
                }`}
              >
                {isAr ? occ.nameAr : occ.nameEn}
              </span>

              {/* Active Indicator Underline Dot */}
              {isSelected && (
                <span
                  className="w-1.5 h-1.5 rounded-full shadow-xs -mt-1"
                  style={{ backgroundColor: '#d4af37' }}
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
