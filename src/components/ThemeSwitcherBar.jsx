import React from 'react';
import {
  Store,
  Sliders,
  TrendingUp,
  Globe,
  Building2,
  LogOut,
} from 'lucide-react';
import { t } from '../utils/translations';

export default function ThemeSwitcherBar({
  activeView = 'storefront', // 'storefront' | 'admin' | 'sales' | 'network'
  setActiveView,
  lang = 'ar',
  setLang,
  onLogout,
  userRole = null, // 'super_admin' | 'store_owner' | null
  storeName = null,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const isCoordinatorView =
    activeView === 'admin' ||
    activeView === 'sales' ||
    activeView === 'split' ||
    activeView === 'network';

  const showNetworkTab = userRole === 'super_admin' || activeView === 'network';

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
    <header className="w-full hidden sm:block sticky top-0 z-50 bg-[#141312] text-stone-200 border-b border-white/10 text-xs px-4 py-2 backdrop-blur-xl select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[#F6F4EF] font-serif font-bold text-[11px]">
            <span className="text-[#C5A572] text-[10px]">✦</span>
            <span>{storeName || (isAr ? 'إدارة المتجر' : 'Boutique Console')}</span>
          </div>

          {/* View Switcher Segmented Control */}
          <div className="flex items-center p-0.5 bg-white/5 rounded-xl border border-white/10 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveView('storefront')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeView === 'storefront'
                  ? 'bg-[#FCFBF8] text-[#141312] shadow-xs font-bold'
                  : 'text-stone-400 hover:text-stone-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{isAr ? 'معاينة المتجر' : 'Storefront'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-[#FCFBF8] text-[#141312] shadow-xs font-bold'
                  : 'text-stone-400 hover:text-stone-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isAr ? 'لوحة المنسق' : 'Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('sales')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeView === 'sales'
                  ? 'bg-[#FCFBF8] text-[#141312] shadow-xs font-bold'
                  : 'text-stone-400 hover:text-stone-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isAr ? 'المبيعات والأرباح' : 'Sales'}</span>
            </button>

            {showNetworkTab && (
              <button
                type="button"
                onClick={() => setActiveView('network')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeView === 'network'
                    ? 'bg-[#FCFBF8] text-[#141312] shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'منشئ المتاجر' : 'Store Builder'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Session indicator, Logout & Language switch */}
        <div className="flex items-center gap-2">
          {isCoordinatorView && userRole && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-stone-300 text-[11px] font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                {userRole === 'super_admin'
                  ? isAr
                    ? 'مدير المنصة'
                    : 'Super Admin'
                  : isAr
                  ? 'صاحب المتجر'
                  : 'Store Owner'}
              </span>
            </div>
          )}

          {isCoordinatorView && (
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-[11px] font-medium border border-white/10 transition-colors cursor-pointer"
              title={isAr ? 'تسجيل الخروج' : 'Logout'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'خروج' : 'Logout'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white font-medium text-[11px] border border-white/10 transition-colors cursor-pointer"
            title={strings.switchLang}
          >
            <Globe className="w-3 h-3 text-[#C5A572]" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
