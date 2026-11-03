import React, { useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * TypeGardenCanvas - Generative Botanical Arabic Typography Engine
 * Inspired by type-garden.vercel.app
 * 
 * Features:
 * 1. Offscreen Canvas Glyph Skeleton & Contour Sampling.
 * 2. Organic Branching Algorithm with Cubic Curves & Noise.
 * 3. 4 Selectable Procedural Flower Species (Royal Rose, Sakura, Camellia, Minimal Gold).
 * 4. Progressive Growth Animation (0% to 100%) + 60fps Ambient Breeze Physics.
 * 5. Interactive Mouse/Touch Repulsion & Wind Sway.
 * 6. High-DPI Retina (devicePixelRatio) Crisp Rendering.
 * 7. Guaranteed 100% Foregound Calligraphy Legibility.
 */

// Seeded PRNG (Mulberry32) for deterministic art generation
function createPrng(seed = 48271) {
  let s = Math.floor(Math.abs(seed)) % 2147483647;
  if (s <= 0) s = 123456789;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function TypeGardenCanvas({
  text = 'دار الورد للمناسبات',
  species = 'royal_rose', // 'royal_rose' | 'sakura' | 'camellia' | 'minimal_gold'
  density = 65, // 10 to 100
  growthSpeed = 1.0, // 0.5 to 2.5
  windSway = 1.0, // 0 to 2.5
  branchReach = 55, // 20 to 100
  stemColor = '#1B3B2B',
  petalColor = '#9B1B36',
  seed = 48271,
  replayKey = 0,
  interactive = true,
  textColor = '#1C1917',
  isDark = false,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const mousePosRef = useRef({ x: -1000, y: -1000, active: false });

  // Store branches state
  const branchesRef = useRef([]);
  const startTimeRef = useRef(0);
  const isGrownRef = useRef(false);

  // Logical canvas dimensions
  const WIDTH = 640;
  const HEIGHT = 180;

  // Species color palettes
  const activePalette = useMemo(() => {
    const isGold = species === 'minimal_gold';
    return {
      stem: isGold ? '#B45309' : (stemColor || '#1B3B2B'),
      stemSecondary: isGold ? '#D97706' : '#2D4A3A',
      leaf: isGold ? '#D4AF37' : (stemColor || '#1B3B2B'),
      leafVein: isGold ? 'rgba(255, 235, 150, 0.6)' : 'rgba(255, 255, 255, 0.35)',
      petalPrimary: isGold ? '#F59E0B' : (petalColor || '#9B1B36'),
      petalSecondary: isGold ? '#D4AF37' : '#BE1E45',
      petalCore: isGold ? '#78350F' : '#5A0B1B',
      stamen: '#FBBF24',
    };
  }, [species, stemColor, petalColor]);

  // 1. Offscreen Glyph Sampling & Branch Generation
  const generateGarden = useCallback(() => {
    const prng = createPrng(seed);
    const offscreen = document.createElement('canvas');
    offscreen.width = WIDTH;
    offscreen.height = HEIGHT;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    // Draw reference Arabic text to sample letter contours
    offCtx.fillStyle = '#000000';
    offCtx.font = "bold 52px 'Amiri', 'Aref Ruqaa', 'Readex Pro', 'Cairo', serif";
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    const textCenterX = WIDTH / 2;
    const textCenterY = HEIGHT / 2 + 10;
    offCtx.fillText(text, textCenterX, textCenterY);

    // Read pixel data
    const imgData = offCtx.getImageData(0, 0, WIDTH, HEIGHT);
    const data = imgData.data;

    // Find bounding box and contour candidate pixels
    let minX = WIDTH, maxX = 0, minY = HEIGHT, maxY = 0;
    const edgeCandidates = [];

    const step = 4;
    for (let y = step; y < HEIGHT - step; y += step) {
      for (let x = step; x < WIDTH - step; x += step) {
        const idx = (y * WIDTH + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 80) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          // Check if it's an outer boundary pixel (has a transparent neighbor)
          const topA = data[((y - step) * WIDTH + x) * 4 + 3];
          const botA = data[((y + step) * WIDTH + x) * 4 + 3];
          const leftA = data[(y * WIDTH + (x - step)) * 4 + 3];
          const rightA = data[(y * WIDTH + (x + step)) * 4 + 3];

          if (topA < 50 || botA < 50 || leftA < 50 || rightA < 50) {
            edgeCandidates.push({ x, y, topA, botA, leftA, rightA });
          }
        }
      }
    }

    if (edgeCandidates.length === 0) {
      // Fallback anchor points if offscreen rendering was empty
      minX = textCenterX - 180;
      maxX = textCenterX + 180;
      minY = textCenterY - 30;
      maxY = textCenterY + 30;
      for (let i = 0; i < 20; i++) {
        edgeCandidates.push({
          x: minX + prng() * (maxX - minX),
          y: minY + prng() * (maxY - minY),
        });
      }
    }

    // Number of branches based on density (10% -> 4 branches, 100% -> 22 branches)
    const normDensity = Math.max(0.1, Math.min(1.0, density / 100));
    const branchCount = Math.round(4 + normDensity * 18);

    // Shuffle and pick well-distributed anchors along perimeter
    const shuffled = [...edgeCandidates].sort(() => prng() - 0.5);
    const selectedAnchors = [];
    const minDistance = Math.max(18, 55 - branchCount * 1.5);

    for (const pt of shuffled) {
      if (selectedAnchors.length >= branchCount) break;
      const isTooClose = selectedAnchors.some(
        (a) => Math.hypot(a.x - pt.x, a.y - pt.y) < minDistance
      );
      if (!isTooClose) {
        selectedAnchors.push(pt);
      }
    }

    // Build procedural branch curves sprouting outward away from text center
    const newBranches = selectedAnchors.map((anchor, index) => {
      // Direction vector: predominantly outward into perimeter negative space
      const dx = anchor.x - textCenterX;
      const dy = anchor.y - textCenterY;
      const angleOut = Math.atan2(dy, dx);
      // Add natural curl perturbation
      const branchAngle = angleOut + (prng() - 0.5) * 0.7;

      // Reach length scaled by branchReach slider
      const reach = branchReach * (0.65 + prng() * 0.75);
      const segLength = reach * 0.45;

      // Control points for smooth organic cubic curve
      const p0 = { x: anchor.x, y: anchor.y };
      const cp1 = {
        x: p0.x + Math.cos(branchAngle + (prng() - 0.5) * 0.6) * segLength,
        y: p0.y + Math.sin(branchAngle + (prng() - 0.5) * 0.6) * segLength,
      };
      const curlDirection = prng() > 0.5 ? 1 : -1;
      const cp2 = {
        x: cp1.x + Math.cos(branchAngle + curlDirection * 0.6) * (segLength * 0.8),
        y: cp1.y + Math.sin(branchAngle + curlDirection * 0.6) * (segLength * 0.8),
      };
      const p3 = {
        x: cp2.x + Math.cos(branchAngle + curlDirection * 0.3) * (segLength * 0.6),
        y: cp2.y + Math.sin(branchAngle + curlDirection * 0.3) * (segLength * 0.6),
      };

      // Leaves along the branch (1 to 2 leaves)
      const leaves = [];
      const numLeaves = prng() > 0.35 ? (prng() > 0.6 ? 2 : 1) : 0;
      for (let l = 0; l < numLeaves; l++) {
        const t = 0.35 + prng() * 0.45;
        const leafSide = (l % 2 === 0 ? 1 : -1) * (prng() > 0.2 ? 1 : -1);
        leaves.push({
          t,
          side: leafSide,
          size: 7 + prng() * 6,
          angle: (prng() - 0.5) * 0.5,
        });
      }

      // Flower at tip or junction
      const hasFlower = prng() > 0.15; // 85% of branches carry a flower or bud
      const flowerRadius = 9 + prng() * 11;
      const flowerRotation = prng() * Math.PI * 2;

      // Stagger growth start
      const startFraction = (index / branchCount) * 0.35 + prng() * 0.15;
      const durationFraction = 0.5 + prng() * 0.35;

      return {
        id: index,
        p0,
        cp1,
        cp2,
        p3,
        leaves,
        hasFlower,
        flowerRadius,
        flowerRotation,
        baseThickness: 2.2 + prng() * 1.0,
        tipThickness: 0.8,
        startFraction,
        durationFraction,
        swayPhase: prng() * Math.PI * 2,
        swaySpeed: 0.8 + prng() * 0.6,
      };
    });

    branchesRef.current = newBranches;
    startTimeRef.current = performance.now();
    isGrownRef.current = false;
  }, [text, density, branchReach, seed]);

  // Re-generate on parameter change or replayKey
  useEffect(() => {
    generateGarden();
  }, [generateGarden, replayKey]);

  // Cubic Bezier interpolation helper
  const getCubicPoint = (p0, cp1, cp2, p3, t) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x: mt3 * p0.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * p3.y,
    };
  };

  // 2. Procedural Flower Rendering Engine (4 Species)
  const drawProceduralFlower = useCallback(
    (ctx, x, y, radius, rotation, bloomScale) => {
      if (radius <= 0 || bloomScale <= 0) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(bloomScale, bloomScale);

      // --- Species 1: Royal Rose (جوري ملكي) ---
      if (species === 'royal_rose') {
        const numOuterPetals = 5;
        // Outer layer petals
        ctx.fillStyle = activePalette.petalPrimary;
        for (let i = 0; i < numOuterPetals; i++) {
          const angle = (i * Math.PI * 2) / numOuterPetals;
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -radius * 0.55, radius * 0.48, radius * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Mid cup petals
        ctx.fillStyle = activePalette.petalSecondary;
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI * 2) / 4 + Math.PI / 4;
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -radius * 0.35, radius * 0.36, radius * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Inner nested swirl core
        ctx.fillStyle = activePalette.petalCore;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.16, 0.4, Math.PI * 1.6);
        ctx.stroke();
      }
      // --- Species 2: Sakura Blossom (أزهار الكرز) ---
      else if (species === 'sakura') {
        const numPetals = 5;
        ctx.fillStyle = activePalette.petalPrimary;
        for (let i = 0; i < numPetals; i++) {
          const angle = (i * Math.PI * 2) / numPetals;
          ctx.save();
          ctx.rotate(angle);

          // Scalloped heart-shaped sakura petal
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(
            -radius * 0.45, -radius * 0.4,
            -radius * 0.5, -radius * 0.9,
            -radius * 0.15, -radius * 0.95
          );
          // Notch in the sakura tip
          ctx.lineTo(0, -radius * 0.82);
          ctx.lineTo(radius * 0.15, -radius * 0.95);
          ctx.bezierCurveTo(
            radius * 0.5, -radius * 0.9,
            radius * 0.45, -radius * 0.4,
            0, 0
          );
          ctx.fill();
          ctx.restore();
        }

        // Central stamens with golden pollens
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.0;
        ctx.fillStyle = activePalette.stamen;
        for (let s = 0; s < 8; s++) {
          const stamenAngle = (s * Math.PI * 2) / 8 + 0.2;
          const stamenLen = radius * 0.38;
          const sx = Math.cos(stamenAngle) * stamenLen;
          const sy = Math.sin(stamenAngle) * stamenLen;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(sx, sy);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // --- Species 3: Luxury Camellia (كاميليا فاخرة) ---
      else if (species === 'camellia') {
        // 3 nested tiers of symmetric geometric petals
        const tiers = [
          { count: 6, rad: radius * 0.95, color: activePalette.petalPrimary, offset: 0 },
          { count: 6, rad: radius * 0.72, color: activePalette.petalSecondary, offset: Math.PI / 6 },
          { count: 5, rad: radius * 0.48, color: activePalette.petalCore, offset: Math.PI / 12 },
        ];

        for (const tier of tiers) {
          ctx.fillStyle = tier.color;
          for (let i = 0; i < tier.count; i++) {
            const angle = (i * Math.PI * 2) / tier.count + tier.offset;
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(0, -tier.rad * 0.5, tier.rad * 0.4, tier.rad * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Golden pistil
        ctx.fillStyle = activePalette.stamen;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
      // --- Species 4: Minimal Gold Botanicals (أغصان الذهب) ---
      else if (species === 'minimal_gold') {
        // Glistening gold blossom rosette
        ctx.fillStyle = '#D4AF37';
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -radius * 0.55, radius * 0.22, radius * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Inner glowing core
        ctx.fillStyle = '#FDE68A';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    },
    [species, activePalette]
  );

  // 3. Procedural Leaf Rendering
  const drawProceduralLeaf = useCallback(
    (ctx, x, y, size, angle, side, scale) => {
      if (size <= 0 || scale <= 0) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);

      ctx.fillStyle = activePalette.leaf;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const perp = side * size * 0.55;
      ctx.quadraticCurveTo(perp, -size * 0.5, 0, -size);
      ctx.quadraticCurveTo(-perp * 0.35, -size * 0.5, 0, 0);
      ctx.fill();

      // Leaf center vein
      ctx.strokeStyle = activePalette.leafVein;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size * 0.85);
      ctx.stroke();

      ctx.restore();
    },
    [activePalette]
  );

  // 4. Main 60fps Animation Loop (Growth & Breeze Physics)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High-DPI Retina
    const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    let isRunning = true;

    const renderFrame = (now) => {
      if (!isRunning) return;

      const elapsed = (now - startTimeRef.current) / 1000;
      // Growth duration: ~2.0s / growthSpeed
      const growthDuration = 2.0 / Math.max(0.2, growthSpeed);
      const overallGrowth = Math.min(1.0, elapsed / growthDuration);

      if (overallGrowth >= 1.0 && !isGrownRef.current) {
        isGrownRef.current = true;
      }

      // Clear canvas cleanly
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const mouse = mousePosRef.current;
      const branches = branchesRef.current;

      // -------------------------------------------------------------
      // LAYER 1: BOTANICAL BRANCHES, LEAVES & BLOOMING FLOWERS
      // -------------------------------------------------------------
      for (const branch of branches) {
        // Individual branch growth progress (0 to 1)
        const branchProgress = Math.max(
          0,
          Math.min(
            1.0,
            (overallGrowth - branch.startFraction) / branch.durationFraction
          )
        );

        if (branchProgress <= 0) continue;

        // Smooth cubic ease out
        const currentT = 1 - Math.pow(1 - branchProgress, 2.4);

        // Ambient Breeze Physics (60fps sine wave)
        const swayAmount =
          Math.sin(elapsed * 1.8 * branch.swaySpeed + branch.swayPhase) *
          6.0 *
          windSway;

        // Interactive Mouse / Touch Repulsion
        let mouseDisplacementX = 0;
        let mouseDisplacementY = 0;
        if (mouse.active) {
          const distToMouse = Math.hypot(branch.p3.x - mouse.x, branch.p3.y - mouse.y);
          if (distToMouse < 90) {
            const force = (1 - distToMouse / 90) * 16;
            const angle = Math.atan2(branch.p3.y - mouse.y, branch.p3.x - mouse.x);
            mouseDisplacementX = Math.cos(angle) * force;
            mouseDisplacementY = Math.sin(angle) * force;
          }
        }

        // Dynamic points with sway
        const p0 = branch.p0;
        const cp1 = {
          x: branch.cp1.x + swayAmount * 0.25 + mouseDisplacementX * 0.2,
          y: branch.cp1.y + mouseDisplacementY * 0.2,
        };
        const cp2 = {
          x: branch.cp2.x + swayAmount * 0.65 + mouseDisplacementX * 0.5,
          y: branch.cp2.y + mouseDisplacementY * 0.5,
        };
        const p3 = {
          x: branch.p3.x + swayAmount + mouseDisplacementX,
          y: branch.p3.y + mouseDisplacementY,
        };

        // Draw segmented branch line with tapering thickness
        const steps = Math.max(5, Math.round(currentT * 24));
        let prevPt = p0;

        for (let s = 1; s <= steps; s++) {
          const t = (s / 24) * currentT;
          const pt = getCubicPoint(p0, cp1, cp2, p3, t);

          ctx.beginPath();
          ctx.moveTo(prevPt.x, prevPt.y);
          ctx.lineTo(pt.x, pt.y);

          // Taper thickness
          const thick =
            branch.baseThickness -
            t * (branch.baseThickness - branch.tipThickness);
          ctx.lineWidth = Math.max(0.6, thick);
          ctx.strokeStyle = activePalette.stem;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          prevPt = pt;
        }

        // Draw Leaves attached along the branch
        for (const leaf of branch.leaves) {
          if (currentT >= leaf.t) {
            const leafPt = getCubicPoint(p0, cp1, cp2, p3, leaf.t);
            // Leaf scale springs up as branch grows past it
            const leafGrowth = Math.min(1.0, (currentT - leaf.t) / 0.25);
            const springScale = Math.sin(leafGrowth * Math.PI * 0.5);
            drawProceduralLeaf(
              ctx,
              leafPt.x,
              leafPt.y,
              leaf.size,
              leaf.angle,
              leaf.side,
              springScale
            );
          }
        }

        // Draw Blooming Flower at the tip of the branch
        if (branch.hasFlower && currentT > 0.7) {
          const tipPt = getCubicPoint(p0, cp1, cp2, p3, currentT);
          // Flower spring bloom
          const flowerProgress = Math.min(1.0, (currentT - 0.7) / 0.3);
          const springBloom =
            flowerProgress === 1.0
              ? 1.0
              : Math.sin(flowerProgress * Math.PI * 0.5) * 1.1;

          drawProceduralFlower(
            ctx,
            tipPt.x,
            tipPt.y,
            branch.flowerRadius,
            branch.flowerRotation + swayAmount * 0.05,
            springBloom
          );
        }
      }

      // -------------------------------------------------------------
      // LAYER 2: CRISP FOREGROUND ARABIC CALLIGRAPHY (100% LEGIBLE)
      // -------------------------------------------------------------
      ctx.save();
      ctx.font = "bold 52px 'Amiri', 'Aref Ruqaa', 'Readex Pro', 'Cairo', serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textCenterX = WIDTH / 2;
      const textCenterY = HEIGHT / 2 + 10;

      // Subtle atmospheric drop shadow for legibility over organic stems
      ctx.shadowColor = isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = textColor || (isDark ? '#FFFFFF' : '#1C1917');
      ctx.fillText(text, textCenterX, textCenterY);

      // Clean secondary pass with zero shadow for razor-sharp letterform edges
      ctx.shadowColor = 'transparent';
      ctx.fillText(text, textCenterX, textCenterY);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    text,
    species,
    growthSpeed,
    windSway,
    activePalette,
    drawProceduralFlower,
    drawProceduralLeaf,
    textColor,
    isDark,
  ]);

  // Mouse & Touch interaction handlers
  const handlePointerMove = (e) => {
    if (!interactive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    mousePosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      active: true,
    };
  };

  const handlePointerLeave = () => {
    mousePosRef.current = { x: -1000, y: -1000, active: false };
  };

  return (
    <div
      className={`relative w-full max-w-[640px] mx-auto aspect-[640/180] flex items-center justify-center overflow-visible select-none ${className}`}
      style={style}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onTouchMove={(e) => {
        if (e.touches[0]) handlePointerMove(e.touches[0]);
      }}
      onTouchEnd={handlePointerLeave}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
