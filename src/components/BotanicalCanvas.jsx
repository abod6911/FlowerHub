import React from 'react';
import TypeGardenCanvas from './TypeGardenCanvas';
import { useStudioStore, DEFAULT_TYPE_GARDEN_CONFIG } from '../context/StudioThemeContext';

/**
 * BotanicalCanvas (Legacy Adapter to Generative TypeGardenCanvas)
 * Replaces old fixed SVG roses with the living procedural Type Garden Arabic Engine.
 */
export function BotanicalCanvas({
  text,
  isDark = false,
  textColor,
  stemColor,
  roseColor,
  className = '',
  style = {},
}) {
  let storeCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeCtx = useStudioStore();
  } catch {
    // fallback outside provider
  }

  const tg = storeCtx?.typeGarden || DEFAULT_TYPE_GARDEN_CONFIG;

  return (
    <TypeGardenCanvas
      text={text || tg.text || 'دار الورد للمناسبات'}
      species={tg.flowerSpecies || 'royal_rose'}
      density={tg.density ?? 65}
      growthSpeed={tg.growthSpeed ?? 1.0}
      windSway={tg.windSway ?? 1.0}
      branchReach={tg.branchReach ?? 55}
      stemColor={stemColor || tg.stemColor || '#1B3B2B'}
      petalColor={roseColor || tg.petalColor || '#9B1B36'}
      seed={tg.seed || 48271}
      replayKey={tg.replayKey || 0}
      interactive={true}
      textColor={textColor}
      isDark={isDark}
      className={className}
      style={style}
    />
  );
}

export default BotanicalCanvas;
