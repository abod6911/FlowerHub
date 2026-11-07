import React, { useMemo } from 'react';
import { useStudioStore } from '../context/StudioThemeContext';
import { Float } from './fancy/float';

/**
 * FloatingHeroPetals
 * 4 to 5 delicate SVG rose petals in the hero background wrapped in <Float>
 * Very subtle, semi-transparent (opacity-20 blur-[1px]) drifting slowly without obstructing text
 */
export function FloatingHeroPetals({ className = '' }) {
  const petals = [
    {
      id: 'hero-petal-1',
      className: 'top-[6%] right-[4%] w-8 h-10 opacity-20 blur-[1px]',
      speed: 0.22,
      amplitude: [6, 10, 8],
      rotationRange: [10, 10, 5],
      timeOffset: 0,
      scale: 0.9,
      color1: '#9B1B36',
      color2: '#680D21',
    },
    {
      id: 'hero-petal-2',
      className: 'top-[16%] left-[6%] w-10 h-13 opacity-25 blur-[1.2px]',
      speed: 0.28,
      amplitude: [8, 12, 10],
      rotationRange: [12, 12, 6],
      timeOffset: 1.5,
      scale: 1.05,
      color1: '#BE123C',
      color2: '#4C0519',
    },
    {
      id: 'hero-petal-3',
      className: 'top-[45%] right-[8%] w-7 h-9 opacity-15 blur-[0.8px]',
      speed: 0.18,
      amplitude: [5, 8, 6],
      rotationRange: [8, 8, 4],
      timeOffset: 3.1,
      scale: 0.75,
      color1: '#881337',
      color2: '#3A0311',
    },
    {
      id: 'hero-petal-4',
      className: 'top-[65%] left-[10%] w-11 h-14 opacity-20 blur-[1.4px]',
      speed: 0.32,
      amplitude: [9, 15, 11],
      rotationRange: [14, 14, 8],
      timeOffset: 4.6,
      scale: 1.15,
      color1: '#BE123C',
      color2: '#7E1529',
    },
    {
      id: 'hero-petal-5',
      className: 'top-[30%] left-[45%] w-6 h-8 opacity-15 blur-[0.8px]',
      speed: 0.15,
      amplitude: [4, 7, 5],
      rotationRange: [6, 6, 3],
      timeOffset: 2.2,
      scale: 0.7,
      color1: '#9B1B36',
      color2: '#5A0B1B',
    },
  ];

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className || 'z-0'}`}
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
              className="w-full h-full drop-shadow-xs"
              style={{ transform: `scale(${p.scale})` }}
            >
              <defs>
                <linearGradient id={`grad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={p.color1} stopOpacity="0.85" />
                  <stop offset="60%" stopColor={p.color2} stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#2A020B" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <path
                d="M15 2 C25 2, 29 16, 27 28 C25 36, 18 39, 15 39 C12 39, 5 36, 3 28 C1 16, 5 2, 15 2 Z"
                fill={`url(#grad-${p.id})`}
              />
              <path
                d="M15 6 Q14 22 15 36"
                stroke="rgba(255,255,255,0.2)"
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
 * Subtle background ambient petals across the viewport or a contained preview device (e.g. iPhone)
 */
export default function AmbientRosePetals({
  enabled,
  opacity,
  count,
  isAbsolute = false,
  containerClassName = '',
}) {
  let storeCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeCtx = useStudioStore();
  } catch {
    // outside provider fallback
  }

  const isEnabled =
    enabled !== undefined
      ? Boolean(enabled)
      : storeCtx?.config?.floatingPetalsEnabled !== undefined
      ? Boolean(storeCtx.config.floatingPetalsEnabled)
      : true;

  const activeOpacity =
    opacity !== undefined
      ? opacity
      : storeCtx?.config?.petalsOpacity !== undefined
      ? storeCtx.config.petalsOpacity
      : 0.6;

  const activeCount =
    count !== undefined
      ? count
      : storeCtx?.config?.petalsCount !== undefined
      ? storeCtx.config.petalsCount
      : 14;

  const petals = useMemo(() => {
    const total = Math.min(Math.max(activeCount, 4), 32);
    return Array.from({ length: total }, (_, i) => {
      const pseudoRand = ((i * 37) % 100) / 100;
      const left = (i * 100) / total + (pseudoRand * 6 - 3);
      const delay = (i * 0.45) % 6;
      const duration = isAbsolute ? 7 + (i % 4) * 1.5 : 9 + (i % 5) * 2;
      const size = 12 + (i % 5) * 3.5;
      const rotation = (i * 45) % 360;
      const swayDuration = 3.2 + (i % 3);
      return {
        id: i,
        left: `${Math.max(2, Math.min(94, left))}%`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        swayDuration: `${swayDuration}s`,
        size,
        rotation,
      };
    });
  }, [activeCount, isAbsolute]);

  if (!isEnabled) return null;

  return (
    <div
      className={`${
        isAbsolute ? 'absolute inset-0 z-10' : 'fixed inset-0 -z-10'
      } pointer-events-none overflow-hidden transition-opacity duration-300 ${containerClassName}`}
      style={{ opacity: activeOpacity }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes petalFallFull {
          0% {
            transform: translateY(-40px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.75;
          }
          90% {
            opacity: 0.65;
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes petalFallContained {
          0% {
            transform: translateY(-30px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          90% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(800px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes petalSway {
          0%, 100% {
            transform: translateX(0px) rotate(-18deg);
          }
          50% {
            transform: translateX(22px) rotate(18deg);
          }
        }
      `}</style>

      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute -top-10"
          style={{
            left: p.left,
            animation: `${isAbsolute ? 'petalFallContained' : 'petalFallFull'} ${p.duration} linear infinite`,
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
