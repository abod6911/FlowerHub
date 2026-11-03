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
  Clock,
} from 'lucide-react';
import { IMPULSE_ADDONS } from '../data/mockData';
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

  // Block 2: Preparation Style ('as_is' | 'tweak')
  const [orderStyle, setOrderStyle] = useState('as_is');
  const [customNotes, setCustomNotes] = useState('');

  // Block 3: Handover & Timing
  const [handoverType, setHandoverType] = useState('gift'); // 'pickup' | 'delivery' | 'gift'
  const [timing, setTiming] = useState(isAr ? 'الآن / مستعجل' : 'Now / Urgent');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  // Block 4: Extras & Gift Card
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [topperPhrase, setTopperPhrase] = useState(
    isAr ? IMPULSE_ADDONS[0]?.phrasesAr[0] || 'مبروك التخرج' : IMPULSE_ADDONS[0]?.phrasesEn[0] || 'Congratulations'
  );
  const [cardMessage, setCardMessage] = useState('');

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
    return {
      ...product,
      basePrice: product.price,
      price: unitPrice,
      totalPrice: unitPrice,
      orderStyle,
      modificationNote: orderStyle === 'tweak' ? customNotes.trim() : null,
      addons: selectedAddons.map((addon) => {
        if (addon.id === 'addon-topper') return { ...addon, phrase: topperPhrase };
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

  // Quick suggestion chips for gift note
  const cardSuggestions = isAr
    ? ['ألف مبروك التخرج 🎓', 'كل عام وأنت بخير ✨', 'الحمدلله على السلامة 🌸']
    : ['Congratulations! 🎓', 'Happy Birthday! ✨', 'Get Well Soon 🌸'];

  // Quick modifier chips when 'tweak' is clicked
  const tweakChips = isAr
    ? [
        { label: '🌸 تغيير لون الورد', text: 'أرغب بتغيير لون الورد إلى: ' },
        { label: '🎀 تغيير لون التغليف', text: 'أرغب بتغيير التغليف إلى: ' },
        { label: '✍️ كتابة اسم/رقم', text: 'إضافة عبارة أو اسم: ' },
      ]
    : [
        { label: '🌸 Flower Color', text: 'Change flower color to: ' },
        { label: '🎀 Wrap Style', text: 'Change wrap to: ' },
        { label: '✍️ Add Name/Date', text: 'Add custom name: ' },
      ];

  const handleApplyTweakChip = (chipText) => {
    setCustomNotes((prev) => (prev ? `${prev} • ${chipText}` : chipText));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end animate-fade-in">
      {/* 1. Backdrop Overlay: Dimmer with blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* 2. Slide-Up Drawer Sheet: Dynamic Reactive Surface */}
      <div
        className="relative z-10 w-full max-w-[480px] mx-auto rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up border-t transition-colors duration-300"
        style={{
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          color: 'var(--text-main, #1C1917)',
          borderTopColor: 'var(--border-subtle, #E7E5E4)',
          backdropFilter: 'blur(var(--glass-blur, 12px))',
        }}
      >
        {/* Top Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center items-center shrink-0">
          <div
            className="w-12 h-1.5 rounded-full opacity-60"
            style={{ backgroundColor: 'var(--border-subtle, #D6D3D1)' }}
          />
        </div>

        {/* Header Bar */}
        <div
          className="px-5 py-3 flex items-center justify-between border-b shrink-0 transition-colors"
          style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base sm:text-lg">
              {isAr ? 'تخصيص الباقة والطلب' : 'Customize Arrangement'}
            </h2>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-bold border"
              style={{
                backgroundColor: 'var(--bg-canvas, #FAF8F5)',
                color: 'var(--accent-primary, #022C22)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
              }}
            >
              {product.price} {strings.sar}
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body - Scrollbar completely hidden */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* ========================================================
              BLOCK 1: Compact Product Header (Side-by-Side 80x80px)
             ======================================================== */}
          <div
            className="p-3 border flex gap-3 items-center shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <img
              src={product.image}
              alt={isAr ? product.titleAr : product.titleEn}
              className="w-20 h-20 rounded-xl object-cover shrink-0 border"
              style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
            />
            <div className="flex-1 min-w-0">
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
                    className="text-[11px] px-2 py-0.5 rounded-md font-medium border"
                    style={{
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      color: 'var(--text-muted, #78716C)',
                      borderColor: 'var(--border-subtle, #E7E5E4)',
                    }}
                  >
                    {product.stemCount} {isAr ? 'أغصان' : 'stems'}
                  </span>
                )}
                {product.isReadyNow && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    {isAr ? 'جاهز للاستلام اليوم' : 'Ready Today'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              BLOCK 2: Preparation Style (طريقة التنسيق)
             ======================================================== */}
          <div
            className="p-3.5 border space-y-2.5 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <label className="block text-xs font-bold">
              {isAr ? 'كيف ترغب بتجهيز الباقة؟' : 'How should it be prepared?'}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderStyle('as_is')}
                className="py-2.5 px-3 border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                style={{
                  borderRadius: 'calc(var(--radius-unit, 16px) * 0.75)',
                  backgroundColor:
                    orderStyle === 'as_is'
                      ? 'var(--accent-primary, #022C22)'
                      : 'var(--surface-card, #FFFFFF)',
                  color:
                    orderStyle === 'as_is'
                      ? '#FFFFFF'
                      : 'var(--text-main, #1C1917)',
                  borderColor:
                    orderStyle === 'as_is'
                      ? 'var(--accent-primary, #022C22)'
                      : 'var(--border-subtle, #E7E5E4)',
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isAr ? 'نفس الصورة بالضبط' : 'As Shown in Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderStyle('tweak')}
                className="py-2.5 px-3 border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                style={{
                  borderRadius: 'calc(var(--radius-unit, 16px) * 0.75)',
                  backgroundColor:
                    orderStyle === 'tweak'
                      ? 'var(--accent-primary, #022C22)'
                      : 'var(--surface-card, #FFFFFF)',
                  color:
                    orderStyle === 'tweak'
                      ? '#FFFFFF'
                      : 'var(--text-main, #1C1917)',
                  borderColor:
                    orderStyle === 'tweak'
                      ? 'var(--accent-primary, #022C22)'
                      : 'var(--border-subtle, #E7E5E4)',
                }}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{isAr ? 'تعديل بسيط (الألوان / التغليف)' : 'Tweak Colors/Wrap'}</span>
              </button>
            </div>

            {/* Revealed if Tweak is selected */}
            {orderStyle === 'tweak' && (
              <div className="pt-2.5 border-t border-dashed space-y-2 animate-slide-up" style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}>
                <div className="flex flex-wrap gap-1.5">
                  {tweakChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTweakChip(chip.text)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--surface-card, #FFFFFF)',
                        color: 'var(--text-main, #1C1917)',
                        borderColor: 'var(--border-subtle, #E7E5E4)',
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اكتب التعديل اللي في بالك (مثال: أبغى الورد أبيض والتغليف أسود)...'
                      : 'Write your adjustments (e.g. white roses and black wrap)...'
                  }
                  className="w-full text-xs p-2.5 rounded-xl border outline-hidden transition-all"
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderColor: 'var(--border-subtle, #E7E5E4)',
                    color: 'var(--text-main, #1C1917)',
                  }}
                />
              </div>
            )}
          </div>

          {/* ========================================================
              BLOCK 3: Pickup or Delivery & Timing
             ======================================================== */}
          <div
            className="p-3.5 border space-y-3 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold">
                {isAr ? 'طريقة ووقت الاستلام:' : 'Handover & Timing:'}
              </label>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {timing}
              </span>
            </div>

            {/* 3 Segmented Pills */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'pickup', icon: Store, labelAr: 'استلام فرع', labelEn: 'Pickup' },
                { id: 'delivery', icon: Truck, labelAr: 'توصيل لموقعي', labelEn: 'Deliver' },
                { id: 'gift', icon: Gift, labelAr: 'إرسال كهدية', labelEn: 'Gift' },
              ].map((m) => {
                const isSel = handoverType === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setHandoverType(m.id)}
                    className="py-2 px-1.5 border text-center flex flex-col items-center gap-1 transition-all shadow-2xs"
                    style={{
                      borderRadius: 'calc(var(--radius-unit, 16px) * 0.75)',
                      backgroundColor: isSel
                        ? 'var(--accent-primary, #022C22)'
                        : 'var(--surface-card, #FFFFFF)',
                      color: isSel ? '#FFFFFF' : 'var(--text-main, #1C1917)',
                      borderColor: isSel
                        ? 'var(--accent-primary, #022C22)'
                        : 'var(--border-subtle, #E7E5E4)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] leading-tight block font-semibold">
                      {isAr ? m.labelAr : m.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Timing Chips */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className="text-[11px] flex items-center gap-1"
                style={{ color: 'var(--text-muted, #78716C)' }}
              >
                <Clock className="w-3 h-3" />
                <span>{isAr ? 'الموعد:' : 'When:'}</span>
              </span>
              {[
                { id: 'urgent', ar: '⚡ الآن / مستعجل', en: '⚡ Urgent / Now' },
                { id: 'tonight', ar: 'مساء اليوم', en: 'Tonight' },
                { id: 'tomorrow', ar: 'غداً', en: 'Tomorrow' },
              ].map((tChip) => {
                const label = isAr ? tChip.ar : tChip.en;
                const isSel = timing === label;
                return (
                  <button
                    key={tChip.id}
                    type="button"
                    onClick={() => setTiming(label)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all"
                    style={{
                      backgroundColor: isSel
                        ? 'var(--accent-primary, #022C22)'
                        : 'var(--surface-card, #FFFFFF)',
                      color: isSel ? '#FFFFFF' : 'var(--text-main, #1C1917)',
                      borderColor: isSel
                        ? 'var(--accent-primary, #022C22)'
                        : 'var(--border-subtle, #E7E5E4)',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Conditional Details based on Handover Mode */}
            {handoverType === 'gift' && (
              <div
                className="p-2.5 rounded-xl border space-y-2 animate-slide-up"
                style={{
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  borderColor: 'var(--border-subtle, #E7E5E4)',
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder={isAr ? 'اسم المستلم الكريم' : 'Recipient Name'}
                    className="w-full text-xs p-2 rounded-lg border outline-hidden"
                    style={{
                      backgroundColor: 'var(--bg-canvas, #FAF8F5)',
                      borderColor: 'var(--border-subtle, #E7E5E4)',
                      color: 'var(--text-main, #1C1917)',
                    }}
                  />
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder={isAr ? 'رقم جوال المستلم (05xxxxxxxx)' : 'Recipient Phone'}
                    dir="ltr"
                    className="w-full text-xs p-2 rounded-lg border outline-hidden text-start"
                    style={{
                      backgroundColor: 'var(--bg-canvas, #FAF8F5)',
                      borderColor: 'var(--border-subtle, #E7E5E4)',
                      color: 'var(--text-main, #1C1917)',
                    }}
                  />
                </div>
                <p
                  className="text-[10px] leading-tight"
                  style={{ color: 'var(--text-muted, #78716C)' }}
                >
                  {isAr
                    ? '🔒 نتواصل مع المستلم بلباقة لتحديد الموقع بدقة دون حرق المفاجأة.'
                    : '🔒 We discreetly coordinate delivery location with the recipient without spoiling the surprise.'}
                </p>
              </div>
            )}

            {handoverType === 'delivery' && (
              <div
                className="p-2.5 rounded-xl border text-[11px] leading-relaxed animate-slide-up"
                style={{
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  borderColor: 'var(--border-subtle, #E7E5E4)',
                  color: 'var(--text-main, #1C1917)',
                }}
              >
                📍 {isAr ? 'سترسل موقعك (Location) مباشرة في محادثة الواتساب لسرعة التوصيل.' : 'You can share your delivery location directly in the WhatsApp chat.'}
              </div>
            )}

            {handoverType === 'pickup' && (
              <div
                className="p-2.5 rounded-xl border text-[11px] leading-relaxed animate-slide-up"
                style={{
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  borderColor: 'var(--border-subtle, #E7E5E4)',
                  color: 'var(--text-main, #1C1917)',
                }}
              >
                🏪 {isAr ? 'استلام مباشر ومجاني من فرعنا (الرياض • حي الصحافة) خلال الموعد المختار.' : 'Free direct pickup from our Riyadh Atelier (Al Sahafa Dist.) within your chosen window.'}
              </div>
            )}
          </div>

          {/* ========================================================
              BLOCK 4: Compact Extras & Gift Card
             ======================================================== */}
          <div
            className="p-3.5 border space-y-3 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            {/* Compact Selectable Add-on Chips */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {isAr ? 'إضافات سريعة للباقة:' : 'Quick Add-ons:'}
              </label>

              <div className="flex flex-wrap gap-1.5">
                {IMPULSE_ADDONS.map((addon) => {
                  const isSel = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className="text-xs px-3 py-1.5 border font-medium flex items-center gap-1.5 transition-all shadow-2xs"
                      style={{
                        borderRadius: 'calc(var(--radius-unit, 16px) * 0.75)',
                        backgroundColor: isSel
                          ? 'var(--accent-primary, #022C22)'
                          : 'var(--surface-card, #FFFFFF)',
                        color: isSel ? '#FFFFFF' : 'var(--text-main, #1C1917)',
                        borderColor: isSel
                          ? 'var(--accent-primary, #022C22)'
                          : 'var(--border-subtle, #E7E5E4)',
                      }}
                    >
                      {isSel ? <Check className="w-3.5 h-3.5" /> : <span>+</span>}
                      <span>{isAr ? addon.nameAr.split(' ')[0] + ' ' + (addon.nameAr.split(' ')[1] || '') : addon.nameEn.split(' ')[0]}</span>
                      <span className="text-[11px] opacity-85">({addon.price} {strings.sar})</span>
                    </button>
                  );
                })}
              </div>

              {/* If Topper selected, show small phrase chips */}
              {selectedAddons.some((a) => a.id === 'addon-topper') && (
                <div
                  className="mt-2 pt-2 border-t border-dashed flex flex-wrap gap-1 animate-slide-up"
                  style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
                >
                  {(isAr ? IMPULSE_ADDONS[0].phrasesAr.slice(0, 4) : IMPULSE_ADDONS[0].phrasesEn.slice(0, 4)).map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => setTopperPhrase(phrase)}
                      className="text-[10px] px-2 py-0.5 rounded-md border transition-all"
                      style={{
                        backgroundColor:
                          topperPhrase === phrase
                            ? 'var(--accent-primary, #022C22)'
                            : 'var(--surface-card, #FFFFFF)',
                        color:
                          topperPhrase === phrase
                            ? '#FFFFFF'
                            : 'var(--text-main, #1C1917)',
                        borderColor:
                          topperPhrase === phrase
                            ? 'var(--accent-primary, #022C22)'
                            : 'var(--border-subtle, #E7E5E4)',
                      }}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sleek Gift Card Input */}
            <div
              className="pt-2 border-t space-y-1.5"
              style={{ borderColor: 'var(--border-subtle, #E7E5E4)' }}
            >
              <label className="block text-xs font-bold">
                {isAr ? '💌 عبارة كرت الإهداء المطبوع (اختياري - مجاناً):' : '💌 Printed Gift Card Note (Optional - Free):'}
              </label>

              <textarea
                rows={2}
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب العبارة اللي تحب نطبعها على الكرت، أو اتركه فارغاً بدون كرت...'
                    : 'Write your gift message or leave blank for no card...'
                }
                className="w-full text-xs p-2.5 rounded-xl border outline-hidden transition-all resize-none"
                style={{
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  borderColor: 'var(--border-subtle, #E7E5E4)',
                  color: 'var(--text-main, #1C1917)',
                }}
              />

              {/* 3 Small 1-Tap Suggestion Pills */}
              <div className="flex flex-wrap gap-1.5">
                {cardSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCardMessage(sug)}
                    className="text-[10px] px-2 py-0.5 rounded-md border transition-all"
                    style={{
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      color: 'var(--text-muted, #78716C)',
                      borderColor: 'var(--border-subtle, #E7E5E4)',
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Live Printed Card Preview: Styled with Accent Gold & Active Customizer Typography */}
              {cardMessage.trim().length > 0 && (
                <div
                  className="mt-2.5 p-3.5 border text-center animate-slide-up shadow-xs relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderColor: 'var(--accent-gold, #D4AF37)',
                    borderRadius: 'var(--radius-unit, 14px)',
                    boxShadow: '0 0 15px -3px rgba(212, 175, 55, 0.15)',
                  }}
                >
                  <span
                    className="text-[9px] uppercase tracking-widest font-bold block mb-1"
                    style={{ color: 'var(--accent-gold, #D4AF37)' }}
                  >
                    {isAr ? '✦ معاينة الكرت المطبوع بالذهب ✦' : '✦ Printed Gold Gift Card Preview ✦'}
                  </span>
                  <p
                    className="text-xs sm:text-sm italic leading-relaxed whitespace-pre-wrap font-serif"
                    style={{
                      fontFamily: isAr
                        ? "var(--font-family-ar, 'Alexandria', sans-serif)"
                        : "var(--font-family-en, 'Cormorant Garamond', serif)",
                      color: 'var(--text-main, #1C1917)',
                    }}
                  >
                    "{cardMessage.trim()}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            Sticky Footer CTA Bar (WhatsApp / Add to Bag)
           ======================================================== */}
        <div
          className="p-4 border-t shrink-0 flex items-center gap-2 transition-colors"
          style={{
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            borderTopColor: 'var(--border-subtle, #E7E5E4)',
          }}
        >
          {/* Primary Button: WhatsApp */}
          <button
            type="button"
            onClick={handleDirectWhatsApp}
            className="flex-1 py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            style={{
              backgroundColor: 'var(--accent-primary, #022C22)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-btn, 9999px)',
            }}
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>
              {isAr ? 'طلب فوري عبر واتساب' : 'Instant WhatsApp Order'} • {unitPrice} {strings.sar}
            </span>
          </button>

          {/* Secondary Button: Add to Bag */}
          <button
            type="button"
            onClick={handleAddBag}
            className="w-[32%] py-3.5 px-3 text-xs sm:text-sm font-bold border flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              color: 'var(--text-main, #1C1917)',
              borderRadius: 'var(--radius-btn, 9999px)',
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isAr ? '+ للسلة' : '+ Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
