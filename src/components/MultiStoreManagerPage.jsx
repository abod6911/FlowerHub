import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Store,
  Plus,
  MapPin,
  Copy,
  Check,
  ShieldCheck,
  Search,
  Sliders,
  Trash2,
  Edit3,
  Globe,
  QrCode,
  X,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  KeyRound,
  Wand2,
  Upload,
  Lock,
  PauseCircle,
  PlayCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import {
  getAllStores,
  provisionStoreWithAccount,
  deleteStore,
  toggleStoreAccountStatus,
  rotateStorePassword,
  getStoreGoogleMapsUrl,
  getStorePortableShareUrl,
  getStoreOwnerAdminInviteUrl,
  normalizeSlug,
} from '../utils/storesManager';
import {
  generateStrongPassword,
  evaluatePasswordStrength,
  getAuditLogs,
} from '../services/authService';
import { rotateSuperAdminPassword } from './AdminAuthGuard';
import { validateUploadedFile } from '../services/uploadSecurity';
import { generateCsrfToken } from '../utils/csrf';

const THEME_OPTIONS = [
  { id: 'botanical', nameAr: 'نباتي فاخر', nameEn: 'Botanical', swatch: '#022C22', bg: '#FAF8F5' },
  { id: 'velvet', nameAr: 'مخمل بورغندي', nameEn: 'Velvet', swatch: '#4C0519', bg: '#FDFBF9' },
  { id: 'noir', nameAr: 'أسود ملكي', nameEn: 'Noir Gold', swatch: '#0F0E0D', bg: '#18181B' },
  { id: 'minimal', nameAr: 'كلاسيك أبيض', nameEn: 'Minimal', swatch: '#292524', bg: '#FFFFFF' },
];

export default function MultiStoreManagerPage({
  lang = 'ar',
  onToggleLang,
  onClose,
  onOpenStoreAdmin,
  onSwitchToStore,
}) {
  const isAr = lang === 'ar';

  const [stores, setStores] = useState(() => getAllStores());
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'security'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);
  const [csrfToken, setCsrfToken] = useState(() => generateCsrfToken());

  // QR Modal
  const [qrModalStore, setQrModalStore] = useState(null);
  const [qrMode, setQrMode] = useState('portable'); // 'portable' | 'admin' | 'gmaps'
  const [qrSvg, setQrSvg] = useState('');

  // Streamlined 2-Step Store + Owner Builder Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formStep, setFormStep] = useState('store'); // 'store' | 'owner'
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Essential Store Form Fields
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSlugTouched, setFormSlugTouched] = useState(false);
  const [formWhatsapp, setFormWhatsapp] = useState('966500000000');
  const [formCity, setFormCity] = useState('الرياض');
  const [formDeliveryFee, setFormDeliveryFee] = useState('25');
  const [formTheme, setFormTheme] = useState('botanical');
  const [formLogoUrl, setFormLogoUrl] = useState('');

  // Optional Advanced Fields (collapsed by default)
  const [formTaglineAr, setFormTaglineAr] = useState('');
  const [formTaglineEn, setFormTaglineEn] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formWorkingHours, setFormWorkingHours] = useState('09:00 AM - 11:30 PM');
  const [formMinFreeDelivery, setFormMinFreeDelivery] = useState('300');
  const [formCrNumber, setFormCrNumber] = useState('');
  const [formVatNumber, setFormVatNumber] = useState('');
  const [formGoogleMapsUrl, setFormGoogleMapsUrl] = useState('');
  const [formInstagramUrl, setFormInstagramUrl] = useState('');
  const [formHeroStyle, setFormHeroStyle] = useState('qlub');
  const [formDefaultLang, setFormDefaultLang] = useState('ar');

  // Owner Account Fields
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formOwnerUsername, setFormOwnerUsername] = useState('');
  const [formOwnerEmail, setFormOwnerEmail] = useState('');
  const [formOwnerPhone, setFormOwnerPhone] = useState('966500000000');
  const [formAccountStatus, setFormAccountStatus] = useState('active');
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Ready-to-Share Credential & Links Handoff Modal
  const [handoffInfo, setHandoffInfo] = useState(null);

  // Rotate Store Password Modal
  const [rotateTargetStore, setRotateTargetStore] = useState(null);
  const [rotatePwdInput, setRotatePwdInput] = useState('');
  const [rotateError, setRotateError] = useState('');

  // Super Admin Password Rotation State
  const [saCurrentPwd, setSaCurrentPwd] = useState('');
  const [saNewPwd, setSaNewPwd] = useState('');
  const [saStatusMsg, setSaStatusMsg] = useState({ type: '', text: '' });

  const refreshAuditLogs = () => setAuditLogs(getAuditLogs());

  const qrTargetUrl = useMemo(() => {
    if (!qrModalStore) return '';
    if (qrMode === 'admin') return getStoreOwnerAdminInviteUrl(qrModalStore);
    if (qrMode === 'gmaps') return getStoreGoogleMapsUrl(qrModalStore.slug);
    return getStorePortableShareUrl(qrModalStore);
  }, [qrModalStore, qrMode]);

  useEffect(() => {
    let active = true;
    if (!qrTargetUrl) {
      return () => {
        active = false;
      };
    }
    QRCode.toString(qrTargetUrl, {
      type: 'svg',
      margin: 2,
      width: 240,
      color: { dark: '#1C1917', light: '#FFFFFF' },
    })
      .then((svg) => {
        if (active) setQrSvg(svg);
      })
      .catch(() => {
        if (active) setQrSvg('');
      });
    return () => {
      active = false;
    };
  }, [qrTargetUrl]);

  const activeQrSvg = qrTargetUrl ? qrSvg : '';

  const cities = useMemo(() => {
    const list = Array.from(new Set(stores.map((s) => s.city).filter(Boolean)));
    return ['all', ...list];
  }, [stores]);

  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stores.filter((s) => {
      const matchCity = selectedCity === 'all' || s.city === selectedCity;
      const matchQuery =
        !q ||
        s.nameAr.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.account?.username || '').toLowerCase().includes(q) ||
        (s.account?.ownerName || '').toLowerCase().includes(q) ||
        (s.city || '').toLowerCase().includes(q);
      return matchCity && matchQuery;
    });
  }, [stores, selectedCity, searchQuery]);

  const stats = useMemo(() => {
    const active = stores.filter((s) => (s.account?.status || 'active') === 'active').length;
    const secured = stores.filter((s) => s.account?.hasCredentials).length;
    return { total: stores.length, active, secured };
  }, [stores]);

  const formPwdStrength = useMemo(() => evaluatePasswordStrength(formPassword), [formPassword]);

  const handleCopy = (text, key) => {
    if (!text) return;
    try {
      navigator?.clipboard?.writeText(text);
    } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const resetForm = () => {
    setFormError('');
    setFormStep('store');
    setShowAdvancedFields(false);
    setFormSlugTouched(false);
    setFormNameAr('');
    setFormNameEn('');
    setFormSlug('');
    setFormWhatsapp('966500000000');
    setFormCity(isAr ? 'الرياض' : 'Riyadh');
    setFormDeliveryFee('25');
    setFormTheme('botanical');
    setFormLogoUrl('');
    setFormTaglineAr('');
    setFormTaglineEn('');
    setFormDistrict('');
    setFormAddress('');
    setFormWorkingHours('09:00 AM - 11:30 PM');
    setFormMinFreeDelivery('300');
    setFormCrNumber('');
    setFormVatNumber('');
    setFormGoogleMapsUrl('');
    setFormInstagramUrl('');
    setFormHeroStyle('qlub');
    setFormDefaultLang('ar');
    setFormOwnerName('');
    setFormOwnerUsername('');
    setFormOwnerEmail('');
    setFormOwnerPhone('966500000000');
    setFormAccountStatus('active');
    setFormPassword('');
    setShowFormPassword(false);
  };

  const handleOpenCreateModal = () => {
    setEditingStore(null);
    resetForm();
    setCsrfToken(generateCsrfToken());
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (store) => {
    setEditingStore(store);
    setFormError('');
    setFormStep('store');
    setShowAdvancedFields(false);
    setFormSlugTouched(true);
    setFormNameAr(store.nameAr || '');
    setFormNameEn(store.nameEn || '');
    setFormSlug(store.slug || '');
    setFormWhatsapp(store.whatsapp || store.phone || '966500000000');
    setFormCity(store.city || 'الرياض');
    setFormDeliveryFee(String(store.deliveryFee ?? 25));
    setFormTheme(store.theme || 'botanical');
    setFormLogoUrl(store.logoUrl || store.avatarUrl || '');
    setFormTaglineAr(store.taglineAr || '');
    setFormTaglineEn(store.taglineEn || '');
    setFormDistrict(store.district || '');
    setFormAddress(store.address || '');
    setFormWorkingHours(store.workingHours || '09:00 AM - 11:30 PM');
    setFormMinFreeDelivery(String(store.minOrderFreeDelivery ?? 300));
    setFormCrNumber(store.crNumber || '');
    setFormVatNumber(store.vatNumber || '');
    setFormGoogleMapsUrl(store.googleMapsUrl || '');
    setFormInstagramUrl(store.instagramUrl || '');
    setFormHeroStyle(store.heroStyle || 'qlub');
    setFormDefaultLang(store.defaultLang || 'ar');
    setFormOwnerName(store.account?.ownerName || '');
    setFormOwnerUsername(store.account?.username || '');
    setFormOwnerEmail(store.account?.ownerEmail || '');
    setFormOwnerPhone(store.account?.ownerPhone || store.phone || '966500000000');
    setFormAccountStatus(store.account?.status || 'active');
    setFormPassword('');
    setShowFormPassword(false);
    setCsrfToken(generateCsrfToken());
    setIsModalOpen(true);
  };

  const handleLogoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = await validateUploadedFile(file, 'store');
    if (!validation.isValid) {
      setFormError(validation.error || (isAr ? 'الملف غير آمن' : 'Unsafe file'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setFormLogoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleNameArChange = (val) => {
    setFormNameAr(val);
    if (!editingStore && !formSlugTouched) {
      const auto = normalizeSlug(val);
      if (auto && auto.length >= 2) {
        setFormSlug(auto);
        if (!formOwnerUsername) setFormOwnerUsername(`${auto.replace(/-/g, '_')}_owner`);
      }
    }
  };

  const handleNameEnChange = (val) => {
    setFormNameEn(val);
    if (!editingStore && !formSlugTouched) {
      const auto = normalizeSlug(val);
      if (auto && auto.length >= 2) {
        setFormSlug(auto);
        setFormOwnerUsername(`${auto.replace(/-/g, '_')}_owner`);
      }
    }
  };

  const handleSaveStoreSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formNameAr.trim()) {
      setFormError(isAr ? 'اكتب اسم المتجر بالعربية' : 'Enter Arabic store name');
      setFormStep('store');
      return;
    }

    const effectiveNameEn = formNameEn.trim() || normalizeSlug(formNameAr) || 'Flower Boutique';
    const effectiveSlug = normalizeSlug(formSlug || effectiveNameEn || formNameAr);
    if (!effectiveSlug || effectiveSlug.length < 3) {
      setFormError(isAr ? 'المعرف (slug) يجب أن يكون 3 أحرف إنجليزية على الأقل' : 'Slug must be at least 3 chars');
      setFormStep('store');
      return;
    }

    const effectiveUsername = (formOwnerUsername || `${effectiveSlug.replace(/-/g, '_')}_owner`).trim();
    const effectiveOwnerName = formOwnerName.trim() || formNameAr.trim();

    if (!editingStore && !formPassword) {
      setFormError(isAr ? 'أدخل كلمة مرور قوية لصاحب المحل' : 'Enter a strong owner password');
      setFormStep('owner');
      return;
    }

    setIsSaving(true);
    try {
      const res = await provisionStoreWithAccount(
        {
          id: editingStore?.id || null,
          nameAr: formNameAr.trim(),
          nameEn: effectiveNameEn,
          slug: effectiveSlug,
          taglineAr: formTaglineAr.trim() || 'أزهار طبيعية وهدايا فاخرة',
          taglineEn: formTaglineEn.trim() || 'Luxury artisanal blooms & gifts',
          phone: formWhatsapp,
          supportPhone: formWhatsapp,
          city: formCity,
          district: formDistrict,
          address: formAddress,
          workingHours: formWorkingHours,
          deliveryFee: Number(formDeliveryFee || 0),
          minOrderFreeDelivery: Number(formMinFreeDelivery || 300),
          prepMinutes: 25,
          crNumber: formCrNumber,
          vatNumber: formVatNumber,
          googleMapsUrl: formGoogleMapsUrl,
          instagramUrl: formInstagramUrl,
          theme: formTheme,
          heroStyle: formHeroStyle,
          specialsStyle: 'editorial_deck',
          defaultLang: formDefaultLang,
          logoUrl: formLogoUrl,
          avatarUrl: formLogoUrl,
          ownerName: effectiveOwnerName,
          ownerEmail: formOwnerEmail,
          ownerPhone: formOwnerPhone || formWhatsapp,
          username: effectiveUsername,
          accountStatus: formAccountStatus,
        },
        {
          passwordPlain: formPassword,
          lang,
          csrfToken,
          expectedCsrfToken: csrfToken,
        }
      );

      if (!res.success) {
        setFormError(res.error || (isAr ? 'تعذر الحفظ' : 'Failed to save'));
        return;
      }

      setStores(res.allStores);
      refreshAuditLogs();
      setIsModalOpen(false);
      setCsrfToken(generateCsrfToken());

      if (!editingStore || formPassword) {
        setHandoffInfo({
          store: res.store,
          username: res.store.account.username,
          passwordPlain: formPassword,
          portableUrl: getStorePortableShareUrl(res.store),
          adminUrl: getStoreOwnerAdminInviteUrl(res.store),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAccountStatus = (store) => {
    const next = store.account?.status === 'active' ? 'suspended' : 'active';
    const res = toggleStoreAccountStatus(store.id, next, { lang });
    if (res.success) {
      setStores(res.allStores);
      refreshAuditLogs();
    } else {
      alert(res.error);
    }
  };

  const handleDeleteStore = (store) => {
    const msg = isAr ? `حذف «${store.nameAr}» نهائياً؟` : `Delete "${store.nameEn}" permanently?`;
    if (!window.confirm(msg)) return;
    const res = deleteStore(store.id, lang);
    if (res.success) {
      setStores(res.allStores);
      refreshAuditLogs();
    } else {
      alert(res.error);
    }
  };

  const handleRotateStorePasswordSubmit = async (e) => {
    e.preventDefault();
    setRotateError('');
    if (!rotateTargetStore) return;
    const res = await rotateStorePassword(rotateTargetStore.id, rotatePwdInput, { lang });
    if (!res.success) {
      setRotateError(res.error);
      return;
    }
    setStores(res.allStores);
    refreshAuditLogs();
    const updatedStore = res.store;
    const plain = rotatePwdInput;
    setRotateTargetStore(null);
    setRotatePwdInput('');
    setHandoffInfo({
      store: updatedStore,
      username: updatedStore.account.username,
      passwordPlain: plain,
      portableUrl: getStorePortableShareUrl(updatedStore),
      adminUrl: getStoreOwnerAdminInviteUrl(updatedStore),
    });
  };

  const handleRotateSuperAdminSubmit = async (e) => {
    e.preventDefault();
    setSaStatusMsg({ type: '', text: '' });
    const res = await rotateSuperAdminPassword(saCurrentPwd, saNewPwd, lang);
    if (!res.success) {
      setSaStatusMsg({ type: 'error', text: res.error });
      return;
    }
    setSaCurrentPwd('');
    setSaNewPwd('');
    refreshAuditLogs();
    setSaStatusMsg({
      type: 'success',
      text: isAr ? 'تم تحديث كلمة المرور.' : 'Password updated.',
    });
  };

  const handleDownloadQrSvg = () => {
    if (!activeQrSvg || !qrModalStore) return;
    const blob = new Blob([activeQrSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${qrModalStore.slug}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F4EF] text-[#151413] flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Architectural Matte Header */}
      <header className="sticky top-0 z-40 bg-[#141312] text-[#FCFBF8] px-4 sm:px-6 py-3.5 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-[#C5A572] border border-white/10 flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm sm:text-base text-[#FCFBF8] leading-tight">
                {isAr ? 'منشئ مواقع المتاجر' : 'FlowerHub Store Builder'}
              </h1>
              <span className="text-[11px] text-stone-400">
                {isAr ? 'إدارة الفروع والروابط' : 'Store & Account Directory'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onToggleLang && (
              <button
                type="button"
                onClick={onToggleLang}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#C5A572]" />
                <span>{isAr ? 'English' : 'العربية'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="py-1.5 px-4 rounded-xl bg-[#FCFBF8] hover:bg-[#EFECE4] text-[#141312] font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
              <span>{isAr ? 'إنشاء موقع وحساب محل' : 'New Store & Account'}</span>
            </button>

            {onOpenStoreAdmin && (
              <button
                type="button"
                onClick={onOpenStoreAdmin}
                className="py-1.5 px-3 rounded-xl bg-white/8 hover:bg-white/15 text-[#F6F4EF] border border-white/10 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-[#C5A572]" />
                <span className="hidden sm:inline">{isAr ? 'لوحة المنسق' : 'Store Admin'}</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{isAr ? 'المتجر' : 'Storefront'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Minimal 3 KPI Pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F3EFE6] text-[#151413] flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-[#8C7148]" />
            </div>
            <div>
              <div className="text-[11px] text-[#6E6A64]">{isAr ? 'المتاجر' : 'Stores'}</div>
              <div className="text-lg font-bold text-[#151413]">{stats.total}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-[#6E6A64]">{isAr ? 'نشطة' : 'Active'}</div>
              <div className="text-lg font-bold text-emerald-800">{stats.active}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F3EFE6] text-[#151413] flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-[#8C7148]" />
            </div>
            <div>
              <div className="text-[11px] text-[#6E6A64]">{isAr ? 'حسابات مؤمّنة' : 'Secured'}</div>
              <div className="text-lg font-bold text-[#151413]">{stats.secured}/{stats.total}</div>
            </div>
          </div>
        </div>

        {/* Clean Tab Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'stores'
                  ? 'bg-[#141312] text-[#FCFBF8] shadow-xs'
                  : 'bg-[#FCFBF8] text-[#5C564E] border border-[#E5DFD3] hover:bg-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{isAr ? 'المتاجر والروابط' : 'Stores & Links'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                refreshAuditLogs();
                setActiveTab('security');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'security'
                  ? 'bg-[#141312] text-[#FCFBF8] shadow-xs'
                  : 'bg-[#FCFBF8] text-[#5C564E] border border-[#E5DFD3] hover:bg-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'الأمان وسجل التدقيق' : 'Security & Audit Center'}</span>
            </button>
          </div>

          {activeTab === 'stores' && (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute top-1/2 -translate-y-1/2 start-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث...' : 'Search...'}
                  className="w-full ps-8 pe-3 py-2 rounded-xl bg-white border border-stone-200 text-xs outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center gap-1">
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer ${
                      selectedCity === city
                        ? 'bg-stone-900 text-amber-300'
                        : 'bg-white border border-stone-200 text-stone-600'
                    }`}
                  >
                    {city === 'all' ? (isAr ? 'الكل' : 'All') : city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TAB A: CLEAN STORE CARDS GRID                             */}
        {/* ========================================================= */}
        {activeTab === 'stores' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((store) => {
              const portableUrl = getStorePortableShareUrl(store);
              const adminInviteUrl = getStoreOwnerAdminInviteUrl(store);
              const isCopiedSite = copiedKey === `site-${store.id}`;
              const isCopiedAdmin = copiedKey === `admin-${store.id}`;
              const acctStatus = store.account?.status || 'active';

              return (
                <div
                  key={store.id}
                  className="rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Top */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-stone-950 text-amber-300 flex items-center justify-center font-serif font-bold text-sm shrink-0 overflow-hidden border border-amber-400/30">
                          {store.logoUrl || store.avatarUrl ? (
                            <img src={store.logoUrl || store.avatarUrl} alt={store.nameAr} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(store.nameAr || 'FH').slice(0, 2)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-stone-900 truncate">
                            {isAr ? store.nameAr : store.nameEn}
                          </h3>
                          <span className="text-[10px] font-mono text-stone-500 block truncate" dir="ltr">
                            ?store={store.slug}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                          acctStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {acctStatus === 'active' ? (isAr ? 'نشط' : 'Active') : isAr ? 'موقوف' : 'Suspended'}
                      </span>
                    </div>

                    {/* Owner & Essential Specs */}
                    <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-stone-800 truncate">{store.account?.ownerName || store.nameAr}</span>
                        <span className="font-mono text-[10px] text-stone-500" dir="ltr">
                          @{store.account?.username || store.slug}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-stone-600 text-[10px]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {store.city}
                        </span>
                        <span dir="ltr" className="font-mono">+{store.phone}</span>
                        <span>
                          {Number(store.deliveryFee || 0) === 0
                            ? isAr
                              ? 'توصيل مجاني'
                              : 'Free'
                            : `${store.deliveryFee} ${isAr ? 'ر.س' : 'SAR'}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Dedicated Customer Site + Owner Admin Panel Links */}
                  <div className="px-4 py-3 bg-[#F9F7F2] border-t border-[#EAE5DA] space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(portableUrl, `site-${store.id}`)}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                          isCopiedSite
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#151413] hover:bg-[#272522] text-[#FCFBF8]'
                        }`}
                      >
                        {isCopiedSite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#C5A572]" />}
                        <span>{isCopiedSite ? (isAr ? 'تم!' : 'Copied') : isAr ? 'رابط الموقع' : 'Store Link'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(adminInviteUrl, `admin-${store.id}`)}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-colors ${
                          isCopiedAdmin
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white hover:bg-[#F3EFE6] text-[#151413] border-[#DED8CC]'
                        }`}
                      >
                        {isCopiedAdmin ? <Check className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5 text-[#8C7148]" />}
                        <span>{isCopiedAdmin ? (isAr ? 'تم!' : 'Copied') : isAr ? 'رابط لوحة المالك' : 'Owner Panel'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <button
                        type="button"
                        onClick={() => onSwitchToStore && onSwitchToStore(store)}
                        className="py-1.5 px-2.5 rounded-lg bg-[#EFECE4] hover:bg-[#E4DEC9] text-[#151413] font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#8C7148]" />
                        <span>{isAr ? 'معاينة' : 'Preview'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setQrMode('portable');
                            setQrModalStore(store);
                          }}
                          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 cursor-pointer"
                          title={isAr ? 'كود QR للموقع' : 'Store QR Code'}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRotateTargetStore(store);
                            setRotatePwdInput('');
                            setRotateError('');
                          }}
                          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 cursor-pointer"
                          title={isAr ? 'كلمة مرور المالك' : 'Reset Password'}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(store)}
                          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 cursor-pointer"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!store.isPrimary && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleAccountStatus(store)}
                              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 cursor-pointer"
                              title={acctStatus === 'active' ? (isAr ? 'إيقاف' : 'Suspend') : isAr ? 'تفعيل' : 'Activate'}
                            >
                              {acctStatus === 'active' ? (
                                <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStore(store)}
                              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer"
                              title={isAr ? 'حذف' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB B: MINIMAL SECURITY & AUDIT LOGS                      */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-stone-900">
                  {isAr ? 'تغيير كلمة مرور مدير المنصة' : 'Super Admin Password'}
                </h3>
              </div>

              {saStatusMsg.text && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold ${
                    saStatusMsg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {saStatusMsg.text}
                </div>
              )}

              <form onSubmit={handleRotateSuperAdminSubmit} className="space-y-3">
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={saCurrentPwd}
                  onChange={(e) => setSaCurrentPwd(e.target.value)}
                  placeholder={isAr ? 'كلمة المرور الحالية' : 'Current password'}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                />
                <div className="space-y-1">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSaNewPwd(generateStrongPassword(14))}
                      className="text-[11px] font-bold text-amber-700 cursor-pointer"
                    >
                      {isAr ? 'توليد آمن' : 'Generate'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={saNewPwd}
                    onChange={(e) => setSaNewPwd(e.target.value)}
                    placeholder={isAr ? 'كلمة المرور الجديدة' : 'New strong password'}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-stone-900">
                    {isAr ? 'سجل التدقيق الأمني' : 'Security Audit Trail'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {auditLogs.length}
                </span>
              </div>

              {auditLogs.length === 0 ? (
                <p className="text-xs text-stone-400 py-8 text-center">
                  {isAr ? 'لا توجد أحداث بعد.' : 'No audit events yet.'}
                </p>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2 pe-1">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              log.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : log.severity === 'warning'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="font-mono text-[10px] text-stone-500" dir="ltr">@{log.actor}</span>
                          {log.targetLabel && (
                            <span className="text-[11px] font-bold text-stone-800 truncate">{log.targetLabel}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600">{log.details}</p>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 shrink-0" dir="ltr">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: FAST 2-STEP STORE WEBSITE & ACCOUNT BUILDER      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
            <div className="fixed inset-0 bg-[#121110]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-xl bg-[#FCFBF8] rounded-3xl shadow-[0_32px_64px_-20px_rgba(0,0,0,0.45)] border border-[#E5DFD3] overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-[#EAE5DA] flex items-center justify-between shrink-0">
                <h3 className="font-serif font-bold text-base text-[#151413]">
                  {editingStore
                    ? isAr
                      ? 'تعديل المتجر'
                      : 'Edit Store'
                    : isAr
                    ? 'إنشاء متجر وحساب مالك'
                    : 'New Store & Owner Account'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#8E887E] hover:text-[#151413] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Clean 2-Step Bar */}
              <div className="flex border-b border-[#EAE5DA] bg-[#F5F2EB] text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setFormStep('store')}
                  className={`flex-1 py-2.5 border-b-2 cursor-pointer transition-colors ${
                    formStep === 'store' ? 'border-[#151413] text-[#151413] bg-[#FCFBF8]' : 'border-transparent text-[#7A746B]'
                  }`}
                >
                  {isAr ? '١. المتجر والتصميم' : '1. Store & Theme'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormStep('owner')}
                  className={`flex-1 py-2.5 border-b-2 cursor-pointer transition-colors ${
                    formStep === 'owner' ? 'border-[#151413] text-[#151413] bg-[#FCFBF8]' : 'border-transparent text-[#7A746B]'
                  }`}
                >
                  {isAr ? '٢. حساب المالك والأمان' : '2. Owner Account'}
                </button>
              </div>

              <form onSubmit={handleSaveStoreSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formStep === 'store' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'اسم المتجر (عربي) *' : 'Store Name (AR) *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formNameAr}
                          onChange={(e) => handleNameArChange(e.target.value)}
                          placeholder={isAr ? 'أتيليه كاميليا للأزهار' : 'Camellia Floral Atelier'}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'اسم المتجر (إنجليزي)' : 'Store Name (EN)'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={formNameEn}
                          onChange={(e) => handleNameEnChange(e.target.value)}
                          placeholder="Camellia Floral"
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'معرّف الرابط (Slug) *' : 'URL Slug *'}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={formSlug}
                          onChange={(e) => {
                            setFormSlugTouched(true);
                            setFormSlug(e.target.value);
                          }}
                          placeholder="camellia-floral"
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'رقم الواتساب *' : 'WhatsApp *'}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={formWhatsapp}
                          onChange={(e) => setFormWhatsapp(e.target.value)}
                          placeholder="966500000000"
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-700">
                            {isAr ? 'المدينة' : 'City'}
                          </label>
                          <input
                            type="text"
                            value={formCity}
                            onChange={(e) => setFormCity(e.target.value)}
                            className="w-full px-2.5 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-700">
                            {isAr ? 'التوصيل' : 'Fee'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            dir="ltr"
                            value={formDeliveryFee}
                            onChange={(e) => setFormDeliveryFee(e.target.value)}
                            className="w-full px-2.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Visual Theme Picker + Compact Logo Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-stone-700 block">
                          {isAr ? 'الثيم والألوان' : 'Theme'}
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {THEME_OPTIONS.map((th) => (
                            <button
                              key={th.id}
                              type="button"
                              onClick={() => setFormTheme(th.id)}
                              className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 cursor-pointer ${
                                formTheme === th.id ? 'border-amber-500 bg-amber-50/70' : 'border-stone-200 bg-white'
                              }`}
                            >
                              <span className="w-4 h-4 rounded-md shrink-0 border border-black/10" style={{ backgroundColor: th.swatch }} />
                              <span className="truncate">{isAr ? th.nameAr : th.nameEn}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-stone-700 block">
                          {isAr ? 'الشعار (اختياري)' : 'Logo (Optional)'}
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-stone-300 hover:border-amber-500 bg-stone-50 text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5 cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-amber-600" />
                            <span>{formLogoUrl ? (isAr ? 'تغيير الشعار ✓' : 'Change ✓') : isAr ? 'رفع صورة الشعار' : 'Upload Logo'}</span>
                            <input type="file" accept="image/*" onChange={handleLogoFileSelect} className="hidden" />
                          </label>
                          {formLogoUrl && (
                            <button
                              type="button"
                              onClick={() => setFormLogoUrl('')}
                              className="p-2.5 rounded-xl border border-stone-200 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Optional Fields */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                        className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200/70 text-stone-700 text-[11px] font-bold flex items-center justify-between cursor-pointer"
                      >
                        <span>{isAr ? 'بيانات إضافية (السجل التجاري، الخريطة، اللغة، التصميم)' : 'Optional Details (CR, Maps, Language, Layout)'}</span>
                        {showAdvancedFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {showAdvancedFields && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                          <div className="grid grid-cols-2 gap-2.5">
                            <input
                              type="text"
                              value={formDistrict}
                              onChange={(e) => setFormDistrict(e.target.value)}
                              placeholder={isAr ? 'الحي' : 'District'}
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white outline-none"
                            />
                            <input
                              type="text"
                              dir="ltr"
                              value={formWorkingHours}
                              onChange={(e) => setFormWorkingHours(e.target.value)}
                              placeholder="09:00 AM - 11:30 PM"
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-white outline-none text-left"
                            />
                            <input
                              type="text"
                              dir="ltr"
                              value={formCrNumber}
                              onChange={(e) => setFormCrNumber(e.target.value)}
                              placeholder={isAr ? 'السجل التجاري' : 'CR Number'}
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-white outline-none text-left"
                            />
                            <input
                              type="text"
                              dir="ltr"
                              value={formVatNumber}
                              onChange={(e) => setFormVatNumber(e.target.value)}
                              placeholder={isAr ? 'الرقم الضريبي' : 'VAT Number'}
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-white outline-none text-left"
                            />
                            <input
                              type="url"
                              dir="ltr"
                              value={formGoogleMapsUrl}
                              onChange={(e) => setFormGoogleMapsUrl(e.target.value)}
                              placeholder="https://maps.google.com/?q=..."
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-white outline-none text-left"
                            />
                            <input
                              type="url"
                              dir="ltr"
                              value={formInstagramUrl}
                              onChange={(e) => setFormInstagramUrl(e.target.value)}
                              placeholder="https://instagram.com/..."
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-white outline-none text-left"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <select
                              value={formDefaultLang}
                              onChange={(e) => setFormDefaultLang(e.target.value)}
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white outline-none"
                            >
                              <option value="ar">{isAr ? 'لغة المتجر: العربية' : 'Language: Arabic'}</option>
                              <option value="en">{isAr ? 'لغة المتجر: الإنجليزية' : 'Language: English'}</option>
                            </select>
                            <select
                              value={formHeroStyle}
                              onChange={(e) => setFormHeroStyle(e.target.value)}
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white outline-none"
                            >
                              <option value="qlub">{isAr ? 'هيرو فاخر (Signature)' : 'Hero: Signature'}</option>
                              <option value="editorial">{isAr ? 'هيرو تحريري (Editorial)' : 'Hero: Editorial'}</option>
                              <option value="minimal">{isAr ? 'هيرو هادئ (Minimal)' : 'Hero: Minimal'}</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formStep === 'owner' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'اسم المالك *' : 'Owner Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formOwnerName}
                          onChange={(e) => setFormOwnerName(e.target.value)}
                          placeholder={isAr ? 'نورة السبيعي' : 'Noura Al-Subaie'}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'اسم المستخدم للدخول *' : 'Username *'}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={formOwnerUsername}
                          onChange={(e) => setFormOwnerUsername(e.target.value)}
                          placeholder="camellia_owner"
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                        </label>
                        <input
                          type="email"
                          dir="ltr"
                          value={formOwnerEmail}
                          onChange={(e) => setFormOwnerEmail(e.target.value)}
                          placeholder="owner@store.sa"
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'حالة الحساب' : 'Account Status'}
                        </label>
                        <select
                          value={formAccountStatus}
                          onChange={(e) => setFormAccountStatus(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-500"
                        >
                          <option value="active">{isAr ? 'نشط ومفعل' : 'Active'}</option>
                          <option value="suspended">{isAr ? 'موقوف' : 'Suspended'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Strong Password + Generator */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-stone-700">
                          {editingStore
                            ? isAr
                              ? 'كلمة مرور جديدة (اتركه فارغاً للإبقاء)'
                              : 'New Password (optional)'
                            : isAr
                            ? 'كلمة المرور *'
                            : 'Password *'}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormPassword(generateStrongPassword(14));
                            setShowFormPassword(true);
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'توليد آمن' : 'Generate Strong'}</span>
                        </button>
                      </div>

                      <div className="relative" dir="ltr">
                        <input
                          type={showFormPassword ? 'text' : 'password'}
                          dir="ltr"
                          required={!editingStore}
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full ps-3.5 pe-10 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500 text-left"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFormPassword(!showFormPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {formPassword.length > 0 && (
                        <div className="grid grid-cols-4 gap-1 pt-0.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-1 rounded-full ${
                                formPwdStrength.score >= step
                                  ? formPwdStrength.score === 4
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                  : 'bg-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-200">
                  {formStep === 'store' ? (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFormStep('store')}
                      className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                    >
                      {isAr ? 'السابق' : 'Back'}
                    </button>
                  )}

                  {formStep === 'store' ? (
                    <button
                      type="button"
                      onClick={() => setFormStep('owner')}
                      className="py-2.5 px-5 rounded-xl bg-[#141312] hover:bg-[#272522] text-[#FCFBF8] text-xs font-bold cursor-pointer transition-colors"
                    >
                      {isAr ? 'التالي: حساب المالك ←' : 'Next: Owner Account →'}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="py-2.5 px-5 rounded-xl bg-[#141312] hover:bg-[#272522] text-[#FCFBF8] font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-4 h-4 text-[#C5A572]" />
                      <span>
                        {editingStore
                          ? isAr
                            ? 'حفظ التغييرات'
                            : 'Save Changes'
                          : isAr
                          ? 'إنشاء المتجر والروابط'
                          : 'Create Store & Links'}
                      </span>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: CLEAN CREDENTIAL & LINKS HANDOFF CARD            */}
      {/* ========================================================= */}
      <AnimatePresence>
        {handoffInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121110]/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md bg-[#FCFBF8] rounded-3xl shadow-[0_32px_64px_-20px_rgba(0,0,0,0.45)] border border-[#E5DFD3] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#EAE5DA] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#151413]">
                    {isAr ? handoffInfo.store.nameAr : handoffInfo.store.nameEn}
                  </h4>
                </div>
                <button type="button" onClick={() => setHandoffInfo(null)} className="text-[#8E887E] hover:text-[#151413] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-3 text-xs">
                {/* Credentials Summary */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">{isAr ? 'المستخدم:' : 'Username:'}</span>
                    <span className="font-bold text-stone-900" dir="ltr">{handoffInfo.username}</span>
                  </div>
                  {handoffInfo.passwordPlain && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-sans">{isAr ? 'كلمة المرور:' : 'Password:'}</span>
                      <span className="font-bold text-emerald-700 select-all" dir="ltr">{handoffInfo.passwordPlain}</span>
                    </div>
                  )}
                </div>

                {/* 1. Customer Storefront URL */}
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{isAr ? '١. رابط الموقع للعملاء' : '1. Customer Storefront Link'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(handoffInfo.portableUrl, 'ho-site')}
                      className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                    >
                      {copiedKey === 'ho-site' ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : isAr ? 'نسخ' : 'Copy'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-stone-600 block truncate select-all" dir="ltr">
                    {handoffInfo.portableUrl}
                  </span>
                </div>

                {/* 2. Owner Admin Invite URL */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">{isAr ? '٢. رابط لوحة التعديل للمالك' : '2. Owner Admin Panel Link'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(handoffInfo.adminUrl, 'ho-admin')}
                      className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      {copiedKey === 'ho-admin' ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : isAr ? 'نسخ' : 'Copy'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-stone-600 block truncate select-all" dir="ltr">
                    {handoffInfo.adminUrl}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const pack = isAr
                        ? `متجرك جاهز (${handoffInfo.store.nameAr})\nرابط الموقع للعملاء:\n${handoffInfo.portableUrl}\n\nرابط لوحة التعديل:\n${handoffInfo.adminUrl}\nاسم المستخدم: ${handoffInfo.username}\nكلمة المرور: ${handoffInfo.passwordPlain || '(كما هي)'}`
                        : `Your store (${handoffInfo.store.nameEn}) is live!\nCustomer Link:\n${handoffInfo.portableUrl}\n\nOwner Edit Panel:\n${handoffInfo.adminUrl}\nUsername: ${handoffInfo.username}\nPassword: ${handoffInfo.passwordPlain || '(unchanged)'}`;
                      handleCopy(pack, 'handoff-pack');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#151413] hover:bg-[#272522] text-[#FCFBF8] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'handoff-pack' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#C5A572]" />}
                    <span>
                      {copiedKey === 'handoff-pack'
                        ? isAr
                          ? 'تم نسخ الحزمة!'
                          : 'Copied!'
                        : isAr
                        ? 'نسخ الكل للمالك'
                        : 'Copy Owner Pack'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHandoffInfo(null)}
                    className="py-2.5 px-4 rounded-xl bg-[#F4F0E8] hover:bg-[#EAE4D7] border border-[#E2DACB] text-[#2C2925] font-bold text-xs cursor-pointer transition-colors"
                  >
                    {isAr ? 'إغلاق' : 'Done'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 3: OFFLINE SVG QR CODE                              */}
      {/* ========================================================= */}
      <AnimatePresence>
        {qrModalStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121110]/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm bg-[#FCFBF8] rounded-3xl shadow-[0_32px_64px_-20px_rgba(0,0,0,0.45)] border border-[#E5DFD3] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#EAE5DA] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#8C7148]" />
                  <h4 className="font-serif font-bold text-sm text-[#151413]">
                    {isAr ? qrModalStore.nameAr : qrModalStore.nameEn}
                  </h4>
                </div>
                <button type="button" onClick={() => setQrModalStore(null)} className="text-[#8E887E] hover:text-[#151413] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-center">
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#EFECE4] text-[11px] font-bold">
                  {[
                    { id: 'portable', ar: 'موقع المتجر', en: 'Storefront' },
                    { id: 'admin', ar: 'لوحة المالك', en: 'Owner Admin' },
                    { id: 'gmaps', ar: 'قوقل ماب', en: 'Google Maps' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setQrMode(m.id)}
                      className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                        qrMode === m.id ? 'bg-white text-[#151413] shadow-xs' : 'text-[#6E6A64]'
                      }`}
                    >
                      {isAr ? m.ar : m.en}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E2DACB] inline-block shadow-xs">
                  {activeQrSvg ? (
                    <div className="w-56 h-56 mx-auto [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: activeQrSvg }} />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-xs text-stone-400">QR...</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadQrSvg}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#151413] hover:bg-[#272522] text-[#FCFBF8] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#C5A572]" />
                    <span>SVG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2.5 px-3.5 rounded-xl bg-[#F4F0E8] hover:bg-[#EAE4D7] border border-[#E2DACB] text-[#2C2925] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isAr ? 'طباعة' : 'Print'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 4: ROTATE STORE OWNER PASSWORD                      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {rotateTargetStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121110]/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm bg-[#FCFBF8] rounded-3xl shadow-[0_32px_64px_-20px_rgba(0,0,0,0.45)] border border-[#E5DFD3] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#EAE5DA] flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#151413]">
                  {isAr ? rotateTargetStore.nameAr : rotateTargetStore.nameEn}
                </span>
                <button type="button" onClick={() => setRotateTargetStore(null)} className="text-[#8E887E] hover:text-[#151413] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRotateStorePasswordSubmit} className="p-5 space-y-3 text-xs">
                {rotateError && <p className="text-rose-700 font-semibold">{rotateError}</p>}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3C3934]">{isAr ? 'كلمة مرور جديدة للمالك' : 'New Owner Password'}</span>
                  <button
                    type="button"
                    onClick={() => setRotatePwdInput(generateStrongPassword(14))}
                    className="text-[#8C7148] hover:text-[#151413] font-bold cursor-pointer"
                  >
                    {isAr ? 'توليد آمن' : 'Generate'}
                  </button>
                </div>

                <input
                  type="text"
                  required
                  dir="ltr"
                  value={rotatePwdInput}
                  onChange={(e) => setRotatePwdInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED8CC] font-mono text-left outline-none focus:border-[#151413]"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#151413] hover:bg-[#272522] text-[#FCFBF8] font-bold cursor-pointer transition-colors"
                >
                  {isAr ? 'حفظ وتحديث الرابط' : 'Save & Update Link'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
