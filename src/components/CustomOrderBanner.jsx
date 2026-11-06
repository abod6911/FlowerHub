import React from 'react';
import { ArrowRight, ArrowLeft, Palette } from 'lucide-react';
import { THEME_TOKENS } from '../data/mockData';
import { t } from '../utils/translations';

export default function CustomOrderBanner({
  onOpenCustomDrawer,
  lang = 'ar',
  themeTokens = THEME_TOKENS.botanical,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  return (
    <section className="py-2 px-3.5 sm:px-4 w-full transition-colors duration-300">
      <div
        onClick={onOpenCustomDrawer}
        className={`relative overflow-hidden rounded-[24px] p-4 cursor-pointer transition-all duration-200 hover:shadow-md border border-amber-300/40 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group select-none active:scale-[0.99] ${themeTokens.banner}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-xs">
            <Palette className="w-4 h-4 text-amber-300" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-amber-300/90 tracking-wide block">
              {isAr ? 'خدمة التنسيق الخاص' : 'Bespoke Floral Design'}
            </span>

            <h3 className="text-sm font-bold text-white tracking-tight leading-snug mt-0.5 font-serif">
              {isAr ? 'صمّم باقتك الخاصة حسب ذوقك' : (strings.customBannerTitle || 'Custom Bespoke Order')}
            </h3>
            <p className="text-[11px] text-stone-300 mt-0.5 line-clamp-1">
              {strings.customBannerDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all shadow-xs active:scale-95 group relative z-10"
        >
          <span>{isAr ? 'طلب تنسيق خاص' : (strings.customBannerCta || 'Customize')}</span>
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
