import { useState, type FormEvent } from 'react'
import { SiteNav } from '../components/SiteNav'
import { SiteFooter } from '../components/SiteFooter'
import styles from './AuthPages.module.css'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    let tickets: unknown[] = []
    try {
      tickets = JSON.parse(localStorage.getItem('hireright.tickets') || '[]') as unknown[]
      if (!Array.isArray(tickets)) tickets = []
    } catch {
      tickets = []
    }
    tickets.unshift({
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem('hireright.tickets', JSON.stringify(tickets.slice(0, 50)))
    setSent(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <div className={styles.card}>
          <span className={styles.kicker}>SUPPORT</span>
          <h1>Contact HireRight</h1>
          <p>Questions about demos, hiring, or your AI interview? Send a note — we store it on this device for the submission demo.</p>
          {sent ? (
            <p className={styles.success}>Thanks {name || 'there'}. We’ll reply to {email || 'your inbox'}.</p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <label>
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                Message
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
              </label>
              <button type="submit" className={styles.submit}>
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
