import React from 'react';
import { INITIAL_FORMATS, THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';

// Helper for Arabic numerals
const toArabicDigits = (num) => {
  if (num === null || num === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[d]);
};

export default function StickyFilterBar({
  selectedType,
  onSelectType,
  selectedBudget,
  onSelectBudget,
  itemsCount,
  lang = 'ar',
  formats = INITIAL_FORMATS,
  _themeTokens = THEME_TOKENS.botanical,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const budgetOptions = [
    { id: 'all', label: strings.budgetAll || 'كل الأسعار' },
    { id: 'under_150', label: strings.budgetUnder150 || 'أقل من ١٥٠ ر.س' },
    { id: '150_250', label: strings.budget150to250 || '١٥٠ - ٢٥٠ ر.س' },
    { id: 'over_250', label: strings.budgetOver250 || 'أكثر من ٢٥٠ ر.س' },
  ];

  return (
    <div className="sticky top-16 z-30 w-full backdrop-blur-md bg-[#FAF8F5]/85 dark:bg-stone-950/85 border-b border-stone-200/70 dark:border-stone-800/70 transition-colors duration-300 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        
        {/* Row 1: Unified Categories Bar with Smooth Sliding Background Pill */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 relative">
            {formats.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onSelectType(type.id)}
                  className={`relative flex-none px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer select-none ${
                    isSelected
                      ? 'text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-primary, #123524)' : 'transparent',
                  }}
                >
                  {/* Subtle active glow */}
                  {isSelected && (
                    <span
                      className="absolute inset-0 rounded-full opacity-25 blur-[2px] pointer-events-none"
                      style={{ backgroundColor: 'var(--accent-primary, #123524)' }}
                    />
                  )}
                  <span className="relative z-10">{isAr ? type.nameAr : type.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Results count pill */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 text-[11px] font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              {isAr ? `${toArabicDigits(itemsCount)} ${strings.itemsCount || 'تنسيق'}` : `${itemsCount} ${strings.itemsCount || 'items'}`}
            </span>
          </div>
        </div>

        {/* Row 2: Secondary Budget Quick Filters & Mobile Count */}
        <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-stone-200/50 dark:border-stone-800/50">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold text-stone-400 shrink-0 hidden xs:inline">
              {isAr ? 'الميزانية:' : 'Budget:'}
            </span>
            {budgetOptions.map((b) => {
              const isSelected = selectedBudget === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBudget(b.id)}
                  className={`flex-none text-[11px] px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold shadow-2xs'
                      : 'bg-stone-100/80 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 border border-stone-200/60 dark:border-stone-700/60'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Count Pill */}
          <span className="text-[10px] font-medium text-stone-500 sm:hidden whitespace-nowrap shrink-0">
            {isAr ? `${toArabicDigits(itemsCount)} تنسيق` : `${itemsCount} items`}
          </span>
        </div>

      </div>
    </div>
  );
}
