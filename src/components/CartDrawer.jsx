import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  CreditCard,
  Truck,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Store,
  Sparkles,
  Lock,
  Flame,
} from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';
import WhatsAppIcon from './WhatsAppIcon';

/**
 * Official Scalable Vector Apple Pay Logo
 * Eliminates broken glyph boxes (e.g. "Pay []") across all operating systems and browsers.
 */
function ApplePayLogo({ className = "h-5 text-white" }) {
  return (
    <div className={`inline-flex items-center gap-1 select-none ${className}`}>
      <svg
        className="h-[1.18em] w-auto fill-current"
        viewBox="0 0 170 170"
        aria-hidden="true"
      >
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-5.99-9.33-10.74-19.8-14.26-31.41-3.51-11.62-5.27-22.61-5.27-32.98 0-14.07 3.51-25.96 10.53-35.67 7.02-9.7 15.89-14.66 26.6-14.88 4.91 0 10.27 1.34 16.08 4.02 5.8 2.68 9.53 4.09 11.19 4.23 1.9-.27 5.75-1.74 11.55-4.41 5.8-2.68 11.04-3.95 15.72-3.81 10.99.68 20.08 4.77 27.27 12.28-9.84 5.99-14.67 14.28-14.48 24.87.19 8.28 3.29 15.22 9.3 20.82 6.01 5.6 13.11 8.87 21.31 9.81-2.22 6.78-4.88 13.57-7.98 20.37zM119.22 31.86c0-7.39 2.68-14.29 8.04-20.7 5.36-6.42 11.89-10.45 19.59-12.11 0 .61.05 1.25.15 1.92.1 1.06.15 2.11.15 3.16 0 7.39-2.73 14.35-8.19 20.89-5.46 6.54-12.02 10.6-19.68 12.18-.03-1.02-.06-2.8-.06-5.34z" />
      </svg>
      <span className="font-bold tracking-tight text-[1.12em] leading-none pt-0.5">Pay</span>
    </div>
  );
}

export default function CartDrawer({
  isOpen = false,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutWhatsApp,
  onCheckout,
  onOpenOrderSlip,
  lang = 'ar',
  shopConfig: _shopConfig = null,
  themeTokens: _themeTokens = THEME_TOKENS.botanical,
  fireConfetti,
}) {
  const strings = t[lang] || t.ar;
  const isAr = lang === 'ar';

  // Checkout State
  const [paymentMethod, setPaymentMethod] = useState('apple_pay'); // 'apple_pay' | 'card' | 'cod'
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // Delivery fee logic: free over 300 SAR or if pickup
  const hasDelivery = items.some(
    (item) => item.handover?.type === 'delivery' || item.handover?.type === 'gift'
  );
  const deliveryFee = !hasDelivery ? 0 : subtotal >= 300 ? 0 : 25;
  const originalDeliveryFee = 95; // Displayed crossed-out for high-converting marketing value
  const grandTotal = subtotal + deliveryFee;
  const vatAmount = Math.round(grandTotal * (15 / 115));

  // Express Payment Simulation Handler (Apple Pay, Mada, COD)
  const handleExpressPayment = (method) => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedOrderId = `FL-${Math.floor(1000 + Math.random() * 9000)}`;

      // Structure completed order for Thermal POS Slip & receipt
      const primaryItem = items[0] || {};
      const completedOrder = {
        orderId: generatedOrderId,
        date: new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US'),
        time: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        customerName: isAr ? 'عميل المتجر الفاخر' : 'Luxury Atelier Client',
        customerPhone: '+966 50 000 0000',
        recipientName: primaryItem.recipientName || (isAr ? 'المُهدى إليه' : 'Recipient'),
        recipientPhone: primaryItem.recipientPhone || '+966 55 123 4567',
        district: isAr ? 'الرياض - توصيل سريع' : 'Riyadh - Express Delivery',
        addressDetails: isAr ? 'حي النرجس، الرياض' : 'Al-Narjis Dist., Riyadh',
        deliveryType: hasDelivery
          ? isAr
            ? 'توصيل عبر أسطول مبرد خاص'
            : 'Chilled Luxury Courier'
          : isAr
          ? 'استلام من الفرع'
          : 'Boutique Pickup',
        deliveryWindow: isAr ? 'خلال ٦٠-٩٠ دقيقة' : 'Within 60-90 mins',
        paymentMethod:
          method === 'apple_pay'
            ? 'Apple Pay (مدفوع إلكترونياً)'
            : method === 'card'
            ? 'بطاقة مدى / ائتمانية (مدفوع)'
            : 'الدفع عند الاستلام (POS)',
        subtotal,
        deliveryFee,
        totalAmount: grandTotal,

        bouquet: {
          titleAr: primaryItem.titleAr || 'باقة أزهار فاخرة',
          titleEn: primaryItem.titleEn || 'Artisanal Floral Arrangement',
          image: primaryItem.image,
          price: primaryItem.price || subtotal,
          stemCount: primaryItem.stemCount || 25,
          recipe: isAr ? 'تنسيق أزهار طبيعية فاخرة مختارة' : 'Curated seasonal blooms',
          wrapTweak: primaryItem.wrapColor || (isAr ? 'تغليف دار الورد الفاخر' : 'Atelier signature wrap'),
          ribbonText: primaryItem.ribbonText || '',
        },

        addons: items.flatMap((it) => it.addons || []),

        greetingCard: {
          to: primaryItem.recipientName || '',
          message: primaryItem.giftCardMessage || (isAr ? 'مع أطيب الأمنيات وأجمل باقات الورد 🤍' : 'With heartfelt wishes 🤍'),
          from: primaryItem.senderName || '',
          songTitle: isAr ? 'مقطوعة موسيقية راقية' : 'Curated Symphony',
        },
      };

      setOrderSuccessData(completedOrder);

      // Trigger Confetti Celebration Cannon
      if (fireConfetti) {
        fireConfetti();
      }
    }, 1100);
  };

  // Close & Reset Success State
  const handleCloseDrawer = () => {
    if (orderSuccessData && onClearCart) {
      onClearCart();
    }
    setOrderSuccessData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end select-none">
          {/* Backdrop Overlay with Ultra-Smooth Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-md"
            onClick={handleCloseDrawer}
          />

          {/* Luxury Slide-Up Drawer Sheet with Physical Depth & Drag-to-Dismiss */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.85 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.25 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 90 || info.velocity.y > 350) {
                handleCloseDrawer();
              }
            }}
            className="relative z-10 w-full max-w-full sm:max-w-lg mx-auto rounded-t-[2.5rem] sm:rounded-3xl max-h-[94vh] flex flex-col overflow-hidden"
            style={{
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              color: 'var(--text-main, #1C1917)',
              boxShadow: '0 -24px 65px -12px rgba(0,0,0,0.35), 0 -1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* Multi-tone 24K Gold Crown Line */}
            <div
              className="h-[3px] w-full shrink-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(217,175,55,0.4) 15%, rgba(253,230,138,0.95) 50%, rgba(217,175,55,0.4) 85%, transparent)',
              }}
            />

            {/* Top Grooved Tactile Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center items-center shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700 shadow-inner" />
            </div>

            {/* ========================================================= */}
            {/* VIEW A: ORDER SUCCESS STATE (POST-CHECKOUT CONFIRMATION) */}
            {/* ========================================================= */}
            {orderSuccessData ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center space-y-5">
                {/* 3D Glowing Animated Checkmark Medallion */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.1))',
                    border: '2px solid rgba(16,185,129,0.35)',
                    boxShadow: '0 0 35px rgba(16,185,129,0.25), inset 0 2px 4px rgba(255,255,255,0.6)',
                  }}
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 stroke-[2]" />
                </motion.div>

                {/* Order Confirmation Text */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span
                    className="inline-block text-[11px] font-mono font-bold px-3 py-1 rounded-full mb-3 shadow-xs"
                    style={{
                      background: 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)',
                      border: '1px solid #F59E0B',
                      color: '#92400E',
                    }}
                  >
                    #{orderSuccessData.orderId}
                  </span>
                  <h3 className="text-xl font-serif font-black mt-1">
                    {isAr ? 'تم تأكيد طلبك بنجاح! 🌸' : 'Order Confirmed Successfully! 🌸'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 max-w-xs mx-auto leading-relaxed">
                    {isAr
                      ? 'بدأ فريق منسقي دار الورد بتجهيز أزهارك الطبيعية الطازجة بعناية فائقة.'
                      : 'Our floral artisans have commenced handcrafting your bespoke arrangement.'}
                  </p>
                </motion.div>

                {/* Receipt Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full p-4 rounded-2xl text-start space-y-2.5 text-xs shadow-inner"
                  style={{
                    background: 'linear-gradient(180deg, #FAF8F5 0%, #F5F2EB 100%)',
                    border: '1px solid rgba(214, 211, 209, 0.7)',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">{isAr ? 'طريقة الدفع:' : 'Payment:'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {orderSuccessData.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">{isAr ? 'الإجمالي المدفوع:' : 'Total Paid:'}</span>
                    <span className="font-extrabold text-sm text-stone-900">{orderSuccessData.totalAmount} {strings.sar}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">{isAr ? 'وقت التسليم المتوقع:' : 'Estimated Delivery:'}</span>
                    <span className="font-semibold text-stone-800">{orderSuccessData.deliveryWindow}</span>
                  </div>
                </motion.div>

                {/* 3D Tactile Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full space-y-3 pt-2"
                >
                  {onOpenOrderSlip && (
                    <button
                      type="button"
                      onClick={() => { onOpenOrderSlip(orderSuccessData); }}
                      className="tactile-print-cta w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? 'معاينة وطباعة الإيصال الحراري (80mm)' : 'Preview & Print 80mm Slip'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="tactile-keycap w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-stone-800 dark:text-stone-200 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>{isAr ? 'متابعة التسوق في المتجر' : 'Continue Shopping'}</span>
                  </button>
                </motion.div>
              </div>
            ) : (
              /* ========================================================= */
              /* VIEW B: CART ITEMS REVIEW & TACTILE PAYMENT SELECTOR      */
              /* ========================================================= */
              <>
                {/* Drawer Header — Luxury Boutique Medallion & 3D Close Keycap */}
                <div
                  className="px-5 py-3.5 flex items-center justify-between shrink-0"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    {/* 3D Obsidian Atelier Medallion */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(180deg, #2A2724 0%, #171513 50%, #0A0908 100%)',
                        border: '1px solid rgba(217,175,55,0.4)',
                        boxShadow: '0 3px 6px -1px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.25)',
                      }}
                    >
                      <ShoppingBag className="w-4.5 h-4.5 text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif font-black text-sm sm:text-base leading-tight text-stone-900 dark:text-stone-100">
                          {strings.cartTitle}
                        </h2>
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.5)',
                            color: '#92400E',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                        >
                          {totalItemsCount} {strings.items}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium block mt-0.5">
                        {isAr ? 'دار الورد • تنسيق وتوصيل فوري' : 'Maison des Fleurs • Express Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* 3D Tactile Close Keycap */}
                  <button
                    onClick={onClose}
                    type="button"
                    aria-label={isAr ? 'إغلاق السلة' : 'Close cart'}
                    className="tactile-keycap w-9 h-9 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-3.5 no-scrollbar">
                  {items.length === 0 ? (
                    <div className="py-16 text-center text-stone-400 flex flex-col items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
                        style={{
                          background: 'linear-gradient(180deg, #F5F5F4 0%, #E7E5E4 100%)',
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <ShoppingBag className="w-7 h-7 text-stone-400 stroke-[1.5]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{strings.emptyCart}</p>
                        <p className="text-xs text-stone-400 mt-1">{isAr ? 'أضف باقة ورد لبدء التسوق والطلب الفوري' : 'Add a bouquet to get started'}</p>
                      </div>
                      <button
                        onClick={onClose}
                        className="tactile-gold-cta mt-2 px-6 py-2.5 rounded-full text-xs font-black cursor-pointer shadow-md"
                      >
                        {isAr ? 'تصفح باقات الورد الفاخرة' : 'Browse Bouquets'}
                      </button>
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.25 }}
                        className="p-3.5 rounded-2xl flex gap-3.5 items-start transition-all relative"
                        style={{
                          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF9F6 100%)',
                          border: '1px solid rgba(229, 231, 235, 0.9)',
                          boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        {/* 3D Beveled Item Thumbnail */}
                        <div className="relative shrink-0">
                          <div
                            className="w-20 h-24 rounded-xl overflow-hidden p-0.5"
                            style={{
                              background: 'linear-gradient(180deg, #E5E5E5 0%, #D4D4D4 100%)',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.7)',
                            }}
                          >
                            <img
                              src={item.image}
                              alt={isAr ? item.titleAr : item.titleEn}
                              className="w-full h-full rounded-[10px] object-cover"
                              loading="eager"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = './images/products/royal-red-roses.jpg';
                              }}
                            />
                          </div>

                          {/* 3D Golden Quantity Badge */}
                          {(item.quantity || 1) > 1 && (
                            <span
                              className="absolute -top-1.5 -end-1.5 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center select-none"
                              style={{
                                background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
                                color: '#1C1917',
                                border: '1px solid rgba(254, 243, 199, 0.8)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.7)',
                              }}
                            >
                              {item.quantity}
                            </span>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          <div>
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="font-bold text-xs sm:text-sm leading-snug text-stone-900 truncate">
                                {isAr ? item.titleAr : item.titleEn}
                              </h4>

                              {/* 3D Tactile Trash Keycap */}
                              <button
                                onClick={() => onRemoveItem(index)}
                                type="button"
                                title={isAr ? 'حذف من السلة' : 'Remove'}
                                className="tactile-trash-keycap w-7 h-7 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>
                            </div>

                            {/* Luxury Customization Tags */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.ribbonText && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-medium truncate max-w-[170px] shadow-xs">
                                  🎀 {item.ribbonText}
                                </span>
                              )}
                              {item.giftCardMessage && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200/80 font-medium shadow-xs">
                                  ✉️ {isAr ? 'كرت إهداء' : 'Card'}
                                </span>
                              )}
                              {item.addons && item.addons.length > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/80 font-medium shadow-xs">
                                  +{item.addons.length} {isAr ? 'إضافات' : 'addons'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price Tag & Precision 3D Stepper */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-200/70">
                            {/* Rich Golden Price */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm sm:text-base font-black font-serif text-amber-600">
                                {item.price * (item.quantity || 1)}
                              </span>
                              <span className="text-[11px] font-bold text-stone-500">{strings.sar}</span>
                            </div>

                            {/* Precision 3D Stepper Dock */}
                            <div className="tactile-recessed-tray rounded-xl p-1 flex items-center gap-1.5 border border-stone-200">
                              {/* 3D Minus Keycap */}
                              <button
                                onClick={() => onUpdateQuantity(index, (item.quantity || 1) - 1)}
                                type="button"
                                aria-label={isAr ? 'إنقاص الكمية' : 'Decrease'}
                                className="tactile-keycap w-7 h-7 rounded-lg flex items-center justify-center text-stone-700 hover:text-stone-950 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>

                              {/* Number Display with Optical Recess */}
                              <span className="text-xs font-black w-5 text-center text-stone-900 select-none">
                                {item.quantity || 1}
                              </span>

                              {/* 3D Plus Keycap */}
                              <button
                                onClick={() => onUpdateQuantity(index, (item.quantity || 1) + 1)}
                                type="button"
                                aria-label={isAr ? 'زيادة الكمية' : 'Increase'}
                                className="tactile-keycap w-7 h-7 rounded-lg flex items-center justify-center text-stone-700 hover:text-stone-950 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}

                  {/* Financial Calculation Breakdown — Luxury Invoice Card */}
                  {items.length > 0 && (
                    <div
                      className="p-4 rounded-2xl space-y-2.5 text-xs shadow-sm relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(180deg, #FAF8F5 0%, #F5F2EB 100%)',
                        border: '1px solid rgba(220, 215, 205, 0.85)',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04), inset 0 1px 0 #FFFFFF',
                      }}
                    >
                      {/* Subtotal */}
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600 font-medium">{strings.subtotal}</span>
                        <span className="font-bold text-stone-800">{subtotal} {strings.sar}</span>
                      </div>

                      {/* Delivery Row with High-Converting Free Badge & Strikethrough */}
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600 font-medium">{strings.deliveryFee}</span>
                        <div className="flex items-center gap-2">
                          {deliveryFee === 0 ? (
                            <>
                              <del className="text-stone-400 font-mono text-[11px]">
                                {originalDeliveryFee} {strings.sar}
                              </del>
                              {/* 3D Radiant Emerald Pill */}
                              <span
                                className="inline-flex items-center gap-1 font-black text-[11px] px-2.5 py-0.5 rounded-full"
                                style={{
                                  background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                                  color: '#FFFFFF',
                                  border: '1px solid rgba(167, 243, 208, 0.6)',
                                  boxShadow: '0 2px 0 #047857, 0 3px 6px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
                                }}
                              >
                                + {isAr ? 'مجاني' : (strings.freeDelivery || 'Free')}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-stone-800">{deliveryFee} {strings.sar}</span>
                          )}
                        </div>
                      </div>

                      {/* VAT Breakdown */}
                      <div className="flex justify-between items-center text-[11px] text-stone-500">
                        <span>{isAr ? 'ضريبة القيمة المضافة (15% مشمولة):' : 'VAT (15% included):'}</span>
                        <span className="font-mono font-semibold">{vatAmount} {strings.sar}</span>
                      </div>

                      {/* Stitched Luxury Perforated Divider */}
                      <div className="pt-2 border-t border-dashed border-stone-300 flex justify-between items-center">
                        <span className="font-serif font-black text-sm text-stone-900">{strings.total}:</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-serif font-black text-amber-600">
                            {grandTotal}
                          </span>
                          <span className="text-xs font-bold text-stone-600">{strings.sar}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Single Unified WhatsApp Confirmation Channel */}
                  {items.length > 0 && (
                    <div className="space-y-2 pt-1 select-none">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                          <span>{isAr ? 'طريقة تأكيد وإرسال الطلب:' : 'Order Dispatch Channel:'}</span>
                        </label>
                        <span
                          className="text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(37, 211, 102, 0.12)',
                            color: '#0f766e',
                            border: '1px solid rgba(37, 211, 102, 0.3)',
                          }}
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>{isAr ? 'واتساب مباشر 💬' : 'Direct WhatsApp'}</span>
                        </span>
                      </div>

                      {/* WhatsApp Channel Card with Florist Direct Contact Details */}
                      <div className="tactile-recessed-tray rounded-2xl p-3 border border-emerald-500/25 flex items-start gap-3 bg-gradient-to-br from-emerald-50/70 via-white to-stone-50/50 shadow-2xs">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-[#25D366] to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
                          <WhatsAppIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-bold text-stone-900 font-serif">
                              {isAr ? 'إرسال الطلب والتواصل مباشرة عبر واتساب' : 'Direct WhatsApp Order Dispatch'}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {isAr ? 'معتمد' : 'Direct'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            {isAr
                              ? 'ستنتقل محادثتك فوراً إلى واتساب منسق المتجر مع تفاصيل الباقات، كرت الإهداء، والموقع لتأكيد التجهيز والدفع والتوصيل بلحظات.'
                              : 'Your complete order details, gift card, and address will be sent directly to the florist on WhatsApp to confirm preparation and delivery.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkout Action Footer with Single 3D Master WhatsApp Button */}
                {items.length > 0 && (
                  <div
                    className="p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-2.5 shrink-0"
                    style={{
                      background: 'var(--surface-card, #FFFFFF)',
                      borderTop: '1px solid rgba(0, 0, 0, 0.07)',
                      boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {/* Master 3D WhatsApp Button */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => {
                          setIsProcessing(false);
                          if (onCheckout) onCheckout();
                        }, 250);
                      }}
                      className="tactile-whatsapp-master-cta tactile-sheen w-full py-4 px-4 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 overflow-hidden shadow-lg"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{isAr ? 'جاري فتح محادثة الواتساب...' : 'Opening WhatsApp chat...'}</span>
                        </span>
                      ) : (
                        <>
                          <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
                          <span>{isAr ? 'إرسال وتأكيد الطلب عبر واتساب' : 'Confirm Order on WhatsApp'}</span>
                          <span className="text-emerald-200 text-xs select-none">✦</span>
                          <div className="flex items-baseline gap-1 text-white">
                            <span className="font-black text-base sm:text-lg tracking-tight">
                              {grandTotal}
                            </span>
                            <span className="text-xs font-bold text-emerald-100">{strings.sar}</span>
                          </div>
                        </>
                      )}
                    </button>

                    {/* WhatsApp Trust & Direct Communication Micro-Badges */}
                    <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-stone-500 font-medium">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                        {isAr ? 'محادثة مباشرة مع المنسق' : 'Direct Florist Chat'}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        {isAr ? 'تصوير الباقة قبل التوصيل' : 'Photo Proof'}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-blue-500" />
                        {isAr ? 'أسطول مبرد سريع' : 'Chilled Fleet'}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
