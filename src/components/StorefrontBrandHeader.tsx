import React, { useState, useEffect } from 'react';
import {
  BotanicalBrandConfig,
  loadBotanicalBrandConfig,
  STOREFRONT_SYNC_EVENT,
  DAR_ALWARD_STORAGE_KEY,
  BOTANICAL_STORAGE_KEY,
} from '../types/botanical';
import BotanicalCanvas from './BotanicalCanvas';

export interface StorefrontBrandHeaderProps {
  /** Optional static config passed directly by parent */
  config?: BotanicalBrandConfig;
  /** Force dark or light mode */
  isDark?: boolean;
  /** Text color override */
  textColor?: string;
  /** Text string override */
  text?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * StorefrontBrandHeader
 * Responsive Mobile Storefront Header Container
 * Subscribes to the real-time 'storefront_config_synced' event for instant WYSIWYG re-rendering.
 * Embeds <BotanicalCanvas /> with w-full max-w-[580px] mx-auto aspect-[650/160]
 */
export const StorefrontBrandHeader: React.FC<StorefrontBrandHeaderProps> = ({
  config: propConfig,
  isDark = false,
  textColor,
  text,
  className = '',
}) => {
  const [syncedConfig, setSyncedConfig] = useState<BotanicalBrandConfig>(loadBotanicalBrandConfig);

  // Real-time Event Listener for Instant Admin Studio-to-Storefront Sync
  useEffect(() => {
    const handleSyncEvent = (e: Event) => {
      const customEvent = e as CustomEvent<BotanicalBrandConfig>;
      if (customEvent.detail) {
        setSyncedConfig(customEvent.detail);
      } else {
        setSyncedConfig(loadBotanicalBrandConfig());
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === DAR_ALWARD_STORAGE_KEY || e.key === BOTANICAL_STORAGE_KEY) {
        setSyncedConfig(loadBotanicalBrandConfig());
      }
    };

    window.addEventListener(STOREFRONT_SYNC_EVENT, handleSyncEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(STOREFRONT_SYNC_EVENT, handleSyncEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const activeConfig = propConfig || syncedConfig;
  const displayText = text || activeConfig.text || 'دار الورد للمناسبات';

  return (
    <div className={`w-full max-w-[580px] mx-auto aspect-[650/160] flex items-center justify-center overflow-visible ${className}`}>
      <BotanicalCanvas
        text={displayText}
        isDark={isDark}
        textColor={textColor}
        className="w-full h-full"
      />
    </div>
  );
};

export default StorefrontBrandHeader;
