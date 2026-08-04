import { useEffect, useMemo, useState } from 'react'
import type { ProfileFormData } from '../data/wizard'
import type { InterviewBooking, InterviewSlot } from '../lib/api'
import styles from './AiInterviewStep.module.css'

interface AiInterviewStepProps {
  data: ProfileFormData
  onChange: <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => void
  userName: string
  slots: InterviewSlot[]
  booking: InterviewBooking | null
  loading: boolean
  onBook: (slotId: string) => Promise<void>
  onCancel: () => Promise<void>
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Kolkata',
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function formatTime(value: string) {
  return timeFormatter.format(new Date(value))
}

export function AiInterviewStep({
  onChange,
  userName,
  slots,
  booking,
  loading,
  onBook,
  onCancel,
}: AiInterviewStepProps) {
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [selectedReminder, setSelectedReminder] = useState(2)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!selectedSlotId && slots[0]) setSelectedSlotId(slots[0].id)
  }, [selectedSlotId, slots])

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) ?? null,
    [selectedSlotId, slots],
  )

  async function handleBook() {
    if (!selectedSlotId) return
    await onBook(selectedSlotId)
  }

  function handleCalendar() {
    if (!booking) return
    onChange(
      'interviewNotes',
      `Interview confirmed for ${formatDate(booking.slot.starts_at)} at ${formatTime(booking.slot.starts_at)} IST.`,
    )
    setStatus('Interview details added to your profile notes.')
  }

  if (!booking) {
    return (
      <div className={styles.stack}>
        <section className={`${styles.card} ${styles.banner}`}>
          <div className={styles.bannerLeft}>
            <div className={styles.successIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 3V6M17 3V6M4 9H20M6 5H18C19.1 5 20 5.9 20 7V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V7C4 5.9 4.9 5 6 5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className={styles.bannerText}>
              <p className={styles.bannerEyebrow}>One final step, {userName.split(' ')[0]}!</p>
              <h3>Choose your 15-minute interview slot</h3>
              <p>Select an available time below. Your booking will be saved to your profile.</p>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h4 className={styles.sectionTitle}>Available interview times</h4>
          <p className={styles.subtitle}>All times are displayed in India Standard Time (IST).</p>

          {slots.length > 0 ? (
            <div className={styles.slotGrid}>
              {slots.slice(0, 12).map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={`${styles.slotButton} ${selectedSlotId === slot.id ? styles.slotSelected : ''}`}
                  onClick={() => setSelectedSlotId(slot.id)}
                >
                  <strong>{formatDate(slot.starts_at)}</strong>
                  <span>{formatTime(slot.starts_at)} IST</span>
                  <small>{slot.duration_minutes} minutes</small>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>No interview slots are currently available.</strong>
              <span>Ask the backend administrator to run the demo slot seeder.</span>
              <code>python -m app.scripts.seed_demo</code>
            </div>
          )}

          <div className={styles.bookingSummary}>
            <div>
              <span>Your selection</span>
              <strong>
                {selectedSlot
                  ? `${formatDate(selectedSlot.starts_at)} · ${formatTime(selectedSlot.starts_at)} IST`
                  : 'Choose an available slot'}
              </strong>
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleBook}
              disabled={!selectedSlot || loading}
            >
              {loading ? 'Booking…' : 'Confirm interview →'}
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <section className={`${styles.card} ${styles.banner}`}>
        <div className={styles.bannerLeft}>
          <div className={styles.successIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13L9.5 17.5L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.bannerText}>
            <p className={styles.bannerEyebrow}>All set, {userName.split(' ')[0]}!</p>
            <h3>Your 15-minute interview is confirmed</h3>
            <p>Your booking is saved and can be revisited whenever you sign in.</p>
          </div>
        </div>
        <div className={styles.botWrap} aria-hidden="true">
          <div className={styles.bot}>
            <svg viewBox="0 0 64 64">
              <rect x="12" y="18" width="40" height="30" rx="14" fill="currentColor" />
              <circle cx="26" cy="33" r="3" fill="#fff" />
              <circle cx="38" cy="33" r="3" fill="#fff" />
              <rect x="29" y="10" width="6" height="8" rx="3" fill="currentColor" />
            </svg>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h4 className={styles.sectionTitle}>Your interview details</h4>
        <div className={styles.detailsGrid}>
          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon} aria-hidden="true">▣</span>
              <div>
                <p className={styles.detailLabel}>Date</p>
                <p className={styles.detailValue}>{formatDate(booking.slot.starts_at)}</p>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon} aria-hidden="true">◷</span>
              <div>
                <p className={styles.detailLabel}>Time</p>
                <p className={styles.detailValue}>
                  {formatTime(booking.slot.starts_at)} IST{' '}
                  <span className={styles.badge}>{booking.slot.duration_minutes} minutes</span>
                </p>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon} aria-hidden="true">✓</span>
              <div>
                <p className={styles.detailLabel}>Status</p>
                <p className={styles.detailValue}>Confirmed</p>
              </div>
            </div>
          </div>

          <aside className={styles.nextCard}>
            <h5>What’s next?</h5>
            <ul>
              <li>Prepare a short introduction about your background.</li>
              <li>Keep examples of your skills and accomplishments ready.</li>
              <li>Join from a quiet place with a stable connection.</li>
            </ul>
          </aside>
        </div>

        <div className={styles.detailActions}>
          <button type="button" className={styles.outlineBtn} onClick={handleCalendar}>
            Save details to profile
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={onCancel}
            disabled={loading}
          >
            {loading ? 'Cancelling…' : 'Cancel booking'}
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <h4 className={styles.sectionTitle}>Reminder preferences</h4>
        <p className={styles.subtitle}>Choose when you would like the UI to remind you.</p>
        <div className={styles.reminders}>
          {['24 Hours Before', '1 Hour Before', '15 Minutes Before', 'Interview Time'].map(
            (item, index) => (
              <button
                key={item}
                type="button"
                className={`${styles.reminderItem} ${selectedReminder === index ? styles.reminderActive : ''}`}
                onClick={() => setSelectedReminder(index)}
              >
                <span className={styles.reminderDot} />
                <div>
                  <p>{item}</p>
                  <span>{index === 3 ? 'Time to join' : 'Show an interview reminder'}</span>
                </div>
              </button>
            ),
          )}
        </div>
      </section>

      {status && <p className={styles.status}>{status}</p>}
    </div>
  )
}
