/** Browser speech helpers for the video AI interview. */

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const preferred = voices.find(
    (v) =>
      /en(-|_)?(US|GB|IN|AU)?/i.test(v.lang) &&
      /google|natural|neural|samantha|jenny|aria|female/i.test(v.name),
  )
  if (preferred) return preferred

  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ?? voices[0] ?? null
  )
}

export function cancelSpeech(): void {
  if (!isSpeechSynthesisSupported()) return
  window.speechSynthesis.cancel()
}

export function speakText(
  text: string,
  options?: {
    onStart?: () => void
    onEnd?: () => void
    onError?: () => void
  },
): void {
  if (!isSpeechSynthesisSupported() || !text.trim()) {
    options?.onEnd?.()
    return
  }

  cancelSpeech()

  // Voices often load async — retry once after voiceschanged.
  const run = () => {
    const utterance = new SpeechSynthesisUtterance(text.trim())
    const voice = pickVoice()
    if (voice) utterance.voice = voice
    utterance.rate = 0.96
    utterance.pitch = 1
    utterance.volume = 1
    utterance.onstart = () => options?.onStart?.()
    utterance.onend = () => options?.onEnd?.()
    utterance.onerror = () => options?.onError?.()
    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    const onVoices = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices)
      run()
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoices)
    // Fallback if voiceschanged never fires
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices)
      if (!window.speechSynthesis.speaking) run()
    }, 400)
    return
  }

  run()
}

export function getSpeechRecognition(): SpeechRecognition | null {
  if (!isSpeechRecognitionSupported()) return null
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}
