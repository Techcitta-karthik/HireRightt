import { useRef, useState } from 'react'
import type { IntegrityLogEvent } from '../lib/store'
import styles from './VideoProctorTimeline.module.css'

type Props = {
  videoUrl?: string | null
  logs?: IntegrityLogEvent[]
  durationSec?: number
}

export function VideoProctorTimeline({ videoUrl, logs = [], durationSec = 180 }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(durationSec)
  const [hoveredLog, setHoveredLog] = useState<IntegrityLogEvent | null>(null)

  function handleLoadedMetadata() {
    if (videoRef.current && videoRef.current.duration) {
      setVideoDuration(Math.max(1, Math.floor(videoRef.current.duration)))
    }
  }

  function handleTimeUpdate() {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  function seekToSec(sec: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = sec
      videoRef.current.play().catch(() => {})
    }
  }

  const effectiveDuration = Math.max(videoDuration, 1)

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>
          📹 Video Timeline & Misbehavior Red Markers ({logs.length} events)
        </strong>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Red dots = Proctoring violations · Click dot to jump to timestamp
        </span>
      </div>

      {videoUrl ? (
        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            src={videoUrl}
            className={styles.video}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      ) : (
        <div
          className={styles.videoWrapper}
          style={{ padding: '36px 20px', textAlign: 'center', background: '#1e293b' }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🎥</div>
          <div style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}>
            Video Recording Stored in Local Session Storage
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
            Timeline markers below pinpoint exact misbehavior timestamps
          </div>
        </div>
      )}

      {/* Interactive Timeline Bar with Red Dot Markers */}
      <div className={styles.timelineBar}>
        <div
          className={styles.timelineTrack}
          style={{ width: `${(currentTime / effectiveDuration) * 100}%` }}
        />

        {logs.map((log, index) => {
          const sec = log.questionIndex ? (log.questionIndex - 1) * 30 + 10 : (index + 1) * 15
          const pct = Math.min(98, Math.max(2, (sec / effectiveDuration) * 100))
          const markerClass =
            log.severity === 'ban'
              ? styles.markerBan
              : log.severity === 'block'
                ? styles.markerBlock
                : styles.markerWarn

          return (
            <div
              key={log.id || index}
              className={`${styles.marker} ${markerClass}`}
              style={{ left: `${pct}%` }}
              onClick={() => seekToSec(sec)}
              onMouseEnter={() => setHoveredLog(log)}
              onMouseLeave={() => setHoveredLog(null)}
            >
              {hoveredLog?.id === log.id && (
                <div className={styles.tooltip}>
                  ⏱️ [{log.formattedTime}] {log.message}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Misbehavior Event Log Rows */}
      {logs.length > 0 ? (
        <div className={styles.logList}>
          {logs.map((log, index) => {
            const sec = log.questionIndex ? (log.questionIndex - 1) * 30 + 10 : (index + 1) * 15
            const bg =
              log.severity === 'ban'
                ? 'rgba(239, 68, 68, 0.15)'
                : log.severity === 'block'
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)'

            return (
              <div
                key={log.id || index}
                className={styles.logRow}
                style={{ background: bg }}
                onClick={() => seekToSec(sec)}
              >
                <div>
                  <strong style={{ color: log.severity === 'ban' ? '#fca5a5' : '#f8fafc' }}>
                    🔴 [{log.formattedTime}] {log.eventType.replace(/_/g, ' ')}
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {log.message}
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Jump to {sec}s ▶
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
          ✓ Perfect Integrity: Zero red markers or misbehavior events detected.
        </div>
      )}
    </div>
  )
}
