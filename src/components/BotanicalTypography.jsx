import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Sparkles,
  Shuffle,
  Download,
  X,
  Wind,
  Palette,
  RotateCcw,
  Sliders,
  Type,
  Maximize2,
  Minimize2,
  Check,
  Send,
} from 'lucide-react';
import BotanicalCoreEngine from './BotanicalCoreEngine';
import {
  saveBotanicalBrandConfig,
  DEFAULT_BOTANICAL_BRAND_CONFIG,
} from '../types/botanical';

// Color Palettes
const BOTANICAL_PALETTES = {
  rosaNoir: {
    id: 'rosaNoir',
    name: 'Rosa Noir',
    nameAr: 'روزا نوار',
    bg: '#121212',
    text: '#EAE6E1',
    petals: '#7E1529',
    stems: '#2D4A3E',
    isDark: true,
  },
  paper: {
    id: 'paper',
    name: 'Paper',
    nameAr: 'ورق أرشيفي',
    bg: '#F7F4EE',
    text: '#1A1A1A',
    petals: '#D9383A',
    stems: '#2A4736',
    isDark: false,
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    nameAr: 'منتصف الليل',
    bg: '#0B111E',
    text: '#F1F5F9',
    petals: '#6366F1',
    stems: '#1E3A8A',
    isDark: true,
  },
  citrus: {
    id: 'citrus',
    name: 'Citrus',
    nameAr: 'حمضيات برتقالية',
    bg: '#1A241C',
    text: '#F3E8D6',
    petals: '#D97706',
    stems: '#365314',
    isDark: true,
  },
  moss: {
    id: 'moss',
    name: 'Moss',
    nameAr: 'طحالب وزهر',
    bg: '#18231C',
    text: '#F4EFE6',
    petals: '#DB2777',
    stems: '#14532D',
    isDark: true,
  },
  butter: {
    id: 'butter',
    name: 'Butter',
    nameAr: 'زبدة دافئة',
    bg: '#FFFDF5',
    text: '#292524',
    petals: '#E11D48',
    stems: '#3F6212',
    isDark: false,
  },
};

BOTANICAL_PALETTES['rosa-noir'] = BOTANICAL_PALETTES.rosaNoir;

const MOTION_MODES = [
  { id: 'gust', label: 'Gust of Wind', labelAr: 'هبوب الرياح', icon: Wind, desc: 'أمواج هوائية عضوية تهز الأغصان وتمايل الزهور' },
  { id: 'reach', label: 'Reach (Interactive)', labelAr: 'تفاعل مع المؤشر', icon: Sparkles, desc: 'انحناء الورود نحو حركة الماوس بفيزياء نابضة' },
  { id: 'breathe', label: 'Breathe', labelAr: 'تنفس هادئ', icon: Sparkles, desc: 'تمدد وانكماش عضوي بطيء يحاكي النبض الطبيعي' },
  { id: 'grow', label: 'Grow & Wither', labelAr: 'تفتح تدريجي', icon: RotateCcw, desc: 'رسم تدريجي للأغصان وتفتح الورود' },
];

const PRESET_WORDS = [
  'دار الورد للمناسبات',
  'Maison des Fleurs',
  'Fleurs',
  'Flora',
  'Rose',
];

const FONT_OPTIONS = [
  { id: 'Amiri', label: 'أميري', labelAr: 'أميري ملكي', css: "'Amiri', serif" },
  { id: 'Aref Ruqaa', label: 'عارف رقعة', labelAr: 'رقعة تراثي', css: "'Aref Ruqaa', serif" },
  { id: 'Playfair Display', label: 'Playfair', labelAr: 'بلايفير لاتيني', css: "'Playfair Display', serif" },
  { id: 'Cormorant Garamond', label: 'Cormorant', labelAr: 'كورمورانت فرنسي', css: "'Cormorant Garamond', Georgia, serif" },
];

export default function BotanicalTypography({
  config,
  onPublishConfig,
  text: textProp,
  palette: paletteProp = 'rosaNoir',
  motion: motionProp = 'gust',
  showControls = false,
  editable = false,
  onClose,
  lang = 'ar',
  className = '',
}) {
  const isAr = lang === 'ar';

  const initialText = textProp || config?.text || DEFAULT_BOTANICAL_BRAND_CONFIG.text;
  const initialPalette = paletteProp || config?.paletteId || DEFAULT_BOTANICAL_BRAND_CONFIG.paletteId;
  const initialMotion = motionProp || config?.motionMode || DEFAULT_BOTANICAL_BRAND_CONFIG.motionMode;
  const initialDensity = config?.density === 'light' ? 'sparse' : config?.density === 'dense' ? 'lush' : 'balanced';
  const initialFont = config?.fontFamily || DEFAULT_BOTANICAL_BRAND_CONFIG.fontFamily;
  const initialScale = config?.scale ?? DEFAULT_BOTANICAL_BRAND_CONFIG.scale;

  // Studio Reactive State
  const [internalText, setInternalText] = useState(initialText);
  const [seed, setSeed] = useState(() => config?.seed ?? 48271);
  const [internalPalette, setInternalPalette] = useState(initialPalette);
  const [internalMotion, setInternalMotion] = useState(initialMotion);
  const [density, setDensity] = useState(initialDensity);
  const [fontFamily, setFontFamily] = useState(initialFont);
  const [scaleFactor, setScaleFactor] = useState(initialScale);
  const [isPublishedJustNow, setIsPublishedJustNow] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(showControls);

  const stageContainerRef = useRef(null);

  const paletteKey = internalPalette || paletteProp;
  const palette = useMemo(() => {
    return BOTANICAL_PALETTES[paletteKey] || BOTANICAL_PALETTES.rosaNoir;
  }, [paletteKey]);

  const densityMapped = density === 'sparse' ? 'light' : density === 'lush' ? 'dense' : 'balanced';

  // Active Unified Configuration for Single Source of Truth
  const activeStudioConfig = useMemo(
    () => ({
      text: internalText,
      fontFamily,
      paletteId: internalPalette,
      motionMode: internalMotion,
      seed,
      density: densityMapped,
      scale: scaleFactor,
      updatedAt: config?.updatedAt || 0,
    }),
    [config?.updatedAt, internalText, fontFamily, internalPalette, internalMotion, seed, densityMapped, scaleFactor]
  );

  // Track Unsaved Changes vs Published Config
  const hasUnsavedChanges = useMemo(() => {
    if (!config) return false;
    const configDensityMapped = config.density === 'light' ? 'sparse' : config.density === 'dense' ? 'lush' : 'balanced';
    return (
      internalText !== config.text ||
      fontFamily !== config.fontFamily ||
      internalPalette !== config.paletteId ||
      internalMotion !== config.motionMode ||
      seed !== config.seed ||
      density !== configDensityMapped ||
      Math.abs(scaleFactor - config.scale) > 0.01
    );
  }, [config, internalText, fontFamily, internalPalette, internalMotion, seed, density, scaleFactor]);

  // Publish to Storefront Header
  const handlePublish = useCallback(() => {
    saveBotanicalBrandConfig(activeStudioConfig);
    if (onPublishConfig) {
      onPublishConfig(activeStudioConfig);
    }
    setIsPublishedJustNow(true);
    setTimeout(() => setIsPublishedJustNow(false), 2400);
  }, [activeStudioConfig, onPublishConfig]);

  // Reset to Default Storefront Brand Title
  const handleResetToDefault = useCallback(() => {
    setInternalText('دار الورد للمناسبات');
    setFontFamily('Amiri');
    setInternalPalette('rosaNoir');
    setInternalMotion('gust');
    setSeed(48271);
    setDensity('balanced');
    setScaleFactor(1.0);
  }, []);

  // Export SVG
  const handleExportSVG = useCallback(() => {
    const svgEl = stageContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    setIsExporting(true);

    try {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgEl);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `type-garden-${internalText.toLowerCase()}-${internalPalette}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG Export Failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [internalText, internalPalette]);

  // Export PNG (High-Res 1600x480)
  const handleExportPNG = useCallback(() => {
    const svgEl = stageContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    setIsExporting(true);

    try {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgEl);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 440;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, 1600, 440);
        ctx.drawImage(img, 0, 0, 1600, 440);

        canvas.toBlob(
          (pngBlob) => {
            if (!pngBlob) return;
            const pngUrl = URL.createObjectURL(pngBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `type-garden-${internalText.toLowerCase()}-${internalPalette}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(url);
            setIsExporting(false);
          },
          'image/png',
          1.0
        );
      };

      img.src = url;
    } catch (err) {
      console.error('PNG Export Failed:', err);
      setIsExporting(false);
    }
  }, [palette.bg, internalText, internalPalette]);

  const isModalMode = Boolean(onClose) || isFullscreen;

  return (
    <div
      className={`transition-colors duration-500 font-sans select-none overflow-hidden ${
        isModalMode
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-between p-3 md:p-6 backdrop-blur-3xl'
          : `relative w-full flex flex-col items-center justify-center ${className}`
      }`}
      style={{
        backgroundColor: isModalMode || showControls ? palette.bg : 'transparent',
        color: palette.text,
      }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Toggle Button for Controls Dock */}
      {showControls && (
        <button
          type="button"
          onClick={() => setIsControlsOpen((prev) => !prev)}
          className="absolute top-3 end-3 p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white/70 hover:text-white transition-all z-40 backdrop-blur-md"
          title={isAr ? 'تبديل لوحة التحكم' : 'Toggle Controls'}
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
        </button>
      )}

      {/* Floating Studio Control Dock (Top Header) */}
      {isControlsOpen && (
        <header className="w-full max-w-6xl mx-auto mb-3 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl z-30 bg-black/40">
          {/* Brand & Sync Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wide">Type-Garden</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {internalMotion}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {hasUnsavedChanges ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>{isAr ? 'تعديلات غير منشورة' : 'Unsaved changes'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-medium">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{isAr ? 'مُزامَن مع المتجر' : 'Synced'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Text Input & Font Family */}
          {editable && (
            <div className="flex items-center gap-2 flex-1 max-w-md justify-center">
              <input
                type="text"
                value={internalText}
                onChange={(e) => setInternalText(e.target.value)}
                maxLength={24}
                className="w-36 px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-center font-serif tracking-wider text-white"
                placeholder={isAr ? 'اكتب...' : 'Type...'}
              />

              {/* Font Family Picker */}
              <div className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-white/50" />
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="text-[11px] bg-stone-900/90 border border-white/15 rounded-xl px-2 py-1 text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                  title={isAr ? 'نوع الخط' : 'Font Family'}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id} className="bg-stone-900 text-white">
                      {isAr ? f.labelAr : f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preset Words Chips */}
              <div className="hidden lg:flex items-center gap-1">
                {PRESET_WORDS.slice(0, 3).map((pw) => (
                  <button
                    key={pw}
                    type="button"
                    onClick={() => setInternalText(pw)}
                    className="px-1.5 py-0.5 text-[10px] rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all font-serif truncate max-w-[110px]"
                  >
                    {pw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Dock & Storefront Publish Button */}
          <div className="flex items-center gap-1.5">
            {/* Publish Directly to Storefront Header Action */}
            <button
              type="button"
              onClick={handlePublish}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isPublishedJustNow
                  ? 'bg-emerald-400 text-stone-950 font-black ring-2 ring-emerald-300'
                  : hasUnsavedChanges
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 shadow-emerald-500/30 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
              }`}
              title={isAr ? 'نشر هذا التصميم النباتي مباشرة لهيدر متجر العميل' : 'Publish to Storefront Header'}
            >
              {isPublishedJustNow ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isAr ? 'تم النشر بنجاح! 🌸' : 'Published!'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نشر للهيدر' : 'Publish to Header'}</span>
                </>
              )}
            </button>

            {/* Re-roll seed */}
            <button
              type="button"
              onClick={() => setSeed(Math.floor(Math.random() * 999999))}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              title={isAr ? 'توليد أزهار عشوائية' : 'Regenerate Flora'}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Export SVG */}
            <button
              type="button"
              onClick={handleExportSVG}
              disabled={isExporting}
              className="px-2.5 py-1 text-xs rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white flex items-center gap-1 transition-all"
              title={isAr ? 'تصدير SVG' : 'Export SVG'}
            >
              <Download className="w-3 h-3 text-emerald-400" />
              <span className="font-mono text-[10px]">SVG</span>
            </button>

            {/* Export PNG */}
            <button
              type="button"
              onClick={handleExportPNG}
              disabled={isExporting}
              className="px-2.5 py-1 text-xs rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white flex items-center gap-1 transition-all"
              title={isAr ? 'تصدير PNG' : 'Export PNG'}
            >
              <Download className="w-3 h-3 text-amber-400" />
              <span className="font-mono text-[10px]">PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 transition-all"
                title={isAr ? 'إغلاق' : 'Close'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* ================================================================ */}
      {/* MAIN BOTANICAL STAGE - RESPONSIVE LOCKED 800x240 ASPECT RATIO   */}
      {/* 100% WYSIWYG SINGLE SOURCE OF TRUTH USING BotanicalCoreEngine   */}
      {/* ================================================================ */}
      <main className="relative flex-1 w-full flex items-center justify-center p-3 sm:p-6 cursor-pointer">
        <div
          ref={stageContainerRef}
          className="w-full max-w-4xl aspect-[800/220] mx-auto flex items-center justify-center relative rounded-3xl p-2 sm:p-4 transition-all duration-300 drop-shadow-2xl"
          style={{
            backgroundColor: palette.isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.75)',
            border: `1px solid ${palette.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          <BotanicalCoreEngine
            config={activeStudioConfig}
            isDark={palette.isDark ?? true}
            interactive={true}
            animated={true}
            className="w-full h-full"
          />
        </div>
      </main>

      {/* Floating Bottom Palette & Physics Dock */}
      {isControlsOpen && (
        <footer className="w-full max-w-4xl mx-auto mt-2 px-4 py-2 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl z-30 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Palettes */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="text-[10px] text-white/50 uppercase font-mono mr-1">
              <Palette className="w-3 h-3 inline-block mr-1 text-emerald-400" />
              {isAr ? 'اللوحة:' : 'Palette:'}
            </span>
            {Object.values(BOTANICAL_PALETTES)
              .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setInternalPalette(p.id)}
                  className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 border transition-all ${
                    paletteKey === p.id
                      ? 'border-emerald-400 bg-white/15 text-white font-medium shadow-md'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-inner"
                    style={{ backgroundColor: p.petals }}
                  />
                  <span className="text-[11px]">{isAr ? p.nameAr : p.name}</span>
                </button>
              ))}
          </div>

          {/* Motion Modes */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="text-[10px] text-white/50 uppercase font-mono mr-1">
              <Wind className="w-3 h-3 inline-block mr-1 text-amber-400" />
              {isAr ? 'الحركة:' : 'Physics:'}
            </span>
            {MOTION_MODES.map((m) => {
              const IconComponent = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setInternalMotion(m.id)}
                  className={`px-2 py-1 rounded-xl flex items-center gap-1 border transition-all ${
                    internalMotion === m.id
                      ? 'border-amber-400 bg-white/15 text-white font-medium shadow-md'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title={m.desc}
                >
                  <IconComponent className="w-3 h-3 text-amber-300" />
                  <span className="text-[10px]">{isAr ? m.labelAr : m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Density & Scale & Reset Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Density Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/50 uppercase font-mono mr-0.5">
                {isAr ? 'الكثافة:' : 'Density:'}
              </span>
              {['sparse', 'balanced', 'lush'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDensity(d)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-mono border transition-all ${
                    density === d
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {d === 'sparse' ? 'خفيف' : d === 'balanced' ? 'متوازن' : 'كثيف'}
                </button>
              ))}
            </div>

            {/* Scale Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/50 uppercase font-mono mr-0.5">
                {isAr ? 'المقياس:' : 'Scale:'}
              </span>
              {[0.85, 1.0, 1.15].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScaleFactor(s)}
                  className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono border transition-all ${
                    Math.abs(scaleFactor - s) < 0.05
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Reset to Default Button */}
            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all flex items-center gap-1"
              title={isAr ? 'استعادة إعدادات العنوان الافتراضي' : 'Reset to Default'}
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] hidden sm:inline">{isAr ? 'افتراضي' : 'Reset'}</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

// Backwards compatibility alias
export const BotanicalBrandTitle = BotanicalTypography;
