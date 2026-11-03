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
import ThemeSwitcherBar from './components/ThemeSwitcherBar';
import ShopHeader from './components/ShopHeader';
import OccasionStories from './components/OccasionStories';
import CoolerSpecialsCarousel from './components/CoolerSpecialsCarousel';
import CustomOrderBanner from './components/CustomOrderBanner';
import StickyFilterBar from './components/StickyFilterBar';
import ProductCard from './components/ProductCard';
import ProductConfiguratorDrawer from './components/ProductConfiguratorDrawer';
import CustomOrderDrawer from './components/CustomOrderDrawer';
import CartDrawer from './components/CartDrawer';
import WhatsAppPreviewModal from './components/WhatsAppPreviewModal';
import FloristAdminPanel from './components/FloristAdminPanel';
import FloristOrderSlipModal from './components/FloristOrderSlipModal';
import FlowerStorefrontPage from './components/FlowerStorefrontPage';
import { Sliders, Store, ArrowLeft, ArrowRight } from 'lucide-react';

export default function App() {
  // Language & RTL State
  const [lang, setLang] = useState('ar');
  const isAr = lang === 'ar';

  // Multi-Tenant Shop Config & Theme State (Lifted Shared State)
  const [shopConfig, setShopConfig] = useState(INITIAL_SHOP_CONFIG);
  const themeTokens = THEME_TOKENS[shopConfig.theme] || THEME_TOKENS.botanical;

  // Products and Past Work Lifted State
  const [products, setProducts] = useState(PRODUCTS);
  const [pastWorks, setPastWorks] = useState(PORTFOLIO_ITEMS);

  // Dynamic Formats & Occasions Lifted State
  const [formats, setFormats] = useState(INITIAL_FORMATS);
  const [occasions, setOccasions] = useState(INITIAL_OCCASIONS);

  // View Mode: 'storefront' | 'admin' | 'split' | 'orderslip'
  const [activeView, setActiveView] = useState('storefront');

  // Order Slip Modal State (for overlay access from WhatsApp or Admin)
  const [isOrderSlipModalOpen, setIsOrderSlipModalOpen] = useState(false);

  // Filter States - Occasion (Circle Stories) & Format/Budget (StickyFilterBar)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');

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
    };
    setOccasions((prev) => [...prev, newOcc]);
    showToast(isAr ? 'تمت إضافة المناسبة الجديدة للمتجر' : 'New occasion added to store');
    return newOcc.id;
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

  // Direct 1-Tap WhatsApp Checkout from Product Drawer
  const handleDirectWhatsAppCheckout = (configuredItem) => {
    setIsProductDrawerOpen(false);
    const text = generateWhatsAppMessage({
      lang,
      items: [configuredItem],
      handover: configuredItem.handover,
      trustPhoto: configuredItem.trustPhoto,
      orderId: '8492',
    });
    setWhatsAppTicketText(text);
    fireConfetti();
    setIsWhatsAppModalOpen(true);
  };

  // Checkout Entire Bag
  const handleBagCheckout = () => {
    setIsCartDrawerOpen(false);
    const handover = bagItems[0]?.handover || { type: 'gift' };
    const text = generateWhatsAppMessage({
      lang,
      items: bagItems,
      handover,
      trustPhoto: true,
      orderId: '8492',
    });
    setWhatsAppTicketText(text);
    fireConfetti();
    setIsWhatsAppModalOpen(true);
  };

  // Custom Order Submission (Drawer B)
  const handleCustomOrderSubmit = (customOrderData, handoverData) => {
    setIsCustomDrawerOpen(false);
    const text = generateWhatsAppMessage({
      lang,
      customOrder: customOrderData,
      handover: handoverData,
      trustPhoto: true,
      orderId: '8492',
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
        shopConfig={shopConfig}
        themeTokens={themeTokens}
      />

      {/* Floward-Style Circular Occasion Stories */}
      <OccasionStories
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        lang={lang}
        occasions={occasions}
        themeTokens={themeTokens}
      />

      {/* Ready in Cooler & Daily Specials Carousel with 4 switchable motion styles */}
      {selectedCategory !== 'past_work' && (
        <CoolerSpecialsCarousel
          onSelectProduct={handleOpenProduct}
          lang={lang}
          themeTokens={themeTokens}
          specialsStyle={shopConfig.specialsStyle}
          products={products}
        />
      )}

      {/* 1-Step Custom Order Banner */}
      <CustomOrderBanner
        onOpenCustomDrawer={() => setIsCustomDrawerOpen(true)}
        lang={lang}
        themeTokens={themeTokens}
      />

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isPortfolio={false}
                onSelectProduct={handleOpenProduct}
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
              ? 'سجل تجاري رقم: ١٠١٠٨٤٩٢٠٠ • المركز السعودي للأعمال'
              : 'Commercial Registration: 1010849200'}
          </div>
        </footer>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-200 dark:bg-stone-950 flex flex-col justify-start items-center selection:bg-stone-900 selection:text-white">
      {/* 1. Multi-Tenant Theme, Hero, View & Motion Switcher Bar */}
      <ThemeSwitcherBar
        currentTheme={shopConfig.theme}
        setCurrentTheme={(newTheme) =>
          setShopConfig((prev) => ({ ...prev, theme: newTheme }))
        }
        currentHero={shopConfig.heroStyle}
        setCurrentHero={(newHero) =>
          setShopConfig((prev) => ({ ...prev, heroStyle: newHero }))
        }
        currentSpecialsStyle={shopConfig.specialsStyle}
        setCurrentSpecialsStyle={(newStyle) =>
          setShopConfig((prev) => ({ ...prev, specialsStyle: newStyle }))
        }
        activeView={activeView}
        setActiveView={setActiveView}
        lang={lang}
        setLang={setLang}
      />

      {/* 2. Main View Canvas */}
      {/* VIEW A: Storefront (Mobile-First 480px) */}
      {activeView === 'storefront' && (
        <div
          className={`w-full max-w-[480px] ${themeTokens.pageBg} min-h-screen shadow-2xl flex flex-col relative transition-colors duration-300`}
        >
          {renderStorefrontContent()}
        </div>
      )}

      {/* VIEW LUXURY: FlowerStorefrontPage (Standalone Luxury Showcase) */}
      {activeView === 'luxury_showcase' && (
        <div className="w-full flex justify-center min-h-screen">
          <FlowerStorefrontPage />
        </div>
      )}

      {/* VIEW B: Florist Admin Panel (Mobile 500px) */}
      {activeView === 'admin' && (
        <div className="w-full max-w-[500px] bg-[#FAF9F6] min-h-screen shadow-2xl flex flex-col relative">
          <FloristAdminPanel
            shopConfig={shopConfig}
            onUpdateShopConfig={setShopConfig}
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onMoveToPastWork={handleMoveToPastWork}
            pastWorks={pastWorks}
            lang={lang}
            onOpenOrderSlip={() => setIsOrderSlipModalOpen(true)}
            themeTokens={themeTokens}
            formats={formats}
            onAddFormat={handleAddFormat}
            occasions={occasions}
            onAddOccasion={handleAddOccasion}
          />
        </div>
      )}

      {/* VIEW C: Split Studio (Side-by-side Live Florist Admin + Live Customer Storefront) */}
      {activeView === 'split' && (
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
              onOpenOrderSlip={() => setIsOrderSlipModalOpen(true)}
              themeTokens={themeTokens}
              formats={formats}
              onAddFormat={handleAddFormat}
              occasions={occasions}
              onAddOccasion={handleAddOccasion}
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
      )}

      {/* VIEW D: Order Slip (/o/8492) Full Dedicated View */}
      {activeView === 'orderslip' && (
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
          />
        </div>
      )}

      {/* Slide-Up Drawer A: Product & Configurator */}
      <ProductConfiguratorDrawer
        product={selectedProduct}
        isOpen={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
        onAddToBag={handleAddToBag}
        onDirectWhatsAppCheckout={handleDirectWhatsAppCheckout}
        lang={lang}
        theme={themeTokens}
      />

      {/* Slide-Up Drawer B: Custom Order & Gift Wrapping */}
      <CustomOrderDrawer
        isOpen={isCustomDrawerOpen}
        onClose={() => setIsCustomDrawerOpen(false)}
        onSubmitCustomOrder={handleCustomOrderSubmit}
        lang={lang}
        theme={themeTokens}
      />

      {/* Floating Cart Drawer */}
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

      {/* WhatsApp Message Preview Modal with Order Slip button */}
      <WhatsAppPreviewModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        messageText={whatsAppTicketText}
        lang={lang}
        onOpenOrderSlip={() => setIsOrderSlipModalOpen(true)}
      />

      {/* Florist Order Slip Modal (Overlay mode) */}
      <FloristOrderSlipModal
        isOpen={isOrderSlipModalOpen}
        onClose={() => setIsOrderSlipModalOpen(false)}
        isModal={true}
        lang={lang}
      />

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
