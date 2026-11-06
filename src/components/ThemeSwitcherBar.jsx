import React from 'react';
import {
  Store,
  Sliders,
  TrendingUp,
  Globe,
  Smartphone,
} from 'lucide-react';
import { t } from '../utils/translations';

export default function ThemeSwitcherBar({
  activeView = 'storefront', // 'storefront' | 'admin' | 'sales'
  setActiveView,
  lang = 'ar',
  setLang,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  return (
    <header className="w-full hidden sm:block sticky top-0 z-50 bg-stone-950/95 text-stone-200 border-b border-stone-800 text-xs px-3 py-1.5 shadow-md backdrop-blur-md select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Mode Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-stone-300 font-bold text-[11px]">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'دار الورد • نظام الإدارة والمتجر' : 'Dar Alward • Management System'}</span>
          </div>

          {/* View Switcher Segmented Control */}
          <div className="flex items-center p-0.5 bg-stone-900 rounded-xl border border-stone-800 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveView('storefront')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeView === 'storefront'
                  ? 'bg-stone-800 text-amber-300 shadow-xs font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'المتجر (معاينة الجوال)' : 'Store (Mobile)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeView === 'admin'
                  ? 'bg-stone-800 text-amber-300 shadow-xs font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'لوحة تحكم المنسق' : 'Florist Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('sales')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeView === 'sales'
                  ? 'bg-stone-800 text-amber-300 shadow-xs font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'المبيعات والأرباح' : 'Sales & Profits'}</span>
            </button>
          </div>
        </div>

        {/* Right: Language switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-medium text-[11px] border border-stone-800 transition-colors"
            title={strings.switchLang}
          >
            <Globe className="w-3 h-3 text-stone-400" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
