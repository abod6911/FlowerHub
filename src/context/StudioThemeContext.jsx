import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { LUXURY_PALETTES } from '../types/storeThemeConfig';
import { saveBotanicalBrandConfig } from '../types/botanical';

export const STUDIO_STORAGE_KEY = 'flowerhub_studio_theme_config';
export const STUDIO_SYNC_EVENT = 'studio_theme_synced';

export const DEFAULT_TYPE_GARDEN_CONFIG = {
  enabled: true,
  text: 'دار الورد للمناسبات',
  preset: 'type_garden_classic',
  flowerSpecies: 'royal_rose', // 'royal_rose' | 'sakura' | 'camellia' | 'minimal_gold'
  density: 6, // 1 to 10
  growthSpeed: 1.0, // 0.5 to 2.5
  windSway: 1.0, // 0 to 2.5
  branchReach: 55, // 20 to 100
  flowerScale: 1.0, // 0.6 to 1.6
  curliness: 1.0, // 0.5 to 2.0
  stemColor: '#1E3A8A', // Cobalt Blue
  primaryPetalColor: '#DC2626', // Crimson Red
  secondaryPetalColor: '#F59E0B', // Amber Gold
  petalColor: '#DC2626', // Backward compatible
  textColor: '#1C1917',
  seed: 48271,
  replayKey: 0,
};

export const DEFAULT_STUDIO_CONFIG = {
  // Brand & Botanical
  storeName: 'دار الورد للمناسبات',
  storeSubtitle: 'أزهار طبيعية وهدايا فاخرة تُنسق يومياً بحب',
  botanicalEnabled: true,
  botanicalPalette: 'royalBurgundy',
  botanicalMotion: 'gust',
  botanicalDensity: 'balanced',
  botanicalSeed: 48271,
  bloomSize: 52,
  stemThickness: 1.8,
  safeZoneOffset: 0,
  animationSpeed: 1.0,
  swayIntensity: 4,

  // Generative Type Garden Engine
  typeGarden: DEFAULT_TYPE_GARDEN_CONFIG,

  // Identity & Badges
  statusText: 'مفتوح الآن • التجهيز خلال ٢٠ دقيقة',
  statusPulse: true,
  rating: '٤.٩ (٨٥٠+ تقييم)',
  avatarText: 'د.و',
  locationLabel: 'الرياض • التوصيل لكافة الأحياء',
  phone: '966500000000',

  // Layout & Cards (Tab: البطاقات والأقسام)
  gridLayout: 'bento', // '2cols' | '1col' | 'bento' | 'magazine' | 'compact'
  cardBorderRadius: 22, // 0 to 32px
  cardShadow: 'soft', // 'none' | 'soft' | 'medium' | 'high' | 'gold_glow'
  cardAspectRatio: 'aspect_4_5', // 'aspect_4_5' | 'aspect_1_1' | 'aspect_3_4'
  cardSurfaceMaterial: 'pure_white', // 'pure_white' | 'frosted_glass' | 'warm_ivory' | 'velvet_dark'
  cardBorderStyle: 'hairline', // 'hairline' | 'gold_rim' | 'none' | 'glow_rim'
  showImageOverlay: true, // gradient vignette at bottom of card image

  // Card Anatomy & Conversion Boosters
  buyButtonStyle: 'pill_add', // 'circle_plus' | 'pill_add' | 'full_width' | 'split_price'
  fullTitleWrap: true,
  showBadges: true,
  badgeStyle: 'glassmorphic', // 'glassmorphic' | 'solid_pastel' | 'royal_gold' | 'dark_velvet'
  showFavoriteButton: true,
  showDeliveryBadge: true,
  deliveryBadgeText: 'توصيل ساعتين • مبرد ⚡',
  showRatingStars: true,
  showDiscountBadge: true,
  showQuickView: true,
  sectionDividerStyle: 'none', // 'none' | 'gold_hairline' | 'subtle_line'

  // Motion & Physics (Tab: الحركة والفيزياء)
  cardEntranceMotion: 'fade_up', // 'fade_up' | 'elastic_scale' | 'slide' | 'flip_3d' | 'blur_in' | 'pop_bounce' | 'waterfall_drop' | 'spiral_bloom' | 'cinematic_zoom' | 'none'
  staggerDelay: 0.08, // 0.02s to 0.25s
  buyButtonPhysics: 'morph_checkmark', // 'morph_checkmark' | 'ripple_wave' | 'fly_to_cart' | 'sparkle_burst' | 'haptic_pop' | 'flower_bloom' | 'confetti_shower' | 'golden_stamp' | 'heart_burst' | 'magnet_snap'
  cardHoverEffect: 'zoom_soft', // 'zoom_soft' | 'tilt_3d' | 'gold_glow' | 'lift_shadow' | 'sheen_shine' | 'border_beam' | 'crystal_glass' | 'parallax_depth' | 'aurora_pulse' | 'spotlight_glow'
  cardIdleMotion: 'none', // 'none' | 'gentle_float' | 'breathe_pulse' | 'subtle_sheen_loop' | 'gentle_sway'
  cardImageMotion: 'zoom_in', // 'zoom_in' | 'ken_burns' | 'vivid_chroma' | 'depth_tilt' | 'soft_vignette'
  badgeMotion: 'pulse_dot', // 'static' | 'pulse_dot' | 'shimmer_gold' | 'float_badge'
  floatingPetalsEnabled: true,
  petalsCount: 14,
  petalsOpacity: 0.6,
  petalsType: 'rose_red', // 'rose_red' | 'sakura_pink' | 'gold_luxury'
  petalsSpeed: 'normal', // 'gentle' | 'normal' | 'breeze'

  // Colors & Typography
  paletteId: 'royalBurgundy',
  colors: LUXURY_PALETTES.royalBurgundy,
  typography: {
    headerFont: 'Amiri',
    catalogFont: 'Readex Pro',
    baseFontSize: 15,
    headingScale: 1.15,
    lineHeight: 1.45,
  },

  // Sections Order & Visibility
  sections: [
    { id: 'header', nameAr: 'بطاقة الهيدر وهوية المتجر', visible: true },
    { id: 'occasions', nameAr: 'قصص المناسبات الدائرية', visible: true },
    { id: 'cooler', nameAr: 'باقات الاستلام الفوري (ثلاجة الورد)', visible: true },
    { id: 'custom_banner', nameAr: 'بانر الطلب المخصص والتنسيق', visible: true },
    { id: 'filters', nameAr: 'أشرطة التصفية والميزانية', visible: true },
    { id: 'catalog', nameAr: 'شبكة المنتجات الرئيسية', visible: true },
  ],

  // Active Tab & State
  activeTab: 'identity', // 'identity' | 'colors' | 'motion' | 'cards'
  hasUnsavedChanges: false,
};

export const loadStoredStudioConfig = () => {
  if (typeof window === 'undefined') return DEFAULT_STUDIO_CONFIG;
  try {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_STUDIO_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STUDIO_CONFIG,
      ...parsed,
      colors: {
        ...DEFAULT_STUDIO_CONFIG.colors,
        ...(parsed?.colors || {}),
      },
      typography: {
        ...DEFAULT_STUDIO_CONFIG.typography,
        ...(parsed?.typography || {}),
      },
      typeGarden: {
        ...DEFAULT_TYPE_GARDEN_CONFIG,
        ...(parsed?.typeGarden || {}),
      },
      sections: Array.isArray(parsed?.sections) && parsed.sections.length > 0
        ? parsed.sections
        : DEFAULT_STUDIO_CONFIG.sections,
      hasUnsavedChanges: false,
    };
  } catch {
    return DEFAULT_STUDIO_CONFIG;
  }
};

const StudioThemeContext = createContext(null);

export function StudioThemeProvider({ children }) {
  const [config, setConfig] = useState(loadStoredStudioConfig);

  // Cross-tab and window event listener
  useEffect(() => {
    const handleSync = (e) => {
      try {
        if (e?.detail) {
          const detail = e.detail;
          setConfig((prev) => ({
            ...prev,
            ...detail,
            colors: {
              ...(prev?.colors || DEFAULT_STUDIO_CONFIG.colors),
              ...(detail.colors || {}),
            },
            typography: {
              ...(prev?.typography || DEFAULT_STUDIO_CONFIG.typography),
              ...(detail.typography || {}),
            },
            sections: Array.isArray(detail.sections) && detail.sections.length > 0
              ? detail.sections
              : (prev?.sections || DEFAULT_STUDIO_CONFIG.sections),
          }));
        } else {
          setConfig(loadStoredStudioConfig());
        }
      } catch (err) {
        console.warn('Error in handleSync event listener:', err);
      }
    };
    window.addEventListener(STUDIO_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(STUDIO_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Inject CSS Variables dynamically into :root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const { colors, typography, cardBorderRadius } = config || {};

    const safeColors = colors || DEFAULT_STUDIO_CONFIG.colors;
    root.style.setProperty('--accent-primary', safeColors.primary || '#7E1529');
    root.style.setProperty('--accent-gold', safeColors.secondary || '#BE123C');
    root.style.setProperty('--bg-canvas', safeColors.canvasBg || '#FAF8F5');
    root.style.setProperty('--surface-card', safeColors.cardSurface || '#FFFFFF');
    root.style.setProperty('--text-main', safeColors.textMain || '#1C1917');
    root.style.setProperty('--text-muted', safeColors.textMuted || '#78716C');
    root.style.setProperty('--color-price', safeColors.priceColor || safeColors.primary || '#7E1529');
    root.style.setProperty('--pill-inactive-bg', safeColors.sandPill || '#F5F5F4');
    root.style.setProperty('--border-subtle', safeColors.borderSubtle || '#E7E5E4');

    const safeTypo = typography || DEFAULT_STUDIO_CONFIG.typography;
    root.style.setProperty('--font-header', `'${safeTypo.headerFont || 'Amiri'}', serif`);
    root.style.setProperty('--font-catalog', `'${safeTypo.catalogFont || 'Cairo'}', 'Cairo', sans-serif`);
    root.style.setProperty('--base-font-size', `${safeTypo.baseFontSize || 15}px`);
    root.style.setProperty('--heading-scale', `${safeTypo.headingScale || 1.15}`);
    root.style.setProperty('--body-line-height', `${safeTypo.lineHeight || 1.45}`);

    const safeRadius = cardBorderRadius ?? 22;
    root.style.setProperty('--radius-card', `${safeRadius}px`);
    root.style.setProperty('--radius-unit', `${safeRadius}px`);
  }, [config]);

  // Update one or more fields in the store
  const updateConfig = useCallback((partial) => {
    setConfig((prev) => ({
      ...prev,
      ...partial,
      hasUnsavedChanges: true,
    }));
  }, []);

  const updateField = useCallback((key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
      hasUnsavedChanges: true,
    }));
  }, []);

  const setActiveTab = useCallback((tab) => {
    setConfig((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  // One-click Luxury Palette Switcher
  const applyPalette = useCallback((paletteId) => {
    const pal = LUXURY_PALETTES[paletteId];
    if (!pal) return;
    setConfig((prev) => ({
      ...prev,
      paletteId,
      botanicalPalette: paletteId,
      colors: pal,
      hasUnsavedChanges: true,
    }));
  }, []);

  // Sections manager
  const toggleSection = useCallback((sectionId) => {
    setConfig((prev) => {
      const currentSections = Array.isArray(prev?.sections) ? prev.sections : DEFAULT_STUDIO_CONFIG.sections;
      return {
        ...prev,
        hasUnsavedChanges: true,
        sections: currentSections.map((sec) =>
          sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
        ),
      };
    });
  }, []);

  const moveSection = useCallback((index, direction) => {
    setConfig((prev) => {
      const currentSections = Array.isArray(prev?.sections) ? prev.sections : DEFAULT_STUDIO_CONFIG.sections;
      const items = [...currentSections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return {
        ...prev,
        hasUnsavedChanges: true,
        sections: items,
      };
    });
  }, []);

  // Publish changes to localStorage and broadcast event
  const publishConfig = useCallback(() => {
    try {
      const safeConfig = {
        ...DEFAULT_STUDIO_CONFIG,
        ...config,
        colors: {
          ...DEFAULT_STUDIO_CONFIG.colors,
          ...(config?.colors || {}),
        },
        typography: {
          ...DEFAULT_STUDIO_CONFIG.typography,
          ...(config?.typography || {}),
        },
        sections: Array.isArray(config?.sections) && config.sections.length > 0
          ? config.sections
          : DEFAULT_STUDIO_CONFIG.sections,
        hasUnsavedChanges: false,
      };

      // 1. Persist studio configuration
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(safeConfig));

      // 2. Cross-sync with flowerhub_shop_config so Florist Admin & Customer Storefront reflect changes
      try {
        const rawShop = localStorage.getItem('flowerhub_shop_config');
        const shop = rawShop ? JSON.parse(rawShop) : {};
        localStorage.setItem(
          'flowerhub_shop_config',
          JSON.stringify({
            ...shop,
            shopNameAr: safeConfig.storeName || shop.shopNameAr,
            taglineAr: safeConfig.storeSubtitle || shop.taglineAr,
            phone: safeConfig.phone || shop.phone,
            locationLabel: safeConfig.locationLabel || shop.locationLabel,
            statusText: safeConfig.statusText,
            statusPulse: safeConfig.statusPulse,
            rating: safeConfig.rating,
            avatarText: safeConfig.avatarText,
            cardEntranceMotion: safeConfig.cardEntranceMotion,
            staggerDelay: safeConfig.staggerDelay,
            buyButtonPhysics: safeConfig.buyButtonPhysics,
            cardHoverEffect: safeConfig.cardHoverEffect,
            cardIdleMotion: safeConfig.cardIdleMotion,
            cardImageMotion: safeConfig.cardImageMotion,
            badgeMotion: safeConfig.badgeMotion,
            floatingPetalsEnabled: safeConfig.floatingPetalsEnabled,
            petalsCount: safeConfig.petalsCount,
            petalsOpacity: safeConfig.petalsOpacity,
            petalsType: safeConfig.petalsType,
            petalsSpeed: safeConfig.petalsSpeed,
            gridLayout: safeConfig.gridLayout,
            cardBorderRadius: safeConfig.cardBorderRadius,
            cardShadow: safeConfig.cardShadow,
            cardAspectRatio: safeConfig.cardAspectRatio,
            cardSurfaceMaterial: safeConfig.cardSurfaceMaterial,
            cardBorderStyle: safeConfig.cardBorderStyle,
            showImageOverlay: safeConfig.showImageOverlay,
            buyButtonStyle: safeConfig.buyButtonStyle,
            fullTitleWrap: safeConfig.fullTitleWrap,
            showBadges: safeConfig.showBadges,
            badgeStyle: safeConfig.badgeStyle,
            showFavoriteButton: safeConfig.showFavoriteButton,
            showDeliveryBadge: safeConfig.showDeliveryBadge,
            deliveryBadgeText: safeConfig.deliveryBadgeText,
            showRatingStars: safeConfig.showRatingStars,
            showDiscountBadge: safeConfig.showDiscountBadge,
            showQuickView: safeConfig.showQuickView,
            sectionDividerStyle: safeConfig.sectionDividerStyle,
            sections: safeConfig.sections,
            colors: safeConfig.colors,
            paletteId: safeConfig.paletteId,
            typography: safeConfig.typography,
          })
        );
      } catch (e) {
        console.warn('Sync to flowerhub_shop_config failed:', e);
      }

      // 3. Backwards sync with botanical brand config
      try {
        saveBotanicalBrandConfig({
          text: safeConfig.storeName || DEFAULT_STUDIO_CONFIG.storeName,
          fontFamily: safeConfig.typography?.headerFont || 'Amiri',
          paletteId: safeConfig.botanicalPalette || 'royalBurgundy',
          motionMode: safeConfig.botanicalMotion || 'gust',
          density: safeConfig.botanicalDensity || 'balanced',
          seed: safeConfig.botanicalSeed || 48271,
          scale: 1.0,
          bloomSize: safeConfig.bloomSize || 52,
          stemThickness: safeConfig.stemThickness || 1.8,
          safeZoneOffset: safeConfig.safeZoneOffset || 0,
          animationSpeed: safeConfig.animationSpeed || 1.0,
          swayIntensity: safeConfig.swayIntensity || 4,
          botanicalEnabled: safeConfig.botanicalEnabled !== false,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.warn('saveBotanicalBrandConfig failed:', err);
      }

      // 4. Update local state
      setConfig(safeConfig);

      // 5. Broadcast synchronized event
      window.dispatchEvent(
        new CustomEvent(STUDIO_SYNC_EVENT, { detail: safeConfig })
      );
      return true;
    } catch (err) {
      console.error('Failed to publish studio config:', err);
      return false;
    }
  }, [config]);

  // Reset to default
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_STUDIO_CONFIG);
    try {
      localStorage.removeItem(STUDIO_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent(STUDIO_SYNC_EVENT, { detail: DEFAULT_STUDIO_CONFIG })
      );
    } catch {
      // ignore
    }
  }, []);

  // Export JSON
  const exportConfig = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `flowerhub_studio_theme_${Date.now()}.json`);
    dlAnchor.click();
  }, [config]);

  // Import JSON
  const importConfig = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;
      const merged = {
        ...DEFAULT_STUDIO_CONFIG,
        ...parsed,
        hasUnsavedChanges: true,
      };
      setConfig(merged);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Type Garden Arabic Engine Methods
  const updateTypeGarden = useCallback((partial) => {
    setConfig((prev) => {
      const nextTypeGarden = {
        ...(prev.typeGarden || DEFAULT_TYPE_GARDEN_CONFIG),
        ...partial,
      };
      const updated = {
        ...prev,
        typeGarden: nextTypeGarden,
        hasUnsavedChanges: true,
      };
      try {
        localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(STUDIO_SYNC_EVENT, { detail: updated }));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const updateTypeGardenField = useCallback((field, value) => {
    updateTypeGarden({ [field]: value });
  }, [updateTypeGarden]);

  const regenerateTypeGardenSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 900000) + 10000;
    updateTypeGarden({ seed: newSeed, replayKey: Date.now() });
    return newSeed;
  }, [updateTypeGarden]);

  const replayTypeGardenGrowth = useCallback(() => {
    updateTypeGarden({ replayKey: Date.now() });
  }, [updateTypeGarden]);

  const exportTypeGardenJson = useCallback(() => {
    const tgConfig = config.typeGarden || DEFAULT_TYPE_GARDEN_CONFIG;
    const jsonStr = JSON.stringify(tgConfig, null, 2);
    try {
      navigator.clipboard?.writeText(jsonStr);
    } catch {
      // ignore
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `type_garden_arabic_config_${Date.now()}.json`);
    dlAnchor.click();
    return jsonStr;
  }, [config.typeGarden]);

  // Backwards-compatible adapter so existing components reading config.catalog, config.brand, etc. continue working!
  const legacyConfigAdapter = useMemo(() => {
    return {
      ...config,
      brand: {
        storeName: config.storeName,
        storeNameAr: config.storeName,
        subtitle: config.storeSubtitle,
        subtitleAr: config.storeSubtitle,
        statusText: config.statusText,
        statusPulse: config.statusPulse,
        rating: config.rating,
        avatarText: config.avatarText,
        locationLabel: config.locationLabel,
        locationUrl: 'https://maps.google.com',
        instagramLabel: 'انستقرام',
        instagramUrl: 'https://instagram.com',
        phone: config.phone,
        botanical: {
          enabled: config.botanicalEnabled,
          density: config.botanicalDensity,
          bloomSize: config.bloomSize,
          stemThickness: config.stemThickness,
          seed: config.botanicalSeed,
          safeZoneOffset: config.safeZoneOffset,
          motionMode: config.botanicalMotion,
          animationSpeed: config.animationSpeed,
          swayIntensity: config.swayIntensity,
          paletteId: config.botanicalPalette,
        },
      },
      catalog: {
        gridLayout: config.gridLayout === '2cols' ? 'grid_2' : config.gridLayout === '1col' ? 'grid_1' : 'bento',
        cardRadius: config.cardBorderRadius,
        shadowIntensity: config.cardShadow,
        titleDisplay: config.fullTitleWrap ? 'wrap' : 'truncate',
        buyButtonStyle: config.buyButtonStyle === 'pill_add' ? 'capsule' : config.buyButtonStyle === 'circle_plus' ? 'circle' : 'full',
        showBadges: config.showBadges,
        badgeStyle: config.badgeStyle === 'solid_pastel' ? 'solid' : 'glassmorphism',
        showFavorites: config.showFavoriteButton,
      },
      animations: {
        cardEntrance: config.cardEntranceMotion,
        staggerDelay: config.staggerDelay,
        addToCartPhysics: config.buyButtonPhysics === 'morph_checkmark' ? 'morph' : config.buyButtonPhysics === 'ripple_wave' ? 'ripple' : 'fly',
        cardHoverEffect: config.cardHoverEffect === 'zoom_soft' ? 'zoom' : config.cardHoverEffect === 'tilt_3d' ? 'tilt' : 'glow',
        ambientPetals: {
          enabled: config.floatingPetalsEnabled,
          opacity: config.petalsOpacity,
          count: config.petalsCount,
        },
      },
    };
  }, [config]);

  const value = useMemo(
    () => ({
      config,
      legacyConfig: legacyConfigAdapter,
      hasUnsavedChanges: config.hasUnsavedChanges,
      isPublished: !config.hasUnsavedChanges,
      activeTab: config.activeTab,
      updateConfig,
      updateField,
      setActiveTab,
      applyPalette,
      toggleSection,
      moveSection,
      publishConfig,
      resetConfig,
      exportConfig,
      importConfig,
      // Type Garden Engine Live Hooks
      typeGarden: config.typeGarden || DEFAULT_TYPE_GARDEN_CONFIG,
      updateTypeGarden,
      updateTypeGardenField,
      regenerateTypeGardenSeed,
      replayTypeGardenGrowth,
      exportTypeGardenJson,
      // Section aliases
      toggleSectionVisibility: toggleSection,
      exportJson: exportConfig,
      importJson: importConfig,
      updateModule: (modKey, partial) => {
        if (modKey === 'brand') {
          updateConfig({
            storeName: partial.name ?? partial.storeName ?? partial.storeNameAr ?? config.storeName,
            storeSubtitle: partial.subtitle ?? partial.storeSubtitle ?? partial.subtitleAr ?? config.storeSubtitle,
            ...(partial.botanical ? {
              botanicalEnabled: partial.botanical.enabled ?? config.botanicalEnabled,
              botanicalMotion: partial.botanical.motionMode ?? config.botanicalMotion,
              botanicalDensity: partial.botanical.density ?? config.botanicalDensity,
              botanicalSeed: partial.botanical.seed ?? config.botanicalSeed,
              bloomSize: partial.botanical.bloomSize ?? config.bloomSize,
              stemThickness: partial.botanical.stemThickness ?? config.stemThickness,
              safeZoneOffset: partial.botanical.safeZoneOffset ?? config.safeZoneOffset,
              animationSpeed: partial.botanical.animationSpeed ?? config.animationSpeed,
              swayIntensity: partial.botanical.swayIntensity ?? config.swayIntensity,
            } : {}),
          });
        } else if (modKey === 'catalog') {
          updateConfig({
            ...(partial.gridLayout !== undefined ? { gridLayout: partial.gridLayout === 'grid_2' ? '2cols' : partial.gridLayout === 'grid_1' ? '1col' : 'bento' } : {}),
            ...(partial.cardRadius !== undefined ? { cardBorderRadius: partial.cardRadius } : {}),
            ...(partial.shadowIntensity !== undefined ? { cardShadow: partial.shadowIntensity } : {}),
            ...(partial.buyButtonStyle !== undefined ? { buyButtonStyle: partial.buyButtonStyle === 'capsule' ? 'pill_add' : partial.buyButtonStyle === 'circle' ? 'circle_plus' : 'full_width' } : {}),
            ...(partial.titleDisplay !== undefined ? { fullTitleWrap: partial.titleDisplay === 'wrap' } : {}),
            ...(partial.showBadges !== undefined ? { showBadges: partial.showBadges } : {}),
            ...(partial.badgeStyle !== undefined ? { badgeStyle: partial.badgeStyle === 'solid' ? 'solid_pastel' : 'glassmorphic' } : {}),
            ...(partial.showFavorites !== undefined ? { showFavoriteButton: partial.showFavorites } : {}),
          });
        } else if (modKey === 'animations') {
          updateConfig({
            ...(partial.cardEntrance !== undefined ? { cardEntranceMotion: partial.cardEntrance } : {}),
            ...(partial.staggerDelay !== undefined ? { staggerDelay: partial.staggerDelay } : {}),
            ...(partial.addToCartPhysics !== undefined ? { buyButtonPhysics: partial.addToCartPhysics === 'morph' ? 'morph_checkmark' : partial.addToCartPhysics === 'ripple' ? 'ripple_wave' : 'fly_to_cart' } : {}),
            ...(partial.cardHoverEffect !== undefined ? { cardHoverEffect: partial.cardHoverEffect === 'zoom' ? 'zoom_soft' : partial.cardHoverEffect === 'tilt' ? 'tilt_3d' : 'gold_glow' } : {}),
            ...(partial.ambientPetals ? {
              floatingPetalsEnabled: partial.ambientPetals.enabled ?? config.floatingPetalsEnabled,
              petalsOpacity: partial.ambientPetals.opacity ?? config.petalsOpacity,
              petalsCount: partial.ambientPetals.count ?? config.petalsCount,
            } : {}),
          });
        } else if (modKey === 'colors') {
          updateConfig({ colors: partial, paletteId: partial.paletteId || config.paletteId });
        } else if (modKey === 'typography') {
          updateConfig({ typography: { ...config.typography, ...partial } });
        }
      },
    }),
    [
      config,
      legacyConfigAdapter,
      updateConfig,
      updateField,
      setActiveTab,
      applyPalette,
      toggleSection,
      moveSection,
      publishConfig,
      resetConfig,
      exportConfig,
      importConfig,
      updateTypeGarden,
      updateTypeGardenField,
      regenerateTypeGardenSeed,
      replayTypeGardenGrowth,
      exportTypeGardenJson,
    ]
  );

  return <StudioThemeContext.Provider value={value}>{children}</StudioThemeContext.Provider>;
}

export function useStudioStore() {
  const ctx = useContext(StudioThemeContext);
  if (!ctx) {
    return {
      config: DEFAULT_STUDIO_CONFIG,
      typeGarden: DEFAULT_TYPE_GARDEN_CONFIG,
      activeTab: 'palette',
      setActiveTab: () => {},
      hasUnsavedChanges: false,
      updateField: () => {},
      updateColors: () => {},
      updateTypography: () => {},
      updateLayout: () => {},
      updateBrand: () => {},
      updateModule: () => {},
      applyPalette: () => {},
      toggleSection: () => {},
      moveSection: () => {},
      publishConfig: () => true,
      resetConfig: () => {},
      exportConfig: () => {},
      importConfig: () => true,
      updateTypeGarden: () => {},
      updateTypeGardenField: () => {},
      regenerateTypeGardenSeed: () => {},
      replayTypeGardenGrowth: () => {},
      exportTypeGardenJson: () => {},
      resetToDefault: () => {},
      savePreset: () => {},
      loadPreset: () => {},
    };
  }
  return ctx;
}

// Backwards-compatible hook export
export function useStoreTheme() {
  const ctx = useContext(StudioThemeContext);
  if (!ctx) {
    return {
      config: DEFAULT_STUDIO_CONFIG,
      updateModule: () => {},
      applyPalette: () => {},
      toggleSectionVisibility: () => {},
      moveSection: () => {},
      publishConfig: () => {},
      resetConfig: () => {},
      exportJson: () => {},
      importJson: () => {},
    };
  }
  return {
    ...ctx,
    config: ctx.legacyConfig || ctx.config,
    rawConfig: ctx.config,
  };
}
