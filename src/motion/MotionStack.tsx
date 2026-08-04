import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from './variants'

const viewOnce = { once: true, amount: 0.15 } as const

/** Staggered fade-up for step page sections */
export function MotionStack({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

/** Card / section that fades up as a stagger child */
export function MotionItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  const shared = {
    className,
    variants: fadeUp,
    whileHover: { y: -2, transition: { duration: 0.18 } },
  }

  if (as === 'section') {
    return <motion.section {...shared}>{children}</motion.section>
  }
  if (as === 'article') {
    return <motion.article {...shared}>{children}</motion.article>
  }
  if (as === 'li') {
    return <motion.li {...shared}>{children}</motion.li>
  }
  return <motion.div {...shared}>{children}</motion.div>
}

/** Scroll-triggered section wrapper */
export function MotionInView({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={viewOnce}
    >
      {children}
    </motion.div>
  )
}
