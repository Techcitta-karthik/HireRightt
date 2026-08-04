import styles from './CharacterTextarea.module.css'

interface CharacterTextareaProps {
  label: string
  value: string
  maxLength: number
  placeholder: string
  onChange: (value: string) => void
  rows?: number
}

export function CharacterTextarea({
  label,
  value,
  maxLength,
  placeholder,
  onChange,
  rows = 4,
}: CharacterTextareaProps) {
  const remaining = maxLength - value.length
  const nearLimit = remaining <= 30

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.wrap}>
        <textarea
          className={styles.textarea}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className={`${styles.counter} ${nearLimit ? styles.warn : ''}`}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}
