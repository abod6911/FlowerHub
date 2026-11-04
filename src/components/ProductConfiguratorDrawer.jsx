import React, { useState } from 'react';
import {
  X,
  Check,
  ShoppingBag,
  MessageCircle,
  Truck,
  Store,
  Gift,
  Palette,
  Sparkles,
  ShieldCheck,
  Phone,
  User,
} from 'lucide-react';
import {
  IMPULSE_ADDONS,
  FLOWER_COLOR_OPTIONS,
  WRAP_COLOR_OPTIONS,
  GIFT_CARD_TEMPLATES,
} from '../data/mockData';
import { t } from '../utils/translations';

export default function ProductConfiguratorDrawer({
  product,
  isOpen,
  onClose,
  onAddToBag,
  onDirectWhatsAppCheckout,
  lang = 'ar',
  _theme = {},
}) {
  const isAr = lang === 'ar';
  const strings = t[lang] || t.ar;

  // Block 1: Preparation Style ('as_is' | 'tweak')
  const [orderStyle, setOrderStyle] = useState('as_is');
  const [selectedFlowerColor, setSelectedFlowerColor] = useState('as_is');
  const [selectedWrapColor, setSelectedWrapColor] = useState(
    WRAP_COLOR_OPTIONS?.[0]?.id || 'black_matte'
  );
  const [customNotes, setCustomNotes] = useState('');

  // Block 2: Handover & Timing
  const [handoverType, setHandoverType] = useState('gift'); // 'gift' | 'delivery' | 'pickup'
  const [timing, setTiming] = useState(isAr ? 'الآن / مستعجل (خلال ساعتين)' : 'Now / Urgent (within 2h)');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  // Block 3: Extras & Add-ons
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [topperPhrase, setTopperPhrase] = useState(
    isAr ? IMPULSE_ADDONS[0]?.phrasesAr[0] || 'مبروك التخرج' : IMPULSE_ADDONS[0]?.phrasesEn[0] || 'Congratulations'
  );
  const [balloonType, setBalloonType] = useState(
    isAr ? IMPULSE_ADDONS[1]?.typesAr?.[0] || 'قلب أحمر مخملي' : IMPULSE_ADDONS[1]?.typesEn?.[0] || 'Heart Red'
  );

  // Block 4: Greeting Card
  const [cardMessage, setCardMessage] = useState('');
  const [activeCardCategory, setActiveCardCategory] = useState(null);

  // Return early AFTER hook declarations to adhere to React Rules of Hooks
  if (!isOpen || !product) return null;

  // Surcharge calculations
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
  const unitPrice = (product.price || 0) + addonsTotal;

  // Toggle addon helper
  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Build the complete configured product payload
  const buildConfiguredItem = () => {
    // Compile modification note if 'tweak' selected
    let fullModificationNote = '';
    if (orderStyle === 'tweak') {
      const parts = [];
      if (selectedFlowerColor && selectedFlowerColor !== 'as_is') {
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

    return {
      ...product,
      basePrice: product.price,
      price: unitPrice,
      totalPrice: unitPrice,
      orderStyle,
      modificationNote: orderStyle === 'tweak' ? fullModificationNote : null,
      addons: selectedAddons.map((addon) => {
        if (addon.id === 'addon-topper') return { ...addon, phrase: topperPhrase };
        if (addon.id === 'addon-balloon') return { ...addon, balloonType };
        return addon;
      }),
      giftCardMessage: cardMessage.trim() || null,
      handover: {
        type: handoverType,
        timing,
        recipientName: handoverType === 'gift' ? recipientName.trim() : null,
        recipientPhone: handoverType === 'gift' ? recipientPhone.trim() : null,
      },
      trustPhoto: true,
      quantity: 1,
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

  // Category filters for cards
  const cardCategories = [
    { id: 'love', labelAr: '❤️ حب وامتنان', labelEn: '❤️ Love' },
    { id: 'graduation', labelAr: '🎓 تخرج', labelEn: '🎓 Graduation' },
    { id: 'birthday', labelAr: '✨ ميلاد', labelEn: '✨ Birthday' },
    { id: 'newborn', labelAr: '👶 مولود', labelEn: '👶 Newborn' },
    { id: 'recovery', labelAr: '🌸 سلامة', labelEn: '🌸 Recovery' },
  ];

  const handleSelectCardTemplate = (catId) => {
    setActiveCardCategory(catId);
    const tmpl = GIFT_CARD_TEMPLATES.find((t) => t.category === catId);
    if (tmpl) {
      setCardMessage(isAr ? tmpl.textAr : tmpl.textEn);
    }
  };

  // Handover timing presets
  const timingOptions = [
    {
      id: 'now',
      labelAr: '⚡ الآن / مستعجل (خلال ساعتين)',
      labelEn: '⚡ Now / Urgent (within 2h)',
      badgeAr: 'توصيل فوري',
      badgeEn: 'Express',
    },
    {
      id: 'tonight',
      labelAr: '🌙 مساء اليوم (٤ م - ١٠ م)',
      labelEn: '🌙 Tonight (4 PM - 10 PM)',
      badgeAr: 'الأكثر طلباً',
      badgeEn: 'Popular',
    },
    {
      id: 'tomorrow',
      labelAr: '☀️ غداً بتوقيت محدد',
      labelEn: '☀️ Tomorrow Scheduled',
      badgeAr: 'حجز مسبق',
      badgeEn: 'Scheduled',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end animate-fade-in">
      {/* 1. Backdrop Overlay: Glass Dimmer */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-Up Drawer Sheet: Boutique Atelier Surface */}
      <div
        className="relative z-10 w-full max-w-[500px] mx-auto rounded-t-[28px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up border-t transition-colors duration-300"
        style={{
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          color: 'var(--text-main, #1C1917)',
          borderTopColor: 'var(--border-subtle, #E7E5E4)',
        }}
      >
        {/* Top Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing">
          <div
            className="w-12 h-1 rounded-full opacity-40 hover:opacity-75 transition-opacity"
            style={{ backgroundColor: 'var(--text-muted, #78716C)' }}
          />
        </div>

        {/* Header Bar */}
        <div
          className="px-5 py-3.5 flex items-center justify-between border-b shrink-0 transition-colors"
          style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg tracking-tight">
                {isAr ? 'تخصيص الباقة والطلب' : 'Customize & Order'}
              </h2>
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide"
                style={{
                  backgroundColor: 'rgba(2, 44, 34, 0.08)',
                  color: 'var(--accent-primary, #022C22)',
                  border: '1px solid rgba(2, 44, 34, 0.15)',
                }}
              >
                {product.price} {strings.sar}
              </span>
            </div>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--text-muted, #78716C)' }}>
              {isAr ? 'تنسيق يدوي طازج وتغليف فاخر عند الطلب' : 'Fresh hand-crafted florals & bespoke packaging'}
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="p-2 rounded-full transition-all duration-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* ========================================================
              BLOCK 1: Boutique Product Preview Card
             ======================================================== */}
          <div
            className="p-3.5 border flex gap-3.5 items-center transition-all duration-200 rounded-2xl relative overflow-hidden shadow-xs"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
            }}
          >
            {/* Soft Ambient Background Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-xl pointer-events-none" />

            <div className="relative shrink-0">
              <img
                src={product.image}
                alt={isAr ? product.titleAr : product.titleEn}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl object-cover border shadow-xs"
                style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
              />
              <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-md text-[9px] text-white font-bold px-1.5 py-0.5 rounded-md">
                {product.price} {strings.sar}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="text-[10px] uppercase font-bold tracking-wider"
                  style={{ color: 'var(--accent-gold, #D4AF37)' }}
                >
                  {isAr ? 'تنسيق حصري' : 'Atelier Exclusive'}
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base leading-snug truncate">
                {isAr ? product.titleAr : product.titleEn}
              </h3>
              <p
                className="text-xs mt-0.5 line-clamp-1"
                style={{ color: 'var(--text-muted, #78716C)' }}
              >
                {isAr ? product.descAr : product.descEn}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {product.stemCount && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-md font-medium border flex items-center gap-1"
                    style={{
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      color: 'var(--text-muted, #78716C)',
                      borderColor: 'var(--border-subtle, #E7E5E4)',
                    }}
                  >
                    <span>🌿</span>
                    <span>{product.stemCount} {isAr ? 'غصن طبيعي' : 'stems'}</span>
                  </span>
                )}
                {product.isReadyNow && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isAr ? 'جاهز للاستلام الفوري' : 'Ready for Instant Pickup'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              BLOCK 2: Preparation Style (كيف ترغب بتجهيز الباقة؟)
             ======================================================== */}
          <div
            className="p-4 border space-y-3 transition-colors rounded-2xl shadow-xs"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
            }}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>{isAr ? 'طريقة تجهيز وتنسيق الباقة:' : 'Preparation & Arrangement Style:'}</span>
              </label>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: orderStyle === 'as_is' ? 'rgba(2, 44, 34, 0.08)' : 'rgba(212, 175, 55, 0.15)',
                  color: orderStyle === 'as_is' ? 'var(--accent-primary, #022C22)' : '#92400E',
                }}
              >
                {orderStyle === 'as_is'
                  ? (isAr ? 'مطابق للصورة' : 'Identical')
                  : (isAr ? 'تخصيص حر' : 'Customized')}
              </span>
            </div>

            {/* Two Distinctive Luxury Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: As Is */}
              <button
                type="button"
                onClick={() => setOrderStyle('as_is')}
                className={`p-3 border text-start rounded-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                  orderStyle === 'as_is'
                    ? 'ring-2 ring-emerald-900 dark:ring-emerald-400 shadow-sm'
                    : 'hover:border-stone-400 opacity-90'
                }`}
                style={{
                  backgroundColor:
                    orderStyle === 'as_is'
                      ? 'var(--surface-card, #FFFFFF)'
                      : 'rgba(255, 255, 255, 0.6)',
                  borderColor:
                    orderStyle === 'as_is'
                      ? 'var(--accent-primary, #022C22)'
                      : 'var(--border-subtle, #E7E5E4)',
                }}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        orderStyle === 'as_is'
                          ? 'bg-emerald-900 text-white dark:bg-emerald-500'
                          : 'border border-stone-300 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold">
                      {isAr ? 'نفس الصورة بالضبط' : 'Identical to Photo'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {isAr ? 'الأسرع' : 'Fastest'}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed pe-1" style={{ color: 'var(--text-muted, #78716C)' }}>
                  {isAr
                    ? 'نفس درجات الورد والتغليف الموضحة بالصورة.'
                    : 'Exact flowers, wrap and palette as displayed.'}
                </p>
              </button>

              {/* Option B: Tweak / Customize */}
              <button
                type="button"
                onClick={() => setOrderStyle('tweak')}
                className={`p-3 border text-start rounded-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                  orderStyle === 'tweak'
                    ? 'ring-2 ring-emerald-900 dark:ring-emerald-400 shadow-sm'
                    : 'hover:border-stone-400 opacity-90'
                }`}
                style={{
                  backgroundColor:
                    orderStyle === 'tweak'
                      ? 'var(--surface-card, #FFFFFF)'
                      : 'rgba(255, 255, 255, 0.6)',
                  borderColor:
                    orderStyle === 'tweak'
                      ? 'var(--accent-primary, #022C22)'
                      : 'var(--border-subtle, #E7E5E4)',
                }}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        orderStyle === 'tweak'
                          ? 'bg-emerald-900 text-white dark:bg-emerald-500'
                          : 'border border-stone-300 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold">
                      {isAr ? 'تعديل الألوان والتغليف' : 'Tweak Colors & Wrap'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    {isAr ? 'مجاناً' : 'Free'}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed pe-1" style={{ color: 'var(--text-muted, #78716C)' }}>
                  {isAr
                    ? 'اختر ألوان الورد، ورق التغليف، أو أضف طلباً خاصاً.'
                    : 'Select flower shades, packaging style or custom florist note.'}
                </p>
              </button>
            </div>

            {/* Revealed if Tweak is selected */}
            {orderStyle === 'tweak' && (
              <div
                className="pt-3 border-t space-y-3.5 animate-slide-up"
                style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
              >
                {/* 1. Flower Colors Swatches */}
                <div>
                  <span className="block text-[11px] font-bold mb-1.5" style={{ color: 'var(--text-muted, #78716C)' }}>
                    {isAr ? '🌸 درجات ألوان الورد المرغوبة:' : '🌸 Preferred Flower Palette:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FLOWER_COLOR_OPTIONS.map((fc) => {
                      const isSel = selectedFlowerColor === fc.id;
                      return (
                        <button
                          key={fc.id}
                          type="button"
                          onClick={() => setSelectedFlowerColor(fc.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                            isSel
                              ? 'bg-emerald-950 text-white border-emerald-950 shadow-xs ring-1 ring-emerald-950'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: fc.color }}
                          />
                          <span className="text-[11px]">{isAr ? fc.nameAr : fc.nameEn}</span>
                          {isSel && <Check className="w-3 h-3 ms-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Wrap Styles */}
                <div>
                  <span className="block text-[11px] font-bold mb-1.5" style={{ color: 'var(--text-muted, #78716C)' }}>
                    {isAr ? '🎀 نوع ولون التغليف:' : '🎀 Packaging & Wrapping Style:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {WRAP_COLOR_OPTIONS.map((wc) => {
                      const isSel = selectedWrapColor === wc.id;
                      return (
                        <button
                          key={wc.id}
                          type="button"
                          onClick={() => setSelectedWrapColor(wc.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                            isSel
                              ? 'bg-emerald-950 text-white border-emerald-950 shadow-xs ring-1 ring-emerald-950'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: wc.color }}
                          />
                          <span className="text-[11px]">{isAr ? wc.nameAr : wc.nameEn}</span>
                          {isSel && <Check className="w-3 h-3 ms-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Custom Florist Note Input */}
                <div>
                  <span className="block text-[11px] font-bold mb-1" style={{ color: 'var(--text-muted, #78716C)' }}>
                    {isAr ? '✍️ ملاحظات إضافية لمنسق الأزهار:' : '✍️ Custom Florist Instructions:'}
                  </span>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder={
                      isAr
                        ? 'مثال: تفضيل شريطة حرير كحلية، إكثار الأغصان الخضراء، بدون رائحة عطرية...'
                        : 'e.g. Add navy silk ribbon, extra eucalyptus foliage...'
                    }
                    className="w-full text-xs p-2.5 rounded-xl border outline-hidden transition-all bg-white dark:bg-stone-900 border-stone-200 focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              BLOCK 3: Handover & Timing (طريقة ووقت الاستلام)
             ======================================================== */}
          <div
            className="p-4 border space-y-3.5 transition-colors rounded-2xl shadow-xs"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
            }}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>{isAr ? 'طريقة الاستلام وموعد الوصول:' : 'Delivery Method & Arrival Time:'}</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                {timing.split(' ')[0]}
              </span>
            </div>

            {/* 3 Boutique Interactive Handover Cards */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'gift',
                  icon: Gift,
                  titleAr: 'إرسال كهدية',
                  titleEn: 'Gift Order',
                  descAr: 'مفاجأة أنيقة',
                  descEn: 'Surprise',
                  tagAr: 'الأكثر طلباً',
                  tagEn: 'Top Choice',
                },
                {
                  id: 'delivery',
                  icon: Truck,
                  titleAr: 'توصيل لموقعي',
                  titleEn: 'Deliver to Me',
                  descAr: 'سيارة مبردة',
                  descEn: 'Chilled Van',
                  tagAr: 'سريع',
                  tagEn: 'Fast',
                },
                {
                  id: 'pickup',
                  icon: Store,
                  titleAr: 'استلام فرع',
                  titleEn: 'Store Pickup',
                  descAr: 'حي الصحافة',
                  descEn: 'Al Sahafa',
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
                    className={`py-2.5 px-2 border rounded-xl flex flex-col items-center text-center transition-all relative ${
                      isSel
                        ? 'bg-emerald-950 text-white border-emerald-950 shadow-md ring-1 ring-emerald-950'
                        : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {item.tagAr && (
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full mb-1 tracking-tight ${
                          isSel
                            ? 'bg-emerald-800/80 text-emerald-100'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {isAr ? item.tagAr : item.tagEn}
                      </span>
                    )}
                    <Icon className={`w-4 h-4 mb-1 ${isSel ? 'text-amber-300' : 'text-stone-600'}`} />
                    <span className="text-xs font-bold leading-tight block">
                      {isAr ? item.titleAr : item.titleEn}
                    </span>
                    <span
                      className={`text-[9px] mt-0.5 leading-tight ${
                        isSel ? 'text-emerald-200' : 'text-stone-400'
                      }`}
                    >
                      {isAr ? item.descAr : item.descEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timing Selector Horizontal Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="block text-[11px] font-bold" style={{ color: 'var(--text-muted, #78716C)' }}>
                {isAr ? '⏰ وقت التسليم المرغوب:' : '⏰ Desired Delivery Timing:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {timingOptions.map((opt) => {
                  const label = isAr ? opt.labelAr : opt.labelEn;
                  const isSel = timing === label;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTiming(label)}
                      className={`text-xs py-2 px-2.5 rounded-xl border font-medium text-center transition-all flex items-center justify-between sm:justify-center gap-1 ${
                        isSel
                          ? 'bg-emerald-950 text-white border-emerald-950 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-[11px] truncate">{label}</span>
                      {isSel && <Check className="w-3 h-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Handover Type Details */}
            {handoverType === 'gift' && (
              <div
                className="p-3.5 rounded-xl border space-y-3 animate-slide-up bg-white dark:bg-stone-900/90 shadow-xs"
                style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
              >
                <div className="flex items-center gap-1.5 pb-1 border-b border-stone-100 dark:border-stone-800">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {isAr ? 'بيانات الشخص المُهدى إليه:' : 'Gift Recipient Details:'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Recipient Name Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-stone-500" />
                      <span>{isAr ? 'اسم المستلم الكريـم' : 'Recipient Name'}</span>
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={isAr ? 'مثال: سارة العتيبي' : 'e.g. Sarah'}
                      className="w-full text-xs p-2.5 rounded-lg border outline-hidden transition-all bg-stone-50 dark:bg-stone-800 border-stone-200 focus:border-emerald-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  {/* Recipient Phone Field - Fixed RTL collision */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-500" />
                      <span>{isAr ? 'رقم جوال المستلم للتنسيق' : 'Recipient Phone Number'}</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none text-[11px] font-semibold text-stone-400">
                        🇸🇦 +966
                      </span>
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        className="w-full text-xs py-2.5 pe-3 ps-20 rounded-lg border outline-hidden transition-all bg-stone-50 dark:bg-stone-800 border-stone-200 focus:border-emerald-800 text-stone-900 dark:text-stone-100 font-mono text-start"
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy & Surprise Assurance Note */}
                <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <p>
                    {isAr
                      ? '🔒 خصوصية تامة للمفاجأة: نتواصل مع المستلم بلباقة لتحديد الموقع المناسب دون حرق المفاجأة أو ذكر السعر نهائياً.'
                      : '🔒 Total discretion: We coordinate delivery tactfully with the recipient without spoiling the surprise or revealing prices.'}
                  </p>
                </div>
              </div>
            )}

            {handoverType === 'delivery' && (
              <div
                className="p-3 rounded-xl border text-xs leading-relaxed animate-slide-up bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 flex items-center gap-2"
                style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
              >
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {isAr
                    ? '📍 سيتم إرسال اللوكيشن فورياً في محادثة الواتساب لسرعة وصول المندوب.'
                    : '📍 You can send your exact GPS location in the WhatsApp chat for rapid delivery.'}
                </span>
              </div>
            )}

            {handoverType === 'pickup' && (
              <div
                className="p-3 rounded-xl border text-xs leading-relaxed animate-slide-up bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 flex items-center gap-2"
                style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
              >
                <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {isAr
                    ? '🏪 استلام فوري ومجاني من فرعنا (الرياض • حي الصحافة) خلال الموعد المختار.'
                    : '🏪 Free pickup from our Riyadh Atelier (Al Sahafa Dist.) within your selected window.'}
                </span>
              </div>
            )}
          </div>

          {/* ========================================================
              BLOCK 4: Extras & Impulse Add-ons (إضافات سريعة للباقة)
             ======================================================== */}
          <div
            className="p-4 border space-y-3.5 transition-colors rounded-2xl shadow-xs"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
            }}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'إضافات ولمسات تزيد الهدية جمالاً:' : 'Luxury Add-ons & Companions:'}</span>
              </label>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted, #78716C)' }}>
                {isAr ? 'اختياري' : 'Optional'}
              </span>
            </div>

            {/* Addon Selection Cards */}
            <div className="space-y-2">
              {IMPULSE_ADDONS.map((addon) => {
                const isSel = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    className={`border rounded-xl p-2.5 transition-all ${
                      isSel
                        ? 'bg-white dark:bg-stone-900 border-emerald-900/40 shadow-xs ring-1 ring-emerald-900/30'
                        : 'bg-white/60 dark:bg-stone-900/40 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleAddon(addon)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors text-xs ${
                            isSel
                              ? 'bg-emerald-900 text-white dark:bg-emerald-500'
                              : 'border border-stone-300 text-transparent hover:border-stone-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div>
                          <span className="text-xs font-bold block">
                            {isAr ? addon.nameAr : addon.nameEn}
                          </span>
                          {(addon.descAr || addon.descEn) && (
                            <span className="text-[10px] text-stone-500 block leading-tight">
                              {isAr ? addon.descAr : addon.descEn}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isSel
                              ? 'bg-emerald-50 text-emerald-900 font-extrabold'
                              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          }`}
                        >
                          +{addon.price} {strings.sar}
                        </span>
                      </div>
                    </div>

                    {/* Sub-selector for Topper Phrases */}
                    {addon.id === 'addon-topper' && isSel && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-stone-200 dark:border-stone-700 animate-slide-up">
                        <span className="text-[10px] font-bold text-stone-500 block mb-1.5">
                          {isAr ? 'اختر عبارة التوبير الذهبي:' : 'Select Acrylic Topper Phrase:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(isAr ? addon.phrasesAr : addon.phrasesEn).map((phrase) => {
                            const isPhraseActive = topperPhrase === phrase;
                            return (
                              <button
                                key={phrase}
                                type="button"
                                onClick={() => setTopperPhrase(phrase)}
                                className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                                  isPhraseActive
                                    ? 'bg-emerald-900 text-white border-emerald-900 font-bold'
                                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                                }`}
                              >
                                {phrase}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sub-selector for Balloon Types */}
                    {addon.id === 'addon-balloon' && isSel && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-stone-200 dark:border-stone-700 animate-slide-up">
                        <span className="text-[10px] font-bold text-stone-500 block mb-1.5">
                          {isAr ? 'اختر شكل ولون البالون:' : 'Select Balloon Style:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(isAr ? addon.typesAr : addon.typesEn).map((type) => {
                            const isTypeActive = balloonType === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setBalloonType(type)}
                                className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                                  isTypeActive
                                    ? 'bg-emerald-900 text-white border-emerald-900 font-bold'
                                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                                }`}
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

            {/* ========================================================
                BLOCK 5: Luxury Greeting Card (كرت الإهداء المطبوع مجاناً)
               ======================================================== */}
            <div
              className="pt-3 border-t space-y-2.5"
              style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold flex items-center gap-1.5">
                  <span>💌</span>
                  <span>{isAr ? 'كرت إهداء مطبوع بالذهب:' : 'Gold-Printed Gift Card:'}</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  {isAr ? 'هدية مجانية ✨' : 'Complimentary ✨'}
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1">
                {cardCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCardTemplate(cat.id)}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${
                      activeCardCategory === cat.id
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {isAr ? cat.labelAr : cat.labelEn}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                rows={2}
                value={cardMessage}
                onChange={(e) => {
                  setCardMessage(e.target.value);
                  setActiveCardCategory(null);
                }}
                placeholder={
                  isAr
                    ? 'اكتب العبارة أو كلمات الإهداء التي تود طباعتها على الكرت، أو اتركه فارغاً بدون كرت...'
                    : 'Write your heartfelt message to be printed on the card...'
                }
                className="w-full text-xs p-3 rounded-xl border outline-hidden transition-all resize-none bg-white dark:bg-stone-900 border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
              />

              {/* Realistic Luxury Stationery Card Preview */}
              {cardMessage.trim().length > 0 && (
                <div
                  className="mt-2.5 p-4 border text-center animate-slide-up rounded-2xl relative overflow-hidden shadow-sm"
                  style={{
                    backgroundColor: '#FFFEFA',
                    borderColor: '#D4AF37',
                    boxShadow: '0 4px 20px -2px rgba(212, 175, 55, 0.2)',
                  }}
                >
                  {/* Decorative Gold Header */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-8 h-[1px] bg-amber-400/60" />
                    <span
                      className="text-[9px] uppercase tracking-widest font-bold"
                      style={{ color: '#B45309' }}
                    >
                      {isAr ? '✦ كرت إهداء مخملي مطبوع ✦' : '✦ Velvet Printed Gift Card ✦'}
                    </span>
                    <span className="w-8 h-[1px] bg-amber-400/60" />
                  </div>

                  <p
                    className="text-xs sm:text-sm italic leading-relaxed whitespace-pre-wrap text-stone-800 font-serif"
                    style={{
                      fontFamily: isAr
                        ? "var(--font-family-ar, 'Alexandria', sans-serif)"
                        : "var(--font-family-en, 'Cormorant Garamond', serif)",
                    }}
                  >
                    "{cardMessage.trim()}"
                  </p>

                  <div className="mt-2 text-[9px] text-amber-700/80 font-medium">
                    {isAr
                      ? 'دار الورد • يطبع الكرت بخط عربي رشيق ويوضع بمغلف شمعي فاخر'
                      : 'Maison Des Fleurs • Hand-printed & sealed in wax envelope'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            Sticky Footer CTA Bar: WhatsApp & Cart
           ======================================================== */}
        <div
          className="p-3.5 sm:p-4 border-t shrink-0 flex items-center gap-2.5 transition-colors shadow-lg"
          style={{
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            borderTopColor: 'var(--border-subtle, #E7E5E4)',
          }}
        >
          {/* Primary Action Button: Direct WhatsApp Order */}
          <button
            type="button"
            onClick={handleDirectWhatsApp}
            className="flex-1 py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-white shadow-md active:scale-[0.98] transition-all rounded-full"
            style={{
              backgroundColor: 'var(--accent-primary, #022C22)',
            }}
          >
            <MessageCircle className="w-4 h-4 fill-current text-emerald-400" />
            <span className="truncate">
              {isAr ? 'طلب فوري عبر واتساب' : 'Instant WhatsApp Order'}
            </span>
            <span className="bg-white/15 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
              {unitPrice} {strings.sar}
            </span>
          </button>

          {/* Secondary Action Button: Add to Bag */}
          <button
            type="button"
            onClick={handleAddBag}
            className="py-3.5 px-4 text-xs sm:text-sm font-bold border flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all rounded-full shrink-0 shadow-2xs hover:bg-stone-50"
            style={{
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              color: 'var(--text-main, #1C1917)',
            }}
          >
            <ShoppingBag className="w-4 h-4 text-stone-600" />
            <span>{isAr ? '+ للسلة' : '+ Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
