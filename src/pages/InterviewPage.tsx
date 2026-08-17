import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LEVELS,
  ROLES,
  mapExperienceToLevel,
  mapProfileRoleToInterviewRole,
  type Question,
} from '../lib/interviewEngine'
import {
  cancelSpeech,
  getSpeechRecognition,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
} from '../lib/speech'
import {
  FaceTracker,
  type FaceTrackStatus,
} from '../lib/faceTracker'
import {
  pingInterviewIntegrity,
  scoreInterviewRemote,
  startInterviewSession,
  type IntegritySnapshot,
} from '../lib/interviewAgentClient'
import { InterviewRecorder } from '../lib/interviewRecorder'
import {
  applyToJob,
  attachInterviewToApplicant,
  firstName,
  getProfile,
  saveInterviewResult,
  type IntegrityLogEvent,
  type InterviewResult,
} from '../lib/store'
import { easeOut } from '../motion/variants'
import styles from './InterviewPage.module.css'

type Stage = 'setup' | 'interview' | 'analyzing' | 'results'

const QUESTION_SECONDS = 180

const LOBBY_TIPS = [
  'Only you in frame — extra people bans the interview',
  'Face the camera (not the side) the whole time',
  'Sit close enough that your face is clearly visible',
  'Speak clearly — Ava listens and transcribes live',
]

function Waveform({ active }: { active: boolean }) {
  return (
    <div className={`${styles.wave} ${active ? styles.waveOn : ''}`} aria-hidden="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  )
}

export function InterviewPage() {
  const navigate = useNavigate()
  const profile = useMemo(() => getProfile(), [])
  const profileSkills = profile?.skills ?? []
  const fromWizard = useMemo(
    () => sessionStorage.getItem('hireright.returnToWizard') === '1',
    [],
  )

  const targetJobRaw = useMemo(() => {
    const str = sessionStorage.getItem('hireright.targetJob')
    if (!str) return null
    try {
      return JSON.parse(str) as {
        title: string
        company: string
        role: string
        level: string
        applicantId?: string
        jd?: string
      }
    } catch {
      return null
    }
  }, [])

  const [stage, setStage] = useState<Stage>('setup')
  const [role, setRole] = useState<string>(() => {
    if (targetJobRaw?.role) return targetJobRaw.role
    return mapProfileRoleToInterviewRole(profile?.currentRole ?? '')
  })
  const [level, setLevel] = useState<string>(() => {
    if (targetJobRaw?.level) return targetJobRaw.level
    return mapExperienceToLevel(profile?.totalExperience ?? '')
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [draft, setDraft] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS)
  const [result, setResult] = useState<InterviewResult | null>(null)
  const [listening, setListening] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [streamReady, setStreamReady] = useState(false)
  const [deviceError, setDeviceError] = useState('')
  const [skipCamera, setSkipCamera] = useState(false)
  const [showTypeFallback, setShowTypeFallback] = useState(false)
  const [mediaBusy, setMediaBusy] = useState(false)
  const [checklist, setChecklist] = useState([false, false, false])
  const [starting, setStarting] = useState(false)
  const [agentLabel, setAgentLabel] = useState('Ava · resume agent')
  const [llmStatus, setLlmStatus] = useState<{
    active: boolean
    model?: string
    provider?: string
    message?: string
  } | null>(null)

  useEffect(() => {
    fetch('/api/llm-status')
      .then((r) => r.json())
      .then((data) => setLlmStatus(data))
      .catch(() =>
        setLlmStatus({
          active: false,
          provider: 'Local Ava agent',
          message: 'API offline — interview still runs on-device.',
        }),
      )
  }, [])
  const [customJd, setCustomJd] = useState(
    targetJobRaw?.jd
      ? targetJobRaw.jd
      : targetJobRaw?.title
        ? `Target Job: ${targetJobRaw.title} at ${targetJobRaw.company}`
        : '',
  )
  const [faceStatus, setFaceStatus] = useState<FaceTrackStatus>({
    faceCount: 0,
    ok: false,
    label: 'Waiting for camera…',
    severity: 'warn',
    issue: 'no_face',
    faceAreaRatio: 0,
    yaw: 0,
    lookingForward: false,
  })
  const [interviewBanned, setInterviewBanned] = useState(false)
  const [banMessage, setBanMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingNote, setRecordingNote] = useState('')
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const integrityRef = useRef<IntegritySnapshot>({
    faceViolations: 0,
    singlePersonOk: true,
    maxFacesSeen: 1,
    sideLookWarnings: 0,
    tooFarWarnings: 0,
  })
  const faceTrackerRef = useRef<FaceTracker | null>(null)
  const multiBanRef = useRef(0)
  const currentRef = useRef(0)
  const recorderRef = useRef(new InterviewRecorder())
  const recordingBlobUrlRef = useRef<string | null>(null)

  const answersRef = useRef<string[]>([])
  const finishingRef = useRef(false)
  const draftRef = useRef('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const baseDraftRef = useRef('')
  const streamRef = useRef<MediaStream | null>(null)
  const lobbyVideoRef = useRef<HTMLVideoElement | null>(null)
  const roomVideoRef = useRef<HTMLVideoElement | null>(null)
  const micOnRef = useRef(true)
  const stageRef = useRef<Stage>(stage)
  const listenAfterTtsRef = useRef(true)
  const speakGenRef = useRef(0)

  const question = questions[current]
  const speechSupported = isSpeechRecognitionSupported()
  const ttsSupported = isSpeechSynthesisSupported()
  const name = firstName()

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    currentRef.current = current
  }, [current])

  useEffect(() => {
    micOnRef.current = micOn
  }, [micOn])

  useEffect(() => {
    stageRef.current = stage
  }, [stage])

  const lastLogTimeRef = useRef<{ [key: string]: number }>({})

  const addIntegrityLog = useCallback(
    (
      eventType: IntegrityLogEvent['eventType'],
      severity: IntegrityLogEvent['severity'],
      message: string,
    ) => {
      const now = Date.now()
      const lastTime = lastLogTimeRef.current[eventType] || 0
      if (now - lastTime < 3000 && eventType !== 'INTERVIEW_BANNED') return
      lastLogTimeRef.current[eventType] = now

      const date = new Date()
      const formattedTime = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const logEvent: IntegrityLogEvent = {
        id: `log-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: date.toISOString(),
        formattedTime,
        eventType,
        severity,
        message,
        questionIndex: stageRef.current === 'interview' ? currentRef.current + 1 : undefined,
      }

      if (!integrityRef.current.logs) {
        integrityRef.current.logs = []
      }
      integrityRef.current.logs.push(logEvent)
    },
    [],
  )

  // Continuous face tracking in lobby + full interview room
  useEffect(() => {
    if (skipCamera || (!streamReady && stage === 'setup')) return
    if (stage === 'analyzing' || stage === 'results') return
    const tracker = new FaceTracker()
    faceTrackerRef.current = tracker
    let alive = true
    const id = window.setInterval(() => {
      void (async () => {
        if (!alive || interviewBanned) return
        const video =
          stageRef.current === 'interview' ? roomVideoRef.current : lobbyVideoRef.current
        const status = await tracker.detect(video)
        if (!alive) return
        setFaceStatus(status)

        integrityRef.current.maxFacesSeen = Math.max(
          integrityRef.current.maxFacesSeen,
          status.faceCount,
        )

        if (status.issue === 'looking_away') {
          integrityRef.current.sideLookWarnings =
            (integrityRef.current.sideLookWarnings || 0) + 1
          addIntegrityLog(
            'SIDE_GAZE_LOOKING_AWAY',
            'warn',
            `👀 Candidate looking away from screen (Yaw: ${(status.yaw * 57.3).toFixed(1)}°)`,
          )
        }
        if (status.issue === 'too_far') {
          integrityRef.current.tooFarWarnings =
            (integrityRef.current.tooFarWarnings || 0) + 1
          addIntegrityLog(
            'EXCESSIVE_MOVEMENT',
            'warn',
            `📏 Excessive distance/movement from camera (Face ratio: ${status.faceAreaRatio.toFixed(3)})`,
          )
        }

        if (status.issue === 'multi_person' || status.severity === 'ban') {
          integrityRef.current.faceViolations += 1
          integrityRef.current.singlePersonOk = false
          multiBanRef.current += 1
          void pingInterviewIntegrity(sessionIdRef.current, status.faceCount)

          addIntegrityLog(
            'MULTIPLE_FACES_DETECTED',
            'ban',
            `🚨 MULTIPLE PEOPLE DETECTED: ${status.faceCount} faces in camera frame simultaneously!`,
          )

          // ~2 seconds of multi-person (interval 350ms × 6) → ban live interview
          if (stageRef.current === 'interview' && multiBanRef.current >= 6) {
            const reason =
              'Interview banned: more than one person was detected on camera. Only the candidate may be in frame.'
            integrityRef.current.banned = true
            integrityRef.current.banReason = reason
            addIntegrityLog(
              'INTERVIEW_BANNED',
              'ban',
              `🚫 INTERVIEW BANNED & TERMINATED: Integrity violation (Multiple people detected)`,
            )
            setInterviewBanned(true)
            setBanMessage(reason)
            stopAllSpeech()
            finishingRef.current = true
            const next = [...answersRef.current]
            next[currentRef.current] = draftRef.current.trim()
            answersRef.current = next
            finish(next, true, reason)
          }
        } else {
          multiBanRef.current = Math.max(0, multiBanRef.current - 1)
        }

        if (
          status.severity === 'block' &&
          status.issue === 'no_face' &&
          stageRef.current === 'interview'
        ) {
          integrityRef.current.faceViolations += 1
          void pingInterviewIntegrity(sessionIdRef.current, 0)
          addIntegrityLog(
            'NO_FACE_SEEN',
            'block',
            `⚠️ NO FACE DETECTED: Candidate face moved out of camera frame`,
          )
        }
      })()
    }, 350)
    return () => {
      alive = false
      window.clearInterval(id)
      tracker.dispose()
      faceTrackerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamReady, skipCamera, stage, interviewBanned])

  function attachStream(video: HTMLVideoElement | null) {
    if (!video || !streamRef.current) return
    if (video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current
      video.muted = true
      video.playsInline = true
      void video.play().catch(() => undefined)
    }
  }

  const bindRoomVideo = useCallback((el: HTMLVideoElement | null) => {
    roomVideoRef.current = el
    if (el && streamRef.current && stageRef.current === 'interview') {
      attachStream(el)
    }
  }, [])

  const bindLobbyVideo = useCallback((el: HTMLVideoElement | null) => {
    lobbyVideoRef.current = el
    if (el && streamRef.current && stageRef.current === 'setup') {
      attachStream(el)
    }
  }, [])

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStreamReady(false)
    if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = null
    if (roomVideoRef.current) roomVideoRef.current.srcObject = null
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop()
    } catch {
      // ignore
    }
    recognitionRef.current = null
    setListening(false)
  }

  function stopAllSpeech() {
    cancelSpeech()
    setAiSpeaking(false)
    stopListening()
  }

  useEffect(() => {
    return () => {
      stopAllSpeech()
      stopTracks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (stage === 'setup') attachStream(lobbyVideoRef.current)
    if (stage === 'interview') {
      // Retry attach — video node mounts after stage switch
      const tryAttach = () => attachStream(roomVideoRef.current)
      tryAttach()
      const t1 = window.setTimeout(tryAttach, 80)
      const t2 = window.setTimeout(tryAttach, 250)
      const t3 = window.setTimeout(tryAttach, 600)
      return () => {
        window.clearTimeout(t1)
        window.clearTimeout(t2)
        window.clearTimeout(t3)
      }
    }
  }, [stage, streamReady, camOn])

  async function enableDevices() {
    setMediaBusy(true)
    setDeviceError('')
    try {
      if (streamRef.current) stopTracks()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      })
      streamRef.current = stream
      setStreamReady(true)
      setSkipCamera(false)
      setCamOn(true)
      setMicOn(true)
      attachStream(lobbyVideoRef.current)
    } catch {
      setDeviceError(
        'Camera or microphone blocked. Allow access in your browser, or continue without camera.',
      )
      setStreamReady(false)
    } finally {
      setMediaBusy(false)
    }
  }

  // Auto-prompt devices when lobby opens (CloudHire-style)
  useEffect(() => {
    if (stage !== 'setup' || streamReady || skipCamera) return
    void enableDevices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  function setTrackEnabled(kind: 'video' | 'audio', enabled: boolean) {
    streamRef.current?.getTracks().forEach((track) => {
      if (track.kind === kind) track.enabled = enabled
    })
  }

  function toggleCamera() {
    const next = !camOn
    setCamOn(next)
    setTrackEnabled('video', next)
  }

  function toggleMic() {
    const next = !micOn
    setMicOn(next)
    setTrackEnabled('audio', next)
    micOnRef.current = next
    if (!next) stopListening()
    else if (stage === 'interview' && !aiSpeaking && speechSupported) {
      startListening()
    }
  }

  function startListening() {
    if (!speechSupported || !micOnRef.current || aiSpeaking) return
    stopListening()
    const recognition = getSpeechRecognition()
    if (!recognition) return
    baseDraftRef.current = draftRef.current.trim()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let spoken = ''
      for (let i = 0; i < event.results.length; i += 1) {
        spoken += `${event.results[i][0].transcript} `
      }
      const prefix = baseDraftRef.current
      setDraft(prefix ? `${prefix} ${spoken.trim()}` : spoken.trim())
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => {
      setListening(false)
      if (
        listenAfterTtsRef.current &&
        stageRef.current === 'interview' &&
        micOnRef.current &&
        !finishingRef.current
      ) {
        try {
          recognition.start()
          setListening(true)
        } catch {
          // already started
        }
      }
    }
    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }

  useEffect(() => {
    if (stage !== 'interview' || !question) return

    const gen = ++speakGenRef.current
    listenAfterTtsRef.current = false
    stopListening()
    setDraft('')
    draftRef.current = ''
    setAiSpeaking(true)

    const intro =
      current === 0
        ? `Hi ${name}. I'm Ava, your HireRighttt interviewer. Let's begin. `
        : `Next question. `

    speakText(`${intro}${question.text}`, {
      onStart: () => {
        if (gen === speakGenRef.current) setAiSpeaking(true)
      },
      onEnd: () => {
        if (gen !== speakGenRef.current) return
        setAiSpeaking(false)
        listenAfterTtsRef.current = true
        if (stageRef.current === 'interview' && micOnRef.current) startListening()
      },
      onError: () => {
        if (gen !== speakGenRef.current) return
        setAiSpeaking(false)
        listenAfterTtsRef.current = true
        if (stageRef.current === 'interview' && micOnRef.current) startListening()
      },
    })

    return () => {
      speakGenRef.current += 1
      cancelSpeech()
      setAiSpeaking(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, current, question?.text])

  useEffect(() => {
    if (stage !== 'interview') return
    setSecondsLeft(QUESTION_SECONDS)
    let alive = true
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id)
          if (alive) window.setTimeout(() => submitAnswer(), 0)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, current])

  async function startInterview() {
    if (!streamReady && !skipCamera) return
    if (!skipCamera) {
      if (faceStatus.issue === 'multi_person' || faceStatus.severity === 'ban') {
        setDeviceError('More than one person detected — clear the frame to only you before joining.')
        return
      }
      if (faceStatus.severity === 'block' || faceStatus.faceCount !== 1) {
        setDeviceError('Face check: sit where Ava can see your face (move closer if you are far).')
        return
      }
      if (faceStatus.issue === 'looking_away' && !faceStatus.lookingForward) {
        setDeviceError('Face the camera straight-on before joining.')
        return
      }
    }
    setStarting(true)
    finishingRef.current = false
    setInterviewBanned(false)
    setBanMessage('')
    multiBanRef.current = 0
    answersRef.current = []
    integrityRef.current = {
      faceViolations: 0,
      singlePersonOk: true,
      maxFacesSeen: Math.max(1, faceStatus.faceCount),
      sideLookWarnings: 0,
      tooFarWarnings: 0,
      banned: false,
    }
    stopAllSpeech()
    try {
      const started = await startInterviewSession(role, level, profile, customJd)
      sessionIdRef.current = started.sessionId
      setAgentLabel('Ava · resume interview (local)')
      setQuestions(started.questions)
      setCurrent(0)
      setDraft('')
      setResult(null)
      setRecordingNote('')
      setRecordingUrl(null)
      setShowTypeFallback(!speechSupported)
      setStage('interview')

      // Start local webcam recording (saved on finish)
      if (streamRef.current) {
        const ok = recorderRef.current.start(streamRef.current)
        setIsRecording(ok)
        if (!ok) {
          setRecordingNote('Recording unavailable in this browser — answers still score.')
        }
      }

      window.setTimeout(() => attachStream(roomVideoRef.current), 50)
      window.setTimeout(() => attachStream(roomVideoRef.current), 300)
    } catch (err) {
      setDeviceError(err instanceof Error ? err.message : 'Could not start interview agent.')
    } finally {
      setStarting(false)
    }
  }

  function endInterviewEarly() {
    if (finishingRef.current || stage !== 'interview') return
    stopAllSpeech()
    const next = [...answersRef.current]
    next[current] = draftRef.current.trim()
    answersRef.current = next
    finishingRef.current = true
    finish(next, false)
  }

  function submitAnswer() {
    if (finishingRef.current || stage !== 'interview' || questions.length === 0) {
      return
    }
    if (interviewBanned) return
    if (faceStatus.issue === 'multi_person' || faceStatus.severity === 'ban') {
      setDeviceError('Multiple people detected — interview cannot continue.')
      return
    }
    if (faceStatus.severity === 'block') {
      setDeviceError('Keep your face clearly in frame to submit.')
      return
    }
    if (faceStatus.issue === 'looking_away' && Math.abs(faceStatus.yaw) >= 0.48) {
      setDeviceError('Turn to face the camera, then submit your answer.')
      return
    }
    listenAfterTtsRef.current = false
    stopAllSpeech()

    const answer = draftRef.current.trim()
    const next = [...answersRef.current]
    next[current] = answer
    answersRef.current = next

    if (current >= questions.length - 1) {
      finishingRef.current = true
      finish(next, false)
      return
    }

    setCurrent((c) => c + 1)
    setDraft('')
    setDeviceError('')
  }

  function finish(finalAnswers: string[], banned: boolean, banReason?: string) {
    setStage('analyzing')
    setIsRecording(false)
    const reason =
      banReason ||
      banMessage ||
      integrityRef.current.banReason ||
      'Interview banned: more than one person was detected on camera.'
    if (banned) {
      integrityRef.current.banned = true
      integrityRef.current.banReason = reason
      integrityRef.current.singlePersonOk = false
    }
    window.setTimeout(() => {
      void (async () => {
        const integrity = { ...integrityRef.current }
        let recordingNoteLocal = ''

        try {
          const clip = await recorderRef.current.stop()
          if (clip) {
            await recorderRef.current.saveToIndexedDb({
              blob: clip.blob,
              durationMs: clip.durationMs,
              role,
              level,
              candidateName: firstName(),
            })
            if (recordingBlobUrlRef.current) {
              URL.revokeObjectURL(recordingBlobUrlRef.current)
            }
            recordingBlobUrlRef.current = URL.createObjectURL(clip.blob)
            setRecordingUrl(recordingBlobUrlRef.current)
            recordingNoteLocal = `✓ Video recording saved securely to local storage (${Math.round(clip.blob.size / 1024)} KB)`
          } else {
            recordingNoteLocal = 'Recording not captured — answers were still scored locally.'
          }
        } catch {
          recordingNoteLocal = 'Could not save recording locally.'
        }
        setRecordingNote(recordingNoteLocal)

        let scored = await scoreInterviewRemote({
          sessionId: sessionIdRef.current,
          role,
          level,
          questions,
          answers: finalAnswers,
          profile,
          integrity,
        })
        if (integrity.banned) {
          scored = {
            ...scored,
            overall: 0,
            improvements: [
              integrity.banReason || reason,
              ...(scored.improvements || []).slice(0, 4),
            ],
            strengths: ['Integrity rules were enforced for a fair interview.'],
            integrity: {
              faceViolations: integrity.faceViolations,
              singlePersonOk: false,
              maxFacesSeen: integrity.maxFacesSeen,
              banned: true,
              banReason: integrity.banReason || reason,
              sideLookWarnings: integrity.sideLookWarnings,
              tooFarWarnings: integrity.tooFarWarnings,
            },
          }
        }
        saveInterviewResult(scored)
        if (targetJobRaw?.applicantId) {
          attachInterviewToApplicant(targetJobRaw.applicantId, scored)
        }
        if (targetJobRaw && !integrity.banned) {
          try {
            applyToJob({
              title: targetJobRaw.title,
              company: targetJobRaw.company,
              location: 'Remote',
              match: scored.overall,
            })
          } catch {
            // ignore if already applied or score too low
          }
          sessionStorage.removeItem('hireright.targetJob')
        }
        setResult(scored)
        setStage('results')
      })()
    }, 1200)
  }

  function retake() {
    finishingRef.current = false
    answersRef.current = []
    sessionIdRef.current = null
    multiBanRef.current = 0
    setInterviewBanned(false)
    setBanMessage('')
    setIsRecording(false)
    setRecordingNote('')
    void recorderRef.current.stop()
    if (recordingBlobUrlRef.current) {
      URL.revokeObjectURL(recordingBlobUrlRef.current)
      recordingBlobUrlRef.current = null
    }
    setRecordingUrl(null)
    stopAllSpeech()
    setQuestions([])
    setCurrent(0)
    setDraft('')
    setResult(null)
    setSecondsLeft(QUESTION_SECONDS)
    setChecklist([false, false, false])
    setDeviceError('')
    setSkipCamera(false)
    setStage('setup')
    if (streamRef.current) {
      setStreamReady(true)
      window.setTimeout(() => attachStream(lobbyVideoRef.current), 50)
    }
  }

  const timeLabel = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [secondsLeft])

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0
  const faceBlocks =
    !skipCamera &&
    (faceStatus.severity === 'block' ||
      faceStatus.severity === 'ban' ||
      faceStatus.issue === 'multi_person' ||
      (faceStatus.issue === 'looking_away' && Math.abs(faceStatus.yaw) >= 0.48))
  const faceWarnOnly =
    !skipCamera && faceStatus.severity === 'warn' && !faceBlocks
  const canStart =
    checklist.every(Boolean) &&
    !starting &&
    (skipCamera || (streamReady && !faceBlocks && faceStatus.faceCount === 1))
  const canSubmit =
    Boolean(draft.trim()) && !aiSpeaking && !faceBlocks && !interviewBanned

  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <div className={styles.appBrand}>
          <span className={styles.logoMark}>HR</span>
          <div>
            <strong>HIRERIGHT<sup>TT</sup></strong>
            <small>AI Interview Studio</small>
          </div>
        </div>
        {stage === 'interview' && question ? (
          <div className={styles.appMeta}>
            <span className={styles.livePill}>
              <i /> Recording
            </span>
            <span className={styles.agentPill}>{agentLabel}</span>
            {isRecording && (
              <span className={styles.recPill}>
                <i /> REC
              </span>
            )}
            {!skipCamera && (
              <span
                className={`${styles.faceBadgeInline} ${
                  faceStatus.severity === 'ok'
                    ? styles.faceOk
                    : faceStatus.severity === 'warn'
                      ? styles.faceWarn
                      : styles.faceBlock
                }`}
              >
                {faceStatus.label}
              </span>
            )}
            <span>
              Question {current + 1} of {questions.length}
            </span>
            <span className={secondsLeft < 30 ? styles.timerLow : styles.timer}>
              {timeLabel}
            </span>
          </div>
        ) : (
          <button
            type="button"
            className={styles.exitLink}
            onClick={() => navigate('/dashboard')}
          >
            Exit
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {stage === 'setup' && (
          <motion.section
            key="setup"
            className={styles.lobby}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <div className={styles.lobbyHero}>
              <p className={styles.eyebrow}>Waiting room</p>
              <h1>
                Hi {name}, meet your interviewer <em>Ava</em>
              </h1>
              <p className={styles.sub}>
                A live spoken video interview — same format as CloudHire / Micro1 style
                screens. Ava asks out loud; you answer on camera.
              </p>
            </div>

            <div className={styles.lobbyGrid}>
              <div className={styles.previewCard}>
                <div className={styles.previewFrame}>
                  {streamReady && camOn ? (
                    <video
                      ref={bindLobbyVideo}
                      className={styles.previewVideo}
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <div className={styles.previewEmpty}>
                      <div className={styles.emptyOrb}>You</div>
                      <p>Enable camera to preview how you&apos;ll appear</p>
                    </div>
                  )}
                  <div className={styles.previewOverlay}>
                    <span className={styles.youChip}>{name}</span>
                    {streamReady && <span className={styles.liveBadge}>Camera live</span>}
                  </div>
                </div>

                <div className={styles.deviceStrip}>
                  <span className={streamReady && camOn ? styles.ok : styles.off}>
                    Camera
                  </span>
                  <span className={streamReady && micOn ? styles.ok : styles.off}>Mic</span>
                  <span className={speechSupported ? styles.ok : styles.warn}>Speech</span>
                  <span className={ttsSupported ? styles.ok : styles.warn}>AI voice</span>
                </div>

                <div className={styles.lobbyActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => void enableDevices()}
                    disabled={mediaBusy}
                  >
                    {mediaBusy ? 'Connecting…' : streamReady ? 'Recheck devices' : 'Allow camera & mic'}
                  </button>
                  {!streamReady && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => {
                        setSkipCamera(true)
                        setDeviceError('')
                      }}
                    >
                      Continue without camera
                    </button>
                  )}
                </div>
                <p className={styles.joinHint}>
                  Camera is required. Face tracking runs for the full interview — one person, facing forward.
                </p>
                {deviceError && <p className={styles.deviceError}>{deviceError}</p>}
                <div
                  className={`${styles.faceBadge} ${
                    faceStatus.severity === 'ok'
                      ? styles.faceOk
                      : faceStatus.severity === 'warn'
                        ? styles.faceWarn
                        : styles.faceBlock
                  }`}
                  role="status"
                >
                  <span className={styles.faceDot} aria-hidden="true" />
                  {faceStatus.label}
                </div>
              </div>

              <div className={styles.lobbySide}>
                <div className={styles.llmBadge}>
                  <span className={styles.llmDot} />
                  <span>
                    {llmStatus?.message ||
                      '✓ OpenRouter API Key Active & Working (openrouter/free)'}
                  </span>
                </div>

                {targetJobRaw && (
                  <div className={styles.autoConfigBanner}>
                    <div className={styles.autoConfigLeft}>
                      <span className={styles.autoConfigIcon}>🎯</span>
                      <div>
                        <strong>Auto-Selected for Job Application</strong>
                        <p>
                          Targeting: <strong>{targetJobRaw.title}</strong> at <strong>{targetJobRaw.company}</strong>
                        </p>
                      </div>
                    </div>
                    <span className={styles.autoConfigPill}>
                      {role} · {level}
                    </span>
                  </div>
                )}

                <div className={styles.avaCard}>
                  <div className={styles.avaPortrait} aria-hidden="true">
                    <div className={styles.avaFace}>
                      <span className={styles.avaEye} />
                      <span className={styles.avaEye} />
                      <span className={styles.avaSmile} />
                    </div>
                  </div>
                  <div>
                    <h3>Ava</h3>
                    <p>AI Interviewer · HIRERIGHT<sup>TT</sup></p>
                  </div>
                </div>

                {targetJobRaw ? (
                  <div className={styles.lockedNotice}>
                    <span className={styles.lockedIcon}>🔒</span>
                    <div className={styles.lockedText}>
                      <strong>Role & Level Locked for Application</strong>
                      <p>
                        Targeting <strong>{targetJobRaw.title}</strong> ({role} · {level})
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.clearTargetBtn}
                      onClick={() => {
                        sessionStorage.removeItem('hireright.targetJob')
                        window.location.reload()
                      }}
                    >
                      Change Job
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.field}>
                      <span>Role track</span>
                      <div className={styles.chips}>
                        {ROLES.map((r) => (
                          <button
                            key={r}
                            type="button"
                            className={r === role ? styles.chipActive : styles.chip}
                            onClick={() => setRole(r)}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.field}>
                      <span>Level</span>
                      <div className={styles.chips}>
                        {LEVELS.map((l) => (
                          <button
                            key={l}
                            type="button"
                            className={l === level ? styles.chipActive : styles.chip}
                            onClick={() => setLevel(l)}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.jdContainer}>
                  <label htmlFor="custom-jd-input" className={styles.jdLabel}>
                    📄 Target Job Description (JD) <em>— Tailors AI questions to JD + Role</em>
                  </label>
                  <textarea
                    id="custom-jd-input"
                    className={styles.jdTextarea}
                    placeholder="Paste the Job Description (JD) or key responsibilities here (e.g. 'Senior Frontend Dev: React, TypeScript, Performance optimization, State management...'). Ava will generate tailored JD questions!"
                    value={customJd}
                    onChange={(e) => setCustomJd(e.target.value)}
                    rows={3}
                  />
                </div>

                {profileSkills.length > 0 || profile?.resumeText ? (
                  <div className={styles.tips}>
                    <h4>From your resume</h4>
                    <ul>
                      {profileSkills.length > 0 && (
                        <li>
                          Skills: {profileSkills.slice(0, 6).join(', ')}
                          {profileSkills.length > 6 ? '…' : ''}
                        </li>
                      )}
                      <li>
                        Ava asks local questions from your uploaded resume / profile — no API.
                      </li>
                      <li>Your webcam is recorded and saved on your device when you finish.</li>
                    </ul>
                  </div>
                ) : (
                  <div className={styles.tips}>
                    <h4>Upload a resume first</h4>
                    <ul>
                      <li>
                        Go to onboarding and upload your resume so Ava can ask accurate questions.
                      </li>
                    </ul>
                  </div>
                )}

                <div className={styles.tips}>
                  <h4>Before you join</h4>
                  <ul>
                    {LOBBY_TIPS.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.checkList}>
                  {[
                    'I am alone in a quiet place',
                    'My face is visible and facing the camera',
                    'I will answer out loud',
                  ].map((label, i) => (
                    <label key={label} className={styles.checkItem}>
                      <input
                        type="checkbox"
                        checked={checklist[i]}
                        onChange={(e) => {
                          const next = [...checklist]
                          next[i] = e.target.checked
                          setChecklist(next)
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                <motion.button
                  type="button"
                  className={styles.joinBtn}
                  onClick={() => void startInterview()}
                  disabled={!canStart}
                  whileHover={canStart ? { scale: 1.02 } : undefined}
                  whileTap={canStart ? { scale: 0.98 } : undefined}
                >
                  {starting ? 'Ava is preparing questions…' : 'Enter interview room'}
                </motion.button>
                {!canStart && (
                  <p className={styles.joinHint}>
                    {faceBlocks
                      ? faceStatus.issue === 'multi_person'
                        ? 'Only one person may be in the camera — clear others to join.'
                        : faceStatus.issue === 'looking_away'
                          ? 'Face the camera straight-on before joining.'
                          : faceStatus.issue === 'no_face'
                            ? 'Move into view (closer if you are far) so your face is detected.'
                            : 'Fix the face check to join.'
                      : `Complete the checklist${!streamReady ? ' and enable camera' : ''} to join.`}
                  </p>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {stage === 'interview' && question && (
          <motion.section
            key="call"
            className={styles.call}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {(faceBlocks || faceWarnOnly || interviewBanned) && (
              <div
                className={`${styles.proctorBanner} ${
                  faceStatus.severity === 'ban' ||
                  faceStatus.issue === 'multi_person' ||
                  interviewBanned
                    ? styles.proctorBan
                    : faceStatus.severity === 'block'
                      ? styles.proctorBlock
                      : styles.proctorWarn
                }`}
                role="alert"
              >
                <strong>
                  {interviewBanned
                    ? 'Interview banned'
                    : faceStatus.issue === 'multi_person'
                      ? 'Multiple people detected'
                      : faceStatus.issue === 'looking_away'
                        ? 'Look at the camera'
                        : faceStatus.issue === 'too_far'
                          ? 'Move closer'
                          : faceStatus.issue === 'no_face'
                            ? 'Face not detected'
                            : 'Proctoring alert'}
                </strong>
                <span>{interviewBanned ? banMessage : faceStatus.label}</span>
              </div>
            )}

            <div className={styles.callStage}>
              {/* Main: your webcam (recorded live) */}
              <div className={`${styles.mainTile} ${styles.youMain}`}>
                {streamReady && camOn ? (
                  <video
                    ref={bindRoomVideo}
                    className={styles.youVideo}
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className={styles.youFallback}>
                    <span>{name.slice(0, 1).toUpperCase()}</span>
                    <p>Camera off — turn it on to continue</p>
                  </div>
                )}

                <div className={styles.qProgress}>
                  <div className={styles.progressTrack}>
                    <motion.div
                      className={styles.progressFill}
                      animate={{
                        width: `${((current + 1) / questions.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span>
                    {question.category} · Q{current + 1}/{questions.length}
                    {isRecording ? ' · Recording' : ''}
                  </span>
                </div>

                <div className={styles.ccBox}>
                  <span className={styles.ccTag}>Ava asks</span>
                  <p>{question.text}</p>
                  {!aiSpeaking && <small>{question.hint}</small>}
                </div>

                {/* Candidate Live Speech Captions Overlay */}
                <div className={styles.webcamCaptionsOverlay}>
                  <span className={styles.ccLiveTag}>● LIVE CAPTION</span>
                  <p className={styles.ccLiveText}>
                    {draft.trim() ? `"${draft}"` : listening ? 'Listening... Speak your answer out loud.' : 'Waiting for Ava to finish question...'}
                  </p>
                </div>

                <div className={styles.youLabel}>
                  <span>You · live</span>
                  {listening && <em>Speaking</em>}
                  {isRecording && <em className={styles.recEm}>REC</em>}
                </div>
              </div>

              {/* PiP: Ava */}
              <div className={`${styles.pip} ${aiSpeaking ? styles.speakingTile : ''}`}>
                <div className={styles.avaPipInner}>
                  <div className={styles.avaFaceLg}>
                    <span className={styles.avaEye} />
                    <span className={styles.avaEye} />
                    <motion.span
                      className={styles.avaMouth}
                      animate={
                        aiSpeaking
                          ? { scaleY: [1, 1.6, 0.8, 1.4, 1], opacity: 1 }
                          : { scaleY: 1, opacity: 0.85 }
                      }
                      transition={
                        aiSpeaking
                          ? { duration: 0.45, repeat: Infinity }
                          : { duration: 0.2 }
                      }
                    />
                  </div>
                  <div className={styles.pipLabel}>
                    <span>Ava</span>
                    <em>{aiSpeaking ? 'Asking' : listening ? 'Listening' : 'Ready'}</em>
                  </div>
                  <Waveform active={aiSpeaking} />
                </div>
              </div>
            </div>

            <aside className={styles.sidePanel}>
              <div className={styles.panelHead}>
                <h3>Live transcript</h3>
                <span>{wordCount} words</span>
              </div>
              <div className={styles.panelBody}>
                <p>
                  {draft.trim() ||
                    (aiSpeaking
                      ? 'Ava is speaking — your turn starts when she finishes.'
                      : speechSupported
                        ? 'Speak now. Your answer appears here in real time.'
                        : 'Speech unavailable in this browser. Type your answer.')}
                </p>
                {(showTypeFallback || !speechSupported) && (
                  <textarea
                    className={styles.typeFallback}
                    value={draft}
                    rows={4}
                    placeholder="Type your answer…"
                    onChange={(e) => setDraft(e.target.value)}
                  />
                )}
                {speechSupported && (
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={() => setShowTypeFallback((v) => !v)}
                  >
                    {showTypeFallback ? 'Hide keyboard' : 'Use keyboard'}
                  </button>
                )}
              </div>
            </aside>

            <footer className={styles.dock}>
              <div className={styles.dockCluster}>
                <button
                  type="button"
                  className={`${styles.roundBtn} ${!micOn ? styles.roundOff : ''}`}
                  onClick={toggleMic}
                  aria-label={micOn ? 'Mute' : 'Unmute'}
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {micOn ? (
                      <>
                        <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </>
                    ) : (
                      <>
                        <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M9 9V8a3 3 0 0 1 5.2-2" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M15 11v1a3 3 0 0 1-5.2 2M6 11a6 6 0 0 0 8 5.3M12 17v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                  <span>{micOn ? 'Mute' : 'Unmute'}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.roundBtn} ${!camOn ? styles.roundOff : ''}`}
                  onClick={toggleCamera}
                  disabled={!streamReady}
                  aria-label={camOn ? 'Stop camera' : 'Start camera'}
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="7" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M15 10l5-2.5v9L15 14v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                  <span>{camOn ? 'Camera' : 'Cam off'}</span>
                </button>
                {speechSupported && (
                  <button
                    type="button"
                    className={`${styles.roundBtn} ${listening ? styles.roundLive : ''}`}
                    onClick={() => (listening ? stopListening() : startListening())}
                    disabled={aiSpeaking || !micOn}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                    <span>{listening ? 'Listening' : 'Listen'}</span>
                  </button>
                )}
              </div>

              <motion.button
                type="button"
                className={styles.nextBtn}
                onClick={() => submitAnswer()}
                disabled={!canSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {faceBlocks
                  ? 'Fix face check'
                  : current === questions.length - 1
                    ? 'Submit & finish'
                    : 'Next question'}
              </motion.button>

              <button type="button" className={styles.endBtn} onClick={endInterviewEarly}>
                Leave
              </button>
            </footer>
          </motion.section>
        )}

        {stage === 'analyzing' && (
          <motion.section
            key="analyzing"
            className={styles.analyzing}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.analyzeCard}>
              <motion.div
                className={styles.analyzeOrb}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <h2>Scoring your interview</h2>
              <p>Ava is scoring communication, resume fit, and role accuracy.</p>
              <ul>
                {[
                  'Matching answers to your resume',
                  'Scoring structure & specificity',
                  'Checking single-person integrity',
                  'Building your talent report',
                ].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <div className={styles.analyzeSteps}>
                {[
                  'Syncing video transcript',
                  'Evaluating answer depth',
                  'Benchmarking to your role',
                ].map((step, i) => (
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.7 }}
                  >
                    {step}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {stage === 'results' && result && (
          <motion.section
            key="results"
            className={styles.results}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <p className={styles.eyebrowLight}>
              {result.integrity?.banned ? 'Interview banned' : 'Interview report'}
            </p>
            <h1>
              {result.integrity?.banned ? (
                <>
                  Session <em>ended</em> for integrity
                </>
              ) : (
                <>
                  Your score with <em>Ava</em>
                </>
              )}
            </h1>
            <p className={styles.subLight}>
              {result.role} · {result.level} ·{' '}
              {new Date(result.date).toLocaleDateString()}
              {result.agent ? ` · ${result.agent}` : ''}
            </p>

            <div className={styles.scoreGrid}>
              <div className={styles.scoreCard}>
                <div
                  className={styles.scoreRing}
                  style={{
                    background: `radial-gradient(circle at center, #fff 62%, transparent 63%), conic-gradient(#2563eb 0 ${result.overall}%, #dbeafe ${result.overall}% 100%)`,
                  }}
                >
                  <motion.strong
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                  >
                    {result.overall}
                  </motion.strong>
                </div>
                <p className={styles.scoreLabel}>
                  {result.overall >= 75
                    ? 'Strong — ready for employer screens'
                    : result.overall >= 55
                      ? 'Solid — tighten a few answers'
                      : 'Keep practicing with Ava'}
                </p>
                {typeof result.resumeFitScore === 'number' && (
                  <p className={styles.scoreMeta}>
                    Resume fit {result.resumeFitScore}/100
                  </p>
                )}
                {result.integrity && (
                  <p className={styles.scoreMeta}>
                    {result.integrity.banned
                      ? result.integrity.banReason || 'Banned: multiple people on camera'
                      : result.integrity.singlePersonOk
                        ? 'Face integrity: single person verified'
                        : `${result.integrity.faceViolations} face violation(s)`}
                    {result.integrity.sideLookWarnings
                      ? ` · ${result.integrity.sideLookWarnings} side-look warning(s)`
                      : ''}
                    {result.integrity.tooFarWarnings
                      ? ` · ${result.integrity.tooFarWarnings} distance warning(s)`
                      : ''}
                  </p>
                )}
                {recordingNote && <p className={styles.scoreMeta}>{recordingNote}</p>}

                {result.integrity?.logs && result.integrity.logs.length > 0 && (
                  <div style={{ marginTop: '16px', textAlign: 'left', width: '100%' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      🛡️ Real-Time Proctoring Activity Logs ({result.integrity.logs.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                      {result.integrity.logs.map((log) => (
                        <div
                          key={log.id}
                          style={{
                            background: log.severity === 'ban' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.06)',
                            border: `1px solid ${log.severity === 'ban' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(37, 99, 235, 0.15)'}`,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            color: log.severity === 'ban' ? '#dc2626' : '#1e293b',
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>[{log.formattedTime}]</span> {log.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recordingUrl && (
                  <video
                    className={styles.recordingPreview}
                    src={recordingUrl}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    playsInline
                  />
                )}
              </div>

              <div className={styles.categoryCard}>
                <h3>Score breakdown</h3>
                {result.categories?.map((cat, i) => (
                  <div key={cat.label} className={styles.catRow}>
                    <span>{cat.label}</span>
                    <div className={styles.catTrack}>
                      <motion.div
                        className={styles.catFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{ delay: 0.25 + i * 0.12, duration: 0.65, ease: easeOut }}
                      />
                    </div>
                    <b>{cat.score}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.insightGrid}>
              <div className={styles.insightCard}>
                <h3>Strengths</h3>
                <ul>
                  {result.strengths?.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.insightCard}>
                <h3>Improve next</h3>
                <ul>
                  {result.improvements?.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.answerReview}>
              <h3>Question feedback</h3>
              {result.answers?.map((a, i) => (
                <details key={i} className={styles.answerItem}>
                  <summary>
                    <span>
                      Q{i + 1}. {a.question}
                    </span>
                    <b
                      className={
                        a.score >= 70
                          ? styles.scoreGood
                          : a.score >= 45
                            ? styles.scoreMid
                            : styles.scoreLowTag
                      }
                    >
                      {a.score}/100
                    </b>
                  </summary>
                  <p className={styles.feedback}>{a.feedback}</p>
                  {a.answer && <p className={styles.yourAnswer}>“{a.answer}”</p>}
                </details>
              ))}
            </div>

            <div className={styles.resultActions}>
              <motion.button
                type="button"
                className={styles.joinBtn}
                onClick={() => {
                  sessionStorage.removeItem('hireright.returnToWizard')
                  if (fromWizard) {
                    sessionStorage.setItem('hireright.wizardStep', '5')
                    navigate('/onboarding')
                  } else {
                    navigate('/jobs')
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {fromWizard ? 'Continue — see your score summary' : 'Unlock matched roles'}
              </motion.button>
              <button type="button" className={styles.secondaryBtn} onClick={retake}>
                Retake with Ava
              </button>
              <Link to="/jobs" className={styles.secondaryBtn}>
                Browse matched roles
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
