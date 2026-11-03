import React, { useMemo } from "react"
import { motion, useReducedMotion, type Transition } from "motion/react"
import { cn } from "@/lib/utils"

// Function to shuffle an array
function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export interface VariableFontHoverByRandomLetterProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  label: string
  fromFontVariationSettings?: string
  toFontVariationSettings?: string
  transition?: Transition
  staggerDuration?: number
  className?: string
  onClick?: () => void
}

export const VariableFontHoverByRandomLetter: React.FC<
  VariableFontHoverByRandomLetterProps
> = ({
  label,
  fromFontVariationSettings = "'wght' 300, 'slnt' 0",
  toFontVariationSettings = "'wght' 800, 'slnt' -8",
  transition = {
    type: "spring",
    damping: 14,
    stiffness: 150,
  },
  staggerDuration = 0.035,
  className,
  onClick,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion()

  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(label)
  const segments = useMemo(() => {
    return hasArabic ? label.split(/(\s+)/) : label.split("")
  }, [label, hasArabic])

  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: segments.length }, (_, i) => i)
    shuffleArray(indices)
    return indices
  }, [segments.length])

  const segmentVariants = {
    hover: (index: number) => ({
      fontVariationSettings: toFontVariationSettings,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            ...transition,
            delay: staggerDuration * index,
          },
    }),
    initial: (index: number) => ({
      fontVariationSettings: fromFontVariationSettings,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            ...transition,
            delay: staggerDuration * index,
          },
    }),
  }

  return (
    <motion.span
      className={cn("inline-block select-none cursor-pointer", className)}
      onClick={onClick}
      whileHover="hover"
      initial="initial"
      style={{ fontVariationSettings: fromFontVariationSettings }}
      {...props}
    >
      <span className="sr-only">{label}</span>

      {segments.map((segment: string, i: number) => {
        const index = shuffledIndices[i]
        return (
          <motion.span
            key={i}
            className="inline-block whitespace-pre transition-colors duration-200"
            aria-hidden="true"
            variants={segmentVariants}
            custom={index}
          >
            {segment}
          </motion.span>
        )
      })}
    </motion.span>
  )
}

export default VariableFontHoverByRandomLetter
