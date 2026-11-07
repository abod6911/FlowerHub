import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end animate-fade-in select-none">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={handleCloseDrawer}
      />

      {/* Solid Slide-Up Drawer Sheet */}
      <div
        className="relative z-10 w-full max-w-full sm:max-w-lg mx-auto rounded-t-[2rem] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up border-t"
        style={{
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          borderColor: 'var(--border-subtle, rgba(0,0,0,0.1))',
          color: 'var(--text-main, #1C1917)',
        }}
      >
        {/* Top Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center items-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* ========================================================= */}
        {/* VIEW A: ORDER SUCCESS STATE (POST-CHECKOUT CONFIRMATION) */}
        {/* ========================================================= */}
        {orderSuccessData ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
                #{orderSuccessData.orderId}
              </span>
              <h3 className="text-lg sm:text-xl font-bold mt-2">
                {isAr ? 'تم تأكيد طلبك بنجاح! 🌸' : 'Order Confirmed Successfully! 🌸'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                {isAr
                  ? 'بدأ فريق منسقي دار الورد بتجهيز أزهارك الطبيعية الطازجة بعناية فائقة.'
                  : 'Our floral artisans have commenced handcrafting your bespoke arrangement.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-start space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">{isAr ? 'طريقة الدفع:' : 'Payment:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {orderSuccessData.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isAr ? 'الإجمالي المدفوع:' : 'Total Paid:'}</span>
                <span className="font-extrabold text-sm">{orderSuccessData.totalAmount} {strings.sar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isAr ? 'وقت التسليم المتوقع:' : 'Estimated Delivery:'}</span>
                <span className="font-semibold">{orderSuccessData.deliveryWindow}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              {onOpenOrderSlip && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenOrderSlip(orderSuccessData);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>{isAr ? 'معاينة وطباعة الإيصال الحراري (80mm)' : 'Preview & Print 80mm Slip'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="w-full py-3 px-4 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-98 transition-all"
              >
                <Store className="w-4 h-4" />
                <span>{isAr ? 'متابعة التسوق في المتجر' : 'Continue Shopping'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW B: CART ITEMS REVIEW & EXPRESS PAYMENT SELECTOR      */
          /* ========================================================= */
          <>
            {/* Drawer Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--accent-primary, #022C22)' }}
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base leading-tight">
                    {strings.cartTitle}
                  </h2>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {totalItemsCount} {strings.items}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-3 no-scrollbar">
              {items.length === 0 ? (
                <div className="py-14 text-center text-stone-400 dark:text-neutral-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">{strings.emptyCart}</p>
                  <button
                    onClick={onClose}
                    className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-stone-900 text-white"
                  >
                    {isAr ? 'تصفح باقات الورد' : 'Browse Bouquets'}
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/50 flex gap-3 items-start transition-all"
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={item.image}
                      alt={isAr ? item.titleAr : item.titleEn}
                      className="w-18 h-22 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700 bg-stone-100"
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = './images/products/royal-red-roses.jpg';
                      }}
                    />

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
                  </div>
                ))
              )}

              {/* Financial Calculation Breakdown */}
              {items.length > 0 && (
                <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">{strings.subtotal}</span>
                    <span className="font-semibold">{subtotal} {strings.sar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{strings.deliveryFee}</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {strings.freeDelivery}
                        </strong>
                      ) : (
                        `${deliveryFee} ${strings.sar}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>{isAr ? 'ضريبة القيمة المضافة (15% مشمولة):' : 'VAT (15% included):'}</span>
                    <span>{vatAmount} {strings.sar}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between font-bold text-sm">
                    <span>{strings.total}:</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">
                      {grandTotal} {strings.sar}
                    </span>
                  </div>
                </div>
              )}

              {/* Express Payment Selector Segment */}
              {items.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold block text-stone-800 dark:text-stone-200">
                    {isAr ? 'طريقة الدفع والتأكيد السريع:' : 'Payment & Express Checkout:'}
                  </label>

                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                        paymentMethod === 'apple_pay'
                          ? 'bg-stone-950 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                    >
                      <span> Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                        paymentMethod === 'card'
                          ? 'bg-stone-950 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مدى / فيزا' : 'Card'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                        paymentMethod === 'cod'
                          ? 'bg-stone-950 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
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
              <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-stone-200 dark:border-stone-800 space-y-2 shrink-0 bg-stone-50 dark:bg-stone-950/80">
                {/* Method 1: Apple Pay Button */}
                {paymentMethod === 'apple_pay' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleExpressPayment('apple_pay')}
                    className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-stone-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>{isAr ? 'جاري المصادقة عبر Face ID...' : 'Authenticating Face ID...'}</span>
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold text-base"> Pay</span>
                        <span className="text-stone-400">•</span>
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
                    className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all disabled:opacity-60"
                    style={{ backgroundColor: 'var(--accent-primary, #022C22)' }}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>{isAr ? 'جاري تأكيد الدفع...' : 'Processing Payment...'}</span>
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
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
                    className="w-full py-2.5 px-3 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current text-emerald-600" />
                    <span>{isAr ? 'أو الإرسال المباشر عبر واتساب' : 'Or Send directly via WhatsApp'}</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
