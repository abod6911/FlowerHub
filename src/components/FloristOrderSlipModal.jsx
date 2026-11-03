import React, { useState, useEffect } from 'react';
import ReceiptPrinter from './ReceiptPrinter';
import {
  X,
  Printer,
  Copy,
  Check,
  Clock,
  Sparkles,
  Share2,
  Receipt,
} from 'lucide-react';
import { t } from '../utils/translations';

// High-Precision SVG Barcode for Thermal POS Scanning
function ThermalBarcode({ code = 'FLW-8492' }) {
  return (
    <div className="flex flex-col items-center my-2 text-black">
      <svg className="w-52 h-9" viewBox="0 0 160 32" fill="#000000">
        <rect x="0" y="0" width="3" height="30" />
        <rect x="4" y="0" width="1" height="30" />
        <rect x="7" y="0" width="4" height="30" />
        <rect x="13" y="0" width="2" height="30" />
        <rect x="17" y="0" width="1" height="30" />
        <rect x="21" y="0" width="3" height="30" />
        <rect x="26" y="0" width="2" height="30" />
        <rect x="30" y="0" width="4" height="30" />
        <rect x="36" y="0" width="1" height="30" />
        <rect x="39" y="0" width="3" height="30" />
        <rect x="44" y="0" width="2" height="30" />
        <rect x="48" y="0" width="1" height="30" />
        <rect x="51" y="0" width="4" height="30" />
        <rect x="57" y="0" width="2" height="30" />
        <rect x="61" y="0" width="3" height="30" />
        <rect x="66" y="0" width="1" height="30" />
        <rect x="70" y="0" width="4" height="30" />
        <rect x="76" y="0" width="2" height="30" />
        <rect x="80" y="0" width="1" height="30" />
        <rect x="84" y="0" width="3" height="30" />
        <rect x="89" y="0" width="2" height="30" />
        <rect x="93" y="0" width="4" height="30" />
        <rect x="99" y="0" width="1" height="30" />
        <rect x="102" y="0" width="3" height="30" />
        <rect x="107" y="0" width="2" height="30" />
        <rect x="111" y="0" width="4" height="30" />
        <rect x="117" y="0" width="1" height="30" />
        <rect x="120" y="0" width="3" height="30" />
        <rect x="125" y="0" width="2" height="30" />
        <rect x="129" y="0" width="4" height="30" />
        <rect x="135" y="0" width="1" height="30" />
        <rect x="139" y="0" width="3" height="30" />
        <rect x="144" y="0" width="2" height="30" />
        <rect x="149" y="0" width="1" height="30" />
        <rect x="152" y="0" width="4" height="30" />
        <rect x="158" y="0" width="2" height="30" />
      </svg>
      <span className="font-mono text-[10px] tracking-widest font-bold mt-0.5">*{code}*</span>
    </div>
  );
}

// Pure SVG Luxury QR Code Pattern
function StylizedQRCode({ className = 'w-16 h-16' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor">
      {/* Top Left Position Finder */}
      <rect x="5" y="5" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="13" y="13" width="12" height="12" rx="2" fill="currentColor" />

      {/* Top Right Position Finder */}
      <rect x="67" y="5" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="75" y="13" width="12" height="12" rx="2" fill="currentColor" />

      {/* Bottom Left Position Finder */}
      <rect x="5" y="67" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="13" y="75" width="12" height="12" rx="2" fill="currentColor" />

      {/* Grid Pattern Dots */}
      <circle cx="45" cy="15" r="3" />
      <circle cx="55" cy="15" r="3" />
      <circle cx="40" cy="25" r="3" />
      <circle cx="50" cy="25" r="3" />
      <circle cx="60" cy="25" r="3" />

      <circle cx="15" cy="45" r="3" />
      <circle cx="25" cy="45" r="3" />
      <circle cx="20" cy="55" r="3" />

      <circle cx="45" cy="45" r="4" />
      <circle cx="55" cy="45" r="3" />
      <circle cx="45" cy="55" r="3" />
      <circle cx="55" cy="55" r="4" />

      <circle cx="75" cy="45" r="3" />
      <circle cx="85" cy="45" r="3" />
      <circle cx="75" cy="55" r="3" />

      <circle cx="45" cy="75" r="3" />
      <circle cx="55" cy="75" r="3" />
      <circle cx="45" cy="85" r="3" />
      <circle cx="75" cy="75" r="4" />
      <circle cx="85" cy="75" r="3" />
      <circle cx="75" cy="85" r="3" />
      <circle cx="85" cy="85" r="4" />
    </svg>
  );
}

export default function FloristOrderSlipModal({
  isOpen = true,
  onClose,
  isModal = true,
  lang = 'ar',
  shopConfig = null,
  orderData: propOrderData = null,
}) {
  const [printLayout, setPrintLayout] = useState('thermal'); // 'thermal' (80mm) | 'a6_card'
  const [orderStatus, setOrderStatus] = useState('in_prep'); // 'new' | 'in_prep' | 'ready'
  const [printerStage, setPrinterStage] = useState('printing'); // 'processing' | 'printing' | 'complete'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);

  // Trigger realistic gear stepped feeding animation when invoice opens
  useEffect(() => {
    if (!isOpen) return;
    const t0 = setTimeout(() => {
      setPrinterStage('processing');
    }, 0);
    const t1 = setTimeout(() => {
      setPrinterStage('printing');
    }, 500);
    const t2 = setTimeout(() => {
      setPrinterStage('complete');
    }, 2300);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  const handleRePrint = () => {
    setPrinterStage('processing');
    setTimeout(() => {
      setPrinterStage('printing');
      setTimeout(() => {
        setPrinterStage('complete');
      }, 1800);
    }, 500);
  };

  const isAr = lang === 'ar';
  const strings = t[lang] || t.ar;

  const shopName = isAr
    ? shopConfig?.shopNameAr || 'دار الورد للمناسبات'
    : shopConfig?.shopNameEn || 'Maison des Fleurs Atelier';

  const shopPhone = shopConfig?.phone || '966500000000';

  const [formattedDate] = useState(() =>
    new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')
  );

  const [formattedTime] = useState(() =>
    new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  if (isModal && !isOpen) return null;

  // Mock Order Details for #FL-8492
  const defaultOrderData = {
    orderId: 'FLW-8492',
    date: `${formattedDate} • ${formattedTime}`,
    prepTimeLeft: isAr ? 'متبقي ١٢ دقيقة' : '12 mins left',
    customerName: isAr ? 'فهد العبدالله' : 'Fahad Al-Abdullah',
    customerPhone: '+966 50 111 2233',
    recipientName: isAr ? 'د. ريم بنت عبدالعزيز' : 'Dr. Reem Al-Aziz',
    recipientPhone: '+966 55 123 4567',
    district: isAr ? 'حي الصحافة، شمال الرياض' : 'Al-Sahafa Dist., North Riyadh',
    addressDetails: isAr ? 'شارع أنس بن مالك، برج النخبة - الطابق الرابع' : 'Anas Ibn Malik St., Elite Tower - 4th Flr',
    deliveryType: isAr ? 'إهداء ومفاجأة (سيارة مبردة خاصة)' : 'Surprise Gift Delivery (Chilled Van)',
    deliveryWindow: isAr ? 'الليلة (قبل ٩:٣٠ م)' : 'Tonight (Before 9:30 PM)',
    paymentMethod: 'Apple Pay (مدفوع إلكترونياً)',
    subtotal: 405,
    deliveryFee: 25,
    totalAmount: 430,

    bouquet: {
      titleAr: 'بوكيه كولكشن الروز المخملي الملكي',
      titleEn: 'Royal Velvet Red Rose Bouquet',
      image: './images/products/royal-red-roses.jpg',
      price: 245,
      stemCount: 35,
      recipe: isAr ? '٣٥ غصن جوري كيني أحمر مخملي، كالبتوس هولندي' : '35 Kenyan Grand Prix Red Roses, Dutch Eucalyptus',
      wrapTweak: isAr ? 'ورق كريب أسود مطفي فاخر مع شريط ساتان أوف وايت' : 'Matte obsidian paper with off-white satin silk ribbon',
      ribbonText: isAr ? 'ألف مبروك التخرج د. ريم • دفعة ٢٠٢٥' : 'Congratulations Dr. Reem - Class 2025',
    },

    addons: [
      {
        nameAr: 'صينية شوكولاتة باتشي بلجيكية (١٢ قطعة)',
        nameEn: 'Artisanal Patchi Chocolates (12 pcs)',
        price: 185,
      },
      {
        nameAr: 'توبير أكريليك ذهبي (مبروك التخرج)',
        nameEn: 'Gold Acrylic Topper (Congratulations)',
        price: 15,
      },
    ],

    greetingCard: {
      to: isAr ? 'دكتورة ريم' : 'Dr. Reem',
      message: isAr
        ? 'ألف ألف مبروك التخرج يا دكتورة ريم، فخورين فيك وبإنجازك الرائع ومنها للأعلى يا رب 🤍'
        : 'Huge congratulations on your graduation Dr. Reem! We are so immensely proud of your accomplishment and wish you endless success 🤍',
      from: isAr ? 'فهد العبدالله' : 'Fahad Al-Abdullah',
      songTitle: isAr ? 'موسيقى التخرج الرسمية' : 'Graduation Theme Melodies',
    },
  };

  const orderData = propOrderData
    ? {
        ...defaultOrderData,
        ...propOrderData,
        bouquet: { ...defaultOrderData.bouquet, ...(propOrderData.bouquet || {}) },
        greetingCard: { ...defaultOrderData.greetingCard, ...(propOrderData.greetingCard || {}) },
        addons: propOrderData.addons || defaultOrderData.addons,
      }
    : defaultOrderData;

  const handlePrint = () => {
    handleRePrint();
    setTimeout(() => {
      window.print();
    }, 1800);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://flowerhub.sa/o/8492');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCard = () => {
    navigator.clipboard?.writeText(orderData.greetingCard.message);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const content = (
    <div className="w-full max-w-[600px] bg-stone-100 text-stone-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-stone-300">
      {/* 1. Modal Top Ribbon Controls */}
      <div className="bg-stone-950 text-white px-5 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-sm tracking-wider text-white">
                #FLW-8492
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                POS Thermal 80mm
              </span>
            </div>
            <span className="text-[11px] text-stone-400 block mt-0.5">
              {shopName} • {orderData.date}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Format Switcher (Thermal 80mm vs A6 Luxury Card) */}
          <div className="hidden sm:inline-flex p-0.5 bg-stone-800 rounded-xl border border-stone-700 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setPrintLayout('thermal')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                printLayout === 'thermal'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>{isAr ? 'إيصال طابعة 80mm' : '80mm POS'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintLayout('a6_card')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                printLayout === 'a6_card'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>{isAr ? 'كرت الإهداء A6' : 'A6 Card'}</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 text-stone-950 font-bold text-xs shadow-sm hover:bg-amber-300 transition-all active:scale-95"
            title={isAr ? 'طباعة الإيصال عبر الطابعة الحرارية' : 'Print Receipt'}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'طباعة' : 'Print'}</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Screen View Body */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[82vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Order Status Selector */}
        <div className="p-1 bg-stone-200/80 rounded-2xl border border-stone-300/80 grid grid-cols-3 gap-1 text-xs font-semibold">
          <button
            onClick={() => setOrderStatus('new')}
            className={`py-2 px-2 rounded-xl transition-all ${
              orderStatus === 'new'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? 'طلب جديد' : 'New Order'}
          </button>

          <button
            onClick={() => setOrderStatus('in_prep')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              orderStatus === 'in_prep'
                ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'قيد التنسيق' : 'In Prep'}</span>
          </button>

          <button
            onClick={() => setOrderStatus('ready')}
            className={`py-2 px-2 rounded-xl transition-all ${
              orderStatus === 'ready'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? 'جاهز للتسليم' : 'Ready'}
          </button>
        </div>

        {/* =========================================================================
            PRINTABLE COMPONENT 1: STANDARD 80mm THERMAL POS RECEIPT WITH RECEIPT PRINTER
           ========================================================================= */}
        {printLayout === 'thermal' && (
          <div className="flex flex-col items-center justify-center py-2 w-full">
            <ReceiptPrinter.Root stage={printerStage} feedMotion="stepped" className="w-full max-w-[360px]">
              <ReceiptPrinter.Machine className="w-full shadow-2xl">
                <ReceiptPrinter.Header>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                    <span className="font-mono text-xs font-bold text-neutral-200 tracking-wider">
                      EPSON TM-T88VI POS
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRePrint}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold transition-all active:scale-95 border border-neutral-700 shadow-sm cursor-pointer"
                    title={isAr ? 'إعادة تشغيل حركة الطباعة والصوت' : 'Replay Print Animation & Sound'}
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'إعادة الطباعة' : 'Re-feed'}</span>
                  </button>
                </ReceiptPrinter.Header>

                <ReceiptPrinter.Screen className="mt-2 mb-1">
                  <ReceiptPrinter.Status>
                    {isAr
                      ? printerStage === 'processing'
                        ? 'جاري إعداد الفاتورة الإلكترونية...'
                        : printerStage === 'printing'
                        ? 'جاري خروج الإيصال الحراري 80mm...'
                        : 'اكتملت الفاتورة بنجاح ✓'
                      : undefined}
                  </ReceiptPrinter.Status>
                </ReceiptPrinter.Screen>
              </ReceiptPrinter.Machine>

              <ReceiptPrinter.Output className="w-full">
                <ReceiptPrinter.Paper
                  id="thermal-pos-slip"
                  className="w-full bg-[#FCFAF6] text-[#141414] shadow-2xl border-x border-t border-stone-300/80 font-sans text-xs space-y-3 leading-relaxed"
                >
                  {/* Receipt Shop Header */}
                  <div className="text-center border-b border-black pb-2 space-y-1">
                    <div className="w-10 h-10 mx-auto rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-lg text-black">
                      M
                    </div>
                    <h1 className="font-bold text-base tracking-tight font-sans text-black">
                      {shopName}
                    </h1>
                    <p className="text-[11px] text-stone-700 font-medium">
                      {isAr ? 'الرياض • حي الصحافة • هاتف:' : 'Riyadh Atelier • Tel:'} {shopPhone}
                    </p>
                    <div className="text-[11px] font-bold border-y border-dashed border-black py-1 my-1 flex justify-between text-stone-900">
                      <span>{orderData.date}</span>
                      <span className="font-mono">POS #01</span>
                    </div>
                    <div className="text-center pt-0.5">
                      <span className="text-base font-black tracking-wider block font-mono text-black">
                        #{orderData.orderId}
                      </span>
                      <span className="text-[10px] uppercase font-sans font-bold text-black">
                        [ {orderData.paymentMethod} ]
                      </span>
                    </div>

                    {/* Scannable Thermal Barcode */}
                    <ThermalBarcode code={orderData.orderId} />
                  </div>

                  {/* Customer & Recipient Dispatch Info */}
                  <div className="border-b border-dashed border-black pb-2.5 text-xs space-y-1.5 text-stone-900 font-sans">
                    <div className="flex justify-between">
                      <span className="font-bold text-black">{isAr ? 'نوع التسليم:' : 'Handover:'}</span>
                      <span className="font-bold text-black">{orderData.deliveryType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-700">{isAr ? 'المرسل:' : 'Sender:'}</span>
                      <span className="font-semibold text-black">{orderData.customerName} ({orderData.customerPhone})</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-black">{isAr ? 'المستلم:' : 'Recipient:'}</span>
                      <span className="text-black font-extrabold">{orderData.recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-700">{isAr ? 'جوال المستلم:' : 'Phone:'}</span>
                      <span dir="ltr" className="font-mono font-semibold text-black">{orderData.recipientPhone}</span>
                    </div>
                    <div className="text-[11px] pt-1 text-stone-800 leading-normal">
                      <span className="font-bold text-black">{isAr ? 'العنوان:' : 'Address:'}</span> {orderData.district} - {orderData.addressDetails}
                    </div>
                  </div>

                  {/* Bouquet Recipe & Prep Details */}
                  <div className="border-b border-dashed border-black pb-2.5 text-xs space-y-1.5 font-sans text-stone-900">
                    <div className="flex justify-between font-bold text-xs text-black">
                      <span>1x {isAr ? orderData.bouquet.titleAr : orderData.bouquet.titleEn}</span>
                      <span>{orderData.bouquet.price} {strings.sar}</span>
                    </div>
                    <div className="text-[11px] ps-2 text-stone-800 font-medium">
                      • {orderData.bouquet.recipe}
                    </div>
                    <div className="text-[11px] ps-2 font-bold text-black">
                      • {isAr ? 'التغليف المطلوب:' : 'Wrap:'} {orderData.bouquet.wrapTweak}
                    </div>
                    <div className="text-[11px] ps-2 font-bold text-black">
                      • {isAr ? 'طباعة شريط الساتان:' : 'Ribbon Text:'} «{orderData.bouquet.ribbonText}»
                    </div>

                    {/* Add-ons */}
                    {orderData.addons.map((a, i) => (
                      <div key={i} className="flex justify-between text-[11px] ps-2 pt-0.5 text-stone-900">
                        <span>+ {isAr ? a.nameAr : a.nameEn}</span>
                        <span className="font-bold text-black">{a.price} {strings.sar}</span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Totals */}
                  <div className="border-b border-black pb-2.5 text-xs space-y-1.5 font-sans font-bold text-stone-900">
                    <div className="flex justify-between">
                      <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <span>{orderData.subtotal} {strings.sar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'رسوم التوصيل المبرد:' : 'Delivery Fee:'}</span>
                      <span>{orderData.deliveryFee} {strings.sar}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1.5 border-t border-dashed border-black font-black text-black">
                      <span>{isAr ? 'المجموع الإجمالي:' : 'GRAND TOTAL:'}</span>
                      <span>{orderData.totalAmount} {strings.sar}</span>
                    </div>
                  </div>

                  {/* Florist Hand-Off Checklist */}
                  <div className="border-b border-black pb-2.5 text-[11px] space-y-1.5 font-sans">
                    <span className="font-bold uppercase block tracking-wider text-center text-black">
                      --- {isAr ? 'قائمة فحص المنسق قبل الخروج' : 'Florist Quality Checklist'} ---
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-black font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-black inline-block text-center font-bold"></span>
                        <span>{isAr ? 'نضارة الورد' : 'Fresh Stems'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-black inline-block text-center font-bold"></span>
                        <span>{isAr ? 'طباعة الشريط' : 'Ribbon Printed'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-black inline-block text-center font-bold"></span>
                        <span>{isAr ? 'إرفاق الكرت' : 'Card Attached'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-black inline-block text-center font-bold"></span>
                        <span>{isAr ? 'معطر الورد' : 'Scent Sprayed'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scannable Digital Receipt QR Code */}
                  <div className="flex items-center justify-between pt-1 font-sans">
                    <div className="text-[10px] max-w-[190px] text-stone-800">
                      <span className="font-bold block text-black">{isAr ? 'تتبع الطلب إلكترونياً:' : 'Digital Order Link:'}</span>
                      <span className="font-mono text-[9px]">https://flowerhub.sa/o/8492</span>
                    </div>
                    <div className="w-12 h-12 p-0.5 bg-white border border-black shadow-xs">
                      <StylizedQRCode className="w-full h-full text-black" />
                    </div>
                  </div>

                  {/* TEAR OFF / CUT LINE FOR GIFT CARD VOUCHER */}
                  <div className="pt-3 border-t-2 border-dashed border-black text-center space-y-2 font-sans">
                    <div className="text-xs font-bold tracking-widest text-stone-800">
                      ✂ - - - - - - - - - - - - - - - - - - ✂
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block bg-black text-white py-1 px-3 rounded-md">
                      {isAr ? 'قسيمة كرت الإهداء (المرفق داخل الباقة)' : 'Gift Card Insert Voucher'}
                    </span>

                    <div className="p-3 border border-black rounded-xl text-start space-y-2 bg-stone-50 font-sans shadow-xs">
                      <div className="flex justify-between text-xs font-bold border-b border-stone-300 pb-1.5 text-black">
                        <span>{isAr ? 'إلى:' : 'To:'} {orderData.greetingCard.to}</span>
                        <span>{isAr ? 'من:' : 'From:'} {orderData.greetingCard.from}</span>
                      </div>
                      <p className="font-serif italic text-sm leading-relaxed text-center py-1.5 text-black font-semibold">
                        "{orderData.greetingCard.message}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-stone-300 text-stone-700">
                        <span>♫ {orderData.greetingCard.songTitle}</span>
                        <span className="font-mono font-bold text-black">#FL-8492</span>
                      </div>
                    </div>
                  </div>
                </ReceiptPrinter.Paper>
              </ReceiptPrinter.Output>
        </ReceiptPrinter.Root>
      </div>
    )}

        {/* =========================================================================
            PRINTABLE COMPONENT 2: LUXURY PRINTABLE A6 GIFT CARD
           ========================================================================= */}
        {printLayout === 'a6_card' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'معاينة كرت الإهداء الفاخر (مقاس A6):' : 'Luxury A6 Gift Card Canvas:'}</span>
              </label>
              <button
                onClick={handleCopyCard}
                className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                {copiedCard ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCard ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ النص' : 'Copy Text')}</span>
              </button>
            </div>

            <div
              id="printable-a6-giftcard"
              className="p-6 bg-[#FCFAF5] rounded-3xl border-2 border-stone-300 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute inset-2 border border-stone-300/70 rounded-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-serif font-bold text-xs flex items-center justify-center">
                    M
                  </span>
                  <span className="font-serif font-bold text-xs tracking-wider text-stone-800">
                    {shopName}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  #FLW-8492
                </span>
              </div>

              <div className="py-5 text-center relative z-10 px-3">
                <p className="font-serif text-stone-900 text-sm sm:text-base leading-relaxed italic font-medium">
                  "{orderData.greetingCard.message}"
                </p>
                <div className="mt-3 text-xs font-serif font-bold text-stone-800 tracking-wide">
                  {isAr ? '— من محبك: ' : '— From: '}
                  <span className="text-stone-950 font-extrabold">{orderData.greetingCard.from}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between relative z-10 text-[10px] text-stone-500">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-white p-1 border border-stone-200 shadow-xs flex items-center justify-center text-stone-900">
                    <StylizedQRCode className="w-full h-full text-stone-900" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-800 block">
                      {orderData.greetingCard.songTitle}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {isAr ? 'امسح للاستماع إلى إهداء الأغنية ♫' : 'Scan to listen to dedication'}
                    </span>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[9px] text-stone-400 block font-mono">
                    {formattedDate}
                  </span>
                  <span className="text-[9px] font-semibold text-stone-600">
                    Riyadh Atelier
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>
              {printLayout === 'thermal'
                ? isAr
                  ? 'طباعة إيصال الطابعة الحرارية (80mm)'
                  : 'Print 80mm POS Slip'
                : isAr
                ? 'طباعة كرت الإهداء (A6)'
                : 'Print A6 Gift Card'}
            </span>
          </button>

          <button
            onClick={handleCopyLink}
            className="py-3 px-3.5 rounded-2xl border border-stone-300 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            title={isAr ? 'نسخ رابط الطلب' : 'Copy Order URL'}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAr ? 'مشاركة' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return <div className="p-4 flex justify-center">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full flex justify-center">
        {content}
      </div>
    </div>
  );
}
