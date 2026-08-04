import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { hoverScale, tapScale } from './variants'

type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode
  lift?: boolean
}

/** Interactive button with hover + tap feedback */
export function MotionButton({
  children,
  lift = false,
  disabled,
  ...props
}: MotionButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : lift ? { y: -2, scale: 1.02 } : hoverScale}
      whileTap={disabled ? undefined : tapScale}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

type MotionLinkWrapProps = {
  children: ReactNode
  className?: string
}

/** Wrap links/anchors for hover + tap without breaking routing */
export function MotionPressable({ children, className }: MotionLinkWrapProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      style={{ display: 'inline-flex' }}
    >
      {children}
    </motion.div>
  )
}

type NativeBtn = ButtonHTMLAttributes<HTMLButtonElement>
export type { NativeBtn }
