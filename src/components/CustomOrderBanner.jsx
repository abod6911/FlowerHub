import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';
import { VariableFontHoverByRandomLetter } from './fancy/variable-font-hover-by-random-letter';

export default function CustomOrderBanner({
  onOpenCustomDrawer,
  lang = 'ar',
  themeTokens = THEME_TOKENS.botanical,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  return (
    <section className="py-2.5 px-4 w-full transition-colors duration-300">
      <div
        onClick={onOpenCustomDrawer}
        className={`rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:opacity-95 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 ${themeTokens.banner}`}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold tracking-tight leading-snug">
            <VariableFontHoverByRandomLetter
              label={isAr ? 'صمّم باقتك الخاصة بخطوة واحدة' : (strings.customBannerTitle || 'Custom Bespoke Order')}
              fromFontVariationSettings="'wght' 400"
              toFontVariationSettings="'wght' 800"
              staggerDuration={0.035}
              className="inline-block cursor-pointer font-bold"
            />
          </h3>
          <p className="text-xs opacity-90 mt-1 leading-relaxed">
            {strings.customBannerDesc}
          </p>
        </div>

        <button
          type="button"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs transition-colors shadow-xs active:scale-95 group"
        >
          <VariableFontHoverByRandomLetter
            label={isAr ? 'صمّم الآن' : (strings.customBannerCta || 'Customize')}
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 850"
            staggerDuration={0.03}
            className="inline-block"
          />
          {isAr ? <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </div>
    </section>
  );
}
