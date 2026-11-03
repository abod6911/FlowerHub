import React, { useState } from 'react';
import {
  RefreshCw,
  Play,
  Download,
  Copy,
  Check,
  Flower2,
  Wind,
  Gauge,
  Maximize2,
  Palette,
  Sliders,
  Type,
} from 'lucide-react';
import { useStudioStore, DEFAULT_TYPE_GARDEN_CONFIG } from '../context/StudioThemeContext';
import TypeGardenCanvas from './TypeGardenCanvas';

export default function TypeGardenStudioSection({ lang = 'ar' }) {
  const isAr = lang === 'ar';
  const {
    typeGarden = DEFAULT_TYPE_GARDEN_CONFIG,
    _updateTypeGarden,
    updateTypeGardenField,
    regenerateTypeGardenSeed,
    replayTypeGardenGrowth,
    exportTypeGardenJson,
  } = useStudioStore();

  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCopyJson = () => {
    exportTypeGardenJson();
    setCopied(true);
    showToast(isAr ? 'تم نسخ إعدادات الحديقة التوليدية (JSON) للحافظة' : 'Type Garden JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const speciesOptions = [
    {
      id: 'royal_rose',
      nameAr: 'جوري ملكي',
      nameEn: 'Royal Rose',
      descAr: 'بتلات مخملية دائرية متعددة الطبقات',
      descEn: 'Concentric velvet ruffled petals',
      badge: 'الأكثر فخامة',
      color: '#9B1B36',
    },
    {
      id: 'sakura',
      nameAr: 'أزهار الكرز',
      nameEn: 'Sakura Blossom',
      descAr: '٥ بتلات ناعمة مع أسدية ذهبية دقيقة',
      descEn: '5 notched petals with gold stamens',
      badge: 'نسيم ربيعي',
      color: '#F472B6',
    },
    {
      id: 'camellia',
      nameAr: 'كاميليا فاخرة',
      nameEn: 'Luxury Camellia',
      descAr: 'بتلات هندسية متناظرة ذات طابع أرستقراطي',
      descEn: 'Symmetric geometric nested tiers',
      badge: 'هندسي ناعم',
      color: '#BE123C',
    },
    {
      id: 'minimal_gold',
      nameAr: 'أغصان الذهب',
      nameEn: 'Minimal Gold',
      descAr: 'توريق خطي وبراعم ذهبية لامعة',
      descEn: 'Fine metallic tendrils & gold buds',
      badge: 'ميتاليك راقٍ',
      color: '#D4AF37',
    },
  ];

  const stemColors = [
    { id: '#1B3B2B', nameAr: 'أخضر زمردي', hex: '#1B3B2B' },
    { id: '#2D3A1E', nameAr: 'زيتي داكن', hex: '#2D3A1E' },
    { id: '#B45309', nameAr: 'ذهبي معتق', hex: '#B45309' },
    { id: '#1C1917', nameAr: 'فحمي ملكي', hex: '#1C1917' },
  ];

  const petalColors = [
    { id: '#9B1B36', nameAr: 'أحمر مخملي', hex: '#9B1B36' },
    { id: '#F472B6', nameAr: 'وردي باستيل', hex: '#F472B6' },
    { id: '#F8FAFC', nameAr: 'أبيض ملكي', hex: '#F8FAFC' },
    { id: '#F59E0B', nameAr: 'تدرج ذهبي', hex: '#F59E0B' },
    { id: '#7C3AED', nameAr: 'لافندر ملكي', hex: '#7C3AED' },
  ];

  return (
    <div className="rounded-3xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm space-y-6 relative overflow-hidden">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Section Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-950 via-emerald-800 to-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md ring-1 ring-emerald-500/20">
            <Flower2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                {isAr ? 'محرك الحديقة النصية (Type Garden Arabic Engine)' : 'Type Garden Arabic Engine'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/40">
                Generative AI
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {isAr
                ? 'نمو أغصان ونباتات تفاعلية حية من هيكل حروف اسم المتجر (مستوحى من Type Garden)'
                : 'Living botanical curves sprouting dynamically from letterform contours'}
            </p>
          </div>
        </div>

        {/* Quick Action Top Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const seed = regenerateTypeGardenSeed();
              showToast(isAr ? `تمت إعادة الإنبات ببذرة جديدة #${seed}` : `Sprouted new seed #${seed}`);
            }}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            title={isAr ? 'توليد توزيعة أغصان جديدة' : 'Regenerate Seed'}
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>{isAr ? 'إعادة الإنبات' : 'Shuffle'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              replayTypeGardenGrowth();
              showToast(isAr ? 'جارٍ إعادة تشغيل أنيميشن نمو الأغصان والزهور...' : 'Replaying growth animation...');
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            title={isAr ? 'إعادة مشاهدة النمو' : 'Replay Growth'}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAr ? 'مشاهدة النمو' : 'Replay'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="p-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 transition-all active:scale-95"
            title={isAr ? 'تصدير إعدادات JSON للحافظة' : 'Export JSON'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 1. INTERACTIVE LIVE CANVAS PREVIEW CARD */}
      <div className="rounded-2xl border border-stone-200/90 bg-[#FAF8F5] p-3 sm:p-4 shadow-inner relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? 'معاينة حية فورية للرسم التوليدي (حرك الماوس أو المس للتفاعل):' : 'Interactive Live Canvas Preview:'}</span>
          </span>
          <span className="text-[10px] font-mono text-stone-400 bg-white/70 px-2 py-0.5 rounded-md border border-stone-200/60">
            Seed #{typeGarden.seed}
          </span>
        </div>

        {/* Live Canvas Element */}
        <div className="w-full bg-white rounded-xl border border-stone-200/60 p-2 shadow-2xs overflow-hidden">
          <TypeGardenCanvas
            text={typeGarden.text || 'دار الورد للمناسبات'}
            species={typeGarden.flowerSpecies || 'royal_rose'}
            density={typeGarden.density ?? 65}
            growthSpeed={typeGarden.growthSpeed ?? 1.0}
            windSway={typeGarden.windSway ?? 1.0}
            branchReach={typeGarden.branchReach ?? 55}
            stemColor={typeGarden.stemColor || '#1B3B2B'}
            petalColor={typeGarden.petalColor || '#9B1B36'}
            seed={typeGarden.seed || 48271}
            replayKey={typeGarden.replayKey || 0}
            interactive={true}
          />
        </div>
      </div>

      {/* 2. LIVE TEXT INPUT */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-stone-500" />
          <span>{isAr ? 'النص الحي (العنوان التوليدي):' : 'Live Headline Text:'}</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={typeGarden.text}
            onChange={(e) => updateTypeGardenField('text', e.target.value)}
            placeholder="دار الورد للمناسبات"
            className="w-full py-2.5 px-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all"
          />
        </div>
        <p className="text-[11px] text-stone-400">
          {isAr
            ? 'اكتب أي نص أو اسم متجر تريده، وستنمو منه الأغصان وتتفتح عليه الزهور تلقائياً.'
            : 'Type any text; branches will sprout and bloom organically from its letterforms.'}
        </p>
      </div>

      {/* 3. FLOWER SPECIES SELECTOR (4 SPECIES) */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Flower2 className="w-3.5 h-3.5 text-rose-600" />
            <span>{isAr ? 'نوع الزهور والنباتات (Flower Species):' : 'Flower Species:'}</span>
          </span>
          <span className="text-[11px] text-stone-500 font-normal">
            {speciesOptions.find((s) => s.id === typeGarden.flowerSpecies)?.nameAr}
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {speciesOptions.map((sp) => {
            const isSelected = (typeGarden.flowerSpecies || 'royal_rose') === sp.id;
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => {
                  updateTypeGardenField('flowerSpecies', sp.id);
                  replayTypeGardenGrowth();
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-800 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-800/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0"
                    style={{ backgroundColor: sp.color }}
                  />
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {sp.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-stone-900 leading-tight">
                    {isAr ? sp.nameAr : sp.nameEn}
                  </h4>
                  <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                    {isAr ? sp.descAr : sp.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SLIDERS: DENSITY, REACH, SPEED, WIND SWAY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Density Slider */}
        <div className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span>{isAr ? 'كثافة الحديقة والتفرع:' : 'Branch & Bloom Density:'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {typeGarden.density ?? 65}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={typeGarden.density ?? 65}
            onChange={(e) => updateTypeGardenField('density', Number(e.target.value))}
            className="w-full accent-emerald-800 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>{isAr ? 'هادئ مينيمال (10%)' : 'Minimal (10%)'}</span>
            <span>{isAr ? 'حديقة كثيفة (100%)' : 'Lush Garden (100%)'}</span>
          </div>
        </div>

        {/* Branch Reach Slider */}
        <div className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
              <span>{isAr ? 'طول وتمدد الأغصان (Reach):' : 'Branch Reach:'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {typeGarden.branchReach ?? 55}px
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            step="5"
            value={typeGarden.branchReach ?? 55}
            onChange={(e) => updateTypeGardenField('branchReach', Number(e.target.value))}
            className="w-full accent-emerald-800 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>{isAr ? 'مدمج لصيق (20px)' : 'Tight (20px)'}</span>
            <span>{isAr ? 'متمدد فسيح (95px)' : 'Expansive (95px)'}</span>
          </div>
        </div>

        {/* Growth Speed Slider */}
        <div className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-stone-500" />
              <span>{isAr ? 'سرعة أنيميشن النمو:' : 'Growth Speed:'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {(typeGarden.growthSpeed ?? 1.0).toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={typeGarden.growthSpeed ?? 1.0}
            onChange={(e) => updateTypeGardenField('growthSpeed', Number(e.target.value))}
            className="w-full accent-emerald-800 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>{isAr ? 'نمو هادئ (0.5x)' : 'Slow (0.5x)'}</span>
            <span>{isAr ? 'سريع وفوري (2.5x)' : 'Fast (2.5x)'}</span>
          </div>
        </div>

        {/* Wind Sway Slider */}
        <div className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-stone-500" />
              <span>{isAr ? 'قوة تمايل النسيم (Wind Sway):' : 'Ambient Wind Sway:'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {(typeGarden.windSway ?? 1.0).toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.2"
            step="0.1"
            value={typeGarden.windSway ?? 1.0}
            onChange={(e) => updateTypeGardenField('windSway', Number(e.target.value))}
            className="w-full accent-emerald-800 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>{isAr ? 'ساكن (0.0)' : 'Still (0.0)'}</span>
            <span>{isAr ? 'نسيم نشط (2.2)' : 'Breezy (2.2)'}</span>
          </div>
        </div>
      </div>

      {/* 5. BOTANICAL PALETTE PICKER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Stem & Leaves Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-stone-500" />
            <span>{isAr ? 'لون الأغصان والأوراق:' : 'Stem & Leaves Color:'}</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {stemColors.map((c) => {
              const isSelected = (typeGarden.stemColor || '#1B3B2B') === c.hex;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateTypeGardenField('stemColor', c.hex)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{isAr ? c.nameAr : c.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Petals Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-rose-500" />
            <span>{isAr ? 'لون الزهور والبتلات:' : 'Flower Petals Color:'}</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {petalColors.map((c) => {
              const isSelected = (typeGarden.petalColor || '#9B1B36') === c.hex;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateTypeGardenField('petalColor', c.hex)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{isAr ? c.nameAr : c.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. DEVELOPER EXPORT & SEED BAR */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="font-mono bg-stone-100 px-2 py-1 rounded-md text-[11px] font-bold text-stone-700">
            Seed #{typeGarden.seed}
          </span>
          <span>•</span>
          <span>{isAr ? 'محفوظ مباشرة في إعدادات المتجر' : 'Saved live to store settings'}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isAr ? 'نسخ إعدادات المحرك (JSON)' : 'Copy Config JSON'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
