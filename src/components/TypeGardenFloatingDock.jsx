import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Play,
  Save,
  X,
  Palette,
  Sliders,
  Check,
  Type,
} from 'lucide-react';

export const TYPE_GARDEN_PRESETS = {
  type_garden_classic: {
    id: 'type_garden_classic',
    nameAr: 'كلاسيك تايب جاردن',
    nameEn: 'Type Garden Classic',
    stemColor: '#1E3A8A', // Cobalt Blue
    primaryPetalColor: '#DC2626', // Crimson Red
    secondaryPetalColor: '#F59E0B', // Amber Gold
    textColor: '#1C1917',
    density: 7,
    flowerScale: 1.05,
    curliness: 1.1,
  },
  royal_emerald: {
    id: 'royal_emerald',
    nameAr: 'الزمرد الملكي',
    nameEn: 'Royal Emerald',
    stemColor: '#064E3B', // Deep Emerald Green
    primaryPetalColor: '#991B1B', // Velvet Red
    secondaryPetalColor: '#D97706', // Rose Gold
    textColor: '#1C1917',
    density: 6,
    flowerScale: 1.0,
    curliness: 1.0,
  },
  midnight_gold: {
    id: 'midnight_gold',
    nameAr: 'ذهب منتصف الليل',
    nameEn: 'Midnight Gold',
    stemColor: '#B45309', // Golden Bronze
    primaryPetalColor: '#831843', // Burgundy Velvet
    secondaryPetalColor: '#FDE68A', // Cream Gold
    textColor: '#1C1917',
    density: 6,
    flowerScale: 1.1,
    curliness: 1.2,
  },
  pastel_botanical: {
    id: 'pastel_botanical',
    nameAr: 'باستيل نباتي ناعم',
    nameEn: 'Pastel Botanical',
    stemColor: '#3F6212', // Sage Green
    primaryPetalColor: '#EA580C', // Peach Coral
    secondaryPetalColor: '#FED7AA', // Warm Ivory
    textColor: '#1C1917',
    density: 5,
    flowerScale: 0.95,
    curliness: 0.9,
  },
};

export default function TypeGardenFloatingDock({
  config = {},
  onChange = () => {},
  onRegenerate = () => {},
  onReplay = () => {},
  onSave = () => {},
  onClose = () => {},
  lang = 'ar',
}) {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'colors' | 'sliders'
  const [savedFeedback, setSavedFeedback] = useState(false);

  const text = config.text || 'دار الورد للمناسبات';
  const stemColor = config.stemColor || '#1E3A8A';
  const primaryPetalColor = config.primaryPetalColor || '#DC2626';
  const secondaryPetalColor = config.secondaryPetalColor || '#F59E0B';
  const textColor = config.textColor || '#1C1917';
  const density = config.density ?? 6;
  const flowerScale = config.flowerScale ?? 1.0;
  const curliness = config.curliness ?? 1.0;

  const handlePresetSelect = (presetKey) => {
    const p = TYPE_GARDEN_PRESETS[presetKey];
    if (!p) return;
    onChange({
      preset: p.id,
      stemColor: p.stemColor,
      primaryPetalColor: p.primaryPetalColor,
      secondaryPetalColor: p.secondaryPetalColor,
      textColor: p.textColor,
      density: p.density,
      flowerScale: p.flowerScale,
      curliness: p.curliness,
      replayKey: Date.now(),
    });
  };

  const handleSaveClick = () => {
    onSave();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2400);
  };

  const sampleTexts = [
    'دار الورد للمناسبات',
    'بوتيك دار الورد',
    'FlowerHub Luxury',
    'أزهار وهدايا نادرة',
  ];

  return (
    <div
      className="w-full max-w-2xl mx-auto my-3 relative z-30 transition-all duration-300 animate-in fade-in slide-in-from-top-3"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        className="p-4 sm:p-5 rounded-3xl border shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(226, 232, 240, 0.9)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.03)',
        }}
      >
        {/* Floating Dock Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
                {isAr ? '🎨 تخصيص حديقة النص (Type Garden Studio)' : 'Type Garden Live Studio'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-500">
                {isAr ? 'فن رقمي توليدي لاسم المتجر مع محاكاة التفتح والنمو' : 'Procedural botanical typography & bloom engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              title={isAr ? 'إغلاق المحرر' : 'Close Studio'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. Live Text Input */}
        <div className="space-y-1.5 mb-3.5">
          <label className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
            <Type className="w-3 h-3 text-emerald-700" />
            <span>{isAr ? 'النص النباتي الحي (اكتب لتنبت الزهور فوراً):' : 'Botanical Text (Live Sprouting):'}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder="اكتب اسم المتجر أو العبارة..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border border-stone-200 bg-stone-50/80 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all"
            />
          </div>

          {/* Quick text chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {sampleTexts.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => onChange({ text: sample, replayKey: Date.now() })}
                className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                  text === sample
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl mb-3.5">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{isAr ? 'الأنماط الفنية' : 'Presets'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'colors'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Palette className="w-3 h-3 text-rose-600" />
            <span>{isAr ? 'الألوان' : 'Colors'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sliders')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'sliders'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3 h-3 text-emerald-600" />
            <span>{isAr ? 'الكثافة والمقاييس' : 'Sliders'}</span>
          </button>
        </div>

        {/* TAB 1: 4 ARTISTIC PRESETS */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 animate-in fade-in duration-200">
            {Object.entries(TYPE_GARDEN_PRESETS).map(([key, p]) => {
              const isActive =
                stemColor.toLowerCase() === p.stemColor.toLowerCase() &&
                primaryPetalColor.toLowerCase() === p.primaryPetalColor.toLowerCase();

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetSelect(key)}
                  className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 relative ${
                    isActive
                      ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {/* Color Swatch Dots */}
                    <div className="flex items-center -space-x-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white shadow-xs inline-block"
                        style={{ backgroundColor: p.stemColor }}
                        title="Vine stem"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white shadow-xs inline-block"
                        style={{ backgroundColor: p.primaryPetalColor }}
                        title="Primary petal"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white shadow-xs inline-block"
                        style={{ backgroundColor: p.secondaryPetalColor }}
                        title="Secondary petal"
                      />
                    </div>

                    {isActive && (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-stone-900 leading-snug">
                      {isAr ? p.nameAr : p.nameEn}
                    </h4>
                    <p className="text-[9px] text-stone-500 font-mono">
                      {p.nameEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 2: CUSTOM COLOR PICKERS */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 animate-in fade-in duration-200">
            {/* 1. Stem & Vine Color */}
            <div className="p-2.5 rounded-2xl border border-stone-200 bg-white flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-stone-700">
                {isAr ? 'الأغصان والكروم' : 'Vines & Stems'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={stemColor}
                  onChange={(e) => onChange({ stemColor: e.target.value })}
                  className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono font-medium text-stone-600 uppercase">
                  {stemColor}
                </span>
              </div>
            </div>

            {/* 2. Primary Petal Color */}
            <div className="p-2.5 rounded-2xl border border-stone-200 bg-white flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-stone-700">
                {isAr ? 'البتلات الأساسية' : 'Primary Blossom'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryPetalColor}
                  onChange={(e) => onChange({ primaryPetalColor: e.target.value })}
                  className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono font-medium text-stone-600 uppercase">
                  {primaryPetalColor}
                </span>
              </div>
            </div>

            {/* 3. Secondary Petal Color */}
            <div className="p-2.5 rounded-2xl border border-stone-200 bg-white flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-stone-700">
                {isAr ? 'البتلات الثانوية' : 'Secondary Blossom'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryPetalColor}
                  onChange={(e) => onChange({ secondaryPetalColor: e.target.value })}
                  className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono font-medium text-stone-600 uppercase">
                  {secondaryPetalColor}
                </span>
              </div>
            </div>

            {/* 4. Text Color */}
            <div className="p-2.5 rounded-2xl border border-stone-200 bg-white flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-stone-700">
                {isAr ? 'لون الخط العربي' : 'Calligraphy Text'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => onChange({ textColor: e.target.value })}
                  className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono font-medium text-stone-600 uppercase">
                  {textColor}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GENERATIVE SLIDERS (1 to 10) */}
        {activeTab === 'sliders' && (
          <div className="space-y-3 mb-4 animate-in fade-in duration-200">
            {/* Density Slider: 1 to 10 */}
            <div className="p-2.5 rounded-2xl border border-stone-200 bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span>{isAr ? 'كثافة الأغصان والورود' : 'Garden Density'}</span>
                <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  {density} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={density}
                onChange={(e) => onChange({ density: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>{isAr ? 'هادئ ناعم (١)' : 'Minimal (1)'}</span>
                <span>{isAr ? 'كثيف ومورق (١٠)' : 'Lush & Dense (10)'}</span>
              </div>
            </div>

            {/* Flower Scale Slider: 0.6 to 1.6 */}
            <div className="p-2.5 rounded-2xl border border-stone-200 bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span>{isAr ? 'مقياس حجم الأزهار' : 'Flower Scale'}</span>
                <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  {Number(flowerScale).toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={flowerScale}
                onChange={(e) => onChange({ flowerScale: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>0.6x</span>
                <span>1.6x</span>
              </div>
            </div>

            {/* Curliness Slider: 0.5 to 2.0 */}
            <div className="p-2.5 rounded-2xl border border-stone-200 bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span>{isAr ? 'درجة التواء الأغصان والحلزونات' : 'Vine Curliness'}</span>
                <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  {Number(curliness).toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={curliness}
                onChange={(e) => onChange({ curliness: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>{isAr ? 'مستقيم وهادئ (0.5x)' : 'Subtle (0.5x)'}</span>
                <span>{isAr ? 'حلزوني ملتف (2.0x)' : 'Whimsical Spiral (2.0x)'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Studio Actions Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80">
          {/* Regenerate Seed */}
          <button
            type="button"
            onClick={onRegenerate}
            className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            title={isAr ? 'توليد حديقة جديدة تماماً برقم عشوائي' : 'Regenerate Garden Seed'}
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
            <span>{isAr ? '🌱 إعادة الإنبات' : 'Regenerate'}</span>
          </button>

          {/* Replay Bloom */}
          <button
            type="button"
            onClick={onReplay}
            className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            title={isAr ? 'إعادة تشغيل حركة تفتح الأزهار' : 'Replay Bloom Animation'}
          >
            <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>{isAr ? '▶️ تفتح الأزهار' : 'Replay'}</span>
          </button>

          {/* Save to Store */}
          <button
            type="button"
            onClick={handleSaveClick}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 ${
              savedFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-950 hover:bg-emerald-900 text-white'
            }`}
          >
            {savedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isAr ? 'تم الحفظ ✓' : 'Saved ✓'}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isAr ? '💾 حفظ التصميم' : 'Save'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
