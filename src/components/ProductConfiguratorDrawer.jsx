import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  ShoppingBag,
  Truck,
  Store,
  Gift,
  Palette,
  Sparkles,
  ShieldCheck,
  Phone,
  User,
  Clock,
  Moon,
  Sun,
  Flower2,
  Maximize2,
  ZoomIn,
  Minus,
  Plus,
  Heart,
  GraduationCap,
  Baby,
  Feather,
  Camera,
  MapPin,
  Crown,
  Ruler,
} from 'lucide-react';
import {
  IMPULSE_ADDONS,
  FLOWER_COLOR_OPTIONS,
  WRAP_COLOR_OPTIONS,
  GIFT_CARD_TEMPLATES,
} from '../data/mockData';
import { t } from '../utils/translations';
import { useStoreTheme } from '../context/StoreThemeContext';
import WhatsAppIcon from './WhatsAppIcon';

// Product format taxonomy labels (covers all catalog & admin-created product types)
const PRODUCT_TYPE_LABELS = {
  bouquet: { ar: 'باقة يدوية فاخرة', en: 'Handcrafted Bouquet' },
  vase: { ar: 'فازة زجاجية فاخرة', en: 'Luxury Glass Vase' },
  box: { ar: 'بوكس وصندوق هدايا', en: 'Luxury Gift Box' },
  chocolate: { ar: 'شوكولاتة وورد فاخر', en: 'Chocolates & Florals' },
  bridal: { ar: 'مسكة عروس فاخرة', en: 'Bridal Couture' },
  stands: { ar: 'ستاند مناسبات ملكي', en: 'Royal Floral Stand' },
  default: { ar: 'تنسيق دار الورد الحصري', en: 'Atelier Signature Piece' },
};

const CARD_CATEGORIES = [
  { id: 'love', labelAr: 'حب وامتنان', labelEn: 'Love', icon: Heart },
  { id: 'graduation', labelAr: 'تخرج', labelEn: 'Graduation', icon: GraduationCap },
  { id: 'birthday', labelAr: 'ميلاد', labelEn: 'Birthday', icon: Sparkles },
  { id: 'newborn', labelAr: 'مولود', labelEn: 'Newborn', icon: Baby },
  { id: 'recovery', labelAr: 'سلامة', labelEn: 'Recovery', icon: Flower2 },
];

const TOMORROW_SLOTS = [
  { id: 'morning', labelAr: 'صباحاً (٩–١٢)', labelEn: 'Morning (9–12)' },
  { id: 'afternoon', labelAr: 'عصراً (٤–٧)', labelEn: 'Afternoon (4–7)' },
  { id: 'evening', labelAr: 'مساءً (٨–١١)', labelEn: 'Evening (8–11)' },
];

const ADDON_ICONS = {
  'addon-topper': Crown,
  'addon-balloon': Sparkles,
  'addon-chocolate': Gift,
};

/**
 * Computes WCAG-safe foreground text color (#FFFFFF or #111827) for any hex background.
 */
function getContrastText(hex) {
  if (!hex || typeof hex !== 'string') return '#FFFFFF';
  const clean = hex.trim().replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return '#FFFFFF';
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#FFFFFF';
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#111827' : '#FFFFFF';
}

/**
 * Reusable Atelier Section Header with tinted icon medallion.
 */
function SectionHeader({ icon: Icon, title, badge, badgeTone = 'neutral' }) {
  const badgeClasses =
    badgeTone === 'gold'
      ? 'bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/30'
      : badgeTone === 'accent'
      ? 'border-[color-mix(in_srgb,var(--accent-primary,#7E1529)_22%,transparent)]'
      : 'bg-stone-500/8 text-stone-600 dark:text-stone-400 border-stone-500/15';

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-primary, #7E1529) 9%, transparent)',
            borderColor: 'color-mix(in srgb, var(--accent-primary, #7E1529) 18%, transparent)',
            color: 'var(--accent-primary, #7E1529)',
          }}
        >
          <Icon className="w-3.5 h-3.5 stroke-[2.1]" />
        </span>
        <span className="text-xs sm:text-[13px] font-bold tracking-tight truncate">
          {title}
        </span>
      </div>

      {badge && (
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${badgeClasses}`}
          style={
            badgeTone === 'accent'
              ? {
                  backgroundColor:
                    'color-mix(in srgb, var(--accent-primary, #7E1529) 9%, transparent)',
                  color: 'var(--accent-primary, #7E1529)',
                }
              : undefined
          }
        >
          {badge}
        </span>
      )}
    </div>
  );
}

export default function ProductConfiguratorDrawer({
  product,
  isOpen,
  onClose,
  onAddToBag,
  onDirectWhatsAppCheckout,
  lang = 'ar',
  theme = {},
  _theme = {},
}) {
  const isAr = lang === 'ar';
  const strings = t[lang] || t.ar;

  let studioCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    studioCtx = useStoreTheme();
  } catch {
    // fallback if rendered outside StudioThemeProvider
  }

  const activeTheme = Object.keys(theme || {}).length ? theme : _theme;

  // Resolve live CSS variables so contrast & surfaces always match the actual rendered palette
  const [resolvedColors, setResolvedColors] = useState({
    accent: '#7E1529',
    surface: '#FFFFFF',
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const styles = getComputedStyle(document.documentElement);
    const computedAccent = styles.getPropertyValue('--accent-primary').trim();
    const computedSurface = styles.getPropertyValue('--surface-card').trim();
    const fallbackAccent =
      studioCtx?.config?.colors?.primary ||
      activeTheme?.accentPrimary ||
      activeTheme?.variables?.['--accent-primary'] ||
      '#7E1529';
    const fallbackSurface =
      studioCtx?.config?.colors?.cardSurface ||
      activeTheme?.surfaceBg ||
      activeTheme?.variables?.['--surface-card'] ||
      '#FFFFFF';
    setResolvedColors({
      accent: computedAccent || fallbackAccent,
      surface: computedSurface || fallbackSurface,
    });
  }, [isOpen, studioCtx?.config?.colors?.primary, studioCtx?.config?.colors?.cardSurface, activeTheme]);

  const accentText = useMemo(() => getContrastText(resolvedColors.accent), [resolvedColors.accent]);
  const isDarkTheme = useMemo(
    () => getContrastText(resolvedColors.surface) === '#FFFFFF',
    [resolvedColors.surface]
  );

  // Explicit surface-matched tactile styles (immune to .dark class / CSS variable mismatches)
  const keycapStyle = isDarkTheme
    ? {
        background: 'linear-gradient(180deg, #2E2A27 0%, #1F1C1A 100%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 2.5px 0 #09090B, 0 4px 10px -2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
        color: 'var(--text-main, #F5F5F5)',
      }
    : {
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F4 100%)',
        border: '1px solid rgba(214, 211, 209, 0.9)',
        boxShadow: '0 2.5px 0 #D6D3D1, 0 3px 6px -1px rgba(0,0,0,0.08), inset 0 1px 0 #FFFFFF',
        color: 'var(--text-main, #1C1917)',
      };

  const trayStyle = isDarkTheme
    ? {
        background: 'linear-gradient(180deg, #12100E 0%, #1A1816 100%)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)',
      }
    : {
        background: 'linear-gradient(180deg, #EBE8E2 0%, #F5F3EE 100%)',
        borderColor: 'rgba(214, 211, 209, 0.85)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9)',
      };

  // Block 1: Preparation & Personalization
  const [orderStyle, setOrderStyle] = useState('as_is');
  const [selectedFlowerColor, setSelectedFlowerColor] = useState('as_is');
  const [selectedWrapColor, setSelectedWrapColor] = useState(
    WRAP_COLOR_OPTIONS?.[0]?.id || 'black_matte'
  );
  const [customPrintText, setCustomPrintText] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Block 2: Handover & Timing
  const [handoverType, setHandoverType] = useState('gift'); // 'gift' | 'delivery' | 'pickup'
  const [timingId, setTimingId] = useState('now'); // 'now' | 'tonight' | 'tomorrow'
  const [tomorrowSlot, setTomorrowSlot] = useState('evening');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryDistrict, setDeliveryDistrict] = useState('');

  // Block 3: Extras & Add-ons
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [topperPhrase, setTopperPhrase] = useState(
    IMPULSE_ADDONS[0]?.phrasesAr?.[0] || 'مبروك التخرج'
  );
  const [balloonType, setBalloonType] = useState(
    IMPULSE_ADDONS[1]?.typesAr?.[0] || 'قلب أحمر مخملي'
  );

  // Block 4: Greeting Card & Photo Proof
  const [cardMessage, setCardMessage] = useState('');
  const [activeCardCategory, setActiveCardCategory] = useState(null);
  const [trustPhoto, setTrustPhoto] = useState(true);

  // Image Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Reset per-product state cleanly whenever a different product opens
  const productId = product?.id;
  useEffect(() => {
    if (!isOpen || !productId) return;
    setOrderStyle('as_is');
    setSelectedFlowerColor('as_is');
    setSelectedWrapColor(WRAP_COLOR_OPTIONS?.[0]?.id || 'black_matte');
    setCustomPrintText('');
    setCustomNotes('');
    setQuantity(1);
    setHandoverType('gift');
    setTimingId('now');
    setTomorrowSlot('evening');
    setRecipientName('');
    setRecipientPhone('');
    setDeliveryDistrict('');
    setSelectedAddons([]);
    setTopperPhrase(
      isAr
        ? IMPULSE_ADDONS[0]?.phrasesAr?.[0] || 'مبروك التخرج'
        : IMPULSE_ADDONS[0]?.phrasesEn?.[0] || 'Congratulations'
    );
    setBalloonType(
      isAr
        ? IMPULSE_ADDONS[1]?.typesAr?.[0] || 'قلب أحمر مخملي'
        : IMPULSE_ADDONS[1]?.typesEn?.[0] || 'Heart Red'
    );
    setCardMessage('');
    setActiveCardCategory(null);
    setTrustPhoto(true);
    setIsLightboxOpen(false);
  }, [productId, isOpen, isAr]);

  // Escape key dismissal (closes lightbox first, then drawer)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLightboxOpen, onClose]);

  const timingOptions = [
    {
      id: 'now',
      icon: Clock,
      labelAr: 'الآن (ساعتين)',
      labelEn: 'Now (within 2h)',
    },
    {
      id: 'tonight',
      icon: Moon,
      labelAr: 'مساء اليوم',
      labelEn: 'Tonight',
    },
    {
      id: 'tomorrow',
      icon: Sun,
      labelAr: 'غداً بتوقيت محدد',
      labelEn: 'Tomorrow Scheduled',
    },
  ];

  const getEffectiveTimingLabel = () => {
    const base = timingOptions.find((opt) => opt.id === timingId);
    const baseText = base ? (isAr ? base.labelAr : base.labelEn) : '';
    if (timingId !== 'tomorrow') return baseText;
    const slot = TOMORROW_SLOTS.find((s) => s.id === tomorrowSlot);
    if (!slot) return baseText;
    return isAr ? `غداً • ${slot.labelAr}` : `Tomorrow • ${slot.labelEn}`;
  };

  // Price calculations
  const basePrice = Number(product?.price || 0);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const unitPrice = basePrice + addonsTotal;
  const grandTotal = unitPrice * quantity;
  const hasDiscount = product?.originalPrice && Number(product.originalPrice) > basePrice;
  const discountPct = hasDiscount
    ? Math.round(((Number(product.originalPrice) - basePrice) / Number(product.originalPrice)) * 100)
    : 0;

  const allowCustomColors = product?.allowCustomColors !== false;
  const allowCustomText = Boolean(product?.allowCustomText);
  const categoryInfo = PRODUCT_TYPE_LABELS[product?.productType] || PRODUCT_TYPE_LABELS.default;

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleSelectCardTemplate = (catId) => {
    setActiveCardCategory(catId);
    const tmpl = GIFT_CARD_TEMPLATES.find((item) => item.category === catId);
    if (tmpl) {
      setCardMessage(isAr ? tmpl.textAr : tmpl.textEn);
    }
  };

  const buildConfiguredItem = () => {
    let fullModificationNote = '';
    if (orderStyle === 'tweak') {
      const parts = [];
      if (allowCustomColors && selectedFlowerColor && selectedFlowerColor !== 'as_is') {
        const fc = FLOWER_COLOR_OPTIONS.find((c) => c.id === selectedFlowerColor);
        if (fc) parts.push(`${isAr ? 'لون الورد' : 'Flower Color'}: ${isAr ? fc.nameAr : fc.nameEn}`);
      }
      if (selectedWrapColor) {
        const wc = WRAP_COLOR_OPTIONS.find((w) => w.id === selectedWrapColor);
        if (wc) parts.push(`${isAr ? 'التغليف' : 'Wrap'}: ${isAr ? wc.nameAr : wc.nameEn}`);
      }
      if (customNotes.trim()) {
        parts.push(customNotes.trim());
      }
      fullModificationNote = parts.join(' • ') || (isAr ? 'تعديل مخصص' : 'Custom tweak');
    }

    const trimmedPrintText = allowCustomText ? customPrintText.trim() : '';
    const trimmedDistrict = handoverType === 'delivery' ? deliveryDistrict.trim() : '';

    return {
      ...product,
      basePrice: product.price,
      price: unitPrice,
      totalPrice: grandTotal,
      orderStyle,
      modificationNote: orderStyle === 'tweak' ? fullModificationNote : null,
      ribbonText: trimmedPrintText || null,
      addons: selectedAddons.map((addon) => {
        if (addon.id === 'addon-topper') return { ...addon, phrase: topperPhrase };
        if (addon.id === 'addon-balloon') return { ...addon, balloonType, phrase: balloonType };
        return addon;
      }),
      giftCardMessage: cardMessage.trim() || null,
      handover: {
        type: handoverType,
        timing: getEffectiveTimingLabel(),
        recipientName: handoverType === 'gift' ? recipientName.trim() : null,
        recipientPhone: handoverType === 'gift' ? recipientPhone.trim() : null,
        deliveryDistrict: trimmedDistrict || null,
        address: trimmedDistrict || null,
      },
      trustPhoto,
      quantity,
    };
  };

  const handleAddBag = () => {
    const item = buildConfiguredItem();
    onAddToBag(item);
    onClose();
  };

  const handleDirectWhatsApp = () => {
    const item = buildConfiguredItem();
    onDirectWhatsAppCheckout(item);
  };

  // Surface styles tuned for both warm alabaster/ivory light themes & noir dark themes
  const recessedSurfaceStyle = {
    backgroundColor: isDarkTheme
      ? 'rgba(255, 255, 255, 0.03)'
      : 'color-mix(in srgb, var(--bg-canvas, #FAF8F5) 86%, var(--surface-card, #FFFFFF))',
    borderColor: 'var(--border-subtle, #E7E5E4)',
  };

  const elevatedCardStyle = {
    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.045)' : 'var(--surface-card, #FFFFFF)',
    borderColor: 'var(--border-subtle, #E7E5E4)',
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div
          className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end sm:justify-center sm:items-center select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-configurator-title"
        >
          {/* 1. Frosted Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* 2. Luxury Slide-Up Sheet (Bottom Sheet on Mobile, Centered Atelier Dialog on Desktop) */}
          <motion.div
            initial={{ y: '100%', opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 360, bounce: 0 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.18 }}
            dragMomentum={false}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 95 || info.velocity.y > 360) {
                onClose();
              }
            }}
            className="relative z-10 w-full sm:max-w-[540px] mx-auto rounded-t-[2.25rem] sm:rounded-[2rem] max-h-[93vh] flex flex-col overflow-hidden"
            style={{
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              color: 'var(--text-main, #1C1917)',
              boxShadow:
                '0 -24px 65px -12px rgba(0, 0, 0, 0.36), 0 25px 50px -12px rgba(0, 0, 0, 0.28), 0 -1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* 24K Gold Crown Top Accent Line */}
            <div
              className="h-[3px] w-full shrink-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(212,175,55,0.45) 15%, rgba(253,230,138,0.95) 50%, rgba(212,175,55,0.45) 85%, transparent)',
              }}
            />

            {/* Grooved Tactile Drag Handle */}
            <div className="pt-2.5 pb-1 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-stone-300/90 dark:bg-stone-700 shadow-inner" />
            </div>

            {/* Luxury Atelier Header Bar */}
            <div
              className="px-5 pb-3.5 pt-1 flex items-center justify-between border-b shrink-0"
              style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(180deg, #2A2724 0%, #171513 55%, #0A0908 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.45)',
                    boxShadow:
                      '0 3px 8px -2px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.22)',
                  }}
                >
                  <Flower2 className="w-4.5 h-4.5 text-amber-300" />
                </div>

                <div className="min-w-0">
                  <h2
                    id="product-configurator-title"
                    className="font-bold text-base sm:text-[17px] leading-tight truncate"
                    style={{ fontFamily: "var(--font-header, 'Amiri', serif)" }}
                  >
                    {isAr ? 'تخصيص الباقة والطلب' : 'Bespoke Arrangement'}
                  </h2>
                  <p
                    className="text-[11px] font-medium truncate mt-0.5"
                    style={{ color: 'var(--text-muted, #78716C)' }}
                  >
                    {isAr
                      ? 'دار الورد • تنسيق يدوي فاخر وتوصيل مبرد'
                      : 'Maison des Fleurs • Handcrafted & Chilled Delivery'}
                  </p>
                </div>
              </div>

              {/* 3D Tactile Close Keycap */}
              <button
                onClick={onClose}
                type="button"
                aria-label={isAr ? 'إغلاق' : 'Close'}
                className="tactile-btn w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0"
                style={keycapStyle}
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 no-scrollbar">
              {/* ========================================================
                  BLOCK 1: Editorial Product Showcase + Quantity Stepper
                 ======================================================== */}
              <div
                className="p-3.5 sm:p-4 rounded-2xl border relative overflow-hidden shadow-xs transition-colors"
                style={recessedSurfaceStyle}
              >
                {/* Delicate top gold accent shimmer */}
                <div
                  className="absolute inset-x-0 top-0 h-[1.5px] opacity-60 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--accent-gold, #D4AF37), transparent)',
                  }}
                />

                <div className="flex gap-3.5 sm:gap-4 items-start">
                  {/* Beveled Gallery Thumbnail with Tap-to-Zoom (No Price Stamp Blocking Photo!) */}
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    aria-label={isAr ? 'تكبير صورة الباقة' : 'Enlarge arrangement photo'}
                    className="group relative w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 p-[2px] cursor-pointer active:scale-[0.98] transition-transform"
                    style={{
                      background:
                        'linear-gradient(145deg, rgba(212,175,55,0.45), rgba(212,175,55,0.12) 55%, rgba(0,0,0,0.08))',
                      boxShadow: '0 8px 20px -6px rgba(0,0,0,0.18)',
                    }}
                  >
                    <div className="w-full h-full rounded-[14px] overflow-hidden relative bg-stone-100 dark:bg-stone-800">
                      <img
                        src={product.image}
                        alt={isAr ? product.titleAr : product.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = './images/products/royal-red-roses.jpg';
                        }}
                      />
                      <span
                        className="absolute bottom-1.5 end-1.5 w-6 h-6 rounded-full bg-stone-950/65 backdrop-blur-md text-white flex items-center justify-center border border-white/25 opacity-90 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </span>
                    </div>
                  </button>

                  {/* Editorial Info Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                    <div>
                      {/* Category Eyebrow + Readiness / Scarcity Pill */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className="text-[10px] font-bold tracking-wide"
                          style={{ color: 'var(--accent-gold, #D4AF37)' }}
                        >
                          {isAr ? categoryInfo.ar : categoryInfo.en}
                        </span>

                        {(product.isOneTimeSpecial || product.coolerStock === 1) ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            {isAr ? 'قطعة واحدة فقط' : '1 Piece Only'}
                          </span>
                        ) : product.isReadyNow ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>
                              {isAr ? 'جاهز للاستلام الفوري' : 'Ready Today'}
                            </span>
                          </span>
                        ) : (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                            style={{
                              borderColor: 'var(--border-subtle, #E7E5E4)',
                              color: 'var(--text-muted, #78716C)',
                            }}
                          >
                            {isAr ? 'يُنسق طازجاً عند الطلب' : 'Crafted Fresh'}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="font-bold text-sm sm:text-base leading-snug"
                        style={{ fontFamily: "var(--font-header, 'Amiri', serif)" }}
                      >
                        {isAr ? product.titleAr : product.titleEn}
                      </h3>

                      {/* Concise Description */}
                      {(product.descAr || product.descEn) && (
                        <p
                          className="text-[11px] leading-relaxed line-clamp-2 mt-1"
                          style={{ color: 'var(--text-muted, #78716C)' }}
                        >
                          {isAr ? product.descAr : product.descEn}
                        </p>
                      )}
                    </div>

                    {/* Botanical Spec Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {product.stemCount && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-md font-medium border inline-flex items-center gap-1"
                          style={elevatedCardStyle}
                        >
                          <Flower2
                            className="w-3 h-3 shrink-0"
                            style={{ color: 'var(--accent-primary, #7E1529)' }}
                          />
                          <span>
                            {product.stemCount} {isAr ? 'غصن طبيعي' : 'stems'}
                          </span>
                        </span>
                      )}
                      {product.dimensions && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-md font-medium border inline-flex items-center gap-1"
                          style={elevatedCardStyle}
                        >
                          <Ruler
                            className="w-3 h-3 shrink-0"
                            style={{ color: 'var(--text-muted, #78716C)' }}
                          />
                          <span dir="ltr">{product.dimensions}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Showcase Bottom Row: Price Lockup + Precision 3D Stepper */}
                <div
                  className="mt-3 pt-3 border-t flex items-center justify-between gap-3"
                  style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-lg sm:text-xl font-black tabular-nums leading-none"
                        style={{
                          fontFamily: "var(--font-header, 'Amiri', serif)",
                          color: 'var(--accent-primary, #7E1529)',
                        }}
                      >
                        {basePrice}
                      </span>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: 'var(--text-muted, #78716C)' }}
                      >
                        {strings.sar}
                      </span>
                    </div>

                    {hasDiscount && (
                      <div className="flex items-center gap-1.5">
                        <del
                          className="text-[11px] font-mono"
                          style={{ color: 'var(--text-muted, #78716C)' }}
                        >
                          {product.originalPrice}
                        </del>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/12 text-rose-700 dark:text-rose-300 border border-rose-500/25">
                          {isAr ? `وفر ${discountPct}٪` : `Save ${discountPct}%`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tactile Quantity Stepper */}
                  <div className="rounded-xl p-1 flex items-center gap-1.5 border" style={trayStyle}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label={isAr ? 'إنقاص الكمية' : 'Decrease quantity'}
                      className="tactile-btn w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={keycapStyle}
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="text-xs font-black w-5 text-center tabular-nums select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      aria-label={isAr ? 'زيادة الكمية' : 'Increase quantity'}
                      className="tactile-btn w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                      style={keycapStyle}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  BLOCK 2: Preparation Style & Product-Specific Personalization
                 ======================================================== */}
              <div
                className="p-4 border space-y-3 rounded-2xl shadow-xs transition-colors"
                style={recessedSurfaceStyle}
              >
                <SectionHeader
                  icon={Palette}
                  title={isAr ? 'طريقة تجهيز وتنسيق الباقة' : 'Preparation & Styling'}
                  badge={
                    orderStyle === 'as_is'
                      ? isAr
                        ? 'مطابق للصورة'
                        : 'Identical'
                      : isAr
                      ? 'تخصيص خاص'
                      : 'Customized'
                  }
                  badgeTone={orderStyle === 'as_is' ? 'accent' : 'gold'}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'as_is',
                      titleAr: 'نفس الصورة بالضبط',
                      titleEn: 'Identical to Photo',
                      tagAr: 'الأسرع',
                      tagEn: 'Fastest',
                    },
                    {
                      id: 'tweak',
                      titleAr: allowCustomColors
                        ? 'تعديل الألوان والتغليف'
                        : 'تعديل التغليف والملاحظات',
                      titleEn: allowCustomColors
                        ? 'Tweak Colors & Wrap'
                        : 'Tweak Wrap & Notes',
                      tagAr: 'مجاناً',
                      tagEn: 'Free',
                    },
                  ].map((opt) => {
                    const isSel = orderStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOrderStyle(opt.id)}
                        className="min-h-[48px] py-2.5 px-3.5 border text-start rounded-xl transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98]"
                        style={{
                          backgroundColor: isSel
                            ? 'color-mix(in srgb, var(--accent-primary, #7E1529) 7%, var(--surface-card, #FFFFFF))'
                            : elevatedCardStyle.backgroundColor,
                          borderColor: isSel
                            ? 'var(--accent-primary, #7E1529)'
                            : 'var(--border-subtle, #E7E5E4)',
                          boxShadow: isSel
                            ? '0 0 0 1px var(--accent-primary, #7E1529), 0 6px 14px -4px rgba(0,0,0,0.08)'
                            : '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all border"
                            style={
                              isSel
                                ? {
                                    backgroundColor: 'var(--accent-primary, #7E1529)',
                                    borderColor: 'var(--accent-primary, #7E1529)',
                                    color: accentText,
                                  }
                                : {
                                    borderColor: 'var(--border-subtle, #D6D3D1)',
                                    color: 'transparent',
                                  }
                            }
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                          <span className="text-xs font-bold leading-snug truncate">
                            {isAr ? opt.titleAr : opt.titleEn}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            opt.id === 'as_is'
                              ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isAr ? opt.tagAr : opt.tagEn}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Expanded Color & Wrap Customization */}
                <AnimatePresence initial={false}>
                  {orderStyle === 'tweak' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="pt-3 mt-1 border-t space-y-3.5"
                        style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
                      >
                        {/* Flower Palette Swatches (if supported by product) */}
                        {allowCustomColors ? (
                          <div>
                            <span
                              className="block text-[11px] font-bold mb-2"
                              style={{ color: 'var(--text-muted, #78716C)' }}
                            >
                              {isAr ? 'درجات ألوان الورد المرغوبة:' : 'Preferred Flower Palette:'}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {FLOWER_COLOR_OPTIONS.map((fc) => {
                                const isSel = selectedFlowerColor === fc.id;
                                return (
                                  <button
                                    key={fc.id}
                                    type="button"
                                    onClick={() => setSelectedFlowerColor(fc.id)}
                                    className="min-h-[36px] text-xs px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-2 transition-all cursor-pointer active:scale-[0.97]"
                                    style={
                                      isSel
                                        ? {
                                            backgroundColor: 'var(--accent-primary, #7E1529)',
                                            borderColor: 'var(--accent-primary, #7E1529)',
                                            color: accentText,
                                            boxShadow: '0 4px 10px -2px rgba(0,0,0,0.18)',
                                          }
                                        : elevatedCardStyle
                                    }
                                  >
                                    <span
                                      className="w-4 h-4 rounded-full shrink-0 border border-black/15 dark:border-white/25 shadow-inner"
                                      style={{
                                        backgroundColor: fc.color,
                                        boxShadow: isSel
                                          ? '0 0 0 2px rgba(255,255,255,0.65)'
                                          : undefined,
                                      }}
                                    />
                                    <span className="text-[11px] font-semibold">
                                      {isAr ? fc.nameAr : fc.nameEn}
                                    </span>
                                    {isSel && <Check className="w-3 h-3 stroke-[2.8]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-2"
                            style={elevatedCardStyle}
                          >
                            <Flower2
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: 'var(--accent-gold, #D4AF37)' }}
                            />
                            <span style={{ color: 'var(--text-muted, #78716C)' }}>
                              {isAr
                                ? 'تُحفظ درجات الزهور الأصلية لهذا التصميم مع إمكانية تعديل التغليف والملاحظات.'
                                : 'Signature flower shades are preserved for this piece; you can customize wrapping & notes below.'}
                            </span>
                          </div>
                        )}

                        {/* Luxury Wrap Material Swatches */}
                        <div>
                          <span
                            className="block text-[11px] font-bold mb-2"
                            style={{ color: 'var(--text-muted, #78716C)' }}
                          >
                            {isAr ? 'خامة ولون التغليف:' : 'Wrapping & Presentation Style:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {WRAP_COLOR_OPTIONS.map((wc) => {
                              const isSel = selectedWrapColor === wc.id;
                              return (
                                <button
                                  key={wc.id}
                                  type="button"
                                  onClick={() => setSelectedWrapColor(wc.id)}
                                  className="min-h-[36px] text-xs px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-2 transition-all cursor-pointer active:scale-[0.97]"
                                  style={
                                    isSel
                                      ? {
                                          backgroundColor: 'var(--accent-primary, #7E1529)',
                                          borderColor: 'var(--accent-primary, #7E1529)',
                                          color: accentText,
                                          boxShadow: '0 4px 10px -2px rgba(0,0,0,0.18)',
                                        }
                                      : elevatedCardStyle
                                  }
                                >
                                  <span
                                    className="w-4 h-4 rounded-full shrink-0 border border-black/15 dark:border-white/25"
                                    style={{
                                      backgroundColor: wc.color,
                                      boxShadow: isSel
                                        ? '0 0 0 2px rgba(255,255,255,0.65)'
                                        : undefined,
                                    }}
                                  />
                                  <span className="text-[11px] font-semibold">
                                    {isAr ? wc.nameAr : wc.nameEn}
                                  </span>
                                  {isSel && <Check className="w-3 h-3 stroke-[2.8]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Florist Notes */}
                        <div>
                          <label
                            htmlFor="florist-custom-notes"
                            className="block text-[11px] font-bold mb-1.5"
                            style={{ color: 'var(--text-muted, #78716C)' }}
                          >
                            {isAr ? 'ملاحظات إضافية لمنسق الأزهار:' : 'Custom Florist Instructions:'}
                          </label>
                          <input
                            id="florist-custom-notes"
                            type="text"
                            value={customNotes}
                            onChange={(e) => setCustomNotes(e.target.value)}
                            placeholder={
                              isAr
                                ? 'مثال: شريطة حرير كحلية، إكثار أوراق اليوكالبتوس...'
                                : 'e.g. Navy silk ribbon, extra eucalyptus foliage...'
                            }
                            className="w-full text-xs p-3 rounded-xl border outline-hidden transition-all focus:ring-2"
                            style={{
                              ...elevatedCardStyle,
                              color: 'var(--text-main, #1C1917)',
                              '--tw-ring-color': 'var(--accent-primary, #7E1529)',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dedicated Gold Foil / Sash Lettering Input (Always surfaced when product.allowCustomText is true) */}
                {allowCustomText && (
                  <div
                    className="p-3 rounded-xl border space-y-2 mt-1"
                    style={{
                      backgroundColor: isDarkTheme
                        ? 'rgba(212, 175, 55, 0.08)'
                        : 'rgba(255, 251, 235, 0.75)',
                      borderColor: 'rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="custom-print-lettering"
                        className="text-[11px] font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>{strings.customPrintLabel}</span>
                      </label>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
                        {isAr ? 'فينيل ذهبي' : 'Gold Foil'}
                      </span>
                    </div>
                    <input
                      id="custom-print-lettering"
                      type="text"
                      value={customPrintText}
                      onChange={(e) => setCustomPrintText(e.target.value)}
                      placeholder={
                        isAr
                          ? product.customTextPlaceholderAr || 'اكتب الاسم أو العبارة للطباعة...'
                          : product.customTextPlaceholderEn || 'e.g. Happy Birthday Sarah'
                      }
                      className="w-full text-xs p-2.5 rounded-lg border outline-hidden transition-all focus:ring-2"
                      style={{
                        ...elevatedCardStyle,
                        color: 'var(--text-main, #1C1917)',
                        '--tw-ring-color': 'var(--accent-gold, #D4AF37)',
                      }}
                    />
                    <p className="text-[10px] text-amber-800/80 dark:text-amber-200/70">
                      {strings.customPrintHint}
                    </p>
                  </div>
                )}
              </div>

              {/* ========================================================
                  BLOCK 3: Handover Method & Arrival Schedule
                 ======================================================== */}
              <div
                className="p-4 border space-y-3.5 rounded-2xl shadow-xs transition-colors"
                style={recessedSurfaceStyle}
              >
                <SectionHeader
                  icon={Truck}
                  title={isAr ? 'طريقة الاستلام وموعد الوصول' : 'Delivery & Arrival Time'}
                  badge={getEffectiveTimingLabel()}
                  badgeTone="accent"
                />

                {/* 3 Tactile Handover Method Cards */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'gift',
                      icon: Gift,
                      titleAr: 'إرسال كهدية',
                      titleEn: 'Gift Order',
                      tagAr: 'الأكثر طلباً',
                      tagEn: 'Popular',
                    },
                    {
                      id: 'delivery',
                      icon: Truck,
                      titleAr: 'توصيل لموقعي',
                      titleEn: 'Deliver to Me',
                      tagAr: 'مبرد وسريع',
                      tagEn: 'Chilled',
                    },
                    {
                      id: 'pickup',
                      icon: Store,
                      titleAr: 'استلام فرع',
                      titleEn: 'Store Pickup',
                      tagAr: 'مجاناً',
                      tagEn: 'Free',
                    },
                  ].map((item) => {
                    const isSel = handoverType === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setHandoverType(item.id)}
                        className="min-h-[88px] py-3 px-2 border rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 relative cursor-pointer active:scale-[0.97]"
                        style={
                          isSel
                            ? {
                                backgroundColor: 'var(--accent-primary, #7E1529)',
                                borderColor: 'var(--accent-primary, #7E1529)',
                                color: accentText,
                                boxShadow: '0 10px 20px -6px rgba(0, 0, 0, 0.28)',
                              }
                            : {
                                ...elevatedCardStyle,
                                color: 'var(--text-main, #1C1917)',
                              }
                        }
                      >
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5 tracking-tight"
                          style={
                            isSel
                              ? {
                                  backgroundColor:
                                    accentText === '#FFFFFF'
                                      ? 'rgba(255, 255, 255, 0.16)'
                                      : 'rgba(0, 0, 0, 0.12)',
                                  color: accentText,
                                }
                              : {
                                  backgroundColor: isDarkTheme
                                    ? 'rgba(255,255,255,0.08)'
                                    : 'rgba(0,0,0,0.05)',
                                  color: 'var(--text-muted, #78716C)',
                                }
                          }
                        >
                          {isAr ? item.tagAr : item.tagEn}
                        </span>
                        <Icon
                          className="w-4 h-4 mb-1 shrink-0"
                          style={{
                            color: isSel
                              ? accentText === '#FFFFFF'
                                ? '#FDE68A'
                                : accentText
                              : 'var(--accent-primary, #7E1529)',
                          }}
                        />
                        <span className="text-[11px] sm:text-xs font-bold leading-tight block">
                          {isAr ? item.titleAr : item.titleEn}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Timing Selector Horizontal Pills */}
                <div className="space-y-2 pt-0.5">
                  <span
                    className="block text-[11px] font-bold"
                    style={{ color: 'var(--text-muted, #78716C)' }}
                  >
                    {isAr ? 'وقت التسليم المرغوب:' : 'Desired Delivery Window:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {timingOptions.map((opt) => {
                      const isSel = timingId === opt.id;
                      const TIcon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTimingId(opt.id)}
                          className="min-h-[42px] text-xs py-2 px-2.5 rounded-xl border font-semibold transition-all flex items-center justify-between sm:justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                          style={
                            isSel
                              ? {
                                  backgroundColor: 'var(--accent-primary, #7E1529)',
                                  borderColor: 'var(--accent-primary, #7E1529)',
                                  color: accentText,
                                  boxShadow: '0 4px 12px -3px rgba(0,0,0,0.2)',
                                }
                              : {
                                  ...elevatedCardStyle,
                                  color: 'var(--text-main, #1C1917)',
                                }
                          }
                        >
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <TIcon className="w-3.5 h-3.5 shrink-0 opacity-85" />
                            <span className="text-[11px] truncate">
                              {isAr ? opt.labelAr : opt.labelEn}
                            </span>
                          </span>
                          {isSel && <Check className="w-3 h-3 stroke-[2.8] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tomorrow Scheduled Sub-Slot Picker */}
                  <AnimatePresence initial={false}>
                    {timingId === 'tomorrow' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden pt-1"
                      >
                        <div className="grid grid-cols-3 gap-1.5">
                          {TOMORROW_SLOTS.map((slot) => {
                            const isSlotSel = tomorrowSlot === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setTomorrowSlot(slot.id)}
                                className="py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all cursor-pointer"
                                style={
                                  isSlotSel
                                    ? {
                                        backgroundColor:
                                          'color-mix(in srgb, var(--accent-primary, #7E1529) 12%, var(--surface-card, #FFFFFF))',
                                        borderColor: 'var(--accent-primary, #7E1529)',
                                        color: 'var(--accent-primary, #7E1529)',
                                      }
                                    : {
                                        ...elevatedCardStyle,
                                        color: 'var(--text-muted, #78716C)',
                                      }
                                }
                              >
                                {isAr ? slot.labelAr : slot.labelEn}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Contextual Handover Details Card */}
                {handoverType === 'gift' && (
                  <div
                    className="p-3.5 rounded-xl border space-y-3"
                    style={elevatedCardStyle}
                  >
                    <div
                      className="flex items-center gap-2 pb-2 border-b"
                      style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-xs font-bold">
                        {isAr ? 'بيانات الشخص المُهدى إليه' : 'Gift Recipient Details'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label
                          htmlFor="gift-recipient-name"
                          className="text-[11px] font-bold flex items-center gap-1"
                          style={{ color: 'var(--text-muted, #78716C)' }}
                        >
                          <User className="w-3 h-3" />
                          <span>{isAr ? 'اسم المستلم' : 'Recipient Name'}</span>
                        </label>
                        <input
                          id="gift-recipient-name"
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder={isAr ? 'مثال: سارة العتيبي' : 'e.g. Sarah'}
                          className="w-full text-xs p-2.5 rounded-xl border outline-hidden transition-all focus:ring-2"
                          style={{
                            ...recessedSurfaceStyle,
                            color: 'var(--text-main, #1C1917)',
                            '--tw-ring-color': 'var(--accent-primary, #7E1529)',
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="gift-recipient-phone"
                          className="text-[11px] font-bold flex items-center gap-1"
                          style={{ color: 'var(--text-muted, #78716C)' }}
                        >
                          <Phone className="w-3 h-3" />
                          <span>{isAr ? 'رقم جوال المستلم' : 'Recipient Phone'}</span>
                        </label>
                        <div
                          className="relative flex items-center rounded-xl border overflow-hidden focus-within:ring-2"
                          style={{
                            ...recessedSurfaceStyle,
                            '--tw-ring-color': 'var(--accent-primary, #7E1529)',
                          }}
                        >
                          <span
                            dir="ltr"
                            className="px-2.5 py-2.5 text-[11px] font-mono font-bold border-e shrink-0"
                            style={{
                              borderColor: 'var(--border-subtle, #E7E5E4)',
                              color: 'var(--text-muted, #78716C)',
                            }}
                          >
                            +966
                          </span>
                          <input
                            id="gift-recipient-phone"
                            type="tel"
                            inputMode="tel"
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            placeholder="05xxxxxxxx"
                            dir="ltr"
                            className="w-full text-xs py-2.5 px-3 bg-transparent outline-hidden font-mono text-start"
                            style={{ color: 'var(--text-main, #1C1917)' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Discretion Assurance Note */}
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px]">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <p className="font-medium leading-relaxed">
                        {isAr
                          ? 'خصوصية تامة: نتواصل بلباقة لتحديد الموقع دون ذكر السعر أو إفساد المفاجأة.'
                          : 'Full discretion: We coordinate delivery smoothly without revealing prices.'}
                      </p>
                    </div>
                  </div>
                )}

                {handoverType === 'delivery' && (
                  <div
                    className="p-3 rounded-xl border space-y-2"
                    style={elevatedCardStyle}
                  >
                    <label
                      htmlFor="delivery-district-input"
                      className="text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <MapPin
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: 'var(--accent-primary, #7E1529)' }}
                      />
                      <span>
                        {isAr
                          ? 'الحي أو العنوان (أو شارك الموقع عبر واتساب)'
                          : 'District or Address (or share GPS in WhatsApp)'}
                      </span>
                    </label>
                    <input
                      id="delivery-district-input"
                      type="text"
                      value={deliveryDistrict}
                      onChange={(e) => setDeliveryDistrict(e.target.value)}
                      placeholder={
                        isAr ? 'مثال: حي الصحافة، شارع العليا...' : 'e.g. Al Sahafa Dist., Riyadh'
                      }
                      className="w-full text-xs p-2.5 rounded-xl border outline-hidden transition-all focus:ring-2"
                      style={{
                        ...recessedSurfaceStyle,
                        color: 'var(--text-main, #1C1917)',
                        '--tw-ring-color': 'var(--accent-primary, #7E1529)',
                      }}
                    />
                  </div>
                )}

                {handoverType === 'pickup' && (
                  <div
                    className="p-3 rounded-xl border flex items-center gap-2.5"
                    style={elevatedCardStyle}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor:
                          'color-mix(in srgb, var(--accent-primary, #7E1529) 10%, transparent)',
                        color: 'var(--accent-primary, #7E1529)',
                      }}
                    >
                      <Store className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold">
                        {isAr ? 'فرع دار الورد • الرياض (حي الصحافة)' : 'Maison des Fleurs • Al Sahafa'}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: 'var(--text-muted, #78716C)' }}
                      >
                        {isAr
                          ? 'الطلب يُجهز خلال ٢٠–٣٠ دقيقة بدون رسوم توصيل.'
                          : 'Ready in 20–30 mins with zero pickup fees.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================
                  BLOCK 4: Luxury Add-ons & Companions
                 ======================================================== */}
              <div
                className="p-4 border space-y-3 rounded-2xl shadow-xs transition-colors"
                style={recessedSurfaceStyle}
              >
                <SectionHeader
                  icon={Sparkles}
                  title={isAr ? 'لمسات وإضافات تزيد الهدية جمالاً' : 'Luxury Add-ons & Companions'}
                  badge={
                    selectedAddons.length > 0
                      ? isAr
                        ? `+${addonsTotal} ${strings.sar}`
                        : `+${addonsTotal} ${strings.sar}`
                      : isAr
                      ? 'اختياري'
                      : 'Optional'
                  }
                  badgeTone={selectedAddons.length > 0 ? 'gold' : 'neutral'}
                />

                <div className="space-y-2">
                  {IMPULSE_ADDONS.map((addon) => {
                    const isSel = selectedAddons.some((a) => a.id === addon.id);
                    const AddonIcon = ADDON_ICONS[addon.id] || Sparkles;
                    return (
                      <div
                        key={addon.id}
                        className="border rounded-xl p-3 transition-all duration-200"
                        style={{
                          backgroundColor: isSel
                            ? 'color-mix(in srgb, var(--accent-primary, #7E1529) 6%, var(--surface-card, #FFFFFF))'
                            : elevatedCardStyle.backgroundColor,
                          borderColor: isSel
                            ? 'var(--accent-primary, #7E1529)'
                            : 'var(--border-subtle, #E7E5E4)',
                          boxShadow: isSel
                            ? '0 0 0 1px var(--accent-primary, #7E1529)'
                            : undefined,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleAddon(addon)}
                          className="w-full flex items-center justify-between gap-2.5 text-start cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors"
                              style={
                                isSel
                                  ? {
                                      backgroundColor: 'var(--accent-primary, #7E1529)',
                                      borderColor: 'var(--accent-primary, #7E1529)',
                                      color: accentText,
                                    }
                                  : {
                                      borderColor: 'var(--border-subtle, #D6D3D1)',
                                      color: 'transparent',
                                    }
                              }
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>

                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: 'rgba(212, 175, 55, 0.14)',
                                color: '#B45309',
                              }}
                            >
                              <AddonIcon className="w-3.5 h-3.5" />
                            </span>

                            <div className="min-w-0">
                              <span className="text-xs font-bold block leading-snug">
                                {isAr ? addon.nameAr : addon.nameEn}
                              </span>
                              {(addon.descAr || addon.descEn) && (
                                <span
                                  className="text-[10px] block leading-snug mt-0.5"
                                  style={{ color: 'var(--text-muted, #78716C)' }}
                                >
                                  {isAr ? addon.descAr : addon.descEn}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg tabular-nums shrink-0"
                            style={
                              isSel
                                ? {
                                    backgroundColor: 'var(--accent-primary, #7E1529)',
                                    color: accentText,
                                  }
                                : {
                                    backgroundColor: isDarkTheme
                                      ? 'rgba(255,255,255,0.08)'
                                      : 'rgba(0,0,0,0.05)',
                                    color: 'var(--text-main, #1C1917)',
                                  }
                            }
                          >
                            +{addon.price} {strings.sar}
                          </span>
                        </button>

                        {/* Topper Phrases */}
                        {addon.id === 'addon-topper' && isSel && (
                          <div
                            className="mt-2.5 pt-2.5 border-t border-dashed"
                            style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
                          >
                            <span
                              className="text-[10px] font-bold block mb-1.5"
                              style={{ color: 'var(--text-muted, #78716C)' }}
                            >
                              {isAr ? 'اختر عبارة التوبير الذهبي:' : 'Select Acrylic Topper Phrase:'}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(isAr ? addon.phrasesAr : addon.phrasesEn).map((phrase) => {
                                const isPhraseActive = topperPhrase === phrase;
                                return (
                                  <button
                                    key={phrase}
                                    type="button"
                                    onClick={() => setTopperPhrase(phrase)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer"
                                    style={
                                      isPhraseActive
                                        ? {
                                            backgroundColor: 'var(--accent-primary, #7E1529)',
                                            borderColor: 'var(--accent-primary, #7E1529)',
                                            color: accentText,
                                          }
                                        : elevatedCardStyle
                                    }
                                  >
                                    {phrase}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Balloon Styles */}
                        {addon.id === 'addon-balloon' && isSel && (
                          <div
                            className="mt-2.5 pt-2.5 border-t border-dashed"
                            style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
                          >
                            <span
                              className="text-[10px] font-bold block mb-1.5"
                              style={{ color: 'var(--text-muted, #78716C)' }}
                            >
                              {isAr ? 'اختر شكل ولون البالون:' : 'Select Balloon Style:'}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(isAr ? addon.typesAr : addon.typesEn).map((type) => {
                                const isTypeActive = balloonType === type;
                                return (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => setBalloonType(type)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer"
                                    style={
                                      isTypeActive
                                        ? {
                                            backgroundColor: 'var(--accent-primary, #7E1529)',
                                            borderColor: 'var(--accent-primary, #7E1529)',
                                            color: accentText,
                                          }
                                        : elevatedCardStyle
                                    }
                                  >
                                    {type}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================
                  BLOCK 5: Complimentary Gold-Foil Gift Card + Preview
                 ======================================================== */}
              <div
                className="p-4 border space-y-3 rounded-2xl shadow-xs transition-colors"
                style={recessedSurfaceStyle}
              >
                <SectionHeader
                  icon={Feather}
                  title={isAr ? 'كرت الإهداء الفاخر المطبوع بالذهب' : 'Gold-Foil Greeting Card'}
                  badge={isAr ? 'هدية مجانية' : 'Complimentary'}
                  badgeTone="gold"
                />

                {/* Occasion Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {CARD_CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    const isCatSel = activeCardCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCardTemplate(cat.id)}
                        className="text-[11px] px-2.5 py-1.5 rounded-xl border font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.97]"
                        style={
                          isCatSel
                            ? {
                                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                borderColor: '#D4AF37',
                                color: isDarkTheme ? '#FDE68A' : '#78350F',
                              }
                            : {
                                ...elevatedCardStyle,
                                color: 'var(--text-main, #1C1917)',
                              }
                        }
                      >
                        <CatIcon className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Card Message Textarea */}
                <textarea
                  rows={2}
                  value={cardMessage}
                  onChange={(e) => {
                    setCardMessage(e.target.value);
                    setActiveCardCategory(null);
                  }}
                  placeholder={
                    isAr
                      ? 'اكتب رسالة الإهداء التي تود طباعتها على الكرت المخملي، أو اتركه فارغاً...'
                      : 'Write your heartfelt message for the velvet gift card...'
                  }
                  className="w-full text-xs p-3 rounded-xl border outline-hidden transition-all resize-none focus:ring-2 leading-relaxed"
                  style={{
                    ...elevatedCardStyle,
                    color: 'var(--text-main, #1C1917)',
                    '--tw-ring-color': 'var(--accent-gold, #D4AF37)',
                  }}
                />

                {/* Live 24K Velvet Stationery Preview */}
                {cardMessage.trim().length > 0 && (
                  <div
                    className="p-4 border text-center rounded-2xl relative overflow-hidden shadow-sm"
                    style={{
                      background: isDarkTheme
                        ? 'linear-gradient(145deg, #1E1B16 0%, #14120F 100%)'
                        : 'linear-gradient(145deg, #FFFEFA 0%, #FBF6EA 100%)',
                      borderColor: 'rgba(212, 175, 55, 0.75)',
                      boxShadow: '0 8px 24px -4px rgba(212, 175, 55, 0.22)',
                    }}
                  >
                    {/* Inner double hairline border */}
                    <div
                      className="absolute inset-2 rounded-xl border pointer-events-none"
                      style={{ borderColor: 'rgba(212, 175, 55, 0.28)' }}
                    />
                    <div className="relative z-10 space-y-2 py-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-7 h-[1px] bg-amber-500/50" />
                        <span className="text-[9px] uppercase tracking-widest font-bold text-amber-700 dark:text-amber-300">
                          {isAr ? 'كرت إهداء مخملي مطبوع' : 'Velvet Printed Gift Card'}
                        </span>
                        <span className="w-7 h-[1px] bg-amber-500/50" />
                      </div>

                      {recipientName.trim() && (
                        <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          {isAr ? `إلى: ${recipientName.trim()}` : `To: ${recipientName.trim()}`}
                        </p>
                      )}

                      <p
                        className="text-sm sm:text-base italic leading-relaxed whitespace-pre-wrap px-2"
                        style={{
                          fontFamily: "var(--font-header, 'Amiri', serif)",
                          color: isDarkTheme ? '#F5F5F4' : '#292524',
                        }}
                      >
                        «{cardMessage.trim()}»
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================
                  BLOCK 6: Photo Proof Assurance Toggle
                 ======================================================== */}
              <button
                type="button"
                onClick={() => setTrustPhoto((prev) => !prev)}
                className="w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-start transition-all cursor-pointer"
                style={recessedSurfaceStyle}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderColor: 'rgba(16, 185, 129, 0.25)',
                      color: '#059669',
                    }}
                  >
                    <Camera className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block">
                      {isAr ? 'تصوير الباقة قبل خروج المندوب' : 'Photo Approval Before Dispatch'}
                    </span>
                    <span
                      className="text-[10px] block truncate"
                      style={{ color: 'var(--text-muted, #78716C)' }}
                    >
                      {strings.trustPhotoCheck}
                    </span>
                  </div>
                </div>

                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors"
                  style={
                    trustPhoto
                      ? {
                          backgroundColor: 'var(--accent-primary, #7E1529)',
                          borderColor: 'var(--accent-primary, #7E1529)',
                          color: accentText,
                        }
                      : {
                          borderColor: 'var(--border-subtle, #D6D3D1)',
                          color: 'transparent',
                        }
                  }
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </button>
            </div>

            {/* ========================================================
                Sticky Luxury Footer CTA Bar
               ======================================================== */}
            <div
              className="p-3.5 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t shrink-0 space-y-2.5 transition-colors"
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderTopColor: 'var(--border-subtle, #E7E5E4)',
                boxShadow: '0 -12px 28px -8px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Summary & Free Delivery Micro-Bar */}
              <div className="flex items-center justify-between px-1 text-[11px]">
                <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-muted, #78716C)' }}>
                  <span>
                    {quantity > 1
                      ? isAr
                        ? `${quantity} باقات`
                        : `${quantity} items`
                      : isAr
                      ? 'باقة واحدة'
                      : '1 item'}
                  </span>
                  {selectedAddons.length > 0 && (
                    <span>
                      • +{selectedAddons.length} {isAr ? 'إضافات' : 'add-ons'}
                    </span>
                  )}
                </div>

                {handoverType === 'pickup' ? (
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {isAr ? 'استلام مجاني من الفرع' : 'Free Store Pickup'}
                  </span>
                ) : grandTotal >= 300 ? (
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{isAr ? 'توصيل مبرد مجاني' : 'Free Chilled Delivery'}</span>
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted, #78716C)' }}>
                    {isAr
                      ? `أضف ${300 - grandTotal} ${strings.sar} للتوصيل المجاني`
                      : `Add ${300 - grandTotal} ${strings.sar} for free delivery`}
                  </span>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2.5">
                {/* Primary CTA: Instant WhatsApp Order */}
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="tactile-sheen flex-1 min-h-[48px] py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all rounded-2xl cursor-pointer relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--accent-primary, #7E1529)',
                    color: accentText,
                    boxShadow: '0 10px 24px -6px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  <WhatsAppIcon className="w-4.5 h-4.5 fill-current shrink-0" />
                  <span className="truncate">
                    {isAr ? 'طلب فوري عبر واتساب' : 'Instant WhatsApp Order'}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums shrink-0"
                    style={{
                      backgroundColor:
                        accentText === '#FFFFFF'
                          ? 'rgba(255, 255, 255, 0.18)'
                          : 'rgba(0, 0, 0, 0.12)',
                    }}
                  >
                    {grandTotal} {strings.sar}
                  </span>
                </button>

                {/* Secondary CTA: Tactile Add to Bag */}
                <button
                  type="button"
                  onClick={handleAddBag}
                  className="tactile-btn min-h-[48px] py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 rounded-2xl shrink-0 cursor-pointer"
                  style={keycapStyle}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>{isAr ? '+ للسلة' : '+ Bag'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* ========================================================
              Full-Resolution Bouquet Image Lightbox Overlay
             ======================================================== */}
          <AnimatePresence>
            {isLightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setIsLightboxOpen(false)}
                className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-lg flex flex-col items-center justify-center p-4 sm:p-6"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-md w-full rounded-3xl overflow-hidden bg-stone-900 border border-amber-400/30 shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    aria-label={isAr ? 'إغلاق المعاينة' : 'Close preview'}
                    className="absolute top-3 end-3 z-10 w-9 h-9 rounded-full bg-stone-950/75 text-white border border-white/20 flex items-center justify-center cursor-pointer hover:bg-stone-900"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="aspect-[4/5] w-full bg-stone-950">
                    <img
                      src={product.image}
                      alt={isAr ? product.titleAr : product.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4 text-white space-y-1.5 bg-gradient-to-t from-stone-950 via-stone-900 to-stone-900/95">
                    <span className="text-[10px] font-bold text-amber-300 tracking-wide block">
                      {isAr ? categoryInfo.ar : categoryInfo.en}
                    </span>
                    <h4
                      className="text-base font-bold leading-snug"
                      style={{ fontFamily: "var(--font-header, 'Amiri', serif)" }}
                    >
                      {isAr ? product.titleAr : product.titleEn}
                    </h4>
                    {(product.flowerType || product.dimensions) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-300">
                        {product.flowerType && (
                          <span className="inline-flex items-center gap-1">
                            <Flower2 className="w-3 h-3 text-amber-300" />
                            <span>{product.flowerType}</span>
                          </span>
                        )}
                        {product.dimensions && (
                          <span className="inline-flex items-center gap-1" dir="ltr">
                            <Maximize2 className="w-3 h-3 text-amber-300" />
                            <span>{product.dimensions}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
