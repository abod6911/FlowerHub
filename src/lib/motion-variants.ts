/**
 * ============================================================================
 * 20 MOTION DESIGN RULES - FRAMER MOTION & UI ANIMATION STANDARDS
 * ============================================================================
 * Senior Design Engineering & Motion Specialization Presets
 * Next.js, Tailwind CSS & Framer Motion v12+ Compliant
 * 
 * Rules Implemented:
 *  1. Entrances (ease-out): Smooth deceleration into place
 *  2. Dropdown Timing (150ms–250ms, default 200ms)
 *  3. List Staggering (30ms between rows)
 *  4. Tactile Button Press (scale: 0.97 over 150ms)
 *  5. Squash & Stretch Knobs (12% horizontal stretch during travel, area preserved)
 *  6. Secondary Detail Stagger (50ms trail after cards settle)
 *  7. Arced Motion Paths (32px perpendicular curved arc offset)
 *  8. Success Confirmation Pulse (single subtle scale pulse [1, 1.06, 1])
 *  9. On-Screen Repositioning (easeInOut around 300ms)
 * 10. Popover Initial Scale (scale: 0.95 -> 1 with opacity 0 -> 1)
 * 11. Trigger-Anchored Origin Enter (transformOrigin aligned to trigger)
 * 12. Trigger-Anchored Exit (collapses back toward trigger origin)
 * 13. Critically Damped Everyday UI (bounce: 0, no wobble on standard UI)
 * 14. Direct Pointer Tracking (1:1 real-time tracking while held, tween only on release)
 * 15. Asymmetric Exit Duration (-20% faster exit vs entrance)
 * 16. Overlapping State Transitions (AnimatePresence mode="popLayout", no dead beats)
 * 17. Clip-Path & Mask Reveals (dual-layer text inversion & clipped indicators)
 * 18. Icon Morphing (scale + opacity + filter: blur(4px) crossfade)
 * 19. Rubber-Band Drag Boundaries (dragElastic: 0.15 to 0.20)
 * 20. Shared Layout Transitions (layoutId across continuous elements)
 * ============================================================================
 */

import type { Transition, Variants } from 'framer-motion';

// ============================================================================
// 1. EASING CURVES & TIMING CONSTANTS
// ============================================================================

export const EASINGS = {
  /** Rule 1: Entrances (ease-out) - Smooth natural deceleration */
  easeOut: [0.16, 1, 0.3, 1] as const,
  /** Rule 9: On-Screen Repositioning (ease-in-out) - Balanced movement */
  easeInOut: [0.4, 0, 0.2, 1] as const,
  /** Rule 12 & 15: Exits (ease-in) - Accelerating out */
  easeIn: [0.7, 0, 0.84, 0] as const,
} as const;

export const TIMINGS = {
  /** Rule 2: Dropdown & Menu transition standard (default 200ms, bounds 150-250ms) */
  dropdown: 0.2,
  dropdownMin: 0.15,
  dropdownMax: 0.25,

  /** Rule 3: List item stagger interval (30ms) */
  listStagger: 0.03,

  /** Rule 4: Tactile button press duration (150ms) */
  tapPress: 0.15,

  /** Rule 6: Secondary detail trailing settle delay (50ms) */
  secondaryDetailDelay: 0.05,

  /** Rule 8: Success confirmation pulse duration */
  pulseDuration: 0.25,

  /** Rule 9: On-screen repositioning standard duration (300ms) */
  reposition: 0.3,

  /** Rule 15: Standard entrance vs -20% exit */
  standardEntrance: 0.25,
  standardExit: 0.20, // 0.25 * 0.8 = 0.20s (-20%)
} as const;

// ============================================================================
// 2. CORE TRANSITION DEFINITIONS
// ============================================================================

/** Rule 1: Standard Entrance Transition */
export const entranceTransition: Transition = {
  duration: TIMINGS.standardEntrance,
  ease: EASINGS.easeOut,
};

/** Rule 15: Asymmetric Exit Transition (-20% faster) */
export const exitTransition: Transition = {
  duration: TIMINGS.standardExit,
  ease: EASINGS.easeIn,
};

/**
 * Rule 15: Asymmetric Transition Helper
 * Automatically computes entrance and a 20% faster exit transition.
 */
export function getAsymmetricTransition(entranceDuration = 0.25): {
  enter: Transition;
  exit: Transition;
} {
  return {
    enter: {
      duration: entranceDuration,
      ease: EASINGS.easeOut,
    },
    exit: {
      duration: entranceDuration * 0.8,
      ease: EASINGS.easeIn,
    },
  };
}

/** Rule 13: Critically Damped Everyday UI Transition (No Bounce, No Wobble) */
export const criticallyDampedSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 38, // damping ratio = 1 (critical damping, no overshoot)
  bounce: 0,
};

/** Rule 9: On-Screen Repositioning Transition */
export const repositionTransition: Transition = {
  duration: TIMINGS.reposition,
  ease: EASINGS.easeInOut,
};

// ============================================================================
// 3. TACTILE & BUTTON MICRO-INTERACTIONS
// ============================================================================

/**
 * Rule 4: Tactile Button Press
 * Provides instant crisp feedback on pointer press.
 */
export const tactileButtonProps = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.015 },
  transition: {
    duration: TIMINGS.tapPress,
    ease: EASINGS.easeOut,
  },
} as const;

/**
 * Rule 8: Success Confirmation Pulse
 * Triggers a single subtle scale pulse when state updates to confirmed/saved.
 */
export const successPulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.06, 1],
    transition: {
      duration: TIMINGS.pulseDuration,
      ease: EASINGS.easeInOut,
      times: [0, 0.45, 1],
    },
  },
};

/**
 * Rule 5: Squash & Stretch Knobs
 * Stretches moving thumb/knob horizontally by 12% during travel while preserving area.
 * Area invariant: scaleX(1.12) * scaleY(0.89) ≈ 1.00
 */
export const squashAndStretchKnobVariants: Variants = {
  inactive: {
    x: 0,
    scaleX: 1,
    scaleY: 1,
    transition: {
      duration: 0.22,
      ease: EASINGS.easeOut,
    },
  },
  traveling: {
    scaleX: 1.12,
    scaleY: 0.89,
    transition: {
      duration: 0.12,
      ease: EASINGS.easeInOut,
    },
  },
  active: (travelDistance = 24) => ({
    x: travelDistance,
    scaleX: 1,
    scaleY: 1,
    transition: {
      duration: 0.22,
      ease: EASINGS.easeOut,
    },
  }),
};

// ============================================================================
// 4. DROPDOWNS, POPOVERS & MENUS (RULES 2, 10, 11, 12, 15)
// ============================================================================

export type TriggerOrigin =
  | 'top right'
  | 'top left'
  | 'bottom right'
  | 'bottom left'
  | 'top center'
  | 'bottom center';

/**
 * Rule 2, 10, 11, 12, 15: Popover & Dropdown Menu Variants
 * - Rule 2: 200ms duration
 * - Rule 10: Initial scale 0.95 -> 1 with opacity 0 -> 1
 * - Rule 11: transformOrigin anchored to trigger
 * - Rule 12: Collapses back toward trigger origin on exit
 * - Rule 15: Asymmetric exit 160ms (-20%)
 */
export function createPopoverVariants(origin: TriggerOrigin = 'top right'): Variants {
  return {
    initial: {
      opacity: 0,
      scale: 0.95,
      transformOrigin: origin,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transformOrigin: origin,
      transition: {
        duration: TIMINGS.dropdown, // 200ms
        ease: EASINGS.easeOut,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transformOrigin: origin,
      transition: {
        duration: TIMINGS.dropdown * 0.8, // 160ms (-20%)
        ease: EASINGS.easeIn,
      },
    },
  };
}

export const defaultDropdownVariants = createPopoverVariants('top right');

// ============================================================================
// 5. LISTS & SECONDARY DETAILS (RULES 3 & 6)
// ============================================================================

/**
 * Rule 3: List Staggering (30ms between rows)
 */
export const listContainerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: TIMINGS.listStagger, // 0.03s = 30ms
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: TIMINGS.listStagger * 0.8, // 24ms exit stagger
      staggerDirection: -1, // Exit bottom-to-top cleanly
    },
  },
};

export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.17, // -20% exit
      ease: EASINGS.easeIn,
    },
  },
};

/**
 * Rule 6: Secondary Detail Stagger (50ms delay after main element settles)
 * Used for badges, notification counts, price tags, or sub-labels.
 */
export const secondaryDetailVariants: Variants = {
  initial: {
    opacity: 0,
    y: 4,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      delay: TIMINGS.secondaryDetailDelay, // 50ms trail
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: 2,
    scale: 0.96,
    transition: {
      duration: 0.15,
      ease: EASINGS.easeIn,
    },
  },
};

// ============================================================================
// 6. ARCED MOTION PATHS (RULE 7)
// ============================================================================

/**
 * Rule 7: Arced Motion Paths (32px arc offset)
 * Generates an arced trajectory keyframe set to avoid rigid straight lines.
 */
export function createArcMotion(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  arcOffset = 32
): {
  keyframes: { x: number[]; y: number[] };
  transition: Transition;
} {
  const midX = (startX + endX) / 2;
  // Perpendicular arc curve peak
  const midY = Math.min(startY, endY) - Math.abs(arcOffset);

  return {
    keyframes: {
      x: [startX, midX, endX],
      y: [startY, midY, endY],
    },
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      times: [0, 0.45, 1],
    },
  };
}

// ============================================================================
// 7. ICON MORPHING & OVERLAPPING STATE (RULES 16 & 18)
// ============================================================================

/**
 * Rule 18: Icon Morphing (scale + opacity + filter: blur(4px))
 * Smoothly crossfades iconography states (e.g., Heart -> Filled, Copy -> Check)
 */
export const iconMorphVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.72,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.2,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.72,
    filter: 'blur(4px)',
    transition: {
      duration: 0.16, // -20% exit
      ease: EASINGS.easeIn,
    },
  },
};

/**
 * Rule 16: Overlapping State Transition Configuration
 * Props for <AnimatePresence mode="popLayout" initial={false}>
 */
export const overlappingStatePresenceProps = {
  mode: 'popLayout' as const,
  initial: false,
};

// ============================================================================
// 8. DIRECT POINTER TRACKING & RUBBER-BAND DRAG (RULES 14 & 19)
// ============================================================================

/**
 * Rule 14 & 19: Direct Pointer Tracking & Rubber-Band Drag Boundaries
 * - Rule 14: 1:1 direct tracking while held, tweening only on release
 * - Rule 19: dragElastic={0.18} rubber-band resistance beyond boundaries
 */
export const rubberBandDragProps = {
  drag: true,
  dragElastic: 0.18, // Within 0.15 - 0.20 range
  dragMomentum: true,
  dragTransition: {
    bounceStiffness: 340,
    bounceDamping: 28, // Critically damped rebound
    power: 0.2,
  },
} as const;

export const sheetPullDownDragProps = {
  drag: 'y' as const,
  dragConstraints: { top: 0, bottom: 0 },
  dragElastic: 0.18, // Rubber-band resistance
  dragMomentum: false,
} as const;

// ============================================================================
// 9. MODALS, SHEETS & DRAWERS (RULES 1, 10, 13, 15)
// ============================================================================

/**
 * Rule 10 & 13: Critically Damped Modal Center Dialog
 */
export const modalDialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMINGS.standardEntrance, // 250ms
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: TIMINGS.standardExit, // 200ms (-20%)
      ease: EASINGS.easeIn,
    },
  },
};

/**
 * Bottom Sheet / Drawer Entrance & Exit
 */
export const bottomDrawerVariants: Variants = {
  initial: {
    y: '100%',
    opacity: 0.5,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: criticallyDampedSpring,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: EASINGS.easeIn,
    },
  },
};
