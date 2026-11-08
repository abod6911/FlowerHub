import React from 'react';
import {
  Store,
  Sliders,
  TrendingUp,
  Globe,
  Smartphone,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { t } from '../utils/translations';

export default function ThemeSwitcherBar({
  activeView = 'storefront', // 'storefront' | 'admin' | 'sales'
  setActiveView,
  lang = 'ar',
  setLang,
  onLogout,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const isCoordinatorView = activeView === 'admin' || activeView === 'sales' || activeView === 'split';

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        sessionStorage.removeItem('flowerhub_florist_session');
      } catch {}
      setActiveView('storefront');
    }
  };

  return (
    <header className="w-full hidden sm:block sticky top-0 z-50 bg-[#0c0a09]/95 text-stone-200 border-b border-amber-950/30 text-xs px-3.5 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Mode Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-amber-500/30 text-amber-200 font-serif font-bold text-[11px] shadow-2xs">
            <span className="text-amber-400 text-xs">✦</span>
            <span>{isAr ? 'دار الورد • استوديو الإدارة' : 'Dar Alward • Boutique Studio'}</span>
          </div>

          {/* View Switcher Segmented Control */}
          <div className="flex items-center p-0.5 bg-stone-900/90 rounded-xl border border-stone-800/90 text-[11px] font-medium shadow-inner">
            <button
              type="button"
              onClick={() => setActiveView('storefront')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeView === 'storefront'
                  ? 'bg-stone-800 text-amber-300 shadow-xs font-bold border border-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'معاينة المتجر' : 'Storefront Preview'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-stone-800 text-amber-300 shadow-xs font-bold border border-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'لوحة المنسق' : 'Florist Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('sales')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeView === 'sales'
                  ? 'bg-stone-800 text-amber-300 shadow-xs font-bold border border-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'المبيعات والأرباح' : 'Sales & Profits'}</span>
            </button>
          </div>
        </div>

        {/* Right: Session indicator, Logout & Language switch */}
        <div className="flex items-center gap-2">
          {/* Authenticated Florist Session Pill */}
          {isCoordinatorView && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>{isAr ? 'جلسة منسق موثقة' : 'Verified Florist'}</span>
            </div>
          )}

          {/* Discreet Logout Button for Coordinator */}
          {isCoordinatorView && (
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-rose-950/40 hover:text-rose-200 text-stone-300 text-[11px] font-semibold border border-stone-800 hover:border-rose-900/60 transition-all cursor-pointer active:scale-95"
              title={isAr ? 'تسجيل الخروج من جلسة المنسق' : 'Logout from florist session'}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400/80" />
              <span>{isAr ? 'خروج' : 'Logout'}</span>
            </button>
          )}

          {/* Language Switch */}
          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-200 font-medium text-[11px] border border-stone-800 hover:border-amber-500/20 transition-colors cursor-pointer"
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
