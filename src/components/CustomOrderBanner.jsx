import React from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
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
    <section className="py-2.5 px-3.5 sm:px-4 w-full transition-colors duration-300">
      <div
        onClick={onOpenCustomDrawer}
        className={`relative overflow-hidden rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-lg shadow-[0_8px_24px_-4px_rgba(212,175,55,0.12)] border border-amber-400/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 group select-none active:scale-[0.99] ${themeTokens.banner}`}
      >
        {/* Subtle Ambient Decorative Glow & Watermark in background */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3 flex-1 min-w-0 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Wand2 className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                {isAr ? '⚜ أتيلييه التفصيل الخاص' : '⚜ Bespoke Atelier'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold tracking-tight leading-snug">
              <VariableFontHoverByRandomLetter
                label={isAr ? 'صمّم باقتك الخاصة بخطوة واحدة' : (strings.customBannerTitle || 'Custom Bespoke Order')}
                fromFontVariationSettings="'wght' 500"
                toFontVariationSettings="'wght' 850"
                staggerDuration={0.035}
                className="inline-block cursor-pointer font-extrabold"
              />
            </h3>
            <p className="text-[11px] sm:text-xs opacity-90 mt-0.5 leading-relaxed">
              {strings.customBannerDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs transition-all shadow-md active:scale-95 group relative z-10"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'صمّم الآن' : (strings.customBannerCta || 'Customize')}</span>
          {isAr ? (
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>
    </section>
  );
}
