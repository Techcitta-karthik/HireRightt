import { STEPS, type WizardStep } from '../data/wizard'
import styles from './Stepper.module.css'

interface StepperProps {
  current: WizardStep
  onStepClick: (step: WizardStep) => void
  completedThrough: number
}

export function Stepper({ current, onStepClick, completedThrough }: StepperProps) {
  return (
    <nav className={styles.stepper} aria-label="Profile setup progress">
      <ol className={styles.list}>
        {STEPS.map((step, index) => {
          const isActive = step.id === current
          const isDone = step.id < current || step.id <= completedThrough
          const isClickable = step.id <= Math.max(current, completedThrough + 1)

          return (
            <li key={step.id} className={styles.item}>
              {index > 0 && (
                <div
                  className={`${styles.connector} ${isDone || isActive ? styles.connectorActive : ''}`}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                className={`${styles.step} ${isActive ? styles.active : ''} ${isDone && !isActive ? styles.done : ''}`}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={styles.circle}>
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
                </span>
                <span className={styles.copy}>
                  <span className={styles.label}>{step.label}</span>
                  <span className={styles.sublabel}>{step.sublabel}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
