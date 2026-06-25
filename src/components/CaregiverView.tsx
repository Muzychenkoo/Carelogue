import { useEffect } from 'react'
import type { PassportData } from '../types/passport'
import { SECTIONS } from '../data/sections'
import { buildReadAloudText, formatFieldValue } from '../lib/passport'
import { useSpeechSynthesis } from '../hooks/useVoice'

interface CaregiverViewProps {
  data: PassportData
  onBack: () => void
}

export function CaregiverView({ data, onBack }: CaregiverViewProps) {
  const { isSpeaking, supported, speak, stop } = useSpeechSynthesis()
  const readAloudText = buildReadAloudText(data)
  const name = data.childName || 'your child'

  const handleReadAll = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(readAloudText)
    }
  }

  useEffect(() => {
    return () => stop()
  }, [stop])

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
        <h1 className="text-2xl font-bold text-navy mt-3">
          Caregiver Briefing
        </h1>
        <p className="text-navy-light text-sm mt-1">
          Everything a new caregiver needs to know about {name}
        </p>
      </header>

      <button
        type="button"
        onClick={handleReadAll}
        disabled={!supported}
        className={`
          w-full rounded-2xl py-4 font-semibold text-lg transition-all active:scale-[0.98]
          ${isSpeaking
            ? 'bg-coral text-white shadow-lg shadow-coral/30'
            : 'bg-sage text-white hover:bg-sage-dark shadow-md shadow-sage/20'
          }
          disabled:opacity-50
        `}
      >
        {isSpeaking ? '⏹ Stop reading' : '🔊 Read entire passport aloud'}
      </button>

      {!supported && (
        <p className="text-sm text-coral text-center">
          Text-to-speech is not supported in this browser.
        </p>
      )}

      <div className="space-y-4">
        {data.childName && (
          <div className="rounded-2xl bg-white border border-warm p-5 shadow-sm">
            <h2 className="text-lg font-bold text-navy">
              {data.childName}
              {data.childAge && <span className="font-normal text-navy-light"> · Age {data.childAge}</span>}
            </h2>
          </div>
        )}

        {SECTIONS.map((section) => {
          const sectionData = data.sections[section.id] ?? {}
          const filledFields = section.fields.filter((f) => {
            const v = sectionData[f.id]
            return v && (Array.isArray(v) ? v.length > 0 : v.trim())
          })
          if (filledFields.length === 0) return null

          const sectionText = filledFields
            .map((f) => `${f.label}: ${formatFieldValue(f, sectionData[f.id])}`)
            .join('. ')

          return (
            <div key={section.id} className="rounded-2xl bg-white border border-warm p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy flex items-center gap-2">
                  <span>{section.icon}</span> {section.title}
                </h3>
                {supported && (
                  <button
                    type="button"
                    onClick={() => speak(`${section.title}. ${sectionText}`)}
                    className="text-sage text-sm font-medium hover:underline"
                  >
                    🔊 Read
                  </button>
                )}
              </div>
              <dl className="space-y-2">
                {filledFields.map((field) => (
                  <div key={field.id}>
                    <dt className="text-xs font-medium text-navy-light uppercase tracking-wide">
                      {field.label}
                    </dt>
                    <dd className="text-navy mt-0.5">
                      {formatFieldValue(field, sectionData[field.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>
    </div>
  )
}
