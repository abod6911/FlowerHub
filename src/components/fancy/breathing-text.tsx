import React, { ElementType } from "react"
import { motion, useReducedMotion, type Transition, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

export interface BreathingTextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The content to be displayed and animated
   */
  children: React.ReactNode

  /**
   * HTML Tag to render the component as
   */
  as?: ElementType

  /**
   * Initial font variation settings
   * @default "'wght' 400"
   */
  fromFontVariationSettings?: string

  /**
   * Target font variation settings to animate to
   * @default "'wght' 650"
   */
  toFontVariationSettings?: string

  /**
   * Animation transition configuration
   * @default { duration: 2.2, ease: "easeInOut" }
   */
  transition?: Transition

  /**
   * Duration of stagger delay between elements in seconds
   * @default 0.08
   */
  staggerDuration?: number

  /**
   * Direction to stagger animations from
   * @default "center"
   */
  staggerFrom?: "first" | "last" | "center" | number

  /**
   * Delay between animation repeats in seconds
   * @default 0.1
   */
  repeatDelay?: number
}

export const BreathingText: React.FC<BreathingTextProps> = ({
  children,
  as = "span",
  fromFontVariationSettings = "'wght' 400",
  toFontVariationSettings = "'wght' 650",
  transition = {
    duration: 2.2,
    ease: "easeInOut",
  },
  staggerDuration = 0.08,
  staggerFrom = "center",
  repeatDelay = 0.1,
  className,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion()

  const variants: Variants = {
    initial: { fontVariationSettings: fromFontVariationSettings },
    animate: (i: number) => ({
      fontVariationSettings: toFontVariationSettings,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            ...transition,
            repeat: Infinity,
            repeatType: "mirror",
            delay: i * staggerDuration,
            repeatDelay: repeatDelay,
          },
    }),
  }

  const textContent = typeof children === "string" ? children : String(children || "")
  // Arabic Unicode range \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(textContent)

  // For Arabic text, split by words and whitespace so cursive letters stay connected
  // For Latin / other scripts, split by individual characters
  const segments = hasArabic
    ? textContent.split(/(\s+)/)
    : textContent.split("")

  const getCustomIndex = (index: number, total: number) => {
    if (typeof staggerFrom === "number") {
      return Math.abs(index - staggerFrom)
    }
    switch (staggerFrom) {
      case "first":
        return index
      case "last":
        return total - 1 - index
      case "center":
      default:
        return Math.abs(index - Math.floor(total / 2))
    }
  }

  const ElementTag = as

  return (
    <ElementTag
      className={cn(
        className,
        // Invisible pseudo-element prevents layout shifts during font weight breathing
        "relative inline-flex items-center after:absolute after:content-[attr(data-text)] after:font-black after:pointer-events-none after:overflow-hidden after:select-none after:invisible after:h-0"
      )}
      {...props}
      data-text={textContent}
      style={{ fontVariationSettings: fromFontVariationSettings }}
    >
      {segments.map((segment: string, i: number) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          aria-hidden="true"
          variants={variants}
          initial="initial"
          animate="animate"
          custom={getCustomIndex(i, segments.length)}
        >
          {segment}
        </motion.span>
      ))}
      <span className="sr-only">{children}</span>
    </ElementTag>
  )
}

export default BreathingText
