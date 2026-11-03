import React, { useState } from 'react';
import {
  Palette,
  Globe,
  Sparkles,
  ChevronDown,
  Store,
  Sliders,
  TrendingUp,
  ShoppingBag,
  Wand2,
} from 'lucide-react';
import { useStudioStore } from '../context/StudioThemeContext';
import { CURATED_THEME_PRESETS, LUXURY_PALETTES } from '../types/storeThemeConfig';
import { t } from '../utils/translations';

export default function ThemeSwitcherBar({
  currentTheme: _currentTheme,
  setCurrentTheme: _setCurrentTheme,
  currentHero: _currentHero,
  setCurrentHero: _setCurrentHero,
  currentSpecialsStyle: _currentSpecialsStyle = 'marquee',
  setCurrentSpecialsStyle: _setCurrentSpecialsStyle,
  activeView = 'storefront', // 'storefront' | 'admin' | 'sales'
  setActiveView,
  lang = 'ar',
  setLang,
  onOpenDesignStudio,
  onToggleStudio,
  isStudioOpen = false,
  bagCount = 0,
  onOpenCart,
}) {
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  let studioStore = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    studioStore = useStudioStore();
  } catch {
    // outside provider fallback
  }

  const currentPresetId = studioStore?.config?.presetId || 'royal_rose';
  const currentPreset = CURATED_THEME_PRESETS.find((p) => p.id === currentPresetId) || CURATED_THEME_PRESETS[0];

  const handleSelectPreset = (presetId) => {
    if (studioStore?.applyPreset) {
      studioStore.applyPreset(presetId);
    }
    setIsPresetsOpen(false);
  };

  return (
    <header className="sticky top-2 z-50 w-full px-3 sm:px-6 transition-all duration-300 pointer-events-auto">
      {/* Floating Glass Capsule Navigation Bar */}
      <div className="max-w-7xl mx-auto bg-stone-900/85 backdrop-blur-md text-white border border-stone-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.18)] px-3 sm:px-4 py-2 transition-all">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Section 1 (RTL Start): Boutique Brand & Live Pulse */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('storefront')}
              className="flex items-center gap-2 text-start group cursor-pointer"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xs sm:text-sm tracking-tight text-stone-100 group-hover:text-amber-300 transition-colors">
                  {isAr ? 'دار الورد للمناسبات' : 'Dar Alward • Boutique'}
                </span>
                <span className="text-[9px] text-stone-400 font-mono hidden sm:block">
                  {isAr ? 'متجر الزهور الفاخر • مباشر' : 'Haute Floral Atelier • Live'}
                </span>
              </div>
            </button>
          </div>

          {/* Section 2 (Center): Segmented View Controller (Storefront vs Management Tools) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* Customer Area */}
            <div className="flex items-center p-0.5 bg-stone-800/90 rounded-xl border border-stone-700/60 text-[11px] font-medium shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('storefront')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'storefront'
                    ? 'bg-stone-950 text-white shadow-xs font-bold ring-1 ring-white/10'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
                title="تصفح متجر الزهور كعميل"
              >
                <Store className={`w-3.5 h-3.5 ${activeView === 'storefront' ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{isAr ? 'المتجر' : 'Store'}</span>
              </button>
            </div>

            {/* Elegant Divider */}
            <div className="h-5 w-px bg-stone-700/60 shrink-0 hidden xs:block" />

            {/* Management & Operations Area */}
            <div className="flex items-center p-0.5 bg-stone-800/90 rounded-xl border border-stone-700/60 text-[11px] font-medium shrink-0">
              {/* Coordinator Admin */}
              <button
                type="button"
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'admin'
                    ? 'bg-stone-950 text-white shadow-xs font-bold ring-1 ring-white/10'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
                title="لوحة تحكم وتنسيق الطلبات للمنسق"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'لوحة المنسق' : 'Admin'}</span>
              </button>

              {/* Sales & Profits */}
              <button
                type="button"
                onClick={() => setActiveView('sales')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'sales'
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 shadow-xs font-bold'
                    : 'text-stone-400 hover:text-emerald-300'
                }`}
                title="تقرير المبيعات وصافي الأرباح اللحظي"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{isAr ? 'المبيعات والأرباح' : 'Sales & Profits'}</span>
                <span className="sm:hidden">{isAr ? 'المبيعات' : 'Sales'}</span>
              </button>

              {/* Live Design Studio Launcher */}
              {(onToggleStudio || onOpenDesignStudio) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleStudio) onToggleStudio();
                    else if (onOpenDesignStudio) onOpenDesignStudio();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isStudioOpen
                      ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                      : 'text-amber-300 hover:text-amber-200 hover:bg-stone-700/50'
                  }`}
                  title="استوديو التخصيص البصري الحي"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{isAr ? 'استوديو التخصيص' : 'Design Studio'}</span>
                  <span className="md:hidden">{isAr ? 'التخصيص' : 'Studio'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 3 (RTL End): Curated Theme Preset Dropdown, Cart & Language */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Curated Presets Pill Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPresetsOpen(!isPresetsOpen)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700/80 text-xs font-semibold transition-all cursor-pointer"
                title="تغيير القالب الجاهز للمتجر"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-stone-400 text-[10px]">{isAr ? 'القالب:' : 'Theme:'}</span>
                <span className="text-stone-100 max-w-[110px] truncate">
                  {isAr ? currentPreset.nameAr : currentPreset.nameEn}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {/* Presets Floating Menu */}
              {isPresetsOpen && (
                <div className="absolute top-full end-0 mt-2 w-72 p-2 rounded-2xl bg-stone-900 border border-stone-700/90 shadow-2xl z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-800 mb-1 flex items-center justify-between">
                    <span>{isAr ? 'القوالب الفاخرة الجاهزة' : 'Curated Luxury Presets'}</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>

                  {CURATED_THEME_PRESETS.map((p) => {
                    const isSelected = p.id === currentPresetId;
                    const pal = LUXURY_PALETTES[p.paletteId];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        className={`w-full p-2.5 rounded-xl flex items-start gap-2.5 text-start transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-stone-800/90 text-white ring-1 ring-amber-400/50'
                            : 'hover:bg-stone-800/50 text-stone-300'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-0.5 shadow-xs"
                          style={{ backgroundColor: pal?.primary || '#881337' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-stone-100 truncate">
                              {isAr ? p.nameAr : p.nameEn}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-stone-800 text-amber-300 font-mono">
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                            {p.descriptionAr}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Cart Button (If bag has items) */}
            {onOpenCart && bagCount > 0 && (
              <button
                type="button"
                onClick={onOpenCart}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                title="سلة الطلبات"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="font-mono">{bagCount}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700/80 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              title={strings.switchLang || 'Switch Language'}
            >
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
