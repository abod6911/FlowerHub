import React, { useState } from 'react';
import {
  Palette,
  Layout,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Store,
  Sliders,
  TrendingUp,
  X,
} from 'lucide-react';
import { THEMES, HERO_STYLES, SPECIALS_STYLES } from '../data/mockData';
import { t } from '../utils/translations';

export default function ThemeSwitcherBar({
  currentTheme,
  setCurrentTheme,
  currentHero,
  setCurrentHero,
  currentSpecialsStyle = 'marquee',
  setCurrentSpecialsStyle,
  activeView = 'storefront', // 'storefront' | 'admin' | 'split' | 'orderslip'
  setActiveView,
  lang,
  setLang,
  onOpenDesignStudio,
  onToggleStudio,
  isStudioOpen = false,
  onOpenBotanicalTypography,
  hasBagItems = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const strings = t[lang];
  const isAr = lang === 'ar';

  const isStorefront = activeView === 'storefront';
  const showMobileBar = !isStorefront || isMobileOpen;

  return (
    <>
      {/* Mobile Floating Controls Launcher Pill (Only on Storefront when bar is collapsed) */}
      {isStorefront && !isMobileOpen && (
        <div
          className={`sm:hidden fixed ${
            hasBagItems ? 'bottom-[max(5rem,calc(env(safe-area-inset-bottom)+4.2rem))]' : 'bottom-[max(1.25rem,env(safe-area-inset-bottom))]'
          } start-4 z-40 animate-fade-in pointer-events-auto transition-all duration-300`}
        >
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/90 text-amber-300 backdrop-blur-md text-[11px] font-bold shadow-xl border border-amber-400/40 active:scale-95 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'لوحة التحكم' : 'Controls'}</span>
          </button>
        </div>
      )}

      {/* Main Top Header Bar */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          showMobileBar ? 'block' : 'hidden sm:block'
        }`}
      >
      {/* Top Main Bar */}
      <div className="bg-neutral-900/95 backdrop-blur-md text-white border-b border-neutral-800 text-xs px-2.5 py-1.5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Left: Branding badge & View Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-neutral-200 tracking-tight text-xs">
                Flowerhub
              </span>
            </div>

            {/* View Switcher Segmented Control */}
            <div className="flex items-center p-0.5 bg-neutral-800 rounded-xl border border-neutral-700/80 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setActiveView('storefront')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  activeView === 'storefront'
                    ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Store className="w-3 h-3 text-emerald-400" />
                <span>{isAr ? 'المتجر' : 'Store'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('luxury_showcase')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  activeView === 'luxury_showcase'
                    ? 'bg-rose-950 text-rose-200 border border-rose-500/50 shadow-xs font-semibold'
                    : 'text-neutral-400 hover:text-rose-300'
                }`}
                title="واجهة دار الورد المتقدمة مع Soap Bubble و Fancy Typography"
              >
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>{isAr ? 'دار الورد (Luxury)' : 'Luxury UI'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  activeView === 'admin'
                    ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>{isAr ? 'لوحة المنسق' : 'Admin'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('sales')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  activeView === 'sales'
                    ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/50 shadow-xs font-semibold'
                    : 'text-neutral-400 hover:text-emerald-300'
                }`}
                title="متابعة الإيرادات وصافي الأرباح"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>{isAr ? 'المبيعات' : 'Sales'}</span>
              </button>
            </div>
          </div>

          {/* Right: Quick actions (Current Theme/Animation tag & Language Switcher & Controls Toggle) */}
          <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
            {/* Live Design Studio Launcher Button */}
            {(onToggleStudio || onOpenDesignStudio) && (
              <button
                type="button"
                onClick={() => {
                  if (onToggleStudio) {
                    onToggleStudio();
                  } else if (onOpenDesignStudio) {
                    onOpenDesignStudio();
                  }
                }}
                className={`group relative flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all shadow-sm active:scale-95 text-[11px] ${
                  isStudioOpen
                    ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 ring-offset-1 ring-offset-neutral-900 shadow-amber-400/30'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-105 text-stone-950'
                }`}
                title={isAr ? 'استوديو التخصيص البصري الحي' : 'Live Design Studio'}
              >
                {/* Live Pulsing Dot Indicator */}
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-950 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-950"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                <span>
                  {isAr
                    ? isStudioOpen
                      ? 'إغلاق الاستوديو'
                      : 'تخصيص المظهر'
                    : isStudioOpen
                    ? 'Close Studio'
                    : 'Studio'}
                </span>
                <span className="text-[9px] uppercase px-1 py-0.5 rounded font-mono font-extrabold bg-stone-950/20 text-stone-950">
                  Live
                </span>
              </button>
            )}

            {/* Type-Garden Botanical Typography Launcher Button */}
            {onOpenBotanicalTypography && (
              <button
                type="button"
                onClick={onOpenBotanicalTypography}
                className="group relative flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all shadow-sm active:scale-95 text-[11px] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 text-white border border-emerald-400/30"
                title={isAr ? 'استوديو حديقة الحروف النباتية (Type-Garden)' : 'Botanical Typography Studio (Type-Garden)'}
              >
                <span className="text-xs group-hover:scale-125 transition-transform">🌿</span>
                <span>{isAr ? 'حديقة الحروف' : 'Type-Garden'}</span>
                <span className="text-[9px] uppercase px-1 py-0.5 rounded font-mono font-extrabold bg-black/30 text-emerald-300">
                  SVG
                </span>
              </button>
            )}

            {/* Quick Specials Style Pill (Hidden on mobile to keep top bar slim and clean) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors text-[11px] border border-neutral-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-neutral-400">
                {isAr ? 'حركة العرض:' : 'Specials:'}
              </span>
              <strong className="text-amber-300">
                {SPECIALS_STYLES.find((s) => s.id === currentSpecialsStyle)?.[
                  isAr ? 'nameAr' : 'name'
                ] || currentSpecialsStyle}
              </strong>
              {isOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {/* Language Switch Button */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
              title={strings.switchLang}
            >
              <Globe className="w-3 h-3" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Close Button on Mobile Storefront */}
            {isStorefront && isMobileOpen && (
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="sm:hidden p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white shrink-0 active:scale-90 transition-transform"
                aria-label="Close controls"
                title="إغلاق والعودة للمتجر"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable theme, hero, and specials animation controls */}
        {isOpen && (
          <div className="max-w-6xl mx-auto pt-3 pb-2 mt-2 border-t border-neutral-800 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Specials Showcase Animation Style (4 Switchable Modes) */}
              <div>
                <label className="block text-[11px] text-neutral-300 font-medium mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isAr
                      ? 'حركة قسم "جاهز للاستلام اليوم":'
                      : '"Ready Today" Motion Style:'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SPECIALS_STYLES.map((style) => {
                    const isActive = currentSpecialsStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => {
                          if (setCurrentSpecialsStyle) {
                            setCurrentSpecialsStyle(style.id);
                          }
                        }}
                        className={`p-2 rounded-lg text-[11px] font-medium border text-start transition-all ${
                          isActive
                            ? 'bg-neutral-800 text-white border-amber-400 ring-1 ring-amber-400/50'
                            : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="font-bold truncate">
                          {isAr ? style.nameAr : style.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Theme Selector */}
              <div>
                <label className="block text-[11px] text-neutral-300 font-medium mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{strings.themeLabel}</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.values(THEMES)
                    .filter((th, index, self) => self.findIndex((t) => t.id === th.id) === index)
                    .map((th) => {
                      const isActive = currentTheme === th.id;
                      return (
                        <button
                          key={th.id}
                          onClick={() => setCurrentTheme(th.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-[11px] font-medium border text-start transition-all ${
                            isActive
                              ? 'bg-neutral-800 text-white border-emerald-400 ring-1 ring-emerald-400/50'
                              : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-inner"
                            style={{ backgroundColor: th.primaryHex || th.primary }}
                          />
                          <span className="truncate">
                            {isAr ? th.nameAr : th.name}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* 3. Hero Header Style Selector */}
              <div>
                <label className="block text-[11px] text-neutral-300 font-medium mb-1.5 flex items-center gap-1">
                  <Layout className="w-3.5 h-3.5 text-sky-400" />
                  <span>{strings.heroLabel}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {HERO_STYLES.map((hero) => {
                    const isActive = currentHero === hero.id;
                    return (
                      <button
                        key={hero.id}
                        onClick={() => setCurrentHero(hero.id)}
                        className={`p-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                          isActive
                            ? 'bg-neutral-800 text-white border-sky-400 ring-1 ring-sky-400/50'
                            : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {isAr ? hero.nameAr : hero.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
}
