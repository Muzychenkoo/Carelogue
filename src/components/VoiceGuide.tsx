import { useCallback, useEffect, useState } from 'react'
import type { MissingField, PassportData } from '../types/passport'
import { getMissingFields, setFieldValue, appendToListField, parseVoiceListInput } from '../lib/passport'
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/useVoice'
import { VoiceButton } from './VoiceButton'

interface VoiceGuideProps {
  data: PassportData
  onUpdate: (data: PassportData) => void
  onBack: () => void
}

export function VoiceGuide({ data, onUpdate, onBack }: VoiceGuideProps) {
  const missing = getMissingFields(data)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'prompt' | 'listen' | 'confirm'>('prompt')
  const { isListening, transcript, supported: sttSupported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition()
  const { isSpeaking, supported: ttsSupported, speak, stop } = useSpeechSynthesis()

  const current: MissingField | undefined = missing[index]
  const isComplete = missing.length === 0 || index >= missing.length

  const speakPrompt = useCallback(() => {
    if (!current || !ttsSupported) {
      setPhase('listen')
      return
    }
    speak(current.field.prompt, () => setPhase('listen'))
    setPhase('prompt')
  }, [current, ttsSupported, speak])

  useEffect(() => {
    if (!isComplete && current && phase === 'prompt') {
      const timer = setTimeout(speakPrompt, 400)
      return () => clearTimeout(timer)
    }
  }, [index, isComplete, current, phase, speakPrompt])

  const saveAnswer = (answer: string) => {
    if (!current) return
    const trimmed = answer.trim()
    if (!trimmed) return

    let updated: PassportData
    if (current.field.type === 'list') {
      const items = parseVoiceListInput(trimmed)
      if (items.length === 1) {
        updated = appendToListField(data, current.sectionId, current.field.id, items[0])
      } else {
        updated = setFieldValue(data, current.sectionId, current.field.id, items)
      }
    } else {
      updated = setFieldValue(data, current.sectionId, current.field.id, trimmed)
    }
    onUpdate(updated)
    resetTranscript()
    setPhase('prompt')
    setIndex((i) => i + 1)
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening((finalText) => {
        if (finalText.trim()) setPhase('confirm')
      })
    } else {
      stop()
      resetTranscript()
      startListening()
    }
  }

  const handleSkip = () => {
    resetTranscript()
    setPhase('prompt')
    setIndex((i) => i + 1)
  }

  if (isComplete) {
    return (
      <div className="center">
        <div className="welcome-emoji">🎉</div>
        <h1>All caught up!</h1>
        <p className="muted">You&apos;ve filled in everything we asked about.</p>
        <button type="button" className="btn btn-primary" onClick={onBack} style={{ marginTop: 20 }}>
          Back to passport
        </button>
      </div>
    )
  }

  return (
    <div>
      <button type="button" className="btn-link" onClick={onBack}>
        ← Back
      </button>

      <p className="muted" style={{ marginTop: 16 }}>
        Question {index + 1} of {missing.length}
      </p>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${(index / missing.length) * 100}%` }} />
      </div>

      <div className="card card-highlight center">
        <p className="site-title" style={{ marginBottom: 12 }}>{current.sectionTitle}</p>
        <h2>{current.field.label}</h2>
        <p className="muted">&ldquo;{current.field.prompt}&rdquo;</p>

        <div style={{ margin: '20px 0' }}>
          <VoiceButton isListening={isListening} supported={sttSupported} onClick={handleVoiceToggle} />
        </div>

        {isSpeaking && <p className="muted">Speaking question…</p>}
        {isListening && <p className="listening">Listening — speak now</p>}

        {phase === 'confirm' && transcript && (
          <div>
            <p>I heard: <strong>&ldquo;{transcript}&rdquo;</strong></p>
            <div className="guide-actions">
              <button type="button" className="btn btn-primary" onClick={() => saveAnswer(transcript)}>
                Save
              </button>
              <button type="button" className="btn" onClick={() => { resetTranscript(); startListening() }}>
                Retry
              </button>
            </div>
          </div>
        )}

        {!isListening && phase === 'listen' && !transcript && (
          <p className="muted">Tap Mic to answer</p>
        )}
      </div>

      <div className="guide-actions">
        <button type="button" className="btn" onClick={speakPrompt} disabled={isSpeaking}>
          Replay question
        </button>
        <button type="button" className="btn" onClick={handleSkip}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
