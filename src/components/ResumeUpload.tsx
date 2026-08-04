import { useRef, useState, type DragEvent } from 'react'
import styles from './ResumeUpload.module.css'

interface ResumeUploadProps {
  file: File | null
  uploadedName?: string
  onFileChange: (file: File | null) => void
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
  uploadedName,
  onFileChange,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [showWhy, setShowWhy] = useState(false)

  function validateAndSet(next: File | null) {
    setError('')
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
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files?.[0] ?? null
    validateAndSet(dropped)
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h3>1. Upload Your Resume</h3>
        <button
          type="button"
          className={styles.whyLink}
          onClick={() => setShowWhy((prev) => !prev)}
          aria-expanded={showWhy}
        >
          Why upload?
          <span className={styles.infoIcon} aria-hidden="true">
            i
          </span>
        </button>
      </div>

      {showWhy && (
        <div className={styles.whyPanel} role="note">
          Uploading your resume helps AI pre-fill your profile, match you with
          better roles, and save time on later steps. Your file stays private
          and encrypted.
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.illustration} aria-hidden="true">
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
        </div>

        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${file || uploadedName ? styles.hasFile : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className={styles.hiddenInput}
            onChange={(event) => validateAndSet(event.target.files?.[0] ?? null)}
          />

          {file || uploadedName ? (
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
                <p className={styles.fileName}>{file?.name ?? uploadedName}</p>
                <p className={styles.fileSize}>
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB · Ready to upload`
                    : 'Uploaded and saved securely'}
                </p>
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => {
                  if (file) {
                    validateAndSet(null)
                    if (inputRef.current) inputRef.current.value = ''
                  } else {
                    inputRef.current?.click()
                  }
                }}
              >
                {file ? 'Remove' : 'Replace'}
              </button>
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
              <button
                type="button"
                className={styles.browseBtn}
                onClick={() => inputRef.current?.click()}
              >
                Browse Files
              </button>
              <p className={styles.formats}>
                Supports PDF, DOC, DOCX (Max 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

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
    </section>
  )
}
