import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { LUXURY_PALETTES, CURATED_THEME_PRESETS } from '../types/storeThemeConfig';
import { saveBotanicalBrandConfig } from '../types/botanical';

export const STUDIO_STORAGE_KEY = 'flowerhub_studio_theme_config';
export const STUDIO_SYNC_EVENT = 'studio_theme_synced';

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

  // Identity & Badges
  statusText: 'مفتوح الآن • التجهيز خلال ٢٠ دقيقة',
  statusPulse: true,
  rating: '٤.٩ (٨٥٠+ تقييم)',
  avatarText: 'د.و',
  locationLabel: 'الرياض • التوصيل لكافة الأحياء',
  phone: '966500000000',

  // Layout & Cards (Tab: البطاقات والأقسام)
  presetId: 'royal_rose',
  cardLayout: 'grid_compact', // 'grid_compact' | 'grid_large' | 'list_classic'
  specialsStyle: 'marquee', // 'marquee' | 'carousel_manual' | 'coverflow'
  ambientEffect: 'petals', // 'petals' | 'gold_stardust' | 'warm_glow' | 'none'
  gridLayout: 'bento', // legacy
  cardBorderRadius: 22, // 0 to 28px
  cardShadow: 'soft', // 'none' | 'soft' | 'medium' | 'high'
  buyButtonStyle: 'pill_add', // 'circle_plus' | 'pill_add' | 'full_width'
  fullTitleWrap: true,
  showBadges: true,
  badgeStyle: 'glassmorphic', // 'glassmorphic' | 'solid_pastel'
  showFavoriteButton: true,

  // Motion & Physics (Tab: الحركة والفيزياء)
  cardEntranceMotion: 'fade_up', // 'fade_up' | 'elastic_scale' | 'slide' | 'none'
  staggerDelay: 0.08, // 0.02s to 0.25s
  buyButtonPhysics: 'morph_checkmark', // 'morph_checkmark' | 'ripple_wave' | 'fly_to_cart'
  cardHoverEffect: 'zoom_soft', // 'zoom_soft' | 'tilt_3d' | 'gold_glow'
  floatingPetalsEnabled: true,
  petalsCount: 14,
  petalsOpacity: 0.6,

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
        ...(parsed.colors || {}),
      },
      typography: {
        ...DEFAULT_STUDIO_CONFIG.typography,
        ...(parsed.typography || {}),
      },
      sections: parsed.sections && parsed.sections.length > 0 ? parsed.sections : DEFAULT_STUDIO_CONFIG.sections,
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
      if (e?.detail) {
        setConfig((prev) => ({ ...prev, ...e.detail }));
      } else {
        setConfig(loadStoredStudioConfig());
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
    const { colors, typography, cardBorderRadius } = config;

    if (colors) {
      root.style.setProperty('--accent-primary', colors.primary);
      root.style.setProperty('--accent-gold', colors.secondary);
      root.style.setProperty('--bg-canvas', colors.canvasBg);
      root.style.setProperty('--surface-card', colors.cardSurface);
      root.style.setProperty('--text-main', colors.textMain);
      root.style.setProperty('--text-muted', colors.textMuted);
      root.style.setProperty('--color-price', colors.priceColor || colors.primary);
      root.style.setProperty('--pill-inactive-bg', colors.sandPill || '#F5F5F4');
      root.style.setProperty('--border-subtle', colors.borderSubtle || '#E7E5E4');
    }

    if (typography) {
      root.style.setProperty('--font-header', `'${typography.headerFont}', serif`);
      root.style.setProperty('--font-catalog', `'${typography.catalogFont}', 'Cairo', sans-serif`);
      root.style.setProperty('--base-font-size', `${typography.baseFontSize}px`);
      root.style.setProperty('--heading-scale', `${typography.headingScale}`);
      root.style.setProperty('--body-line-height', `${typography.lineHeight}`);
    }

    root.style.setProperty('--radius-card', `${cardBorderRadius}px`);
    root.style.setProperty('--radius-unit', `${cardBorderRadius}px`);
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
    setConfig((prev) => {
      const next = {
        ...prev,
        paletteId,
        botanicalPalette: paletteId,
        colors: pal,
        hasUnsavedChanges: false,
      };
      try {
        localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // One-click Curated Preset Switcher (Applying full visual world)
  const applyPreset = useCallback((presetId) => {
    const preset = CURATED_THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const pal = LUXURY_PALETTES[preset.paletteId] || LUXURY_PALETTES.royalBurgundy;

    setConfig((prev) => {
      const next = {
        ...prev,
        presetId: preset.id,
        paletteId: preset.paletteId,
        botanicalPalette: preset.paletteId,
        colors: pal,
        cardLayout: preset.cardLayout,
        specialsStyle: preset.specialsStyle,
        ambientEffect: preset.ambientEffect,
        cardBorderRadius: preset.cardRadius,
        typography: {
          ...prev.typography,
          headerFont: preset.headerFont,
          catalogFont: preset.catalogFont,
        },
        hasUnsavedChanges: false,
      };
      try {
        localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(STUDIO_SYNC_EVENT, { detail: next }));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Sections manager
  const toggleSection = useCallback((sectionId) => {
    setConfig((prev) => ({
      ...prev,
      hasUnsavedChanges: true,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      ),
    }));
  }, []);

  const moveSection = useCallback((index, direction) => {
    setConfig((prev) => {
      const items = [...prev.sections];
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
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(config));
      // Backwards sync with botanical brand config
      saveBotanicalBrandConfig({
        text: config.storeName,
        fontFamily: config.typography?.headerFont || 'Amiri',
        paletteId: config.botanicalPalette || 'royalBurgundy',
        motionMode: config.botanicalMotion || 'gust',
        density: config.botanicalDensity || 'balanced',
        seed: config.botanicalSeed || 48271,
        scale: 1.0,
        bloomSize: config.bloomSize || 52,
        stemThickness: config.stemThickness || 1.8,
        safeZoneOffset: config.safeZoneOffset || 0,
        animationSpeed: config.animationSpeed || 1.0,
        swayIntensity: config.swayIntensity || 4,
        botanicalEnabled: config.botanicalEnabled !== false,
      });

      setConfig((prev) => ({ ...prev, hasUnsavedChanges: false }));

      window.dispatchEvent(
        new CustomEvent(STUDIO_SYNC_EVENT, { detail: config })
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
      applyPreset,
      presets: CURATED_THEME_PRESETS,
      palettes: LUXURY_PALETTES,
      toggleSection,
      moveSection,
      publishConfig,
      resetConfig,
      exportConfig,
      importConfig,
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
      applyPreset,
      toggleSection,
      moveSection,
      publishConfig,
      resetConfig,
      exportConfig,
      importConfig,
    ]
  );

  return <StudioThemeContext.Provider value={value}>{children}</StudioThemeContext.Provider>;
}

export function useStudioStore() {
  const ctx = useContext(StudioThemeContext);
  if (!ctx) {
    throw new Error('useStudioStore must be used within a StudioThemeProvider');
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
