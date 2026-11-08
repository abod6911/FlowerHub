"use client";

import React, { useState, useRef, useMemo, ElementType } from "react";
import FloristOrderSlipModal from "./FloristOrderSlipModal";
import { createOrderSlipFromSingleItem } from "../utils/orderSlipHelper";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  type Transition,
  type Variants,
  AnimatePresence,
} from "framer-motion";
import {
  EASINGS,
  TIMINGS,
  tactileButtonProps,
  successPulseVariants,
  listContainerVariants,
  listItemVariants,
  secondaryDetailVariants,
  overlappingStatePresenceProps,
} from "@/lib/motion-variants";
import {
  TactileButton,
  SquashStretchSwitch,
  ClipPathSegmentedTabs,
  AnchoredDropdown,
  MorphingIconButton,
  ArcedFlyingBadge,
  RubberBandDrawer,
} from "./motion/MotionComponents";

// ==========================================
// 1. المكونات التفاعلية المدمجة (Fancy & Motion Physics Components)
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

// --- ب. مكون النص المتنفس (Breathing Text) ---
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
  category: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "فازة أحلام الباستيل هيدرنجيا وورود",
    price: 320,
    originalPrice: 360,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
    badge: { text: "جاهز الآن", color: "bg-amber-500/15 text-amber-900 border-amber-200/60", icon: "🕒" },
    category: "vases",
  },
  {
    id: "p2",
    name: "بوكيه كولكشن الروز المخملي الفاخر",
    price: 245,
    originalPrice: 295,
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
    badge: { text: "قطعة واحدة فقط", color: "bg-rose-500/15 text-rose-900 border-rose-200/60", icon: "✨" },
    category: "bouquets",
  },
  {
    id: "p3",
    name: "بوكس الأكريليك الفاخر مع الورد الطبيعي",
    price: 275,
    originalPrice: 310,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    badge: { text: "قابل للتخصيص", color: "bg-emerald-500/15 text-emerald-900 border-emerald-200/60", icon: "✏️" },
    category: "boxes",
  },
  {
    id: "p4",
    name: "تنسيق قبة العشق الأبدية الملكية",
    price: 450,
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80",
    badge: { text: "فاخر وحصري", color: "bg-purple-500/15 text-purple-900 border-purple-200/60", icon: "👑" },
    category: "vases",
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "جميع التنسيقات", icon: "🌸" },
  { id: "bouquets", label: "باقات يد", icon: "💐" },
  { id: "vases", label: "فازات زجاجية", icon: "🏺" },
  { id: "boxes", label: "صواني وبوكسات", icon: "🎁" },
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ p1: true });
  const [cartCount, setCartCount] = useState(1);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false);
  const [isExpressDelivery, setIsExpressDelivery] = useState(true);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);

  // Flight Path State (Rule 7: Arced Motion Paths 32px arc offset)
  const [flightState, setFlightState] = useState<{
    isFlying: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }>({
    isFlying: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const cartButtonRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCartWithArc = (product: Product, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const cartRect = cartButtonRef.current?.getBoundingClientRect();

    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth / 2;
    const endY = cartRect ? cartRect.top + cartRect.height / 2 : window.innerHeight - 50;

    // Trigger Rule 7 Arced flight
    setFlightState({
      isFlying: true,
      startX,
      startY,
      endX,
      endY,
    });

    setAddedItemName(product.name);
    setLastAddedProduct(product);
    setTimeout(() => {
      setFlightState((prev) => ({ ...prev, isFlying: false }));
      setCartCount((prev) => prev + 1);
    }, 650);

    setTimeout(() => setAddedItemName(null), 2500);
  };

  // Filter products based on active tab
  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans pb-28 selection:bg-rose-100 selection:text-rose-900 w-full relative">
      
      {/* Rule 7: Arced Flying Item (32px Curved Arc Trajectory) */}
      <ArcedFlyingBadge
        isFlying={flightState.isFlying}
        startX={flightState.startX}
        startY={flightState.startY}
        endX={flightState.endX}
        endY={flightState.endY}
        content="🌸"
      />

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

            {/* Rule 2, 10, 11, 12, 15: Anchored Luxury Dropdown Menu */}
            <AnchoredDropdown
              origin="top left"
              trigger={
                <motion.div
                  {...tactileButtonProps} // Rule 4: tactile press scale: 0.97
                  className="w-11 h-11 rounded-2xl bg-[#7E1529] text-amber-200 flex items-center justify-center font-serif text-xl font-bold shadow-md shadow-rose-950/20 border border-amber-400/20 cursor-pointer"
                >
                  M
                </motion.div>
              }
              items={[
                { id: "opt-1", label: "توصيل فوري خلال 30 دقيقة", icon: "⚡", badge: "متاح" },
                { id: "opt-2", label: "طلب تنسيق باقة خاصة", icon: "🎨", onClick: () => setIsCustomDrawerOpen(true) },
                { id: "opt-3", label: "عرض إيصال الطلب والفاتورة", icon: "📄", onClick: () => setIsReceiptModalOpen(true) },
              ]}
            />
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
            <p className="text-xs text-neutral-500 mt-1">أزهار طبيعية فاخرة وتنسيقات الهدايا بالرياض</p>
            <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-neutral-400">
              <span>⭐ 4.9 (420+ تقييم)</span>
              <span>•</span>
              <span>📍 التوصيل لكافة الأحياء</span>
            </div>
          </div>

          {/* Rule 5: Squash & Stretch Toggle Switch (12% horizontal knob stretch) */}
          <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
              <span>⚡ التجهيز السريع الفوري:</span>
              <span className={`text-[10px] font-bold ${isExpressDelivery ? 'text-emerald-700' : 'text-stone-400'}`}>
                {isExpressDelivery ? 'مفعل (20 دقيقة)' : 'عادي'}
              </span>
            </span>

            {/* Rule 5 Component */}
            <SquashStretchSwitch
              checked={isExpressDelivery}
              onChange={setIsExpressDelivery}
            />
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
                <motion.button
                  {...tactileButtonProps} // Rule 4: tactile button press scale: 0.97
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
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
                </motion.button>
              </Float>
            ))}
          </div>
        </section>

        {/* 3. Rule 17 & 20: Clip-Path & Mask Reveal Segmented Tabs with layoutId */}
        <section className="relative z-10 px-4 mt-3">
          <div className="w-full overflow-x-auto no-scrollbar py-1">
            <ClipPathSegmentedTabs
              tabs={CATEGORY_TABS}
              activeId={selectedCategory}
              onChange={setSelectedCategory}
              className="w-full justify-between"
            />
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
            <p className="text-[11px] text-neutral-500">أزهار مبردة جاهزة للتوصيل الفوري</p>
          </div>
          <span className="text-xs text-neutral-400 font-medium">{filteredProducts.length} باقات</span>
        </section>

        {/* 5. Rule 3: List Staggering (30ms) & Rule 1: Entrance ease-out Product Grid */}
        <section className="relative z-10 px-4 mt-3">
          <motion.div
            variants={listContainerVariants} // Rule 3: staggerChildren: 0.03
            initial="initial"
            animate="animate"
            key={selectedCategory}
            className="grid grid-cols-2 gap-3.5"
          >
            {filteredProducts.map((product) => {
              const isFav = Boolean(favorites[product.id]);
              return (
                <motion.div
                  key={product.id}
                  variants={listItemVariants} // Rule 1: ease-out deceleration
                  whileHover={{ y: -3, transition: { duration: 0.2, ease: EASINGS.easeOut } }}
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

                    {/* Rule 6: Secondary Detail Stagger (50ms delay trail after card settles) */}
                    {product.badge && (
                      <motion.div
                        variants={secondaryDetailVariants}
                        className="absolute top-2 right-2 z-10"
                      >
                        <div
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border flex items-center gap-1 shadow-sm ${product.badge.color}`}
                        >
                          <span>{product.badge.icon}</span>
                          <span>{product.badge.text}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Rule 18 & 16: Morphing Icon Button (scale + opacity + filter: blur(4px)) */}
                    <div className="absolute top-2 left-2 z-10">
                      <MorphingIconButton
                        isActive={isFav}
                        onClick={() => toggleFavorite(product.id)}
                        activeIcon={<span className="text-xs">💖</span>}
                        inactiveIcon={<span className="text-xs">🤍</span>}
                        className="w-7 h-7 bg-white/85 backdrop-blur-md border border-white/60 shadow-xs"
                      />
                    </div>
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

                      {/* Rule 4: Tactile Button Press (scale: 0.97) + Rule 8: Success Confirmation Pulse */}
                      <TactileButton
                        variant="primary"
                        pulseOnSuccess={true}
                        onClick={(e) => handleAddToCartWithArc(product, e)}
                        className="w-8 h-8 !p-0 rounded-full text-xs font-bold"
                      >
                        +
                      </TactileButton>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* 6. بنر الطلب المخصص السفلي */}
        <section className="relative z-10 mx-4 mt-6 p-4 rounded-3xl bg-gradient-to-br from-[#7E1529] to-[#540D1B] text-white shadow-xl shadow-rose-950/20">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold">طلب تنسيق خاص ومخصص</h3>
              <p className="text-[11px] text-rose-200 mt-1">ننسق باقتك الفاخرة بإتقان تام حسب ميزانيتك وذوقك الخاص.</p>
            </div>
            <span className="text-2xl">🎨</span>
          </div>

          {/* Rule 4: Tactile Button */}
          <TactileButton
            variant="secondary"
            onClick={() => setIsCustomDrawerOpen(true)}
            className="mt-3 !py-2 !px-4 text-xs font-bold text-[#7E1529] hover:bg-rose-50"
          >
            بدء التنسيق المخصص ←
          </TactileButton>
        </section>

        {/* شريط السلة العائم السفلي (Rule 1: ease-out Entrance, Rule 15: -20% Exit) */}
        <AnimatePresence {...overlappingStatePresenceProps}>
          {cartCount > 0 && (
            <motion.div
              ref={cartButtonRef}
              initial={{ y: 80, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { duration: 0.25, ease: EASINGS.easeOut }, // Rule 1
              }}
              exit={{
                y: 80,
                opacity: 0,
                transition: { duration: 0.2, ease: EASINGS.easeIn }, // Rule 15: -20% exit
              }}
              className="fixed bottom-4 inset-x-0 max-w-sm mx-auto px-4 z-40 pointer-events-auto"
            >
              <div className="w-full py-3 px-4 rounded-2xl bg-[#123524] text-white flex items-center justify-between shadow-2xl shadow-emerald-950/40 border border-emerald-700/30">
                <div className="flex items-center gap-2.5">
                  {/* Rule 6: Secondary Detail Stagger Badge */}
                  <motion.span
                    key={cartCount}
                    variants={successPulseVariants} // Rule 8: Pulse on item addition
                    animate="pulse"
                    className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-900 text-xs font-bold flex items-center justify-center shadow-xs"
                  >
                    {cartCount}
                  </motion.span>
                  <div>
                    <span className="text-xs font-medium block">سلة المشتريات جاهزة</span>
                    {addedItemName && (
                      <span className="text-[10px] text-emerald-300 font-bold block truncate max-w-[140px] animate-fade-in">
                        + تم إضافة: {addedItemName}
                      </span>
                    )}
                  </div>
                </div>

                <TactileButton
                  variant="luxury"
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="text-xs font-bold !py-1.5 !px-3 rounded-xl"
                >
                  إتمام الطلب وطباعة الإيصال ←
                </TactileButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rule 19 & 14 & 13: Rubber-Band Custom Order Drawer with dragElastic={0.18} */}
        <RubberBandDrawer
          isOpen={isCustomDrawerOpen}
          onClose={() => setIsCustomDrawerOpen(false)}
          title="تنسيق باقة مخصصة حسب الذوق والميزانية"
        >
          <div className="space-y-4 text-xs text-stone-700">
            <p className="leading-relaxed">
              اختر تفضيلاتك الخاصة ليقوم أمهر منسقي الأزهار بتجهيز باقة فريدة تليق بمناسبتك مع إرسال صورة فوتوغرافية لاعتمادها قبل انطلاق المندوب.
            </p>

            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-amber-900 flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="font-semibold">يتم التحقق من تفاصيل الطلب وتأكيد السعر المعتمد قبل التوصيل.</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-900 block">الميزانية التقريبية المرغوبة:</label>
              <div className="grid grid-cols-3 gap-2">
                {["150 ر.س", "250 ر.س", "350+ ر.س"].map((budget, i) => (
                  <button
                    key={i}
                    className="py-2 px-3 rounded-xl border border-stone-200 bg-white hover:border-[#123524] text-center font-bold text-xs cursor-pointer active:scale-95 transition-all"
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>

            <TactileButton
              variant="primary"
              onClick={() => setIsCustomDrawerOpen(false)}
              className="w-full mt-2"
            >
              تأكيد خيارات التنسيق والمتابعة
            </TactileButton>
          </div>
        </RubberBandDrawer>

        {/* مودال الفاتورة التفاعلي مع طابعة الإيصالات الحرارية ReceiptPrinter */}
        <FloristOrderSlipModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          orderData={lastAddedProduct ? createOrderSlipFromSingleItem({
            id: lastAddedProduct.id,
            nameAr: lastAddedProduct.name,
            price: lastAddedProduct.price,
            stemCount: lastAddedProduct.stemCount,
            flowerType: lastAddedProduct.flowerType,
            image: lastAddedProduct.image,
            handover: {
              customerName: "عميل دار الورد",
              recipientName: "مستلم الباقة",
              type: "gift",
              deliveryDistrict: "الرياض",
            }
          }, "ar") : null}
        />

      </main>
    </div>
  );
}
