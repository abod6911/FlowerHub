import { useMemo, useEffect, useCallback } from 'react';
import { THEME_TOKENS, DEFAULT_CUSTOMIZER_CONFIG, FONT_PRESETS } from '../data/mockData';

const STORAGE_KEY = 'flowerhub_customizer_config';

/**
 * Generates an exhaustive dictionary of CSS Custom Properties
 * from the active customizer configuration.
 *
 * @param {Object} activeConfig - The customizer configuration object
 * @returns {Record<string, string>} Key-value map of CSS custom properties
 */
export function generateThemeVariables(activeConfig = DEFAULT_CUSTOMIZER_CONFIG) {
  const presetId = activeConfig?.presetId || 'botanical';
  const basePreset = THEME_TOKENS[presetId] || THEME_TOKENS.botanical || {};
  const baseVariables = basePreset.variables || {};
  const manualOverrides = activeConfig?.overrides || {};

  // Find font definition
  const fontId = activeConfig?.typography?.activeFontId || 'alexandria';
  const fontDef = (FONT_PRESETS && FONT_PRESETS.find((f) => f.id === fontId)) || (FONT_PRESETS && FONT_PRESETS[0]) || {
    familyAr: "'Alexandria', sans-serif",
    familyEn: "'Cormorant Garamond', Georgia, serif",
  };

  // Calculate glass surface with opacity
  const glassActive = activeConfig?.layout?.glassmorphism ?? true;
  const rawSurface = manualOverrides['--surface-card'] || baseVariables['--surface-card'] || '#FFFFFF';
  
  // Format transparent glass surface
  let surfaceGlass = baseVariables['--surface-glass'];
  if (glassActive) {
    if (rawSurface.startsWith('#') && rawSurface.length === 7) {
      // 88% hex alpha is E0
      surfaceGlass = `${rawSurface}E0`;
    } else {
      surfaceGlass = `color-mix(in srgb, ${rawSurface} 88%, transparent)`;
    }
  } else {
    surfaceGlass = rawSurface;
  }

  // Motion physics
  const motionPreset = activeConfig?.motion?.preset || 'smooth';
  const easeTransition =
    motionPreset === 'snappy'
      ? 'cubic-bezier(0.4, 0, 0.2, 1)'
      : motionPreset === 'springy'
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.16, 1, 0.3, 1)';

  const animDuration =
    motionPreset === 'snappy' ? '0.18s' : motionPreset === 'springy' ? '0.4s' : '0.3s';

  const radiusUnit = manualOverrides['--radius-unit'] || baseVariables['--radius-unit'] || '16px';
  const radiusBtn = manualOverrides['--radius-btn'] || baseVariables['--radius-btn'] || '9999px';

  return {
    // 1. Core Color Variables
    '--bg-canvas': manualOverrides['--bg-canvas'] || baseVariables['--bg-canvas'] || '#FAF8F5',
    '--surface-card': rawSurface,
    '--surface-glass': surfaceGlass,
    '--accent-primary': manualOverrides['--accent-primary'] || baseVariables['--accent-primary'] || '#022C22',
    '--accent-gold': manualOverrides['--accent-gold'] || baseVariables['--accent-gold'] || '#D4AF37',
    '--text-main': manualOverrides['--text-main'] || baseVariables['--text-main'] || '#1C1917',
    '--text-muted': manualOverrides['--text-muted'] || baseVariables['--text-muted'] || '#78716C',
    '--border-subtle': manualOverrides['--border-subtle'] || baseVariables['--border-subtle'] || '#E7E5E4',

    // 2. Geometry & Depth
    '--radius-unit': radiusUnit,
    '--radius-btn': radiusBtn,
    '--radius-card': radiusUnit,
    '--glass-blur': glassActive ? activeConfig?.layout?.glassBlur || '12px' : '0px',

    // 3. Motion & Animation Timing
    '--ease-transition': easeTransition,
    '--anim-duration': animDuration,

    // 4. Typography
    '--font-family-ar': fontDef.familyAr,
    '--font-family-en': fontDef.familyEn,

    // 5. Backwards Compatibility Aliases
    '--canvas-bg': manualOverrides['--bg-canvas'] || baseVariables['--bg-canvas'] || '#FAF8F5',
    '--surface-bg': surfaceGlass,
    '--surface-border': manualOverrides['--border-subtle'] || baseVariables['--border-subtle'] || '#E7E5E4',
    '--text-primary': manualOverrides['--text-main'] || baseVariables['--text-main'] || '#1C1917',
    '--gold-accent': manualOverrides['--accent-gold'] || baseVariables['--accent-gold'] || '#D4AF37',
  };
}

/**
 * Injects CSS Custom Properties directly into the target DOM element
 * (or document.documentElement if no target provided).
 *
 * @param {Record<string, string>} variables - Map of CSS properties
 * @param {HTMLElement|null} targetElement - DOM element to apply variables to
 */
export function applyThemeToRoot(variables, targetElement = null) {
  if (typeof window === 'undefined' || !variables) return;
  const target = targetElement || document.documentElement;

  Object.entries(variables).forEach(([prop, val]) => {
    target.style.setProperty(prop, val);
  });
}

/**
 * React Hook for seamless, instantaneous theme injection and persistence.
 *
 * @param {Object} customizerConfig - Current customizer configuration state
 * @param {React.RefObject|null} targetRef - Optional Ref for scoped styling
 * @returns {{
 *   variables: Record<string, string>,
 *   inlineStyles: React.CSSProperties,
 *   saveConfig: () => boolean,
 *   resetConfig: () => Object,
 *   loadSavedConfig: () => Object
 * }}
 */
export function useApplyTheme(customizerConfig, targetRef = null) {
  // Generate CSS variables memoized
  const variables = useMemo(() => {
    return generateThemeVariables(customizerConfig);
  }, [customizerConfig]);

  // Apply variables directly to target element or documentElement
  useEffect(() => {
    const target = targetRef?.current || document.documentElement;
    applyThemeToRoot(variables, target);
  }, [variables, targetRef]);

  // Save current config to localStorage
  const saveConfig = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customizerConfig));
      return true;
    } catch {
      return false;
    }
  }, [customizerConfig]);

  // Reset to default configuration
  const resetConfig = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return DEFAULT_CUSTOMIZER_CONFIG;
  }, []);

  // Load saved config from localStorage helper
  const loadSavedConfig = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CUSTOMIZER_CONFIG;
  }, []);

  // Return generated object and inline style representation
  return {
    variables,
    inlineStyles: variables,
    saveConfig,
    resetConfig,
    loadSavedConfig,
  };
}

/**
 * Encodes the customizer configuration into a shareable URL
 * with compact Base64 URL parameter.
 *
 * @param {Object} config - Customizer configuration
 * @param {string} [baseUrl] - Base URL (defaults to window.location.href)
 * @returns {string} Sharable URL string
 */
export function exportThemeToUrl(config, baseUrl = '') {
  if (!config) return typeof window !== 'undefined' ? window.location.href : '';
  try {
    const url = new URL(baseUrl || (typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173/'));
    url.searchParams.delete('theme_data');
    url.searchParams.delete('theme_preset');

    const compact = {
      p: config.presetId,
      o: config.overrides,
      t: config.typography?.activeFontId,
      m: config.motion?.preset,
      ms: config.motion?.specialsSpeed,
      lh: config.layout?.heroStyle,
      ls: config.layout?.specialsStyle,
      lg: config.layout?.glassmorphism,
      lb: config.layout?.glassBlur,
    };

    const jsonStr = JSON.stringify(compact);
    // UTF-8 safe base64 encoding
    const base64 = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );

    url.searchParams.set('theme_data', base64);
    if (config.presetId) {
      url.searchParams.set('theme_preset', config.presetId);
    }
    return url.toString();
  } catch (err) {
    console.warn('Failed to export theme to URL:', err);
    return typeof window !== 'undefined' ? window.location.href : '';
  }
}

/**
 * Parses and restores customizer configuration from URL search params.
 *
 * @param {string} [urlString] - Optional search query string or URL
 * @returns {Object|null} Restored customizer config or null
 */
export function importThemeFromUrl(urlString = '') {
  if (typeof window === 'undefined') return null;
  try {
    const query = urlString || window.location.search;
    if (!query || query.length < 2) return null;

    const params = new URLSearchParams(query);
    const themeData = params.get('theme_data');

    if (themeData) {
      // UTF-8 safe base64 decoding
      const jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(atob(themeData), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const compact = JSON.parse(jsonStr);

      if (compact && typeof compact === 'object') {
        const presetId = compact.p || params.get('theme_preset') || 'botanical';
        const basePreset = THEME_TOKENS[presetId] || THEME_TOKENS.botanical;

        const fontId = compact.t || 'alexandria';
        const fontDef = FONT_PRESETS.find((f) => f.id === fontId) || FONT_PRESETS[0];

        return {
          presetId,
          overrides: compact.o || basePreset.variables || {},
          typography: {
            activeFontId: fontId,
            fontAr: fontDef.familyAr,
            fontEn: fontDef.familyEn,
          },
          motion: {
            preset: compact.m || 'smooth',
            duration: compact.m === 'snappy' ? '0.18s' : compact.m === 'springy' ? '0.4s' : '0.3s',
            specialsSpeed: compact.ms || 28,
            confettiEnabled: true,
            confettiCount: 40,
          },
          layout: {
            heroStyle: compact.lh || 'qlub',
            specialsStyle: compact.ls || 'marquee',
            glassmorphism: compact.lg ?? true,
            glassBlur: compact.lb || '12px',
          },
        };
      }
    } else {
      // Fallback: check simple theme_preset query param
      const presetOnly = params.get('theme_preset');
      if (presetOnly && THEME_TOKENS[presetOnly]) {
        return {
          ...DEFAULT_CUSTOMIZER_CONFIG,
          presetId: presetOnly,
          overrides: THEME_TOKENS[presetOnly].variables || {},
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse theme from URL:', err);
  }
  return null;
}

/**
 * Generates formatted standalone CSS variables stylesheet (:root).
 *
 * @param {Object} config - Customizer configuration
 * @returns {string} Formatted CSS string
 */
export function generateThemeCssFile(config = DEFAULT_CUSTOMIZER_CONFIG) {
  const vars = generateThemeVariables(config);
  const presetName = (config?.presetId || 'BOTANICAL').toUpperCase();
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines = [
    `/**`,
    ` * Flowerhub - Luxury Florist Design Tokens`,
    ` * Preset: ${presetName}`,
    ` * Generated: ${dateStr}`,
    ` * Usage: Import this file into index.css or include in your HTML <head>`,
    ` */`,
    ``,
    `:root {`,
  ];

  Object.entries(vars).forEach(([key, val]) => {
    lines.push(`  ${key}: ${val};`);
  });

  lines.push(`}`);
  lines.push(``);
  return lines.join('\n');
}
