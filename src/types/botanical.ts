/**
 * Shared Botanical Brand Configuration Schema & Synchronization Types
 * Connects the Admin Botanical Typography Studio to the Customer Storefront Header Card.
 */

export interface BotanicalBrandConfig {
  /** Display text for the store header (e.g. "دار الورد للمناسبات") */
  text: string;
  /** Primary typography font family */
  fontFamily: string; // 'Amiri' | 'Aref Ruqaa' | 'Playfair Display' | 'Noto Naskh Arabic'
  /** Color palette identifier */
  paletteId: string; // 'rosaNoir' | 'paper' | 'midnight' | 'citrus' | 'moss' | 'butter'
  /** 60fps physics motion mode */
  motionMode: string; // 'gust' | 'reach' | 'breathe' | 'grow' | 'visitor'
  /** Deterministic PRNG seed for exact flower/vine placement reproduction */
  seed: number;
  /** Botanical density level */
  density: 'light' | 'balanced' | 'dense';
  /** Overall relative scale factor (0.8 to 1.2) */
  scale: number;
  /** Unix timestamp of last publish / update */
  updatedAt: number;
}

export const DAR_ALWARD_STORAGE_KEY = 'dar_alward_brand_config';
export const BOTANICAL_STORAGE_KEY = 'flowerhub_botanical_brand_config';
export const STOREFRONT_SYNC_EVENT = 'storefront_config_synced';

export const DEFAULT_BOTANICAL_BRAND_CONFIG: BotanicalBrandConfig = {
  text: 'دار الورد للمناسبات',
  fontFamily: 'Amiri',
  paletteId: 'rosaNoir',
  motionMode: 'gust',
  seed: 48271,
  density: 'balanced',
  scale: 1.0,
  updatedAt: 1730560000000,
};

/**
 * Loads the active published botanical configuration from localStorage
 * with graceful fallback to DEFAULT_BOTANICAL_BRAND_CONFIG.
 * Checks 'dar_alward_brand_config' first, then 'flowerhub_botanical_brand_config'.
 */
export function loadBotanicalBrandConfig(): BotanicalBrandConfig {
  if (typeof window === 'undefined') return DEFAULT_BOTANICAL_BRAND_CONFIG;
  try {
    const saved =
      localStorage.getItem(DAR_ALWARD_STORAGE_KEY) ||
      localStorage.getItem(BOTANICAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_BOTANICAL_BRAND_CONFIG,
          ...parsed,
          updatedAt: Number(parsed.updatedAt) || Date.now(),
        };
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_BOTANICAL_BRAND_CONFIG;
}

/**
 * Persists the botanical configuration to localStorage and dispatches
 * the 'storefront_config_synced' event for real-time WYSIWYG re-rendering.
 */
export function saveBotanicalBrandConfig(config: BotanicalBrandConfig): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = JSON.stringify({ ...config, updatedAt: Date.now() });
    localStorage.setItem(DAR_ALWARD_STORAGE_KEY, serialized);
    localStorage.setItem(BOTANICAL_STORAGE_KEY, serialized);

    // Dispatch synchronous CustomEvent across components in the current window
    window.dispatchEvent(
      new CustomEvent(STOREFRONT_SYNC_EVENT, { detail: { ...config, updatedAt: Date.now() } })
    );
    return true;
  } catch {
    return false;
  }
}
