"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EASINGS,
  TIMINGS,
  tactileButtonProps,
  successPulseVariants,
  squashAndStretchKnobVariants,
  createPopoverVariants,
  listContainerVariants,
  listItemVariants,
  secondaryDetailVariants,
  iconMorphVariants,
  overlappingStatePresenceProps,
  criticallyDampedSpring,
  type TriggerOrigin,
} from '@/lib/motion-variants';

// ============================================================================
// 1. TACTILE BUTTON (RULE 4, 1, 8)
// ============================================================================
interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'luxury';
  pulseOnSuccess?: boolean;
  className?: string;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'primary',
  pulseOnSuccess = false,
  className = '',
  onClick,
  ...props
}) => {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (pulseOnSuccess) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), TIMINGS.pulseDuration * 1000 + 50);
    }
    if (onClick) onClick(e);
  };

  const variantStyles = {
    primary: 'bg-[#123524] text-white hover:bg-[#1a4a33] shadow-md shadow-[#123524]/20',
    secondary: 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 shadow-xs',
    ghost: 'bg-transparent text-stone-700 hover:bg-stone-100/60',
    luxury: 'bg-gradient-to-r from-[#7E1529] to-[#540D1B] text-amber-200 hover:brightness-110 shadow-lg shadow-rose-950/25 border border-amber-400/30',
  };

  return (
    <motion.button
      {...tactileButtonProps} // Rule 4: whileTap={{ scale: 0.97 }} over 150ms
      variants={successPulseVariants} // Rule 8: Subtle scale pulse on confirmation
      animate={isPulsing ? 'pulse' : 'initial'}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl select-none cursor-pointer transition-colors duration-200 ${variantStyles[variant]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};

// ============================================================================
// 2. SQUASH & STRETCH TOGGLE SWITCH (RULE 5 & 1)
// ============================================================================
interface SquashStretchSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const SquashStretchSwitch: React.FC<SquashStretchSwitchProps> = ({
  checked,
  onChange,
  label,
  className = '',
}) => {
  const [isTraveling, setIsTraveling] = useState(false);

  const handleToggle = () => {
    setIsTraveling(true);
    onChange(!checked);
    setTimeout(() => setIsTraveling(false), 140);
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {label && <span className="text-xs font-semibold text-stone-700">{label}</span>}
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        whileTap={{ scale: 0.96 }}
        className={`relative w-12 h-7 rounded-full p-0.5 transition-colors duration-200 cursor-pointer flex items-center ${
          checked ? 'bg-[#123524]' : 'bg-stone-300'
        }`}
      >
        {/* Knob with Rule 5: 12% horizontal stretch during travel */}
        <motion.span
          variants={squashAndStretchKnobVariants}
          animate={isTraveling ? 'traveling' : checked ? 'active' : 'inactive'}
          custom={20} // Travel distance (px)
          className="w-6 h-6 rounded-full bg-white shadow-md block origin-center"
        />
      </motion.button>
    </div>
  );
};

// ============================================================================
// 3. CLIP-PATH & MASK REVEAL SEGMENTED TABS (RULE 17, 20, 9, 4)
// ============================================================================
interface SegmentedTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ClipPathSegmentedTabsProps {
  tabs: SegmentedTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const ClipPathSegmentedTabs: React.FC<ClipPathSegmentedTabsProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`relative inline-flex items-center p-1 rounded-2xl bg-stone-200/80 backdrop-blur-md border border-stone-300/60 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <motion.button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            whileTap={{ scale: 0.97 }} // Rule 4: tactile button press
            className="relative px-3.5 py-1.5 text-xs font-bold rounded-xl z-10 transition-colors duration-200 select-none flex items-center gap-1.5 cursor-pointer"
          >
            {/* Rule 20: Shared layout transition pill */}
            {isActive && (
              <motion.div
                layoutId="activeTabIndicatorPill" // Rule 20: Continuous shared layout
                transition={{
                  duration: TIMINGS.reposition, // Rule 9: 300ms on-screen repositioning
                  ease: EASINGS.easeInOut,
                }}
                className="absolute inset-0 bg-[#123524] rounded-xl shadow-sm z-[-1]"
              />
            )}

            {/* Rule 17: Inverted text color over mask / indicator */}
            <span
              className={`transition-colors duration-200 flex items-center gap-1.5 ${
                isActive ? 'text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

// ============================================================================
// 4. TRIGGER-ANCHORED DROPDOWN MENU (RULE 2, 3, 10, 11, 12, 15)
// ============================================================================
interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  onClick?: () => void;
}

interface AnchoredDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  origin?: TriggerOrigin;
  className?: string;
}

export const AnchoredDropdown: React.FC<AnchoredDropdownProps> = ({
  trigger,
  items,
  origin = 'top right', // Rule 11: Trigger-anchored origin
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownVariants = createPopoverVariants(origin);

  return (
    <div className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence {...overlappingStatePresenceProps}>
        {isOpen && (
          <>
            {/* Backdrop Dismissal */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Container (Rules 2, 10, 11, 12, 15) */}
            <motion.div
              variants={dropdownVariants}
              initial="initial" // scale: 0.95, opacity: 0
              animate="animate" // scale: 1, opacity: 1 over 200ms (easeOut)
              exit="exit" // scale: 0.95 over 160ms (-20% faster, easeIn)
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200/80 shadow-2xl p-1.5 z-50 text-right overflow-hidden"
            >
              {/* Rule 3: List staggering (30ms) */}
              <motion.div
                variants={listContainerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-0.5"
              >
                {items.map((item) => (
                  <motion.button
                    key={item.id}
                    variants={listItemVariants} // Rule 3: 30ms stagger
                    whileTap={{ scale: 0.97 }} // Rule 4: tactile tap
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors text-right cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && <span className="text-sm">{item.icon}</span>}
                      <span>{item.label}</span>
                    </span>

                    {/* Rule 6: Secondary detail stagger (50ms) */}
                    {item.badge && (
                      <motion.span
                        variants={secondaryDetailVariants}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// 5. MORPHING ICON BUTTON (RULE 18, 16, 4, 8)
// ============================================================================
interface MorphingIconButtonProps {
  isActive: boolean;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  onClick: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

export const MorphingIconButton: React.FC<MorphingIconButtonProps> = ({
  isActive,
  activeIcon,
  inactiveIcon,
  onClick,
  activeLabel,
  inactiveLabel,
  className = '',
}) => {
  return (
    <motion.button
      type="button"
      {...tactileButtonProps} // Rule 4: whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center p-2 rounded-full cursor-pointer select-none transition-colors ${className}`}
    >
      {/* Rule 16 & 18: Overlapping presence with blur + scale crossfade */}
      <AnimatePresence {...overlappingStatePresenceProps}>
        <motion.div
          key={isActive ? 'active-icon' : 'inactive-icon'}
          variants={iconMorphVariants} // Rule 18: scale + opacity + filter: blur(4px)
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center gap-1.5"
        >
          {isActive ? activeIcon : inactiveIcon}
          {(activeLabel || inactiveLabel) && (
            <span className="text-xs font-bold">
              {isActive ? activeLabel : inactiveLabel}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

// ============================================================================
// 6. ARCED FLYING CART TICKET (RULE 7 & 6)
// ============================================================================
interface ArcedFlyingBadgeProps {
  isFlying: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  content?: React.ReactNode;
}

export const ArcedFlyingBadge: React.FC<ArcedFlyingBadgeProps> = ({
  isFlying,
  startX,
  startY,
  endX,
  endY,
  content = '🌸',
}) => {
  if (!isFlying) return null;

  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - 32; // Rule 7: 32px curved perpendicular arc offset

  return (
    <motion.div
      initial={{ x: startX, y: startY, scale: 1, opacity: 1 }}
      animate={{
        x: [startX, midX, endX],
        y: [startY, midY, endY], // Rule 7: Arced Motion Path (32px arc offset)
        scale: [1, 1.25, 0.4],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1], // Rule 1: smooth deceleration
        times: [0, 0.45, 1],
      }}
      className="fixed z-50 pointer-events-none text-xl"
    >
      {content}
    </motion.div>
  );
};

// ============================================================================
// 7. CRITICALLY DAMPED BOTTOM DRAWER (RULE 13, 14, 19, 10, 15)
// ============================================================================
interface RubberBandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const RubberBandDrawer: React.FC<RubberBandDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <AnimatePresence {...overlappingStatePresenceProps}>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18, ease: EASINGS.easeIn } }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
          />

          {/* Drawer Sheet (Rule 10, 13, 14, 15, 19) */}
          <motion.div
            initial={{ y: '100%', scale: 0.98, opacity: 0 }} // Rule 10: Scale initialized near 1
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: '100%', scale: 0.98, opacity: 0 }} // Rule 15: -20% exit
            transition={criticallyDampedSpring} // Rule 13: Critically Damped Everyday UI (bounce: 0)
            drag="y" // Rule 14: Direct pointer tracking (1:1 while held)
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.18} // Rule 19: Rubber-band drag boundaries (0.15–0.2)
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="relative w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl p-5 shadow-2xl z-10 border-t border-stone-200 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">{title}</h3>
              <TactileButton variant="ghost" onClick={onClose} className="p-1.5 rounded-full">
                ✕
              </TactileButton>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
