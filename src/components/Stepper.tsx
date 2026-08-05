import { motion } from 'framer-motion'
import { Fragment } from 'react'
import { STEPS, type WizardStep } from '../data/wizard'
import { easeOut, staggerFast } from '../motion/variants'
import styles from './Stepper.module.css'

interface StepperProps {
  current: WizardStep
  onStepClick: (step: WizardStep) => void
  completedThrough: number
}

export function Stepper({ current, onStepClick, completedThrough }: StepperProps) {
  return (
    <motion.nav
      className={styles.stepper}
      aria-label="Profile setup progress"
      variants={staggerFast}
      initial="hidden"
      animate="show"
    >
      <ol className={styles.list}>
        {STEPS.map((step, index) => {
          const isActive = step.id === current
          const isDone = step.id < current || step.id <= completedThrough
          const isClickable = step.id <= Math.max(current, completedThrough + 1)
          const nextDone =
            index < STEPS.length - 1 &&
            (STEPS[index + 1].id <= current || STEPS[index + 1].id <= completedThrough)

          return (
            <Fragment key={step.id}>
              <motion.li
                className={styles.item}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.35, ease: easeOut },
                  },
                }}
              >
                <motion.button
                  type="button"
                  className={`${styles.step} ${isActive ? styles.active : ''} ${isDone && !isActive ? styles.done : ''}`}
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  aria-current={isActive ? 'step' : undefined}
                  whileHover={isClickable ? { y: -2, scale: 1.02 } : undefined}
                  whileTap={isClickable ? { scale: 0.97 } : undefined}
                  animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                >
                  <motion.span
                    className={styles.circle}
                    layout
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  >
                    {isDone && !isActive ? (
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </motion.span>
                  <span className={styles.copy}>
                    <span className={styles.label}>{step.label}</span>
                    <span className={styles.sublabel}>{step.sublabel}</span>
                  </span>
                </motion.button>
              </motion.li>
              {index < STEPS.length - 1 && (
                <li
                  className={styles.connectorItem}
                  aria-hidden="true"
                >
                  <div
                    className={`${styles.connector} ${isDone || nextDone || isActive ? styles.connectorActive : ''}`}
                  />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </motion.nav>
  )
}
