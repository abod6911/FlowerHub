import React from 'react';
import { INITIAL_FORMATS, THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';

const toArabicDigits = (num) => {
  if (num === null || num === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[d]);
};

export default function StickyFilterBar({
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
      className={`sticky top-0 z-30 w-full py-2.5 backdrop-blur-md transition-colors duration-300 border-b ${
        themeTokens.isDark
          ? 'bg-[#0B0B0C]/95 border-neutral-850'
          : 'bg-[#FAF8F5]/92 border-neutral-200/60'
      }`}
    >
      <div className="flex flex-col gap-2 w-full">
        {/* Row 1: Product Formats / Categories (Smooth horizontal scroll) */}
        <div className="overflow-x-auto no-scrollbar scroll-smooth px-4 flex items-center gap-2 touch-pan-x">
          {formats.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onSelectType && onSelectType(type.id)}
                className={`flex-none px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[var(--accent-primary,#022C22)] text-white font-semibold shadow-xs ring-1 ring-emerald-900/30'
                    : 'bg-stone-100/90 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium border border-stone-200/60 dark:border-stone-700 hover:bg-stone-200/70'
                }`}
              >
                {isAr ? type.nameAr : type.nameEn}
              </button>
            );
          })}
        </div>

        {/* Row 2: Budget Filters (Separate full-width scrollable row) */}
        <div className="overflow-x-auto no-scrollbar scroll-smooth px-4 flex items-center gap-2 touch-pan-x">
          {budgetOptions.map((b) => {
            const isSelected = selectedBudget === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBudget && onSelectBudget(b.id)}
                className={`flex-none text-xs px-3 py-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                  isSelected
                    ? 'bg-stone-900 text-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium hover:bg-stone-50'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>

        {/* Dedicated Results Count Subtitle Bar (Completely separated to prevent collisions) */}
        <div className="px-4 pt-0.5 flex items-center justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>
              {isAr
                ? `${toArabicDigits(itemsCount)} منتجات متوفرة`
                : `${itemsCount} items available`}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
