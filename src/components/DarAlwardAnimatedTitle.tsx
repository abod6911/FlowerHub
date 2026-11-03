import React from 'react';
import { BotanicalBrandConfig } from '../types/botanical';
import StorefrontBrandHeader from './StorefrontBrandHeader';

export interface DarAlwardAnimatedTitleProps {
  /** Unified configuration object from Admin Studio Sync */
  config?: BotanicalBrandConfig;
  /** Arabic text to display (defaults to config.text or 'دار الورد للمناسبات') */
  text?: string;
  /** Primary Royal Burgundy color override */
  burgundyColor?: string;
  /** Deep olive/sage green color override for stems & leaves */
  stemColor?: string;
  /** Typography color override */
  textColor?: string;
  /** Additional CSS class for outer container */
  className?: string;
  /** Force dark mode contrast */
  isDark?: boolean;
  /** Enable subtle wind sway and hover breathing (default: true) */
  animated?: boolean;
}

/**
 * DarAlwardAnimatedTitle
 * Forwarding alias to StorefrontBrandHeader and BotanicalCoreEngine
 * Guarantees 100% WYSIWYG coordinate-locking with the Admin Studio (800x240 viewBox)
 */
export const DarAlwardAnimatedTitle: React.FC<DarAlwardAnimatedTitleProps> = ({
  config,
  text,
  textColor,
  isDark = false,
  className = '',
}) => {
  return (
    <StorefrontBrandHeader
      config={config}
      text={text}
      textColor={textColor}
      isDark={isDark}
      className={className}
    />
  );
};

export default DarAlwardAnimatedTitle;
