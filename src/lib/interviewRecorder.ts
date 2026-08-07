/**
 * Local interview recorder — MediaRecorder → IndexedDB + optional download.
 * No cloud upload.
 */

const DB_NAME = 'hireright-recordings'
const STORE = 'clips'
const DB_VERSION = 1

export type SavedRecording = {
  id: string
  createdAt: string
  mimeType: string
  size: number
  durationMs: number
  role: string
  level: string
  candidateName: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'))
  })
}

function pickMimeType(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ]
  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
      return t
    }
  }
  return ''
}

export class InterviewRecorder {
  private recorder: MediaRecorder | null = null
  private chunks: BlobPart[] = []
  private startedAt = 0
  private mimeType = ''
  private stream: MediaStream | null = null
  recording = false

  start(source: MediaStream): boolean {
    if (typeof MediaRecorder === 'undefined') return false
    if (!source || source.getTracks().length === 0) return false

    this.stopInternal(false)
    this.chunks = []
    this.mimeType = pickMimeType()
    this.startedAt = Date.now()

    // Clone tracks so stopping recorder never kills the live preview tracks.
    const tracks = source.getTracks().map((t) => t.clone())
    this.stream = new MediaStream(tracks)

    try {
      this.recorder = this.mimeType
        ? new MediaRecorder(this.stream, { mimeType: this.mimeType, videoBitsPerSecond: 1_500_000 })
        : new MediaRecorder(this.stream)
    } catch {
      try {
        this.recorder = new MediaRecorder(this.stream)
      } catch {
        this.cleanupClones()
        return false
      }
    }

    this.mimeType = this.recorder.mimeType || this.mimeType || 'video/webm'
    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data)
    }
    this.recorder.start(1000)
    this.recording = true
    return true
  }

  private cleanupClones() {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
  }

  private stopInternal(waitData: boolean): Promise<Blob | null> {
    return new Promise((resolve) => {
      const rec = this.recorder
      if (!rec || rec.state === 'inactive') {
        this.cleanupClones()
        this.recording = false
        resolve(null)
        return
      }

      const finish = () => {
        this.recording = false
        this.recorder = null
        this.cleanupClones()
        if (!this.chunks.length) {
          resolve(null)
          return
        }
        resolve(new Blob(this.chunks, { type: this.mimeType || 'video/webm' }))
      }

      if (waitData) {
        rec.onstop = finish
        try {
          if (rec.state === 'recording') rec.requestData()
        } catch {
          // ignore
        }
        rec.stop()
      } else {
        try {
          rec.stop()
        } catch {
          // ignore
        }
        finish()
      }
    })
  }

  async stop(): Promise<{ blob: Blob; durationMs: number; mimeType: string } | null> {
    const durationMs = Math.max(0, Date.now() - this.startedAt)
    const blob = await this.stopInternal(true)
    if (!blob || blob.size < 256) return null
    return { blob, durationMs, mimeType: blob.type || this.mimeType }
  }

  async saveToIndexedDb(meta: {
    blob: Blob
    durationMs: number
    role: string
    level: string
    candidateName: string
  }): Promise<SavedRecording> {
    const id = `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    const record = {
      id,
      createdAt: new Date().toISOString(),
      mimeType: meta.blob.type || 'video/webm',
      size: meta.blob.size,
      durationMs: meta.durationMs,
      role: meta.role,
      level: meta.level,
      candidateName: meta.candidateName,
      blob: meta.blob,
    }
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(record)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error || new Error('Save failed'))
    })
    db.close()
    const { blob: _b, ...saved } = record
    return saved
  }

  download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }
}

export async function listRecordings(): Promise<SavedRecording[]> {
  const db = await openDb()
  const rows = await new Promise<SavedRecording[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const all = (req.result || []).map((row: SavedRecording & { blob?: Blob }) => {
        const { blob: _b, ...rest } = row
        return rest
      })
      resolve(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    }
    req.onerror = () => reject(req.error)
  })
  db.close()
  return rows
}

export async function getRecordingBlob(id: string): Promise<Blob | null> {
  const db = await openDb()
  const row = await new Promise<(SavedRecording & { blob: Blob }) | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return row?.blob ?? null
}
