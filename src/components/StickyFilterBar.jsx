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
    { id: 'all', label: isAr ? 'جميع الأسعار' : 'All Prices' },
    { id: 'under_150', label: isAr ? 'أقل من 150 ر.س' : '< 150 SAR' },
    { id: '150_250', label: isAr ? '150 - 250 ر.س' : '150 - 250 SAR' },
    { id: 'over_250', label: isAr ? '+250 ر.س فاخر' : '250+ SAR Luxury' },
  ];

  return (
    <div
      className={`sticky top-0 z-30 w-full py-2 backdrop-blur-xl transition-all duration-300 border-b shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] ${
        themeTokens.isDark
          ? 'bg-[#0B0B0C]/90 border-stone-800/80'
          : 'bg-[#FAF8F5]/92 border-stone-200/60'
      }`}
    >
      <div className="overflow-x-auto no-scrollbar scroll-smooth px-3.5 sm:px-4 flex items-center gap-1.5 touch-pan-x">
        {/* Count Indicator */}
        <span className="flex-none inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{isAr ? `${itemsCount} باقة` : `${itemsCount} items`}</span>
        </span>

        <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5 shrink-0" />

        {/* Primary Category Tabs */}
        {formats.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelectType && onSelectType(type.id)}
              className={`flex-none px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap select-none ${
                isSelected
                  ? 'bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950 font-bold shadow-xs'
                  : 'bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 font-medium border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 shadow-2xs'
              }`}
            >
              {isAr ? type.nameAr : type.nameEn}
            </button>
          );
        })}

        <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5 shrink-0" />

        {/* Quick Budget Filters in the Same Smooth Rail */}
        {budgetOptions.slice(1).map((b) => {
          const isSelected = selectedBudget === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBudget && onSelectBudget(isSelected ? 'all' : b.id)}
              className={`flex-none text-[11px] px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap select-none ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-medium'
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(StickyFilterBar);
