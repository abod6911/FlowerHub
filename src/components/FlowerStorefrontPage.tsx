"use client";

import React, { useState, useRef, useMemo, ElementType } from "react";
import FloristOrderSlipModal from "./FloristOrderSlipModal";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  type Transition,
  type Variants,
  AnimatePresence,
} from "framer-motion";

// ==========================================
// 1. المكونات التفاعلية المدمجة (Fancy & Bubble Components)
// ==========================================

// --- أ. مكون الطفو الفيزيائي ثلاثي الأبعاد (Float Engine) ---
interface FloatProps {
  children: React.ReactNode;
  speed?: number;
  amplitude?: [number, number, number];
  rotationRange?: [number, number, number];
  timeOffset?: number;
  className?: string;
}

const Float: React.FC<FloatProps> = ({
  children,
  speed = 0.5,
  amplitude = [6, 12, 10],
  rotationRange = [6, 6, 4],
  timeOffset = 0,
  className,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const z = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rotateZ = useMotionValue(0);
  const time = useRef(0);

  useAnimationFrame(() => {
    time.current += speed * 0.02;
    x.set(Math.sin(time.current * 0.7 + timeOffset) * amplitude[0]);
    y.set(Math.sin(time.current * 0.6 + timeOffset) * amplitude[1]);
    z.set(Math.sin(time.current * 0.5 + timeOffset) * amplitude[2]);
    rotateX.set(Math.sin(time.current * 0.5 + timeOffset) * rotationRange[0]);
    rotateY.set(Math.sin(time.current * 0.4 + timeOffset) * rotationRange[1]);
    rotateZ.set(Math.sin(time.current * 0.3 + timeOffset) * rotationRange[2]);
  });

  return (
    <motion.div
      style={{
        x,
        y,
        z,
        rotateX,
        rotateY,
        rotateZ,
        transformStyle: "preserve-3d",
      }}
      className={`will-change-transform ${className || ""}`}
    >
      {children}
    </motion.div>
  );
};

// --- ب. مكون النص المتنفس (Breathing Text) مع الحفاظ على ترابط الحروف العربية ---
interface BreathingTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: ElementType;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  transition?: Transition;
  staggerDuration?: number;
}

const BreathingText: React.FC<BreathingTextProps> = ({
  children,
  as: Component = "span",
  fromFontVariationSettings,
  toFontVariationSettings,
  transition = { duration: 1.8, ease: "easeInOut" },
  staggerDuration = 0.06,
  className,
  ...props
}) => {
  const textContent = String(children || "");
  const hasArabic = /[\u0600-\u06FF]/.test(textContent);
  // للحفاظ على ترابط الخط العربي الفاخر، يتم التقسيم على الكلمات وليس تفريق الأحرف
  const segments = hasArabic ? textContent.split(/(\s+)/) : textContent.split("");

  const letterVariants: Variants = {
    initial: { fontVariationSettings: fromFontVariationSettings },
    animate: (i: number) => ({
      fontVariationSettings: toFontVariationSettings,
      transition: {
        ...transition,
        repeat: Infinity,
        repeatType: "mirror",
        delay: i * staggerDuration,
      },
    }),
  };

  return (
    <Component className={`relative inline-block ${className || ""}`} {...props}>
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          variants={letterVariants}
          initial="initial"
          animate="animate"
          custom={Math.abs(i - Math.floor(segments.length / 2))}
        >
          {segment}
        </motion.span>
      ))}
    </Component>
  );
};

// --- ج. مكون تضخيم الحروف العشوائي عند التمرير (Variable Font Hover) ---
interface VariableHoverProps {
  label: string;
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
  staggerDuration?: number;
  className?: string;
}

const VariableFontHoverByRandomLetter: React.FC<VariableHoverProps> = ({
  label,
  fromFontVariationSettings = "'wght' 500",
  toFontVariationSettings = "'wght' 900",
  staggerDuration = 0.03,
  className,
}) => {
  const hasArabic = /[\u0600-\u06FF]/.test(label);
  const segments = useMemo(() => {
    return hasArabic ? label.split(/(\s+)/) : label.split("");
  }, [label, hasArabic]);

  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: segments.length }, (_, i) => i);
    let seed = segments.length * 31 + 17;
    for (let i = indices.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [segments.length]);

  const letterVariants = {
    hover: (index: number) => ({
      fontVariationSettings: toFontVariationSettings,
      transition: { type: "spring", stiffness: 350, damping: 20, delay: staggerDuration * index },
    }),
    initial: (index: number) => ({
      fontVariationSettings: fromFontVariationSettings,
      transition: { type: "spring", stiffness: 350, damping: 20, delay: staggerDuration * index },
    }),
  };

  return (
    <motion.span className={`inline-flex cursor-pointer select-none ${className || ""}`} whileHover="hover" initial="initial">
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          variants={letterVariants}
          custom={shuffledIndices[i]}
        >
          {segment}
        </motion.span>
      ))}
    </motion.span>
  );
};

// --- د. تأثير قطرات الندى والزجاج السائل (Soap Bubble Dew Drop Capsule) ---
const SoapBubblePill: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ children, active, onClick, className }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 overflow-hidden backdrop-blur-md border ${
        active
          ? "bg-[#123524] text-white border-[#123524] shadow-md shadow-[#123524]/20"
          : "bg-white/80 text-neutral-700 border-white/60 hover:bg-white shadow-sm"
      } ${className || ""}`}
      style={{
        boxShadow: active
          ? "0 4px 14px rgba(18, 53, 36, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.4)"
          : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
      }}
    >
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
      {/* وميض الزجاج وقوس انعكاس قطرة الماء */}
      <span className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full pointer-events-none" />
    </motion.button>
  );
};

// ==========================================
// 2. بيانات المتجر والمنتجات
// ==========================================
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: { text: string; color: string; icon: string };
  isFavorite?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "فازة أحلام الباستيل هيدرنجيا وورود",
    price: 320,
    originalPrice: 360,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
    badge: { text: "جاهز الآن", color: "bg-amber-500/15 text-amber-900 border-amber-200/60", icon: "🕒" },
  },
  {
    id: "p2",
    name: "بوكيه كولكشن الروز المخملي الفاخر",
    price: 245,
    originalPrice: 295,
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
    badge: { text: "قطعة واحدة فقط", color: "bg-rose-500/15 text-rose-900 border-rose-200/60", icon: "✨" },
  },
  {
    id: "p3",
    name: "بوكس الأكريليك الفاخر مع الورد الطبيعي",
    price: 275,
    originalPrice: 310,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    badge: { text: "قابل للتخصيص", color: "bg-emerald-500/15 text-emerald-900 border-emerald-200/60", icon: "✏️" },
  },
  {
    id: "p4",
    name: "تنسيق قبة العشق الأبدية الملكية",
    price: 450,
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80",
  },
];

const OCCASIONS = [
  { label: "الكل", icon: "🌿", active: true },
  { label: "جاهز اليوم", icon: "⚡" },
  { label: "تخرج", icon: "🎓" },
  { label: "يوم ميلاد", icon: "🎂" },
  { label: "مواليد", icon: "👶" },
  { label: "حب ورومانسية", icon: "💖" },
];

// ==========================================
// 3. الصفحة الرئيسية للمتجر (Storefront Page)
// ==========================================
export default function FlowerStorefrontPage() {
  const [selectedFilter, setSelectedFilter] = useState("جميع التنسيقات");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(1);
  const [flyingToCart, setFlyingToCart] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (id: string) => {
    setFlyingToCart(id);
    setCartCount((prev) => prev + 1);
    setTimeout(() => setFlyingToCart(null), 800);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans pb-24 selection:bg-rose-100 selection:text-rose-900 w-full">
      
      {/* حاوية الجوال المتجاوبة */}
      <main className="max-w-md mx-auto min-h-screen bg-[#FAF8F5] shadow-2xl relative flex flex-col border-x border-neutral-200/70 overflow-hidden">
        
        {/* بتلات عائمة هادئة في الخلفية (Ambient Floating Petals) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
          <Float speed={0.35} amplitude={[12, 20, 8]} timeOffset={0.2} className="absolute top-20 right-8">
            <span className="text-xl select-none">🌸</span>
          </Float>
        </div>

        {/* 1. كرت رأس المتجر الفاخر (Store Header Card) */}
        <header className="relative z-10 m-3.5 p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-rose-100/70 shadow-sm">
          <div className="flex items-start justify-between">
            {/* شارة الحالة المتنفسة (Breathing Text) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <BreathingText
                fromFontVariationSettings="'wght' 400"
                toFontVariationSettings="'wght' 700"
                className="text-[11px]"
              >
                مفتوح الآن • تجهيز فوري
              </BreathingText>
            </div>

            {/* أيقونة شعار المتجر */}
            <div className="w-11 h-11 rounded-2xl bg-[#7E1529] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shadow-rose-950/20">
              M
            </div>
          </div>

          {/* اسم المتجر التيبوغرافي الفاخر مع تضخيم الحروف عند التمرير */}
          <div className="mt-3 mb-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E1B18]">
              <VariableFontHoverByRandomLetter
                label="دار الورد للمناسبات"
                fromFontVariationSettings="'wght' 600"
                toFontVariationSettings="'wght' 900"
                className="hover:text-[#7E1529] transition-colors"
              />
            </h1>
            <p className="text-xs text-neutral-500 mt-1">أزهار طبيعية فاخرة بالرياض</p>
            <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-neutral-400">
              <span>⭐ 4.9</span>
              <span>•</span>
              <span>📍 توصيل لكافة أحياء الرياض</span>
            </div>
          </div>

          {/* شريط البحث المباشر */}
          <div className="mt-3.5 pt-2.5 border-t border-neutral-100">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن باقة، فازة، أو مناسبة..."
                className="w-full pl-3 pr-8 py-2 text-xs rounded-full bg-[#F5F3EF] border border-transparent focus:border-rose-400 focus:bg-white focus:outline-none transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs text-neutral-400">🔍</span>
            </div>
          </div>
        </header>

        {/* 2. شريط دوائر المناسبات الطافية (Floating Occasions Stories) */}
        <section className="relative z-10 px-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-neutral-800">تصفح حسب المناسبة</h2>
            <span className="text-[11px] text-neutral-400">عرض الكل</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
            {OCCASIONS.map((item, idx) => (
              <Float key={idx} speed={0.35} amplitude={[2, 5, 3]} timeOffset={idx * 0.4} className="flex-shrink-0">
                <button className="flex flex-col items-center gap-1.5 group">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all shadow-sm ${
                      item.active
                        ? "bg-[#123524] text-white ring-2 ring-[#123524] ring-offset-2"
                        : "bg-white text-neutral-700 border border-neutral-200 group-hover:border-rose-300"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className={`text-[11px] ${item.active ? "font-bold text-[#123524]" : "text-neutral-600"}`}>
                    {item.label}
                  </span>
                </button>
              </Float>
            ))}
          </div>
        </section>

        {/* 3. شريط فلاتر قطرات الندى (Soap Bubble Filter Pills) */}
        <section className="relative z-10 px-4 mt-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {["جميع التنسيقات", "باقات يد", "فازات زجاجية", "صواني وبوكسات"].map((filter) => (
              <SoapBubblePill
                key={filter}
                active={selectedFilter === filter}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </SoapBubblePill>
            ))}
          </div>
        </section>

        {/* 4. عنوان المنتجات التفاعلي */}
        <section className="relative z-10 px-4 mt-5 flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <VariableFontHoverByRandomLetter
                label="جاهز للاستلام اليوم"
                fromFontVariationSettings="'wght' 600"
                toFontVariationSettings="'wght' 800"
              />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            </h2>
            <p className="text-[11px] text-neutral-500">توصيل فوري لكافة الأحياء</p>
          </div>
          <span className="text-xs text-neutral-400 font-medium">{PRODUCTS.length} منتجات</span>
        </section>

        {/* 5. شبكة كروت المنتجات الفاخرة (Product Grid) */}
        <section className="relative z-10 px-4 mt-3 grid grid-cols-2 gap-3.5">
          {PRODUCTS.map((product) => {
            const isFav = favorites[product.id];
            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-3xl p-2.5 border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* حاوية الصورة مع الشارات */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* شارة التمييز */}
                  {product.badge && (
                    <div className="absolute top-2 right-2 z-10">
                      <div
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md border flex items-center gap-1 shadow-sm ${product.badge.color}`}
                      >
                        <span>{product.badge.icon}</span>
                        <span>{product.badge.text}</span>
                      </div>
                    </div>
                  )}

                  {/* زر المفضلة (Heart Action) */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md border border-white/60 flex items-center justify-center text-xs shadow-sm hover:scale-110 active:scale-90 transition-all"
                  >
                    {isFav ? "💖" : "🤍"}
                  </button>
                </div>

                {/* تفاصيل المنتج وأزرار الشراء */}
                <div className="mt-2.5 flex flex-col flex-1 justify-between">
                  <h3 className="text-xs font-bold text-neutral-800 leading-snug line-clamp-2 min-h-[32px]">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-50">
                    {/* السعر والخصم */}
                    <div>
                      <div className="text-sm font-extrabold text-[#123524]">
                        {product.price}{" "}
                        <span className="text-[10px] font-normal text-neutral-500">ر.س</span>
                      </div>
                      {product.originalPrice && (
                        <div className="text-[10px] text-neutral-400 line-through">
                          {product.originalPrice} ر.س
                        </div>
                      )}
                    </div>

                    {/* زر الإضافة للسلة التفاعلي مع تأثير التحول */}
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleAddToCart(product.id)}
                      className="w-8 h-8 rounded-full bg-[#123524] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-[#123524]/20 hover:bg-[#1a4a33] transition-colors relative"
                    >
                      {flyingToCart === product.id ? "✓" : "+"}
                    </motion.button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* 6. بنر الطلب المخصص السفلي */}
        <section className="relative z-10 mx-4 mt-6 p-4 rounded-3xl bg-gradient-to-br from-[#7E1529] to-[#540D1B] text-white shadow-xl shadow-rose-950/20">
          <h3 className="text-sm font-bold">طلب مخصص</h3>
          <p className="text-[11px] text-rose-200 mt-1">ننسق باقتك الفاخرة بإتقان حسب ميزانيتك وذوقك.</p>
          <button className="mt-3 px-4 py-2 rounded-full bg-white text-[#7E1529] text-xs font-bold shadow-sm hover:bg-rose-50 transition-colors">
            تنسيق مخصص ←
          </button>
        </section>

        {/* شريط السلة العائم السفلي عند إضافة المنتجات */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-4 inset-x-0 max-w-sm mx-auto px-4 z-50 pointer-events-auto"
            >
              <div className="w-full py-3 px-4 rounded-2xl bg-[#123524] text-white flex items-center justify-between shadow-2xl shadow-emerald-950/40 border border-emerald-700/30">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-900 text-xs font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                  <span className="text-xs font-medium">سلة المشتريات جاهزة</span>
                </div>
                <button
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="text-xs font-bold text-emerald-300 hover:text-white transition-colors cursor-pointer active:scale-95 px-2 py-1 rounded-lg"
                >
                  إتمام الطلب وطباعة الفاتورة ←
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* مودال الفاتورة التفاعلي مع طابعة الإيصالات الحرارية ReceiptPrinter */}
        <FloristOrderSlipModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
        />

      </main>
    </div>
  );
}
