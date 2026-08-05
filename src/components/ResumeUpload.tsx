import { useRef, useState, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  parseResumeFile,
  type ResumeExtract,
} from '../lib/resumeParser'
import { easeOut } from '../motion/variants'
import styles from './ResumeUpload.module.css'

interface ResumeUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  onParsed?: (extract: ResumeExtract) => void
}

const ACCEPTED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_BYTES = 5 * 1024 * 1024

function isAccepted(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return (
    ACCEPTED.includes(file.type) ||
    ext === 'pdf' ||
    ext === 'doc' ||
    ext === 'docx'
  )
}

export function ResumeUpload({
  file,
  onFileChange,
  onParsed,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [parsing, setParsing] = useState(false)
  const [showWhy, setShowWhy] = useState(false)

  async function validateAndSet(next: File | null) {
    setError('')
    setStatus('')
    if (!next) {
      onFileChange(null)
      return
    }
    if (!isAccepted(next)) {
      setError('Please upload a PDF, DOC, or DOCX file.')
      return
    }
    if (next.size > MAX_BYTES) {
      setError('File must be 5MB or smaller.')
      return
    }

    onFileChange(next)
    setParsing(true)
    setStatus('Reading your resume…')
    try {
      const extract = await parseResumeFile(next)
      onParsed?.(extract)
      const filled = Object.keys(extract).filter((key) => key !== 'fullName').length
      setStatus(
        filled > 0
          ? `Extracted ${filled} field${filled === 1 ? '' : 's'} from your resume.`
          : 'Resume uploaded. We couldn’t auto-detect much — fill in the fields below.',
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not extract resume data.'
      setError(message)
      setStatus('')
    } finally {
      setParsing(false)
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files?.[0] ?? null
    void validateAndSet(dropped)
  }

  return (
    <motion.section
      className={styles.card}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <div className={styles.header}>
        <h3>1. Upload Your Resume</h3>
        <motion.button
          type="button"
          className={styles.whyLink}
          onClick={() => setShowWhy((prev) => !prev)}
          aria-expanded={showWhy}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Why upload?
          <span className={styles.infoIcon} aria-hidden="true">
            i
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showWhy && (
          <motion.div
            className={styles.whyPanel}
            role="note"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
          >
            Uploading your resume helps AI pre-fill your profile, match you with
            better roles, and save time on later steps. Your file stays private
            and encrypted.
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.body}>
        <motion.div
          className={styles.illustration}
          aria-hidden="true"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={styles.docStack}>
            <div className={styles.docBack} />
            <div className={styles.docFront}>
              <div className={styles.docLines}>
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={styles.uploadBadge}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 16V8M12 8L8.5 11.5M12 8L15.5 11.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18H18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          animate={dragging ? { scale: 1.02, borderColor: '#ff6b00' } : { scale: 1 }}
          whileHover={{ scale: file ? 1 : 1.01 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className={styles.hiddenInput}
            onChange={(event) => {
              void validateAndSet(event.target.files?.[0] ?? null)
            }}
          />

          {file ? (
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 3H14L19 8V21H7V3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M14 3V8H19" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <div className={styles.fileMeta}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>
                  {(file.size / 1024).toFixed(1)} KB ·{' '}
                  {parsing ? 'Extracting…' : 'Ready'}
                </p>
              </div>
              <motion.button
                type="button"
                className={styles.removeBtn}
                onClick={() => {
                  void validateAndSet(null)
                  if (inputRef.current) inputRef.current.value = ''
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Remove
              </motion.button>
            </div>
          ) : (
            <>
              <div className={styles.cloudIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7.5 17H17a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.5A3.5 3.5 0 0 0 7.5 17Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 14V9M12 9L9.5 11.5M12 9L14.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className={styles.dropText}>
                Drag & drop your resume here or
              </p>
              <motion.button
                type="button"
                className={styles.browseBtn}
                onClick={() => inputRef.current?.click()}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                Browse Files
              </motion.button>
              <p className={styles.formats}>
                Supports PDF, DOC, DOCX (Max 5MB)
              </p>
            </>
          )}
        </motion.div>
      </div>

      {status && !error && (
        <motion.p
          className={styles.status}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {status}
        </motion.p>
      )}

      {error && (
        <motion.p
          className={styles.error}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      <div className={styles.secureNote}>
        <span className={styles.secureCheck} aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Your resume is secure and only visible to you.
      </div>
    </motion.section>
  )
}
