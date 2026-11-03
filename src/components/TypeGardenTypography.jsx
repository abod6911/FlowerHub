import React, { useRef, useState, useMemo, useEffect } from 'react';

/**
 * TypeGardenTypography
 * Authentic Lush Botanical Typography System inspired by type-garden.vercel.app
 * 
 * Features:
 * 1. 3D Layered Arrangement:
 *    - Layer 1 (Back): Climbing vines with Cubic Bézier arcs & coiling spiral tendrils.
 *    - Layer 2 (Mid-Back): Pointed botanical leaves with midrib & lateral side veins.
 *    - Layer 3 (Center): Primary Arabic Calligraphy with live in-place typing & blinking cursor.
 *    - Layer 4 (Fore): Layered dual-tone illustrated roses (outer wavy petals + mid cupped petals + inner swirling spiral contour).
 * 2. Zero container clipping (SVG overflow: visible, height 220px, viewBox 0 0 820 220).
 * 3. Growth & Bloom animation via SVG stroke-dashoffset & spring scaling.
 * 4. Interactive hover/touch breathing.
 */

// Seeded PRNG (Mulberry32) for deterministic organic generation
function createPrng(seed = 48271) {
  let s = Math.floor(Math.abs(seed)) % 2147483647;
  if (s <= 0) s = 123456789;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 1. Generate Spiral Tendril Path (Coiling climbing plant tendrils)
function generateTendrilPath(startX, startY, baseAngle, radius = 22, turns = 1.6, curlDir = 1) {
  const points = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    // Spiral inward while extending forward
    const r = radius * (1 - frac * 0.65);
    const theta = baseAngle + curlDir * frac * Math.PI * 2 * turns;
    const px = startX + Math.cos(baseAngle) * (frac * radius * 1.8) + Math.cos(theta) * (r * frac);
    const py = startY + Math.sin(baseAngle) * (frac * radius * 1.8) + Math.sin(theta) * (r * frac);
    points.push({ x: px, y: py });
  }

  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i += 2) {
    const p1 = points[i];
    const p2 = points[i + 1] || p1;
    d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// 2. Generate Detailed Botanical Leaf with Midrib and Angled Lateral Veins
function generateLeafData(x, y, length = 20, width = 9.5, angleRad = 0, side = 1) {
  const leafPath = `M 0 0 C ${-width * 0.6 * side} ${-length * 0.35}, ${-width * 0.5 * side} ${-length * 0.75}, 0 ${-length} C ${width * 0.5 * side} ${-length * 0.75}, ${width * 0.6 * side} ${-length * 0.35}, 0 0 Z`;
  const midribPath = `M 0 0 L 0 ${-length * 0.88}`;
  const lateralVeins = [
    `M 0 ${-length * 0.28} L ${-width * 0.32 * side} ${-length * 0.42}`,
    `M 0 ${-length * 0.28} L ${width * 0.32 * side} ${-length * 0.42}`,
    `M 0 ${-length * 0.54} L ${-width * 0.3 * side} ${-length * 0.66}`,
    `M 0 ${-length * 0.54} L ${width * 0.3 * side} ${-length * 0.66}`,
    `M 0 ${-length * 0.74} L ${-width * 0.2 * side} ${-length * 0.83}`,
    `M 0 ${-length * 0.74} L ${width * 0.2 * side} ${-length * 0.83}`,
  ].join(' ');

  return {
    leafPath,
    midribPath,
    lateralVeins,
    transform: `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${(angleRad * 180 / Math.PI).toFixed(1)})`,
  };
}

// 3. Generate Layered Two-Tone Illustrated Rose (Outer Wavy + Mid Cup + Spiral Heart)
function generateRoseData(x, y, radius = 24, rotation = 0, primaryColor, secondaryColor) {
  // Tier 1: 5 Outer Scalloped Wavy Petals
  const numOuter = 5;
  const outerPetals = [];
  const outerAngleStep = (Math.PI * 2) / numOuter;
  for (let i = 0; i < numOuter; i++) {
    const ang = i * outerAngleStep;
    const len = radius * 0.95;
    const w = radius * 0.62;
    // Cubic bezier ruffled scallop lobe
    const p = `M 0 0 C ${-w} ${-len * 0.4}, ${-w * 0.8} ${-len * 0.95}, 0 ${-len} C ${w * 0.8} ${-len * 0.95}, ${w} ${-len * 0.4}, 0 0 Z`;
    outerPetals.push({
      d: p,
      transform: `rotate(${(ang * 180 / Math.PI).toFixed(1)})`,
    });
  }

  // Tier 2: 4 Mid Cupped Petals (Dual-tone Contrast)
  const numMid = 4;
  const midPetals = [];
  const midAngleStep = (Math.PI * 2) / numMid;
  for (let i = 0; i < numMid; i++) {
    const ang = i * midAngleStep + Math.PI / 4;
    const len = radius * 0.68;
    const w = radius * 0.45;
    const p = `M 0 0 C ${-w} ${-len * 0.45}, ${-w * 0.75} ${-len * 0.95}, 0 ${-len} C ${w * 0.75} ${-len * 0.95}, ${w} ${-len * 0.45}, 0 0 Z`;
    midPetals.push({
      d: p,
      transform: `rotate(${(ang * 180 / Math.PI).toFixed(1)})`,
    });
  }

  // Tier 3: Inner Concentric Swirling Rose Heart (Hand-drawn Linocut Line Art)
  const coreRadius = radius * 0.38;
  const heartFolds = [];
  for (let i = 0; i < 3; i++) {
    const rF = coreRadius * (0.4 + i * 0.3);
    const a1 = i * 2.1;
    const a2 = a1 + 3.8;
    const x1 = Math.cos(a1) * rF;
    const y1 = Math.sin(a1) * rF;
    const x2 = Math.cos(a2) * (rF * 0.85);
    const y2 = Math.sin(a2) * (rF * 0.85);
    const cx = Math.cos(a1 + 1.8) * (rF * 1.5);
    const cy = Math.sin(a1 + 1.8) * (rF * 1.5);
    heartFolds.push(`M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }

  return {
    outerPetals,
    midPetals,
    heartFolds,
    coreRadius,
    transform: `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${(rotation * 180 / Math.PI).toFixed(1)})`,
    primaryColor,
    secondaryColor,
  };
}

export default function TypeGardenTypography({
  text = 'دار الورد للمناسبات',
  onTextChange,
  stemColor = '#1B3B2B',
  primaryPetalColor = '#9B1B36',
  secondaryPetalColor = '#F59E0B',
  textColor = '#1C1917',
  density = 6, // 1 to 10
  flowerScale = 1.0, // 0.6 to 1.6
  curliness = 1.0, // 0.5 to 2.0
  seed = 48271,
  replayKey = 0,
  isEditingDirect = false,
  onToggleDirectEdit,
  className = '',
}) {
  const [isTypingFocused, setIsTypingFocused] = useState(false);
  const inputRef = useRef(null);

  // Focus input when direct editing is activated
  useEffect(() => {
    if (isEditingDirect && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingDirect]);

  // Procedural Botanical Layout Generation
  const gardenData = useMemo(() => {
    const prng = createPrng(seed);
    const normDensity = density > 10 ? Math.max(1, Math.min(10, Math.round(density / 10))) : Math.max(1, Math.min(10, density));
    // Number of vine clusters based on text length and density
    const charCount = Math.max(3, (text || '').trim().length);
    const clusterCount = Math.round(5 + (normDensity / 10) * 8);

    // SVG coordinate space: 820 width x 220 height
    const centerY = 120;
    // Dynamic span adjusted to text length so botanical vines grow directly around words
    const textHalfSpan = Math.min(280, Math.max(140, charCount * 14));
    const textStart = 410 - textHalfSpan;
    const textEnd = 410 + textHalfSpan;
    const textSpan = textEnd - textStart;

    const vines = [];
    const tendrils = [];
    const leaves = [];
    const roses = [];

    // Distribute anchor points along the word spans
    for (let c = 0; c < clusterCount; c++) {
      const frac = c / (clusterCount - 1 || 1);
      const anchorX = textStart + frac * textSpan + (prng() - 0.5) * 35;
      const anchorY = centerY + (prng() - 0.5) * 30;

      // 1. Determine vine direction: some climb up, some sweep under, some trail right/left
      const isTopClimber = c % 2 === 0;
      const targetY = isTopClimber
        ? 35 + prng() * 32 // Reach into upper margin (Y: 35 - 67)
        : 165 + prng() * 32; // Sweep below baseline (Y: 165 - 197)
      const targetX = anchorX + (prng() - 0.5) * 100 * curliness;

      // Cubic Bezier curve control points
      const cp1X = anchorX + (prng() - 0.5) * 70 * curliness;
      const cp1Y = anchorY + (isTopClimber ? -38 : 38);
      const cp2X = targetX + (prng() - 0.5) * 55 * curliness;
      const cp2Y = targetY + (isTopClimber ? 38 : -38);

      const vinePath = `M ${anchorX.toFixed(1)} ${anchorY.toFixed(1)} C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)}, ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)}, ${targetX.toFixed(1)} ${targetY.toFixed(1)}`;
      vines.push({
        id: `vine-${c}`,
        d: vinePath,
        strokeWidth: 2.4 + prng() * 1.0,
      });

      // 2. Coiling spiral tendril off the mid-curve
      if (prng() > 0.2) {
        const tendrilAngle = (isTopClimber ? -Math.PI / 2 : Math.PI / 2) + (prng() - 0.5) * 0.8;
        const tendrilRadius = (16 + prng() * 14) * curliness;
        const curlDir = prng() > 0.5 ? 1 : -1;
        const tendrilD = generateTendrilPath(
          cp1X,
          cp1Y,
          tendrilAngle,
          tendrilRadius,
          1.5 + prng() * 0.6,
          curlDir
        );
        tendrils.push({
          id: `tendril-${c}`,
          d: tendrilD,
          strokeWidth: 1.3,
        });
      }

      // 3. Botanical leaves with veins along this vine (2 to 4 leaves)
      const numLeaves = Math.round(2 + prng() * 2);
      for (let l = 0; l < numLeaves; l++) {
        const leafT = 0.2 + (l / numLeaves) * 0.7;
        const mt = 1 - leafT;
        const lx = mt * mt * mt * anchorX + 3 * mt * mt * leafT * cp1X + 3 * mt * leafT * leafT * cp2X + leafT * leafT * leafT * targetX;
        const ly = mt * mt * mt * anchorY + 3 * mt * mt * leafT * cp1Y + 3 * mt * leafT * leafT * cp2Y + leafT * leafT * leafT * targetY;
        const leafAngle = (isTopClimber ? -Math.PI / 3 : Math.PI / 3) + (prng() - 0.5) * 1.1;
        const leafLen = 17 + prng() * 9;
        const leafW = 9 + prng() * 4;
        const leafSide = l % 2 === 0 ? 1 : -1;

        leaves.push(generateLeafData(lx, ly, leafLen, leafW, leafAngle, leafSide));
      }

      // 4. Primary Layered Illustrated Rose at the vine tip
      const isForeground = prng() > 0.3; // 70% in foreground for lush 3D botanical layering
      const roseRadius = (18 + prng() * 14) * flowerScale;
      const roseRot = prng() * Math.PI * 2;
      const tipRose = generateRoseData(
        targetX,
        targetY,
        roseRadius,
        roseRot,
        primaryPetalColor,
        secondaryPetalColor
      );
      tipRose.isForeground = isForeground;
      tipRose.id = `rose-tip-${c}`;
      roses.push(tipRose);

      // 5. Complementary Mid-Vine Blossom or Bud
      if (prng() > 0.35) {
        const midRoseRadius = (12 + prng() * 8) * flowerScale;
        const midRose = generateRoseData(
          cp1X + (prng() - 0.5) * 20,
          cp1Y + (prng() - 0.5) * 20,
          midRoseRadius,
          prng() * Math.PI * 2,
          primaryPetalColor,
          secondaryPetalColor
        );
        midRose.isForeground = prng() > 0.4;
        midRose.id = `rose-mid-${c}`;
        roses.push(midRose);
      }
    }

    // 6. Framing Rosettes at Text Start & End
    const leftFramingRose = generateRoseData(
      textStart - 25,
      centerY + 5,
      22 * flowerScale,
      0.4,
      primaryPetalColor,
      secondaryPetalColor
    );
    leftFramingRose.isForeground = true;
    leftFramingRose.id = 'rose-frame-left';
    roses.push(leftFramingRose);

    const rightFramingRose = generateRoseData(
      textEnd + 25,
      centerY + 5,
      22 * flowerScale,
      -0.4,
      primaryPetalColor,
      secondaryPetalColor
    );
    rightFramingRose.isForeground = true;
    rightFramingRose.id = 'rose-frame-right';
    roses.push(rightFramingRose);

    return { vines, tendrils, leaves, roses };
  }, [text, density, seed, curliness, flowerScale, primaryPetalColor, secondaryPetalColor]);

  const backgroundRoses = gardenData.roses.filter((r) => !r.isForeground);
  const foregroundRoses = gardenData.roses.filter((r) => r.isForeground);

  const dynamicFontSize = useMemo(() => {
    const len = (text || '').trim().length;
    if (len <= 14) return 56;
    if (len <= 20) return 48;
    if (len <= 28) return 38;
    if (len <= 36) return 30;
    return 24;
  }, [text]);

  return (
    <div
      className={`relative w-full max-w-[820px] mx-auto flex flex-col items-center justify-center select-none ${className}`}
      style={{ minHeight: '220px' }}
    >
      <style>{`
        @keyframes typeGardenGrow {
          from {
            stroke-dashoffset: 600;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes typeGardenPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes typeGardenBreeze {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(1.8deg) translateY(-2px);
          }
        }
        .animate-vine-grow {
          stroke-dasharray: 600;
          animation: typeGardenGrow 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-bloom-pop {
          transform-box: fill-box;
          transform-origin: center;
          animation: typeGardenPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .animate-breeze-subtle {
          transform-origin: 410px 120px;
          animation: typeGardenBreeze 7s ease-in-out infinite alternate;
        }
      `}</style>

      {/* SVG Container with overflow: visible and generous viewBox to eliminate ANY clipping */}
      <svg
        key={`type-garden-svg-${replayKey}-${seed}`}
        viewBox="0 0 820 220"
        className="w-full h-auto overflow-visible select-none pointer-events-none drop-shadow-xs"
        style={{
          minHeight: '200px',
          overflow: 'visible',
        }}
      >
        <defs>
          <filter id="tg-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.12)" />
          </filter>
        </defs>

        {/* ======================================================== */}
        {/* LAYER 1 & 2: BACKGROUND VINES, SPIRAL TENDRILS & LEAVES  */}
        {/* ======================================================== */}
        <g id="type-garden-background-layer" className="animate-breeze-subtle">
          {/* Climbing Main Vines */}
          {gardenData.vines.map((v, i) => (
            <path
              key={v.id}
              d={v.d}
              fill="none"
              stroke={stemColor}
              strokeWidth={v.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-vine-grow"
              style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
            />
          ))}

          {/* Coiling Spiral Tendrils */}
          {gardenData.tendrils.map((td, i) => (
            <path
              key={td.id}
              d={td.d}
              fill="none"
              stroke={stemColor}
              strokeWidth={td.strokeWidth}
              strokeLinecap="round"
              opacity="0.9"
              className="animate-vine-grow"
              style={{ animationDelay: `${(0.4 + i * 0.08).toFixed(2)}s` }}
            />
          ))}

          {/* Illustrated Leaves with Inner Midrib & Side Veins */}
          {gardenData.leaves.map((lf, i) => (
            <g key={`leaf-${i}`} transform={lf.transform}>
              <g
                className="animate-bloom-pop"
                style={{ animationDelay: `${(0.4 + (i % 6) * 0.08).toFixed(2)}s` }}
              >
                {/* Pointed Leaf Blade */}
                <path
                  d={lf.leafPath}
                  fill={stemColor}
                  opacity="0.92"
                  filter="url(#tg-soft-shadow)"
                />
                {/* Inner Central Midrib */}
                <path
                  d={lf.midribPath}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="1.0"
                  strokeLinecap="round"
                />
                {/* Delicate Angled Side Ribs */}
                <path
                  d={lf.lateralVeins}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                />
              </g>
            </g>
          ))}

          {/* Background Layered Roses */}
          {backgroundRoses.map((rose, i) => (
            <g key={rose.id} transform={rose.transform}>
              <g
                className="animate-bloom-pop"
                style={{ animationDelay: `${(0.6 + i * 0.1).toFixed(2)}s` }}
                filter="url(#tg-soft-shadow)"
              >
                {/* Tier 1: Outer Wavy Scalloped Petals */}
                <g fill={rose.primaryColor}>
                  {rose.outerPetals.map((op, idx) => (
                    <path key={`op-${idx}`} d={op.d} transform={op.transform} />
                  ))}
                </g>

                {/* Tier 2: Mid Cupped Dual-Tone Petals */}
                <g fill={rose.secondaryColor} opacity="0.95">
                  {rose.midPetals.map((mp, idx) => (
                    <path key={`mp-${idx}`} d={mp.d} transform={mp.transform} />
                  ))}
                </g>

                {/* Tier 3: Inner Concentric Swirl Core */}
                <circle cx="0" cy="0" r={rose.coreRadius} fill={rose.primaryColor} />
                <g fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" strokeLinecap="round">
                  {rose.heartFolds.map((hf, idx) => (
                    <path key={`hf-${idx}`} d={hf} />
                  ))}
                </g>
              </g>
            </g>
          ))}
        </g>

        {/* ======================================================== */}
        {/* LAYER 3: PRIMARY ARABIC TYPOGRAPHY (CRISP & CENTRALLY PLACED) */}
        {/* ======================================================== */}
        <text
          x="410"
          y="126"
          textAnchor="middle"
          fill={textColor}
          style={{
            fontFamily: "'Amiri', 'Aref Ruqaa', 'Readex Pro', serif",
            fontSize: `${dynamicFontSize}px`,
            fontWeight: 700,
            letterSpacing: '0.015em',
            filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.85)) drop-shadow(0 1px 2px rgba(0,0,0,0.06))',
          }}
        >
          {text}
        </text>

        {/* ======================================================== */}
        {/* LAYER 4: FOREGROUND OVERLAPPING BLOOMS (CREATING TRUE 3D DEPTH) */}
        {/* ======================================================== */}
        <g id="type-garden-foreground-layer" className="animate-breeze-subtle">
          {foregroundRoses.map((rose, i) => (
            <g key={rose.id} transform={rose.transform}>
              <g
                className="animate-bloom-pop"
                style={{ animationDelay: `${(0.75 + i * 0.1).toFixed(2)}s` }}
                filter="url(#tg-soft-shadow)"
              >
                {/* Outer Scalloped Petals */}
                <g fill={rose.primaryColor}>
                  {rose.outerPetals.map((op, idx) => (
                    <path key={`fg-op-${idx}`} d={op.d} transform={op.transform} />
                  ))}
                </g>

                {/* Mid Layer Contrasting Dual-Tone Petals */}
                <g fill={rose.secondaryColor} opacity="0.96">
                  {rose.midPetals.map((mp, idx) => (
                    <path key={`fg-mp-${idx}`} d={mp.d} transform={mp.transform} />
                  ))}
                </g>

                {/* Inner Swirl Heart */}
                <circle cx="0" cy="0" r={rose.coreRadius} fill={rose.primaryColor} />
                <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.3" strokeLinecap="round">
                  {rose.heartFolds.map((hf, idx) => (
                    <path key={`fg-hf-${idx}`} d={hf} />
                  ))}
                </g>
              </g>
            </g>
          ))}
        </g>
      </svg>

      {/* ======================================================== */}
      {/* DIRECT IN-PAGE TYPING OVERLAY (CLICK TO TYPE DIRECTLY!)  */}
      {/* ======================================================== */}
      <div
        onClick={() => {
          if (onToggleDirectEdit) onToggleDirectEdit();
          if (inputRef.current) inputRef.current.focus();
        }}
        className="absolute inset-0 cursor-text flex items-center justify-center pointer-events-auto group/type"
        title="انقر هنا للكتابة وتعديل النص مباشرة!"
      >
        <div className="relative flex items-center justify-center max-w-[580px] w-full px-4">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => onTextChange && onTextChange(e.target.value)}
            onFocus={() => setIsTypingFocused(true)}
            onBlur={() => setIsTypingFocused(false)}
            placeholder="دار الورد للمناسبات"
            className="w-full text-center bg-transparent border-none outline-none font-bold text-transparent caret-emerald-700 text-3xl sm:text-4xl selection:bg-emerald-900/20"
            style={{
              fontFamily: "'Amiri', 'Aref Ruqaa', 'Readex Pro', serif",
            }}
          />

          {/* Interactive Blinking Cursor and Quick Hint Pill */}
          {!isTypingFocused && (
            <div className="absolute -bottom-1 flex items-center gap-1.5 opacity-0 group-hover/type:opacity-100 transition-opacity bg-stone-900/85 backdrop-blur-md text-white text-[10px] px-2.5 py-0.5 rounded-full shadow-md pointer-events-none">
              <span>✍️ انقر للكتابة والتعديل المباشر</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
