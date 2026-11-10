import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  THEME_TOKENS,
  PRODUCTS,
  PORTFOLIO_ITEMS,
  INITIAL_SHOP_CONFIG,
  INITIAL_FORMATS,
  INITIAL_OCCASIONS,
} from './data/mockData';
import { generateWhatsAppMessage } from './utils/translations';
import { applyThemeToRoot } from './utils/themeEngine';
import ThemeSwitcherBar from './components/ThemeSwitcherBar';
import ShopHeader from './components/ShopHeader';
import OccasionStories from './components/OccasionStories';
import CoolerSpecialsCarousel from './components/CoolerSpecialsCarousel';
import CustomOrderBanner from './components/CustomOrderBanner';
import StickyFilterBar from './components/StickyFilterBar';
import ProductCard from './components/ProductCard';
const ProductConfiguratorDrawer = React.lazy(() => import('./components/ProductConfiguratorDrawer'));
const CustomOrderDrawer = React.lazy(() => import('./components/CustomOrderDrawer'));
const CartDrawer = React.lazy(() => import('./components/CartDrawer'));
const WhatsAppPreviewModal = React.lazy(() => import('./components/WhatsAppPreviewModal'));
const FloristAdminPanel = React.lazy(() => import('./components/FloristAdminPanel'));
const FloristOrderSlipModal = React.lazy(() => import('./components/FloristOrderSlipModal'));
const FlowerStorefrontPage = React.lazy(() => import('./components/FlowerStorefrontPage'));
const NoCodeLuxuryStudio = React.lazy(() => import('./components/NoCodeLuxuryStudio'));
import AdminAuthGuard from './components/AdminAuthGuard';
import AmbientRosePetals from './components/AmbientRosePetals';
import { verifyAndRecalculateOrder } from './services/priceVerificationService';
import { checkRateLimit, recordAttempt } from './services/rateLimiter';
import { sanitizeText } from './utils/sanitizer';
import {
  createOrderSlipFromSingleItem,
  createOrderSlipFromBag,
  createOrderSlipFromCustomOrder,
} from './utils/orderSlipHelper';
import { Sliders, Store, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';

class SafeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn('SafeErrorBoundary caught component error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default function App() {
  // Language & RTL State
  const [lang, setLang] = useState('ar');
  const isAr = lang === 'ar';

  // Live Design Customizer Studio Modal State
  const [isDesignStudioOpen, setIsDesignStudioOpen] = useState(false);

  // Multi-Tenant Shop Config & Theme State (Hydrated from localStorage)
  const [shopConfig, setShopConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('flowerhub_shop_config');
      return saved ? { ...INITIAL_SHOP_CONFIG, ...JSON.parse(saved) } : INITIAL_SHOP_CONFIG;
    } catch {
      return INITIAL_SHOP_CONFIG;
    }
  });
  const themeTokens = THEME_TOKENS[shopConfig.theme] || THEME_TOKENS.botanical;

  // Persist shopConfig to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flowerhub_shop_config', JSON.stringify(shopConfig));
    } catch (e) {
      console.error('Failed to save shop config to localStorage', e);
    }
  }, [shopConfig]);

  // Apply theme tokens (CSS variables) and dark mode class to root document & body
  useEffect(() => {
    if (themeTokens?.variables) {
      applyThemeToRoot(themeTokens.variables);
    }
    const isDark = Boolean(themeTokens?.isDark);
    document.documentElement.classList.toggle('dark', isDark);
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.backgroundColor = themeTokens.variables?.['--bg-canvas'] || (isDark ? '#0B0B0C' : '#FAF8F5');
    }
  }, [themeTokens]);

  // Products and Past Work Lifted State
  const [products, setProducts] = useState(PRODUCTS);
  const [pastWorks, setPastWorks] = useState(PORTFOLIO_ITEMS);

  // Dynamic Formats & Occasions Lifted State
  const [formats, setFormats] = useState(INITIAL_FORMATS);
  const [occasions, setOccasions] = useState(() => {
    try {
      const saved = localStorage.getItem('flowerhub_occasions');
      return saved ? JSON.parse(saved) : INITIAL_OCCASIONS;
    } catch {
      return INITIAL_OCCASIONS;
    }
  });

  // Persist occasions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flowerhub_occasions', JSON.stringify(occasions));
    } catch (e) {
      console.error('Failed to save occasions to localStorage', e);
    }
  }, [occasions]);

  // View Mode: 'storefront' | 'admin' | 'split' | 'orderslip'
  const [activeView, setActiveView] = useState('storefront');

  // Order Slip Modal State & Active Order Data (for dynamic invoice presentation)
  const [isOrderSlipModalOpen, setIsOrderSlipModalOpen] = useState(false);
  const [activeOrderSlipData, setActiveOrderSlipData] = useState(() => {
    try {
      const saved = localStorage.getItem('flowerhub_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleOpenOrderSlip = (orderData = null) => {
    if (orderData) {
      setActiveOrderSlipData(orderData);
    }
    setIsOrderSlipModalOpen(true);
  };

  // Filter States - Occasion (Circle Stories) & Format/Budget (StickyFilterBar)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawers & Modals States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Bag / Cart
  const [bagItems, setBagItems] = useState([]);

  // WhatsApp Preview Modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppTicketText, setWhatsAppTicketText] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  // Sync document direction & language
  useEffect(() => {
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang, isAr]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.8 },
      });
    } catch {
      // safe fallback
    }
  };

  // Add Dynamic Format handler
  const handleAddFormat = (nameAr, nameEn) => {
    const newFormat = {
      id: `fmt-${Date.now()}`,
      nameAr: nameAr.trim(),
      nameEn: nameEn?.trim() || nameAr.trim(),
    };
    setFormats((prev) => [...prev, newFormat]);
    showToast(isAr ? 'تمت إضافة التصنيف الجديد للمتجر' : 'New format added to store');
    return newFormat.id;
  };

  // Add Dynamic Occasion handler
  const handleAddOccasion = (nameAr, nameEn) => {
    const newOcc = {
      id: `occ-${Date.now()}`,
      nameAr: nameAr.trim(),
      nameEn: nameEn?.trim() || nameAr.trim(),
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80',
      isStory: true,
      isVisible: true,
    };
    setOccasions((prev) => [...prev, newOcc]);
    showToast(isAr ? 'تمت إضافة المناسبة الجديدة للمتجر' : 'New occasion added to store');
    return newOcc.id;
  };

  // Toggle Occasion Visibility handler
  const handleToggleOccasionVisibility = (occId) => {
    setOccasions((prev) =>
      prev.map((occ) => (occ.id === occId ? { ...occ, isVisible: occ.isVisible === false ? true : false } : occ))
    );
  };

  // Delete Occasion Story handler
  const handleDeleteOccasion = (occId) => {
    setOccasions((prev) => prev.filter((occ) => occ.id !== occId));
    showToast(isAr ? 'تم حذف القصة بنجاح' : 'Story deleted');
  };

  // Apply Curated Luxury Design Preset Template
  const handleApplyCuratedTemplate = (tmplConfig) => {
    setShopConfig((prev) => ({
      ...prev,
      theme: tmplConfig.presetId,
      heroStyle: tmplConfig.layout?.heroStyle || prev.heroStyle,
      specialsStyle: tmplConfig.layout?.specialsStyle || prev.specialsStyle,
    }));
    if (tmplConfig.overrides) {
      applyThemeToRoot(tmplConfig.overrides);
    }
    showToast(isAr ? '✨ تم تطبيق وحفظ القالب الفاخر فورياً على المتجر!' : 'Luxury template applied and saved!');
  };

  // Filter products based on Occasion, Product Type & Budget
  const filteredProducts = products.filter((product) => {
    // Hide sold out products from standard customer catalog
    if (product.isSoldOut) return false;

    // 1. Occasion filter from Circular Stories
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'specials') {
        if (!product.isReadyNow && !product.isOneTimeSpecial) return false;
      } else if (product.category !== selectedCategory) {
        return false;
      }
    }

    // 2. Product Type filter from StickyFilterBar
    if (selectedType !== 'all') {
      if (product.productType !== selectedType) return false;
    }

    // 3. Budget filter from StickyFilterBar
    if (selectedBudget === 'under_150' && product.price >= 150) return false;
    if (selectedBudget === '150_250' && (product.price < 150 || product.price > 250)) return false;
    if (selectedBudget === 'over_250' && product.price <= 250) return false;

    // 4. Live Search Query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (product.titleAr && product.titleAr.toLowerCase().includes(q)) ||
                         (product.titleEn && product.titleEn.toLowerCase().includes(q));
      const matchDesc = (product.descAr && product.descAr.toLowerCase().includes(q)) ||
                        (product.descEn && product.descEn.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  // Action Handlers
  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setIsProductDrawerOpen(true);
  };

  const handleAddToBag = (configuredItem) => {
    setBagItems((prev) => [...prev, configuredItem]);
    showToast(isAr ? 'تمت إضافة الباقة لسلة الطلبات' : 'Arrangement added to bag');
  };

  const handleUpdateBagQuantity = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveBagItem(index);
      return;
    }
    setBagItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveBagItem = (index) => {
    setBagItems((prev) => prev.filter((_, i) => i !== index));
    showToast(isAr ? 'تم حذف المنتج من السلة' : 'Item removed');
  };

  // Direct 1-Tap WhatsApp Checkout from Product Drawer (Server-Side Price Recalculation + Rate Limiter)
  const handleDirectWhatsAppCheckout = (configuredItem) => {
    // 1. Rate Limiting Check (Anti-Spam / Anti-Flooding)
    const rateCheck = checkRateLimit('checkout_order');
    if (!rateCheck.allowed) {
      alert(rateCheck.error);
      return;
    }

    // 2. Server-side price recalculation & anti-tampering verification
    const verified = verifyAndRecalculateOrder([configuredItem]);
    if (!verified.isValid || verified.verifiedItems.length === 0) {
      alert(isAr ? 'عذراً، تعذر التحقق من بيانات وتكلفة الباقة المطلوبة.' : 'Unable to verify requested arrangement pricing.');
      return;
    }

    // 3. Input Sanitization
    const baseVerified = verified.verifiedItems[0];
    const sanitizedItem = {
      ...baseVerified,
      giftCardMessage: configuredItem.giftCardMessage ? sanitizeText(configuredItem.giftCardMessage) : '',
      handover: configuredItem.handover ? {
        ...configuredItem.handover,
        recipientName: configuredItem.handover.recipientName ? sanitizeText(configuredItem.handover.recipientName) : '',
        recipientPhone: configuredItem.handover.recipientPhone ? sanitizeText(configuredItem.handover.recipientPhone) : '',
        deliveryAddress: configuredItem.handover.deliveryAddress ? sanitizeText(configuredItem.handover.deliveryAddress) : '',
        deliveryDistrict: configuredItem.handover.deliveryDistrict ? sanitizeText(configuredItem.handover.deliveryDistrict) : '',
      } : configuredItem.handover,
    };

    const slipData = createOrderSlipFromSingleItem(sanitizedItem, lang);
    setActiveOrderSlipData(slipData);
    try {
      localStorage.setItem('flowerhub_last_order', JSON.stringify(slipData));
    } catch (e) {
      console.warn('Could not cache last order', e);
    }

    setIsProductDrawerOpen(false);
    recordAttempt('checkout_order');
    const text = generateWhatsAppMessage({
      lang,
      items: [sanitizedItem],
      handover: sanitizedItem.handover,
      trustPhoto: configuredItem.trustPhoto,
      orderId: slipData.orderId,
    });
    setWhatsAppTicketText(text);
    fireConfetti();
    setIsWhatsAppModalOpen(true);
  };

  // Checkout Entire Bag (Server-Side Price Recalculation + Rate Limiter)
  const handleBagCheckout = () => {
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit('checkout_order');
    if (!rateCheck.allowed) {
      alert(rateCheck.error);
      return;
    }

    if (!bagItems || bagItems.length === 0) {
      alert(isAr ? 'سلة الطلبات فارغة.' : 'Your cart is empty.');
      return;
    }

    // 2. Server-side price recalculation & anti-tampering verification
    const verified = verifyAndRecalculateOrder(bagItems);
    if (!verified.isValid || verified.verifiedItems.length === 0) {
      alert(isAr ? 'تعذر التحقق من أسعار المنتجات في السلة.' : 'Unable to verify prices in cart.');
      return;
    }

    // 3. Input Sanitization
    const sanitizedItems = verified.verifiedItems.map((item, idx) => {
      const orig = bagItems[idx] || {};
      return {
        ...item,
        giftCardMessage: orig.giftCardMessage ? sanitizeText(orig.giftCardMessage) : '',
        handover: orig.handover ? {
          ...orig.handover,
          recipientName: orig.handover.recipientName ? sanitizeText(orig.handover.recipientName) : '',
          recipientPhone: orig.handover.recipientPhone ? sanitizeText(orig.handover.recipientPhone) : '',
          deliveryAddress: orig.handover.deliveryAddress ? sanitizeText(orig.handover.deliveryAddress) : '',
          deliveryDistrict: orig.handover.deliveryDistrict ? sanitizeText(orig.handover.deliveryDistrict) : '',
        } : orig.handover,
      };
    });

    const handover = sanitizedItems[0]?.handover || { type: 'gift' };
    const slipData = createOrderSlipFromBag(sanitizedItems, handover, lang);
    setActiveOrderSlipData(slipData);
    try {
      localStorage.setItem('flowerhub_last_order', JSON.stringify(slipData));
    } catch (e) {
      console.warn('Could not cache last order', e);
    }

    setIsCartDrawerOpen(false);
    recordAttempt('checkout_order');
    const text = generateWhatsAppMessage({
      lang,
      items: sanitizedItems,
      handover,
      trustPhoto: true,
      orderId: slipData.orderId,
    });
    setWhatsAppTicketText(text);
    fireConfetti();
    setIsWhatsAppModalOpen(true);
  };

  // Custom Order Submission (Drawer B) (Sanitization + Rate Limiting)
  const handleCustomOrderSubmit = (customOrderData, handoverData) => {
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit('checkout_order');
    if (!rateCheck.allowed) {
      alert(rateCheck.error);
      return;
    }

    // 2. Sanitize user inputs to prevent XSS / Injection
    const sanitizedCustomOrder = {
      ...customOrderData,
      modeTitle: sanitizeText(customOrderData.modeTitle || ''),
      colorVibe: sanitizeText(customOrderData.colorVibe || ''),
      budget: sanitizeText(customOrderData.budget || ''),
      notes: customOrderData.notes ? sanitizeText(customOrderData.notes) : '',
    };

    const sanitizedHandover = handoverData ? {
      ...handoverData,
      recipientName: handoverData.recipientName ? sanitizeText(handoverData.recipientName) : '',
      recipientPhone: handoverData.recipientPhone ? sanitizeText(handoverData.recipientPhone) : '',
      deliveryAddress: handoverData.deliveryAddress ? sanitizeText(handoverData.deliveryAddress) : '',
      deliveryDistrict: handoverData.deliveryDistrict ? sanitizeText(handoverData.deliveryDistrict) : '',
      giftCardMessage: handoverData.giftCardMessage ? sanitizeText(handoverData.giftCardMessage) : '',
    } : handoverData;

    const slipData = createOrderSlipFromCustomOrder(sanitizedCustomOrder, sanitizedHandover, lang);
    setActiveOrderSlipData(slipData);
    try {
      localStorage.setItem('flowerhub_last_order', JSON.stringify(slipData));
    } catch (e) {
      console.warn('Could not cache last order', e);
    }

    setIsCustomDrawerOpen(false);
    recordAttempt('checkout_order');
    const text = generateWhatsAppMessage({
      lang,
      customOrder: sanitizedCustomOrder,
      handover: sanitizedHandover,
      trustPhoto: true,
      orderId: slipData.orderId,
    });
    setWhatsAppTicketText(text);
    fireConfetti();
    setIsWhatsAppModalOpen(true);
  };

  // Portfolio "Request Similar on WhatsApp"
  const handlePortfolioRequest = (portfolioItem) => {
    const isArabic = lang === 'ar';
    const text = isArabic
      ? `*طلب استفسار وتصميم مشابه • ${shopConfig.shopNameAr}*
كود التصميم: #${portfolioItem.id.toUpperCase()}
العمل المرجعي: ${portfolioItem.titleAr}
المناسبة: ${portfolioItem.venueAr}

أهلاً وسهلاً فريق ${shopConfig.shopNameAr}، شاهدت هذا العمل في معرض أعمالكم وأرغب في تنفيذ تصميم مشابه لمناسبتي القادمة. فضلاً تزويدي بالتفاصيل المتاحة وإمكانية التنسيق والتكلفة التقريبية.`
      : `*Inquiry for Portfolio Design Replication • ${shopConfig.shopNameEn}*
Design Code: #${portfolioItem.id.toUpperCase()}
Reference Project: ${portfolioItem.titleEn}
Venue: ${portfolioItem.venueEn}

Hello ${shopConfig.shopNameEn} team! I saw this arrangement in your portfolio and would like to request a similar bespoke setup for my upcoming event. Please advise on availability and estimated pricing.`;

    setWhatsAppTicketText(text);
    setIsWhatsAppModalOpen(true);
  };

  // Admin Actions
  const handleUpdateProduct = (productId, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    showToast(isAr ? 'تم تحديث بيانات المنتج مباشرة' : 'Product updated live');
  };

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    fireConfetti();
    showToast(isAr ? 'تم نشر الباقة بنجاح في المتجر' : 'Bouquet published live');
  };

  const handleMoveToPastWork = (product) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, isSoldOut: true, isReadyNow: false, isOneTimeSpecial: false }
          : p
      )
    );

    const newPortfolioItem = {
      id: `port-${Date.now()}`,
      category: 'past_work',
      titleAr: product.titleAr,
      titleEn: product.titleEn,
      descAr: product.descAr,
      descEn: product.descEn,
      image: product.image,
      tagAr: isAr ? 'قطعة أرشيفية مميزة' : 'Curated Archive Piece',
      tagEn: 'Archive Piece',
      venueAr: isAr ? 'معرض أعمال دار الورد، الرياض' : 'Maison des Fleurs Atelier, Riyadh',
      venueEn: 'Maison des Fleurs Atelier, Riyadh',
    };

    setPastWorks((prev) => [newPortfolioItem, ...prev]);
    showToast(isAr ? 'تمت أرشفة الباقة لمعرض الأعمال' : 'Arrangement archived to Past Work');
  };

  // Reusable Storefront Content Renderer (Fully Reactive to themeTokens)
  const renderStorefrontContent = () => (
    <div
      className={`w-full flex flex-col pb-28 relative ${themeTokens.pageBg} transition-colors duration-300`}
    >
      {/* Shop Header */}
      <ShopHeader
        heroStyle={shopConfig.heroStyle}
        lang={lang}
        setLang={setLang}
        onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
        shopConfig={shopConfig}
        onUpdateShopConfig={setShopConfig}
        themeTokens={themeTokens}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        bagCount={bagItems.reduce((s, it) => s + (it.quantity || 1), 0)}
        onOpenBag={() => setIsCartDrawerOpen(true)}
      />

      {/* Floward-Style Circular Occasion Stories */}
      {shopConfig.showStories !== false && (
        <OccasionStories
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
          lang={lang}
          occasions={occasions}
          themeTokens={themeTokens}
        />
      )}

      {/* Ready in Cooler & Daily Specials Carousel with 4 switchable motion styles */}
      {selectedCategory !== 'past_work' && shopConfig.showSpecials !== false && (
        <CoolerSpecialsCarousel
          onSelectProduct={handleOpenProduct}
          lang={lang}
          themeTokens={themeTokens}
          specialsStyle={shopConfig.specialsStyle}
          products={products}
        />
      )}

      {/* 1-Step Custom Order Banner */}
      {shopConfig.showCustomBanner !== false && (
        <CustomOrderBanner
          onOpenCustomDrawer={() => setIsCustomDrawerOpen(true)}
          lang={lang}
          themeTokens={themeTokens}
        />
      )}

      {/* Sticky Filter Bar */}
      <StickyFilterBar
        selectedType={selectedType}
        onSelectType={setSelectedType}
        selectedBudget={selectedBudget}
        onSelectBudget={setSelectedBudget}
        itemsCount={
          selectedCategory === 'past_work'
            ? pastWorks.length
            : filteredProducts.length
        }
        lang={lang}
        formats={formats}
        themeTokens={themeTokens}
      />

      {/* Main Product Grid */}
      <main className="px-4 py-3 flex-1">
        {selectedCategory === 'past_work' ? (
          <div className="space-y-3">
            <div>
              <h3
                className={`font-bold text-sm sm:text-base ${themeTokens.textMain}`}
              >
                {isAr ? 'معرض الأعمال' : 'Past Works'}
              </h3>
              <p className={`text-xs mt-0.5 ${themeTokens.textMuted}`}>
                {isAr
                  ? 'تنسيقات خاصة، متوفر طلب تصميم مماثل'
                  : 'Bespoke setups. Request a similar quote'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {pastWorks.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  isPortfolio={true}
                  onRequestPortfolio={handlePortfolioRequest}
                  lang={lang}
                  themeTokens={themeTokens}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-2.5 sm:gap-3 ${
              shopConfig.gridLayout === '1col'
                ? 'grid-cols-1 max-w-md mx-auto'
                : 'grid-cols-2'
            }`}
          >
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                isPortfolio={false}
                onSelectProduct={handleOpenProduct}
                onAddToCart={handleAddToBag}
                lang={lang}
                themeTokens={themeTokens}
              />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && selectedCategory !== 'past_work' && (
          <div
            className={`py-16 text-center rounded-2xl border p-6 my-4 ${themeTokens.cardBg}`}
          >
            <p className={`text-sm font-medium ${themeTokens.textMuted}`}>
              {isAr
                ? 'لا توجد منتجات مطابقة لهذا التحديد حالياً.'
                : 'No products match this filter combination.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('all');
                setSelectedBudget('all');
              }}
              className={`mt-3 px-4 py-1.5 rounded-full text-xs font-semibold ${themeTokens.primary} shadow-xs active:scale-95 transition-transform`}
            >
              {isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}
            </button>
          </div>
        )}

        {/* Clean Editorial Footer */}
        <footer className="mt-12 pt-6 pb-12 text-center space-y-2.5">
          <div
            className={`font-serif font-bold text-sm tracking-wide ${themeTokens.textMain}`}
          >
            {isAr ? shopConfig.shopNameAr : shopConfig.shopNameEn}
          </div>

          <p className={`text-xs max-w-xs mx-auto ${themeTokens.textMuted}`}>
            {isAr ? shopConfig.taglineAr : shopConfig.taglineEn}
          </p>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md font-medium ${themeTokens.badge} ${themeTokens.textMain}`}
            >
              Apple Pay
            </span>
            <span
              className={`px-2 py-0.5 rounded-md font-medium ${themeTokens.badge} ${themeTokens.textMain}`}
            >
              Mada
            </span>
            <span
              className={`px-2 py-0.5 rounded-md font-medium ${themeTokens.badge} ${themeTokens.textMain}`}
            >
              Visa / Master
            </span>
          </div>

          <div className={`text-[10px] pt-1 ${themeTokens.textMuted}`}>
            {isAr
              ? 'سجل تجاري رقم: ١٠١٠٨٩٢٠٠ • المركز السعودي للأعمال'
              : 'Commercial Registration: 1010849200'}
          </div>

          {/* Discreet Coordinator Entrance Link */}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>{isAr ? 'لوحة تحكم المنسق' : 'Florist Admin'}</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Floating Bottom Cart Bar when bag has items (Safe-Area Bottom) */}
      {bagItems.length > 0 && !isProductDrawerOpen && !isCartDrawerOpen && !isCustomDrawerOpen && (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-slide-up">
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="pointer-events-auto max-w-[390px] w-full py-3 px-4 rounded-full bg-stone-950 text-white shadow-[0_12px_40px_-6px_rgba(0,0,0,0.45)] flex items-center justify-between border border-amber-400/40 backdrop-blur-xl active:scale-[0.98] transition-all hover:opacity-95 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span className="absolute -top-1.5 -right-2 bg-amber-400 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-stone-950">
                  {bagItems.reduce((s, it) => s + (it.quantity || 1), 0)}
                </span>
              </div>
              <span className="text-xs font-bold">
                {isAr ? 'سلة الطلبات' : 'Shopping Cart'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono text-amber-200">
                {bagItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)} {isAr ? 'ر.س' : 'SAR'}
              </span>
              <span className="text-[11px] bg-amber-400 text-stone-950 px-3 py-1 rounded-full font-black shadow-sm">
                {isAr ? 'إتمام الطلب ←' : 'Checkout →'}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('flowerhub_florist_session');
    } catch {}
    setActiveView('storefront');
    showToast(isAr ? 'تم تسجيل الخروج بنجاح من جلسة المنسق' : 'Logged out from florist session');
  };

  return (
    <div
      className={`min-h-screen bg-[#F6F5F2] dark:bg-[#0A0A0B] flex flex-col justify-start items-center selection:bg-stone-900 selection:text-white transition-colors duration-300 w-full overflow-x-hidden`}
    >
      {/* 1. Executive Management Bar (Desktop Only) */}
      <ThemeSwitcherBar
        activeView={activeView}
        setActiveView={setActiveView}
        lang={lang}
        setLang={setLang}
        onLogout={handleAdminLogout}
      />

      {/* 2. Main View Canvas */}
      {/* VIEW A: Storefront (Dedicated Mobile Phone Architecture) */}
      {activeView === 'storefront' && (
        <div className="w-full flex justify-center py-0 sm:py-6 sm:px-4 relative">
          <AmbientRosePetals />
          <div
            className={`w-full sm:max-w-[460px] min-h-screen ${themeTokens.pageBg} sm:rounded-[36px] sm:shadow-[0_25px_70px_rgba(0,0,0,0.18)] sm:border sm:border-stone-200/90 dark:sm:border-stone-800 flex flex-col relative transition-colors duration-300 overflow-hidden`}
          >
            <AmbientRosePetals isAbsolute containerClassName="z-20" />
            {renderStorefrontContent()}
          </div>
        </div>
      )}

      {/* VIEW LUXURY: FlowerStorefrontPage (Standalone Luxury Showcase) */}
      {activeView === 'luxury_showcase' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <div className="w-full flex justify-center min-h-screen">
            <FlowerStorefrontPage />
          </div>
        </React.Suspense>
      )}

      {/* VIEW B: Florist Admin Panel (RBAC Protected) */}
      {activeView === 'admin' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <AdminAuthGuard lang={lang} onClose={() => setActiveView('storefront')}>
            <div className="w-full max-w-6xl bg-[#FAF9F6] min-h-screen shadow-2xl flex flex-col relative mx-auto transition-all">
              <FloristAdminPanel
                shopConfig={shopConfig}
                onUpdateShopConfig={setShopConfig}
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onAddProduct={handleAddProduct}
                onMoveToPastWork={handleMoveToPastWork}
                pastWorks={pastWorks}
                lang={lang}
                onOpenOrderSlip={handleOpenOrderSlip}
                themeTokens={themeTokens}
                formats={formats}
                onAddFormat={handleAddFormat}
                occasions={occasions}
                onAddOccasion={handleAddOccasion}
                onToggleOccasionVisibility={handleToggleOccasionVisibility}
                onDeleteOccasion={handleDeleteOccasion}
                onApplyCuratedTemplate={handleApplyCuratedTemplate}
                onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
              />
            </div>
          </AdminAuthGuard>
        </React.Suspense>
      )}

      {/* VIEW SALES: Direct Coordinator Sales & Profits View (RBAC Protected) */}
      {activeView === 'sales' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <AdminAuthGuard lang={lang} onClose={() => setActiveView('storefront')}>
            <div className="w-full max-w-6xl bg-[#FAF9F6] min-h-screen shadow-2xl flex flex-col relative mx-auto transition-all">
              <FloristAdminPanel
                shopConfig={shopConfig}
                onUpdateShopConfig={setShopConfig}
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onAddProduct={handleAddProduct}
                onMoveToPastWork={handleMoveToPastWork}
                pastWorks={pastWorks}
                lang={lang}
                onOpenOrderSlip={handleOpenOrderSlip}
                themeTokens={themeTokens}
                formats={formats}
                onAddFormat={handleAddFormat}
                occasions={occasions}
                onAddOccasion={handleAddOccasion}
                onToggleOccasionVisibility={handleToggleOccasionVisibility}
                onDeleteOccasion={handleDeleteOccasion}
                onApplyCuratedTemplate={handleApplyCuratedTemplate}
                onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
                initialTab="sales"
              />
            </div>
          </AdminAuthGuard>
        </React.Suspense>
      )}

      {/* VIEW C: Split Studio (Side-by-side Live Florist Admin + Live Customer Storefront) (RBAC Protected) */}
      {activeView === 'split' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <AdminAuthGuard lang={lang} onClose={() => setActiveView('storefront')}>
            <div className="w-full max-w-6xl mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Florist Management Workspace */}
              <div className="w-full bg-[#FAF9F6] rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
                <div className="bg-stone-900 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between border-b border-stone-800">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'لوحة تحكم المنسق المباشرة' : 'Florist Studio Workspace'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    Live Sync Active
                  </span>
                </div>

                <FloristAdminPanel
                  shopConfig={shopConfig}
                  onUpdateShopConfig={setShopConfig}
                  products={products}
                  onUpdateProduct={handleUpdateProduct}
                  onAddProduct={handleAddProduct}
                  onMoveToPastWork={handleMoveToPastWork}
                  pastWorks={pastWorks}
                  lang={lang}
                  onOpenOrderSlip={handleOpenOrderSlip}
                  themeTokens={themeTokens}
                  formats={formats}
                  onAddFormat={handleAddFormat}
                  occasions={occasions}
                  onAddOccasion={handleAddOccasion}
                  onToggleOccasionVisibility={handleToggleOccasionVisibility}
                  onDeleteOccasion={handleDeleteOccasion}
                  onApplyCuratedTemplate={handleApplyCuratedTemplate}
                  onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
                />
              </div>

              {/* Right Column: Mobile Device Frame with Live Storefront */}
              <div className="w-full flex flex-col items-center lg:sticky lg:top-14">
                <div className="w-full max-w-[430px] flex items-center justify-between mb-2 px-2 text-xs font-bold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAr ? 'معاينة متجر العميل الحي' : 'Live Customer Preview'}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                    {isAr ? 'محدث لحظياً' : 'Instant Sync'}
                  </span>
                </div>

                <div
                  className={`w-full max-w-[430px] ${themeTokens.pageBg} rounded-[2.5rem] border-[5px] border-stone-800 shadow-2xl overflow-hidden relative transition-colors duration-300`}
                >
                  {/* Smartphone Top Speaker Pill */}
                  <div className="h-4 bg-stone-800 w-full flex items-center justify-center">
                    <div className="w-12 h-1 bg-stone-700 rounded-full" />
                  </div>

                  {/* Scrollable Storefront Frame */}
                  <div className="max-h-[80vh] overflow-y-auto no-scrollbar">
                    {renderStorefrontContent()}
                  </div>
                </div>
              </div>
            </div>
          </AdminAuthGuard>
        </React.Suspense>
      )}

      {/* VIEW D: Order Slip (/o/8492) Full Dedicated View */}
      {activeView === 'orderslip' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center">
            <div className="w-full max-w-[560px] flex items-center justify-between mb-3 text-xs">
              <button
                onClick={() => setActiveView('storefront')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-stone-800 border border-stone-200 hover:bg-stone-100 font-medium transition-all shadow-xs"
              >
                {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{isAr ? 'العودة للمتجر' : 'Back to Storefront'}</span>
              </button>
              <span className="font-mono text-stone-500 font-medium">
                flowerhub.sa/o/8492
              </span>
            </div>

            <FloristOrderSlipModal
              isOpen={true}
              isModal={false}
              lang={lang}
              shopConfig={shopConfig}
              orderData={activeOrderSlipData}
            />
          </div>
        </React.Suspense>
      )}

      {/* Slide-Up Drawer A: Product & Configurator */}
      <React.Suspense fallback={null}>
        <ProductConfiguratorDrawer
          product={selectedProduct}
          isOpen={isProductDrawerOpen}
          onClose={() => setIsProductDrawerOpen(false)}
          onAddToBag={handleAddToBag}
          onDirectWhatsAppCheckout={handleDirectWhatsAppCheckout}
          lang={lang}
          theme={themeTokens}
        />
      </React.Suspense>

      {/* Slide-Up Drawer B: Custom Order & Gift Wrapping */}
      <React.Suspense fallback={null}>
        <CustomOrderDrawer
          isOpen={isCustomDrawerOpen}
          onClose={() => setIsCustomDrawerOpen(false)}
          onSubmitCustomOrder={handleCustomOrderSubmit}
          lang={lang}
          theme={themeTokens}
        />
      </React.Suspense>

      {/* Floating Cart Drawer */}
      <React.Suspense fallback={null}>
        <CartDrawer
          items={bagItems}
          isOpen={isCartDrawerOpen}
          onOpen={() => setIsCartDrawerOpen(true)}
          onClose={() => setIsCartDrawerOpen(false)}
          onUpdateQuantity={handleUpdateBagQuantity}
          onRemoveItem={handleRemoveBagItem}
          onCheckout={handleBagCheckout}
          lang={lang}
          theme={themeTokens}
        />
      </React.Suspense>

      {/* WhatsApp Message Preview Modal with Order Slip button */}
      <React.Suspense fallback={null}>
        <WhatsAppPreviewModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          messageText={whatsAppTicketText}
          lang={lang}
          onOpenOrderSlip={handleOpenOrderSlip}
          orderData={activeOrderSlipData}
        />
      </React.Suspense>

      {/* Florist Order Slip Modal (Overlay mode) */}
      <React.Suspense fallback={null}>
        <FloristOrderSlipModal
          isOpen={isOrderSlipModalOpen}
          onClose={() => setIsOrderSlipModalOpen(false)}
          isModal={true}
          lang={lang}
          shopConfig={shopConfig}
          orderData={activeOrderSlipData}
        />
      </React.Suspense>

      {/* Live No-Code Luxury Design Studio Drawer */}
      <SafeErrorBoundary fallback={null}>
        <React.Suspense fallback={null}>
          <NoCodeLuxuryStudio
            isOpen={isDesignStudioOpen}
            onClose={() => setIsDesignStudioOpen(false)}
          />
        </React.Suspense>
      </SafeErrorBoundary>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 inset-x-0 z-50 flex justify-center pointer-events-none px-4 animate-fade-in">
          <div className="bg-stone-900 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-medium border border-stone-800">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
