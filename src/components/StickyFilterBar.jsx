import React from 'react';
import { INITIAL_FORMATS, THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';

const toArabicDigits = (num) => {
  if (num === null || num === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[d]);
};

function StickyFilterBar({
  selectedType = 'all',
  onSelectType,
  selectedBudget = 'all',
  onSelectBudget,
  itemsCount = 0,
  lang = 'ar',
  formats = INITIAL_FORMATS,
  themeTokens = THEME_TOKENS.botanical,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const budgetOptions = [
    { id: 'all', label: strings.budgetAll || 'الكل' },
    { id: 'under_150', label: strings.budgetUnder150 || 'أقل من ١٥٠ ر.س' },
    { id: '150_250', label: strings.budget150to250 || '١٥٠ - ٢٥٠ ر.س' },
    { id: 'over_250', label: strings.budgetOver250 || '+٢٥٠ ر.س' },
  ];

  return (
    <div
      className={`sticky top-0 z-30 w-full py-2 backdrop-blur-xl transition-all duration-300 border-b shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] ${
        themeTokens.isDark
          ? 'bg-[#0B0B0C]/90 border-stone-800/80'
          : 'bg-[#FAF8F5]/90 border-stone-200/60'
      }`}
    >
      <div className="flex flex-col gap-1.5 w-full max-w-full">
        {/* Row 1: Primary Category Tabs (Touch-friendly, sleek rounded pills) */}
        <div className="overflow-x-auto no-scrollbar scroll-smooth px-3.5 sm:px-4 flex items-center gap-1.5 touch-pan-x">
          {formats.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onSelectType && onSelectType(type.id)}
                className={`flex-none px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap select-none ${
                  isSelected
                    ? 'bg-[var(--accent-primary,#022C22)] text-white font-extrabold shadow-[0_2px_8px_rgba(2,44,34,0.3)] ring-1 ring-emerald-900/40'
                    : 'bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 font-bold border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 shadow-2xs'
                }`}
              >
                {isAr ? type.nameAr : type.nameEn}
              </button>
            );
          })}
        </div>

        {/* Row 2: Streamlined Budget Chips + Results Counter (Integrated for zero wasted vertical space) */}
        <div className="overflow-x-auto no-scrollbar scroll-smooth px-3.5 sm:px-4 flex items-center gap-1.5 touch-pan-x">
          {/* Live Count Pill */}
          <span className="flex-none inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isAr
                ? `${toArabicDigits(itemsCount)} باقة`
                : `${itemsCount} items`}
            </span>
          </span>

          <span className="w-px h-3.5 bg-stone-300 dark:bg-stone-700 mx-0.5 shrink-0" />

          {/* Budget Options */}
          {budgetOptions.map((b) => {
            const isSelected = selectedBudget === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBudget && onSelectBudget(b.id)}
                className={`flex-none text-[11px] px-2.5 py-0.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap select-none ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs ring-1 ring-amber-400'
                    : 'bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-medium hover:bg-stone-50'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(StickyFilterBar);
