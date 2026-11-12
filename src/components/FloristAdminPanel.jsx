import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Wifi,
  Battery,
  MapPin,
  Phone,
  Lock,
  Layers,
  Play,
} from 'lucide-react';
import SalesAndProfitsDashboard from './SalesAndProfitsDashboard';
import { validateUploadedFile } from '../services/uploadSecurity';
import { sanitizeUrl, sanitizeText } from '../utils/sanitizer';
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
import { DEFAULT_BOTANICAL_BRAND_CONFIG } from '../types/botanical';

const CURATED_LOGO_OPTIONS = [
  {
    id: 'default-gold-seal',
    titleAr: 'ختم د.و الملكي',
    titleEn: 'Royal Monogram Seal',
    url: '',
  },
  {
    id: 'royal-red-roses',
    titleAr: 'جوري أحمر مخملي',
    titleEn: 'Royal Crimson Velvet',
    url: './images/products/royal-red-roses.jpg',
  },
  {
    id: 'casablanca-orchid',
    titleAr: 'كازابلانكا وأوركيد',
    titleEn: 'Casablanca & Orchid',
    url: './images/products/casablanca-orchid-vase.jpg',
  },
  {
    id: 'blush-hydrangea',
    titleAr: 'هيدرنجيا وروز باستيل',
    titleEn: 'Blush Hydrangea',
    url: './images/products/blush-hydrangea-vase.jpg',
  },
  {
    id: 'acrylic-celebration',
    titleAr: 'بوكس أكريليك ذهبي',
    titleEn: 'Acrylic Luxury Box',
    url: './images/products/acrylic-box-celebration.jpg',
  },
  {
    id: 'chocolates-floral',
    titleAr: 'صينية شوكولاتة وزهور',
    titleEn: 'Chocolates & Flowers',
    url: './images/products/chocolates-floral-box.jpg',
  },
];

class TabSafeBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('TabSafeBoundary caught error:', err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

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

  // Store Logo / Avatar Uploader State & Handlers
  const logoFileInputRef = useRef(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [logoToast, setLogoToast] = useState('');
  const [designToast, setDesignToast] = useState('');

  const triggerDesignFeedback = (msg) => {
    setDesignToast(msg);
    setTimeout(() => setDesignToast(''), 3500);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Validate file magic bytes, MIME whitelist, and 5MB maximum
    const validation = await validateUploadedFile(file, 'store');
    if (!validation.isValid) {
      alert(validation.error || (isAr ? 'الملف المرفق غير صالح أمنياً' : 'File is not secure'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      try {
        localStorage.setItem('flowerhub_store_avatar', dataUrl);
      } catch {}
      if (onUpdateShopConfig) {
        onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: dataUrl, logoUrl: dataUrl }));
      }
      setLogoToast(isAr ? 'تم تحديث وحفظ شعار المتجر بنجاح!' : 'Store logo updated successfully!');
      triggerDesignFeedback(isAr ? '✨ تم تحديث وحفظ شعار المتجر فورياً على الموقع!' : 'Store logo updated live!');
      setTimeout(() => setLogoToast(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogoUrl = (e) => {
    e.preventDefault();
    if (!logoUrlInput.trim()) return;
    const rawUrl = logoUrlInput.trim();
    // Security: Block script schemes and insecure URLs
    const safeUrl = sanitizeUrl(rawUrl, '');
    if (!safeUrl) {
      alert(isAr ? 'الرابط غير آمن أو غير صالح. يُشترط استخدام رابط يبدأ بـ https://' : 'Insecure or invalid URL. Only HTTPS URLs are permitted.');
      return;
    }

    try {
      localStorage.setItem('flowerhub_store_avatar', safeUrl);
    } catch {}
    if (onUpdateShopConfig) {
      onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: safeUrl, logoUrl: safeUrl }));
    }
    setLogoUrlInput('');
    setLogoToast(isAr ? 'تم حفظ رابط شعار المتجر بنجاح!' : 'Store logo URL saved successfully!');
    triggerDesignFeedback(isAr ? '✨ تم حفظ وتطبيق رابط الشعار فورياً على الموقع!' : 'Store logo URL applied live!');
    setTimeout(() => setLogoToast(''), 3000);
  };

  const handleResetLogo = () => {
    try {
      localStorage.removeItem('flowerhub_store_avatar');
    } catch {}
    if (onUpdateShopConfig) {
      onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: null, logoUrl: null }));
    }
    setLogoToast(isAr ? 'تمت استعادة الشعار الملكي الافتراضي (د.و)' : 'Reset to default royal seal');
    triggerDesignFeedback(isAr ? '✨ تمت استعادة الشعار الملكي الافتراضي فورياً!' : 'Default seal restored live!');
    setTimeout(() => setLogoToast(''), 3000);
  };

  const handleApplyCuratedLogo = (url) => {
    try {
      if (url) localStorage.setItem('flowerhub_store_avatar', url);
      else localStorage.removeItem('flowerhub_store_avatar');
    } catch {}
    if (onUpdateShopConfig) {
      onUpdateShopConfig((prev) => ({ ...prev, avatarUrl: url || null, logoUrl: url || null }));
    }
    setLogoToast(isAr ? 'تم تطبيق الشعار بنجاح!' : 'Logo applied live!');
    triggerDesignFeedback(isAr ? '✨ تم تطبيق الشعار فورياً على المتجر!' : 'Logo applied live!');
    setTimeout(() => setLogoToast(''), 3000);
  };

  const [addPhotoCategory, setAddPhotoCategory] = useState('all');
  const [productUrlInput, setProductUrlInput] = useState('');

  const handleStoryPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Validate file size (5MB), genuine MIME and magic bytes
    const validation = await validateUploadedFile(file, 'store');
    if (!validation.isValid) {
      alert(validation.error || (isAr ? 'الملف المرفق غير صالح أمنياً' : 'File is not secure'));
      return;
    }

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

  // File Upload Handler (FileReader + Magic Bytes Security Inspection)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Validate file size (5MB), genuine MIME and magic bytes
    const validation = await validateUploadedFile(file, 'store');
    if (!validation.isValid) {
      alert(validation.error || (isAr ? 'الملف المرفق غير صالح أمنياً' : 'File is not secure'));
      return;
    }

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

  const currentShopName = isAr
    ? (shopConfig?.shopNameAr || 'دار الورد')
    : (shopConfig?.shopNameEn || 'Dar Alward');

  const getMonogram = (name) => {
    if (!name) return 'د.و';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}.${words[1][0]}`;
    }
    return name.slice(0, 2);
  };
  const monogram = getMonogram(currentShopName);

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#FAF9F6] min-h-screen text-stone-900 flex flex-col pb-28 transition-all">
      {/* 1. Atelier Header & Boutique Status Control */}
      <div className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-stone-200/90 px-4 sm:px-6 py-3.5 shadow-[0_4px_20px_rgba(28,25,23,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Atelier Brand Title & Active Ticket */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-3">
              {/* Royal Atelier Monogram Seal Medallion */}
              <div className="relative group shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#0C0A09] text-amber-200 flex items-center justify-center border border-amber-400/40 shadow-[0_4px_16px_rgba(0,0,0,0.18)] ring-1 ring-amber-400/20 relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.22),transparent_70%)] pointer-events-none" />
                  {shopConfig?.avatarUrl || shopConfig?.logoUrl ? (
                    <img
                      src={shopConfig.avatarUrl || shopConfig.logoUrl}
                      alt={currentShopName}
                      className="w-full h-full object-cover rounded-2xl relative z-10"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center leading-none select-none relative z-10">
                      <span className="text-[10px] text-amber-400 font-serif -mb-0.5">✦</span>
                      <span className="text-xs font-serif font-black tracking-widest text-amber-100">{monogram}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-bold font-serif text-stone-900 tracking-tight flex items-center gap-1.5 select-none">
                  <span>{currentShopName}</span>
                </h1>
              </div>
            </div>

            {/* Active Ticket Pill as High-End Order Slip Certificate */}
            <button
              onClick={onOpenOrderSlip}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50/90 via-white to-amber-50/60 hover:from-amber-100/90 hover:to-white text-stone-800 text-[11px] font-semibold border border-amber-300/70 shadow-[0_2px_8px_rgba(217,119,6,0.08)] hover:shadow-md transition-all active:scale-95 cursor-pointer ring-1 ring-amber-400/20"
              title={isAr ? 'عرض تذكرة الطلب المباشرة' : 'View live order slip'}
            >
              <div className="w-5 h-5 rounded-full bg-amber-100/80 border border-amber-300/60 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-amber-800" />
              </div>
              <span className="font-mono font-bold text-stone-900 tracking-wider">#8492</span>
              <span className="text-amber-300">|</span>
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span>{isAr ? 'تذكرة نشطة' : 'Active Slip'}</span>
              </span>
            </button>
          </div>

          {/* 1-Tap Boutique Readiness Switcher (Quiet Luxury Segmented Control) */}
          <div className="flex items-center p-1 bg-gradient-to-r from-stone-100 via-[#F5F3EF] to-stone-100 rounded-2xl border border-stone-200/90 text-xs font-medium self-stretch sm:self-auto shadow-inner">
            <button
              onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'open_20m' })}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                shopConfig.status === 'open_20m'
                  ? 'bg-white text-stone-950 shadow-[0_2px_8px_rgba(28,25,23,0.08)] font-bold border border-stone-200/90 ring-1 ring-emerald-500/10'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-xs" />
              </span>
              <span>{isAr ? 'مستعد للطلبات • ٢٠ د' : 'Open • 20m'}</span>
            </button>

            <button
              onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'busy_60m' })}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                shopConfig.status === 'busy_60m'
                  ? 'bg-white text-amber-950 shadow-[0_2px_8px_rgba(28,25,23,0.08)] font-bold border border-amber-200/90'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{isAr ? 'مشغول • ٦٠ د' : 'Busy • 60m'}</span>
            </button>

            <button
              onClick={() => onUpdateShopConfig({ ...shopConfig, status: 'closed' })}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                shopConfig.status === 'closed'
                  ? 'bg-stone-950 text-amber-100 shadow-[0_2px_8px_rgba(28,25,23,0.12)] font-bold border border-stone-800'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              <span>{isAr ? 'مغلق مؤقتاً' : 'Closed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bespoke Luxury Navigation Tabs */}
      <div className="px-4 sm:px-6 pt-3.5 pb-2.5 border-b border-stone-200/80 bg-[#FAF9F6]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200/70 shadow-inner">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'menu'
                ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white shadow-md border border-stone-800 ring-1 ring-white/10 font-bold'
                : 'text-stone-600 hover:text-stone-950 hover:bg-white/80 border border-transparent hover:border-stone-200/70'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-stone-400" />
            <span>{isAr ? 'إدارة المعروض والجاهز' : 'Menu & Ready Today'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${activeTab === 'menu' ? 'bg-stone-800 text-amber-300' : 'bg-stone-200 text-stone-700'}`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white shadow-md border border-stone-800 font-bold'
                : 'text-stone-600 hover:text-stone-950 hover:bg-white/80 border border-transparent hover:border-stone-200/70'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'إضافة باقة سريعة' : '+ Quick Add'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'sales'
                ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-amber-200 shadow-md border border-amber-500/30 ring-1 ring-amber-400/20 font-bold'
                : 'text-stone-600 hover:text-stone-950 hover:bg-white/80 border border-transparent hover:border-stone-200/70'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'المبيعات والأرباح' : 'Sales & Profits'}</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'design'
                ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white shadow-md border border-stone-800 font-bold'
                : 'text-stone-600 hover:text-stone-950 hover:bg-white/80 border border-transparent hover:border-stone-200/70'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
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
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = './images/products/royal-red-roses.jpg';
                    }}
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
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = './images/products/royal-red-roses.jpg';
                          }}
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

            {/* 1.5. Curated Floral Library with 1-Tap Category Filters */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-700 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? 'أو اختر صورة جاهزة عالية الدقة بنقرة واحدة:' : 'Or pick a verified high-res photo in 1 tap:'}</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  12 {isAr ? 'صورة معتمدة' : 'Photos'}
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', labelAr: '🌸 الكل', labelEn: 'All' },
                  { id: 'roses', labelAr: '🌹 باقات جوري', labelEn: 'Roses' },
                  { id: 'vases', labelAr: '🏺 فازات زجاجية', labelEn: 'Vases' },
                  { id: 'boxes', labelAr: '🎁 بوكسات وهدايا', labelEn: 'Gift Boxes' },
                  { id: 'occasions', labelAr: '🌻 مناسبات ومواليد', labelEn: 'Occasions' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAddPhotoCategory(cat.id)}
                    className={`py-1 px-2.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      addPhotoCategory === cat.id
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {isAr ? cat.labelAr : cat.labelEn}
                  </button>
                ))}
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {VERIFIED_FLORAL_PRESETS.filter((p) => addPhotoCategory === 'all' || p.category === addPhotoCategory).map((preset) => {
                  const isSelected = newImage === preset.url && !uploadedImagePreview;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setUploadedImagePreview(null);
                        setNewImage(preset.url);
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 text-start p-1 flex flex-col gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 ring-2 ring-stone-900/30 scale-[1.02] bg-stone-50 shadow-xs'
                          : 'border-stone-200/80 bg-white hover:border-stone-400'
                      }`}
                      title={preset.nameAr}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-stone-100 relative">
                        <img
                          src={preset.url}
                          alt={preset.nameEn}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = './images/products/royal-red-roses.jpg';
                          }}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center">
                            <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-stone-700 truncate block">
                        {isAr ? preset.nameAr : preset.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Direct Photo URL Input */}
              <div className="pt-1 flex gap-1.5 items-center">
                <input
                  type="url"
                  value={productUrlInput}
                  onChange={(e) => setProductUrlInput(e.target.value)}
                  placeholder={isAr ? 'أو ضع رابط صورة خارجي مباشر (URL)...' : 'Or paste direct image URL...'}
                  className="flex-1 text-xs p-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                />
                <button
                  type="button"
                  disabled={!productUrlInput.trim()}
                  onClick={() => {
                    if (productUrlInput.trim()) {
                      const safe = sanitizeUrl(productUrlInput.trim(), '');
                      if (!safe) {
                        alert(isAr ? 'الرابط غير صالح أمنياً (يجب أن يبدأ بـ https://)' : 'Insecure URL (must use https://)');
                        return;
                      }
                      setUploadedImagePreview(safe);
                      setNewImage(safe);
                      setProductUrlInput('');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-amber-300 font-bold text-xs shrink-0 cursor-pointer"
                >
                  {isAr ? 'تطبيق' : 'Apply'}
                </button>
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
          {/* Live sync notification toast for Florist */}
          {designToast && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-between shadow-lg ring-2 ring-emerald-400/50 animate-fade-in sticky top-2 z-30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
                <span>{designToast}</span>
              </div>
              <span className="text-[10px] bg-black/25 px-2.5 py-0.5 rounded-full font-mono text-emerald-200">
                LIVE SYNCED
              </span>
            </div>
          )}

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

          {/* 1. REALISTIC INTERACTIVE MINI-PHONE LIVE PREVIEW */}
          <div className="rounded-3xl border border-stone-200/90 bg-gradient-to-b from-stone-50 via-white to-stone-50/50 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'معاينة حية حقيقية للمتجر (هاتف العميل)' : 'Live Mobile Phone Preview'}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/40">
                  {isAr ? 'مباشر وتفاعلي' : 'Live Interactive'}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {shopConfig.theme}
                </span>
              </div>
            </div>

            {/* iPhone Device Shell */}
            <div className="max-w-[340px] mx-auto rounded-[38px] p-2.5 bg-stone-950 shadow-2xl ring-1 ring-stone-800 border-4 border-stone-800 transition-all duration-300">
              {/* Screen Container */}
              <div
                className={`rounded-[28px] overflow-hidden border border-stone-700/40 relative shadow-inner text-start transition-all duration-300 ${
                  themeTokens.pageBg
                }`}
                style={{ minHeight: '460px' }}
              >
                {/* Phone Top Status Bar (9:41, Dynamic Island, Wifi, Battery) */}
                <div className="pt-2 px-4 pb-1 flex items-center justify-between text-[10px] font-bold text-stone-800 dark:text-stone-200 select-none">
                  <span>9:41</span>
                  {/* Dynamic Island Pill */}
                  <div className="w-20 h-4 rounded-full bg-black flex items-center justify-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                  </div>
                  <div className="flex items-center gap-1 text-[9px]">
                    <Wifi className="w-2.5 h-2.5" />
                    <Battery className="w-3 h-3" />
                  </div>
                </div>

                {/* Mini Store Header */}
                <div className="p-3 border-b border-stone-200/60 dark:border-stone-800/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Rating Pill */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 flex items-center gap-0.5">
                      <span className="text-amber-500">★</span> 4.9
                    </span>

                    {/* Operational Status Pill */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                        shopConfig.status === 'closed'
                          ? 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          : shopConfig.status === 'busy_60m'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          shopConfig.status === 'closed'
                            ? 'bg-stone-400'
                            : shopConfig.status === 'busy_60m'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500 animate-pulse'
                        }`}
                      />
                      <span>
                        {shopConfig.status === 'closed'
                          ? (isAr ? 'مغلق مؤقتاً' : 'Closed')
                          : shopConfig.status === 'busy_60m'
                          ? (isAr ? 'مشغول • ٦٠ د' : 'Busy • 60m')
                          : (isAr ? 'مفتوح • تجهيز فوري' : 'Open • Instant')}
                      </span>
                    </span>

                    {/* Logo / Seal */}
                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-stone-900 text-amber-300 flex items-center justify-center font-serif text-xs font-bold shadow-xs border border-amber-400/40 shrink-0">
                      {shopConfig.avatarUrl || shopConfig.logoUrl ? (
                        <img
                          src={shopConfig.avatarUrl || shopConfig.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>د.و</span>
                      )}
                    </div>
                  </div>

                  {/* Store Title & Tagline */}
                  <div className="text-center pt-0.5">
                    <h3 className={`font-serif font-bold text-sm leading-tight ${themeTokens.textMain}`}>
                      {isAr ? shopConfig.shopNameAr : shopConfig.shopNameEn}
                    </h3>
                    <p className={`text-[10px] mt-0.5 truncate ${themeTokens.textMuted}`}>
                      {isAr ? shopConfig.taglineAr : shopConfig.taglineEn}
                    </p>
                    <div className="inline-flex items-center gap-1 text-[9px] font-medium text-stone-500 dark:text-stone-400 mt-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-850">
                      <MapPin className="w-2.5 h-2.5 text-stone-400" />
                      <span>{shopConfig.locationLabel || (isAr ? 'الرياض • التوصيل لكافة الأحياء' : 'Riyadh delivery')}</span>
                    </div>
                  </div>

                  {/* Mini Search Mockup */}
                  <div className="pt-1">
                    <div className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-700/80 text-[10px] text-stone-400 flex items-center justify-between shadow-2xs">
                      <span>{isAr ? 'ابحث عن باقة، فازة، أو مناسبة...' : 'Search bouquets...'}</span>
                      <Search className="w-3 h-3 text-stone-400" />
                    </div>
                  </div>
                </div>

                {/* Mini Occasions Circles (if showStories !== false) */}
                {shopConfig.showStories !== false && (
                  <div className="px-3 py-2 border-b border-stone-200/40 dark:border-stone-800/40">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {occasions.slice(0, 4).map((occ) => (
                        <div key={occ.id} className="flex flex-col items-center gap-1 shrink-0">
                          <div
                            className="w-9 h-9 rounded-full p-0.5 ring-1.5 shadow-2xs overflow-hidden"
                            style={{ borderColor: themeTokens.primaryHex }}
                          >
                            <img
                              src={occ.image}
                              alt={occ.nameAr}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = './images/products/royal-red-roses.jpg';
                              }}
                            />
                          </div>
                          <span className={`text-[8px] font-bold truncate max-w-[42px] ${themeTokens.textMain}`}>
                            {isAr ? occ.nameAr : occ.nameEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mini Daily Specials (if showSpecials !== false) */}
                {shopConfig.showSpecials !== false && (
                  <div className="p-3 border-b border-stone-200/40 dark:border-stone-800/40">
                    <div className="flex items-center justify-between mb-1.5 text-[9px] font-bold">
                      <span className={themeTokens.textMain}>
                        {isAr ? 'جاهز للاستلام الفوري ❄️' : 'Ready Today Specials'}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] ${themeTokens.badge} ${themeTokens.textMain}`}>
                        {shopConfig.specialsStyle}
                      </span>
                    </div>
                    <div className={`p-2 rounded-xl border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between gap-2 shadow-2xs ${themeTokens.cardBg}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={products[0]?.image || products[0]?.imageUrl || './images/products/royal-red-roses.jpg'}
                          alt="Product"
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = './images/products/royal-red-roses.jpg';
                          }}
                        />
                        <div className="min-w-0">
                          <span className={`text-[10px] font-bold truncate block ${themeTokens.textMain}`}>
                            {isAr ? products[0]?.titleAr : products[0]?.titleEn}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            {products[0]?.price} {strings.sar}
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold px-2 py-1 rounded-full bg-stone-900 text-white shrink-0">
                        {isAr ? 'حجز فوري' : 'Reserve'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Mini Custom Order Banner (if showCustomBanner !== false) */}
                {shopConfig.showCustomBanner !== false && (
                  <div className="px-3 py-1.5">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 text-white flex items-center justify-between shadow-2xs">
                      <span className="text-[9px] font-bold">
                        {isAr ? '🎨 صمم باقتك الخاصة حسب ذوقك' : 'Custom Bouquet Designer'}
                      </span>
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold">
                        {isAr ? 'طلب خاص' : 'Bespoke'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Mini 2-Column Product Grid */}
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {products.slice(0, 2).map((prod) => (
                      <div
                        key={prod.id}
                        className={`p-1.5 rounded-xl border border-stone-200/60 dark:border-stone-800 shadow-2xs ${themeTokens.cardBg}`}
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-1.5 bg-stone-100">
                          <img
                            src={prod.image || prod.imageUrl || './images/products/royal-red-roses.jpg'}
                            alt={prod.titleAr}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = './images/products/royal-red-roses.jpg';
                            }}
                          />
                        </div>
                        <h5 className={`text-[9px] font-bold truncate ${themeTokens.textMain}`}>
                          {isAr ? prod.titleAr : prod.titleEn}
                        </h5>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[9px] font-bold ${themeTokens.textMain}`}>
                            {prod.price} {strings.sar}
                          </span>
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-2xs"
                            style={{ backgroundColor: themeTokens.primaryHex }}
                          >
                            +
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. STORE OPERATIONAL STATUS & SECTION TOGGLES */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                    {isAr ? 'الحالة التشغيلية وسرعة التجهيز' : 'Store Status & Order Speed'}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {isAr ? 'تحديث فوري يظهر للعملاء في أعلى المتجر والطلبات' : 'Updates live for shoppers at top of store'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Pills */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateShopConfig({ ...shopConfig, status: 'open_20m' });
                  triggerDesignFeedback(isAr ? '✨ تم ضبط الحالة: مفتوح • تجهيز فوري ٢٠ دقيقة!' : 'Status set to Open');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  shopConfig.status === 'open_20m'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span>{isAr ? 'مفتوح للطلبات' : 'Open'}</span>
                </div>
                <span className="text-[10px] block opacity-85 mt-0.5">
                  {isAr ? 'تجهيز فوري ٢٠ د' : '20 min prep'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateShopConfig({ ...shopConfig, status: 'busy_60m' });
                  triggerDesignFeedback(isAr ? '✨ تم ضبط الحالة: مشغول • تجهيز خلال ٦٠ دقيقة!' : 'Status set to Busy');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  shopConfig.status === 'busy_60m'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-300'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-300" />
                  <span>{isAr ? 'مشغول بالطلبات' : 'Busy'}</span>
                </div>
                <span className="text-[10px] block opacity-85 mt-0.5">
                  {isAr ? 'تجهيز ٦٠ دقيقة' : '60 min prep'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateShopConfig({ ...shopConfig, status: 'closed' });
                  triggerDesignFeedback(isAr ? '✨ تم ضبط الحالة: المتجر مغلق مؤقتاً!' : 'Status set to Closed');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  shopConfig.status === 'closed'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm ring-2 ring-stone-400'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  <span>{isAr ? 'مغلق مؤقتاً' : 'Closed'}</span>
                </div>
                <span className="text-[10px] block opacity-85 mt-0.5">
                  {isAr ? 'حجوزات فقط' : 'Bookings only'}
                </span>
              </button>
            </div>

            {/* Section Visibility Switches */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <span className="text-xs font-bold text-stone-800 block">
                {isAr ? 'إظهار وإخفاء أقسام المتجر الرئيسية بنقرة واحدة:' : 'Toggle Storefront Sections:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Switch 1: Stories */}
                <button
                  type="button"
                  onClick={() => {
                    const next = shopConfig.showStories === false ? true : false;
                    onUpdateShopConfig({ ...shopConfig, showStories: next });
                    triggerDesignFeedback(
                      next
                        ? (isAr ? '✨ تم إظهار قسم قصص المناسبات في المتجر!' : 'Stories section shown')
                        : (isAr ? '✨ تم إخفاء قسم قصص المناسبات من المتجر!' : 'Stories section hidden')
                    );
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-start transition-all cursor-pointer ${
                    shopConfig.showStories !== false
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-400 font-medium'
                  }`}
                >
                  <span className="text-xs flex items-center gap-1.5">
                    <span>🌸</span>
                    <span>{isAr ? 'قصص المناسبات' : 'Occasion Stories'}</span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    shopConfig.showStories !== false ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {shopConfig.showStories !== false ? (isAr ? 'مفعل ✓' : 'ON') : (isAr ? 'مخفي ✕' : 'OFF')}
                  </span>
                </button>

                {/* Switch 2: Cooler Specials */}
                <button
                  type="button"
                  onClick={() => {
                    const next = shopConfig.showSpecials === false ? true : false;
                    onUpdateShopConfig({ ...shopConfig, showSpecials: next });
                    triggerDesignFeedback(
                      next
                        ? (isAr ? '✨ تم إظهار شريط جاهز بالثلاجة في المتجر!' : 'Cooler specials shown')
                        : (isAr ? '✨ تم إخفاء شريط جاهز بالثلاجة من المتجر!' : 'Cooler specials hidden')
                    );
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-start transition-all cursor-pointer ${
                    shopConfig.showSpecials !== false
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-400 font-medium'
                  }`}
                >
                  <span className="text-xs flex items-center gap-1.5">
                    <span>❄️</span>
                    <span>{isAr ? 'باقات جاهزة بالثلاجة' : 'Ready Specials'}</span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    shopConfig.showSpecials !== false ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {shopConfig.showSpecials !== false ? (isAr ? 'مفعل ✓' : 'ON') : (isAr ? 'مخفي ✕' : 'OFF')}
                  </span>
                </button>

                {/* Switch 3: Custom Order Banner */}
                <button
                  type="button"
                  onClick={() => {
                    const next = shopConfig.showCustomBanner === false ? true : false;
                    onUpdateShopConfig({ ...shopConfig, showCustomBanner: next });
                    triggerDesignFeedback(
                      next
                        ? (isAr ? '✨ تم إظهار بانر التنسيق المخصص في المتجر!' : 'Custom banner shown')
                        : (isAr ? '✨ تم إخفاء بانر التنسيق المخصص من المتجر!' : 'Custom banner hidden')
                    );
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-start transition-all cursor-pointer ${
                    shopConfig.showCustomBanner !== false
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-400 font-medium'
                  }`}
                >
                  <span className="text-xs flex items-center gap-1.5">
                    <span>🎨</span>
                    <span>{isAr ? 'بانر التنسيق الخاص' : 'Custom Banner'}</span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    shopConfig.showCustomBanner !== false ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {shopConfig.showCustomBanner !== false ? (isAr ? 'مفعل ✓' : 'ON') : (isAr ? 'مخفي ✕' : 'OFF')}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. STORE LOGO & CURATED SEALS GALLERY */}
          <div className="rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                    <span>{isAr ? 'شعار وهوية المتجر (صورة الختم والأفاتار)' : 'Store Logo & Avatar Seal'}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/40">
                      {isAr ? 'سهل وفوري' : 'Easy 1-Tap'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {isAr ? 'اختر ختماً ملكياً جاهزاً بنقرة واحدة، أو ارفع صورتك الخاصة مباشرة' : 'Pick a curated luxury seal in 1 tap, or upload your custom logo'}
                  </p>
                </div>
              </div>

              {logoToast && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full animate-fade-in shadow-xs">
                  {logoToast}
                </span>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={logoFileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {/* Current Active Logo Banner */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-lg font-bold text-amber-100 shadow-md ring-2 ring-amber-400/60 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 shrink-0 overflow-hidden">
                  {shopConfig.avatarUrl || shopConfig.logoUrl ? (
                    <img
                      src={shopConfig.avatarUrl || shopConfig.logoUrl}
                      alt="Store Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>د.و</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-stone-900 block truncate">
                    {shopConfig.avatarUrl || shopConfig.logoUrl
                      ? (isAr ? 'شعار مخصص مفعل حالياً' : 'Active Custom Logo')
                      : (isAr ? 'الختم الملكي الافتراضي (د.و)' : 'Default Royal Seal')}
                  </span>
                  <span className="text-[10px] text-stone-500 block truncate mt-0.5">
                    {isAr ? 'يظهر في زاوية المتجر العلوية وكافة مشاركات الواتساب' : 'Shown at top header and WhatsApp slips'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isAr ? 'رفع صورة' : 'Upload'}</span>
                </button>
                {(shopConfig.avatarUrl || shopConfig.logoUrl) && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    title={isAr ? 'استعادة الختم الافتراضي' : 'Reset to default seal'}
                    className="p-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 1-Tap Curated Luxury Seals & Emblems (Makes adding logo effortless!) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? 'أختام وصور فاخرة جاهزة (بنقرة واحدة):' : '1-Tap Curated Luxury Seals:'}</span>
                </span>
                <span className="text-[10px] text-stone-400">
                  {isAr ? 'انقر لتطبيق الشعار فوراً' : 'Tap to apply instantly'}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CURATED_LOGO_OPTIONS.map((opt) => {
                  const isCurrent =
                    (!opt.url && !shopConfig.avatarUrl && !shopConfig.logoUrl) ||
                    (opt.url && (shopConfig.avatarUrl === opt.url || shopConfig.logoUrl === opt.url));

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleApplyCuratedLogo(opt.url)}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-400/50 scale-[1.02]'
                          : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50/30'
                      }`}
                    >
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-2xs shrink-0 flex items-center justify-center bg-stone-900 text-amber-300 font-serif font-bold text-xs">
                        {opt.url ? (
                          <img src={opt.url} alt={opt.titleAr} className="w-full h-full object-cover" />
                        ) : (
                          <span>د.و</span>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center">
                            <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-stone-800 truncate w-full block">
                        {isAr ? opt.titleAr : opt.titleEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Direct URL Option */}
            <form onSubmit={handleSaveLogoUrl} className="flex gap-1.5 items-center pt-1">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  placeholder={isAr ? 'أو الصق رابط صورة مباشر (URL)...' : 'Or paste direct image URL...'}
                  className="w-full py-2 px-3 text-xs rounded-xl bg-white border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!logoUrlInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                {isAr ? 'حفظ وتطبيق' : 'Apply'}
              </button>
            </form>
          </div>

          {/* 4. STORE IDENTITY, LOCATION & WHATSAPP */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                  {isAr ? 'بيانات وهوية المتجر ورقم الواتساب' : 'Store Identity & Contact Details'}
                </h4>
                <p className="text-[11px] text-stone-500">
                  {isAr ? 'أي تعديل هنا ينعكس فورياً على الموقع وواتساب' : 'Updates live on storefront and checkout'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isAr ? 'اسم المتجر بالعربي:' : 'Store Name (Arabic):'}
                </label>
                <input
                  type="text"
                  value={shopConfig.shopNameAr}
                  onChange={(e) => {
                    onUpdateShopConfig({ ...shopConfig, shopNameAr: e.target.value });
                  }}
                  placeholder="دار الورد للمناسبات"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isAr ? 'اسم المتجر بالإنجليزي:' : 'Store Name (English):'}
                </label>
                <input
                  type="text"
                  value={shopConfig.shopNameEn}
                  onChange={(e) => {
                    onUpdateShopConfig({ ...shopConfig, shopNameEn: e.target.value });
                  }}
                  placeholder="Maison des Fleurs"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isAr ? 'الشعار اللفظي والوصف الترحيبي (Tagline):' : 'Store Tagline / Bio:'}
                </label>
                <input
                  type="text"
                  value={shopConfig.taglineAr}
                  onChange={(e) => {
                    onUpdateShopConfig({ ...shopConfig, taglineAr: e.target.value });
                  }}
                  placeholder="أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isAr ? 'المدينة ونطاق التوصيل:' : 'Location / Delivery Area:'}
                </label>
                <input
                  type="text"
                  value={shopConfig.locationLabel || ''}
                  onChange={(e) => {
                    onUpdateShopConfig({ ...shopConfig, locationLabel: e.target.value });
                  }}
                  placeholder="الرياض • التوصيل لكافة الأحياء"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isAr ? 'رقم واتساب المنسق المباشر:' : 'Direct WhatsApp Number:'}
                </label>
                <input
                  type="text"
                  value={shopConfig.phone}
                  onChange={(e) => {
                    onUpdateShopConfig({ ...shopConfig, phone: e.target.value });
                  }}
                  placeholder="966500000000"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                />
              </div>
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
                      triggerDesignFeedback(
                        isAr
                          ? `✨ تم تفعيل وتثبيت قالب "${tmpl.nameAr}" فورياً على المتجر!`
                          : `✨ Template "${tmpl.nameEn}" applied and saved live!`
                      );
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
                      onClick={() => {
                        onUpdateShopConfig({
                          ...shopConfig,
                          theme: th.id,
                        });
                        triggerDesignFeedback(
                          isAr
                            ? `🎨 تم تفعيل هوية ألوان "${th.nameAr}" فورياً على المتجر!`
                            : `🎨 Theme "${th.name}" colors applied live!`
                        );
                      }}
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

          {/* 3. Shop Header Layout (Bespoke Interactive Visual Cards) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-amber-600" />
                <span>{isAr ? 'تنسيق ترويسة المتجر (Hero Layout):' : 'Shop Header Layout:'}</span>
              </label>
              <span className="text-[10px] text-stone-400 font-sans">
                {isAr ? 'اختر النمط البصري لهيدر متجرك' : 'Select storefront header aesthetic'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {HERO_STYLES.map((hero) => {
                const isActive = shopConfig.heroStyle === hero.id;
                return (
                  <motion.button
                    key={hero.id}
                    type="button"
                    whileHover={{ y: -3, transition: { duration: 0.18 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onUpdateShopConfig({
                        ...shopConfig,
                        heroStyle: hero.id,
                      });
                      triggerDesignFeedback(
                        isAr
                          ? `📐 تم تطبيق تنسيق الترويسة "${hero.nameAr}" فورياً!`
                          : `📐 Header layout "${hero.name}" applied live!`
                      );
                    }}
                    className={`relative p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between overflow-hidden group select-none ${
                      isActive
                        ? 'bg-gradient-to-br from-stone-950 via-[#181514] to-stone-950 text-white border-amber-400/50 shadow-md ring-1 ring-amber-400/25'
                        : 'bg-white hover:bg-[#FCFBF8] text-stone-800 border-stone-200/90 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Visual Schematic Header Miniature */}
                    <div className={`w-full h-13 rounded-xl mb-3 p-1.5 flex flex-col justify-between border transition-all ${
                      isActive ? 'bg-stone-900/90 border-amber-400/20' : 'bg-stone-50 border-stone-200/70 group-hover:bg-amber-50/20'
                    }`}>
                      {hero.id === 'qlub' && (
                        <div className="w-full h-full flex flex-col justify-between p-0.5">
                          <div className="flex items-center justify-between">
                            <div className={`w-4 h-4 rounded-md ${isActive ? 'bg-amber-400' : 'bg-stone-400'}`} />
                            <div className="flex gap-1">
                              <div className={`w-5 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-emerald-300'}`} />
                              <div className={`w-4 h-2 rounded-full ${isActive ? 'bg-amber-400' : 'bg-amber-300'}`} />
                            </div>
                          </div>
                          <div className={`w-3/5 mx-auto h-2 rounded-sm ${isActive ? 'bg-white' : 'bg-stone-700'}`} />
                          <div className={`w-full h-1.5 rounded-full ${isActive ? 'bg-stone-700' : 'bg-stone-200'}`} />
                        </div>
                      )}
                      {hero.id === 'editorial' && (
                        <div className="w-full h-full rounded-lg bg-gradient-to-b from-stone-700 via-stone-800 to-stone-950 flex flex-col justify-between p-1">
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80" />
                          <div className="w-3/4 mx-auto h-2 rounded-sm bg-amber-100" />
                          <div className="w-4/5 mx-auto h-1 rounded-full bg-stone-400/60" />
                        </div>
                      )}
                      {hero.id === 'minimal' && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full ${isActive ? 'bg-amber-400' : 'bg-stone-400'}`} />
                          <div className={`w-2/3 h-2 rounded-sm ${isActive ? 'bg-white' : 'bg-stone-700'}`} />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold font-serif">{isAr ? hero.nameAr : hero.name}</span>
                        {isActive && (
                          <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] leading-relaxed ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                        {isAr ? hero.descriptionAr : hero.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 4. Specials Showcase Animation Style (Executive Motion Cards) */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'نمط حركة "جاهز للاستلام اليوم" (Motion Style):' : '"Ready Today" Motion Style:'}</span>
              </label>
              <span className="text-[10px] text-stone-400 font-sans">
                {isAr ? 'حركة تفاعلية فائقة النعومة' : '60fps fluid showcase physics'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SPECIALS_STYLES.map((style) => {
                const isActive = shopConfig.specialsStyle === style.id;
                return (
                  <motion.button
                    key={style.id}
                    type="button"
                    whileHover={{ y: -2, transition: { duration: 0.18 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onUpdateShopConfig({
                        ...shopConfig,
                        specialsStyle: style.id,
                      });
                      triggerDesignFeedback(
                        isAr
                          ? `⚡ تم تطبيق نمط حركة الباقات "${style.nameAr}" فورياً!`
                          : `⚡ Specials motion "${style.name}" applied live!`
                      );
                    }}
                    className={`relative p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-3 overflow-hidden select-none ${
                      isActive
                        ? 'bg-gradient-to-br from-stone-950 via-[#181514] to-stone-950 text-white border-amber-400/50 shadow-md ring-1 ring-amber-400/25'
                        : 'bg-white hover:bg-[#FCFBF8] text-stone-800 border-stone-200/90 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Dynamic Style Icon Medallion */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 border-amber-300 shadow-xs'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {style.id === 'marquee' && <Play className={`w-4 h-4 fill-current ${isActive ? 'animate-pulse' : ''}`} />}
                      {style.id === 'coverflow' && <Layers className="w-4 h-4" />}
                      {style.id === 'spotlight' && <Sparkles className="w-4 h-4" />}
                      {style.id === 'editorial_deck' && <Layout className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-serif">{isAr ? style.nameAr : style.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                            {isAr ? 'مُفعّل' : 'Active'}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                        {style.id === 'marquee' && (isAr ? 'حركة انسيابية متصلة مستمرة بتدفق هادئ' : 'Smooth infinite gliding loop')}
                        {style.id === 'coverflow' && (isAr ? 'تركيز ثلاثي الأبعاد بتأثير عمق سينمائي' : '3D depth snapping with focus')}
                        {style.id === 'spotlight' && (isAr ? 'منصة عرض متباينة تبرز كل قطعة بفخامة' : 'High-contrast staged spotlight')}
                        {style.id === 'editorial_deck' && (isAr ? 'بطاقة عريضة بتنسيق مجلات الأزياء' : 'Full-bleed luxury magazine split card')}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 4.5 Card Animations & Physics (أنيميشن وحركات وفيزياء بطاقات المنتجات) */}
          <div className="space-y-3 pt-3 border-t border-stone-200/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs sm:text-sm font-bold font-serif text-stone-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'أنيميشن وحركات بطاقات المنتجات (Card Animations):' : 'Card Animations & Physics:'}</span>
                </label>
                <p className="text-[11px] text-stone-500 mt-0.5 font-sans">
                  {isAr ? 'اختر نمط ظهور البطاقات، وفيزياء زر الشراء، وتفاعل التمرير' : 'Card entrance motion, buy button physics & hover effect'}
                </p>
              </div>
              {onOpenDesignStudio && (
                <button
                  type="button"
                  onClick={onOpenDesignStudio}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                >
                  {isAr ? '⚡ تخصيص متقدم في الاستوديو' : 'Advanced Studio'}
                </button>
              )}
            </div>

            {/* A. Entrance Motion - 5 quick presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-700 block">
                {isAr ? 'أنيميشن دخول وظهور البطاقات:' : 'Card Entrance Motion:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                {[
                  { id: 'fade_up', label: isAr ? 'انسياب للأعلى' : 'Fade Up' },
                  { id: 'elastic_scale', label: isAr ? 'تمدد مرن' : 'Elastic' },
                  { id: 'waterfall_drop', label: isAr ? 'شلال متساقط 💧' : 'Waterfall' },
                  { id: 'spiral_bloom', label: isAr ? 'تفتح لولبي 🌸' : 'Spiral Bloom' },
                  { id: 'cinematic_zoom', label: isAr ? 'زووم سينمائي 🎬' : 'Cinematic' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onUpdateShopConfig({ ...shopConfig, cardEntranceMotion: m.id });
                      triggerDesignFeedback(isAr ? `⚡ تم تفعيل حركة الدخول: ${m.label}` : `Entrance: ${m.label}`);
                    }}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      (shopConfig.cardEntranceMotion || 'fade_up') === m.id
                        ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* B. Buy Button Physics - 5 quick presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-700 block">
                {isAr ? 'فيزياء وتأثير زر الشراء:' : 'Buy Button Physics:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                {[
                  { id: 'fly_to_cart', label: isAr ? 'طيران للسلة 🌸' : 'Fly to Cart' },
                  { id: 'sparkle_burst', label: isAr ? 'نجوم ذهبية ✨' : 'Sparkles' },
                  { id: 'flower_bloom', label: isAr ? 'تفتح ورد 🌺' : 'Bloom' },
                  { id: 'confetti_shower', label: isAr ? 'مطر احتفال 🎉' : 'Confetti' },
                  { id: 'golden_stamp', label: isAr ? 'ختم ملكي 👑' : 'Wax Stamp' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onUpdateShopConfig({ ...shopConfig, buyButtonPhysics: b.id });
                      triggerDesignFeedback(isAr ? `⚡ تم تفعيل فيزياء الزر: ${b.label}` : `Physics: ${b.label}`);
                    }}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      (shopConfig.buyButtonPhysics || 'morph_checkmark') === b.id
                        ? 'bg-[#7E1529] text-white border-[#7E1529] font-bold shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* C. Card Hover Effect - 5 quick presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-700 block">
                {isAr ? 'تأثير التمرير (Hover):' : 'Card Hover Effect:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                {[
                  { id: 'zoom_soft', label: isAr ? 'تكبير ناعم' : 'Zoom' },
                  { id: 'tilt_3d', label: isAr ? 'ميلان ثلاثي الأبعاد' : '3D Tilt' },
                  { id: 'border_beam', label: isAr ? 'شعاع إطار ✨' : 'Border Beam' },
                  { id: 'crystal_glass', label: isAr ? 'موشور بلوري 💎' : 'Crystal' },
                  { id: 'spotlight_glow', label: isAr ? 'كشاف تفاعلي 🔦' : 'Spotlight' },
                ].map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      onUpdateShopConfig({ ...shopConfig, cardHoverEffect: h.id });
                      triggerDesignFeedback(isAr ? `⚡ تم تفعيل تأثير التمرير: ${h.label}` : `Hover: ${h.label}`);
                    }}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      (shopConfig.cardHoverEffect || 'zoom_soft') === h.id
                        ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Occasion Stories Manager (Ultra-Luxury Stories Studio) */}
          <div className="space-y-3.5 pt-3 border-t border-stone-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-bold font-serif text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'إدارة قصص المناسبات والتصنيفات (Stories Manager):' : 'Occasion Stories Manager:'}</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300/70 shadow-2xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{occasions.filter((o) => o.isVisible !== false).length} {isAr ? 'معروضة' : 'active'}</span>
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 font-sans">
                  {isAr
                    ? 'التحكم التفاعلي بالدوائر العلوية، إخفاء/إظهار، وإضافة قصص مخصصة'
                    : 'Manage interactive top circles, toggle visibility, and add new stories'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onResetOccasions && (
                  <button
                    type="button"
                    onClick={onResetOccasions}
                    title={isAr ? 'استعادة الافتراضي' : 'Reset to Default'}
                    className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all text-xs cursor-pointer shadow-2xs active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddingStoryFormOpen(!isAddingStoryFormOpen)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                    isAddingStoryFormOpen
                      ? 'bg-stone-200 text-stone-800'
                      : 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 hover:from-stone-900 text-amber-200 border border-amber-400/40 shadow-xs hover:shadow-md ring-1 ring-amber-400/20'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? '+ قصة مناسبة' : '+ New Story'}</span>
                </button>
              </div>
            </div>

            {/* Inline Add New Story Form */}
            {isAddingStoryFormOpen && (
              <form
                onSubmit={handleSubmitNewStory}
                className="p-4 rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#FBF8F2] border border-amber-400/40 space-y-3.5 shadow-sm animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                  <span className="text-xs font-bold font-serif text-stone-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>{isAr ? 'إنشاء قصة مناسبة جديدة للمتجر' : 'Create New Occasion Story'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingStoryFormOpen(false)}
                    className="text-stone-400 hover:text-stone-700 cursor-pointer p-1 rounded-full hover:bg-stone-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
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
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Image Selection Presets */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-700 block">
                    {isAr ? 'صورة الغلاف الدائرية (اختر من الصور المعتمدة أو ارفع صورة):' : 'Cover Image (Select preset or upload):'}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                          className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 scale-105 shadow-md ring-2 ring-amber-400/40'
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
                    className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-600" />
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
                    className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Preview and Submit */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 bg-stone-100 shadow-xs ring-2 ring-amber-400/20">
                      <img
                        src={storyFormUploadedImage || storyFormImage || VERIFIED_FLORAL_PRESETS[0]?.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-bold text-stone-800 font-serif">
                      {storyFormNameAr || (isAr ? 'معاينة القصة' : 'Story Preview')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingStoryFormOpen(false)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      {isAr ? 'إضافة ونشر' : 'Add Story'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List of Existing Stories (High-End Tactile Cards) */}
            <div className="space-y-2">
              <AnimatePresence>
                {occasions.map((occ) => {
                  const isVisible = occ.isVisible !== false;
                  const isProtected = occ.id === 'specials' || occ.id === 'all';

                  return (
                    <motion.div
                      key={occ.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2, transition: { duration: 0.16 } }}
                      className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                        isVisible
                          ? 'bg-gradient-to-r from-white via-[#FCFBF8] to-white border-stone-200/90 shadow-[0_2px_8px_rgba(28,25,23,0.03)] hover:shadow-md hover:border-amber-400/40'
                          : 'bg-stone-100/70 border-stone-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Story Ring Avatar (Instagram/Floward VIP Style) */}
                        <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                          isVisible
                            ? occ.id === 'specials'
                              ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 ring-2 ring-amber-400/20 shadow-xs'
                            : 'bg-stone-300'
                        }`}>
                          <div className="w-full h-full rounded-full overflow-hidden bg-stone-100">
                            <img
                              src={occ.image}
                              alt={occ.nameAr}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = './images/products/royal-red-roses.jpg';
                              }}
                            />
                            {!isVisible && (
                              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center text-white rounded-full">
                                <EyeOff className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold font-serif text-stone-900 truncate">
                              {isAr ? occ.nameAr : occ.nameEn}
                            </span>
                            {occ.id === 'specials' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 flex items-center gap-1 shadow-2xs font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                <span>{isAr ? 'جاهز للاستلام والتوصيل الفوري' : 'Live Cooler'}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5 font-sans">
                            <span className="font-mono text-stone-400">✦ {occ.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Intuitive Tactile Visibility Switch (iOS Quiet Luxury) */}
                        {onToggleOccasionVisibility && (
                          <button
                            type="button"
                            onClick={() => onToggleOccasionVisibility(occ.id)}
                            className="flex items-center gap-2 group cursor-pointer select-none py-1 px-1.5 rounded-xl hover:bg-stone-100/60 transition-colors"
                            title={isVisible ? (isAr ? 'إخفاء القصة من المتجر' : 'Hide Story') : (isAr ? 'إظهار القصة في المتجر' : 'Show Story')}
                          >
                            <span className={`text-[11px] font-bold transition-colors hidden sm:inline ${isVisible ? 'text-emerald-700' : 'text-stone-400'}`}>
                              {isVisible ? (isAr ? 'معروضة' : 'Visible') : (isAr ? 'مخفية' : 'Hidden')}
                            </span>
                            <div
                              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                                isVisible ? 'bg-emerald-600' : 'bg-stone-300'
                              }`}
                            >
                              <div
                                className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transform transition-transform duration-200 flex items-center justify-center ${
                                  isVisible ? (isAr ? '-translate-x-4.5' : 'translate-x-4.5') : 'translate-x-0'
                                }`}
                              >
                                {isVisible ? (
                                  <Eye className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <EyeOff className="w-2.5 h-2.5 text-stone-400" />
                                )}
                              </div>
                            </div>
                          </button>
                        )}

                        {/* Delete Story Button */}
                        {onDeleteOccasion && !isProtected && (
                          <button
                            type="button"
                            onClick={() => onDeleteOccasion(occ.id)}
                            title={isAr ? 'حذف القصة' : 'Delete Story'}
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isProtected && (
                          <span className="p-1.5 text-stone-400 select-none text-[10px] flex items-center gap-1 font-mono" title={isAr ? 'عنصر أساسي بالنظام' : 'System protected'}>
                            <Lock className="w-3 h-3 text-stone-400" />
                            <span className="hidden sm:inline">{isAr ? 'أساسي' : 'Locked'}</span>
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
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
