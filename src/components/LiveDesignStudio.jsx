import React, { useState } from 'react';
import {
  Palette,
  Layout,
  Zap,
  RotateCcw,
  Save,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Layers,
  Type,
  Share2,
  FileCode,
} from 'lucide-react';
import {
  THEME_TOKENS,
  HERO_STYLES,
  SPECIALS_STYLES,
  FONT_PRESETS,
  RADIUS_PRESETS,
  MOTION_PRESETS,
  DEFAULT_CUSTOMIZER_CONFIG,
  CURATED_TEMPLATES,
} from '../data/mockData';
import { exportThemeToUrl, generateThemeCssFile } from '../utils/themeEngine';

/**
 * Live Design Studio Drawer Component
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   config: typeof DEFAULT_CUSTOMIZER_CONFIG,
 *   onChange: (newConfig: typeof DEFAULT_CUSTOMIZER_CONFIG) => void,
 *   onSave: () => void,
 *   onReset: () => void,
 *   lang?: 'ar' | 'en'
 * }} props
 */
export default function LiveDesignStudio({
  isOpen,
  onClose,
  config = DEFAULT_CUSTOMIZER_CONFIG,
  onChange,
  onSave,
  onReset,
  lang = 'ar',
  onOpenBotanicalTypography,
}) {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'colors' | 'layout' | 'typography' | 'motion'
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadedCss, setDownloadedCss] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentOverrides = config?.overrides || DEFAULT_CUSTOMIZER_CONFIG.overrides;
  const currentTypography = config?.typography || DEFAULT_CUSTOMIZER_CONFIG.typography;
  const currentLayout = config?.layout || DEFAULT_CUSTOMIZER_CONFIG.layout;
  const currentMotion = config?.motion || DEFAULT_CUSTOMIZER_CONFIG.motion;
  const activePresetId = config?.presetId || 'botanical';

  // 1. Handle Selecting a Complete Theme Preset
  const handleSelectPreset = (presetId) => {
    const preset = THEME_TOKENS[presetId];
    if (!preset) return;

    const newConfig = {
      ...config,
      presetId,
      overrides: {
        ...currentOverrides,
        ...(preset.variables || {}),
      },
      motion: {
        ...currentMotion,
        specialsSpeed: preset.specialsSpeed || currentMotion.specialsSpeed || 28,
      },
    };
    onChange(newConfig);
  };

  // 2. Handle Individual CSS Custom Property Override
  const handleOverrideChange = (cssVarName, value) => {
    const newConfig = {
      ...config,
      overrides: {
        ...currentOverrides,
        [cssVarName]: value,
      },
    };
    onChange(newConfig);
  };

  // 3. Handle Layout Properties
  const handleLayoutChange = (key, value) => {
    const newConfig = {
      ...config,
      layout: {
        ...currentLayout,
        [key]: value,
      },
    };
    onChange(newConfig);
  };

  // 4. Handle Typography Presets
  const handleFontChange = (fontDef) => {
    const newConfig = {
      ...config,
      typography: {
        activeFontId: fontDef.id,
        fontAr: fontDef.familyAr,
        fontEn: fontDef.familyEn,
      },
    };
    onChange(newConfig);
  };

  // 5. Handle Radius Presets
  const handleRadiusChange = (preset) => {
    const newConfig = {
      ...config,
      overrides: {
        ...currentOverrides,
        '--radius-unit': preset.card,
        '--radius-btn': preset.button,
      },
    };
    onChange(newConfig);
  };

  // 6. Handle Motion Properties
  const handleMotionChange = (key, value) => {
    const newConfig = {
      ...config,
      motion: {
        ...currentMotion,
        [key]: value,
      },
    };

    if (key === 'preset') {
      const ease =
        value === 'snappy'
          ? 'cubic-bezier(0.4, 0, 0.2, 1)'
          : value === 'springy'
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.16, 1, 0.3, 1)';
      newConfig.overrides = {
        ...newConfig.overrides,
        '--ease-transition': ease,
      };
    }

    onChange(newConfig);
  };

  // Copy JSON configuration
  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(config, null, 2);
    navigator.clipboard?.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Download JSON configuration file
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowerhub-customizer-${config.presetId || 'theme'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share Theme via URL Search Params
  const handleShareLink = () => {
    try {
      const shareUrl = exportThemeToUrl(config);
      navigator.clipboard?.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Failed to copy share link:', err);
    }
  };

  // Download Standalone theme.css file
  const handleDownloadCss = () => {
    try {
      const cssString = generateThemeCssFile(config);
      const blob = new Blob([cssString], { type: 'text/css;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flowerhub-${config?.presetId || 'theme'}.css`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadedCss(true);
      setTimeout(() => setDownloadedCss(false), 2500);
    } catch (err) {
      console.warn('Failed to download theme.css:', err);
    }
  };

  // Handle Save
  const handleSaveAction = () => {
    onSave?.();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const tabs = [
    { id: 'presets', label: isAr ? 'القوالب' : 'Presets', icon: Palette },
    { id: 'colors', label: isAr ? 'الألوان والزجاج' : 'Colors & Glass', icon: Layers },
    { id: 'layout', label: isAr ? 'الهندسة والعرض' : 'Layout & Radius', icon: Layout },
    { id: 'typography', label: isAr ? 'الخطوط' : 'Fonts', icon: Type },
    { id: 'motion', label: isAr ? 'الحركة' : 'Motion', icon: Zap },
  ];

  return (
    <aside
      className="fixed inset-y-0 end-0 z-50 w-full max-w-[440px] bg-stone-900/98 text-stone-100 shadow-2xl border-s border-stone-800 flex flex-col backdrop-blur-2xl animate-slide-up sm:animate-fade-in transition-all duration-300"
      style={{ direction: isAr ? 'rtl' : 'ltr' }}
    >
      {/* 1. Header */}
      <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
              <span>{isAr ? 'استوديو التخصيص البصري الحي' : 'Live Design Studio'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                PRO
              </span>
            </h2>
            <p className="text-[11px] text-stone-400">
              {isAr ? 'تحكم لحظي في هوية ومظهر المتجر' : 'Real-time storefront identity & tokens engine'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          title={isAr ? 'إغلاق اللوحة' : 'Close studio'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="px-3 py-2 bg-stone-950/50 border-b border-stone-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs no-scrollbar">
        {/* ========================================================= */}
        {/* TAB 1: PRESETS & CURATED TEMPLATES                        */}
        {/* ========================================================= */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            {/* 1. Curated Storefront Full Presets */}
            <div className="space-y-3">
              <div>
                <label className="font-bold text-amber-300 text-xs flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'مكتبة القوالب الجاهزة فائقة الفخامة' : 'Curated Storefront Full Presets'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    5 Presets
                  </span>
                </label>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {isAr
                    ? 'قوالب متكاملة ومحكمة تغير الألوان، نمط الهيدر، حركة الباقات، الخطوط، واستدارة الحواف بضغطة زر واحدة'
                    : 'All-in-one curated templates updating palette, hero style, motion physics, and typography in 1 tap'}
                </p>
              </div>

              <div className="space-y-3">
                {CURATED_TEMPLATES.map((tmpl) => {
                  const isActiveTemplate =
                    config?.layout?.heroStyle === tmpl.config.layout.heroStyle &&
                    config?.layout?.specialsStyle === tmpl.config.layout.specialsStyle &&
                    config?.presetId === tmpl.config.presetId &&
                    config?.overrides?.['--accent-primary'] === tmpl.config.overrides['--accent-primary'];

                  return (
                    <div
                      key={tmpl.id}
                      className={`p-3.5 rounded-2xl border transition-all relative space-y-3 ${
                        isActiveTemplate
                          ? 'border-amber-400 bg-gradient-to-b from-stone-900 to-amber-950/30 shadow-lg ring-1 ring-amber-400/40'
                          : 'border-stone-800 bg-stone-900/60 hover:bg-stone-800/60 hover:border-stone-700'
                      }`}
                    >
                      {/* Header with Title & Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-100 text-xs sm:text-sm">
                              {isAr ? tmpl.nameAr : tmpl.nameEn}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {tmpl.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                            {isAr ? tmpl.descriptionAr : tmpl.descriptionEn}
                          </p>
                        </div>

                        {isActiveTemplate && (
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Color Palette Swatches Preview */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-950/80 border border-stone-800">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400 font-medium">
                            {isAr ? 'الألوان:' : 'Palette:'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {tmpl.previewColors.map((color, idx) => (
                              <span
                                key={idx}
                                className="w-5 h-5 rounded-lg border border-white/20 shadow-xs"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Specs Pills */}
                        <div className="flex items-center gap-1 text-[9px] font-mono text-stone-400 flex-wrap justify-end">
                          <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">
                            {tmpl.config.layout.heroStyle}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">
                            {tmpl.config.layout.specialsStyle}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">
                            {tmpl.config.typography.activeFontId}
                          </span>
                        </div>
                      </div>

                      {/* 1-Tap Apply Button */}
                      <button
                        type="button"
                        onClick={() => onChange(tmpl.config)}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                          isActiveTemplate
                            ? 'bg-amber-400 text-stone-950 shadow-md font-black cursor-default'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700'
                        }`}
                      >
                        {isActiveTemplate ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isAr ? 'القالب النشط حالياً في المتجر' : 'Active Storefront Preset'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isAr ? 'تطبيق هذا القالب المتكامل فوراً' : 'Apply Full Preset Live'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Base Theme Color Palettes */}
            <div className="space-y-3 pt-3 border-t border-stone-800/80">
              <div>
                <label className="font-semibold text-stone-300 text-xs block mb-1">
                  {isAr ? 'الثيمات اللونية الفردية الأساسية' : 'Base Color Palettes'}
                </label>
                <p className="text-[11px] text-stone-400">
                  {isAr
                    ? 'تبديل ألوان الواجهة فقط مع الحفاظ على التخصيصات الأخرى'
                    : 'Switch color tokens only while preserving layout & motion configuration'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(THEME_TOKENS).map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  const pVars = preset.variables || {};

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-3 rounded-2xl border text-start transition-all relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-400 bg-stone-800/90 shadow-md ring-1 ring-amber-400/50'
                          : 'border-stone-800 bg-stone-900/60 hover:bg-stone-800/60 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-100 text-xs">
                          {isAr ? preset.nameAr : preset.name}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Palette Swatches Bar */}
                      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-stone-950/70 border border-stone-800/80">
                        <span
                          className="w-5 h-5 rounded-md border border-white/20 shadow-xs"
                          style={{ backgroundColor: pVars['--bg-canvas'] || preset.canvasBg }}
                          title="Canvas"
                        />
                        <span
                          className="w-5 h-5 rounded-md border border-white/20 shadow-xs"
                          style={{ backgroundColor: pVars['--surface-card'] || preset.surfaceBg }}
                          title="Surface Card"
                        />
                        <span
                          className="w-5 h-5 rounded-md border border-white/20 shadow-xs"
                          style={{ backgroundColor: pVars['--accent-primary'] || preset.accentPrimary }}
                          title="Primary Button"
                        />
                        <span
                          className="w-5 h-5 rounded-md border border-white/20 shadow-xs"
                          style={{ backgroundColor: pVars['--accent-gold'] || preset.goldAccent }}
                          title="Accent Gold"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COLORS & GLASSMORPHISM */}
        {/* ========================================================= */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="font-semibold text-stone-200 text-xs block">
                {isAr ? 'لوحة ألوان الهوية التفاعلية' : 'CSS Custom Property Tokens'}
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {/* 1. Canvas Background */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="space-y-0.5">
                    <span className="font-medium text-stone-200">
                      {isAr ? 'خلفية المتجر الرئيسية (--bg-canvas)' : 'Canvas Background'}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-mono">
                      {currentOverrides['--bg-canvas'] || '#FAF8F5'}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={currentOverrides['--bg-canvas'] || '#FAF8F5'}
                    onChange={(e) => handleOverrideChange('--bg-canvas', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* 2. Surface Card */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="space-y-0.5">
                    <span className="font-medium text-stone-200">
                      {isAr ? 'خلفية البطاقات والـ Drawers (--surface-card)' : 'Card Surface'}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-mono">
                      {currentOverrides['--surface-card'] || '#FFFFFF'}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={currentOverrides['--surface-card'] || '#FFFFFF'}
                    onChange={(e) => handleOverrideChange('--surface-card', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* 3. Primary Accent */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="space-y-0.5">
                    <span className="font-medium text-stone-200">
                      {isAr ? 'لون الأزرار الأساسية (--accent-primary)' : 'Primary Accent Button'}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-mono">
                      {currentOverrides['--accent-primary'] || '#022C22'}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={currentOverrides['--accent-primary'] || '#022C22'}
                    onChange={(e) => handleOverrideChange('--accent-primary', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* 4. Gold / Metallic Accent */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="space-y-0.5">
                    <span className="font-medium text-stone-200">
                      {isAr ? 'الذهب والأيقونات الفاخرة (--accent-gold)' : 'Luxury Gold / Metallic Accent'}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-mono">
                      {currentOverrides['--accent-gold'] || '#D4AF37'}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={currentOverrides['--accent-gold'] || '#D4AF37'}
                    onChange={(e) => handleOverrideChange('--accent-gold', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* 5. Text Main */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="space-y-0.5">
                    <span className="font-medium text-stone-200">
                      {isAr ? 'النص الأساسي للعنوان (--text-main)' : 'Main Text Color'}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-mono">
                      {currentOverrides['--text-main'] || '#1C1917'}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={currentOverrides['--text-main'] || '#1C1917'}
                    onChange={(e) => handleOverrideChange('--text-main', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* 6. Text Muted */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="space-y-0.5">
                    <span className="font-medium text-stone-200">
                      {isAr ? 'النص الثانوي والهوامش (--text-muted)' : 'Muted Text Color'}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-mono">
                      {currentOverrides['--text-muted'] || '#78716C'}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={currentOverrides['--text-muted'] || '#78716C'}
                    onChange={(e) => handleOverrideChange('--text-muted', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                {/* 7. Subtle Border */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="space-y-0.5">
                    <span className="font-medium text-stone-200">
                      {isAr ? 'حدود البطاقات الفاصلة (--border-subtle)' : 'Subtle Card Borders'}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-mono">
                      {currentOverrides['--border-subtle'] || '#E7E5E4'}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={currentOverrides['--border-subtle'] || '#E7E5E4'}
                    onChange={(e) => handleOverrideChange('--border-subtle', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>

            {/* Glassmorphism Controls */}
            <div className="space-y-3 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-200 block">
                    {isAr ? 'تأثير الزجاج الضبابي (--surface-glass)' : 'Glassmorphism Surface'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {isAr ? 'تفعيل التعتيم الشفاف والـ backdrop-blur' : 'Frosted glass effect on active surfaces'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(currentLayout.glassmorphism)}
                    onChange={(e) => handleLayoutChange('glassmorphism', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {currentLayout.glassmorphism && (
                <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <span className="text-[11px] font-medium text-stone-300 block mb-1">
                    {isAr ? 'درجة الضبابية (--glass-blur):' : 'Backdrop Blur Amount:'}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['6px', '12px', '16px', '24px'].map((blurVal) => (
                      <button
                        key={blurVal}
                        onClick={() => handleLayoutChange('glassBlur', blurVal)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-mono border text-center transition-all ${
                          currentLayout.glassBlur === blurVal
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                            : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {blurVal}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LAYOUT & RADIUS GEOMETRY */}
        {/* ========================================================= */}
        {activeTab === 'layout' && (
          <div className="space-y-5">
            {/* 1. Hero Layout Style */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-200 text-xs block">
                {isAr ? 'نمط الهيدر العلوي (HERO_STYLES)' : 'Hero Style Layout'}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {HERO_STYLES.map((hero) => (
                  <button
                    key={hero.id}
                    onClick={() => handleLayoutChange('heroStyle', hero.id)}
                    className={`p-2.5 rounded-xl border text-start transition-all flex flex-col gap-1 ${
                      currentLayout.heroStyle === hero.id
                        ? 'border-amber-400 bg-stone-800 text-white font-semibold shadow-xs ring-1 ring-amber-400/30'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-stone-100">{isAr ? hero.nameAr : hero.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 font-medium border border-stone-800">
                        {hero.previewBadge}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      {isAr ? hero.descriptionAr : hero.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Specials Motion Style */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <label className="font-semibold text-stone-200 text-xs block">
                {isAr ? 'نمط حركة باقات المبرد (SPECIALS_STYLES)' : 'Specials Carousel Showcase'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALS_STYLES.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => handleLayoutChange('specialsStyle', spec.id)}
                    className={`p-2.5 rounded-xl border text-start transition-all flex flex-col gap-1 ${
                      currentLayout.specialsStyle === spec.id
                        ? 'border-amber-400 bg-stone-800 text-amber-300 font-semibold shadow-xs'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className="font-bold text-[11px]">{isAr ? spec.nameAr : spec.name}</span>
                    <span className="text-[9px] text-stone-500 font-mono">
                      {spec.id === 'marquee'
                        ? `Loop: ${spec.motionProps?.speed}s`
                        : spec.id === 'coverflow'
                        ? `Tilt: ${spec.motionProps?.depthAngle}°`
                        : spec.id === 'spotlight'
                        ? `Blur: ${spec.motionProps?.backdropBlur}`
                        : 'Aspect: 16/9'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Border Radius Geometry */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-stone-200 text-xs">
                  {isAr ? 'انحناء الحواف والزوايا (--radius-unit)' : 'Border Radius Presets'}
                </label>
                <span className="text-[10px] font-mono text-amber-400">
                  {currentOverrides['--radius-unit'] || '16px'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {RADIUS_PRESETS.map((preset) => {
                  const isMatch = currentOverrides['--radius-unit'] === preset.card;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleRadiusChange(preset)}
                      className={`p-2 rounded-xl border text-start transition-all flex items-center justify-between ${
                        isMatch
                          ? 'border-amber-400 bg-stone-800 text-white font-semibold'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="text-[11px]">{isAr ? preset.nameAr : preset.nameEn}</span>
                      <div
                        className="w-4 h-4 border border-amber-400/80 bg-amber-400/20"
                        style={{ borderRadius: preset.card }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TYPOGRAPHY */}
        {/* ========================================================= */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            {/* Botanical Typography Quick Launcher */}
            {onOpenBotanicalTypography && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-stone-900 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg shrink-0">
                    🌿
                  </div>
                  <div>
                    <div className="font-bold text-xs text-emerald-200">
                      {isAr ? 'حديقة الحروف النباتية (Type-Garden)' : 'Type-Garden Botanical Typography'}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {isAr ? 'توليد أزهار خشبية متداخلة مع الحروف وتصدير SVG' : 'Woodblock blooms weaving through letter glyphs with SVG export'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBotanicalTypography();
                  }}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 transition-all shrink-0 shadow-md active:scale-95"
                >
                  {isAr ? 'فتح الاستوديو' : 'Launch'}
                </button>
              </div>
            )}

            <div>
              <label className="font-semibold text-stone-200 text-xs block mb-1">
                {isAr ? 'خيارات الخطوط الملكية (FONT_PRESETS)' : 'Typography Presets'}
              </label>
              <p className="text-[11px] text-stone-400">
                {isAr
                  ? 'اختر التوليفة الطباعية المناسبة لشخصية متجرك'
                  : 'Select the optimal typographic pairing for luxury branding'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {FONT_PRESETS.map((font) => {
                const isSelected = currentTypography.activeFontId === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() => handleFontChange(font)}
                    className={`p-3 rounded-2xl border text-start transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'border-amber-400 bg-stone-800 text-white shadow-md ring-1 ring-amber-400/40'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{font.nameAr}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 font-mono text-stone-400 border border-stone-800">
                        {font.category}
                      </span>
                    </div>

                    {/* Live Font Sample */}
                    <div
                      className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-stone-200 space-y-1"
                      style={{ fontFamily: isAr ? font.familyAr : font.familyEn }}
                    >
                      <div className="text-sm font-semibold">دار الورد للمناسبات الفاخرة</div>
                      <div className="text-[11px] text-stone-400">
                        Artisanal Blooms & Curated Luxury Gifts
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MOTION & PHYSICS */}
        {/* ========================================================= */}
        {activeTab === 'motion' && (
          <div className="space-y-5">
            {/* Motion Presets */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-200 text-xs block">
                {isAr ? 'منحنى وسرعة الحركة (--ease-transition)' : 'Transition Physics'}
              </label>

              <div className="grid grid-cols-1 gap-2">
                {MOTION_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleMotionChange('preset', m.id)}
                    className={`p-2.5 rounded-xl border text-start transition-all flex items-center justify-between ${
                      currentMotion.preset === m.id
                        ? 'border-amber-400 bg-stone-800 text-white font-semibold'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{isAr ? m.nameAr : m.nameEn}</span>
                      <span className="text-[10px] text-stone-500 font-mono">{m.duration}</span>
                    </div>
                    {currentMotion.preset === m.id && (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Marquee Speed Slider */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-stone-200 text-xs">
                  {isAr ? 'سرعة دوران شريط المبرد (Marquee Speed)' : 'Marquee Auto-Scroll Speed'}
                </span>
                <span className="font-mono text-[10px] text-amber-400">
                  {currentMotion.specialsSpeed || 28}s
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="45"
                step="2"
                value={currentMotion.specialsSpeed || 28}
                onChange={(e) => handleMotionChange('specialsSpeed', parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Confetti Settings */}
            <div className="space-y-3 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-200 block text-xs">
                    {isAr ? 'مؤثرات الاحتفال بالطلب (Confetti)' : 'Celebration Confetti'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {isAr ? 'إطلاق شرائط احتفالية عند إتمام الطلب' : 'Celebration sparks on checkout'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(currentMotion.confettiEnabled)}
                    onChange={(e) => handleMotionChange('confettiEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {currentMotion.confettiEnabled && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-stone-300">
                      {isAr ? 'كثافة الشرائط' : 'Particle Density'}
                    </span>
                    <span className="font-mono text-[10px] text-amber-400">
                      {currentMotion.confettiCount || 40}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={currentMotion.confettiCount || 40}
                    onChange={(e) => handleMotionChange('confettiCount', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Buttons Footer */}
      <div className="p-4 border-t border-stone-800 bg-stone-950/95 space-y-2">
        {/* Save & Reset */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSaveAction}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all shadow-md active:scale-97 text-xs"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-stone-950 stroke-[3]" />
                <span>{isAr ? 'تم الحفظ بنجاح!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ الإعدادات' : 'Save Setup'}</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all active:scale-97 text-xs border border-stone-700/80"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset Default'}</span>
          </button>
        </div>

        {/* Share via URL Link Button */}
        <button
          onClick={handleShareLink}
          className={`w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-98 text-xs border ${
            copiedLink
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-amber-500/30 hover:border-amber-400/60 shadow-xs'
          }`}
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'تم نسخ رابط الثيم إلى الحافظة! 🎉' : 'Theme Link Copied! 🎉'}</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'مشاركة رابط الثيم (Share via URL)' : 'Share via URL Link'}</span>
            </>
          )}
        </button>

        {/* Export CSS & JSON Tools */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          <button
            onClick={handleDownloadCss}
            className="py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-[11px] font-mono border border-stone-800 flex items-center justify-center gap-1 transition-colors"
            title={isAr ? 'تنزيل ملف theme.css جاهز للاستخدام' : 'Download theme.css file'}
          >
            {downloadedCss ? <Check className="w-3 h-3 text-emerald-400" /> : <FileCode className="w-3 h-3 text-sky-400" />}
            <span>{downloadedCss ? (isAr ? 'تم التحميل!' : 'Downloaded!') : isAr ? 'تنزيل CSS' : 'theme.css'}</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-[11px] font-mono border border-stone-800 flex items-center justify-center gap-1 transition-colors"
          >
            {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedJson ? (isAr ? 'تم!' : 'Copied!') : isAr ? 'نسخ JSON' : 'JSON'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-[11px] font-mono border border-stone-800 flex items-center justify-center gap-1 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>{isAr ? 'ملف JSON' : 'JSON File'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
