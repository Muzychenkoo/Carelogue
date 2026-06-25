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
    const text = current.field.prompt
    speak(text, () => setPhase('listen'))
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
      stopListening()
      if (transcript.trim()) {
        setPhase('confirm')
      }
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
      <div className="animate-fade-in text-center space-y-6 py-8">
        <span className="text-6xl">🎉</span>
        <h1 className="text-2xl font-bold text-navy">All caught up!</h1>
        <p className="text-navy-light">
          {missing.length === 0
            ? 'Your care passport is complete.'
            : 'You\'ve gone through all the prompts.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-sage text-white px-8 py-3.5 font-semibold hover:bg-sage-dark active:scale-[0.98] transition-all"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <button
          type="button"
          onClick={onBack}
          className="text-sage font-medium text-sm hover:underline"
        >
          ← Back
        </button>
        <p className="text-sm text-navy-light mt-2">
          Question {index + 1} of {missing.length}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-warm overflow-hidden">
          <div
            className="h-full rounded-full bg-coral transition-all"
            style={{ width: `${((index) / missing.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="rounded-2xl bg-white border border-warm p-6 shadow-sm space-y-4 text-center">
        <p className="text-xs font-medium text-sage uppercase tracking-wider">
          {current.sectionTitle}
        </p>
        <h2 className="text-xl font-bold text-navy">{current.field.label}</h2>
        <p className="text-navy-light italic">&ldquo;{current.field.prompt}&rdquo;</p>

        <div className="flex justify-center py-4">
          <VoiceButton
            isListening={isListening}
            supported={sttSupported}
            onClick={handleVoiceToggle}
            size="lg"
          />
        </div>

        {isSpeaking && (
          <p className="text-sm text-sage">Speaking question…</p>
        )}

        {isListening && (
          <p className="text-sm text-coral animate-pulse">
            Listening… speak now
          </p>
        )}

        {phase === 'confirm' && transcript && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-navy">
              I heard: <strong>&ldquo;{transcript}&rdquo;</strong>
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => saveAnswer(transcript)}
                className="rounded-xl bg-sage text-white px-6 py-2.5 font-medium hover:bg-sage-dark active:scale-95 transition-all"
              >
                ✓ Save
              </button>
              <button
                type="button"
                onClick={() => { resetTranscript(); startListening() }}
                className="rounded-xl bg-warm text-navy px-6 py-2.5 font-medium hover:bg-warm/80 active:scale-95 transition-all"
              >
                ↻ Retry
              </button>
            </div>
          </div>
        )}

        {!isListening && phase === 'listen' && !transcript && (
          <p className="text-sm text-navy-light">
            Tap the microphone to answer, or replay the question below.
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={speakPrompt}
          disabled={isSpeaking}
          className="rounded-xl border border-warm bg-white px-5 py-2.5 text-sm font-medium text-navy hover:bg-warm/50 disabled:opacity-50 transition-all"
        >
          🔊 Replay question
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-xl border border-warm bg-white px-5 py-2.5 text-sm font-medium text-navy-light hover:bg-warm/50 transition-all"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
