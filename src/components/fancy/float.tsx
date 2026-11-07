import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface FloatProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  speed?: number
  amplitude?: [number, number, number] // [x, y, z]
  rotationRange?: [number, number, number] // [x, y, z]
  timeOffset?: number
  className?: string
}

export const Float: React.FC<FloatProps> = ({
  children,
  speed = 0.5,
  amplitude = [10, 30, 30],
  rotationRange = [15, 15, 7.5],
  timeOffset = 0,
  className,
  style,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    )
  }

  // Duration scales inversely with speed for realistic organic floating
  const baseDuration = Math.max(1.5, 4.5 / (speed || 0.5))

  return (
    <motion.div
      animate={{
        x: [-amplitude[0] * 0.7, amplitude[0], -amplitude[0] * 0.7],
        y: [-amplitude[1], amplitude[1] * 0.8, -amplitude[1]],
        z: [-amplitude[2] * 0.5, amplitude[2], -amplitude[2] * 0.5],
        rotateX: [-rotationRange[0], rotationRange[0] * 0.7, -rotationRange[0]],
        rotateY: [-rotationRange[1] * 0.8, rotationRange[1], -rotationRange[1] * 0.8],
        rotateZ: [-rotationRange[2], rotationRange[2], -rotationRange[2]],
      }}
      transition={{
        duration: baseDuration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: timeOffset % baseDuration,
      }}
      style={{
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={cn("will-change-transform", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Float
