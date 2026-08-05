import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LEVELS,
  ROLES,
  buildQuestionSet,
  scoreInterview,
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
  firstName,
  saveInterviewResult,
  type InterviewResult,
} from '../lib/store'
import { apiHealth, apiSaveInterview } from '../lib/api'
import { easeOut } from '../motion/variants'
import styles from './InterviewPage.module.css'

type Stage = 'setup' | 'interview' | 'analyzing' | 'results'

const QUESTION_SECONDS = 180

const LOBBY_TIPS = [
  'Sit in a quiet, well-lit space',
  'Look at the camera when you answer',
  'Speak clearly — Ava listens and transcribes live',
  'You have up to 3 minutes per question',
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
  const [stage, setStage] = useState<Stage>('setup')
  const [role, setRole] = useState<string>(ROLES[0])
  const [level, setLevel] = useState<string>(LEVELS[1])
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
    micOnRef.current = micOn
  }, [micOn])

  useEffect(() => {
    stageRef.current = stage
  }, [stage])

  function attachStream(video: HTMLVideoElement | null) {
    if (!video || !streamRef.current) return
    if (video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current
    }
    void video.play().catch(() => undefined)
  }

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
    if (stage === 'interview') attachStream(roomVideoRef.current)
  }, [stage, streamReady])

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
        ? `Hi ${name}. I'm Ava, your HireRight interviewer. Let's begin. `
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

  function startInterview() {
    if (!streamReady && !skipCamera) return
    finishingRef.current = false
    answersRef.current = []
    stopAllSpeech()
    setQuestions(buildQuestionSet(role))
    setCurrent(0)
    setDraft('')
    setResult(null)
    setShowTypeFallback(!speechSupported)
    setStage('interview')
    window.setTimeout(() => attachStream(roomVideoRef.current), 50)
  }

  function endInterviewEarly() {
    if (finishingRef.current || stage !== 'interview') return
    stopAllSpeech()
    const next = [...answersRef.current]
    next[current] = draftRef.current.trim()
    answersRef.current = next
    finishingRef.current = true
    finish(next)
  }

  function submitAnswer() {
    if (finishingRef.current || stage !== 'interview' || questions.length === 0) {
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
      finish(next)
      return
    }

    setCurrent((c) => c + 1)
    setDraft('')
  }

  function finish(finalAnswers: string[]) {
    setStage('analyzing')
    window.setTimeout(() => {
      void (async () => {
        const scored = scoreInterview(role, level, questions, finalAnswers)
        saveInterviewResult(scored)
        try {
          if (await apiHealth()) await apiSaveInterview(scored)
        } catch {
          // local save is enough
        }
        setResult(scored)
        setStage('results')
      })()
    }, 2800)
  }

  function retake() {
    finishingRef.current = false
    answersRef.current = []
    stopAllSpeech()
    setQuestions([])
    setCurrent(0)
    setDraft('')
    setResult(null)
    setSecondsLeft(QUESTION_SECONDS)
    setChecklist([false, false, false])
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
  const canStart =
    (streamReady || skipCamera) && checklist.every(Boolean)

  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <div className={styles.appBrand}>
          <span className={styles.logoMark}>HR</span>
          <div>
            <strong>HIRERIGHT</strong>
            <small>AI Interview Studio</small>
          </div>
        </div>
        {stage === 'interview' && question ? (
          <div className={styles.appMeta}>
            <span className={styles.livePill}>
              <i /> Recording
            </span>
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
                      ref={lobbyVideoRef}
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
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={() => {
                      setSkipCamera(true)
                      setDeviceError('')
                    }}
                  >
                    Continue without camera
                  </button>
                </div>
                {deviceError && <p className={styles.deviceError}>{deviceError}</p>}
              </div>

              <div className={styles.lobbySide}>
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
                    <p>AI Interviewer · HireRight</p>
                  </div>
                </div>

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
                    'I am in a quiet place',
                    'My camera & mic are ready',
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
                  onClick={startInterview}
                  disabled={!canStart}
                  whileHover={canStart ? { scale: 1.02 } : undefined}
                  whileTap={canStart ? { scale: 0.98 } : undefined}
                >
                  Enter interview room
                </motion.button>
                {!canStart && (
                  <p className={styles.joinHint}>
                    Complete the checklist{!streamReady && !skipCamera ? ' and enable devices' : ''} to join.
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
            <div className={styles.callStage}>
              {/* Main: AI interviewer (CloudHire-style facing host) */}
              <div
                className={`${styles.mainTile} ${aiSpeaking ? styles.speakingTile : ''}`}
              >
                <div className={styles.mainBg} aria-hidden="true" />
                <div className={styles.interviewer}>
                  <div className={styles.portraitWrap}>
                    <motion.div
                      className={styles.portraitRing}
                      animate={
                        aiSpeaking
                          ? { scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }
                          : { scale: 1, opacity: 0.35 }
                      }
                      transition={
                        aiSpeaking
                          ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0.25 }
                      }
                    />
                    <div className={styles.portrait}>
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
                    </div>
                  </div>
                  <div className={styles.hostMeta}>
                    <h2>Ava</h2>
                    <p>AI Interviewer</p>
                    <Waveform active={aiSpeaking} />
                    <span className={styles.hostState}>
                      {aiSpeaking
                        ? 'Asking question…'
                        : listening
                          ? 'Listening to your answer…'
                          : 'Ready'}
                    </span>
                  </div>
                </div>

                <div className={styles.ccBox}>
                  <span className={styles.ccTag}>Captions</span>
                  <p>{question.text}</p>
                  {!aiSpeaking && (
                    <small>{question.hint}</small>
                  )}
                </div>

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
                  </span>
                </div>
              </div>

              {/* PiP: candidate */}
              <div className={styles.pip}>
                {streamReady && camOn ? (
                  <video
                    ref={roomVideoRef}
                    className={styles.pipVideo}
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className={styles.pipFallback}>
                    <span>{name.slice(0, 1).toUpperCase()}</span>
                  </div>
                )}
                <div className={styles.pipLabel}>
                  <span>You</span>
                  {listening && <em>Live</em>}
                </div>
                <Waveform active={listening && !aiSpeaking} />
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
                disabled={!draft.trim() || aiSpeaking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {current === questions.length - 1 ? 'Submit & finish' : 'Next question'}
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
              <p>Ava is reviewing communication, structure, and role fit.</p>
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
            <p className={styles.eyebrowLight}>Interview report</p>
            <h1>
              Your score with <em>Ava</em>
            </h1>
            <p className={styles.subLight}>
              {result.role} · {result.level} ·{' '}
              {new Date(result.date).toLocaleDateString()}
            </p>

            <div className={styles.scoreGrid}>
              <div className={styles.scoreCard}>
                <div
                  className={styles.scoreRing}
                  style={{
                    background: `radial-gradient(circle at center, #fff 62%, transparent 63%), conic-gradient(#f0510e 0 ${result.overall}%, #ffe0c7 ${result.overall}% 100%)`,
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
              </div>

              <div className={styles.categoryCard}>
                <h3>Score breakdown</h3>
                {result.categories.map((cat, i) => (
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
                  {result.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.insightCard}>
                <h3>Improve next</h3>
                <ul>
                  {result.improvements.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.answerReview}>
              <h3>Question feedback</h3>
              {result.answers.map((a, i) => (
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
                onClick={() => navigate('/jobs')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Unlock matched roles
              </motion.button>
              <button type="button" className={styles.secondaryBtn} onClick={retake}>
                Retake with Ava
              </button>
              <Link to="/dashboard" className={styles.secondaryBtn}>
                Open dashboard
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
