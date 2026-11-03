/**
 * Centralized Storefront Configuration Schema (StoreThemeConfig)
 * Single Source of Truth for the No-Code Luxury Storefront & Motion Studio
 */

export interface ActionLinkItem {
  label: string;
  url: string;
}

export interface BotanicalTypographySettings {
  /** Master toggle for botanical flowers and vines */
  enabled: boolean;
  /** Density of flowers and tendrils */
  density: 'light' | 'balanced' | 'dense';
  /** Bloom size in px (30px to 80px) */
  bloomSize: number;
  /** Stem line stroke width (1.0px to 3.5px) */
  stemThickness: number;
  /** Deterministic PRNG seed */
  seed: number;
  /** Vertical safe zone offset padding (0px to 40px) */
  safeZoneOffset: number;
  /** Motion mode: gust (wind), reach (mouse), breathe (pulse), grow (stroke drawing), typed, visitor (butterfly) */
  motionMode: 'gust' | 'reach' | 'breathe' | 'grow' | 'typed' | 'visitor';
  /** Animation speed multiplier (0.5x to 2.0x) */
  animationSpeed: number;
  /** Wind sway intensity in degrees (1deg to 10deg) */
  swayIntensity: number;
  /** Physics spring stiffness (50 to 200) */
  springStiffness: number;
}

export interface BrandHeaderSettings {
  name: string;
  subtitle: string;
  statusText: string;
  statusPulse: boolean;
  rating: string;
  avatarText: string;
  avatarUrl?: string;
  locationLabel: string;
  locationUrl: string;
  instagramLabel: string;
  instagramUrl: string;
  phone: string;
  callLabel: string;
  botanical: BotanicalTypographySettings;
}

export interface ColorPaletteSettings {
  paletteId: 'royalBurgundy' | 'deepForest' | 'rosaNoir' | 'velvetBlush' | 'custom';
  primary: string;
  secondary: string;
  canvasBg: string;
  cardSurface: string;
  textMain: string;
  textMuted: string;
  priceColor: string;
  sandPill: string;
  borderSubtle: string;
  isDark?: boolean;
}

export interface TypographySettings {
  headerFont: 'Amiri' | 'Aref Ruqaa' | 'Playfair Display' | 'Cairo';
  catalogFont: 'Readex Pro' | 'Cairo' | 'Tajawal' | 'Alexandria';
  baseFontSize: number; // 13px - 18px
  headingScale: number; // 1.0x - 1.4x
  lineHeight: number;   // 1.2 - 1.8
}

export interface AnimationSettings {
  cardEntrance: 'fade_up' | 'elastic_scale' | 'slide' | 'instant';
  staggerDelay: number; // 0.05s to 0.25s
  addToCartPhysics: 'morph' | 'fly' | 'ripple';
  cardHoverEffect: 'zoom' | 'tilt' | 'glow';
  ambientPetals: {
    enabled: boolean;
    opacity: number; // 0.2 to 0.9
    count: number;   // 6 to 24
  };
}

export interface CatalogCardSettings {
  gridLayout: 'grid_2' | 'grid_1' | 'bento';
  cardRadius: number; // 0px to 28px
  shadowIntensity: 'none' | 'soft' | 'medium' | 'elevated';
  titleDisplay: 'wrap' | 'truncate';
  buyButtonStyle: 'capsule' | 'circle' | 'full';
  showBadges: boolean;
  badgeStyle: 'glassmorphism' | 'solid';
  showFavorites: boolean;
}

export interface SectionItem {
  id: 'header' | 'occasions' | 'cooler' | 'filters' | 'catalog' | 'custom_banner';
  nameAr: string;
  nameEn: string;
  visible: boolean;
}

export interface StoreThemeConfig {
  version: number;
  brand: BrandHeaderSettings;
  colors: ColorPaletteSettings;
  typography: TypographySettings;
  animations: AnimationSettings;
  catalog: CatalogCardSettings;
  sections: SectionItem[];
  updatedAt: number;
}

// ==========================================
// CURATED LUXURY COLOR PALETTES
// ==========================================
export const LUXURY_PALETTES: Record<string, ColorPaletteSettings> = {
  royalBurgundy: {
    paletteId: 'royalBurgundy',
    primary: '#7E1529',
    secondary: '#BE123C',
    canvasBg: '#FAF8F5',
    cardSurface: '#FFFFFF',
    textMain: '#1C1917',
    textMuted: '#78716C',
    priceColor: '#7E1529',
    sandPill: '#FDF2F4',
    borderSubtle: '#FCE7EB',
    isDark: false,
  },
  deepForest: {
    paletteId: 'deepForest',
    primary: '#123524',
    secondary: '#10B981',
    canvasBg: '#FAF8F5',
    cardSurface: '#FFFFFF',
    textMain: '#1C1917',
    textMuted: '#78716C',
    priceColor: '#123524',
    sandPill: '#F7F5EE',
    borderSubtle: '#E7E5E4',
    isDark: false,
  },
  rosaNoir: {
    paletteId: 'rosaNoir',
    primary: '#F59E0B',
    secondary: '#FBBF24',
    canvasBg: '#0B0B0C',
    cardSurface: '#161618',
    textMain: '#F5F5F5',
    textMuted: '#A1A1AA',
    priceColor: '#F59E0B',
    sandPill: '#27272A',
    borderSubtle: '#27272A',
    isDark: true,
  },
  velvetBlush: {
    paletteId: 'velvetBlush',
    primary: '#881337',
    secondary: '#E11D48',
    canvasBg: '#FFF8F9',
    cardSurface: '#FFFFFF',
    textMain: '#4C0519',
    textMuted: '#9F1239',
    priceColor: '#881337',
    sandPill: '#FFE4E6',
    borderSubtle: '#FECDD3',
    isDark: false,
  },
};

export const DEFAULT_STORE_THEME_CONFIG: StoreThemeConfig = {
  version: 2,
  brand: {
    name: 'دار الورد للمناسبات',
    subtitle: 'أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب',
    statusText: 'مفتوح الآن • التجهيز خلال ٢٠ دقيقة',
    statusPulse: true,
    rating: '٤.٩ (٨٥٠+ تقييم)',
    avatarText: 'M',
    locationLabel: 'الرياض • التوصيل لكافة الأحياء',
    locationUrl: 'https://maps.google.com',
    instagramLabel: 'انستقرام',
    instagramUrl: 'https://instagram.com',
    phone: '966500000000',
    callLabel: 'اتصال',
    botanical: {
      enabled: true,
      density: 'balanced',
      bloomSize: 52,
      stemThickness: 1.6,
      seed: 48271,
      safeZoneOffset: 0,
      motionMode: 'gust',
      animationSpeed: 1.0,
      swayIntensity: 4,
      springStiffness: 100,
    },
  },
  colors: LUXURY_PALETTES.deepForest,
  typography: {
    headerFont: 'Amiri',
    catalogFont: 'Readex Pro',
    baseFontSize: 15,
    headingScale: 1.15,
    lineHeight: 1.5,
  },
  animations: {
    cardEntrance: 'fade_up',
    staggerDelay: 0.08,
    addToCartPhysics: 'morph',
    cardHoverEffect: 'zoom',
    ambientPetals: {
      enabled: false,
      opacity: 0.55,
      count: 12,
    },
  },
  catalog: {
    gridLayout: 'grid_2',
    cardRadius: 22,
    shadowIntensity: 'soft',
    titleDisplay: 'wrap',
    buyButtonStyle: 'capsule',
    showBadges: true,
    badgeStyle: 'glassmorphism',
    showFavorites: true,
  },
  sections: [
    { id: 'header', nameAr: 'بطاقة الهيدر وهوية المتجر', nameEn: 'Store Header & Identity', visible: true },
    { id: 'occasions', nameAr: 'قصص المناسبات الدائرية', nameEn: 'Occasion Story Circles', visible: true },
    { id: 'cooler', nameAr: 'باقات الاستلام الفوري (ثلاجة الورد)', nameEn: 'Ready-in-Cooler Specials', visible: true },
    { id: 'filters', nameAr: 'أشرطة التصفية والميزانية', nameEn: 'Category & Budget Filters', visible: true },
    { id: 'catalog', nameAr: 'شبكة المنتجات الرئيسية', nameEn: 'Main Product Catalog Grid', visible: true },
    { id: 'custom_banner', nameAr: 'بانر الطلب المخصص والتنسيق', nameEn: 'Custom Bouquet Banner', visible: true },
  ],
  updatedAt: Date.now(),
};

export const STORE_THEME_STORAGE_KEY = 'flowerhub_store_theme_config';
export const STORE_THEME_SYNC_EVENT = 'store_theme_synced';
