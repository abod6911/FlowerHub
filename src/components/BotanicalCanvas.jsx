import React, { useRef, useState, useMemo, useCallback } from 'react';

/**
 * BotanicalCanvas
 * Authentic Asymmetrical Luxury Floral Composition (Type-Garden Architecture)
 * 
 * Features:
 * - Fixed SVG viewBox: "0 0 650 160"
 * - High-end Botanical Calligraphy with TWO distinct visual anchors:
 *   1. Primary Flourish Cluster (Right side / "دار"): Large statement rose, medium rose, small bud, and tendrils.
 *   2. Secondary Counter-Balance Cluster ("الورد" & "للمناسبات"): Crown rose between ascenders, sweeping S-vine with accent buds.
 * - Negative space preservation: zero occlusion on core calligraphy bodies.
 * - English Garden Rose / Camellia geometry with soft ruffled lobes & nested swirling contours.
 * - 60fps ambient breeze animation (gust sway on clusters, leaf flutter).
 * - Self-contained, responsive, and drop-in ready.
 */

// Soft Ruffled Petal Builder using Cubic Beziers
function buildRuffledPetalPath(angleRad, length, width, wave = 0) {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const perpX = -sin;
  const perpY = cos;

  // Base attachment points
  const baseW = width * 0.22;
  const b1x = -perpX * baseW;
  const b1y = -perpY * baseW;
  const b2x = perpX * baseW;
  const b2y = perpY * baseW;

  // Shoulder points (broad ruffled swell)
  const shoulderDist = length * 0.58;
  const s1x = cos * shoulderDist - perpX * (width * 0.52);
  const s1y = sin * shoulderDist - perpY * (width * 0.52);
  const s2x = cos * shoulderDist + perpX * (width * 0.52);
  const s2y = sin * shoulderDist + perpY * (width * 0.52);

  // Scalloped lobe tip
  const tipX = cos * length + perpX * wave;
  const tipY = sin * length + perpY * wave;

  // Cubic Beziers creating soft rounded petals
  const c1x = tipX - perpX * (width * 0.32);
  const c1y = tipY - perpY * (width * 0.32);
  const c2x = tipX + perpX * (width * 0.32);
  const c2y = tipY + perpY * (width * 0.32);

  return `M ${b1x.toFixed(1)} ${b1y.toFixed(1)} ` +
    `C ${b1x + cos * (length * 0.2) - perpX * (width * 0.25)} ${b1y + sin * (length * 0.2) - perpY * (width * 0.25)}, ` +
    `${s1x - cos * (length * 0.1)} ${s1y - sin * (length * 0.1)}, ` +
    `${s1x.toFixed(1)} ${s1y.toFixed(1)} ` +
    `C ${s1x + cos * (length * 0.25)} ${s1y + sin * (length * 0.25)}, ` +
    `${c1x.toFixed(1)} ${c1y.toFixed(1)}, ` +
    `${tipX.toFixed(1)} ${tipY.toFixed(1)} ` +
    `C ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ` +
    `${s2x + cos * (length * 0.25)} ${s2y + sin * (length * 0.25)}, ` +
    `${s2x.toFixed(1)} ${s2y.toFixed(1)} ` +
    `C ${s2x - cos * (length * 0.1)} ${s2y - sin * (length * 0.1)}, ` +
    `${b2x + cos * (length * 0.2) + perpX * (width * 0.25)} ${b2y + sin * (length * 0.2) + perpY * (width * 0.25)}, ` +
    `${b2x.toFixed(1)} ${b2y.toFixed(1)} Z`;
}

// Generate Garden Rose Vector Elements (Outer Lobes, Mid Petals, Inner Swirls)
function getRoseGeometry(radius, baseAngle = 0) {
  // Layer 1: 5 outer ruffled scallop lobes
  const outerPetals = [];
  const numOuter = 5;
  const outerStep = (Math.PI * 2) / numOuter;
  for (let i = 0; i < numOuter; i++) {
    const angle = baseAngle + i * outerStep;
    const len = radius * 0.96;
    const width = radius * 0.88;
    const wave = (i % 2 === 0 ? 1 : -1) * (radius * 0.08);
    outerPetals.push(buildRuffledPetalPath(angle, len, width, wave));
  }

  // Layer 2: 4 mid overlapping petals
  const midPetals = [];
  const numMid = 4;
  const midStep = (Math.PI * 2) / numMid;
  const midOffset = baseAngle + Math.PI / 4.5;
  for (let i = 0; i < numMid; i++) {
    const angle = midOffset + i * midStep;
    const len = radius * 0.72;
    const width = radius * 0.68;
    midPetals.push(buildRuffledPetalPath(angle, len, width, 0));
  }

  // Layer 3: Nested swirling inner contour paths (Cubic Beziers)
  const rCore = radius * 0.42;
  const innerFolds = [];
  const rot = baseAngle + 0.35;

  // Swirl 1: Outer heart fold
  const p1x = Math.cos(rot) * rCore * 1.15;
  const p1y = Math.sin(rot) * rCore * 1.15;
  const p2x = Math.cos(rot + 2.4) * rCore * 0.85;
  const p2y = Math.sin(rot + 2.4) * rCore * 0.85;
  const cp1x = Math.cos(rot + 1.2) * rCore * 1.55;
  const cp1y = Math.sin(rot + 1.2) * rCore * 1.55;
  innerFolds.push(`M ${p1x.toFixed(1)} ${p1y.toFixed(1)} Q ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`);

  // Swirl 2: Mid spiral
  const q1x = Math.cos(rot + 2.7) * rCore * 0.82;
  const q1y = Math.sin(rot + 2.7) * rCore * 0.82;
  const q2x = Math.cos(rot + 4.8) * rCore * 0.62;
  const q2y = Math.sin(rot + 4.8) * rCore * 0.62;
  const cpaX = Math.cos(rot + 3.7) * rCore * 1.25;
  const cpaY = Math.sin(rot + 3.7) * rCore * 1.25;
  innerFolds.push(`M ${q1x.toFixed(1)} ${q1y.toFixed(1)} Q ${cpaX.toFixed(1)} ${cpaY.toFixed(1)} ${q2x.toFixed(1)} ${q2y.toFixed(1)}`);

  // Swirl 3: Center tight bud core
  const h1x = Math.cos(rot + 5.1) * rCore * 0.52;
  const h1y = Math.sin(rot + 5.1) * rCore * 0.52;
  const h2x = Math.cos(rot + 0.9) * rCore * 0.3;
  const h2y = Math.sin(rot + 0.9) * rCore * 0.3;
  const hcpX = Math.cos(rot + 0.1) * rCore * 0.75;
  const hcpY = Math.sin(rot + 0.1) * rCore * 0.75;
  innerFolds.push(`M ${h1x.toFixed(1)} ${h1y.toFixed(1)} Q ${hcpX.toFixed(1)} ${hcpY.toFixed(1)} ${h2x.toFixed(1)} ${h2y.toFixed(1)}`);

  return { outerPetals, midPetals, innerFolds };
}

export function BotanicalCanvas({
  text = 'دار الورد للمناسبات',
  isDark = false,
  textColor,
  stemColor = '#1E382B',
  roseColor,
  animated = true,
  interactive = true,
  className = '',
  style = {},
}) {
  const svgRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Luxury Color Palette (Refined Royal Velvet & Forest Sage)
  const colors = useMemo(() => {
    if (isDark) {
      return {
        text: textColor || '#F9FAFB',
        roseBase: roseColor || '#9B1B36',
        roseMid: '#BE1E45',
        roseCore: '#5A0B1B',
        innerLine: 'rgba(255, 255, 255, 0.45)',
        stems: stemColor || '#234233',
        leaves: stemColor || '#234233',
        leafVein: 'rgba(255, 255, 255, 0.3)',
      };
    }
    return {
      text: textColor || '#1C1917',
      roseBase: roseColor || '#7E1529',
      roseMid: '#9E1A34',
      roseCore: '#4A0B17',
      innerLine: 'rgba(255, 255, 255, 0.4)',
      stems: stemColor || '#1E382B',
      leaves: stemColor || '#1E382B',
      leafVein: 'rgba(255, 255, 255, 0.25)',
    };
  }, [isDark, textColor, stemColor, roseColor]);

  // Precomputed Vector Models for the 3 distinct Rose Scales
  const statementRoseGeo = useMemo(() => getRoseGeometry(34, 0.25), []);
  const mediumRoseGeo = useMemo(() => getRoseGeometry(24, -0.4), []);
  const crownRoseGeo = useMemo(() => getRoseGeometry(26, 0.15), []);

  // Interactive mouse tracking
  const handleMouseMove = useCallback((e) => {
    if (!interactive || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: normX * 8, y: normY * 6 });
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
  }, []);

  return (
    <div
      className={`relative w-full max-w-[650px] mx-auto select-none overflow-visible ${className}`}
      style={style}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 650 160"
        className="w-full h-auto overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Subtle Drop Shadows & Gradients for High-End Botanical Depth */}
          <filter id="botanical-bloom-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.22" />
          </filter>
          <filter id="botanical-soft-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.16" />
          </filter>

          {/* Luxury Rose Petal Gradients */}
          <radialGradient id="rose-velvet-grad-large" cx="42%" cy="40%" r="62%">
            <stop offset="0%" stopColor={colors.roseMid} />
            <stop offset="55%" stopColor={colors.roseBase} />
            <stop offset="100%" stopColor={colors.roseCore} />
          </radialGradient>
          <radialGradient id="rose-velvet-grad-mid" cx="44%" cy="38%" r="60%">
            <stop offset="0%" stopColor={colors.roseMid} />
            <stop offset="65%" stopColor={colors.roseBase} />
            <stop offset="100%" stopColor={colors.roseCore} />
          </radialGradient>

          {/* Reusable Compound Leaf Group (2–3 natural leaves with center veins) */}
          <g id="leaf-triple">
            {/* Center Main Leaf */}
            <path
              d="M 0 0 C -4 -10, -5 -22, 0 -30 C 5 -22, 4 -10, 0 0 Z"
              fill={colors.leaves}
            />
            <path d="M 0 -2 L 0 -25" stroke={colors.leafVein} strokeWidth="0.8" strokeLinecap="round" />
            <path d="M -1 -12 L -3.5 -17 M 1 -12 L 3.5 -17" stroke={colors.leafVein} strokeWidth="0.6" strokeLinecap="round" />
            {/* Left Leaflet */}
            <path
              d="M -2 -7 C -9 -11, -17 -15, -20 -22 C -15 -22, -7 -17, -2 -7 Z"
              fill={colors.leaves}
              opacity="0.92"
            />
            <path d="M -2 -7 L -16 -19" stroke={colors.leafVein} strokeWidth="0.6" strokeLinecap="round" />
            {/* Right Leaflet */}
            <path
              d="M 2 -7 C 9 -11, 17 -15, 20 -22 C 15 -22, 7 -17, 2 -7 Z"
              fill={colors.leaves}
              opacity="0.92"
            />
            <path d="M 2 -7 L 16 -19" stroke={colors.leafVein} strokeWidth="0.6" strokeLinecap="round" />
          </g>

          <g id="leaf-double">
            {/* Main teardrop leaf */}
            <path
              d="M 0 0 C -3.5 -8, -4 -18, 0 -24 C 4 -18, 3.5 -8, 0 0 Z"
              fill={colors.leaves}
            />
            <path d="M 0 -2 L 0 -20" stroke={colors.leafVein} strokeWidth="0.75" strokeLinecap="round" />
            {/* Accent leaflet */}
            <path
              d="M 2 -5 C 7 -9, 14 -12, 16 -18 C 12 -18, 5 -14, 2 -5 Z"
              fill={colors.leaves}
              opacity="0.9"
            />
          </g>

          {/* Reusable Small Tight Rosebud with Calyx Sepals */}
          <g id="rosebud-unit">
            {/* 3 Green Sepals embracing bud base */}
            <path d="M -2 2 C -6 0, -9 -6, -8 -11 C -5 -9, -3 -4, -1 1" fill={colors.stems} />
            <path d="M 2 2 C 6 0, 9 -6, 8 -11 C 5 -9, 3 -4, 1 1" fill={colors.stems} />
            <path d="M 0 3 C -1 0, -2 -6, 0 -10 C 2 -6, 1 0, 0 3" fill={colors.stems} />
            {/* Closed Velvet Rosebud Body */}
            <path
              d="M -5 0 C -7 -7, -6 -16, 0 -20 C 6 -16, 7 -7, 5 0 C 3 4, -3 4, -5 0 Z"
              fill="url(#rose-velvet-grad-mid)"
              filter="url(#botanical-soft-shadow)"
            />
            {/* Subtle inner bud fold */}
            <path
              d="M -2 -14 C 1 -18, 4 -15, 3 -9 C 2 -4, -1 -4, -1 -9"
              fill="none"
              stroke={colors.innerLine}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        </defs>

        {/* 60FPS Ambient Breeze & Flutter Style Injections */}
        {animated && (
          <style>{`
            @keyframes gustSwayPrimary {
              0%, 100% {
                transform: rotate(0deg) translate(0px, 0px);
              }
              50% {
                transform: rotate(2.4deg) translate(1px, -1.8px);
              }
            }
            @keyframes gustSwaySecondary {
              0%, 100% {
                transform: rotate(0deg) translate(0px, 0px);
              }
              50% {
                transform: rotate(-1.8deg) translate(-1.2px, 1.2px);
              }
            }
            @keyframes leafFlutter {
              0%, 100% {
                transform: scale(1) rotate(0deg);
              }
              50% {
                transform: scale(1.05) rotate(3.2deg);
              }
            }
            @keyframes vineBreathe {
              0%, 100% {
                transform: scaleY(1);
              }
              50% {
                transform: scaleY(1.025);
              }
            }
            .botanical-anim-primary {
              transform-origin: 540px 30px;
              animation: gustSwayPrimary 6.2s ease-in-out infinite;
            }
            .botanical-anim-secondary {
              transform-origin: 385px 22px;
              animation: gustSwaySecondary 7.5s ease-in-out infinite;
            }
            .botanical-anim-leaf {
              transform-origin: bottom center;
              animation: leafFlutter 4.8s ease-in-out infinite;
            }
            .botanical-anim-vine {
              transform-origin: 385px 30px;
              animation: vineBreathe 6.8s ease-in-out infinite;
            }
          `}</style>
        )}

        {/* ========================================================================= */}
        {/* LAYER 1: BACKGROUND BOTANICAL VINES, STEMS & LEAVES (ZERO TEXT OCCLUSION)   */}
        {/* ========================================================================= */}
        <g id="botanical-stems-and-leaves">
          {/* PRIMARY CLUSTER STEMWORK (Positioned above and outside the word "دار") */}
          <g
            className={animated ? 'botanical-anim-primary' : ''}
            style={{
              transform: `translate(${mouseOffset.x * 0.7}px, ${mouseOffset.y * 0.7}px)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Organic Arching Stem connecting Statement Rose to Companion Rose and Bud */}
            <path
              d="M 515 32 C 540 18, 565 26, 585 42 S 608 54, 618 60"
              fill="none"
              stroke={colors.stems}
              strokeWidth="2.0"
              strokeLinecap="round"
            />
            {/* Terminal Spiral Tendril extending gracefully beyond the bud at the right margin */}
            <path
              d="M 618 60 C 628 62, 638 57, 636 48 C 634 40, 624 38, 620 43 C 617 46, 620 50, 625 50"
              fill="none"
              stroke={colors.stems}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Upward flourishing tendril framing top-right sky */}
            <path
              d="M 545 22 C 558 10, 574 6, 578 -2 C 581 -8, 575 -12, 570 -8 C 566 -5, 568 -1, 572 -1"
              fill="none"
              stroke={colors.stems}
              strokeWidth="1.1"
              strokeLinecap="round"
            />

            {/* Natural Leaf Clusters flourishing in negative space above and right */}
            {/* Top Leaf Cluster */}
            <use
              href="#leaf-triple"
              x="542"
              y="16"
              transform="rotate(-35 542 16) scale(0.85)"
              className={animated ? 'botanical-anim-leaf' : ''}
            />
            {/* Right Flank Leaf Cluster */}
            <use
              href="#leaf-double"
              x="598"
              y="38"
              transform="rotate(45 598 38) scale(0.8)"
              className={animated ? 'botanical-anim-leaf' : ''}
            />
            {/* Upper Flank Accent Leaf */}
            <use
              href="#leaf-double"
              x="495"
              y="22"
              transform="rotate(-65 495 22) scale(0.75)"
              opacity="0.85"
            />
          </g>

          {/* SECONDARY CLUSTER STEMWORK (Sweeping cleanly UNDERNEATH the text baseline) */}
          <g
            className={animated ? 'botanical-anim-secondary' : ''}
            style={{
              transform: `translate(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Calligraphic S-Vine sweeping from behind Crown Rose cleanly UNDER the baseline */}
            <path
              d="M 385 28 C 365 65, 345 116, 310 124 C 265 132, 215 124, 155 126 C 125 128, 95 132, 70 124"
              fill="none"
              stroke={colors.stems}
              strokeWidth="2.0"
              strokeLinecap="round"
              className={animated ? 'botanical-anim-vine' : ''}
            />
            {/* Terminal Hairline Tendril Curl sweeping under left margin */}
            <path
              d="M 70 124 C 58 120, 52 110, 58 104 C 64 98, 73 102, 71 108"
              fill="none"
              stroke={colors.stems}
              strokeWidth="1.1"
              strokeLinecap="round"
            />

            {/* Flanking Leaves for Crown Rose (Upward facing into top margin) */}
            <use
              href="#leaf-double"
              x="362"
              y="14"
              transform="rotate(-52 362 14) scale(0.8)"
              className={animated ? 'botanical-anim-leaf' : ''}
            />
            <use
              href="#leaf-double"
              x="410"
              y="15"
              transform="rotate(45 410 15) scale(0.8)"
              className={animated ? 'botanical-anim-leaf' : ''}
            />

            {/* Leaves along sweeping bottom vine (pointing downward, strictly below y=124) */}
            <use
              href="#leaf-triple"
              x="260"
              y="128"
              transform="rotate(145 260 128) scale(0.75)"
              className={animated ? 'botanical-anim-leaf' : ''}
            />
            <use
              href="#leaf-double"
              x="175"
              y="128"
              transform="rotate(135 175 128) scale(0.7)"
              className={animated ? 'botanical-anim-leaf' : ''}
            />

            {/* Tiny Accent Rosebuds along bottom vine (pointing downward) */}
            <g transform="translate(220, 132) rotate(160) scale(0.5)">
              <use href="#rosebud-unit" />
            </g>
            <g transform="translate(130, 130) rotate(150) scale(0.42)">
              <use href="#rosebud-unit" />
            </g>
          </g>
        </g>

        {/* ========================================================================= */}
        {/* LAYER 2: ASYMMETRICAL LUXURY ROSES (TYPE-GARDEN EDITORIAL CLUSTERS)       */}
        {/* Positioned strictly outside and above text bounds to guarantee zero occlusion */}
        {/* ========================================================================= */}
        <g id="botanical-roses-layer">
          {/* ----------------------------------------------------------------------- */}
          {/* 1. PRIMARY FLOURISH CLUSTER (Above & to the Right of Arabic "دار")       */}
          {/* ----------------------------------------------------------------------- */}
          <g
            className={animated ? 'botanical-anim-primary' : ''}
            style={{
              transform: `translate(${mouseOffset.x * 0.9}px, ${mouseOffset.y * 0.9}px)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Rose 1: Large Statement Rose (diameter ~54px, radius 27px, rotation 15deg) */}
            {/* Elevated above "دار" with bottom edge at y=56, well above letters at y=70-95 */}
            <g
              transform="translate(535, 28) rotate(15) scale(0.82)"
              filter="url(#botanical-bloom-shadow)"
            >
              {/* Outer Layer: 5 Ruffled Scallop Lobes */}
              <g fill="url(#rose-velvet-grad-large)">
                {statementRoseGeo.outerPetals.map((d, idx) => (
                  <path key={`stmt-outer-${idx}`} d={d} />
                ))}
              </g>
              {/* Mid Layer: 4 Overlapping Cup Petals */}
              <g fill={colors.roseMid} opacity="0.94">
                {statementRoseGeo.midPetals.map((d, idx) => (
                  <path key={`stmt-mid-${idx}`} d={d} />
                ))}
              </g>
              {/* Inner Nested Swirling Contour Folds */}
              <g fill="none" stroke={colors.innerLine} strokeWidth="1.5" strokeLinecap="round">
                {statementRoseGeo.innerFolds.map((d, idx) => (
                  <path key={`stmt-inner-${idx}`} d={d} />
                ))}
              </g>
            </g>

            {/* Rose 2: Medium Rose (diameter ~40px, radius 20px, rotation -20deg) */}
            {/* Leaning naturally outside the right edge of "دار" (x=580) */}
            <g
              transform="translate(580, 44) rotate(-20) scale(0.8)"
              filter="url(#botanical-bloom-shadow)"
            >
              <g fill="url(#rose-velvet-grad-mid)">
                {mediumRoseGeo.outerPetals.map((d, idx) => (
                  <path key={`med-outer-${idx}`} d={d} />
                ))}
              </g>
              <g fill={colors.roseMid} opacity="0.92">
                {mediumRoseGeo.midPetals.map((d, idx) => (
                  <path key={`med-mid-${idx}`} d={d} />
                ))}
              </g>
              <g fill="none" stroke={colors.innerLine} strokeWidth="1.4" strokeLinecap="round">
                {mediumRoseGeo.innerFolds.map((d, idx) => (
                  <path key={`med-inner-${idx}`} d={d} />
                ))}
              </g>
            </g>

            {/* Rose 3: Small Tight Rosebud extending outward to the right margin */}
            <g transform="translate(618, 62) rotate(35) scale(0.76)">
              <use href="#rosebud-unit" />
            </g>
          </g>

          {/* ----------------------------------------------------------------------- */}
          {/* 2. SECONDARY COUNTER-BALANCE CLUSTER (Hovering as Crown ABOVE "الورد")    */}
          {/* ----------------------------------------------------------------------- */}
          <g
            className={animated ? 'botanical-anim-secondary' : ''}
            style={{
              transform: `translate(${mouseOffset.x * 0.65}px, ${mouseOffset.y * 0.65}px)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Rose 4: Medium Blooming Rose (diameter ~44px, radius 22px, rotation 8deg) */}
            {/* Nestled safely above ascenders at y=26 (bottom edge y=46, ascenders at y=58) */}
            <g
              transform="translate(385, 26) rotate(8) scale(0.8)"
              filter="url(#botanical-bloom-shadow)"
            >
              <g fill="url(#rose-velvet-grad-mid)">
                {crownRoseGeo.outerPetals.map((d, idx) => (
                  <path key={`crown-outer-${idx}`} d={d} />
                ))}
              </g>
              <g fill={colors.roseMid} opacity="0.93">
                {crownRoseGeo.midPetals.map((d, idx) => (
                  <path key={`crown-mid-${idx}`} d={d} />
                ))}
              </g>
              <g fill="none" stroke={colors.innerLine} strokeWidth="1.4" strokeLinecap="round">
                {crownRoseGeo.innerFolds.map((d, idx) => (
                  <path key={`crown-inner-${idx}`} d={d} />
                ))}
              </g>
            </g>
          </g>
        </g>

        {/* ========================================================================= */}
        {/* LAYER 3: FOREGROUND CALLIGRAPHIC TYPOGRAPHY (CRISP & 100% UNCLUTTERED)     */}
        {/* ========================================================================= */}
        <text
          x="325"
          y="100"
          textAnchor="middle"
          fill={colors.text}
          style={{
            fontFamily: "'Amiri', 'Aref Ruqaa', serif",
            fontSize: '50px',
            fontWeight: 700,
            letterSpacing: '0.015em',
            filter: isDark ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))',
          }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}

export default BotanicalCanvas;
