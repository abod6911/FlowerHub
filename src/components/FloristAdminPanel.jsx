import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Check,
  Package,
  Sliders,
  FileText,
  Clock,
  Archive,
  Palette,
  Layout,
  Camera,
  X,
  Tag,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Shuffle,
  Wind,
  Type,
  TrendingUp,
} from 'lucide-react';
import SalesAndProfitsDashboard from './SalesAndProfitsDashboard';
import {
  THEME_TOKENS,
  HERO_STYLES,
  SPECIALS_STYLES,
  VERIFIED_FLORAL_PRESETS,
  INITIAL_FORMATS,
  INITIAL_OCCASIONS,
  CURATED_TEMPLATES,
} from '../data/mockData';
import { t } from '../utils/translations';
import DarAlwardAnimatedTitle from './DarAlwardAnimatedTitle';
import { DEFAULT_BOTANICAL_BRAND_CONFIG } from '../types/botanical';

export default function FloristAdminPanel({
  shopConfig,
  onUpdateShopConfig,
  products,
  onUpdateProduct,
  onAddProduct,
  onMoveToPastWork,
  pastWorks = [],
  lang = 'ar',
  onOpenOrderSlip,
  themeTokens = THEME_TOKENS.botanical,
  formats = INITIAL_FORMATS,
  onAddFormat,
  occasions = INITIAL_OCCASIONS,
  onAddOccasion,
  onToggleOccasionVisibility,
  onDeleteOccasion,
  onResetOccasions,
  customizerConfig: _customizerConfig,
  onOpenDesignStudio,
  onApplyCuratedTemplate,
  botanicalBrandConfig,
  onPublishBotanicalConfig,
  onOpenBotanicalTypography,
  initialTab = 'menu',
}) {
  const strings = t[lang];
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState(initialTab); // 'menu' | 'add' | 'sales' | 'design'
  const [menuFilter, setMenuFilter] = useState('all'); // 'all' | 'ready_today' | 'one_time' | 'sold_out' | 'past_work'

  // Quick Add Form State
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newPrice, setNewPrice] = useState(220);
  const [newOccasion, setNewOccasion] = useState(occasions[0]?.id || 'specials');
  const [newFormat, setNewFormat] = useState(formats[1]?.id || 'bouquet');
  const [newImage, setNewImage] = useState(VERIFIED_FLORAL_PRESETS[0].url);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [newIsReadyNow, setNewIsReadyNow] = useState(true);
  const [newIsOneTimeSpecial, setNewIsOneTimeSpecial] = useState(true);
  const [newAllowCustomColors, setNewAllowCustomColors] = useState(true);

  // Modal / Inline Add Category states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryType, setCategoryType] = useState('format'); // 'format' | 'occasion'
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');

  // Stories Manager Local State
  const [isAddingStoryFormOpen, setIsAddingStoryFormOpen] = useState(false);
  const [storyFormNameAr, setStoryFormNameAr] = useState('');
  const [storyFormNameEn, setStoryFormNameEn] = useState('');
  const [storyFormImage, setStoryFormImage] = useState(VERIFIED_FLORAL_PRESETS[0]?.url || '');
  const [storyFormUploadedImage, setStoryFormUploadedImage] = useState(null);
  const storyFileInputRef = useRef(null);

  const handleStoryPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setStoryFormUploadedImage(dataUrl);
      setStoryFormImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitNewStory = (e) => {
    e.preventDefault();
    if (!storyFormNameAr.trim()) return;
    const finalImage = storyFormUploadedImage || storyFormImage || VERIFIED_FLORAL_PRESETS[0]?.url;
    if (onAddOccasion) {
      onAddOccasion(storyFormNameAr.trim(), storyFormNameEn.trim(), finalImage);
    }
    setStoryFormNameAr('');
    setStoryFormNameEn('');
    setStoryFormUploadedImage(null);
    setIsAddingStoryFormOpen(false);
  };

  const fileInputRef = useRef(null);

  // File Upload Handler (FileReader)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setUploadedImagePreview(dataUrl);
      setNewImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Quick Add Submit Handler
  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!newTitleAr.trim()) return;

    const roundedPrice = Math.round(Number(newPrice) / 5) * 5 || 220;

    const newBouquet = {
      id: `prod-${Date.now()}`,
      category: newOccasion,
      productType: newFormat,
      type: newIsOneTimeSpecial ? 'daily_special' : 'constant',
      isReadyNow: newIsReadyNow,
      isOneTimeSpecial: newIsOneTimeSpecial,
      coolerStock: newIsOneTimeSpecial ? 1 : 4,
      titleAr: newTitleAr.trim(),
      titleEn: newTitleEn.trim() || newTitleAr.trim(),
      descAr: 'تنسيق يدوي طازج مُنسق اليوم بأزهار طبيعية فاخرة.',
      descEn: 'Artisanal hand-tied arrangement crafted today with luxury fresh florals.',
      price: roundedPrice,
      originalPrice: null,
      image: uploadedImagePreview || newImage,
      stemCount: 25,
      flowerType: isAr ? 'أزهار طبيعية مختارة' : 'Curated Fresh Blooms',
      dimensions: '50cm x 35cm',
      allowCustomColors: newAllowCustomColors,
      allowCustomText: false,
      isSoldOut: false,
    };

    onAddProduct(newBouquet);

    // Reset Form
    setNewTitleAr('');
    setNewTitleEn('');
    setUploadedImagePreview(null);
    setNewImage(VERIFIED_FLORAL_PRESETS[0].url);
    setActiveTab('menu');
    setMenuFilter('ready_today');
  };

  // Add Category Modal Submit
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatNameAr.trim()) return;

    if (categoryType === 'format' && onAddFormat) {
      const createdId = onAddFormat(newCatNameAr, newCatNameEn);
      setNewFormat(createdId);
    } else if (categoryType === 'occasion' && onAddOccasion) {
      const createdId = onAddOccasion(newCatNameAr, newCatNameEn);
      setNewOccasion(createdId);
    }

    setNewCatNameAr('');
    setNewCatNameEn('');
    setIsAddingCategory(false);
  };

  // Filtered products for Tab 1
  const filteredProducts = products.filter((p) => {
    if (menuFilter === 'ready_today') return p.isReadyNow && !p.isSoldOut;
    if (menuFilter === 'one_time') return p.isOneTimeSpecial;
    if (menuFilter === 'sold_out') return p.isSoldOut;
    return true;
  });

  // Reusable iOS Toggle Row
  const renderIosToggle = (label, sublabel, checked, onChange) => (
    <div
      onClick={onChange}
      className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-stone-200/90 cursor-pointer hover:border-stone-300 transition-all select-none"
    >
      <div className="flex-1 pe-3">
        <span className="text-xs font-bold text-stone-900 block">{label}</span>
        <span className="text-[11px] text-stone-500 mt-0.5 block">{sublabel}</span>
      </div>

      <div
        role="switch"
        aria-checked={checked}
        className={`w-12 h-6.5 rounded-full transition-colors duration-200 p-0.5 flex items-center shrink-0 ${
          checked ? 'bg-stone-900' : 'bg-stone-200'
        }`}
      >
        <div
          className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
            checked ? (isAr ? '-translate-x-5.5' : 'translate-x-5.5') : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#FAF9F6] min-h-screen text-stone-900 flex flex-col pb-28 transition-all">
      {/* 1. Florist Admin Top Live Status Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-bold text-stone-900 tracking-tight">
              {isAr ? 'لوحة تحكم المنسق المباشرة' : 'Florist Live Studio'}
            </h1>
          </div>

          <button
            onClick={onOpenOrderSlip}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 text-white text-[11px] font-medium shadow-xs hover:bg-stone-800 transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAr ? 'تذكرة #8492' : 'Slip #8492'}</span>
          </button>
        </div>

        {/* 1-Tap Live Shop Status Segmented Control */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/60 text-xs font-semibold">
          <button
            onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'open_20m' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              shopConfig.status === 'open_20m'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span>{isAr ? 'مفتوح • ٢٠ د' : 'Open • 20m'}</span>
          </button>

          <button
            onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'busy_60m' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              shopConfig.status === 'busy_60m'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-200" />
            <span>{isAr ? 'مشغول • ٦٠ د' : 'Busy • 60m'}</span>
          </button>

          <button
            onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'closed' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              shopConfig.status === 'closed'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span>{isAr ? 'مغلق مؤقتاً' : 'Closed'}</span>
          </button>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{isAr ? 'إدارة المعروض والجاهز' : 'Menu & Ready Today'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-700 text-stone-200">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'add'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة باقة (١٥ ث)' : '+ Quick Add'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-emerald-900 text-emerald-100 shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'المبيعات والأرباح' : 'Sales & Profits'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-800 text-emerald-200 font-mono">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'design'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'المظهر والحركة' : 'Design & Motion'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: Menu & Ready Today Manager (Unified Neutral Control Bar) */}
      {/* ========================================================= */}
      {activeTab === 'menu' && (
        <div className="p-4 space-y-3">
          {/* Sub-Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-medium">
            {[
              { id: 'all', labelAr: 'الكل', labelEn: 'All' },
              { id: 'ready_today', labelAr: 'جاهز اليوم (المثبت)', labelEn: 'Ready Today' },
              { id: 'one_time', labelAr: 'قطعة واحدة فقط', labelEn: 'One-Time Piece' },
              { id: 'sold_out', labelAr: 'نفدت الكمية', labelEn: 'Sold Out' },
              { id: 'past_work', labelAr: 'من أعمالنا (الأرشيف)', labelEn: 'Past Work' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMenuFilter(f.id)}
                className={`flex-none px-3 py-1 rounded-full border transition-all ${
                  menuFilter === f.id
                    ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                {isAr ? f.labelAr : f.labelEn}
              </button>
            ))}
          </div>

          {/* Past Work Archive List */}
          {menuFilter === 'past_work' ? (
            <div className="space-y-2.5">
              <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-600 flex items-start gap-2 border border-stone-200/80">
                <Archive className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                <p>
                  {isAr
                    ? 'هذه القطع مؤرشفة في قسم "من أعمالنا" كمعرض للأعمال السابقة. يمكن للعملاء طلب تنسيق مشابه لها عبر الواتساب.'
                    : 'These pieces are showcased in "Past Work" portfolio. Customers can request similar setups on WhatsApp.'}
                </p>
              </div>

              {pastWorks.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt={isAr ? item.titleAr : item.titleEn}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-stone-400 block uppercase">
                      {item.venueAr || item.venueEn}
                    </span>
                    <h3 className="text-xs font-bold text-stone-900 truncate">
                      {isAr ? item.titleAr : item.titleEn}
                    </h3>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      {isAr ? item.tagAr : item.tagEn}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium border border-stone-200">
                    {isAr ? 'معرض أعمال' : 'Portfolio'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Active Products Cards - CLEAN UNIFIED MONOCHROME CONTROLS (NO RAINBOW PILLS) */
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const isReady = product.isReadyNow;
                const isOneTime = product.isOneTimeSpecial;
                const isSoldOut = product.isSoldOut;
                const isEditable = product.allowCustomColors || product.allowCustomText;

                return (
                  <div
                    key={product.id}
                    className={`p-3.5 bg-white rounded-2xl border transition-all shadow-xs space-y-3 ${
                      isSoldOut
                        ? 'opacity-65 border-stone-200 bg-stone-50/50'
                        : 'border-stone-200/90 hover:border-stone-300'
                    }`}
                  >
                    {/* Top Row: 60px rounded thumbnail + Category label + Product Title + Direct Editable Price Pill */}
                    <div className="flex items-start gap-3">
                      <div className="relative w-15 h-15 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                        <img
                          src={product.image}
                          alt={isAr ? product.titleAr : product.titleEn}
                          className="w-full h-full object-cover"
                        />
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white">
                            {isAr ? 'نفد' : 'Sold'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] uppercase font-bold text-stone-400">
                            {product.category}
                          </span>
                          <span className="text-[10px] font-medium text-stone-400">
                            {isOneTime ? (isAr ? 'قطعة وحيدة' : '1 Piece') : ''}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                          {isAr ? product.titleAr : product.titleEn}
                        </h3>

                        {/* Direct Editable Price Pill with -5 / +5 Quick Buttons */}
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200/80">
                            <button
                              onClick={() =>
                                onUpdateProduct(product.id, {
                                  price: Math.max(30, (product.price || 100) - 5),
                                })
                              }
                              className="px-1.5 py-0.5 rounded text-stone-700 hover:bg-stone-200 text-[11px] font-bold transition-colors active:scale-95"
                              title="-5 SAR"
                            >
                              -5
                            </button>

                            <input
                              type="number"
                              step="5"
                              value={product.price}
                              onChange={(e) =>
                                onUpdateProduct(product.id, {
                                  price: parseInt(e.target.value, 10) || product.price,
                                })
                              }
                              className="w-13 text-center font-bold text-xs bg-white rounded mx-0.5 py-0.5 text-stone-900 border border-stone-200 focus:outline-none"
                            />

                            <button
                              onClick={() =>
                                onUpdateProduct(product.id, {
                                  price: (product.price || 100) + 5,
                                })
                              }
                              className="px-1.5 py-0.5 rounded text-stone-700 hover:bg-stone-200 text-[11px] font-bold transition-colors active:scale-95"
                              title="+5 SAR"
                            >
                              +5
                            </button>
                          </div>
                          <span className="text-[10px] font-medium text-stone-500">{strings.sar}</span>

                          {/* Quick Cooler Stock Stepper */}
                          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-[11px] ms-auto">
                            <span className="text-[10px] text-stone-500 px-1 font-medium">
                              {isAr ? 'المبرد:' : 'Cooler:'}
                            </span>
                            <button
                              onClick={() => {
                                const currentStock = product.coolerStock ?? (product.isOneTimeSpecial ? 1 : 4);
                                const newStock = Math.max(0, currentStock - 1);
                                onUpdateProduct(product.id, {
                                  coolerStock: newStock,
                                  isSoldOut: newStock <= 0,
                                });
                              }}
                              className="w-4 h-4 flex items-center justify-center rounded hover:bg-stone-200 font-bold text-stone-700 active:scale-90"
                              title={isAr ? 'إنقاص مخزون المبرد' : 'Decrease Stock'}
                            >
                              -
                            </button>
                            <span className="font-mono font-bold px-1 text-stone-900 min-w-4 text-center">
                              {product.coolerStock ?? (product.isOneTimeSpecial ? 1 : 4)}
                            </span>
                            <button
                              onClick={() => {
                                const currentStock = product.coolerStock ?? (product.isOneTimeSpecial ? 1 : 4);
                                onUpdateProduct(product.id, {
                                  coolerStock: currentStock + 1,
                                  isSoldOut: false,
                                });
                              }}
                              className="w-4 h-4 flex items-center justify-center rounded hover:bg-stone-200 font-bold text-stone-700 active:scale-90"
                              title={isAr ? 'زيادة مخزون المبرد' : 'Increase Stock'}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Control Bar: Unified Monochrome Neutral Controls */}
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 flex-wrap text-xs">
                      {/* Segmented Stock Switch */}
                      <div className="inline-flex p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-[11px] font-medium">
                        <button
                          onClick={() =>
                            onUpdateProduct(product.id, { isSoldOut: false })
                          }
                          className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                            !isSoldOut
                              ? 'bg-white text-stone-900 font-bold shadow-xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{isAr ? 'متوفر' : 'In Stock'}</span>
                        </button>
                        <button
                          onClick={() =>
                            onUpdateProduct(product.id, { isSoldOut: true })
                          }
                          className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                            isSoldOut
                              ? 'bg-white text-stone-900 font-bold shadow-xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{isAr ? 'نفد' : 'Sold Out'}</span>
                        </button>
                      </div>

                      {/* 3 Uniform Neutral Pill Toggles */}
                      <button
                        onClick={() =>
                          onUpdateProduct(product.id, { isReadyNow: !isReady })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          isReady
                            ? 'bg-stone-900 text-white font-semibold shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {isAr ? 'جاهز اليوم' : 'Ready Today'}
                      </button>

                      <button
                        onClick={() =>
                          onUpdateProduct(product.id, {
                            isOneTimeSpecial: !isOneTime,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          isOneTime
                            ? 'bg-stone-900 text-white font-semibold shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {isAr ? 'قطعة واحدة' : '1-Piece'}
                      </button>

                      <button
                        onClick={() =>
                          onUpdateProduct(product.id, {
                            allowCustomColors: !isEditable,
                            allowCustomText: !isEditable,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          isEditable
                            ? 'bg-stone-900 text-white font-semibold shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {isAr ? 'قابل للتعديل' : 'Customizable'}
                      </button>

                      {/* Archive to Portfolio prominent button */}
                      <button
                        onClick={() => onMoveToPastWork(product)}
                        className="ms-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[11px] font-bold transition-all active:scale-95 shadow-2xs"
                        title={isAr ? 'أرشفة لمعرض الأعمال لتفريغ المبرد' : 'Archive to Past Work Portfolio'}
                      >
                        <Archive className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isAr ? 'أرشفة للأعمال' : 'To Portfolio'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200 p-6">
                  <p className="text-xs">
                    {isAr ? 'لا توجد منتجات مطابقة لهذا الفلتر' : 'No items match this filter'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: REBUILT + Quick Add Form (Camera Upload, Smart Pricing, Custom Category Pills, iOS Toggles) */}
      {/* ========================================================= */}
      {activeTab === 'add' && (
        <form onSubmit={handleQuickAddSubmit} className="p-4 space-y-4">
          {/* 1. Real Camera / Gallery Upload First */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800">
              {isAr ? '١. صورة الباقة (رفع فوري أو اختيار سريع):' : '1. Bouquet Photo:'}
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Prominent Upload Dropzone */}
            {uploadedImagePreview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 border-2 border-stone-300 group">
                <img
                  src={uploadedImagePreview}
                  alt="Uploaded bouquet"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-full bg-white text-stone-900 font-bold text-xs flex items-center gap-1 shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تغيير الصورة' : 'Change Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImagePreview(null);
                      setNewImage(VERIFIED_FLORAL_PRESETS[0].url);
                    }}
                    className="p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 start-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  {isAr ? 'صورة مرفوعة من الهاتف' : 'Uploaded Photo'}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl p-4 bg-white border-2 border-dashed border-stone-300 hover:border-stone-500 cursor-pointer text-center flex flex-col items-center justify-center gap-2 transition-colors py-6"
              >
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
                  <Camera className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    {isAr ? 'رفع صورة من كاميرا الهاتف أو الألبوم' : 'Upload Photo from Phone / Camera'}
                  </span>
                  <span className="text-[11px] text-stone-400 mt-0.5 block">
                    {isAr ? 'اضغط هنا لاختيار الصورة مباشرة' : 'Tap to select photo'}
                  </span>
                </div>
              </div>
            )}

            {/* Compact horizontal strip of sample floral photos */}
            <div className="pt-1">
              <span className="text-[11px] text-stone-500 font-medium block mb-1.5">
                {isAr ? 'أو اختر من الزهور الطبيعية المعتمدة:' : 'Or pick a verified sample floral photo:'}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {VERIFIED_FLORAL_PRESETS.map((preset) => {
                  const isSelected = newImage === preset.url && !uploadedImagePreview;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setUploadedImagePreview(null);
                        setNewImage(preset.url);
                      }}
                      className={`relative flex-none w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-stone-900 ring-2 ring-stone-900/30 scale-105 shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={preset.nameAr}
                    >
                      <img
                        src={preset.url}
                        alt={preset.nameEn}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute bottom-1 end-1 bg-stone-900 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Titles */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800">
              {isAr ? '٢. اسم الباقة:' : '2. Bouquet Name:'}
            </label>
            <input
              type="text"
              required
              placeholder={isAr ? 'اسم الباقة بالعربي (مثلاً: بوكيه سمر كلاسيك)' : 'Arabic Title'}
              value={newTitleAr}
              onChange={(e) => setNewTitleAr(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            <input
              type="text"
              placeholder={isAr ? 'الاسم بالإنجليزي (اختياري)' : 'English Title (optional)'}
              value={newTitleEn}
              onChange={(e) => setNewTitleEn(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* 3. Smart Florist Pricing (No 241/247! Quick 1-tap pills + -5/+5) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-800">
                {isAr ? '٣. تحديد السعر (مضاعفات ٥ ر.س):' : '3. Realistic Florist Price (SAR):'}
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNewPrice((prev) => Math.max(30, Number(prev) - 5))}
                  className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 active:scale-95"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setNewPrice((prev) => Number(prev) + 5)}
                  className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 active:scale-95"
                >
                  +5
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="5"
                  required
                  min="30"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full text-sm font-bold p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="absolute end-3 top-3 text-xs font-semibold text-stone-400">
                  {strings.sar}
                </span>
              </div>
            </div>

            {/* 1-Tap Quick Price Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {[120, 150, 180, 220, 280, 350].map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setNewPrice(pr)}
                  className={`flex-none px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    Number(newPrice) === pr
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/60'
                  }`}
                >
                  {pr} {strings.sar}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Format Pill Grid with "+ New Category" */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">
                {isAr ? '٤. نوع التنسيق:' : '4. Floral Format:'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setCategoryType('format');
                  setIsAddingCategory(true);
                }}
                className="text-[11px] font-bold text-stone-800 hover:text-black flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? '+ تصنيف جديد' : '+ New Category'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {formats
                .filter((f) => f.id !== 'all')
                .map((f) => {
                  const isSelected = newFormat === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setNewFormat(f.id)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                        isSelected
                          ? 'bg-stone-900 text-white font-bold shadow-xs'
                          : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {isAr ? f.nameAr : f.nameEn}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* 5. Occasion Pill Grid with "+ New Occasion" */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">
                {isAr ? '٥. المناسبة:' : '5. Occasion:'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setCategoryType('occasion');
                  setIsAddingCategory(true);
                }}
                className="text-[11px] font-bold text-stone-800 hover:text-black flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? '+ مناسبة جديدة' : '+ New Occasion'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {occasions
                .filter((occ) => occ.id !== 'past_work')
                .map((occ) => {
                  const isSelected = newOccasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setNewOccasion(occ.id)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                        isSelected
                          ? 'bg-stone-900 text-white font-bold shadow-xs'
                          : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {isAr ? occ.nameAr : occ.nameEn}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* 6. Clean iOS Toggle Rows */}
          <div className="space-y-2 pt-2">
            {renderIosToggle(
              isAr ? 'تثبيت في "جاهز للاستلام اليوم"' : 'Pin to "Ready Today"',
              isAr ? 'تظهر فوراً في شريط العرض المتحرك أعلى المتجر' : 'Showcases in top motion carousel',
              newIsReadyNow,
              () => setNewIsReadyNow(!newIsReadyNow)
            )}

            {renderIosToggle(
              isAr ? 'قطعة وحيدة خاصة' : 'One-Time Unique Piece',
              isAr ? 'تحصل على شارة "قطعة واحدة فقط" وتنفد بعد أول طلب' : 'Displays "One-Time Piece" badge',
              newIsOneTimeSpecial,
              () => setNewIsOneTimeSpecial(!newIsOneTimeSpecial)
            )}

            {renderIosToggle(
              isAr ? 'السماح للعميل بتعديل ألوان الورد والتغليف' : 'Allow Color & Wrap Tweaks',
              isAr ? 'تفعيل محدد الألوان في درج المنتج للعميل' : 'Enables custom color picker',
              newAllowCustomColors,
              () => setNewAllowCustomColors(!newAllowCustomColors)
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isAr ? 'نشر الباقة مباشرة في المتجر' : 'Publish Arrangement Live'}</span>
          </button>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 3: Store Design & Motion Customizer (With Live Mini-Storefront Preview Card) */}
      {/* ========================================================= */}
      {activeTab === 'design' && (
        <div className="p-4 space-y-5">
          {/* 0. Live Customizer Studio Quick Launch Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 border border-amber-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                  <span>{isAr ? 'استوديو التخصيص البصري الحي' : 'Live Design Customizer Studio'}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Live
                  </span>
                </h4>
                <p className="text-[11px] text-stone-300">
                  {isAr ? 'تخصيص متقدم للألوان، تأثيرات الزجاج، الخطوط، والحركات لحظياً' : 'Advanced visual tokens, glassmorphism, fonts & motion'}
                </p>
              </div>
            </div>
            {onOpenDesignStudio && (
              <button
                type="button"
                onClick={onOpenDesignStudio}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 text-center"
              >
                {isAr ? 'فتح الاستوديو الكامل' : 'Open Studio'}
              </button>
            )}
          </div>
          {/* 1. LIVE MINI-STOREFRONT PREVIEW CARD AT TOP */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAr ? 'معاينة حية للمتجر (مباشرة الآن)' : 'Live Storefront Mini Preview'}</span>
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                {shopConfig.theme} • {shopConfig.heroStyle}
              </span>
            </div>

            {/* The Mini Frame */}
            <div
              className={`rounded-2xl p-3.5 border transition-all duration-300 shadow-inner overflow-hidden ${
                themeTokens.pageBg
              }`}
            >
              {/* Mini Header Representation */}
              {shopConfig.heroStyle === 'editorial' ? (
                <div className="rounded-xl overflow-hidden relative h-20 bg-stone-900 p-2.5 flex flex-col justify-end text-white mb-2 shadow-xs">
                  <img
                    src="./images/hero/hero-atelier-banner.jpg"
                    alt="Cover"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6]"
                  />
                  <div className="relative z-10">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/20 backdrop-blur-md">
                      {isAr ? 'مفتوح • ٢٠ د' : 'Open • 20m'}
                    </span>
                    <h4 className="font-serif font-bold text-sm leading-tight mt-0.5">
                      {isAr ? shopConfig.shopNameAr : shopConfig.shopNameEn}
                    </h4>
                  </div>
                </div>
              ) : shopConfig.heroStyle === 'minimal' ? (
                <div className="text-center py-1 mb-2">
                  <div
                    className="w-7 h-7 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-[10px] font-bold shadow-xs"
                    style={{ backgroundColor: themeTokens.primaryHex }}
                  >
                    M
                  </div>
                  <h4 className={`font-serif font-bold text-xs ${themeTokens.textMain}`}>
                    {isAr ? shopConfig.shopNameAr : shopConfig.shopNameEn}
                  </h4>
                </div>
              ) : (
                /* Qlub style */
                <div
                  className={`p-2 rounded-xl mb-2 flex items-center gap-2 shadow-2xs ${themeTokens.cardBg}`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: themeTokens.primaryHex }}
                  >
                    M
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-bold text-xs truncate ${themeTokens.textMain}`}>
                      {isAr ? shopConfig.shopNameAr : shopConfig.shopNameEn}
                    </h4>
                    <span className={`text-[9px] block ${themeTokens.textMuted}`}>
                      {strings.statusOpen}
                    </span>
                  </div>
                </div>
              )}

              {/* Mini Specials Tag + Sample Card */}
              <div className="flex items-center justify-between mb-1 text-[10px]">
                <span className={`font-bold ${themeTokens.textMain}`}>
                  {strings.coolerTitle}
                </span>
                <span className={`px-1.5 py-0.2 rounded font-mono ${themeTokens.badge} ${themeTokens.textMain}`}>
                  {shopConfig.specialsStyle}
                </span>
              </div>

              {/* Sample Mini Product Card */}
              <div
                className={`p-2 rounded-xl flex items-center justify-between gap-2 shadow-2xs ${themeTokens.cardBg}`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src="./images/products/royal-red-roses.jpg"
                    alt="Rose"
                    className="w-8 h-8 rounded-lg object-cover bg-stone-100"
                  />
                  <div>
                    <span className={`text-[10px] font-bold block ${themeTokens.textMain}`}>
                      {isAr ? 'بوكيه الروز الملكي' : 'Royal Velvet Rose'}
                    </span>
                    <span className={`text-[9px] font-bold ${themeTokens.textMain}`}>
                      245 {strings.sar}
                    </span>
                  </div>
                </div>

                <div
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold shadow-2xs ${themeTokens.primary}`}
                >
                  +
                </div>
              </div>
            </div>
          </div>

          {/* Botanical Brand Title Management Card (Admin-to-Storefront Sync) */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'العنوان النباتي الفاخر للمتجر' : 'Botanical Brand Header'}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{isAr ? 'مُزامَن مع الهيدر' : 'Live Synced'}</span>
              </span>
            </div>

            {/* Live Visual Mini Canvas */}
            <div
              className="rounded-xl p-3 border border-stone-200/80 overflow-hidden flex items-center justify-center transition-all duration-300 relative group"
              style={{
                backgroundColor:
                  botanicalBrandConfig?.paletteId === 'paper' || botanicalBrandConfig?.paletteId === 'butter'
                    ? '#F7F4EE'
                    : '#0F172A',
              }}
            >
              <div className="w-full max-w-[360px]">
                <DarAlwardAnimatedTitle
                  config={botanicalBrandConfig}
                  isDark={!(botanicalBrandConfig?.paletteId === 'paper' || botanicalBrandConfig?.paletteId === 'butter')}
                  textColor={
                    botanicalBrandConfig?.paletteId === 'paper' || botanicalBrandConfig?.paletteId === 'butter'
                      ? '#111827'
                      : '#F9FAFB'
                  }
                  className="py-1"
                />
              </div>
            </div>

            {/* Configuration Status Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium flex items-center gap-1">
                <Type className="w-3 h-3 text-stone-400" />
                <span>{botanicalBrandConfig?.fontFamily || 'Amiri'}</span>
              </span>
              <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium flex items-center gap-1">
                <Palette className="w-3 h-3 text-stone-400" />
                <span className="capitalize">{botanicalBrandConfig?.paletteId || 'rosaNoir'}</span>
              </span>
              <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium flex items-center gap-1">
                <Wind className="w-3 h-3 text-stone-400" />
                <span className="capitalize">{botanicalBrandConfig?.motionMode || 'gust'}</span>
              </span>
              <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-500 font-mono text-[10px]">
                Seed #{botanicalBrandConfig?.seed || 48271}
              </span>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2 pt-1">
              {onOpenBotanicalTypography && (
                <button
                  type="button"
                  onClick={onOpenBotanicalTypography}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تخصيص في استوديو الزهور' : 'Customize in Studio'}</span>
                </button>
              )}

              {onPublishBotanicalConfig && (
                <button
                  type="button"
                  onClick={() => {
                    const newSeed = Math.floor(Math.random() * 999999);
                    onPublishBotanicalConfig({
                      ...(botanicalBrandConfig || DEFAULT_BOTANICAL_BRAND_CONFIG),
                      seed: newSeed,
                      updatedAt: Date.now(),
                    });
                  }}
                  className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-medium text-xs flex items-center gap-1 transition-all"
                  title={isAr ? 'توليد بذرة أزهار عشوائية جديدة وحفظها' : 'Shuffle Flower Seed'}
                >
                  <Shuffle className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">{isAr ? 'بذرة عشوائية' : 'Shuffle'}</span>
                </button>
              )}

              {onPublishBotanicalConfig && (
                <button
                  type="button"
                  onClick={() => {
                    onPublishBotanicalConfig({
                      ...DEFAULT_BOTANICAL_BRAND_CONFIG,
                      updatedAt: Date.now(),
                    });
                  }}
                  className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-stone-500 hover:text-rose-600 transition-all"
                  title={isAr ? 'استعادة العنوان النباتي الملكي الافتراضي' : 'Reset to Default'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 1.5 Curated Storefront Full Design Presets (5 Templates) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'القوالب الجاهزة فائقة الفخامة (Full Presets):' : 'Curated Storefront Presets:'}</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                5 Presets
              </span>
            </div>

            <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
              {CURATED_TEMPLATES.map((tmpl) => {
                const isActive =
                  shopConfig.theme === tmpl.config.presetId &&
                  shopConfig.heroStyle === tmpl.config.layout.heroStyle &&
                  shopConfig.specialsStyle === tmpl.config.layout.specialsStyle;

                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      if (onApplyCuratedTemplate) {
                        onApplyCuratedTemplate(tmpl.config);
                      } else {
                        onUpdateShopConfig({
                          ...shopConfig,
                          theme: tmpl.config.presetId,
                          heroStyle: tmpl.config.layout.heroStyle,
                          specialsStyle: tmpl.config.layout.specialsStyle,
                        });
                      }
                    }}
                    className={`min-w-[190px] max-w-[210px] p-3 rounded-2xl border text-start flex flex-col justify-between transition-all shrink-0 ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-amber-400/60'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {tmpl.badge}
                        </span>
                        {isActive && <Check className="w-3 h-3 text-amber-300 stroke-[3]" />}
                      </div>
                      <div className="text-xs font-bold leading-snug">
                        {isAr ? tmpl.nameAr : tmpl.nameEn}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 border border-stone-200/50">
                        {tmpl.previewColors.map((col, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-md border border-white/20 shadow-2xs"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Brand Color Palette (4 Themes) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-stone-700" />
              <span>{isAr ? 'هوية المتجر والألوان الفاخرة:' : 'Brand Color Palette:'}</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(THEME_TOKENS)
                .filter((th, index, self) => self.findIndex((t) => t.id === th.id) === index)
                .map((th) => {
                  const isActive = shopConfig.theme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() =>
                        onUpdateShopConfig({
                          ...shopConfig,
                          theme: th.id,
                        })
                      }
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-start transition-all ${
                        isActive
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: th.primaryHex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {isAr ? th.nameAr : th.name}
                        </div>
                        <span
                          className={`text-[9px] block ${
                            isActive ? 'text-stone-300' : 'text-stone-400'
                          }`}
                        >
                          {th.isDark ? (isAr ? 'وضع ليلي فاخر' : 'Dark Luxury') : (isAr ? 'فاتح أنيق' : 'Light Atelier')}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* 3. Shop Header Layout (3 Layouts) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-stone-700" />
              <span>{isAr ? 'تنسيق ترويسة المتجر (Hero):' : 'Shop Header Layout:'}</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              {HERO_STYLES.map((hero) => {
                const isActive = shopConfig.heroStyle === hero.id;
                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() =>
                      onUpdateShopConfig({
                        ...shopConfig,
                        heroStyle: hero.id,
                      })
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-bold">
                      {isAr ? hero.nameAr : hero.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Specials Showcase Animation Style (4 Switchable Modes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'نمط حركة "جاهز للاستلام اليوم":' : '"Ready Today" Motion Style:'}</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SPECIALS_STYLES.map((style) => {
                const isActive = shopConfig.specialsStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      onUpdateShopConfig({
                        ...shopConfig,
                        specialsStyle: style.id,
                      })
                    }
                    className={`p-3 rounded-xl border text-start transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-bold">
                      {isAr ? style.nameAr : style.name}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isActive ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {style.id === 'marquee' && (isAr ? 'انسيابي مستمر' : 'Smooth glide')}
                      {style.id === 'coverflow' && (isAr ? 'تركيز ثلاثي الأبعاد' : '3D Snap focus')}
                      {style.id === 'spotlight' && (isAr ? 'منصة فاخرة متباينة' : 'Contrasting stage')}
                      {style.id === 'editorial_deck' && (isAr ? 'بطاقة عريضة مقسومة' : 'Full split card')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Occasion Stories Manager (Floward & Instagram Style) */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? 'إدارة قصص المناسبات (Stories Manager):' : 'Occasion Stories Manager:'}</span>
                </label>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isAr
                    ? 'التحكم في الدوائر التفاعلية أعلى المتجر، إخفاء/إظهار، وإضافة قصص جديدة'
                    : 'Manage interactive top circles, toggle visibility, and add new stories'}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {onResetOccasions && (
                  <button
                    type="button"
                    onClick={onResetOccasions}
                    title={isAr ? 'استعادة الافتراضي' : 'Reset to Default'}
                    className="p-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddingStoryFormOpen(!isAddingStoryFormOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    isAddingStoryFormOpen
                      ? 'bg-stone-200 text-stone-800'
                      : 'bg-stone-900 text-white hover:bg-stone-800 shadow-xs active:scale-95'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAr ? '+ قصة مناسبة' : '+ New Story'}</span>
                </button>
              </div>
            </div>

            {/* Inline Add New Story Form */}
            {isAddingStoryFormOpen && (
              <form
                onSubmit={handleSubmitNewStory}
                className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isAr ? 'إنشاء قصة مناسبة جديدة للمتجر' : 'Create New Occasion Story'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingStoryFormOpen(false)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-700 block mb-1">
                      {isAr ? 'اسم المناسبة (عربي) *' : 'Occasion Name (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'مثال: خطوبة وملكة' : 'e.g. Engagement'}
                      value={storyFormNameAr}
                      onChange={(e) => setStoryFormNameAr(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-700 block mb-1">
                      {isAr ? 'اسم المناسبة (إنجليزي)' : 'Occasion Name (English)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Engagement & Party"
                      value={storyFormNameEn}
                      onChange={(e) => setStoryFormNameEn(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>

                {/* Image Selection Presets */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-700 block">
                    {isAr ? 'صورة الغلاف الدائرية (اختر من الصور المعتمدة أو ارفع صورة):' : 'Cover Image (Select preset or upload):'}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {VERIFIED_FLORAL_PRESETS.map((preset) => {
                      const isSelected = (storyFormUploadedImage || storyFormImage) === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setStoryFormUploadedImage(null);
                            setStoryFormImage(preset.url);
                          }}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected
                              ? 'border-amber-500 scale-105 shadow-xs ring-1 ring-amber-400'
                              : 'border-transparent opacity-75 hover:opacity-100 hover:border-stone-300'
                          }`}
                        >
                          <img src={preset.url} alt={preset.nameAr} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload or Custom URL */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={storyFileInputRef}
                    accept="image/*"
                    onChange={handleStoryPhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => storyFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAr ? 'رفع من الجهاز' : 'Upload File'}</span>
                  </button>

                  <input
                    type="url"
                    placeholder={isAr ? 'أو ضع رابط صورة مباشر (URL)...' : 'Or paste direct image URL...'}
                    value={storyFormUploadedImage ? '' : storyFormImage}
                    onChange={(e) => {
                      setStoryFormUploadedImage(null);
                      setStoryFormImage(e.target.value);
                    }}
                    className="flex-1 text-xs p-2 rounded-xl border border-stone-300 bg-white font-mono"
                  />
                </div>

                {/* Preview and Submit */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 bg-stone-100 shadow-xs">
                      <img
                        src={storyFormUploadedImage || storyFormImage || VERIFIED_FLORAL_PRESETS[0]?.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-stone-800">
                      {storyFormNameAr || (isAr ? 'معاينة القصة' : 'Story Preview')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingStoryFormOpen(false)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-100"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 shadow-xs transition-all active:scale-95"
                    >
                      {isAr ? 'إضافة ونشر' : 'Add Story'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List of Existing Stories */}
            <div className="space-y-1.5">
              {occasions.map((occ) => {
                const isVisible = occ.isVisible !== false;
                const isProtected = occ.id === 'specials' || occ.id === 'all';

                return (
                  <div
                    key={occ.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      isVisible
                        ? 'bg-white border-stone-200/90 shadow-2xs'
                        : 'bg-stone-50 border-stone-200/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                        <img src={occ.image} alt={occ.nameAr} className="w-full h-full object-cover" />
                        {!isVisible && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                            <EyeOff className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {isAr ? occ.nameAr : occ.nameEn}
                          </span>
                          {occ.id === 'specials' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                              {isAr ? 'جاهز اليوم' : 'Live Cooler'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono block">
                          #{occ.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Visibility Toggle Button */}
                      {onToggleOccasionVisibility && (
                        <button
                          type="button"
                          onClick={() => onToggleOccasionVisibility(occ.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                            isVisible
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span className="hidden sm:inline">
                            {isVisible ? (isAr ? 'ظاهرة' : 'Visible') : (isAr ? 'مخفية' : 'Hidden')}
                          </span>
                        </button>
                      )}

                      {/* Delete Story Button */}
                      {onDeleteOccasion && !isProtected && (
                        <button
                          type="button"
                          onClick={() => onDeleteOccasion(occ.id)}
                          title={isAr ? 'حذف القصة' : 'Delete Story'}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Live Shop Info Editor */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <label className="text-xs font-bold text-stone-900 block">
              {isAr ? 'معلومات المتجر والشعار ورقم الواتساب:' : 'Shop Details, Logo & WhatsApp:'}
            </label>

            {/* Operational Status Selector */}
            <div>
              <span className="text-[11px] font-bold text-stone-700 block mb-1">
                {isAr ? 'الحالة التشغيلية للمحل:' : 'Operational Status:'}
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'open_20m' })}
                  className={`py-1.5 px-2 rounded-lg transition-all ${
                    shopConfig.status === 'open_20m'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {isAr ? 'مفتوح • ٢٠ د' : 'Open • 20m'}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'busy_60m' })}
                  className={`py-1.5 px-2 rounded-lg transition-all ${
                    shopConfig.status === 'busy_60m'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {isAr ? 'مشغول • ٦٠ د' : 'Busy • 60m'}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'closed' })}
                  className={`py-1.5 px-2 rounded-lg transition-all ${
                    shopConfig.status === 'closed'
                      ? 'bg-stone-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {isAr ? 'مغلق مؤقتاً' : 'Closed'}
                </button>
              </div>
            </div>

            {/* Live Logo URL & Avatar */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-200 bg-stone-50">
              <div className="w-12 h-12 rounded-xl bg-stone-900 text-white flex items-center justify-center overflow-hidden shrink-0 font-serif font-bold text-lg shadow-xs">
                {shopConfig.logoUrl ? (
                  <img src={shopConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>M</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] text-stone-500 font-bold block mb-1">
                  {isAr ? 'رابط شعار المتجر (Logo URL):' : 'Store Logo URL:'}
                </label>
                <input
                  type="url"
                  placeholder="https://.../logo.png"
                  value={shopConfig.logoUrl || ''}
                  onChange={(e) =>
                    onUpdateShopConfig({ ...shopConfig, logoUrl: e.target.value })
                  }
                  className="w-full text-xs p-1.5 rounded-lg border border-stone-200 bg-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder={isAr ? 'اسم المتجر بالعربي' : 'Shop Name AR'}
                value={shopConfig.shopNameAr}
                onChange={(e) =>
                  onUpdateShopConfig({ ...shopConfig, shopNameAr: e.target.value })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />

              <input
                type="text"
                placeholder={isAr ? 'اسم المتجر بالإنجليزي' : 'Shop Name EN'}
                value={shopConfig.shopNameEn}
                onChange={(e) =>
                  onUpdateShopConfig({ ...shopConfig, shopNameEn: e.target.value })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />

              <input
                type="text"
                placeholder={isAr ? 'شعار المتجر (Tagline)' : 'Shop Tagline'}
                value={shopConfig.taglineAr}
                onChange={(e) =>
                  onUpdateShopConfig({ ...shopConfig, taglineAr: e.target.value })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />

              <input
                type="text"
                placeholder={isAr ? 'رقم الواتساب للاستقبال (مثلاً: 966500000000)' : 'WhatsApp Phone'}
                value={shopConfig.phone}
                onChange={(e) =>
                  onUpdateShopConfig({ ...shopConfig, phone: e.target.value })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: Sales & Net Profits Analytics Dashboard */}
      {/* ========================================================= */}
      {activeTab === 'sales' && (
        <div className="p-3 sm:p-5">
          <SalesAndProfitsDashboard
            lang={lang}
            onOpenOrderSlip={onOpenOrderSlip}
            themeTokens={themeTokens}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Inline Add Brand New Category / Format / Occasion */}
      {/* ========================================================= */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-stone-700" />
                <span>
                  {categoryType === 'format'
                    ? isAr
                      ? 'إضافة نوع تنسيق جديد'
                      : 'Add New Floral Format'
                    : isAr
                    ? 'إضافة مناسبة جديدة'
                    : 'Add New Occasion'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  {isAr ? 'الاسم بالعربي:' : 'Arabic Name:'}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={
                    categoryType === 'format'
                      ? isAr
                        ? 'مثال: ستاندات وتوزيعات'
                        : 'e.g. Stands & Giveaways'
                      : isAr
                      ? 'مثال: هدايا ترقية وشركات'
                      : 'e.g. Corporate Promotion'
                  }
                  value={newCatNameAr}
                  onChange={(e) => setNewCatNameAr(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  {isAr ? 'الاسم بالإنجليزي (اختياري):' : 'English Name (optional):'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Stands"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors shadow-xs"
                >
                  {isAr ? 'إضافة واعتماد فوراً' : 'Add to Storefront'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-100"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
