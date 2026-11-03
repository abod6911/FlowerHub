import React from 'react';
import { ShoppingBag, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { t } from '../utils/translations';
import { THEME_TOKENS } from '../data/mockData';
import { SoapBubbleButton } from './soap-bubble';

export default function FloatingCartBar({
  items = [],
  onOpenCart,
  lang = 'ar',
  themeTokens: _themeTokens = THEME_TOKENS.botanical,
  isHidden = false,
}) {
  const isAr = lang === 'ar';
  const strings = t[lang] || t.ar;

  const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const hasDelivery = items.some(
    (item) => item.handover?.type === 'delivery' || item.handover?.type === 'gift'
  );
  const deliveryFee = !hasDelivery ? 0 : subtotal >= 300 ? 0 : 25;
  const grandTotal = subtotal + deliveryFee;

  // Hide smoothly if cart is empty or hidden by another open drawer
  if (totalItemsCount === 0 || isHidden) {
    return null;
  }

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-slide-up pointer-events-none">
      <div
        onClick={onOpenCart}
        className="pointer-events-auto rounded-2xl p-3 sm:p-3.5 shadow-2xl border flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] select-none backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--surface-card, rgba(28, 25, 23, 0.95))',
          borderColor: 'var(--border-subtle, rgba(212, 175, 55, 0.3))',
          color: 'var(--text-main, #FFFFFF)',
          boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.4), 0 0 15px 0 rgba(212, 175, 55, 0.15)',
        }}
      >
        {/* Left Side: Badge Counter & Totals */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-inner transition-transform group-hover:scale-105"
              style={{
                backgroundColor: 'var(--accent-primary, #022C22)',
              }}
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>

            {/* Glowing Item Count Badge */}
            <span
              className="absolute -top-1.5 -end-1.5 min-w-[20px] h-5 px-1 rounded-full text-stone-950 text-xs font-black flex items-center justify-center shadow-md animate-pulse"
              style={{
                backgroundColor: 'var(--accent-gold, #D4AF37)',
              }}
            >
              {totalItemsCount}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold block">
                {strings.viewBag}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30">
                Express
              </span>
            </div>
            <span className="text-[11px] sm:text-xs opacity-80 block font-medium">
              {totalItemsCount} {strings.items} •{' '}
              <strong className="text-amber-400 font-extrabold">{grandTotal} {strings.sar}</strong>
            </span>
          </div>
        </div>

        {/* Right Side: Soap Bubble Refractive CTA Button */}
        <SoapBubbleButton
          onClick={(e) => {
            e.stopPropagation();
            onOpenCart();
          }}
          iridescence={0.35}
          glass={0.9}
          refraction={0.15}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: 'var(--accent-gold, #D4AF37)',
            color: '#1C1917',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-stone-900" />
          <span>{isAr ? 'إتمام الطلب' : 'Checkout'}</span>
          {isAr ? <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
        </SoapBubbleButton>
      </div>
    </div>
  );
}
