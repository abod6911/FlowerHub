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
  Gift,
} from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';

export default function CartDrawer({
  isOpen = false,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutWhatsApp,
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end select-none">
      {/* Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleCloseDrawer}
      />

      {/* Luxury Slide-Up Drawer Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative z-10 w-full max-w-full sm:max-w-lg mx-auto rounded-t-[2rem] sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden border-t"
        style={{
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          borderColor: 'var(--border-subtle, rgba(0,0,0,0.08))',
          color: 'var(--text-main, #1C1917)',
          boxShadow: '0 -20px 60px -10px rgba(0,0,0,0.25), 0 -1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Decorative gold top stripe */}
        <div
          className="h-[2px] w-full shrink-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(217,175,55,0.6) 25%, rgba(217,175,55,0.9) 50%, rgba(217,175,55,0.6) 75%, transparent)',
          }}
        />

        {/* Top Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center items-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-stone-200 dark:bg-stone-700" />
        </div>

        {/* ========================================================= */}
        {/* VIEW A: ORDER SUCCESS STATE (POST-CHECKOUT CONFIRMATION) */}
        {/* ========================================================= */}
        {orderSuccessData ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center space-y-5">
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))',
                border: '2px solid rgba(16,185,129,0.3)',
                boxShadow: '0 0 30px rgba(16,185,129,0.2)',
              }}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500 stroke-[1.5]" />
            </motion.div>

            {/* Order confirmation text */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span
                className="inline-block text-[10px] font-mono font-bold px-3 py-1.5 rounded-full mb-3"
                style={{
                  background: 'rgba(217,175,55,0.1)',
                  border: '1px solid rgba(217,175,55,0.3)',
                  color: '#d4af37',
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
              className="w-full p-4 rounded-2xl text-start space-y-2 text-xs"
              style={{
                background: 'var(--surface-muted, rgba(0,0,0,0.03))',
                border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-stone-500">{isAr ? 'طريقة الدفع:' : 'Payment:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {orderSuccessData.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">{isAr ? 'الإجمالي المدفوع:' : 'Total Paid:'}</span>
                <span className="font-extrabold text-sm">{orderSuccessData.totalAmount} {strings.sar}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">{isAr ? 'وقت التسليم المتوقع:' : 'Estimated Delivery:'}</span>
                <span className="font-semibold">{orderSuccessData.deliveryWindow}</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full space-y-2.5 pt-1"
            >
              {onOpenOrderSlip && (
                <button
                  type="button"
                  onClick={() => { onOpenOrderSlip(orderSuccessData); }}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #1c1917, #0c0a09)',
                    color: '#fff',
                    border: '1px solid rgba(217,175,55,0.2)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'معاينة وطباعة الإيصال الحراري (80mm)' : 'Preview & Print 80mm Slip'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-98 transition-all cursor-pointer"
                style={{
                  border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                }}
              >
                <Store className="w-4 h-4" />
                <span>{isAr ? 'متابعة التسوق في المتجر' : 'Continue Shopping'}</span>
              </button>
            </motion.div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW B: CART ITEMS REVIEW & EXPRESS PAYMENT SELECTOR      */
          /* ========================================================= */
          <>
            {/* Drawer Header — Luxury Atelier Style */}
            <div
              className="px-5 py-3.5 flex items-center justify-between shrink-0"
              style={{ borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.07))' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #1c1917, #0c0a09)',
                    border: '1px solid rgba(217,175,55,0.2)',
                  }}
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-serif font-black text-sm sm:text-base leading-tight">
                    {strings.cartTitle}
                  </h2>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    {totalItemsCount} {strings.items}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-3 no-scrollbar">
              {items.length === 0 ? (
                <div className="py-16 text-center text-stone-400 dark:text-neutral-500 flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.07)',
                    }}
                  >
                    <ShoppingBag className="w-7 h-7 opacity-30" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{strings.emptyCart}</p>
                    <p className="text-xs text-stone-400 mt-1">{isAr ? 'أضف باقة ورد لبدء التسوق' : 'Add a bouquet to get started'}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-1 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #1c1917, #0c0a09)' }}
                  >
                    {isAr ? 'تصفح باقات الورد' : 'Browse Bouquets'}
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className="p-3.5 rounded-2xl flex gap-3 items-start transition-all"
                    style={{
                      background: 'var(--surface-muted, rgba(0,0,0,0.025))',
                      border: '1px solid var(--border-subtle, rgba(0,0,0,0.07))',
                    }}
                  >
                    {/* Item Thumbnail */}
                    <div className="relative shrink-0">
                      <img
                        src={item.image}
                        alt={isAr ? item.titleAr : item.titleEn}
                        className="w-18 h-22 rounded-xl object-cover border"
                        style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#f5f5f4' }}
                        loading="eager"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = './images/products/royal-red-roses.jpg';
                        }}
                      />
                      {/* Quantity badge overlay */}
                      {(item.quantity || 1) > 1 && (
                        <span
                          className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                            color: '#1c1917',
                            boxShadow: '0 2px 6px rgba(217,175,55,0.5)',
                          }}
                        >
                          {item.quantity}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs sm:text-sm leading-snug truncate">
                          {isAr ? item.titleAr : item.titleEn}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(index)}
                          type="button"
                          title={isAr ? 'حذف' : 'Remove'}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Customization Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.ribbonText && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium truncate max-w-[170px]">
                            🎀 {item.ribbonText}
                          </span>
                        )}
                        {item.giftCardMessage && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium">
                            ✉️ {isAr ? 'كرت إهداء' : 'Card'}
                          </span>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium">
                            +{item.addons.length} {isAr ? 'إضافات' : 'addons'}
                          </span>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                        <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                          {item.price * (item.quantity || 1)} {strings.sar}
                        </span>

                        <div className="flex items-center gap-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-2 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(index, (item.quantity || 1) - 1)}
                            type="button"
                            className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, (item.quantity || 1) + 1)}
                            type="button"
                            className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Financial Calculation Breakdown */}
              {items.length > 0 && (
                <div
                  className="p-4 rounded-2xl space-y-2 text-xs"
                  style={{
                    background: 'var(--surface-muted, rgba(0,0,0,0.025))',
                    border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">{strings.subtotal}</span>
                    <span className="font-semibold">{subtotal} {strings.sar}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">{strings.deliveryFee}</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                          ✦ {strings.freeDelivery}
                        </span>
                      ) : (
                        `${deliveryFee} ${strings.sar}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-stone-400">
                    <span>{isAr ? 'ضريبة القيمة المضافة (15% مشمولة):' : 'VAT (15% included):'}</span>
                    <span className="font-mono">{vatAmount} {strings.sar}</span>
                  </div>
                  <div
                    className="pt-2.5 mt-1 border-t flex justify-between items-center"
                    style={{ borderColor: 'var(--border-subtle, rgba(0,0,0,0.08))' }}
                  >
                    <span className="font-serif font-bold text-sm">{strings.total}:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-serif font-black text-amber-500 dark:text-amber-400">
                        {grandTotal}
                      </span>
                      <span className="text-xs font-bold text-stone-500">{strings.sar}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Express Payment Selector Segment */}
              {items.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-serif font-bold block text-stone-800 dark:text-stone-200">
                      {isAr ? 'طريقة الدفع والتأكيد السريع:' : 'Payment & Express Checkout:'}
                    </label>
                    <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{isAr ? 'دفع فوري آمن' : 'Instant & Secure'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`py-2.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'apple_pay'
                          ? 'bg-black text-white shadow-md ring-1 ring-white/20'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-sm"></span>
                      <span>Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-stone-950 text-white shadow-md ring-1 ring-amber-400/40'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مدى / فيزا' : 'Card'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`py-2.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'bg-stone-950 text-white shadow-md ring-1 ring-amber-400/40'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{isAr ? 'عند الاستلام' : 'COD'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Action Footer */}
            {items.length > 0 && (
              <div
                className="p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-2 shrink-0"
                style={{
                  background: 'var(--surface-card, #FFFFFF)',
                  borderTop: '1px solid var(--border-subtle, rgba(0,0,0,0.07))',
                }}
              >
                {/* Method 1: Apple Pay Button */}
                {paymentMethod === 'apple_pay' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleExpressPayment('apple_pay')}
                    className="w-full py-4 px-4 rounded-2xl bg-black hover:bg-stone-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all disabled:opacity-60 cursor-pointer border border-white/10"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>{isAr ? 'جاري المصادقة عبر Face ID...' : 'Authenticating Face ID...'}</span>
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold text-base"> Pay</span>
                        <span className="text-stone-500">•</span>
                        <span>{grandTotal} {strings.sar}</span>
                      </>
                    )}
                  </button>
                )}

                {/* Method 2: Card / COD Button */}
                {paymentMethod !== 'apple_pay' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleExpressPayment(paymentMethod)}
                    className="w-full py-4 px-4 rounded-2xl text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                      boxShadow: '0 8px 24px -4px rgba(217, 175, 55, 0.4)',
                    }}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-stone-950/40 border-t-stone-950 rounded-full animate-spin" />
                        <span>{isAr ? 'جاري تأكيد الدفع...' : 'Processing Payment...'}</span>
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-stone-950" />
                        <span>
                          {isAr ? 'تأكيد الطلب الفوري' : 'Confirm Express Order'} • {grandTotal} {strings.sar}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {/* Method 3: WhatsApp Checkout Alternative */}
                {onCheckoutWhatsApp && (
                  <button
                    type="button"
                    onClick={onCheckoutWhatsApp}
                    className="w-full py-2.5 px-3 rounded-xl border border-emerald-600/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
                    <span>{isAr ? 'أو الإرسال المباشر عبر واتساب' : 'Or Send directly via WhatsApp'}</span>
                  </button>
                )}
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
