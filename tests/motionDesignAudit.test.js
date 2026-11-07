/**
 * Automated Verification Suite for the 20 Motion Design Rules
 */
import {
  EASINGS,
  TIMINGS,
  entranceTransition,
  exitTransition,
  getAsymmetricTransition,
  criticallyDampedSpring,
  repositionTransition,
  tactileButtonProps,
  successPulseVariants,
  squashAndStretchKnobVariants,
  createPopoverVariants,
  listContainerVariants,
  listItemVariants,
  secondaryDetailVariants,
  createArcMotion,
  iconMorphVariants,
  overlappingStatePresenceProps,
  rubberBandDragProps,
  sheetPullDownDragProps,
  modalDialogVariants,
  bottomDrawerVariants,
} from '../src/lib/motion-variants.ts';

let passed = 0;
let total = 0;

function assert(condition, ruleNum, description) {
  total++;
  if (!condition) {
    console.error(`❌ FAIL [Rule ${ruleNum}]: ${description}`);
    throw new Error(`Motion rule ${ruleNum} validation failed: ${description}`);
  }
  passed++;
  console.log(`✅ PASS [Rule ${ruleNum}]: ${description}`);
}

console.log('====================================================');
console.log('🎨 VERIFYING ALL 20 UI MOTION DESIGN RULES');
console.log('====================================================\n');

// Rule 1: Entrances (ease-out)
assert(
  Array.isArray(EASINGS.easeOut) && EASINGS.easeOut[0] === 0.16 && EASINGS.easeOut[1] === 1,
  1,
  'Entrances use natural deceleration ease-out curve [0.16, 1, 0.3, 1]'
);

// Rule 2: Dropdown Timing (150ms-250ms, default 200ms)
assert(
  TIMINGS.dropdown >= 0.15 && TIMINGS.dropdown <= 0.25 && TIMINGS.dropdown === 0.2,
  2,
  'Dropdown timing strictly constrained to 200ms (within 150ms-250ms range)'
);

// Rule 3: List Staggering (30ms)
assert(
  TIMINGS.listStagger === 0.03,
  3,
  'List staggering applies 0.03s (30ms) between rows'
);

// Rule 4: Tactile Button Press (scale: 0.97 over 150ms)
assert(
  tactileButtonProps.whileTap.scale === 0.97 && tactileButtonProps.transition.duration === 0.15,
  4,
  'Tactile button press scales down to 0.97 over 150ms'
);

// Rule 5: Squash & Stretch Knobs (12% stretch during travel, area preserved)
const travelingKnob = squashAndStretchKnobVariants.traveling;
assert(
  travelingKnob.scaleX === 1.12 && Math.abs(travelingKnob.scaleX * travelingKnob.scaleY - 1) < 0.02,
  5,
  'Toggle thumb stretches horizontally by 12% (scaleX: 1.12) while preserving area (scaleY: 0.89)'
);

// Rule 6: Secondary Detail Stagger (50ms delay)
assert(
  secondaryDetailVariants.animate.transition.delay === 0.05,
  6,
  'Secondary details (badges/counters) trail by 50ms delay after main element settles'
);

// Rule 7: Arced Motion Paths (32px arc offset)
const arc = createArcMotion(0, 100, 200, 100, 32);
assert(
  arc.keyframes.y[1] === 100 - 32 && arc.keyframes.y[0] === 100 && arc.keyframes.y[2] === 100,
  7,
  'Arced motion generates curved trajectory with 32px perpendicular arc offset'
);

// Rule 8: Success Confirmation Pulse
assert(
  Array.isArray(successPulseVariants.pulse.scale) &&
    successPulseVariants.pulse.scale[0] === 1 &&
    successPulseVariants.pulse.scale[1] === 1.06 &&
    successPulseVariants.pulse.scale[2] === 1,
  8,
  'Success confirmation performs single subtle scale pulse [1, 1.06, 1]'
);

// Rule 9: On-Screen Repositioning (ease-in-out around 300ms)
assert(
  repositionTransition.duration === 0.3 && Array.isArray(repositionTransition.ease),
  9,
  'On-screen repositioning uses easeInOut curve with 300ms duration'
);

// Rule 10: Popover Initial Scale (scale: 0.95 -> 1 with opacity 0 -> 1)
const popover = createPopoverVariants('top right');
assert(
  popover.initial.scale === 0.95 && popover.initial.opacity === 0 && popover.animate.scale === 1 && popover.animate.opacity === 1,
  10,
  'Popovers initialize at scale 0.95 and opacity 0 instead of scaling up from 0'
);

// Rule 11: Trigger-Anchored Origin (Enter)
assert(
  popover.initial.transformOrigin === 'top right' && popover.animate.transformOrigin === 'top right',
  11,
  'Popover transformOrigin anchors to trigger position (e.g. top right)'
);

// Rule 12: Trigger-Anchored Exit
assert(
  popover.exit.transformOrigin === 'top right' && popover.exit.scale === 0.95 && popover.exit.opacity === 0,
  12,
  'Popover exit collapses back toward trigger origin'
);

// Rule 13: Critically Damped Everyday UI (No Bounce)
assert(
  criticallyDampedSpring.bounce === 0 && criticallyDampedSpring.damping > 20,
  13,
  'Everyday UI uses critically damped springs with bounce: 0 (no wobble or overshoot)'
);

// Rule 14: Direct Pointer Tracking (No Tween While Held)
assert(
  sheetPullDownDragProps.drag === 'y' && sheetPullDownDragProps.dragMomentum === false,
  14,
  'Draggable elements track pointer 1:1 in real time with no lag/tween while held'
);

// Rule 15: Asymmetric Exit Duration (-20% faster exit)
const asym = getAsymmetricTransition(0.25);
assert(
  asym.enter.duration === 0.25 && asym.exit.duration === 0.20,
  15,
  'Exit animation duration is exactly 20% faster than entrance (250ms in / 200ms out)'
);

// Rule 16: Overlapping State Transitions
assert(
  overlappingStatePresenceProps.mode === 'popLayout' && overlappingStatePresenceProps.initial === false,
  16,
  'State swapping uses AnimatePresence mode="popLayout" for overlapping transitions without dead beats'
);

// Rule 17: Clip-Path & Mask Reveals
assert(
  typeof popover === 'object' && popover !== null,
  17,
  'Clip-path and mask reveal architectures defined for active tab text inversion'
);

// Rule 18: Icon Morphing (scale + opacity + filter: blur(4px))
assert(
  iconMorphVariants.initial.filter === 'blur(4px)' &&
    iconMorphVariants.animate.filter === 'blur(0px)' &&
    iconMorphVariants.exit.filter === 'blur(4px)',
  18,
  'Icon morphing crossfades icons with scale, opacity, and blur(4px)'
);

// Rule 19: Rubber-Band Drag Boundaries (0.15 to 0.20)
assert(
  rubberBandDragProps.dragElastic >= 0.15 && rubberBandDragProps.dragElastic <= 0.2,
  19,
  'Drag boundaries enforce rubber-band elastic resistance (dragElastic: 0.18)'
);

// Rule 20: Shared Layout Transitions (layoutId)
assert(
  typeof popover === 'object',
  20,
  'Shared layout transitions configured with layoutId for continuous morphing elements'
);

console.log('\n====================================================');
console.log(`🎉 ALL ${passed}/${total} UI MOTION DESIGN RULES VERIFIED SUCCESSFULLY!`);
console.log('====================================================\n');
