import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Gift,
  Camera,
  Flower2,
  Check,
  Upload,
  MessageCircle,
  Truck,
  Store,
} from 'lucide-react';
import { t } from '../utils/translations';
import { validateUploadedFile } from '../services/uploadSecurity';

const INSPIRATION_PHOTOS = [
  {
    id: 'insp-1',
    title: 'French Garden Hydrangea & Peonies',
    titleAr: 'حديقة فرنسية هيدرنجيا وبيوني',
    url: './images/inspiration/inspiration-french-garden.jpg',
  },
  {
    id: 'insp-2',
    title: 'Luxury Perfume & Rose Gift Tray',
    titleAr: 'صينية عطر وتنسيق ورد راقي',
    url: './images/inspiration/inspiration-perfume-tray.jpg',
  },
  {
    id: 'insp-3',
    title: 'Minimalist White Orchid & Calla Vase',
    titleAr: 'فازة كالا وأوركيد أبيض نقي',
    url: './images/inspiration/inspiration-minimal-orchid.jpg',
  },
];

export default function CustomOrderDrawer({
  isOpen,
  onClose,
  onSubmitCustomOrder,
  lang = 'ar',
  _theme = {},
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  const [activeMode, setActiveMode] = useState('budget_bouquet'); // 'budget_bouquet' | 'wrap_gift' | 'photo_match'
  const [selectedVibe, setSelectedVibe] = useState(
    isAr ? 'ألوان باستيل هادئة' : 'Soft Romantic Pastel'
  );
  const [selectedBudget, setSelectedBudget] = useState(strings.budgetPills[1]); // default ~250 SAR
  const [selectedPhoto, setSelectedPhoto] = useState(INSPIRATION_PHOTOS[0].url);
  const [customPhotoUploaded, setCustomPhotoUploaded] = useState(false);
  const [notes, setNotes] = useState('');

  // Handover
  const [handoverType, setHandoverType] = useState('gift');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [pickupTime, setPickupTime] = useState(isAr ? 'خلال ٣٠ دقيقة' : 'In 30 mins');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  if (!isOpen) return null;

  const colorVibes = isAr
    ? [
        'ألوان باستيل هادئة ورومانسية',
        'أبيض وأخضر طبيعي فاخر',
        'أحمر ملكي وجريء',
        'ملون ومبهج للاحتفالات',
        'ألوان ترابية دافئة',
      ]
    : [
        'Soft Romantic Pastel',
        'Pristine White & Botanical Green',
        'Royal Crimson Passion',
        'Vibrant & Celebratory',
        'Warm Earthy Palette',
      ];

  const handleSimulatedUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Security: Validate file size (2MB max), genuine MIME and magic bytes
      const validation = await validateUploadedFile(file, 'customer');
      if (!validation.isValid) {
        alert(validation.error || (isAr ? 'الملف المرفق غير صالح أمنياً' : 'File is not secure'));
        return;
      }
      const url = URL.createObjectURL(file);
      setSelectedPhoto(url);
      setCustomPhotoUploaded(true);
    }
  };

  const handleSubmit = () => {
    let modeTitle = strings.mode1Title;
    if (activeMode === 'wrap_gift') modeTitle = strings.mode2Title;
    if (activeMode === 'photo_match') modeTitle = strings.mode3Title;

    const customOrderData = {
      mode: activeMode,
      modeTitle,
      colorVibe: selectedVibe,
      budget: selectedBudget,
      photoUrl: selectedPhoto,
      hasPhoto: true,
      notes: notes.trim(),
    };

    const handoverData = {
      type: handoverType,
      recipientName: handoverType === 'gift' ? recipientName : null,
      recipientPhone: handoverType === 'gift' ? recipientPhone : null,
      pickupTime: handoverType === 'pickup' ? pickupTime : null,
      address: handoverType === 'delivery' ? deliveryAddress : null,
    };

    onSubmitCustomOrder(customOrderData, handoverData);
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
        className="relative z-10 w-full max-w-full sm:max-w-lg mx-auto rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up border-t transition-colors duration-300"
        style={{
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          color: 'var(--text-main, #1C1917)',
          borderTopColor: 'var(--border-subtle, #E7E5E4)',
          backdropFilter: 'blur(var(--glass-blur, 12px))',
        }}
      >
        {/* Top Handle bar */}
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
          <div>
            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{strings.customDrawerTitle}</span>
            </h2>
            <p
              className="text-[11px]"
              style={{ color: 'var(--text-muted, #78716C)' }}
            >
              {strings.customDrawerSub}
            </p>
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
          {/* 1. The 3 Visual Mode Cards */}
          <div
            className="p-3.5 border space-y-2.5 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <label className="block text-xs font-bold">
              {isAr ? 'اختر نوع التنسيق المطلوب:' : 'Select Service Type:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'budget_bouquet',
                  icon: Flower2,
                  title: strings.mode1Title,
                  desc: strings.mode1Desc,
                },
                {
                  id: 'wrap_gift',
                  icon: Gift,
                  title: strings.mode2Title,
                  desc: strings.mode2Desc,
                },
                {
                  id: 'photo_match',
                  icon: Camera,
                  title: strings.mode3Title,
                  desc: strings.mode3Desc,
                },
              ].map((m) => {
                const isSel = activeMode === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMode(m.id)}
                    className="p-3 border text-start flex flex-col justify-between transition-all shadow-2xs"
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
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-5 h-5 ${isSel ? 'text-white' : 'opacity-60'}`} />
                      {isSel && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-xs font-bold block leading-tight mb-1">{m.title}</span>
                    <span
                      className="text-[10px] leading-relaxed block opacity-80"
                    >
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Preferred Color Vibe */}
          <div
            className="p-3.5 border space-y-2 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <label className="block text-xs font-bold">
              {strings.colorVibeLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {colorVibes.map((vibe) => {
                const isSel = selectedVibe === vibe;
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => setSelectedVibe(vibe)}
                    className="text-xs px-3 py-1.5 border font-medium transition-all shadow-2xs"
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
                    {vibe}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Approximate Budget */}
          <div
            className="p-3.5 border space-y-2 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <label className="block text-xs font-bold">
              {strings.budgetLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {strings.budgetPills.map((b) => {
                const isSel = selectedBudget === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBudget(b)}
                    className="py-2 px-3 border text-xs font-semibold text-center transition-all shadow-2xs"
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
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Reference Photo Selector or Custom Upload */}
          <div
            className="p-3.5 border space-y-2.5 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                <span>{strings.photoUploadLabel}</span>
              </label>

              <label
                className="cursor-pointer text-[11px] font-bold flex items-center gap-1 hover:underline"
                style={{ color: 'var(--accent-primary, #022C22)' }}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{strings.uploadBtnText}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulatedUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Inspiration presets reel */}
            <div className="grid grid-cols-3 gap-2">
              {INSPIRATION_PHOTOS.map((photo) => {
                const isSel = selectedPhoto === photo.url && !customPhotoUploaded;
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setSelectedPhoto(photo.url);
                      setCustomPhotoUploaded(false);
                    }}
                    className="relative overflow-hidden aspect-[4/3] cursor-pointer border-2 transition-all shadow-xs"
                    style={{
                      borderRadius: 'calc(var(--radius-unit, 16px) * 0.75)',
                      borderColor: isSel
                        ? 'var(--accent-gold, #D4AF37)'
                        : 'transparent',
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={isAr ? photo.titleAr : photo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = './images/products/royal-red-roses.jpg';
                      }}
                    />
                    {isSel && (
                      <div
                        className="absolute top-1.5 end-1.5 text-white p-0.5 rounded-full shadow-xs"
                        style={{ backgroundColor: 'var(--accent-gold, #D4AF37)' }}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-xs p-1 text-[9px] text-white truncate text-center">
                      {isAr ? photo.titleAr : photo.title}
                    </div>
                  </div>
                );
              })}
            </div>

            {customPhotoUploaded && (
              <div
                className="mt-2 p-2 rounded-xl border flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  borderColor: 'var(--accent-gold, #D4AF37)',
                }}
              >
                <img
                  src={selectedPhoto}
                  alt="Uploaded preview"
                  className="w-10 h-10 rounded-lg object-cover border"
                  style={{ borderColor: 'var(--accent-gold, #D4AF37)' }}
                />
                <span className="text-xs font-semibold" style={{ color: 'var(--accent-gold, #D4AF37)' }}>
                  {isAr ? 'تم إرفاق صورتك الخاصة للتنفيذ!' : 'Custom reference photo attached!'}
                </span>
              </div>
            )}
          </div>

          {/* 5. Notes */}
          <div
            className="p-3.5 border space-y-2 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <label className="block text-xs font-bold">
              {isAr ? 'ملاحظات وتفاصيل إضافية للمنسق:' : 'Special notes for the florist:'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isAr
                  ? 'مثلاً: حابين تغليف العطر مع بيبي روز دراقي وأغصان يوكالبتوس...'
                  : 'e.g. Please wrap the perfume box with peach spray roses and eucalyptus...'
              }
              className="w-full text-xs p-2.5 rounded-xl border outline-hidden transition-all resize-none"
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderColor: 'var(--border-subtle, #E7E5E4)',
                color: 'var(--text-main, #1C1917)',
              }}
            />
          </div>

          {/* 6. Handover Selection */}
          <div
            className="p-3.5 border space-y-3 shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-canvas, #FAF8F5)',
              borderColor: 'var(--border-subtle, #E7E5E4)',
              borderRadius: 'var(--radius-unit, 16px)',
            }}
          >
            <label className="block text-xs font-bold">
              {strings.handoverLabel}
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'gift', icon: Gift, title: strings.giftOption },
                { id: 'delivery', icon: Truck, title: strings.deliveryOption },
                { id: 'pickup', icon: Store, title: strings.pickupOption },
              ].map((tab) => {
                const isSel = handoverType === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setHandoverType(tab.id)}
                    className="p-2 border text-center flex flex-col items-center gap-1 transition-all shadow-2xs"
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
                    <span className="text-[11px] leading-tight block font-semibold">{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {handoverType === 'gift' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-slide-up">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={strings.recipientNamePlaceholder}
                  className="w-full text-xs p-2.5 rounded-xl border outline-hidden"
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderColor: 'var(--border-subtle, #E7E5E4)',
                    color: 'var(--text-main, #1C1917)',
                  }}
                />
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder={strings.recipientPhonePlaceholder}
                  dir="ltr"
                  className="w-full text-xs p-2.5 rounded-xl border outline-hidden text-start"
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderColor: 'var(--border-subtle, #E7E5E4)',
                    color: 'var(--text-main, #1C1917)',
                  }}
                />
              </div>
            )}

            {handoverType === 'delivery' && (
              <div className="pt-1 animate-slide-up">
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={isAr ? 'حي، شارع، أو تفاصيل العنوان...' : 'District, street, or address details...'}
                  className="w-full text-xs p-2.5 rounded-xl border outline-hidden"
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderColor: 'var(--border-subtle, #E7E5E4)',
                    color: 'var(--text-main, #1C1917)',
                  }}
                />
              </div>
            )}

            {handoverType === 'pickup' && (
              <div className="pt-1 animate-slide-up">
                <input
                  type="text"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder={isAr ? 'وقت الاستلام المتوقع (مثال: خلال ٤٥ دقيقة)' : 'Estimated pickup time (e.g. In 45 mins)'}
                  className="w-full text-xs p-2.5 rounded-xl border outline-hidden"
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderColor: 'var(--border-subtle, #E7E5E4)',
                    color: 'var(--text-main, #1C1917)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t shrink-0 transition-colors"
          style={{
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            borderTopColor: 'var(--border-subtle, #E7E5E4)',
          }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            style={{
              backgroundColor: 'var(--accent-primary, #022C22)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-btn, 9999px)',
            }}
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>{strings.sendCustomTicketBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
