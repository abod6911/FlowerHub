import React, { useMemo } from 'react';
import { useStudioStore } from '../context/StudioThemeContext';
import { Float } from './fancy/float';

/**
 * FloatingHeroPetals
 * 3 to 4 delicate SVG rose petals in the hero background wrapped in <Float>
 * creating authentic depth of field (foreground blur, crisp midground, background soft)
 */
export function FloatingHeroPetals({ className = '' }) {
  const petals = [
    {
      id: 'hero-petal-1',
      className: 'top-[8%] start-[6%] w-10 h-13 opacity-75 blur-[0.5px]',
      speed: 0.35,
      amplitude: [8, 14, 10],
      rotationRange: [12, 12, 6],
      timeOffset: 0,
      scale: 1.0,
      color1: '#9B1B36',
      color2: '#680D21',
    },
    {
      id: 'hero-petal-2',
      className: 'top-[20%] end-[8%] w-14 h-18 opacity-85',
      speed: 0.42,
      amplitude: [10, 16, 12],
      rotationRange: [14, 14, 8],
      timeOffset: 1.8,
      scale: 1.15,
      color1: '#BE123C',
      color2: '#4C0519',
    },
    {
      id: 'hero-petal-3',
      className: 'top-[52%] start-[12%] w-8 h-10 opacity-60 blur-[1px]',
      speed: 0.28,
      amplitude: [6, 10, 8],
      rotationRange: [8, 8, 4],
      timeOffset: 3.4,
      scale: 0.8,
      color1: '#881337',
      color2: '#3A0311',
    },
    {
      id: 'hero-petal-4',
      className: 'top-[70%] end-[14%] w-16 h-20 opacity-90 blur-[1.5px]',
      speed: 0.48,
      amplitude: [12, 20, 14],
      rotationRange: [16, 16, 10],
      timeOffset: 5.1,
      scale: 1.3,
      color1: '#BE123C',
      color2: '#7E1529',
    },
  ];

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {petals.map((p) => (
        <div key={p.id} className={`absolute ${p.className}`}>
          <Float
            speed={p.speed}
            amplitude={p.amplitude}
            rotationRange={p.rotationRange}
            timeOffset={p.timeOffset}
          >
            <svg
              viewBox="0 0 30 40"
              fill="none"
              className="w-full h-full drop-shadow-md"
              style={{ transform: `scale(${p.scale})` }}
            >
              <defs>
                <linearGradient id={`grad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={p.color1} stopOpacity="0.95" />
                  <stop offset="60%" stopColor={p.color2} stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#2A020B" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <path
                d="M15 2 C25 2, 29 16, 27 28 C25 36, 18 39, 15 39 C12 39, 5 36, 3 28 C1 16, 5 2, 15 2 Z"
                fill={`url(#grad-${p.id})`}
              />
              <path
                d="M15 6 Q14 22 15 36"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </svg>
          </Float>
        </div>
      ))}
    </div>
  );
}

/**
 * AmbientRosePetals
 * Multi-mode Ambient Atmosphere Component:
 * 1. 'petals': 60fps lightweight floating rose petal animation overlay across the viewport
 * 2. 'gold_stardust': Micro gold shimmering stardust particles
 * 3. 'warm_glow': Soft ambient radial glow gradients
 * 4. 'none': Clean background
 */
export default function AmbientRosePetals({
  enabled = true,
  opacity = 0.55,
  count = 14,
}) {
  let storeCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeCtx = useStudioStore();
  } catch {
    // outside provider fallback
  }

  const ambientMode = storeCtx?.config?.ambientEffect || 'petals'; // 'petals' | 'gold_stardust' | 'warm_glow' | 'none'
  const isEnabled = storeCtx?.config?.floatingPetalsEnabled !== undefined
    ? storeCtx.config.floatingPetalsEnabled
    : enabled;
  const activeOpacity = storeCtx?.config?.petalsOpacity ?? opacity;
  const activeCount = storeCtx?.config?.petalsCount ?? count;

  // Petals Data
  const petals = useMemo(() => {
    return Array.from({ length: Math.min(activeCount, 24) }, (_, i) => {
      const pseudoRand = ((i * 37) % 100) / 100;
      const left = (i * 100) / activeCount + (pseudoRand * 8 - 4);
      const delay = (i * 0.7) % 8;
      const duration = 7 + (i % 5) * 1.5;
      const size = 15 + (i % 4) * 5;
      const rotation = (i * 45) % 360;
      const swayDuration = 3 + (i % 3);
      return {
        id: i,
        left: `${Math.max(2, Math.min(96, left))}%`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        swayDuration: `${swayDuration}s`,
        size,
        rotation,
      };
    });
  }, [activeCount]);

  // Gold Stardust Data
  const stardust = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const left = (i * 5 + ((i * 13) % 17)) % 96;
      const top = (i * 7 + ((i * 19) % 23)) % 94;
      const delay = (i * 0.4) % 6;
      const duration = 4 + (i % 4) * 1.2;
      const size = 2 + (i % 3);
      return {
        id: i,
        left: `${left}%`,
        top: `${top}%`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        size,
      };
    });
  }, []);

  if (!isEnabled || ambientMode === 'none') return null;

  // Mode 2: Gold Stardust
  if (ambientMode === 'gold_stardust') {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
        style={{ opacity: activeOpacity * 0.85 }}
        aria-hidden="true"
      >
        <style>{`
          @keyframes stardustTwinkle {
            0%, 100% { opacity: 0.15; transform: translateY(0px) scale(0.8); }
            50% { opacity: 0.95; transform: translateY(-12px) scale(1.3); }
          }
        `}</style>
        {stardust.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-100 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animation: `stardustTwinkle ${s.duration} ease-in-out infinite alternate`,
              animationDelay: `${s.delay}s`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    );
  }

  // Mode 3: Warm Ambient Glow
  if (ambientMode === 'warm_glow') {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ opacity: activeOpacity * 0.7 }}
        aria-hidden="true"
      >
        <style>{`
          @keyframes glowBreathe {
            0%, 100% { opacity: 0.35; transform: scale(0.98); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
        `}</style>
        <div
          className="absolute -top-32 start-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-amber-300/20 via-rose-300/10 to-transparent blur-3xl"
          style={{ animation: 'glowBreathe 8s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/2 end-0 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tl from-rose-400/15 via-amber-200/10 to-transparent blur-3xl"
          style={{ animation: 'glowBreathe 10s ease-in-out infinite alternate' }}
        />
      </div>
    );
  }

  // Mode 1: Rose Petals (Default)
  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
      style={{ opacity: activeOpacity }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes petalFall {
          0% {
            transform: translateY(-40px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes petalSway {
          0%, 100% {
            transform: translateX(0px) rotate(-15deg);
          }
          50% {
            transform: translateX(25px) rotate(15deg);
          }
        }
      `}</style>

      {/* Floating Hero Petals for depth */}
      <FloatingHeroPetals />

      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute -top-10"
          style={{
            left: p.left,
            animation: `petalFall ${p.duration} linear infinite`,
            animationDelay: p.delay,
            willChange: 'transform, opacity',
          }}
        >
          <div
            style={{
              animation: `petalSway ${p.swayDuration} ease-in-out infinite alternate`,
              width: `${p.size}px`,
              height: `${p.size * 1.3}px`,
            }}
          >
            {/* SVG Organic Rose Petal */}
            <svg
              viewBox="0 0 30 40"
              fill="none"
              className="w-full h-full drop-shadow-xs"
              style={{
                transform: `rotate(${p.rotation}deg)`,
              }}
            >
              <defs>
                <linearGradient id={`petal-grad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#BE123C" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#881337" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#4C0519" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path
                d="M15 2 C25 2, 29 16, 27 28 C25 36, 18 39, 15 39 C12 39, 5 36, 3 28 C1 16, 5 2, 15 2 Z"
                fill={`url(#petal-grad-${p.id})`}
              />
              <path
                d="M15 6 Q14 22 15 36"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.75"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
