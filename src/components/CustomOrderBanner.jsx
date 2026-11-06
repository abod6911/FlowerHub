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
    <section className="py-2 px-3 sm:px-4 w-full transition-colors duration-300">
      <div
        onClick={onOpenCustomDrawer}
        className={`relative overflow-hidden rounded-[20px] p-3.5 cursor-pointer transition-all duration-200 hover:shadow-md border border-amber-300/40 dark:border-stone-800 flex flex-col gap-2.5 group select-none active:scale-[0.99] ${themeTokens.banner}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Palette className="w-4 h-4 text-amber-300" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight font-serif truncate">
              {isAr ? 'صمّم باقتك الخاصة حسب ذوقك' : (strings.customBannerTitle || 'Custom Bespoke Order')}
            </h3>
            <p className="text-[11px] text-stone-300 mt-0.5 truncate">
              {isAr ? 'اختر الأزهار والميزانية وسينسقها خبيرنا بعناية' : strings.customBannerDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all shadow-xs active:scale-95"
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
