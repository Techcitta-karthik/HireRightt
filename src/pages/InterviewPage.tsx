import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
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

  const question = questions[current]
  const speechSupported = isSpeechRecognitionSupported()
  const ttsSupported = isSpeechSynthesisSupported()

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
    void video.play().catch(() => {
      // autoplay can fail until user gesture; lobby start covers that
    })
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
      if (streamRef.current) {
        stopTracks()
      }
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
        'Camera or microphone access was blocked. Allow permissions, or continue without camera.',
      )
      setStreamReady(false)
    } finally {
      setMediaBusy(false)
    }
  }

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
      const next = prefix ? `${prefix} ${spoken.trim()}` : spoken.trim()
      setDraft(next)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => {
      setListening(false)
      // Keep listening during answer turn if still in interview and mic on
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

  // Speak question, then auto-listen
  useEffect(() => {
    if (stage !== 'interview' || !question) return

    listenAfterTtsRef.current = false
    stopListening()
    setDraft('')
    draftRef.current = ''
    setAiSpeaking(true)

    const intro =
      current === 0
        ? `Hi ${firstName()}. Welcome to your HireRight AI interview. Here is your first question. `
        : `Question ${current + 1}. `

    speakText(`${intro}${question.text}`, {
      onStart: () => setAiSpeaking(true),
      onEnd: () => {
        setAiSpeaking(false)
        listenAfterTtsRef.current = true
        if (stageRef.current === 'interview' && micOnRef.current) {
          startListening()
        }
      },
      onError: () => {
        setAiSpeaking(false)
        listenAfterTtsRef.current = true
        if (stageRef.current === 'interview' && micOnRef.current) {
          startListening()
        }
      },
    })

    return () => {
      cancelSpeech()
      setAiSpeaking(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, current, question?.text])

  // Per-question countdown
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
  const canStart = streamReady || skipCamera

  const inCall = stage === 'interview'

  return (
    <div className={`${styles.page} ${inCall ? styles.pageCall : ''}`}>
      {!inCall && (
        <div className={styles.shell}>
          <SiteNav />
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === 'setup' && (
          <motion.section
            key="setup"
            className={`${styles.shell} ${styles.lobby}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <span className={styles.kicker}>VIDEO AI INTERVIEW</span>
            <h1>
              Ready, {firstName()}? Join your <em>live AI interview.</em>
            </h1>
            <p className={styles.sub}>
              Camera on, mic ready — our AI interviewer will ask 5 role-specific
              questions out loud. Answer by speaking. You&apos;ll get an instant
              score when you finish.
            </p>

            <div className={styles.lobbyGrid}>
              <div className={styles.previewCard}>
                <div className={styles.previewFrame}>
                  {streamReady ? (
                    <video
                      ref={lobbyVideoRef}
                      className={styles.previewVideo}
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <div className={styles.previewEmpty}>
                      <span aria-hidden="true">◎</span>
                      <p>Camera preview will appear here</p>
                    </div>
                  )}
                  {streamReady && (
                    <span className={styles.liveBadge}>Live preview</span>
                  )}
                </div>
                <div className={styles.deviceRow}>
                  <span className={streamReady ? styles.deviceOk : styles.deviceOff}>
                    Camera {streamReady && camOn ? 'ready' : 'off'}
                  </span>
                  <span className={streamReady ? styles.deviceOk : styles.deviceOff}>
                    Mic {streamReady && micOn ? 'ready' : 'off'}
                  </span>
                  <span
                    className={
                      speechSupported ? styles.deviceOk : styles.deviceWarn
                    }
                  >
                    Speech {speechSupported ? 'ready' : 'limited'}
                  </span>
                  <span
                    className={ttsSupported ? styles.deviceOk : styles.deviceWarn}
                  >
                    AI voice {ttsSupported ? 'ready' : 'off'}
                  </span>
                </div>
                <div className={styles.lobbyActions}>
                  <motion.button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => void enableDevices()}
                    disabled={mediaBusy}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {mediaBusy
                      ? 'Requesting…'
                      : streamReady
                        ? 'Refresh devices'
                        : 'Enable camera & mic'}
                  </motion.button>
                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={() => {
                      setSkipCamera(true)
                      setDeviceError('')
                    }}
                  >
                    Continue without camera
                  </button>
                </div>
                {deviceError && <p className={styles.deviceError}>{deviceError}</p>}
                {skipCamera && !streamReady && (
                  <p className={styles.skipNote}>
                    You can still take a voice/text interview without video.
                  </p>
                )}
              </div>

              <div className={styles.lobbyForm}>
                <div className={styles.field}>
                  <span>Choose your role</span>
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
                  <span>Experience level</span>
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

                <div className={styles.setupMeta}>
                  <div>
                    <strong>5</strong>
                    <span>Questions</span>
                  </div>
                  <div>
                    <strong>3 min</strong>
                    <span>Per question</span>
                  </div>
                  <div>
                    <strong>Spoken</strong>
                    <span>AI + you</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={startInterview}
                  disabled={!canStart}
                  whileHover={canStart ? { scale: 1.03 } : undefined}
                  whileTap={canStart ? { scale: 0.97 } : undefined}
                >
                  Join interview room →
                </motion.button>
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
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <header className={styles.callTop}>
              <div className={styles.callBrand}>
                <span className={styles.callDot} aria-hidden="true" />
                HIRERIGHT AI Interview
              </div>
              <div className={styles.callProgress}>
                <div className={styles.progressTrack}>
                  <motion.div
                    className={styles.progressFill}
                    animate={{
                      width: `${((current + 1) / questions.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: easeOut }}
                  />
                </div>
                <span>
                  Q{current + 1}/{questions.length} · {question.category}
                </span>
              </div>
              <span
                className={secondsLeft < 30 ? styles.timerLow : styles.timer}
              >
                {timeLabel}
              </span>
            </header>

            <div className={styles.stage}>
              <div
                className={`${styles.aiTile} ${aiSpeaking ? styles.aiSpeaking : ''}`}
              >
                <div className={styles.aiGlow} aria-hidden="true" />
                <div className={styles.aiAvatarWrap}>
                  <motion.div
                    className={styles.aiRing}
                    animate={
                      aiSpeaking
                        ? { scale: [1, 1.08, 1], opacity: [0.55, 0.95, 0.55] }
                        : { scale: 1, opacity: 0.35 }
                    }
                    transition={
                      aiSpeaking
                        ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.3 }
                    }
                  />
                  <motion.div
                    className={styles.aiAvatar}
                    animate={
                      aiSpeaking ? { scale: [1, 1.03, 1] } : { scale: 1 }
                    }
                    transition={
                      aiSpeaking
                        ? { duration: 0.7, repeat: Infinity }
                        : { duration: 0.2 }
                    }
                  >
                    AI
                  </motion.div>
                </div>
                <p className={styles.aiName}>Ava · HireRight Interviewer</p>
                <p className={styles.aiStatus}>
                  {aiSpeaking
                    ? 'Speaking…'
                    : listening
                      ? 'Listening to you…'
                      : 'Waiting'}
                </p>
                <div className={styles.caption}>
                  <p>{question.text}</p>
                  {!aiSpeaking && (
                    <span className={styles.hintLine}>{question.hint}</span>
                  )}
                </div>
              </div>

              <div className={styles.youTile}>
                {streamReady && camOn ? (
                  <video
                    ref={roomVideoRef}
                    className={styles.youVideo}
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className={styles.youFallback}>
                    <span>{firstName().slice(0, 1).toUpperCase()}</span>
                    <p>{camOn ? 'Camera unavailable' : 'Camera off'}</p>
                  </div>
                )}
                <div className={styles.youLabel}>
                  <span>You · {firstName()}</span>
                  {listening && <em className={styles.recPulse}>REC</em>}
                </div>
              </div>
            </div>

            <div className={styles.transcriptBar}>
              <div className={styles.transcriptHead}>
                <span>Your answer transcript</span>
                <span>{wordCount} words</span>
              </div>
              <p className={styles.transcriptBody}>
                {draft.trim() ||
                  (aiSpeaking
                    ? 'Wait for Ava to finish the question…'
                    : speechSupported
                      ? 'Start speaking — your words appear here.'
                      : 'Speech recognition unavailable. Type your answer below.')}
              </p>
              {(showTypeFallback || !speechSupported) && (
                <textarea
                  className={styles.typeFallback}
                  value={draft}
                  rows={3}
                  placeholder="Type your answer here…"
                  onChange={(event) => setDraft(event.target.value)}
                />
              )}
              {speechSupported && (
                <button
                  type="button"
                  className={styles.linkish}
                  onClick={() => setShowTypeFallback((v) => !v)}
                >
                  {showTypeFallback ? 'Hide typed answer' : 'Type instead'}
                </button>
              )}
            </div>

            <footer className={styles.controls}>
              <button
                type="button"
                className={`${styles.ctrlBtn} ${!micOn ? styles.ctrlOff : ''} ${listening ? styles.ctrlLive : ''}`}
                onClick={toggleMic}
                aria-pressed={micOn}
                title={micOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                <span aria-hidden="true">{micOn ? '🎙' : '🔇'}</span>
                {micOn ? 'Mic' : 'Muted'}
              </button>
              <button
                type="button"
                className={`${styles.ctrlBtn} ${!camOn ? styles.ctrlOff : ''}`}
                onClick={toggleCamera}
                aria-pressed={camOn}
                disabled={!streamReady}
                title={camOn ? 'Turn camera off' : 'Turn camera on'}
              >
                <span aria-hidden="true">{camOn ? '📷' : '🚫'}</span>
                {camOn ? 'Camera' : 'Cam off'}
              </button>
              {speechSupported && (
                <button
                  type="button"
                  className={`${styles.ctrlBtn} ${listening ? styles.ctrlLive : ''}`}
                  onClick={() => {
                    if (listening) stopListening()
                    else startListening()
                  }}
                  disabled={aiSpeaking || !micOn}
                >
                  {listening ? 'Pause listen' : 'Listen'}
                </button>
              )}
              <motion.button
                type="button"
                className={styles.nextBtn}
                onClick={() => submitAnswer()}
                disabled={!draft.trim() || aiSpeaking}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {current === questions.length - 1
                  ? 'Finish interview'
                  : 'Next question'}
              </motion.button>
              <button
                type="button"
                className={styles.endBtn}
                onClick={endInterviewEarly}
              >
                End
              </button>
            </footer>
          </motion.section>
        )}

        {stage === 'analyzing' && (
          <motion.section
            key="analyzing"
            className={`${styles.shell} ${styles.analyzing}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src="/rocket.png"
              alt=""
              className={styles.analyzeRocket}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <h2>Analyzing your interview…</h2>
            <div className={styles.analyzeSteps}>
              {[
                'Processing your spoken answers',
                'Measuring depth & communication',
                'Scoring against role benchmarks',
              ].map((step, i) => (
                <motion.p
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.75 }}
                >
                  ✓ {step}
                </motion.p>
              ))}
            </div>
          </motion.section>
        )}

        {stage === 'results' && result && (
          <motion.section
            key="results"
            className={`${styles.shell} ${styles.results}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <span className={styles.kicker}>INTERVIEW REPORT</span>
            <h1>
              Your AI Interview <em>Score</em>
            </h1>
            <p className={styles.sub}>
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
                    transition={{
                      delay: 0.3,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    {result.overall}
                  </motion.strong>
                </div>
                <p className={styles.scoreLabel}>
                  {result.overall >= 75
                    ? 'Excellent — interview ready'
                    : result.overall >= 55
                      ? 'Good — polish a few areas'
                      : 'Keep practicing — you will get there'}
                </p>
              </div>

              <div className={styles.categoryCard}>
                <h3>Score Breakdown</h3>
                {result.categories.map((cat, i) => (
                  <div key={cat.label} className={styles.catRow}>
                    <span>{cat.label}</span>
                    <div className={styles.catTrack}>
                      <motion.div
                        className={styles.catFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{
                          delay: 0.3 + i * 0.15,
                          duration: 0.7,
                          ease: easeOut,
                        }}
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
                <h3>Improve Next</h3>
                <ul>
                  {result.improvements.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.answerReview}>
              <h3>Question-by-Question Feedback</h3>
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
                  {a.answer && (
                    <p className={styles.yourAnswer}>“{a.answer}”</p>
                  )}
                </details>
              ))}
            </div>

            <div className={styles.resultActions}>
              <motion.button
                type="button"
                className={styles.primaryBtn}
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Go to Dashboard →
              </motion.button>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={retake}
              >
                Retake Interview
              </button>
              <Link to="/jobs" className={styles.ghostBtn}>
                Browse Job Matches
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
