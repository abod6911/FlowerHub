import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { BotanicalBrandConfig, DEFAULT_BOTANICAL_BRAND_CONFIG } from '../types/botanical';

export interface BotanicalCoreEngineProps {
  /** Unified configuration object (Single Source of Truth) */
  config?: BotanicalBrandConfig;
  /** Explicit text override if needed */
  text?: string;
  /** Force dark or light mode contrast */
  isDark?: boolean;
  /** Primary text color override (defaults to Obsidian Charcoal #111827 in light mode, Crisp White #F9FAFB in dark mode) */
  textColor?: string;
  /** Additional CSS class for responsive container */
  className?: string;
  /** Enable mouse reach interactivity */
  interactive?: boolean;
  /** Enable 60fps ambient physics loop (default: true) */
  animated?: boolean;
}

// 6 Curated Palettes
const PALETTES: Record<
  string,
  {
    petals: string;
    petalsMid: string;
    petalsDark: string;
    stems: string;
    leafLight: string;
    leafDark: string;
    textDark: string;
    textLight: string;
    lineDark: string;
    lineLight: string;
    accent: string;
  }
> = {
  rosaNoir: {
    petals: '#7E1529',
    petalsMid: '#9E1A34',
    petalsDark: '#4A0B17',
    stems: '#234233',
    leafLight: '#2F5E48',
    leafDark: '#163628',
    textDark: '#111827',
    textLight: '#F9FAFB',
    lineDark: '#4A0B17',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#BE123C',
  },
  paper: {
    petals: '#C92A2C',
    petalsMid: '#DF3B3E',
    petalsDark: '#7A1618',
    stems: '#2A4736',
    leafLight: '#3B634C',
    leafDark: '#1B3325',
    textDark: '#18181B',
    textLight: '#F7F4EE',
    lineDark: '#7A1618',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#BA2D2F',
  },
  midnight: {
    petals: '#6366F1',
    petalsMid: '#818CF8',
    petalsDark: '#312E81',
    stems: '#1E3A8A',
    leafLight: '#2563EB',
    leafDark: '#172554',
    textDark: '#0F172A',
    textLight: '#F1F5F9',
    lineDark: '#1E1B4B',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#818CF8',
  },
  citrus: {
    petals: '#D97706',
    petalsMid: '#F59E0B',
    petalsDark: '#78350F',
    stems: '#365314',
    leafLight: '#4D7C0F',
    leafDark: '#1A2E05',
    textDark: '#18181B',
    textLight: '#FEF3C7',
    lineDark: '#78350F',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#F59E0B',
  },
  moss: {
    petals: '#DB2777',
    petalsMid: '#F472B6',
    petalsDark: '#831843',
    stems: '#14532D',
    leafLight: '#166534',
    leafDark: '#052E16',
    textDark: '#18181B',
    textLight: '#FCE7F3',
    lineDark: '#831843',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#F472B6',
  },
  butter: {
    petals: '#E11D48',
    petalsMid: '#F43F5E',
    petalsDark: '#881337',
    stems: '#3F6212',
    leafLight: '#65A30D',
    leafDark: '#1A2E05',
    textDark: '#1C1917',
    textLight: '#FFF1F2',
    lineDark: '#881337',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#E11D48',
  },
  royalBurgundy: {
    petals: '#7E1529',
    petalsMid: '#BE123C',
    petalsDark: '#4C0519',
    stems: '#1A3326',
    leafLight: '#2C5A42',
    leafDark: '#12261C',
    textDark: '#111827',
    textLight: '#F9FAFB',
    lineDark: '#4C0519',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#BE123C',
  },
  deepForest: {
    petals: '#BE123C',
    petalsMid: '#E11D48',
    petalsDark: '#881337',
    stems: '#123524',
    leafLight: '#1B4D35',
    leafDark: '#0C2419',
    textDark: '#111827',
    textLight: '#F9FAFB',
    lineDark: '#881337',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#10B981',
  },
  velvetBlush: {
    petals: '#9D174D',
    petalsMid: '#BE185D',
    petalsDark: '#700B34',
    stems: '#2D3748',
    leafLight: '#4A5568',
    leafDark: '#1A202C',
    textDark: '#111827',
    textLight: '#FFF1F2',
    lineDark: '#700B34',
    lineLight: 'rgba(255, 255, 255, 0.45)',
    accent: '#F472B6',
  },
};

PALETTES['rosa-noir'] = PALETTES.rosaNoir;
PALETTES['royal-burgundy'] = PALETTES.royalBurgundy;
PALETTES['deep-forest'] = PALETTES.deepForest;
PALETTES['velvet-blush'] = PALETTES.velvetBlush;

// Deterministic Mulberry32 PRNG
function mulberry32(seed: number) {
  let s = Math.floor(Math.abs(seed)) + 1;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Soft Rounded Scallop Petal Generator
 * STRICTLY BANS sharp triangular tips / poinsettia spikes.
 * Generates wide, rounded, overlapping cup lobes with smooth continuous dome apexes.
 */
function buildSoftRoundPetal(angle: number, len: number, width: number): string {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const perpX = -sinA;
  const perpY = cosA;

  // Narrow base near rose core
  const b1x = -perpX * (width * 0.18);
  const b1y = -perpY * (width * 0.18);
  const b2x = perpX * (width * 0.18);
  const b2y = perpY * (width * 0.18);

  // Maximum lateral swell at ~50% of petal length
  const midLen = len * 0.52;
  const halfW = width * 0.55;
  const s1x = cosA * midLen - perpX * halfW;
  const s1y = sinA * midLen - perpY * halfW;
  const s2x = cosA * midLen + perpX * halfW;
  const s2y = sinA * midLen + perpY * halfW;

  // Rounded circular dome top (Crest)
  const tipX = cosA * len;
  const tipY = sinA * len;
  const c1x = tipX - perpX * (halfW * 0.65);
  const c1y = tipY - perpY * (halfW * 0.65);
  const c2x = tipX + perpX * (halfW * 0.65);
  const c2y = tipY + perpY * (halfW * 0.65);

  // Broad, circular dome without sharp pointed corners
  return `M ${b1x.toFixed(1)} ${b1y.toFixed(1)} C ${b1x + cosA * (len * 0.2) - perpX * (halfW * 0.4)} ${b1y + sinA * (len * 0.2) - perpY * (halfW * 0.4)}, ${s1x - cosA * (len * 0.1)} ${s1y - sinA * (len * 0.1)}, ${s1x.toFixed(1)} ${s1y.toFixed(1)} C ${s1x + cosA * (len * 0.35)} ${s1y + sinA * (len * 0.35)}, ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${tipX.toFixed(1)} ${tipY.toFixed(1)} C ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${s2x + cosA * (len * 0.35)} ${s2y + sinA * (len * 0.35)}, ${s2x.toFixed(1)} ${s2y.toFixed(1)} C ${s2x - cosA * (len * 0.1)} ${s2y - sinA * (len * 0.1)}, ${b2x + cosA * (len * 0.2) + perpX * (halfW * 0.4)} ${b2y + sinA * (len * 0.2) + perpY * (halfW * 0.4)}, ${b2x.toFixed(1)} ${b2y.toFixed(1)} Z`;
}

/**
 * Classic Velvet Garden Rose / Camellia Model
 * Diameter scaled down to 38px - 52px so flowers frame the typography rather than overpowering it.
 */
function createGardenRoseModel(radius: number, seed: number) {
  const rng = mulberry32(seed);
  const baseOffset = rng() * Math.PI * 2;

  // Layer 1: Outer Ring (5 broad overlapping rounded lobes)
  const outerPetals: string[] = [];
  const numOuter = 5;
  const outerStep = (Math.PI * 2) / numOuter;
  for (let i = 0; i < numOuter; i++) {
    const angle = baseOffset + i * outerStep + (rng() - 0.5) * 0.12;
    const len = radius * (0.92 + rng() * 0.14);
    const width = radius * (0.82 + rng() * 0.12);
    outerPetals.push(buildSoftRoundPetal(angle, len, width));
  }

  // Layer 2: Mid Cup (4 slightly smaller rounded lobes rotated by ~36 deg)
  const midPetals: string[] = [];
  const numMid = 4;
  const midStep = (Math.PI * 2) / numMid;
  const midOffset = baseOffset + Math.PI / 5 + (rng() - 0.5) * 0.1;
  for (let i = 0; i < numMid; i++) {
    const angle = midOffset + i * midStep + (rng() - 0.5) * 0.1;
    const len = radius * (0.68 + rng() * 0.1);
    const width = radius * (0.65 + rng() * 0.08);
    midPetals.push(buildSoftRoundPetal(angle, len, width));
  }

  // Layer 3: Delicate nested C-shaped swirling contour folds mimicking rose heart
  const innerFolds: string[] = [];
  const rCore = radius * 0.38;
  const rot = baseOffset + (rng() - 0.5) * 0.5;

  // Swirl 1
  const p1x = Math.cos(rot) * rCore * 1.1;
  const p1y = Math.sin(rot) * rCore * 1.1;
  const p2x = Math.cos(rot + 2.2) * rCore * 0.9;
  const p2y = Math.sin(rot + 2.2) * rCore * 0.9;
  const cp1x = Math.cos(rot + 1.1) * rCore * 1.45;
  const cp1y = Math.sin(rot + 1.1) * rCore * 1.45;
  innerFolds.push(`M ${p1x.toFixed(1)} ${p1y.toFixed(1)} Q ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`);

  // Swirl 2
  const q1x = Math.cos(rot + 2.8) * rCore * 0.85;
  const q1y = Math.sin(rot + 2.8) * rCore * 0.85;
  const q2x = Math.cos(rot + 4.9) * rCore * 0.65;
  const q2y = Math.sin(rot + 4.9) * rCore * 0.65;
  const cpaX = Math.cos(rot + 3.8) * rCore * 1.2;
  const cpaY = Math.sin(rot + 3.8) * rCore * 1.2;
  innerFolds.push(`M ${q1x.toFixed(1)} ${q1y.toFixed(1)} Q ${cpaX.toFixed(1)} ${cpaY.toFixed(1)} ${q2x.toFixed(1)} ${q2y.toFixed(1)}`);

  // Swirl 3 (Center spiral)
  const h1x = Math.cos(rot + 5.2) * rCore * 0.55;
  const h1y = Math.sin(rot + 5.2) * rCore * 0.55;
  const h2x = Math.cos(rot + 1.0) * rCore * 0.32;
  const h2y = Math.sin(rot + 1.0) * rCore * 0.32;
  const hcpX = Math.cos(rot + 0.1) * rCore * 0.72;
  const hcpY = Math.sin(rot + 0.1) * rCore * 0.72;
  innerFolds.push(`M ${h1x.toFixed(1)} ${h1y.toFixed(1)} Q ${hcpX.toFixed(1)} ${hcpY.toFixed(1)} ${h2x.toFixed(1)} ${h2y.toFixed(1)}`);

  return { outerPetals, midPetals, innerFolds };
}

// Delicate Compound 3-Leaf Cluster
function createLeafClusterPath(): { leafCenter: string; leafLeft: string; leafRight: string; vein: string } {
  const leafCenter = 'M 0 0 C -4 -8, -5 -18, 0 -24 C 5 -18, 4 -8, 0 0 Z';
  const leafLeft = 'M -2 -6 C -8 -9, -15 -12, -17 -18 C -13 -18, -6 -14, -2 -6 Z';
  const leafRight = 'M 2 -6 C 8 -9, 15 -12, 17 -18 C 13 -18, 6 -14, 2 -6 Z';
  const vein = 'M 0 -2 L 0 -20 M -2 -10 L -12 -14 M 2 -10 L 12 -14';
  return { leafCenter, leafLeft, leafRight, vein };
}

// Hairline Tendril Curl
function createHairlineTendrilPath(dir = 1): string {
  const d = dir > 0 ? 1 : -1;
  return `M 0 0 C ${7 * d} -4, ${13 * d} -10, ${11 * d} -18 C ${9 * d} -24, ${1 * d} -26, ${-2 * d} -21 C ${-5 * d} -16, ${-2 * d} -10, ${3 * d} -12 C ${7 * d} -13, ${6 * d} -18, ${3 * d} -18`;
}

/**
 * BotanicalCoreEngine
 * The Unified, Coordinate-Locked SVG Renderer (Single Source of Truth)
 * Locked Virtual Coordinate Space: 800 x 220
 * Strict Typography Dominance: Font size 72px, Safe-Zone Y: 90 to 155 with ZERO flower occlusion.
 */
export const BotanicalCoreEngine: React.FC<BotanicalCoreEngineProps> = ({
  config,
  text: textOverride,
  isDark = false,
  textColor,
  className = '',
  interactive = true,
  animated = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mousePosRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999 });

  const activeConfig = config || DEFAULT_BOTANICAL_BRAND_CONFIG;
  const cfgAny = activeConfig as any;
  const activeText = textOverride || activeConfig.text || 'دار الورد للمناسبات';
  const activePaletteId = activeConfig.paletteId || 'rosaNoir';
  const activeMotionMode = activeConfig.motionMode || 'gust';
  const activeSeed = activeConfig.seed ?? 48271;
  const activeDensity = activeConfig.density || 'balanced';
  const activeScale = activeConfig.scale ?? 1.0;

  // No-Code Studio Advanced Sliders & Toggles
  const botanicalEnabled =
    cfgAny.enabled !== undefined
      ? Boolean(cfgAny.enabled)
      : cfgAny.botanical?.enabled !== undefined
      ? Boolean(cfgAny.botanical.enabled)
      : true;

  const rawBloomSize =
    cfgAny.bloomSize ?? cfgAny.botanical?.bloomSize ?? 52;
  const bloomScaleFactor = Math.max(0.55, Math.min(1.7, Number(rawBloomSize) / 52));

  const stemThickness =
    cfgAny.stemThickness ?? cfgAny.botanical?.stemThickness ?? 1.8;

  const safeZoneOffset =
    cfgAny.safeZoneOffset ?? cfgAny.botanical?.safeZoneOffset ?? 0;

  const animationSpeed =
    cfgAny.animationSpeed ?? cfgAny.botanical?.animationSpeed ?? 1.0;

  const swayIntensity =
    cfgAny.swayIntensity ?? cfgAny.botanical?.swayIntensity ?? 4;

  const palette = PALETTES[activePaletteId] || PALETTES.rosaNoir;

  // Maximum typography contrast: Deep Obsidian Velvet Charcoal (#111827) on light surfaces, Crisp White (#F9FAFB) on dark
  const resolvedTextColor =
    textColor ||
    (isDark ? palette.textLight : palette.textDark);

  const resolvedLineArtColor = isDark ? palette.lineLight : palette.lineDark;

  // Arabic Display Serif Font with Header font selector support
  const chosenFont = activeConfig.fontFamily || cfgAny.headerFont || 'Amiri';
  const fontCss = `'${chosenFont}', 'Aref Ruqaa', 'Amiri', 'Readex Pro', serif`;

  // Massive, bold font scale spanning ~75% of the 800px viewBox
  const fontSize = 72;

  // ============================================================================
  // AUTHENTIC TYPE-GARDEN BOTANICAL ARCHITECTURE (NO DETACHED WIRE / GARLAND)
  // Lush velvet roses nested behind typography, organic S-vines weaving ascenders
  // ============================================================================
  const layout = useMemo(() => {
    const rng = mulberry32(activeSeed);

    // LUSH VELVET GARDEN ROSES (32px to 46px radius)
    // Sits directly behind typography letters (<g id="bg-flora">) for authentic Type-Garden nesting
    const blooms = [
      // 1. Centerpiece Rose: Nested behind the Lam-Alif of "الورد"
      {
        id: 'rose-ward',
        cx: 438 + (rng() - 0.5) * 8,
        cy: 108 + (rng() - 0.5) * 4 - safeZoneOffset,
        radius: Math.round(36 * bloomScaleFactor),
        angle: 4,
        seed: activeSeed + 222,
      },
      // 2. Right Crown Rose: Nested behind the Alif of "دار"
      {
        id: 'rose-dar',
        cx: 585 + (rng() - 0.5) * 8,
        cy: 104 + (rng() - 0.5) * 4 - safeZoneOffset,
        radius: Math.round(30 * bloomScaleFactor),
        angle: 8,
        seed: activeSeed + 111,
      },
      // 3. Left Center Rose: Nested behind the Lam-Lam of "للمناسبات"
      {
        id: 'rose-muna',
        cx: 295 + (rng() - 0.5) * 8,
        cy: 106 + (rng() - 0.5) * 4 - safeZoneOffset,
        radius: Math.round(32 * bloomScaleFactor),
        angle: -6,
        seed: activeSeed + 333,
      },
      // 4. Companion Bloom: Nestled near the terminal flourish of "للمناسبات"
      {
        id: 'rose-flank',
        cx: 195 + (rng() - 0.5) * 6,
        cy: 114 + (rng() - 0.5) * 4 - safeZoneOffset,
        radius: Math.round(25 * bloomScaleFactor),
        angle: -12,
        seed: activeSeed + 444,
      },
    ];

    // Optional 5th companion bloom if density is 'dense' (between "دار" and "الورد")
    if (activeDensity === 'dense') {
      blooms.push({
        id: 'rose-accent',
        cx: 512 + (rng() - 0.5) * 6,
        cy: 102 + (rng() - 0.5) * 4 - safeZoneOffset,
        radius: Math.round(24 * bloomScaleFactor),
        angle: -2,
        seed: activeSeed + 555,
      });
    }

    const roses = blooms.map((b) => ({
      ...b,
      model: createGardenRoseModel(b.radius, b.seed),
    }));

    // 2 ACCENT ROSEBUDS FLANKING EXTREME LEFT & RIGHT ENDS
    const buds = [
      { id: 'bud-right', cx: 718, cy: 118, angle: -22, scale: 0.9 },
      { id: 'bud-left', cx: 102, cy: 118, angle: 22, scale: 0.9 },
    ];

    // ORGANIC CALLIGRAPHIC S-VINES WEAVING THROUGH ASCENDERS
    // STRICTLY ZERO CONTINUOUS HOOPS, ZERO DETACHED FLOATING WIRES
    const backStems = [
      // S-Vine 1: Sprouting from behind "دار" through the Alif ascender
      'M 650 125 C 630 92, 605 76, 580 84 C 555 92, 538 112, 515 120',
      // S-Vine 2: Sprouting from behind "الورد" weaving the Lam-Alif
      'M 480 120 C 462 82, 442 68, 420 78 C 398 88, 385 110, 365 122',
      // S-Vine 3: Sprouting from behind "للمناسبات" through ascenders
      'M 340 120 C 320 84, 298 70, 275 80 C 250 92, 230 114, 195 115',
      // Flank Flourish Right: Organic botanical branch trailing gracefully
      'M 630 120 C 660 112, 685 105, 715 118',
      // Flank Flourish Left: Organic botanical branch trailing gracefully
      'M 200 120 C 168 112, 140 106, 105 118',
    ];

    // Delicate Leaves attached along the outer perimeter of the S-curves
    const leafModel = createLeafClusterPath();
    const leaves = [
      { id: 'l-top-dar', x: 580, y: 74, angle: -24, scale: 0.8 },
      { id: 'l-top-ward', x: 420, y: 68, angle: 18, scale: 0.85 },
      { id: 'l-top-muna', x: 275, y: 70, angle: -28, scale: 0.8 },
      { id: 'l-flank-r', x: 690, y: 108, angle: 45, scale: 0.85 },
      { id: 'l-flank-l', x: 130, y: 108, angle: -45, scale: 0.85 },
      { id: 'l-bot-mid', x: 360, y: 132, angle: 130, scale: 0.75 },
    ];

    // Tendril Curls along the outer boundary
    const tendrils = [
      { id: 't-r', x: 720, y: 122, dir: 1, scale: 0.75 },
      { id: 't-l', x: 100, y: 122, dir: -1, scale: 0.75 },
      { id: 't-top', x: 442, y: 62, dir: 1, scale: 0.65 },
    ];

    // FOREGROUND VINES (HAIRLINE TENDRILS - STROKEWIDTH 1.2PX, STRICTLY NO BLOOMS)
    // Delicate loops near ascender tips without cutting through letter bodies
    const frontVines = [
      { id: 'fv-dar', d: 'M 585 84 C 578 96, 572 106, 568 116', curl: { x: 568, y: 116, dir: 1 } },
      { id: 'fv-ward', d: 'M 425 78 C 418 92, 412 104, 408 116', curl: { x: 408, y: 116, dir: -1 } },
      { id: 'fv-muna', d: 'M 280 80 C 274 94, 268 106, 264 116', curl: { x: 264, y: 116, dir: 1 } },
    ];

    return {
      roses,
      buds,
      backStems,
      leaves,
      leafModel,
      tendrils,
      frontVines,
    };
  }, [activeSeed, activeDensity, bloomScaleFactor, safeZoneOffset]);

  // Mouse Coordinate Normalization strictly to 800x220 Virtual Coordinate Space
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!interactive || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = 800 / rect.width;
      const scaleY = 220 / rect.height;
      mousePosRef.current.targetX = (e.clientX - rect.left) * scaleX;
      mousePosRef.current.targetY = (e.clientY - rect.top) * scaleY;
    },
    [interactive]
  );

  const handleMouseLeave = useCallback(() => {
    mousePosRef.current.targetX = -9999;
    mousePosRef.current.targetY = -9999;
  }, []);

  // 60FPS Ambient Motion State
  const [animState, setAnimState] = useState<{
    time: number;
    pulseScale: number;
    offsets: Record<string, { tilt: number; dx: number; dy: number }>;
  }>({
    time: 0,
    pulseScale: 1.0,
    offsets: {},
  });

  useEffect(() => {
    if (!animated) return;
    let animId: number;
    let startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Mouse coordinate spring lerp
      const mp = mousePosRef.current;
      mp.x += (mp.targetX - mp.x) * 0.12;
      mp.y += (mp.targetY - mp.y) * 0.12;

      // Breathing Pulse
      const pulse =
        activeMotionMode === 'breathe'
          ? 1 + Math.sin(elapsed * 1.8) * 0.02
          : 1.0;

      // Subtle Interactive Cursor Pull
      const offsets: Record<string, { tilt: number; dx: number; dy: number }> = {};

      if (mp.x > -5000) {
        layout.roses.forEach((rose) => {
          const dx = mp.x - rose.cx;
          const dy = mp.y - rose.cy;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const pull = (150 - dist) / 150;
            const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            offsets[rose.id] = {
              tilt: (targetAngle * 0.08) * pull,
              dx: (dx * 0.05) * pull,
              dy: (dy * 0.05) * pull,
            };
          }
        });
      }

      setAnimState({
        time: elapsed,
        pulseScale: pulse,
        offsets,
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [animated, activeMotionMode, layout.roses]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 220"
      preserveAspectRatio="xMidYMid meet"
      className={`w-full h-auto select-none overflow-visible ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={activeText}
      role="img"
    >
      <defs>
        {/* Soft Velvet Petal Gradient */}
        <radialGradient id={`core-petal-grad-${activePaletteId}`} cx="36%" cy="32%" r="70%">
          <stop offset="0%" stopColor={palette.petalsMid} />
          <stop offset="60%" stopColor={palette.petals} />
          <stop offset="100%" stopColor={palette.petalsDark} />
        </radialGradient>

        {/* Deep Forest Olive Stem Gradient */}
        <linearGradient id={`core-leaf-grad-${activePaletteId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.leafLight} />
          <stop offset="60%" stopColor={palette.stems} />
          <stop offset="100%" stopColor={palette.leafDark} />
        </linearGradient>

        {/* Soft Depth Shadow for Hairline Tendrils */}
        <filter id="hairline-depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Master Scaled & Animated Transform Container */}
      <g
        transform={`scale(${activeScale * animState.pulseScale})`}
        style={{
          transformOrigin: '400px 125px',
          transition: 'transform 0.2s ease-out',
        }}
      >
        {/* ================================================================ */}
        {/* LAYER 1: BACKGROUND BOTANICAL FRAME (<g id="bg-flora">)          */}
        {/* Refined roses (38-52px) strictly ABOVE Y: 80 or at extreme edges */}
        {/* ================================================================ */}
        {botanicalEnabled && (
          <g id="bg-flora">
            {/* Background Connecting Stems */}
            {layout.backStems.map((dStr, idx) => {
              let sway = '';
              if (activeMotionMode === 'gust') {
                const wind =
                  Math.sin(animState.time * (2.0 * animationSpeed) + idx * 0.7) *
                  (1.8 * (swayIntensity / 4));
                sway = `translate(0, ${wind.toFixed(1)})`;
              }
              return (
                <path
                  key={`stem-${idx}`}
                  d={dStr}
                  transform={sway}
                  fill="none"
                  stroke={`url(#core-leaf-grad-${activePaletteId})`}
                  strokeWidth={stemThickness}
                  strokeLinecap="round"
                  opacity="0.88"
                />
              );
            })}

          {/* Tendril Curls at Outer Boundaries */}
          {layout.tendrils.map((t) => (
            <g key={t.id} transform={`translate(${t.x}, ${t.y}) scale(${t.scale})`}>
              <path
                d={createHairlineTendrilPath(t.dir)}
                fill="none"
                stroke={palette.stems}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          ))}

          {/* Delicate Leaves along Perimeter */}
          {layout.leaves.map((l) => {
            let flutterAngle = 0;
            if (activeMotionMode === 'gust') {
              flutterAngle = Math.sin(animState.time * 2.4 + l.x * 0.01) * 6;
            }
            return (
              <g
                key={l.id}
                transform={`translate(${l.x}, ${l.y}) rotate(${l.angle + flutterAngle}) scale(${l.scale})`}
              >
                <path d={layout.leafModel.leafCenter} fill={palette.leafLight} opacity="0.92" />
                <path d={layout.leafModel.leafLeft} fill={palette.leafDark} opacity="0.88" />
                <path d={layout.leafModel.leafRight} fill={palette.stems} opacity="0.88" />
                <path
                  d={layout.leafModel.vein}
                  fill="none"
                  stroke={isDark ? 'rgba(255,255,255,0.35)' : '#163628'}
                  strokeWidth="0.7"
                  opacity="0.7"
                />
              </g>
            );
          })}

          {/* Flanking Accent Rosebuds at Extreme Outer Ends */}
          {layout.buds.map((bud) => (
            <g key={bud.id} transform={`translate(${bud.cx}, ${bud.cy}) rotate(${bud.angle}) scale(${bud.scale})`}>
              <path
                d="M 0 0 C -8 -6, -11 -18, 0 -26 C 11 -18, 8 -6, 0 0 Z"
                fill={`url(#core-petal-grad-${activePaletteId})`}
                stroke={resolvedLineArtColor}
                strokeWidth="1.1"
              />
              <path
                d="M -3 -10 C -5 -15, -3 -20, 0 -23 C 3 -20, 5 -15, 3 -10"
                fill="none"
                stroke={resolvedLineArtColor}
                strokeWidth="1.0"
                strokeLinecap="round"
              />
              <path
                d="M -4 -3 C -7 -1, -10 2, -12 5 M 4 -3 C 7 -1, 10 2, 12 5"
                fill="none"
                stroke={palette.stems}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Refined Velvet Garden Roses (Camellias) - Soft Rounded Petals, NO SPIKES! */}
          {layout.roses.map((rose) => {
            const { model, cx, cy, angle } = rose;
            let currentTilt = angle;
            let posX = cx;
            let posY = cy;

            if (activeMotionMode === 'gust') {
              const wind = Math.sin(animState.time * 2.0 + cx * 0.01) * 2.2;
              currentTilt += wind;
              posY += Math.sin(animState.time * 2.2 + cx * 0.01) * 1.2;
            }

            if (animState.offsets[rose.id]) {
              const off = animState.offsets[rose.id];
              currentTilt += off.tilt;
              posX += off.dx;
              posY += off.dy;
            }

            return (
              <g
                key={rose.id}
                transform={`translate(${posX.toFixed(1)}, ${posY.toFixed(1)}) rotate(${currentTilt.toFixed(1)})`}
                style={{ transformOrigin: '0 0' }}
              >
                {/* Layer 1: Outer Soft Rounded Dome Petals (No sharp tips) */}
                {model.outerPetals.map((d, pIdx) => (
                  <path
                    key={`outer-${pIdx}`}
                    d={d}
                    fill={`url(#core-petal-grad-${activePaletteId})`}
                    stroke={resolvedLineArtColor}
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    opacity="0.96"
                  />
                ))}

                {/* Layer 2: Mid Cup Rounded Petals */}
                {model.midPetals.map((d, pIdx) => (
                  <path
                    key={`mid-${pIdx}`}
                    d={d}
                    fill={palette.petalsMid}
                    stroke={resolvedLineArtColor}
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                    opacity="0.98"
                  />
                ))}

                {/* Layer 3: Nested C-Shaped Swirling Folds */}
                {model.innerFolds.map((d, fIdx) => (
                  <path
                    key={`fold-${fIdx}`}
                    d={d}
                    fill="none"
                    stroke={resolvedLineArtColor}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                ))}
              </g>
            );
          })}
        </g>
        )}

        {/* ================================================================ */}
        {/* LAYER 2: MASSIVE, BOLD ARABIC DISPLAY TYPOGRAPHY (<g id="text">) */}
        {/* Spans ~75% of canvas width at (400, 125) with zero occlusion     */}
        {/* ================================================================ */}
        <g id="text-layer">
          <text
            x={400}
            y={125}
            dominantBaseline="central"
            textAnchor="middle"
            direction="rtl"
            fontSize={fontSize}
            fontWeight="800"
            letterSpacing="-0.015em"
            fill={resolvedTextColor}
            style={{
              fontFamily: fontCss,
              userSelect: 'none',
              textRendering: 'geometricPrecision',
            }}
          >
            {activeText}
          </text>
        </g>

        {/* ================================================================ */}
        {/* LAYER 3: HAIRLINE FOREGROUND TENDRILS (<g id="fg-vines">)        */}
        {/* ================================================================ */}
        {botanicalEnabled && (
          <g id="fg-vines" filter="url(#hairline-depth-shadow)">
            {layout.frontVines.map((fv) => (
              <g key={fv.id}>
                {/* Subtle under-shadow for gentle 3D depth separation */}
                <path
                  d={fv.d}
                  fill="none"
                  stroke={palette.stems}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                {/* Hairline tendril curl at tip */}
                <g transform={`translate(${fv.curl.x}, ${fv.curl.y}) scale(0.5)`}>
                  <path
                    d={createHairlineTendrilPath(fv.curl.dir)}
                    fill="none"
                    stroke={palette.stems}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </g>
              </g>
            ))}
          </g>
        )}

        {/* ================================================================ */}
        {/* VISITOR MOTION MODE: Animated Vector Butterfly                   */}
        {/* ================================================================ */}
        {botanicalEnabled && activeMotionMode === 'visitor' && (
          <g
            transform={`translate(${
              400 + Math.sin(animState.time * 1.6 * animationSpeed) * 260
            }, ${
              60 + Math.cos(animState.time * 3.2 * animationSpeed) * 30 - safeZoneOffset
            }) rotate(${Math.sin(animState.time * 1.6 * animationSpeed) * 25}) scale(0.85)`}
            className="pointer-events-none drop-shadow-md"
          >
            {/* Butterfly Center Body */}
            <ellipse cx="0" cy="0" rx="2" ry="7" fill={isDark ? '#F9FAFB' : '#1C1917'} />
            {/* Left Wing with Dynamic Flap */}
            <g transform={`scale(${Math.abs(Math.sin(animState.time * 14 * animationSpeed)) * 0.9 + 0.1}, 1)`}>
              <path
                d="M 0 -2 C -15 -18, -26 -6, -15 6 C -20 12, -10 16, 0 3 Z"
                fill={palette.petalsMid}
                opacity="0.95"
                stroke={resolvedLineArtColor}
                strokeWidth="0.8"
              />
              <circle cx="-10" cy="-2" r="2.5" fill="#FBBF24" opacity="0.9" />
            </g>
            {/* Right Wing with Dynamic Flap */}
            <g transform={`scale(${-(Math.abs(Math.sin(animState.time * 14 * animationSpeed)) * 0.9 + 0.1)}, 1)`}>
              <path
                d="M 0 -2 C -15 -18, -26 -6, -15 6 C -20 12, -10 16, 0 3 Z"
                fill={palette.petalsMid}
                opacity="0.95"
                stroke={resolvedLineArtColor}
                strokeWidth="0.8"
              />
              <circle cx="-10" cy="-2" r="2.5" fill="#FBBF24" opacity="0.9" />
            </g>
          </g>
        )}
      </g>
    </svg>
  );
};

export default BotanicalCoreEngine;
