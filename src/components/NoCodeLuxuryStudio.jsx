import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Palette,
  Layout,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  RotateCcw,
  Upload,
  Download,
  Check,
  Smartphone,
  Sliders,
  Shuffle,
  Layers,
  Zap,
} from 'lucide-react';
import { useStudioStore } from '../context/StudioThemeContext';

export default function NoCodeLuxuryStudio({
  isOpen,
  onClose,
  renderPreviewContent,
}) {
  const {
    config,
    hasUnsavedChanges,
    activeTab,
    setActiveTab,
    updateField,
    applyPalette,
    toggleSection,
    moveSection,
    publishConfig,
    resetConfig,
    exportConfig,
    importConfig,
  } = useStudioStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handlePublish = () => {
    const ok = publishConfig();
    if (ok) {
      showToast('✨ تم نشر وتثبيت التعديلات على المتجر بنجاح!');
    }
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية بالكامل؟')) {
      resetConfig();
      showToast('تمت استعادة الإعدادات الافتراضية');
    }
  };

  const handleExport = () => {
    exportConfig();
    showToast('تم تصدير ملف إعدادات الثيم (JSON)!');
  };

  const handleImportSubmit = () => {
    const ok = importConfig(importText);
    if (ok) {
      setShowImportModal(false);
      setImportText('');
      showToast('تم استيراد وتطبيق الثيم بنجاح!');
    } else {
      alert('خطأ: صيغة JSON غير صالحة');
    }
  };

  const shuffleBotanicalSeed = () => {
    const newSeed = Math.floor(Math.random() * 90000) + 10000;
    updateField('botanicalSeed', newSeed);
    showToast(`تم تغيير بذرة الورود #${newSeed}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-fade-in" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-[#7E1529] text-white px-5 py-2.5 rounded-full shadow-2xl border border-rose-300/40 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Frame */}
      <div className="bg-[#FAF9F6] w-full max-w-7xl h-[95vh] rounded-[2.5rem] border border-stone-200 shadow-2xl flex flex-col overflow-hidden relative">
        {/* ======================================================== */}
        {/* TOP ACTION BAR                                           */}
        {/* ======================================================== */}
        <header className="px-5 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7E1529] text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-stone-900">
                  استوديو المظهر والحركة الفاخر
                </h2>
                {hasUnsavedChanges ? (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                    تعديلات غير منشورة
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    تم النشر والمزامنة
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                تحكم فوري بالهوية، الورود، الحركات، والبطاقات بمرونة No-Code فائقة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              title="تصدير الثيم JSON"
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تصدير</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              title="استيراد ثيم JSON"
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">استيراد</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="إعادة ضبط"
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-rose-600 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-2 rounded-xl bg-[#7E1529] hover:bg-[#600f1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>نشر التعديلات</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-all ms-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* MAIN BODY: SPLIT VIEWPORT & CONTROLS SIDEBAR             */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: IPHONE 16 VIEWPORT SIMULATION (Interactive 60fps) */}
          <div className="hidden lg:flex flex-1 bg-stone-200/70 p-6 items-center justify-center overflow-hidden relative">
            <div className="absolute top-4 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs border border-white/60">
              <Smartphone className="w-3.5 h-3.5 text-stone-500" />
              <span>معاينة آيفون ١٦ التفاعلية (مباشر 60fps)</span>
            </div>

            {/* iPhone 16 Viewport Specification: w-[380px] h-[780px] rounded-[44px] border-[8px] border-neutral-900 shadow-2xl overflow-y-auto */}
            <div className="w-[380px] h-[780px] rounded-[44px] border-[8px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col relative bg-white">
              {/* Dynamic Island Pill */}
              <div className="h-7 w-full bg-neutral-900 flex justify-center items-center shrink-0">
                <div className="w-28 h-4 bg-black rounded-full flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-neutral-800" />
                </div>
              </div>

              {/* Scrollable Storefront Preview Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar relative" style={{ backgroundColor: 'var(--bg-canvas, #FAF8F5)' }}>
                {renderPreviewContent && renderPreviewContent()}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROLS SIDEBAR (Organized Tabs) */}
          <div className="w-full lg:w-[480px] xl:w-[520px] bg-white border-s border-stone-200 flex flex-col h-full overflow-hidden">
            {/* Tabs Header */}
            <div className="grid grid-cols-4 p-2 bg-stone-100/80 border-b border-stone-200 gap-1 shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'identity'
                    ? 'bg-white text-[#7E1529] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-rose-700" />
                <span>الهوية والزهور</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'colors'
                    ? 'bg-white text-[#7E1529] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Palette className="w-4 h-4 text-amber-700" />
                <span>الألوان والخطوط</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('motion')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'motion'
                    ? 'bg-white text-[#7E1529] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-700" />
                <span>الحركة والفيزياء</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'cards'
                    ? 'bg-white text-[#7E1529] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layout className="w-4 h-4 text-indigo-700" />
                <span>البطاقات والأقسام</span>
              </button>
            </div>

            {/* Tabs Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-sm">
              {/* ======================================================== */}
              {/* TAB 1: IDENTITY & BOTANICAL (الهوية والزهور)              */}
              {/* ======================================================== */}
              {activeTab === 'identity' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7E1529]" />
                      معلومات وهوية المتجر
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">اسم المتجر</label>
                      <input
                        type="text"
                        value={config.storeName}
                        onChange={(e) => updateField('storeName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7E1529]/30"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">الوصف الترويجي (السطر التعريفي)</label>
                      <input
                        type="text"
                        value={config.storeSubtitle}
                        onChange={(e) => updateField('storeSubtitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#7E1529]/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">شارة الحالة والتجهيز</label>
                        <input
                          type="text"
                          value={config.statusText}
                          onChange={(e) => updateField('statusText', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">نص التقييم</label>
                        <input
                          type="text"
                          value={config.rating}
                          onChange={(e) => updateField('rating', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">نبض النقطة الخضراء للحالة الحية</span>
                        <span className="text-[11px] text-stone-500">وميض تفاعلي يشير إلى استقبال وتجهيز الطلبات الآن</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('statusPulse', !config.statusPulse)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.statusPulse ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.statusPulse ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">نص أيقونة الشعار (Avatar)</label>
                        <input
                          type="text"
                          value={config.avatarText}
                          onChange={(e) => updateField('avatarText', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">رقم الهاتف (واتساب/اتصال)</label>
                        <input
                          type="text"
                          value={config.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botanical Engine Controls */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-rose-700" />
                        محرك حديقة الحروف (Type-Garden)
                      </h3>
                      <button
                        type="button"
                        onClick={() => updateField('botanicalEnabled', !config.botanicalEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.botanicalEnabled ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.botanicalEnabled ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    {config.botanicalEnabled && (
                      <div className="space-y-4 pt-1 animate-fade-in">
                        {/* Seed Shuffle */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200">
                          <div>
                            <span className="text-xs font-bold text-stone-800 block">بذرة التوزيع العشوائي:</span>
                            <span className="text-xs font-mono font-bold text-rose-800">#{config.botanicalSeed}</span>
                          </div>
                          <button
                            type="button"
                            onClick={shuffleBotanicalSeed}
                            className="px-3 py-1.5 rounded-xl bg-[#7E1529] hover:bg-[#600f1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                          >
                            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
                            <span>تغيير البذرة</span>
                          </button>
                        </div>

                        {/* Motion Mode Radio Pills */}
                        <div>
                          <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                            نمط الحركة التفاعلية (Physics Motion Mode)
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 text-xs">
                            {[
                              { id: 'gust', label: 'عاصفة نسيم (Gust)' },
                              { id: 'reach', label: 'تتبع الفأرة (Reach)' },
                              { id: 'breathe', label: 'نبض حيوي (Breathe)' },
                              { id: 'grow', label: 'نمو تدريجي (Grow)' },
                              { id: 'visitor', label: 'فراشة تطير (Visitor)' },
                            ].map((mode) => (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => updateField('botanicalMotion', mode.id)}
                                className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                                  config.botanicalMotion === mode.id
                                    ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                }`}
                              >
                                {mode.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Density Selector */}
                        <div>
                          <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                            كثافة الورود (Density)
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 text-xs">
                            {[
                              { id: 'light', label: 'خفيفة (Light)' },
                              { id: 'balanced', label: 'متوازنة (Balanced)' },
                              { id: 'dense', label: 'كثيفة (Dense)' },
                            ].map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => updateField('botanicalDensity', d.id)}
                                className={`py-1.5 rounded-xl border text-center transition-all ${
                                  config.botanicalDensity === d.id
                                    ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                }`}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sliders: Bloom Size & Stem Thickness */}
                        <div className="space-y-3 pt-2">
                          <div>
                            <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                              <span>مقياس حجم الورد (Bloom Size)</span>
                              <span className="font-mono text-rose-800 font-bold">{config.bloomSize}px</span>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="80"
                              value={config.bloomSize}
                              onChange={(e) => updateField('bloomSize', Number(e.target.value))}
                              className="w-full accent-[#7E1529] cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                              <span>سماكة السيقان (Stem Thickness)</span>
                              <span className="font-mono text-rose-800 font-bold">{config.stemThickness}px</span>
                            </div>
                            <input
                              type="range"
                              min="1.0"
                              max="3.5"
                              step="0.2"
                              value={config.stemThickness}
                              onChange={(e) => updateField('stemThickness', Number(e.target.value))}
                              className="w-full accent-[#7E1529] cursor-pointer"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <div className="flex justify-between text-[11px] font-semibold text-stone-700 mb-1">
                                <span>سرعة الرياح</span>
                                <span className="font-mono text-rose-800 font-bold">{config.animationSpeed}x</span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={config.animationSpeed}
                                onChange={(e) => updateField('animationSpeed', Number(e.target.value))}
                                className="w-full accent-[#7E1529] cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[11px] font-semibold text-stone-700 mb-1">
                                <span>سعة التمايل</span>
                                <span className="font-mono text-rose-800 font-bold">{config.swayIntensity}°</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={config.swayIntensity}
                                onChange={(e) => updateField('swayIntensity', Number(e.target.value))}
                                className="w-full accent-[#7E1529] cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: COLORS & TYPOGRAPHY (الألوان والخطوط)              */}
              {/* ======================================================== */}
              {activeTab === 'colors' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-rose-700" />
                      لوحات الألوان الملكية الجاهزة (One-Click Palettes)
                    </h3>

                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'royalBurgundy', nameAr: 'بورغندي ملكي', nameEn: 'Royal Burgundy', colors: ['#7E1529', '#BE123C', '#FAF8F5'] },
                        { id: 'deepForest', nameAr: 'أخضر الغابات', nameEn: 'Deep Forest', colors: ['#123524', '#10B981', '#FAF9F6'] },
                        { id: 'rosaNoir', nameAr: 'نوار دافئ', nameEn: 'Rosa Noir Luxury', colors: ['#1C1917', '#D4AF37', '#111827'] },
                        { id: 'velvetBlush', nameAr: 'مخمل وزهر', nameEn: 'Velvet Blush', colors: ['#9D174D', '#BE185D', '#FFF8F9'] },
                      ].map((pal) => (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => applyPalette(pal.id)}
                          className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                            config.paletteId === pal.id
                              ? 'border-[#7E1529] ring-2 ring-[#7E1529]/20 bg-white shadow-xs'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {pal.colors.map((c, i) => (
                              <span
                                key={i}
                                className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-stone-900 block">{pal.nameAr}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{pal.nameEn}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900">محدد الألوان المخصص (Custom Pickers)</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">اللون الأساسي (Primary)</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white">
                          <input
                            type="color"
                            value={config.colors?.primary || '#7E1529'}
                            onChange={(e) =>
                              updateField('colors', { ...config.colors, primary: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-stone-600">{config.colors?.primary || '#7E1529'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">اللون الثانوي / الذهب</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white">
                          <input
                            type="color"
                            value={config.colors?.secondary || '#BE123C'}
                            onChange={(e) =>
                              updateField('colors', { ...config.colors, secondary: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-stone-600">{config.colors?.secondary || '#BE123C'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">خلفية الصفحة (Canvas)</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white">
                          <input
                            type="color"
                            value={config.colors?.canvasBg || '#FAF8F5'}
                            onChange={(e) =>
                              updateField('colors', { ...config.colors, canvasBg: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-stone-600">{config.colors?.canvasBg || '#FAF8F5'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">لون عرض الأسعار (Price)</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white">
                          <input
                            type="color"
                            value={config.colors?.priceColor || '#7E1529'}
                            onChange={(e) =>
                              updateField('colors', { ...config.colors, priceColor: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-stone-600">{config.colors?.priceColor || '#7E1529'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography System */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900">التحكم في الخطوط العربية (Typography)</h3>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">خط الهيدر وعنوان المتجر</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'Amiri', label: 'أميري (Amiri الملكي)' },
                          { id: 'Aref Ruqaa', label: 'عارف رقعة (Aref Ruqaa)' },
                          { id: 'Playfair Display', label: 'بلايفير (Playfair)' },
                          { id: 'Cairo', label: 'كايرو عصري (Cairo)' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() =>
                              updateField('typography', { ...config.typography, headerFont: f.id })
                            }
                            className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                              config.typography?.headerFont === f.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                        <span>حجم الخط الأساسي</span>
                        <span className="font-mono text-rose-800 font-bold">{config.typography?.baseFontSize || 15}px</span>
                      </div>
                      <input
                        type="range"
                        min="13"
                        max="18"
                        value={config.typography?.baseFontSize || 15}
                        onChange={(e) =>
                          updateField('typography', { ...config.typography, baseFontSize: Number(e.target.value) })
                        }
                        className="w-full accent-[#7E1529] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: MOTION & PHYSICS (الحركة والفيزياء)                 */}
              {/* ======================================================== */}
              {activeTab === 'motion' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-700" />
                      أنيميشن دخول وظهور البطاقات (Entrance Stagger)
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'fade_up', label: 'انسياب للأعلى (Fade Up)' },
                        { id: 'elastic_scale', label: 'تمدد مرن (Elastic Scale)' },
                        { id: 'slide', label: 'انزلاق جانبي (Slide)' },
                        { id: 'none', label: 'فوري (بدون أنيميشن)' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => updateField('cardEntranceMotion', m.id)}
                          className={`py-2 rounded-xl border text-center transition-all ${
                            config.cardEntranceMotion === m.id
                              ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                        <span>فارق التتابع الزمني بين البطاقات (Stagger Delay)</span>
                        <span className="font-mono text-rose-800 font-bold">{config.staggerDelay}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.25"
                        step="0.01"
                        value={config.staggerDelay}
                        onChange={(e) => updateField('staggerDelay', Number(e.target.value))}
                        className="w-full accent-[#7E1529] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Physics & Hover */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        فيزياء زر الشراء (Add-to-Cart Physics)
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'morph_checkmark', label: 'تحول للعلامة (Morph)' },
                          { id: 'ripple_wave', label: 'موجة ضوئية (Ripple)' },
                          { id: 'fly_to_cart', label: 'طيران للسلة' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateField('buyButtonPhysics', b.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
                              config.buyButtonPhysics === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        تأثير التمرير على البطاقة (Card Hover Effect)
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'zoom_soft', label: 'تكبير ناعم (Zoom)' },
                          { id: 'tilt_3d', label: 'ميلان ثلاثي الأبعاد (3D Tilt)' },
                          { id: 'gold_glow', label: 'توهج ذهبي (Glow)' },
                        ].map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => updateField('cardHoverEffect', h.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
                              config.cardHoverEffect === h.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ambient Rose Petals Overlay */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">بتلات الورد العائمة (Floating Petals)</span>
                        <span className="text-[11px] text-stone-500">بتلات زهور تتساقط برقة وانسيابية فوق الشاشة</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('floatingPetalsEnabled', !config.floatingPetalsEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.floatingPetalsEnabled ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.floatingPetalsEnabled ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    {config.floatingPetalsEnabled && (
                      <div className="space-y-3 pt-2 border-t border-stone-200/60 animate-fade-in">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                            <span>كثافة البتلات</span>
                            <span className="font-mono text-rose-800 font-bold">{config.petalsCount} بتلة</span>
                          </div>
                          <input
                            type="range"
                            min="6"
                            max="24"
                            value={config.petalsCount}
                            onChange={(e) => updateField('petalsCount', Number(e.target.value))}
                            className="w-full accent-[#7E1529] cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                            <span>شفافية البتلات</span>
                            <span className="font-mono text-rose-800 font-bold">{Math.round(config.petalsOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="0.9"
                            step="0.05"
                            value={config.petalsOpacity}
                            onChange={(e) => updateField('petalsOpacity', Number(e.target.value))}
                            className="w-full accent-[#7E1529] cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: CARDS & SECTIONS (البطاقات والأقسام)                */}
              {/* ======================================================== */}
              {activeTab === 'cards' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-indigo-700" />
                      تخطيط الشبكة وهندسة البطاقات
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        نمط شبكة المنتجات (Grid Layout)
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'bento', label: 'بينتو غير متماثل (Bento)' },
                          { id: '1col', label: 'عمود واحد عريض' },
                          { id: '2cols', label: 'عمودين متناسقين' },
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => updateField('gridLayout', g.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
                              config.gridLayout === g.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                        <span>انحناء زوايا البطاقات (Border Radius)</span>
                        <span className="font-mono text-rose-800 font-bold">{config.cardBorderRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="28"
                        value={config.cardBorderRadius}
                        onChange={(e) => updateField('cardBorderRadius', Number(e.target.value))}
                        className="w-full accent-[#7E1529] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        شدة الظل والعمق (Card Shadow)
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 text-xs">
                        {[
                          { id: 'none', label: 'بدون' },
                          { id: 'soft', label: 'ناعم' },
                          { id: 'medium', label: 'متوسط' },
                          { id: 'high', label: 'مرتفع' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => updateField('cardShadow', s.id)}
                            className={`py-1.5 rounded-xl border text-center transition-all ${
                              config.cardShadow === s.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold'
                                : 'bg-white border-stone-200 text-stone-700'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Anatomy */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900">تشريح عناصر البطاقة (Card Anatomy)</h3>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                        شكل زر الشراء التفاعلي
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'pill_add', label: 'كبسولة (+ أضف)' },
                          { id: 'circle_plus', label: 'دائري (+)' },
                          { id: 'full_width', label: 'شريط عريض كامل' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateField('buyButtonStyle', b.id)}
                            className={`py-2 rounded-xl border text-center transition-all ${
                              config.buyButtonStyle === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">عرض العناوين بالكامل</span>
                        <span className="text-[11px] text-stone-500">التفاف سلس في سطرين دون قطع بالنقاط</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('fullTitleWrap', !config.fullTitleWrap)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.fullTitleWrap ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.fullTitleWrap ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">شارات التمييز (جاهز الآن / قطعة واحدة)</span>
                        <span className="text-[11px] text-stone-500">إظهار أو إخفاء الشارات بأعلى الصور</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('showBadges', !config.showBadges)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.showBadges ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.showBadges ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>

                    {config.showBadges && (
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
                        {[
                          { id: 'glassmorphic', label: 'زجاجي مثلج (Glassmorphic)' },
                          { id: 'solid_pastel', label: 'باستيل مصمت (Solid Pastel)' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateField('badgeStyle', b.id)}
                            className={`py-1.5 rounded-xl border text-center transition-all ${
                              config.badgeStyle === b.id
                                ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold'
                                : 'bg-white border-stone-200 text-stone-700'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">زر المفضلة (القلب)</span>
                        <span className="text-[11px] text-stone-500">زر حفظ الإعجابات أعلى يمين الصورة</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('showFavoriteButton', !config.showFavoriteButton)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          config.showFavoriteButton ? 'bg-[#7E1529]' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.showFavoriteButton ? 'left-1' : 'right-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Section Manager */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-700" />
                      مدير أقسام الصفحة (Section Manager)
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      أعد ترتيب أقسام المتجر بالأسهم أو قم بإخفاء أي قسم بضغطة زر واحدة
                    </p>

                    <div className="space-y-2">
                      {config.sections?.map((sec, index) => (
                        <div
                          key={sec.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-xs shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-[10px]">
                              {index + 1}
                            </span>
                            <span className={`font-semibold ${sec.visible ? 'text-stone-900' : 'text-stone-400 line-through'}`}>
                              {sec.nameAr}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30"
                              title="تحريك لأعلى"
                            >
                              <MoveUp className="w-3.5 h-3.5 text-stone-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === config.sections.length - 1}
                              className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30"
                              title="تحريك لأسفل"
                            >
                              <MoveDown className="w-3.5 h-3.5 text-stone-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSection(sec.id)}
                              className={`p-1 rounded-lg transition-colors ms-1 ${
                                sec.visible ? 'text-emerald-700 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'
                              }`}
                              title={sec.visible ? 'إخفاء القسم' : 'إظهار القسم'}
                            >
                              {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-base text-stone-900">استيراد إعدادات الثيم (JSON)</h3>
            <p className="text-xs text-stone-500">
              قم بلصق محتوى ملف JSON لتطبيق كافة الإعدادات والأنيميشن مباشرة
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{ "storeName": "دار الورد للمناسبات", ... }'
              className="w-full h-44 p-3 rounded-2xl border border-stone-200 font-mono text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7E1529]/30"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-4 py-2 rounded-xl bg-[#7E1529] hover:bg-[#600f1f] text-white text-xs font-bold"
              >
                تطبيق الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
