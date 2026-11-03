import {
  DEFAULT_STORE_THEME_CONFIG,
  STORE_THEME_STORAGE_KEY,
  STORE_THEME_SYNC_EVENT,
} from '../types/storeThemeConfig';

export function loadStoredThemeConfig() {
  if (typeof window === 'undefined') return DEFAULT_STORE_THEME_CONFIG;
  try {
    const raw = localStorage.getItem(STORE_THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_STORE_THEME_CONFIG,
          ...parsed,
          brand: { ...DEFAULT_STORE_THEME_CONFIG.brand, ...(parsed.brand || {}) },
          colors: { ...DEFAULT_STORE_THEME_CONFIG.colors, ...(parsed.colors || {}) },
          typography: { ...DEFAULT_STORE_THEME_CONFIG.typography, ...(parsed.typography || {}) },
          animations: { ...DEFAULT_STORE_THEME_CONFIG.animations, ...(parsed.animations || {}) },
          catalog: { ...DEFAULT_STORE_THEME_CONFIG.catalog, ...(parsed.catalog || {}) },
          sections: Array.isArray(parsed.sections) ? parsed.sections : DEFAULT_STORE_THEME_CONFIG.sections,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored store theme config:', err);
  }
  return DEFAULT_STORE_THEME_CONFIG;
}

export function saveStoredThemeConfig(config) {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = JSON.stringify({ ...config, updatedAt: Date.now() });
    localStorage.setItem(STORE_THEME_STORAGE_KEY, serialized);
    window.dispatchEvent(
      new CustomEvent(STORE_THEME_SYNC_EVENT, { detail: { ...config, updatedAt: Date.now() } })
    );
    return true;
  } catch {
    return false;
  }
}
