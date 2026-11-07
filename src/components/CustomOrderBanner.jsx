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
    <section className="py-1.5 px-3.5 sm:px-4 w-full select-none">
      <div
        onClick={onOpenCustomDrawer}
        className="relative overflow-hidden rounded-[20px] p-3 sm:p-3.5 cursor-pointer transition-all duration-300 hover:shadow-md border border-stone-800 bg-stone-950 text-white flex items-center justify-between gap-3 active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Palette className="w-4 h-4 text-amber-300" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
              {isAr ? 'صمّم باقتك الخاصة حسب ذوقك' : (strings.customBannerTitle || 'Custom Bespoke Order')}
            </h3>
            <p className="text-[11px] text-stone-400 truncate mt-0.5">
              {isAr ? 'ننسقها حسب ميزانيتك ومناسبتك بعناية' : strings.customBannerDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-xs group-hover:bg-amber-300 active:scale-95 cursor-pointer"
        >
          <span>{isAr ? 'صمم الآن' : (strings.customBannerCta || 'Customize')}</span>
          {isAr ? (
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>
    </section>
  );
}
