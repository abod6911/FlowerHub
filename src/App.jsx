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
import { lazyWithRetry } from './utils/lazyWithRetry';
const ProductConfiguratorDrawer = lazyWithRetry(() => import('./components/ProductConfiguratorDrawer'));
const CustomOrderDrawer = lazyWithRetry(() => import('./components/CustomOrderDrawer'));
const CartDrawer = lazyWithRetry(() => import('./components/CartDrawer'));
const MultiStoreManagerPage = lazyWithRetry(() => import('./components/MultiStoreManagerPage'));
const FloristAdminPanel = lazyWithRetry(() => import('./components/FloristAdminPanel'));
const FloristOrderSlipModal = lazyWithRetry(() => import('./components/FloristOrderSlipModal'));
const FlowerStorefrontPage = lazyWithRetry(() => import('./components/FlowerStorefrontPage'));
const NoCodeLuxuryStudio = lazyWithRetry(() => import('./components/NoCodeLuxuryStudio'));
import AdminAuthGuard from './components/AdminAuthGuard';
import AmbientRosePetals from './components/AmbientRosePetals';
import { verifyAndRecalculateOrder } from './services/priceVerificationService';
import { checkRateLimit, recordAttempt } from './services/rateLimiter';
import { sanitizeText, sanitizeUrl } from './utils/sanitizer';
import {
  createOrderSlipFromSingleItem,
  createOrderSlipFromBag,
  createOrderSlipFromCustomOrder,
  saveOrderToCashierInvoices,
} from './utils/orderSlipHelper';
import {
  getStoreBySlugOrId,
  mapStoreToShopConfig,
  decodePortableStoreFromUrl,
} from './utils/storesManager';
import { Sliders, Store, ArrowLeft, ArrowRight, ShoppingBag, Lock, MapPin, Globe } from 'lucide-react';
import { STUDIO_SYNC_EVENT } from './context/StudioThemeContext';

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

// Helper to decode active store branch slug from URL hash or query (Google Maps & Direct URLs)
const parseStoreSlugFromUrl = () => {
  if (typeof window === 'undefined') return null;
  try {
    const hash = window.location.hash || '';
    const searchParams = new URLSearchParams(window.location.search || '');

    if (searchParams.get('store')) return searchParams.get('store');
    if (searchParams.get('branch')) return searchParams.get('branch');
    if (searchParams.get('shop')) return searchParams.get('shop');

    if (hash.includes('store=')) {
      const match = hash.match(/store=([^&]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]);
    }
    if (hash.includes('branch=')) {
      const match = hash.match(/branch=([^&]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]);
    }
  } catch (e) {
    console.warn('Failed to parse store slug', e);
  }
  return null;
};

// Helper to decode universal live published theme from URL hash/query
const parseUrlThemeConfig = () => {
  if (typeof window === 'undefined') return null;
  try {
    const hash = window.location.hash || '';
    const searchParams = new URLSearchParams(window.location.search || '');
    let raw = null;

    if (hash.includes('theme=')) {
      const match = hash.match(/theme=([^&]+)/);
      if (match && match[1]) raw = decodeURIComponent(match[1]);
    } else if (hash.includes('config=')) {
      const match = hash.match(/config=([^&]+)/);
      if (match && match[1]) raw = decodeURIComponent(match[1]);
    } else if (searchParams.get('theme')) {
      raw = searchParams.get('theme');
    } else if (searchParams.get('config')) {
      raw = searchParams.get('config');
    }

    if (raw) {
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        try {
          parsed = JSON.parse(atob(raw));
        } catch {
          // ignore malformed base64
        }
      }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse URL theme', e);
  }
  return null;
};

export default function App() {
  // Multi-Tenant Shop Config & Theme State (Hydrated from Portable URL, Store Slug, Theme Param, or localStorage)
  const initialStoreBundle = (() => {
    const portableStore = decodePortableStoreFromUrl();
    if (portableStore) {
      return {
        config: { ...INITIAL_SHOP_CONFIG, ...mapStoreToShopConfig(portableStore) },
        lang: portableStore.defaultLang || 'ar',
      };
    }

    const storeSlug = parseStoreSlugFromUrl();
    if (storeSlug) {
      const matchedStore = getStoreBySlugOrId(storeSlug);
      if (matchedStore) {
        return {
          config: { ...INITIAL_SHOP_CONFIG, ...mapStoreToShopConfig(matchedStore) },
          lang: matchedStore.defaultLang || 'ar',
        };
      }
    }

    const urlConfig = parseUrlThemeConfig();
    try {
      const saved = localStorage.getItem('flowerhub_shop_config');
      const parsed = saved ? JSON.parse(saved) : null;
      const base = (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
        ? { ...INITIAL_SHOP_CONFIG, ...parsed }
        : INITIAL_SHOP_CONFIG;

      return {
        config: urlConfig ? { ...base, ...urlConfig } : base,
        lang: 'ar',
      };
    } catch {
      return {
        config: urlConfig ? { ...INITIAL_SHOP_CONFIG, ...urlConfig } : INITIAL_SHOP_CONFIG,
        lang: 'ar',
      };
    }
  })();

  // Language & RTL State
  const [lang, setLang] = useState(initialStoreBundle.lang || 'ar');
  const isAr = lang === 'ar';

  // Live Design Customizer Studio Modal State
  const [isDesignStudioOpen, setIsDesignStudioOpen] = useState(false);

  const [shopConfig, setShopConfig] = useState(initialStoreBundle.config);
  const themeTokens = (shopConfig?.theme && THEME_TOKENS[shopConfig.theme]) ? THEME_TOKENS[shopConfig.theme] : THEME_TOKENS.botanical;

  // Persist shopConfig to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flowerhub_shop_config', JSON.stringify(shopConfig));
    } catch (e) {
      console.error('Failed to save shop config to localStorage', e);
    }
  }, [shopConfig]);

  // Reactive listener to URL hash/query changes for instant store branch and theme switching
  useEffect(() => {
    const handleHashOrUrl = () => {
      const portableStore = decodePortableStoreFromUrl();
      if (portableStore) {
        setShopConfig((prev) => ({
          ...prev,
          ...mapStoreToShopConfig(portableStore),
        }));
        return;
      }

      const storeSlug = parseStoreSlugFromUrl();
      if (storeSlug) {
        const matchedStore = getStoreBySlugOrId(storeSlug);
        if (matchedStore) {
          setShopConfig((prev) => ({
            ...prev,
            ...mapStoreToShopConfig(matchedStore),
          }));
          return;
        }
      }

      const urlConfig = parseUrlThemeConfig();
      if (urlConfig) {
        setShopConfig((prev) => ({
          ...prev,
          ...urlConfig,
        }));
      }
    };
    window.addEventListener('hashchange', handleHashOrUrl);
    window.addEventListener('popstate', handleHashOrUrl);
    return () => {
      window.removeEventListener('hashchange', handleHashOrUrl);
      window.removeEventListener('popstate', handleHashOrUrl);
    };
  }, []);

  // Reactive listener to studio synchronization event
  useEffect(() => {
    const handleSync = (e) => {
      if (e?.detail) {
        const d = e.detail;
        setShopConfig((prev) => {
          const isBranch = Boolean(prev?.isGoogleMapsBranch || parseStoreSlugFromUrl());
          return {
            ...prev,
            specialsStyle: d.specialsStyle ?? prev.specialsStyle,
            shopNameAr: isBranch ? prev.shopNameAr : (d.storeName || prev.shopNameAr),
            taglineAr: isBranch ? prev.taglineAr : (d.storeSubtitle || prev.taglineAr),
            phone: isBranch ? prev.phone : (d.phone || prev.phone),
            locationLabel: isBranch ? prev.locationLabel : (d.locationLabel || prev.locationLabel),
            statusText: d.statusText ?? prev.statusText,
            statusPulse: d.statusPulse ?? prev.statusPulse,
            rating: d.rating ?? prev.rating,
            avatarText: d.avatarText ?? prev.avatarText,
            cardEntranceMotion: d.cardEntranceMotion ?? prev.cardEntranceMotion,
            staggerDelay: d.staggerDelay ?? prev.staggerDelay,
            buyButtonPhysics: d.buyButtonPhysics ?? prev.buyButtonPhysics,
            cardHoverEffect: d.cardHoverEffect ?? prev.cardHoverEffect,
            cardIdleMotion: d.cardIdleMotion ?? prev.cardIdleMotion,
            cardImageMotion: d.cardImageMotion ?? prev.cardImageMotion,
            badgeMotion: d.badgeMotion ?? prev.badgeMotion,
            gridLayout: d.gridLayout ?? prev.gridLayout,
            cardBorderRadius: d.cardBorderRadius ?? prev.cardBorderRadius,
            cardShadow: d.cardShadow ?? prev.cardShadow,
            cardAspectRatio: d.cardAspectRatio ?? prev.cardAspectRatio,
            cardSurfaceMaterial: d.cardSurfaceMaterial ?? prev.cardSurfaceMaterial,
            cardBorderStyle: d.cardBorderStyle ?? prev.cardBorderStyle,
            showImageOverlay: d.showImageOverlay ?? prev.showImageOverlay,
            buyButtonStyle: d.buyButtonStyle ?? prev.buyButtonStyle,
            fullTitleWrap: d.fullTitleWrap ?? prev.fullTitleWrap,
            showBadges: d.showBadges ?? prev.showBadges,
            badgeStyle: d.badgeStyle ?? prev.badgeStyle,
            showFavoriteButton: d.showFavoriteButton ?? prev.showFavoriteButton,
            showDeliveryBadge: d.showDeliveryBadge ?? prev.showDeliveryBadge,
            deliveryBadgeText: d.deliveryBadgeText ?? prev.deliveryBadgeText,
            showRatingStars: d.showRatingStars ?? prev.showRatingStars,
            showDiscountBadge: d.showDiscountBadge ?? prev.showDiscountBadge,
            showQuickView: d.showQuickView ?? prev.showQuickView,
            sectionDividerStyle: d.sectionDividerStyle ?? prev.sectionDividerStyle,
          };
        });
      }
    };
    window.addEventListener(STUDIO_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(STUDIO_SYNC_EVENT, handleSync);
  }, []);

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
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_OCCASIONS;
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

  // View Mode: 'storefront' | 'admin' | 'split' | 'orderslip' | 'network'
  // Discreet access: auto-activates if URL contains #admin, #studio, #manage, or #network, #stores
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = (window.location.hash || '').toLowerCase();
      const params = new URLSearchParams(window.location.search || '');

      // Check Multi-Store Network & Builder Platform
      if (
        hash.includes('network') ||
        hash.includes('stores') ||
        hash.includes('platform') ||
        hash.includes('hub') ||
        hash.includes('builder') ||
        hash.includes('create-store') ||
        params.get('view') === 'network' ||
        params.get('view') === 'builder' ||
        params.get('platform') === 'true'
      ) {
        return 'network';
      }

      // Check Single Store Florist Admin
      if (
        hash.includes('admin') ||
        hash.includes('studio') ||
        hash.includes('manage') ||
        params.get('admin') === 'true' ||
        params.get('manage') === 'florist'
      ) {
        return 'admin';
      }
    }
    return 'storefront';
  });

  // Reactive listener to URL hash/query changes for secret routes (Admin & Network Platform)
  useEffect(() => {
    const handleSecretRoutes = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const params = new URLSearchParams(window.location.search || '');

      if (
        hash.includes('network') ||
        hash.includes('stores') ||
        hash.includes('platform') ||
        hash.includes('hub') ||
        hash.includes('builder') ||
        hash.includes('create-store') ||
        params.get('view') === 'network' ||
        params.get('view') === 'builder' ||
        params.get('platform') === 'true'
      ) {
        setActiveView('network');
        return;
      }

      if (
        hash.includes('admin') ||
        hash.includes('studio') ||
        hash.includes('manage') ||
        params.get('admin') === 'true' ||
        params.get('manage') === 'florist'
      ) {
        setActiveView('admin');
      }
    };
    window.addEventListener('hashchange', handleSecretRoutes);
    window.addEventListener('popstate', handleSecretRoutes);
    return () => {
      window.removeEventListener('hashchange', handleSecretRoutes);
      window.removeEventListener('popstate', handleSecretRoutes);
    };
  }, []);

  // Secret Keyboard Shortcut:
  // - Ctrl + Shift + A or Alt + A: Toggle Store Admin
  // - Ctrl + Shift + S or Alt + S: Toggle Multi-Store Platform Hub
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Admin
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش'))
      ) {
        e.preventDefault();
        setActiveView((prev) => (prev === 'admin' ? 'storefront' : 'admin'));
        return;
      }

      // Toggle Multi-Store Platform
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) ||
        (e.altKey && (e.key === 's' || e.key === 'S' || e.key === 'س'))
      ) {
        e.preventDefault();
        setActiveView((prev) => (prev === 'network' ? 'storefront' : 'network'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Order Slip Modal State & Active Order Data (for dynamic invoice presentation)
  const [isOrderSlipModalOpen, setIsOrderSlipModalOpen] = useState(false);
  const [activeOrderSlipData, setActiveOrderSlipData] = useState(() => {
    try {
      const saved = localStorage.getItem('flowerhub_last_order');
      const parsed = saved ? JSON.parse(saved) : null;
      return (parsed && typeof parsed === 'object') ? parsed : null;
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
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(() => {
    return typeof window !== 'undefined' && window.location.search.includes('testCart=true');
  });

  // Bag / Cart
  const [bagItems, setBagItems] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('testCart=true')) {
      return [
        {
          id: 'prod-1',
          titleAr: 'بوكيه الروز الأحمر المخملي',
          titleEn: 'Royal Velvet Red Rose Bouquet',
          price: 245,
          image: './images/products/royal-red-roses.jpg',
          quantity: 1,
          handover: { type: 'delivery' },
        },
        {
          id: 'prod-2',
          titleAr: 'فازة الهيدرنجيا والبيبي روز الباستيل',
          titleEn: 'Blush Hydrangea & Baby Rose Vase',
          price: 320,
          image: './images/products/blush-hydrangea-vase.jpg',
          quantity: 1,
          handover: { type: 'delivery' },
        },
      ];
    }
    return [];
  });

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
      stemCount: configuredItem.stemCount,
      flowerType: configuredItem.flowerType,
      orderStyle: configuredItem.orderStyle,
      modificationNote: configuredItem.modificationNote ? sanitizeText(configuredItem.modificationNote) : null,
      ribbonText: configuredItem.ribbonText ? sanitizeText(configuredItem.ribbonText) : null,
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
    saveOrderToCashierInvoices(slipData);

    setIsProductDrawerOpen(false);
    recordAttempt('checkout_order');
    const text = generateWhatsAppMessage({
      shopConfig,
      lang,
      items: [sanitizedItem],
      handover: sanitizedItem.handover,
      trustPhoto: configuredItem.trustPhoto,
      orderId: slipData.orderId,
    });
    setWhatsAppTicketText(text);
    fireConfetti();
    openWhatsAppDirect(text);
    showToast(isAr ? 'تم إرسال الطلب! جاري فتح محادثة الواتساب مع المنسق 🌸' : 'Order sent! Opening WhatsApp with florist 🌸');
  };

  // Direct WhatsApp dispatch helper: opens florist chat directly without any popup modals
  const openWhatsAppDirect = (messageText) => {
    const cleanPhone = (shopConfig?.phone || '966500000000').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    try {
      const opened = window.open(waUrl, '_blank');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        window.location.href = waUrl;
      }
    } catch {
      window.location.href = waUrl;
    }
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
        stemCount: orig.stemCount,
        flowerType: orig.flowerType,
        orderStyle: orig.orderStyle,
        modificationNote: orig.modificationNote ? sanitizeText(orig.modificationNote) : null,
        ribbonText: orig.ribbonText ? sanitizeText(orig.ribbonText) : null,
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
    saveOrderToCashierInvoices(slipData);

    setIsCartDrawerOpen(false);
    setBagItems([]); // Reset cart after successful dispatch
    recordAttempt('checkout_order');
    const text = generateWhatsAppMessage({
      shopConfig,
      lang,
      items: sanitizedItems,
      handover,
      trustPhoto: true,
      orderId: slipData.orderId,
    });
    setWhatsAppTicketText(text);
    fireConfetti();
    openWhatsAppDirect(text);
    showToast(isAr ? 'تم إرسال الطلب! جاري فتح محادثة الواتساب مع المنسق 🌸' : 'Order sent! Opening WhatsApp with florist 🌸');
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
    saveOrderToCashierInvoices(slipData);

    setIsCustomDrawerOpen(false);
    recordAttempt('checkout_order');
    const text = generateWhatsAppMessage({
      shopConfig,
      lang,
      customOrder: sanitizedCustomOrder,
      handover: sanitizedHandover,
      trustPhoto: true,
      orderId: slipData.orderId,
    });
    setWhatsAppTicketText(text);
    fireConfetti();
    openWhatsAppDirect(text);
    showToast(isAr ? 'تم إرسال تفاصيل التنسيق الخاص إلى واتساب المنسق 🌸' : 'Custom design sent to florist WhatsApp 🌸');
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
    openWhatsAppDirect(text);
    showToast(isAr ? 'جاري فتح محادثة الواتساب للاستفسار 🌸' : 'Opening WhatsApp with florist...');
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
        onSecretAdminTrigger={() => setActiveView('admin')}
      />

      {/* Google Maps Verified Store Branch Ribbon */}
      {shopConfig?.isGoogleMapsBranch && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-b border-amber-500/25 py-2 px-4 text-center text-xs text-stone-900 dark:text-amber-100 flex items-center justify-center gap-2 font-medium animate-fade-in shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>
            {isAr
              ? `📍 طلب مباشر عبر خرائط قوقل • فرع: ${shopConfig.shopNameAr} (${shopConfig.locationLabel}) 🌸`
              : `📍 Google Maps Order • Branch: ${shopConfig.shopNameEn} (${shopConfig.locationLabel}) 🌸`}
          </span>
        </div>
      )}

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
            className={`grid gap-2.5 sm:gap-3.5 ${
              shopConfig.gridLayout === '1col'
                ? 'grid-cols-1 max-w-md mx-auto'
                : shopConfig.gridLayout === 'compact'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-2'
            }`}
          >
            {filteredProducts.map((product, idx) => {
              const isMagazineSpan = shopConfig.gridLayout === 'magazine' && idx === 0;
              const isBentoSpan = (shopConfig.gridLayout === 'bento' && idx === 0) || isMagazineSpan;
              return (
                <div
                  key={product.id}
                  className={isBentoSpan ? 'col-span-2' : 'col-span-1'}
                >
                  <ProductCard
                    product={product}
                    index={idx}
                    isPortfolio={false}
                    onSelectProduct={handleOpenProduct}
                    onAddToCart={handleAddToBag}
                    lang={lang}
                    themeTokens={themeTokens}
                  />
                </div>
              );
            })}
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

          {(shopConfig.locationLabel || shopConfig.workingHours || shopConfig.googleMapsUrl || shopConfig.instagramUrl) && (
            <div className={`flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] ${themeTokens.textMuted}`}>
              {shopConfig.locationLabel && (
                <span>{shopConfig.locationLabel}</span>
              )}
              {shopConfig.workingHours && (
                <span className="font-mono text-[10px] opacity-85">• {shopConfig.workingHours}</span>
              )}
              {shopConfig.googleMapsUrl && sanitizeUrl(shopConfig.googleMapsUrl, '') && (
                <a
                  href={sanitizeUrl(shopConfig.googleMapsUrl, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold underline decoration-amber-500/50 hover:text-amber-600 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>{isAr ? 'موقعنا على الخريطة' : 'Google Maps'}</span>
                </a>
              )}
              {shopConfig.instagramUrl && sanitizeUrl(shopConfig.instagramUrl, '') && (
                <a
                  href={sanitizeUrl(shopConfig.instagramUrl, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold underline decoration-amber-500/50 hover:text-amber-600 transition-colors"
                >
                  <Globe className="w-3 h-3 text-amber-500" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          )}

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

          <div className={`text-[10px] pt-1 ${themeTokens.textMuted} flex flex-wrap items-center justify-center gap-1.5`}>
            <span>
              {isAr
                ? `سجل تجاري رقم: ${shopConfig.crNumber || '١٠١٠٨٩٢٠٠'} • المركز السعودي للأعمال`
                : `Commercial Registration: ${shopConfig.crNumber || '1010849200'}`}
            </span>
            {shopConfig.vatNumber && (
              <span className="font-mono opacity-85">
                • {isAr ? `الرقم الضريبي: ${shopConfig.vatNumber}` : `VAT: ${shopConfig.vatNumber}`}
              </span>
            )}
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className="opacity-20 hover:opacity-80 transition-opacity p-0.5 text-stone-400 hover:text-amber-500 cursor-pointer"
              title="Portal"
              aria-label="Portal"
            >
              <Lock className="w-2.5 h-2.5" />
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
      {/* 1. Executive Management Bar (Hidden from normal visitors, shown ONLY when actively inside admin/sales) */}
      {activeView !== 'storefront' && (
        <ThemeSwitcherBar
          activeView={activeView}
          setActiveView={setActiveView}
          lang={lang}
          setLang={setLang}
          onLogout={handleAdminLogout}
        />
      )}

      {/* 2. Main View Canvas */}
      {/* VIEW A: Storefront (Dedicated Mobile Phone Architecture) */}
      {activeView === 'storefront' && (
        <div className="w-full flex justify-center py-0 sm:py-6 sm:px-4 relative">
          <AmbientRosePetals />
          <div
            className={`w-full sm:max-w-[460px] min-h-screen ${themeTokens.pageBg} sm:rounded-[36px] sm:shadow-[0_25px_70px_rgba(0,0,0,0.18)] sm:border sm:border-stone-200/90 dark:sm:border-stone-800 flex flex-col relative transition-colors duration-300 overflow-x-clip sm:overflow-hidden`}
          >
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

      {/* VIEW NETWORK: Multi-Store Platform & Website Builder (Super Admin RBAC Protected) */}
      {activeView === 'network' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <AdminAuthGuard
            lang={lang}
            requiredRole="super_admin"
            showTopBar={true}
            onClose={() => setActiveView('storefront')}
          >
            <MultiStoreManagerPage
              lang={lang}
              onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
              onClose={() => setActiveView('storefront')}
              onOpenStoreAdmin={() => setActiveView('admin')}
              onSwitchToStore={(store) => {
                const mapped = mapStoreToShopConfig(store);
                setShopConfig(mapped);
                if (store.defaultLang === 'en' || store.defaultLang === 'ar') {
                  setLang(store.defaultLang);
                }
                setActiveView('storefront');
                showToast(isAr ? `تم فتح متجر: ${store.nameAr} 🌸` : `Switched to: ${store.nameEn}`);
              }}
              activeStoreId={shopConfig?.id}
            />
          </AdminAuthGuard>
        </React.Suspense>
      )}

      {/* VIEW B: Florist Admin Panel (Store-Scoped RBAC Protected) */}
      {activeView === 'admin' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <AdminAuthGuard lang={lang} storeContext={shopConfig} onClose={() => setActiveView('storefront')}>
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
                activeOrderSlipData={activeOrderSlipData}
                themeTokens={themeTokens}
                formats={formats}
                onAddFormat={handleAddFormat}
                occasions={occasions}
                onAddOccasion={handleAddOccasion}
                onToggleOccasionVisibility={handleToggleOccasionVisibility}
                onDeleteOccasion={handleDeleteOccasion}
                onApplyCuratedTemplate={handleApplyCuratedTemplate}
                onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
                onOpenNetworkHub={() => setActiveView('network')}
                onClose={() => setActiveView('storefront')}
              />
            </div>
          </AdminAuthGuard>
        </React.Suspense>
      )}

      {/* VIEW SALES: Direct Coordinator Sales & Profits View (RBAC Protected) */}
      {activeView === 'sales' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <AdminAuthGuard lang={lang} storeContext={shopConfig} onClose={() => setActiveView('storefront')}>
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
                activeOrderSlipData={activeOrderSlipData}
                themeTokens={themeTokens}
                formats={formats}
                onAddFormat={handleAddFormat}
                occasions={occasions}
                onAddOccasion={handleAddOccasion}
                onToggleOccasionVisibility={handleToggleOccasionVisibility}
                onDeleteOccasion={handleDeleteOccasion}
                onApplyCuratedTemplate={handleApplyCuratedTemplate}
                onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
                onOpenNetworkHub={() => setActiveView('network')}
                initialTab="sales"
                onClose={() => setActiveView('storefront')}
              />
            </div>
          </AdminAuthGuard>
        </React.Suspense>
      )}

      {/* VIEW C: Split Studio (Side-by-side Live Florist Admin + Live Customer Storefront) (RBAC Protected) */}
      {activeView === 'split' && (
        <React.Suspense fallback={<div className="w-full py-20 flex justify-center"><div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>}>
          <AdminAuthGuard lang={lang} storeContext={shopConfig} onClose={() => setActiveView('storefront')}>
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
                  activeOrderSlipData={activeOrderSlipData}
                  themeTokens={themeTokens}
                  formats={formats}
                  onAddFormat={handleAddFormat}
                  occasions={occasions}
                  onAddOccasion={handleAddOccasion}
                  onToggleOccasionVisibility={handleToggleOccasionVisibility}
                  onDeleteOccasion={handleDeleteOccasion}
                  onApplyCuratedTemplate={handleApplyCuratedTemplate}
                  onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
                  onOpenNetworkHub={() => setActiveView('network')}
                  onClose={() => setActiveView('storefront')}
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
          shopConfig={shopConfig}
          theme={themeTokens}
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
