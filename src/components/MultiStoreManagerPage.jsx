import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Store,
  Plus,
  MapPin,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  Search,
  Sliders,
  Trash2,
  Edit3,
  Globe,
  Share2,
  QrCode,
  X,
  Building2,
  Clock,
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
  FileCheck2,
  Sparkles,
  Mail,
  Activity,
} from 'lucide-react';
import {
  getAllStores,
  provisionStoreWithAccount,
  deleteStore,
  toggleStoreAccountStatus,
  rotateStorePassword,
  getStoreGoogleMapsUrl,
  getStoreDirectShareUrl,
  getStorePortableShareUrl,
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
import { THEME_TOKENS } from '../data/mockData';

const THEME_OPTIONS = [
  {
    id: 'botanical',
    nameAr: 'أوليف نباتي فاخر (Botanical)',
    nameEn: 'Botanical Olive Luxury',
    previewBg: '#FAF8F5',
    previewAccent: '#022C22',
  },
  {
    id: 'velvet',
    nameAr: 'مخمل الروز والبورغندي (Velvet)',
    nameEn: 'Velvet Rose & Burgundy',
    previewBg: '#FFF8F9',
    previewAccent: '#881337',
  },
  {
    id: 'noir',
    nameAr: 'نوار وذهب ملكي داكن (Noir)',
    nameEn: 'Noir & 24K Gold Dark',
    previewBg: '#0B0B0C',
    previewAccent: '#F59E0B',
  },
  {
    id: 'minimal',
    nameAr: 'حجر نقي مينيمال (Minimal)',
    nameEn: 'Minimal Pure Stone',
    previewBg: '#FFFFFF',
    previewAccent: '#1C1917',
  },
];

const HERO_OPTIONS = [
  { id: 'qlub', ar: 'بطاقة مدمجة سريعة', en: 'Compact Boutique Card' },
  { id: 'editorial', ar: 'غلاف تحريري فاخر', en: 'Editorial Full-Bleed' },
  { id: 'minimal', ar: 'واجهة صالة عرض هادئة', en: 'Minimal Centered Gallery' },
];

const SPECIALS_OPTIONS = [
  { id: 'editorial_deck', ar: 'بطاقات العرض العريضة', en: 'Editorial Deck' },
  { id: 'marquee', ar: 'شريط انسيابي متحرك', en: 'Smooth Marquee' },
  { id: 'coverflow', ar: 'تركيز ثلاثي الأبعاد', en: '3D Coverflow' },
  { id: 'spotlight', ar: 'منصة العرض الفاخرة', en: 'Spotlight Stage' },
];

export default function MultiStoreManagerPage({
  lang = 'ar',
  onToggleLang,
  onClose,
  onSwitchToStore,
  onOpenStoreAdmin,
  activeStoreId,
}) {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'security'
  const [stores, setStores] = useState(() => getAllStores());
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all'); // 'all' | 'active' | 'pending' | 'suspended'
  const [copiedKey, setCopiedKey] = useState(null);

  // CSRF double-submit token for administrative mutations
  const [csrfToken, setCsrfToken] = useState(() => generateCsrfToken());

  // QR Modal State
  const [qrModalStore, setQrModalStore] = useState(null);
  const [qrMode, setQrMode] = useState('portable'); // 'portable' | 'direct' | 'gmaps'
  const [qrSvg, setQrSvg] = useState('');

  // Store Builder Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formStep, setFormStep] = useState('identity'); // 'identity' | 'business' | 'account'
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Store Identity Fields
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTaglineAr, setFormTaglineAr] = useState('');
  const [formTaglineEn, setFormTaglineEn] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formTheme, setFormTheme] = useState('botanical');
  const [formHeroStyle, setFormHeroStyle] = useState('qlub');
  const [formSpecialsStyle, setFormSpecialsStyle] = useState('editorial_deck');
  const [formDefaultLang, setFormDefaultLang] = useState('ar');

  // Business, Legal & Operations Fields
  const [formPhone, setFormPhone] = useState('966500000000');
  const [formSupportPhone, setFormSupportPhone] = useState('');
  const [formCity, setFormCity] = useState('الرياض');
  const [formDistrict, setFormDistrict] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCrNumber, setFormCrNumber] = useState('');
  const [formVatNumber, setFormVatNumber] = useState('');
  const [formWorkingHours, setFormWorkingHours] = useState('09:00 AM - 11:30 PM');
  const [formDeliveryFee, setFormDeliveryFee] = useState('25');
  const [formMinFreeDelivery, setFormMinFreeDelivery] = useState('300');
  const [formPrepMinutes, setFormPrepMinutes] = useState('25');
  const [formGoogleMapsUrl, setFormGoogleMapsUrl] = useState('');
  const [formInstagramUrl, setFormInstagramUrl] = useState('');
  const [formStatus, setFormStatus] = useState('open');

  // Merchant Owner Account Fields
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formOwnerEmail, setFormOwnerEmail] = useState('');
  const [formOwnerPhone, setFormOwnerPhone] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState('store_owner');
  const [formAccountStatus, setFormAccountStatus] = useState('active');
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // One-Time Credential Handoff Modal after Provisioning / Password Reset
  const [handoffInfo, setHandoffInfo] = useState(null);

  // Password Rotation Modal
  const [rotateTargetStore, setRotateTargetStore] = useState(null);
  const [rotateNewPassword, setRotateNewPassword] = useState('');
  const [showRotatePassword, setShowRotatePassword] = useState(false);
  const [rotateError, setRotateError] = useState('');

  // Super Admin Password Rotation State
  const [saCurrentPwd, setSaCurrentPwd] = useState('');
  const [saNewPwd, setSaNewPwd] = useState('');
  const [saMsg, setSaMsg] = useState({ type: '', text: '' });

  // Delete Confirmation State
  const [storeToDelete, setStoreToDelete] = useState(null);

  const formPwdStrength = evaluatePasswordStrength(formPassword);
  const rotatePwdStrength = evaluatePasswordStrength(rotateNewPassword);

  const refreshAuditLogs = () => setAuditLogs(getAuditLogs());

  // Generate QR SVG locally when modal is open
  const qrTargetUrl = useMemo(() => {
    if (!qrModalStore) return '';
    if (qrMode === 'gmaps') return getStoreGoogleMapsUrl(qrModalStore.slug);
    if (qrMode === 'direct') return getStoreDirectShareUrl(qrModalStore.slug);
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
    return stores.filter((s) => {
      const matchCity = selectedCity === 'all' || s.city === selectedCity;
      const acctStatus = s.account?.status || 'active';
      const matchAcct = accountFilter === 'all' || acctStatus === accountFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        s.nameAr?.toLowerCase().includes(q) ||
        s.nameEn?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.district?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.slug?.toLowerCase().includes(q) ||
        s.crNumber?.includes(q) ||
        s.account?.ownerName?.toLowerCase().includes(q) ||
        s.account?.username?.toLowerCase().includes(q);
      return matchCity && matchAcct && matchQuery;
    });
  }, [stores, selectedCity, accountFilter, searchQuery]);

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // Handle Secure Logo Image Upload (Magic Bytes verified)
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = await validateUploadedFile(file, 'store');
    if (!validation.isValid) {
      setFormError(validation.error || (isAr ? 'ملف الشعار غير آمن' : 'Invalid logo image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormLogoUrl(reader.result);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Create Store & Account Modal
  const handleOpenCreateModal = () => {
    setEditingStore(null);
    setFormStep('identity');
    setFormNameAr('');
    setFormNameEn('');
    setFormSlug('');
    setFormTaglineAr('أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب');
    setFormTaglineEn('Luxury artisanal blooms & curated floral gifts');
    setFormLogoUrl('');
    setFormTheme('botanical');
    setFormHeroStyle('qlub');
    setFormSpecialsStyle('editorial_deck');
    setFormDefaultLang(lang);

    setFormPhone('966500000000');
    setFormSupportPhone('');
    setFormCity(isAr ? 'الرياض' : 'Riyadh');
    setFormDistrict('');
    setFormAddress('');
    setFormCrNumber('');
    setFormVatNumber('');
    setFormWorkingHours('09:00 AM - 11:30 PM');
    setFormDeliveryFee('25');
    setFormMinFreeDelivery('300');
    setFormPrepMinutes('25');
    setFormGoogleMapsUrl('');
    setFormInstagramUrl('');
    setFormStatus('open');

    setFormOwnerName('');
    setFormOwnerEmail('');
    setFormOwnerPhone('');
    setFormUsername('');
    setFormRole('store_owner');
    setFormAccountStatus('active');
    setFormPassword(generateStrongPassword(14));
    setShowFormPassword(true);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (store) => {
    setEditingStore(store);
    setFormStep('identity');
    setFormNameAr(store.nameAr || '');
    setFormNameEn(store.nameEn || '');
    setFormSlug(store.slug || '');
    setFormTaglineAr(store.taglineAr || '');
    setFormTaglineEn(store.taglineEn || '');
    setFormLogoUrl(store.logoUrl || store.avatarUrl || '');
    setFormTheme(store.theme || 'botanical');
    setFormHeroStyle(store.heroStyle || 'qlub');
    setFormSpecialsStyle(store.specialsStyle || 'editorial_deck');
    setFormDefaultLang(store.defaultLang || 'ar');

    setFormPhone(store.phone || '');
    setFormSupportPhone(store.supportPhone || '');
    setFormCity(store.city || 'الرياض');
    setFormDistrict(store.district || '');
    setFormAddress(store.address || '');
    setFormCrNumber(store.crNumber || '');
    setFormVatNumber(store.vatNumber || '');
    setFormWorkingHours(store.workingHours || '09:00 AM - 11:30 PM');
    setFormDeliveryFee(String(store.deliveryFee ?? 0));
    setFormMinFreeDelivery(String(store.minOrderFreeDelivery ?? 300));
    setFormPrepMinutes(String(store.prepMinutes ?? 25));
    setFormGoogleMapsUrl(store.googleMapsUrl || '');
    setFormInstagramUrl(store.instagramUrl || '');
    setFormStatus(store.status || 'open');

    setFormOwnerName(store.account?.ownerName || '');
    setFormOwnerEmail(store.account?.ownerEmail || '');
    setFormOwnerPhone(store.account?.ownerPhone || store.phone || '');
    setFormUsername(store.account?.username || '');
    setFormRole(store.account?.role || 'store_owner');
    setFormAccountStatus(store.account?.status || 'active');
    setFormPassword('');
    setShowFormPassword(false);
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Provisioned Store + Merchant Account
  const handleSaveStoreSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formNameAr.trim() || !formNameEn.trim()) {
      setFormStep('identity');
      setFormError(
        isAr
          ? 'فضلاً أدخل اسم المتجر باللغتين العربية والإنجليزية'
          : 'Please enter the store name in both Arabic and English'
      );
      return;
    }

    if (!formOwnerName.trim() || !formOwnerEmail.trim() || !formUsername.trim()) {
      setFormStep('account');
      setFormError(
        isAr
          ? 'يرجى استكمال بيانات حساب صاحب المحل (الاسم، البريد، اسم المستخدم)'
          : 'Please complete owner account details (name, email, login username)'
      );
      return;
    }

    if (!editingStore && !formPassword) {
      setFormStep('account');
      setFormError(
        isAr
          ? 'يجب تعيين كلمة مرور قوية لحساب صاحب المتجر'
          : 'A strong password is required for the new store owner account'
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await provisionStoreWithAccount(
        {
          id: editingStore?.id,
          nameAr: formNameAr,
          nameEn: formNameEn,
          slug: formSlug || normalizeSlug(formNameEn || formNameAr),
          taglineAr: formTaglineAr,
          taglineEn: formTaglineEn,
          logoUrl: formLogoUrl,
          theme: formTheme,
          heroStyle: formHeroStyle,
          specialsStyle: formSpecialsStyle,
          defaultLang: formDefaultLang,
          phone: formPhone,
          supportPhone: formSupportPhone,
          city: formCity,
          district: formDistrict,
          address: formAddress,
          crNumber: formCrNumber,
          vatNumber: formVatNumber,
          workingHours: formWorkingHours,
          deliveryFee: Number(formDeliveryFee || 0),
          minOrderFreeDelivery: Number(formMinFreeDelivery || 300),
          prepMinutes: Number(formPrepMinutes || 25),
          googleMapsUrl: formGoogleMapsUrl,
          instagramUrl: formInstagramUrl,
          status: formStatus,
          ownerName: formOwnerName,
          ownerEmail: formOwnerEmail,
          ownerPhone: formOwnerPhone || formPhone,
          username: formUsername,
          role: formRole,
          accountStatus: formAccountStatus,
        },
        {
          passwordPlain: formPassword,
          lang,
          csrfToken,
          expectedCsrfToken: csrfToken,
          actor: 'super_admin',
        }
      );

      if (res.success) {
        setStores(res.allStores);
        refreshAuditLogs();
        setCsrfToken(generateCsrfToken());
        setIsModalOpen(false);
        setEditingStore(null);

        if (!editingStore || formPassword) {
          setHandoffInfo({
            store: res.store,
            username: res.store.account.username,
            passwordPlain: formPassword,
            portableUrl: getStorePortableShareUrl(res.store),
            directUrl: getStoreDirectShareUrl(res.store.slug),
            adminUrl: `${getStoreDirectShareUrl(res.store.slug)}#admin`,
          });
        }
      } else {
        setFormError(res.error || (isAr ? 'تعذر حفظ المتجر' : 'Failed to save store'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAccount = (store) => {
    const next = store.account?.status === 'active' ? 'suspended' : 'active';
    const res = toggleStoreAccountStatus(store.id, next, { lang, actor: 'super_admin' });
    if (res.success) {
      setStores(res.allStores);
      refreshAuditLogs();
    } else {
      alert(res.error);
    }
  };

  const handleRotateStorePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!rotateTargetStore) return;
    setRotateError('');
    const res = await rotateStorePassword(rotateTargetStore.id, rotateNewPassword, {
      lang,
      actor: 'super_admin',
    });
    if (res.success) {
      setStores(res.allStores);
      refreshAuditLogs();
      const target = res.allStores.find((s) => s.id === rotateTargetStore.id) || rotateTargetStore;
      setHandoffInfo({
        store: target,
        username: target.account?.username,
        passwordPlain: rotateNewPassword,
        portableUrl: getStorePortableShareUrl(target),
        directUrl: getStoreDirectShareUrl(target.slug),
        adminUrl: `${getStoreDirectShareUrl(target.slug)}#admin`,
      });
      setRotateTargetStore(null);
      setRotateNewPassword('');
    } else {
      setRotateError(res.error);
    }
  };

  const handleConfirmDelete = () => {
    if (!storeToDelete) return;
    const res = deleteStore(storeToDelete.id, lang, 'super_admin');
    if (res.success) {
      setStores(res.allStores);
      refreshAuditLogs();
      setStoreToDelete(null);
    } else {
      alert(res.error);
    }
  };

  const handleSuperAdminRotate = async (e) => {
    e.preventDefault();
    setSaMsg({ type: '', text: '' });
    const res = await rotateSuperAdminPassword(saCurrentPwd, saNewPwd, lang);
    if (res.success) {
      setSaCurrentPwd('');
      setSaNewPwd('');
      refreshAuditLogs();
      setSaMsg({
        type: 'success',
        text: isAr
          ? 'تم تحديث كلمة مرور مدير المنصة بنجاح وتشفيرها بـ PBKDF2-SHA256.'
          : 'Super Admin password rotated and hashed with PBKDF2-SHA256.',
      });
    } else {
      setSaMsg({ type: 'error', text: res.error });
    }
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

  const activeThemePreview = THEME_TOKENS[formTheme] || THEME_TOKENS.botanical;

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col font-sans select-none pb-24">
      {/* ========================================================= */}
      {/* 1. MASTER PLATFORM HEADER (Bilingual + RBAC + Lang Switch) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-stone-950 text-white px-4 sm:px-6 py-3.5 border-b border-stone-800 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-stone-950 flex items-center justify-center font-serif font-black text-lg shadow-md shrink-0">
              <Building2 className="w-5 h-5 text-stone-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif font-black text-sm sm:text-base text-amber-100 tracking-wide">
                  {isAr ? 'منصة إنشاء وإدارة مواقع الورود' : 'FlowerHub Storefront & Account Builder'}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{isAr ? 'PBKDF2 · HMAC · عزل المتاجر' : 'PBKDF2 · HMAC · RBAC'}</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {isAr
                  ? 'أنشئ موقعاً مستقلاً وحساباً مشفراً لكل محل ورود مع رابط خاص، كود QR، وسياسات توصيل مستقلة.'
                  : 'Provision dedicated flower shop websites, encrypted merchant accounts, unique URLs & QR codes.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onToggleLang && (
              <button
                type="button"
                onClick={onToggleLang}
                className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'English' : 'العربية'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? 'إنشاء موقع وحساب محل' : 'New Store & Account'}</span>
            </button>

            {onOpenStoreAdmin && (
              <button
                type="button"
                onClick={onOpenStoreAdmin}
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isAr ? 'لوحة المنسق' : 'Store Studio'}</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-stone-300" />
                <span>{isAr ? 'المتجر' : 'Storefront'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. WORKSPACE NAVIGATION & KPI STRIP                       */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium block">
                {isAr ? 'مواقع ومتاجر الورود' : 'Total Flower Sites'}
              </span>
              <span className="text-xl font-serif font-black text-stone-900">{stores.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium block">
                {isAr ? 'الحسابات النشطة' : 'Active Accounts'}
              </span>
              <span className="text-xl font-serif font-black text-emerald-700">
                {stores.filter((s) => (s.account?.status || 'active') === 'active').length}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium block">
                {isAr ? 'حسابات محمية بـ PBKDF2' : 'PBKDF2 Protected'}
              </span>
              <span className="text-xl font-serif font-black text-sky-800">
                {stores.filter((s) => s.account?.hasCredentials).length} / {stores.length}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium block">
                {isAr ? 'أحداث سجل الأمان' : 'Security Audit Events'}
              </span>
              <span className="text-xl font-serif font-black text-stone-900">{auditLogs.length}</span>
            </div>
          </div>
        </div>

        {/* Workspace Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stores'
                ? 'bg-stone-950 text-amber-300 shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{isAr ? 'المتاجر والحسابات والروابط' : 'Stores, Accounts & Links'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              refreshAuditLogs();
              setActiveTab('security');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-stone-950 text-amber-300 shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'مركز الأمان وسجل التدقيق' : 'Security & Audit Center'}</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB A: STORES & MERCHANT ACCOUNTS                         */}
        {/* ========================================================= */}
        {activeTab === 'stores' && (
          <div className="space-y-5">
            {/* Search & Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث باسم المحل، اسم المالك، اسم المستخدم، المدينة، السجل التجاري، أو الواتساب...'
                      : 'Search by store name, owner, @username, city, CR number, or WhatsApp...'
                  }
                  className="w-full ps-9.5 pe-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium placeholder:text-stone-400 focus:bg-white focus:border-amber-400 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', ar: 'كل الحالات', en: 'All' },
                  { id: 'active', ar: 'نشط', en: 'Active' },
                  { id: 'pending', ar: 'قيد المراجعة', en: 'Pending' },
                  { id: 'suspended', ar: 'موقوف', en: 'Suspended' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAccountFilter(f.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      accountFilter === f.id
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {isAr ? f.ar : f.en}
                  </button>
                ))}
              </div>

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

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredStores.map((store) => {
                const portableUrl = getStorePortableShareUrl(store);
                const gmapsUrl = getStoreGoogleMapsUrl(store.slug);
                const directUrl = getStoreDirectShareUrl(store.slug);
                const isCopiedPortable = copiedKey === `portable-${store.id}`;
                const isCopiedGmaps = copiedKey === `gmaps-${store.id}`;
                const isCurrentlyActive = activeStoreId === store.id || (store.isPrimary && !activeStoreId);
                const acctStatus = store.account?.status || 'active';
                const themeMeta = THEME_OPTIONS.find((th) => th.id === store.theme) || THEME_OPTIONS[0];

                return (
                  <div
                    key={store.id}
                    className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                      isCurrentlyActive
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : 'border-stone-200/90 hover:border-amber-300'
                    }`}
                  >
                    {/* Card Header & Owner Info */}
                    <div className="p-5 pb-4 border-b border-stone-100 space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-amber-300 flex items-center justify-center font-serif font-black text-sm border border-stone-700 shadow-inner shrink-0 overflow-hidden">
                            {store.logoUrl || store.avatarUrl ? (
                              <img
                                src={store.logoUrl || store.avatarUrl}
                                alt={store.nameAr}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{store.nameAr ? store.nameAr.slice(0, 2) : 'ور'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-tight truncate">
                                {isAr ? store.nameAr : store.nameEn}
                              </h3>
                              {store.isPrimary && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                  {isAr ? 'الرئيسي' : 'Primary'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-500 font-mono block truncate">
                              {isAr ? store.nameEn : store.nameAr} • @{store.slug}
                            </span>
                          </div>
                        </div>

                        {/* Account Status Pill */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                            acctStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : acctStatus === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : 'bg-rose-50 text-rose-800 border border-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              acctStatus === 'active'
                                ? 'bg-emerald-500'
                                : acctStatus === 'pending'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span>
                            {acctStatus === 'active'
                              ? isAr
                                ? 'حساب نشط'
                                : 'Active'
                              : acctStatus === 'pending'
                              ? isAr
                                ? 'قيد التفعيل'
                                : 'Pending'
                              : isAr
                              ? 'موقوف'
                              : 'Suspended'}
                          </span>
                        </span>
                      </div>

                      {/* Merchant Account Box */}
                      <div className="p-3 rounded-2xl bg-stone-950 text-stone-200 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-amber-300 flex items-center gap-1.5 truncate">
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>{store.account?.ownerName || (isAr ? 'المالك' : 'Owner')}</span>
                          </span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                              store.account?.hasCredentials
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {store.account?.hasCredentials
                              ? isAr
                                ? 'كلمة مرور مشفرة ✓'
                                : 'PBKDF2 Secured ✓'
                              : isAr
                              ? 'يتطلب تعيين كلمة مرور'
                              : 'Password Unset'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-stone-400 font-mono text-[10px]">
                          <span className="truncate" dir="ltr">@{store.account?.username || store.slug}</span>
                          {store.account?.ownerEmail && (
                            <span className="truncate flex items-center gap-1" dir="ltr">
                              <Mail className="w-3 h-3 shrink-0" />
                              {store.account.ownerEmail}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Business & Operations Summary */}
                      <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50/90 p-3 rounded-2xl border border-stone-200/70">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-semibold text-stone-800 truncate">
                              {store.city}
                              {store.district ? ` • ${store.district}` : ''}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 shrink-0">
                            {isAr ? themeMeta.nameAr.split('(')[0].trim() : themeMeta.nameEn}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="flex items-center gap-1.5 text-stone-600">
                            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span dir="ltr">{store.workingHours || '09:00 AM - 11:30 PM'}</span>
                          </span>
                          <span className="font-semibold text-stone-700">
                            {Number(store.deliveryFee || 0) === 0
                              ? isAr
                                ? 'توصيل مجاني'
                                : 'Free Delivery'
                              : isAr
                              ? `توصيل ${store.deliveryFee} ر.س`
                              : `${store.deliveryFee} SAR Delivery`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-mono text-[11px] text-stone-700" dir="ltr">
                              +{store.phone}
                            </span>
                          </div>
                          {store.crNumber && (
                            <span className="text-[10px] font-mono text-stone-500">
                              {isAr ? `س.ت: ${store.crNumber}` : `CR: ${store.crNumber}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Storefront Links & Actions */}
                    <div className="p-4 bg-gradient-to-b from-stone-50/50 to-stone-100/60 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isAr ? 'الرابط الخاص لموقع المحل:' : 'Dedicated Store Website Link:'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-stone-500" dir="ltr">?store={store.slug}</span>
                      </div>

                      {/* Shareable Portable URL Box */}
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-stone-200 shadow-inner">
                        <input
                          type="text"
                          readOnly
                          dir="ltr"
                          value={directUrl}
                          className="flex-1 bg-transparent px-2.5 py-1 text-[11px] font-mono text-stone-600 outline-none truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopy(portableUrl, `portable-${store.id}`)}
                          className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                            isCopiedPortable
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-900 hover:bg-stone-800 text-amber-300'
                          }`}
                          title={isAr ? 'نسخ رابط يعمل عبر الأجهزة' : 'Copy Cross-Device Link'}
                        >
                          {isCopiedPortable ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedPortable ? (isAr ? 'تم!' : 'Copied') : isAr ? 'نسخ الرابط' : 'Copy URL'}</span>
                        </button>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSwitchToStore && onSwitchToStore(store)}
                            className="py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300/80 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            title={isAr ? 'فتح ومعاينة موقع هذا المحل' : 'Launch Storefront'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAr ? 'معاينة' : 'Launch'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setQrMode('portable');
                              setQrModalStore(store);
                            }}
                            className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 cursor-pointer"
                            title={isAr ? 'كود QR لموقع المتجر' : 'Store QR Code'}
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(gmapsUrl, `gmaps-${store.id}`)}
                            className={`p-1.5 rounded-xl border text-xs cursor-pointer ${
                              isCopiedGmaps
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                            }`}
                            title={isAr ? 'نسخ رابط خرائط قوقل' : 'Copy Google Maps Link'}
                          >
                            {isCopiedGmaps ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRotateTargetStore(store);
                              setRotateNewPassword(generateStrongPassword(14));
                              setShowRotatePassword(true);
                              setRotateError('');
                            }}
                            className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-700 cursor-pointer"
                            title={isAr ? 'تعيين أو تدوير كلمة مرور الحساب' : 'Set / Rotate Password'}
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {!store.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleToggleAccount(store)}
                              className={`p-1.5 rounded-xl border bg-white cursor-pointer ${
                                acctStatus === 'active'
                                  ? 'border-stone-200 text-stone-600 hover:text-amber-700 hover:bg-amber-50'
                                  : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={
                                acctStatus === 'active'
                                  ? isAr
                                    ? 'إيقاف الحساب مؤقتاً'
                                    : 'Suspend Account'
                                  : isAr
                                  ? 'تفعيل الحساب'
                                  : 'Activate Account'
                              }
                            >
                              {acctStatus === 'active' ? (
                                <PauseCircle className="w-4 h-4" />
                              ) : (
                                <PlayCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(store)}
                            className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 cursor-pointer"
                            title={isAr ? 'تعديل المتجر والحساب' : 'Edit Store & Account'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {!store.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setStoreToDelete(store)}
                              className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 cursor-pointer"
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

            {filteredStores.length === 0 && (
              <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-6">
                <Store className="w-12 h-12 text-stone-300 mx-auto" />
                <h4 className="font-serif font-bold text-base text-stone-800">
                  {isAr ? 'لا توجد متاجر تطابق بحثك' : 'No stores match your filters'}
                </h4>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="py-2 px-4 rounded-xl bg-stone-900 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إنشاء موقع وحساب محل جديد' : 'Create New Store & Account'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB B: SECURITY CENTER & AUDIT TRAIL                      */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Production Architecture Disclosure Banner */}
            <div className="p-5 rounded-3xl bg-stone-950 text-white border border-amber-400/30 shadow-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100">
                    {isAr
                      ? 'بنية الأمان المطبقة وجاهزية الخادم السحابي'
                      : 'Active Security Architecture & Cloud Readiness'}
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {isAr
                      ? 'تُحفظ كلمات المرور بتشفير PBKDF2-SHA256 (100,000 دورة + مملحة عشوائية 16 بايت)، وتُوقع الجلسات بـ HMAC-SHA256 لمدة 15 دقيقة مع عزل صلاحيات المتاجر وحماية CSRF وXSS وMagic Bytes. وللتشغيل العام عبر جميع المستخدمين والأجهزة، يلزم ربط قاعدة البيانات السحابية (Supabase PostgreSQL + RLS في database/schema_and_rls.sql).'
                      : 'Passwords are stored exclusively as PBKDF2-SHA256 hashes (100k iterations + 16-byte CSPRNG salt) with 15m HMAC-SHA256 tenant-scoped sessions, CSRF, Zod, XSS & Magic Bytes guards. For global multi-device cloud persistence, connect Supabase using database/schema_and_rls.sql.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Rotate Super Admin Password Card */}
              <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <h3 className="font-serif font-bold text-sm text-stone-900">
                    {isAr ? 'تغيير كلمة مرور مدير المنصة' : 'Rotate Super Admin Password'}
                  </h3>
                </div>

                <form onSubmit={handleSuperAdminRotate} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {isAr ? 'كلمة المرور الحالية' : 'Current Password'}
                    </label>
                    <input
                      type="password"
                      required
                      dir="ltr"
                      value={saCurrentPwd}
                      onChange={(e) => setSaCurrentPwd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-stone-700">
                        {isAr ? 'كلمة المرور الجديدة القوية' : 'New Strong Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setSaNewPwd(generateStrongPassword(14))}
                        className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
                      >
                        {isAr ? 'توليد' : 'Generate'}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={saNewPwd}
                      onChange={(e) => setSaNewPwd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  {saMsg.text && (
                    <div
                      className={`p-2.5 rounded-xl text-[11px] font-semibold border ${
                        saMsg.type === 'success'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      {saMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 font-bold text-xs cursor-pointer"
                  >
                    {isAr ? 'تحديث وتشفير كلمة المرور' : 'Update Super Admin Password'}
                  </button>
                </form>
              </div>

              {/* Security Audit Trail Table */}
              <div className="lg:col-span-2 p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-serif font-bold text-sm text-stone-900">
                      {isAr ? 'سجل التدقيق الأمني المباشر' : 'Live Security Audit Trail'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {auditLogs.length} {isAr ? 'سجل' : 'events'}
                  </span>
                </div>

                {auditLogs.length === 0 ? (
                  <p className="text-xs text-stone-500 py-8 text-center">
                    {isAr ? 'لا توجد أحداث مسجلة بعد.' : 'No audit events recorded yet.'}
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-2 pe-1">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
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
                            <span className="font-mono text-[10px] text-stone-500">
                              @{log.actor}
                            </span>
                            {log.targetLabel && (
                              <span className="text-[11px] font-bold text-stone-800 truncate">
                                • {log.targetLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 leading-relaxed">{log.details}</p>
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
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: COMPLETE STORE WEBSITE & ACCOUNT BUILDER         */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[93vh]"
            >
              {/* Builder Header */}
              <div className="bg-stone-950 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100">
                      {editingStore
                        ? isAr
                          ? `تعديل موقع وحساب: ${editingStore.nameAr}`
                          : `Edit Store & Account: ${editingStore.nameEn}`
                        : isAr
                        ? 'إنشاء موقع محل ورود جديد + حساب المالك'
                        : 'Create Flower Shop Website & Owner Account'}
                    </h3>
                    <span className="text-[11px] text-stone-400 block">
                      {isAr
                        ? 'توليد رابط مخصص، هوية بصرية، بيانات رسمية، وحساب دخول مشفر'
                        : 'Generates unique storefront URL, visual theme, business profile & encrypted credentials'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Mini Storefront Preview Strip */}
              <div
                className="px-5 py-3 border-b flex items-center justify-between gap-3 shrink-0"
                style={{
                  backgroundColor: activeThemePreview.canvasBg || '#FAF8F5',
                  color: activeThemePreview.textPrimary || '#1C1917',
                  borderColor: activeThemePreview.surfaceBorder || '#E7E5E4',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 overflow-hidden"
                    style={{
                      backgroundColor: activeThemePreview.accentPrimary || '#022C22',
                      color: activeThemePreview.accentPrimaryText || '#FFFFFF',
                    }}
                  >
                    {formLogoUrl ? (
                      <img src={formLogoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (formNameAr || 'ور').slice(0, 2)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">
                      {(isAr ? formNameAr : formNameEn) || (isAr ? 'اسم محل الورود' : 'Flower Shop Name')}
                    </p>
                    <p className="text-[10px] opacity-75 truncate font-mono" dir="ltr">
                      ?store={formSlug || 'your-store-slug'}
                    </p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    backgroundColor: activeThemePreview.accentPrimary || '#022C22',
                    color: activeThemePreview.accentPrimaryText || '#FFFFFF',
                  }}
                >
                  {isAr ? 'معاينة الهوية الحية' : 'Live Brand Preview'}
                </span>
              </div>

              {/* Section Tabs */}
              <div className="px-5 pt-3 flex gap-2 border-b border-stone-100 shrink-0 overflow-x-auto no-scrollbar">
                {[
                  { id: 'identity', ar: '١. الهوية والتصميم', en: '1. Identity & Theme' },
                  { id: 'business', ar: '٢. النشاط والتوصيل', en: '2. Business & Delivery' },
                  { id: 'account', ar: '٣. حساب المالك والأمان', en: '3. Owner Account & Security' },
                ].map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setFormStep(step.id)}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      formStep === step.id
                        ? 'border-amber-500 text-stone-950'
                        : 'border-transparent text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    {isAr ? step.ar : step.en}
                  </button>
                ))}
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveStoreSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* STEP 1: IDENTITY & DESIGN */}
                {formStep === 'identity' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'اسم المحل بالعربي *' : 'Store Name (Arabic) *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formNameAr}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormNameAr(val);
                            if (!editingStore && !formSlug) {
                              setFormSlug(normalizeSlug(val));
                            }
                          }}
                          placeholder={isAr ? 'مثال: بوتيك روزانا للأزهار' : 'e.g. Rosana Boutique'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'اسم المحل بالإنجليزي *' : 'Store Name (English) *'}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={formNameEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormNameEn(val);
                            if (!editingStore) {
                              const nextSlug = normalizeSlug(val);
                              if (nextSlug) setFormSlug(nextSlug);
                              if (!formUsername) setFormUsername(`${nextSlug.replace(/-/g, '_')}_owner`);
                            }
                          }}
                          placeholder="e.g. Rosana Floral Atelier"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'معرّف الرابط الخاص (Slug) *' : 'Unique Store URL Slug *'}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={formSlug}
                          onChange={(e) => setFormSlug(normalizeSlug(e.target.value))}
                          placeholder="rosana-floral"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'اللغة الافتراضية للموقع' : 'Default Storefront Language'}
                        </label>
                        <select
                          value={formDefaultLang}
                          onChange={(e) => setFormDefaultLang(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-500"
                        >
                          <option value="ar">{isAr ? 'العربية (RTL)' : 'Arabic (RTL)'}</option>
                          <option value="en">{isAr ? 'الإنجليزية (LTR)' : 'English (LTR)'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'الوصف التعريفي (عربي)' : 'Brand Tagline (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={formTaglineAr}
                          onChange={(e) => setFormTaglineAr(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'الوصف التعريفي (إنجليزي)' : 'Brand Tagline (English)'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={formTaglineEn}
                          onChange={(e) => setFormTaglineEn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Logo Upload + Safe URL */}
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isAr ? 'شعار المحل (مفحوص بـ Magic Bytes)' : 'Store Logo (Magic Bytes Verified)'}
                        </label>
                        <label className="text-[11px] font-bold text-amber-800 hover:underline inline-flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isAr ? 'رفع صورة شعار' : 'Upload Image'}</span>
                          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>
                      <input
                        type="text"
                        dir="ltr"
                        value={formLogoUrl.startsWith('data:image/') ? '' : formLogoUrl}
                        onChange={(e) => setFormLogoUrl(e.target.value)}
                        placeholder={
                          formLogoUrl.startsWith('data:image/')
                            ? isAr
                              ? '✓ تم رفع ملف الشعار بأمان'
                              : '✓ Secure image file uploaded'
                            : 'https://example.com/logo.webp'
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Theme & Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'ثيم المتجر' : 'Storefront Theme'}
                        </label>
                        <select
                          value={formTheme}
                          onChange={(e) => setFormTheme(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-500"
                        >
                          {THEME_OPTIONS.map((th) => (
                            <option key={th.id} value={th.id}>
                              {isAr ? th.nameAr : th.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'تصميم الهيدر' : 'Hero Style'}
                        </label>
                        <select
                          value={formHeroStyle}
                          onChange={(e) => setFormHeroStyle(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-500"
                        >
                          {HERO_OPTIONS.map((h) => (
                            <option key={h.id} value={h.id}>
                              {isAr ? h.ar : h.en}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'شريط العروض' : 'Specials Carousel'}
                        </label>
                        <select
                          value={formSpecialsStyle}
                          onChange={(e) => setFormSpecialsStyle(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-500"
                        >
                          {SPECIALS_OPTIONS.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                              {isAr ? sp.ar : sp.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: BUSINESS, LEGAL & DELIVERY */}
                {formStep === 'business' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'رقم واتساب الطلبات *' : 'Orders WhatsApp Number *'}
                        </label>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="966500000000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'رقم خدمة العملاء (اختياري)' : 'Customer Support Phone'}
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={formSupportPhone}
                          onChange={(e) => setFormSupportPhone(e.target.value)}
                          placeholder="966500000000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'المدينة *' : 'City *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formCity}
                          onChange={(e) => setFormCity(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'الحي' : 'District'}
                        </label>
                        <input
                          type="text"
                          value={formDistrict}
                          onChange={(e) => setFormDistrict(e.target.value)}
                          placeholder={isAr ? 'حي النرجس' : 'Al-Narjis'}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'ساعات العمل' : 'Working Hours'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={formWorkingHours}
                          onChange={(e) => setFormWorkingHours(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {isAr ? 'العنوان التفصيلي للفرع' : 'Branch Street Address'}
                      </label>
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder={isAr ? 'شارع الملك فهد، مجمع البوليفارد' : 'King Fahd Road, Boulevard Complex'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'السجل التجاري / وثيقة العمل الحر' : 'Commercial Reg / Freelance ID'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={formCrNumber}
                          onChange={(e) => setFormCrNumber(e.target.value)}
                          placeholder="1010892001"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'الرقم الضريبي (15 رقم - اختياري)' : 'VAT Tax Number (15 digits)'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={formVatNumber}
                          onChange={(e) => setFormVatNumber(e.target.value)}
                          placeholder="300000000000003"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'رسوم التوصيل (ر.س)' : 'Delivery Fee (SAR)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="500"
                          value={formDeliveryFee}
                          onChange={(e) => setFormDeliveryFee(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'مجاني فوق (ر.س)' : 'Free Over (SAR)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={formMinFreeDelivery}
                          onChange={(e) => setFormMinFreeDelivery(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'مدة التجهيز (د)' : 'Prep Time (mins)'}
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="360"
                          value={formPrepMinutes}
                          onChange={(e) => setFormPrepMinutes(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'رابط خرائط قوقل (HTTPS)' : 'Google Maps URL (HTTPS)'}
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={formGoogleMapsUrl}
                          onChange={(e) => setFormGoogleMapsUrl(e.target.value)}
                          placeholder="https://maps.google.com/?q=..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'رابط انستقرام (HTTPS)' : 'Instagram URL (HTTPS)'}
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={formInstagramUrl}
                          onChange={(e) => setFormInstagramUrl(e.target.value)}
                          placeholder="https://instagram.com/..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {isAr ? 'الحالة التشغيلية للطلبات' : 'Operational Status'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'open', ar: 'مفتوح للطلبات', en: 'Open' },
                          { id: 'busy_60m', ar: 'مشغول (60 د)', en: 'Busy (60m)' },
                          { id: 'closed', ar: 'مغلق مؤقتاً', en: 'Closed' },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setFormStatus(st.id)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                              formStatus === st.id
                                ? 'bg-stone-950 text-amber-300 border-stone-950'
                                : 'bg-stone-50 text-stone-600 border-stone-200'
                            }`}
                          >
                            {isAr ? st.ar : st.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: MERCHANT OWNER ACCOUNT & CREDENTIALS */}
                {formStep === 'account' && (
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-stone-950 text-stone-200 text-[11px] flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>
                        {isAr
                          ? 'يتم تشفير كلمة مرور صاحب المحل فوراً بخوارزمية PBKDF2-SHA256 (100,000 دورة + مملحة عشوائية) ولا تُحفظ كنص مكشوف أبداً.'
                          : 'Owner password is hashed immediately with PBKDF2-SHA256 (100k iterations + CSPRNG salt). Plaintext is never stored.'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'اسم مالك / مدير المحل *' : 'Owner / Manager Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formOwnerName}
                          onChange={(e) => setFormOwnerName(e.target.value)}
                          placeholder={isAr ? 'مثال: سارة العتيبي' : 'e.g. Sarah Al-Otaibi'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'البريد الإلكتروني للمالك *' : 'Owner Email *'}
                        </label>
                        <input
                          type="email"
                          required
                          dir="ltr"
                          value={formOwnerEmail}
                          onChange={(e) => setFormOwnerEmail(e.target.value)}
                          placeholder="owner@flowershop.sa"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'اسم المستخدم للدخول *' : 'Login Username *'}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={formUsername}
                          onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                          placeholder="rosana_owner"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'جوال المالك الشخصي' : 'Owner Personal Mobile'}
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={formOwnerPhone}
                          onChange={(e) => setFormOwnerPhone(e.target.value)}
                          placeholder="966500000000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'الدور والصلاحية (RBAC)' : 'Account Role (RBAC)'}
                        </label>
                        <select
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-500"
                        >
                          <option value="store_owner">
                            {isAr ? 'مالك المحل (إدارة المتجر فقط)' : 'Store Owner (Scoped to Store)'}
                          </option>
                          <option value="store_manager">
                            {isAr ? 'مدير فرع (إدارة المتجر فقط)' : 'Store Manager (Scoped to Store)'}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          {isAr ? 'حالة الحساب' : 'Account Status'}
                        </label>
                        <select
                          value={formAccountStatus}
                          onChange={(e) => setFormAccountStatus(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white outline-none focus:border-amber-500"
                        >
                          <option value="active">{isAr ? 'نشط ومفعل' : 'Active'}</option>
                          <option value="pending">{isAr ? 'قيد المراجعة' : 'Pending'}</option>
                          <option value="suspended">{isAr ? 'موقوف' : 'Suspended'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Strong Password Provisioning */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-stone-700">
                          {editingStore
                            ? isAr
                              ? 'تعيين كلمة مرور جديدة (اتركه فارغاً للإبقاء على الحالية)'
                              : 'Set New Password (leave blank to keep current)'
                            : isAr
                            ? 'كلمة المرور القوية للحساب *'
                            : 'Strong Account Password *'}
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
                          <span>{isAr ? 'توليد تلقائي آمن' : 'Generate Strong'}</span>
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
                        <div className="space-y-1.5 pt-1">
                          <div className="grid grid-cols-4 gap-1">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`h-1.5 rounded-full ${
                                  formPwdStrength.score >= step
                                    ? formPwdStrength.score === 4
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                    : 'bg-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                            {[
                              { ok: formPwdStrength.checks.length, ar: '10+ خانات', en: '10+ chars' },
                              { ok: formPwdStrength.checks.upperLower, ar: 'أحرف كبيرة وصغيرة', en: 'Upper & lower' },
                              { ok: formPwdStrength.checks.digit, ar: 'رقم', en: 'Digit' },
                              { ok: formPwdStrength.checks.symbol, ar: 'رمز خاص (!@#)', en: 'Symbol' },
                            ].map((c, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-md font-semibold ${
                                  c.ok
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-stone-100 text-stone-500'
                                }`}
                              >
                                {c.ok ? '✓ ' : ''}
                                {isAr ? c.ar : c.en}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {formStep !== 'identity' && (
                      <button
                        type="button"
                        onClick={() => setFormStep(formStep === 'account' ? 'business' : 'identity')}
                        className="py-2.5 px-3.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                      >
                        {isAr ? 'السابق' : 'Previous'}
                      </button>
                    )}
                    {formStep !== 'account' && (
                      <button
                        type="button"
                        onClick={() => setFormStep(formStep === 'identity' ? 'business' : 'account')}
                        className="py-2.5 px-4 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 cursor-pointer"
                      >
                        {isAr ? 'التالي ←' : 'Next →'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="py-2.5 px-5 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>
                        {editingStore
                          ? isAr
                            ? 'حفظ التغييرات'
                            : 'Save Changes'
                          : isAr
                          ? 'إنشاء الموقع والحساب'
                          : 'Create Site & Account'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: ONE-TIME CREDENTIAL HANDOFF CARD                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {handoffInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-300 overflow-hidden"
            >
              <div className="bg-stone-950 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-amber-100">
                      {isAr ? 'تم إنشاء الموقع والحساب بأمان!' : 'Storefront & Account Ready!'}
                    </h4>
                    <span className="text-[11px] text-stone-400 block">
                      {isAr ? handoffInfo.store.nameAr : handoffInfo.store.nameEn}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHandoffInfo(null)}
                  className="text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium text-[11px] leading-relaxed">
                  {isAr
                    ? 'احفظ هذه البيانات الآن وسلّمها لصاحب المحل: كلمة المرور تظهر لمرة واحدة فقط ولن يمكن عرضها لاحقاً بعد التشفير.'
                    : 'Copy these credentials now: the plaintext password is displayed once and cannot be retrieved after PBKDF2 hashing.'}
                </div>

                <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 font-mono text-[11px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500 font-sans">{isAr ? 'اسم المستخدم:' : 'Username:'}</span>
                    <span className="font-bold text-stone-900">{handoffInfo.username}</span>
                  </div>
                  {handoffInfo.passwordPlain && (
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-sans">{isAr ? 'كلمة المرور:' : 'Password:'}</span>
                      <span className="font-bold text-emerald-700 select-all">{handoffInfo.passwordPlain}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <span className="text-stone-500 font-sans block">{isAr ? 'رابط موقع المتجر:' : 'Storefront URL:'}</span>
                    <span className="text-[10px] text-stone-700 break-all block select-all" dir="ltr">
                      {handoffInfo.portableUrl}
                    </span>
                  </div>
                  <div className="pt-1 space-y-1">
                    <span className="text-stone-500 font-sans block">{isAr ? 'رابط لوحة إدارة المتجر:' : 'Store Admin URL:'}</span>
                    <span className="text-[10px] text-stone-700 break-all block select-all" dir="ltr">
                      {handoffInfo.adminUrl}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const pack = isAr
                        ? `تم تجهيز موقع متجرك (${handoffInfo.store.nameAr}) بنجاح!\nرابط المتجر للعملاء:\n${handoffInfo.portableUrl}\n\nرابط لوحة الإدارة:\n${handoffInfo.adminUrl}\nاسم المستخدم: ${handoffInfo.username}\nكلمة المرور: ${handoffInfo.passwordPlain || '(كما تم تعيينها)'}`
                        : `Your flower storefront (${handoffInfo.store.nameEn}) is live!\nCustomer Link:\n${handoffInfo.portableUrl}\n\nAdmin Portal:\n${handoffInfo.adminUrl}\nUsername: ${handoffInfo.username}\nPassword: ${handoffInfo.passwordPlain || '(unchanged)'}`;
                      handleCopy(pack, 'handoff-pack');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-stone-950 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'handoff-pack' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>
                      {copiedKey === 'handoff-pack'
                        ? isAr
                          ? 'تم نسخ الحزمة الكاملة!'
                          : 'Copied Welcome Pack!'
                        : isAr
                        ? 'نسخ بيانات الدخول والرابط'
                        : 'Copy Credentials & URLs'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHandoffInfo(null)}
                    className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs cursor-pointer"
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
      {/* MODAL 3: REAL SCANNABLE QR CODE STUDIO                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {qrModalStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
            >
              <div className="bg-stone-950 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <h4 className="font-serif font-bold text-sm text-amber-100">
                    {isAr ? qrModalStore.nameAr : qrModalStore.nameEn}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalStore(null)}
                  className="text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-center">
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-stone-100 text-[11px] font-bold">
                  {[
                    { id: 'portable', ar: 'رابط شامل', en: 'Portable' },
                    { id: 'direct', ar: 'رابط مختصر', en: 'Short URL' },
                    { id: 'gmaps', ar: 'قوقل ماب', en: 'Google Maps' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setQrMode(m.id)}
                      className={`py-1.5 rounded-lg cursor-pointer ${
                        qrMode === m.id ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      {isAr ? m.ar : m.en}
                    </button>
                  ))}
                </div>

                {/* Rendered Scannable SVG QR */}
                <div className="p-4 rounded-2xl bg-white border-2 border-amber-300/60 inline-block shadow-sm">
                  {activeQrSvg ? (
                    <div
                      className="w-56 h-56 mx-auto [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: activeQrSvg }}
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-xs text-stone-400">
                      QR...
                    </div>
                  )}
                </div>

                <p className="text-[10px] font-mono text-stone-500 break-all px-2" dir="ltr">
                  {qrTargetUrl}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadQrSvg}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-950 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAr ? 'تحميل SVG' : 'Download SVG'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2.5 px-3.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                  <h4 className="font-serif font-bold text-sm text-stone-900">
                    {isAr ? 'تدوير كلمة مرور المتجر' : 'Rotate Store Password'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setRotateTargetStore(null)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600">
                {isAr
                  ? `الحساب: @${rotateTargetStore.account?.username} (${rotateTargetStore.nameAr})`
                  : `Account: @${rotateTargetStore.account?.username} (${rotateTargetStore.nameEn})`}
              </p>

              {rotateError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-[11px] font-semibold">
                  {rotateError}
                </div>
              )}

              <form onSubmit={handleRotateStorePasswordSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700">
                      {isAr ? 'كلمة المرور الجديدة' : 'New Strong Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setRotateNewPassword(generateStrongPassword(14));
                        setShowRotatePassword(true);
                      }}
                      className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
                    >
                      {isAr ? 'توليد قوية' : 'Generate'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showRotatePassword ? 'text' : 'password'}
                      dir="ltr"
                      required
                      value={rotateNewPassword}
                      onChange={(e) => setRotateNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pe-9 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRotatePassword(!showRotatePassword)}
                      className="absolute end-2.5 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer"
                    >
                      {showRotatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {rotateNewPassword.length > 0 && (
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1 rounded-full ${
                            rotatePwdStrength.score >= step
                              ? rotatePwdStrength.score === 4
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                              : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRotateTargetStore(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-stone-950 text-amber-300 font-bold text-xs cursor-pointer"
                  >
                    {isAr ? 'تحديث التشفير' : 'Rotate & Hash'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 5: DELETE CONFIRMATION                              */}
      {/* ========================================================= */}
      <AnimatePresence>
        {storeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  {isAr ? 'تأكيد حذف المتجر والحساب؟' : 'Confirm Store & Account Deletion?'}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  {isAr
                    ? `هل أنت متأكد من حذف «${storeToDelete.nameAr}» وإلغاء صلاحية حساب @${storeToDelete.account?.username}؟`
                    : `Are you sure you want to delete "${storeToDelete.nameEn}" and revoke @${storeToDelete.account?.username}?`}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStoreToDelete(null)}
                  className="py-2 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'تراجع' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  {isAr ? 'نعم، احذف نهائياً' : 'Yes, Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
