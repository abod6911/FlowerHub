import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Plus,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  Sparkles,
  Search,
  Sliders,
  Trash2,
  Edit3,
  Globe,
  Share2,
  QrCode,
  X,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  getAllStores,
  saveStore,
  deleteStore,
  getStoreGoogleMapsUrl,
  getStoreDirectShareUrl,
  normalizePhone,
  normalizeSlug,
} from '../utils/storesManager';

const THEME_OPTIONS = [
  { id: 'botanical', nameAr: 'طبيعي بوتانيكال (زيتوني وذهبي)', bg: 'bg-[#F4F1EA] text-[#2C3E2D]' },
  { id: 'royalNoir', nameAr: 'ملكي نوار (أسود فاحم وذهب عيار 24)', bg: 'bg-[#121212] text-amber-200' },
  { id: 'roseGold', nameAr: 'روز قولد فاخر (وردي ناعم وأنيق)', bg: 'bg-[#FFF5F5] text-[#832729]' },
  { id: 'parisianSilk', nameAr: 'حرير باريسي (كريمي وأوف وايت هادئ)', bg: 'bg-[#FAF8F5] text-stone-800' },
  { id: 'emeraldLuxe', nameAr: 'زمردي فاخر (أخضر زمردي عميق)', bg: 'bg-[#06241D] text-emerald-200' },
  { id: 'minimal', nameAr: 'مينيمال معاصر (أبيض وأسود صريح)', bg: 'bg-white text-stone-900' },
];

export default function MultiStoreManagerPage({
  lang = 'ar',
  onClose,
  onSwitchToStore,
  onOpenStoreAdmin,
  activeStoreId,
}) {
  const isAr = lang === 'ar';
  const [stores, setStores] = useState(() => getAllStores());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);
  const [qrModalStore, setQrModalStore] = useState(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  // Form State
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPhone, setFormPhone] = useState('966500000000');
  const [formCity, setFormCity] = useState('الرياض');
  const [formDistrict, setFormDistrict] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTaglineAr, setFormTaglineAr] = useState('');
  const [formTaglineEn, setFormTaglineEn] = useState('');
  const [formTheme, setFormTheme] = useState('botanical');
  const [formGoogleMapsUrl, setFormGoogleMapsUrl] = useState('');
  const [formStatus, setFormStatus] = useState('open');
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [storeToDelete, setStoreToDelete] = useState(null);

  // Unique Cities List
  const cities = useMemo(() => {
    const list = Array.from(new Set(stores.map((s) => s.city).filter(Boolean)));
    return ['all', ...list];
  }, [stores]);

  // Filtered Stores
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchCity = selectedCity === 'all' || s.city === selectedCity;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        s.nameAr?.toLowerCase().includes(q) ||
        s.nameEn?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.district?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.slug?.toLowerCase().includes(q);
      return matchCity && matchQuery;
    });
  }, [stores, selectedCity, searchQuery]);

  // Copy to clipboard helper
  const handleCopyLink = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2200);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingStore(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormSlug('');
    setFormPhone('966500000000');
    setFormCity('الرياض');
    setFormDistrict('');
    setFormAddress('');
    setFormTaglineAr('أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب');
    setFormTaglineEn('Luxury artisanal blooms & curated floral gifts');
    setFormTheme('botanical');
    setFormGoogleMapsUrl('');
    setFormStatus('open');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (store) => {
    setEditingStore(store);
    setFormNameAr(store.nameAr || '');
    setFormNameEn(store.nameEn || '');
    setFormSlug(store.slug || '');
    setFormPhone(store.phone || '');
    setFormCity(store.city || 'الرياض');
    setFormDistrict(store.district || '');
    setFormAddress(store.address || '');
    setFormTaglineAr(store.taglineAr || '');
    setFormTaglineEn(store.taglineEn || '');
    setFormTheme(store.theme || 'botanical');
    setFormGoogleMapsUrl(store.googleMapsUrl || '');
    setFormStatus(store.status || 'open');
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Store Submit Handler
  const handleSaveStoreSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formNameAr.trim()) {
      setFormError(isAr ? 'فضلاً أدخل اسم المتجر بالعربي' : 'Please enter Arabic store name');
      return;
    }

    const cleanPhone = normalizePhone(formPhone);
    if (!cleanPhone || cleanPhone.length < 9) {
      setFormError(isAr ? 'رقم الواتساب غير صالح (مثال: 966501234567)' : 'Invalid WhatsApp phone number');
      return;
    }

    const storePayload = {
      id: editingStore ? editingStore.id : undefined,
      nameAr: formNameAr,
      nameEn: formNameEn || formNameAr,
      slug: formSlug || normalizeSlug(formNameEn || formNameAr),
      phone: cleanPhone,
      city: formCity || 'الرياض',
      district: formDistrict,
      address: formAddress,
      taglineAr: formTaglineAr,
      taglineEn: formTaglineEn,
      theme: formTheme,
      googleMapsUrl: formGoogleMapsUrl,
      status: formStatus,
      isPrimary: editingStore ? editingStore.isPrimary : false,
      ordersCount: editingStore ? editingStore.ordersCount : 0,
      rating: editingStore ? editingStore.rating : '5.0',
    };

    const res = saveStore(storePayload);
    if (res.success) {
      setStores(res.allStores);
      setIsModalOpen(false);
      setEditingStore(null);
    } else {
      setFormError(res.error || (isAr ? 'حدث خطأ أثناء حفظ المتجر' : 'Error saving store'));
    }
  };

  // Delete Store Action
  const handleConfirmDelete = () => {
    if (!storeToDelete) return;
    const res = deleteStore(storeToDelete.id);
    if (res.success) {
      setStores(res.allStores);
      setStoreToDelete(null);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col font-sans select-none pb-24">
      {/* 1. Master Security Navigation Bar */}
      <header className="sticky top-0 z-40 bg-stone-950 text-white px-4 sm:px-6 py-3.5 border-b border-stone-800 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-stone-950 flex items-center justify-center font-serif font-black text-lg shadow-md shrink-0">
              <Building2 className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-black text-sm sm:text-base text-amber-100 tracking-wide">
                  {isAr ? 'منصة إدارة شبكة المتاجر والفروع' : 'Multi-Store Network Platform'}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {isAr ? 'مشفر • لوحة المؤسس' : 'Encrypted Platform'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {isAr
                  ? 'أنشئ متاجر غير محدودة، وأعطِ كل متجر رابط طلب مخصص لتضمينه في خرائط قوقل (Google Maps).'
                  : 'Create unlimited bespoke branches with dedicated Google Maps online order URLs.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? '+ إنشاء متجر جديد' : '+ Create Store'}</span>
            </button>

            {onOpenStoreAdmin && (
              <button
                type="button"
                onClick={onOpenStoreAdmin}
                className="py-2 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 text-amber-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title={isAr ? 'لوحة تحكم المتجر والمنسق' : 'Store Admin'}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isAr ? 'لوحة المنسق' : 'Store Admin'}</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title={isAr ? 'الرجوع لمعاينة المتجر' : 'Back to Store'}
              >
                <Store className="w-3.5 h-3.5 text-stone-300" />
                <span>{isAr ? 'الرجوع للمتجر ↩️' : 'Storefront ↩️'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Platform Workspace */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Statistics & Health Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium block">
                {isAr ? 'إجمالي المتاجر' : 'Total Stores'}
              </span>
              <span className="text-xl font-serif font-black text-stone-900">{stores.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium block">
                {isAr ? 'المتاجر النشطة' : 'Active Stores'}
              </span>
              <span className="text-xl font-serif font-black text-emerald-700">
                {stores.filter((s) => s.status === 'open').length}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium block">
                {isAr ? 'روابط قوقل ماب الجاهزة' : 'Google Maps Links'}
              </span>
              <span className="text-xl font-serif font-black text-sky-800">{stores.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium block">
                {isAr ? 'المدن المغطاة' : 'Cities Covered'}
              </span>
              <span className="text-xl font-serif font-black text-stone-900">
                {cities.length > 1 ? cities.length - 1 : 1}
              </span>
            </div>
          </div>
        </div>

        {/* Google Maps How-To Visual Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white shadow-lg border border-stone-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center justify-center shrink-0 shadow-inner">
                <MapPin className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100 flex items-center gap-2">
                  <span>{isAr ? 'كيف تضيف رابط المتجر على حساب الفرع في خرائط قوقل (Google Maps)؟' : 'How to add your Order Link to Google Maps Business Profile?'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 font-bold">
                    3 خطوات
                  </span>
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
                  {isAr
                    ? 'لكل متجر تنشئه هنا رابط مخصص ونظيف. انسخ الرابط وافتحه في حسابك في (Google Business Profile) وضعه في خانة «رابط الطلب عبر الإنترنت - Order Online». سيظهر زر بارز لكل من يبحث عن فرعك ليطلب أزهاره فوراً ويصل الطلب لواتساب المحل!'
                    : 'Each store below has its dedicated link. Copy it into Google Business Profile under "Order Online" to let nearby customers purchase directly from Google Maps to WhatsApp!'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer shrink-0 self-start lg:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? 'إنشاء متجر جديد الآن' : 'Create New Store'}</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث باسم المتجر، المدينة، أو رقم الواتساب...' : 'Search by store name, city, or phone...'}
              className="w-full ps-9.5 pe-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium placeholder:text-stone-400 focus:bg-white focus:border-amber-400 outline-none transition-all"
            />
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-stone-950 text-white shadow-xs font-bold'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {city === 'all' ? (isAr ? 'جميع المدن' : 'All Cities') : city}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStores.map((store) => {
            const gmapsUrl = getStoreGoogleMapsUrl(store.slug);
            const directUrl = getStoreDirectShareUrl(store.slug);
            const isCopiedGmaps = copiedKey === `gmaps-${store.id}`;
            const isCopiedDirect = copiedKey === `direct-${store.id}`;
            const isCurrentlyActive = activeStoreId === store.id || (store.isPrimary && !activeStoreId);

            return (
              <div
                key={store.id}
                className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isCurrentlyActive
                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                    : 'border-stone-200/90 hover:border-amber-300'
                }`}
              >
                {/* Store Card Header */}
                <div className="p-5 pb-4 border-b border-stone-100 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-amber-300 flex items-center justify-center font-serif font-black text-sm border border-stone-700 shadow-inner shrink-0">
                        {store.nameAr ? store.nameAr.slice(0, 2) : 'ور'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-tight">
                            {store.nameAr}
                          </h3>
                          {store.isPrimary && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              {isAr ? 'الرئيسي' : 'Primary'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 font-mono block">
                          {store.nameEn}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                        store.status === 'open'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border border-rose-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          store.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`}
                      />
                      <span>{store.status === 'open' ? (isAr ? 'مفتوح للطلب' : 'Open') : (isAr ? 'مغلق مؤقتاً' : 'Closed')}</span>
                    </span>
                  </div>

                  {/* Location & Contact Info */}
                  <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50/80 p-3 rounded-2xl border border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold text-stone-800">{store.city}</span>
                      <span className="text-stone-300">•</span>
                      <span className="truncate">{store.district}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-stone-700">{store.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open(`https://wa.me/${store.phone}`, '_blank')}
                        className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        {isAr ? 'محادثة واتساب 💬' : 'Chat'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Google Maps Link Box */}
                <div className="p-4 bg-gradient-to-b from-stone-50/50 to-stone-100/50 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isAr ? 'رابط الفرع لخرائط قوقل (Google Maps):' : 'Google Maps Online Order Link:'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      ?store={store.slug}
                    </span>
                  </div>

                  {/* Read-only URL box with 1-Click Copy */}
                  <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-stone-200 shadow-inner">
                    <input
                      type="text"
                      readOnly
                      value={gmapsUrl}
                      className="flex-1 bg-transparent px-2.5 py-1 text-[11px] font-mono text-stone-600 outline-none truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink(gmapsUrl, `gmaps-${store.id}`)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                        isCopiedGmaps
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 hover:bg-stone-800 text-amber-300'
                      }`}
                      title={isAr ? 'نسخ رابط قوقل ماب' : 'Copy Link'}
                    >
                      {isCopiedGmaps ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isAr ? 'نسخ قوقل ماب' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between gap-1.5 pt-2">
                    <div className="flex items-center gap-1">
                      {/* Launch / Switch Store View */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchToStore) onSwitchToStore(store);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300/80 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        title={isAr ? 'فتح وتصفح هذا المتجر الآن' : 'Launch Store'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isAr ? 'معاينة المتجر' : 'Launch'}</span>
                      </button>

                      {/* Direct Share Link */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(directUrl, `direct-${store.id}`)}
                        className={`p-1.5 rounded-xl border text-xs transition-all active:scale-95 cursor-pointer ${
                          isCopiedDirect
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'border-stone-200 hover:bg-white text-stone-700'
                        }`}
                        title={isAr ? 'نسخ رابط مباشر للمتجر' : 'Copy Direct Link'}
                      >
                        {isCopiedDirect ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(store)}
                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-white text-stone-700 active:scale-95 transition-all cursor-pointer"
                        title={isAr ? 'تعديل بيانات المتجر' : 'Edit Store'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button (disabled for primary) */}
                      {!store.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setStoreToDelete(store)}
                          className="p-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
                          title={isAr ? 'حذف المتجر' : 'Delete Store'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredStores.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-6">
            <Store className="w-12 h-12 text-stone-300 mx-auto" />
            <h4 className="font-serif font-bold text-base text-stone-800">
              {isAr ? 'لا توجد متاجر تطابق بحثك' : 'No stores match your search'}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {isAr ? 'جرّب البحث باسم آخر أو أنشئ متجراً جديداً في شبكتك.' : 'Try another query or create a new store.'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="py-2 px-4 rounded-xl bg-stone-900 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إنشاء متجر جديد' : 'Create Store'}</span>
            </button>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: CREATE OR EDIT STORE MODAL                         */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="bg-stone-950 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-amber-100">
                      {editingStore
                        ? isAr
                          ? `تعديل متجر: ${editingStore.nameAr}`
                          : `Edit Store: ${editingStore.nameEn}`
                        : isAr
                        ? 'إنشاء متجر جديد في المشروع'
                        : 'Create New Store'}
                    </h3>
                    <span className="text-[11px] text-stone-400 block">
                      {isAr ? 'سيتم توليد رابط مخصص لتضمينه في حساب قوقل ماب' : 'Dedicated link will be generated for Google Maps'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveStoreSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Store Names */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-stone-900 block font-serif">
                    {isAr ? '1. اسم وهوية المتجر:' : '1. Store Identity:'}
                  </span>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {isAr ? 'اسم المتجر بالعربي *' : 'Store Name (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formNameAr}
                      onChange={(e) => {
                        setFormNameAr(e.target.value);
                        if (!editingStore && !formSlug) {
                          setFormSlug(normalizeSlug(e.target.value));
                        }
                      }}
                      placeholder={isAr ? 'مثال: روزانا بوتيك للأزهار' : 'e.g. Rosana Flowers'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {isAr ? 'اسم المتجر بالإنجليزي' : 'Store Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={formNameEn}
                        onChange={(e) => {
                          setFormNameEn(e.target.value);
                          if (!editingStore && !formSlug) {
                            setFormSlug(normalizeSlug(e.target.value));
                          }
                        }}
                        placeholder="e.g. Rosana Floral Boutique"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {isAr ? 'المعرّف النظيف للرابط (Slug) *' : 'URL Slug *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formSlug}
                        onChange={(e) => setFormSlug(normalizeSlug(e.target.value))}
                        placeholder="e.g. rosana-boutique"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 outline-none font-mono"
                      />
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {isAr ? 'سيظهر في الرابط: ?store=' + (formSlug || 'name') : 'Will appear as: ?store=' + (formSlug || 'name')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact & Location */}
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <span className="text-xs font-bold text-stone-900 block font-serif">
                    {isAr ? '2. الواتساب وموقع الفرع:' : '2. Contact & Location:'}
                  </span>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {isAr ? 'رقم الواتساب لاستقبال الطلبات *' : 'WhatsApp Number (Receiving Orders) *'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-600 absolute start-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="966500000000"
                        className="w-full ps-9.5 pe-4 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:border-amber-500 outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {isAr ? 'جميع طلبات الزبائن من هذا المتجر ستصل مباشرة لهذا الرقم' : 'All orders will be routed to this WhatsApp'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {isAr ? 'المدينة *' : 'City *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder={isAr ? 'الرياض' : 'Riyadh'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {isAr ? 'الحي أو المنطقة' : 'District'}
                      </label>
                      <input
                        type="text"
                        value={formDistrict}
                        onChange={(e) => setFormDistrict(e.target.value)}
                        placeholder={isAr ? 'حي النرجس' : 'Al-Narjis'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {isAr ? 'العنوان التفصيلي للفرع' : 'Branch Address Details'}
                    </label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder={isAr ? 'شارع الملك فهد، مجمع البوليفارد' : 'King Fahd Road, Boulevard Complex'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Section 3: Theme & Status */}
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <span className="text-xs font-bold text-stone-900 block font-serif">
                    {isAr ? '3. التصميم وحالة المتجر:' : '3. Theme & Status:'}
                  </span>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {isAr ? 'نمط وألوان واجهة المتجر' : 'Store Theme & Palette'}
                    </label>
                    <select
                      value={formTheme}
                      onChange={(e) => setFormTheme(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium bg-white focus:border-amber-500 outline-none cursor-pointer"
                    >
                      {THEME_OPTIONS.map((th) => (
                        <option key={th.id} value={th.id}>
                          {th.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {isAr ? 'حالة المتجر واستقبال الطلبات' : 'Store Status'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormStatus('open')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          formStatus === 'open'
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        {isAr ? 'مفتوح للطلبات 🟢' : 'Open for Orders 🟢'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormStatus('closed')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          formStatus === 'closed'
                            ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        {isAr ? 'مغلق مؤقتاً 🔴' : 'Temporarily Closed 🔴'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-all cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{editingStore ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إنشاء المتجر وتوليد الرابط' : 'Create & Generate Link')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {storeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  {isAr ? 'تأكيد حذف المتجر؟' : 'Confirm Store Deletion?'}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  {isAr
                    ? `هل أنت متأكد من حذف «${storeToDelete.nameAr}»؟ سيتوقف الرابط المخصص له عن العمل.`
                    : `Are you sure you want to delete "${storeToDelete.nameEn}"?`}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStoreToDelete(null)}
                  className="py-2 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
                >
                  {isAr ? 'تراجع' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                >
                  {isAr ? 'نعم، احذف المتجر' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
