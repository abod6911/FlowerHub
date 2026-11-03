import React from 'react';
import { INITIAL_FORMATS, THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';
import { SoapBubbleMaterial, SoapBubbleButton } from './soap-bubble';

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
  themeTokens = THEME_TOKENS.botanical,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const budgetOptions = [
    { id: 'all', label: strings.budgetAll },
    { id: 'under_150', label: strings.budgetUnder150 },
    { id: '150_250', label: strings.budget150to250 },
    { id: 'over_250', label: strings.budgetOver250 },
  ];

  return (
    <div
      className={`sticky top-10 z-30 w-full py-3 px-4 sm:px-6 backdrop-blur-md transition-colors duration-300 border-b ${
        themeTokens.isDark
          ? 'bg-[#0B0B0C]/95 border-neutral-850'
          : 'bg-[#FAF8F5]/90 border-neutral-200/60'
      }`}
    >
      <div className="flex flex-col gap-2.5 max-w-7xl mx-auto">
        {/* Row 1: Dynamic Product Formats wrapped in SoapBubbleMaterial with liquid-bubble feel */}
        <SoapBubbleMaterial iridescence={0.4} glass={0.9} refraction={0.18} bevel={8}>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-2 px-2">
            {formats.map((type) => {
              const isSelected = selectedType === type.id;
              return isSelected ? (
                <SoapBubbleButton
                  key={type.id}
                  type="button"
                  onClick={() => onSelectType(type.id)}
                  iridescence={0.4}
                  className="flex-none px-4 py-2 rounded-full text-xs font-semibold shadow-xs cursor-pointer text-white"
                  style={{
                    backgroundColor: 'var(--accent-primary, #123524)',
                    color: '#FFFFFF',
                  }}
                >
                  {isAr ? type.nameAr : type.nameEn}
                </SoapBubbleButton>
              ) : (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onSelectType(type.id)}
                  className="flex-none px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer bg-[#F7F5EE] dark:bg-stone-800 border border-neutral-200/80 dark:border-stone-700 text-neutral-600 dark:text-neutral-300 font-medium hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {isAr ? type.nameAr : type.nameEn}
                </button>
              );
            })}
          </div>
        </SoapBubbleMaterial>

        {/* Row 2: Secondary Budget Filters & Count Indicator */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {budgetOptions.map((b) => {
              const isSelected = selectedBudget === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBudget(b.id)}
                  className={`flex-none text-[11px] sm:text-xs px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#123524] text-white font-semibold shadow-xs'
                      : 'bg-[#F7F5EE] border border-neutral-200/80 text-neutral-600 font-medium hover:bg-neutral-100'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          {/* Results count indicator */}
          <span className="text-[11px] sm:text-xs shrink-0 font-medium px-1.5 text-neutral-500 whitespace-nowrap">
            {isAr ? `${toArabicDigits(itemsCount)} ${strings.itemsCount}` : `${itemsCount} ${strings.itemsCount}`}
          </span>
        </div>
      </div>
    </div>
  );
}
