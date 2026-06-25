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
    if (isSpeaking) stop()
    else speak(readAloudText)
  }

  useEffect(() => () => stop(), [stop])

  return (
    <div>
      <button type="button" className="btn-link" onClick={onBack}>
        ← Back
      </button>

      <h1 style={{ marginTop: 12 }}>For caregivers</h1>
      <p className="muted">Everything to know about {name}.</p>

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={handleReadAll}
        disabled={!supported}
        style={{ marginTop: 16 }}
      >
        {isSpeaking ? 'Stop reading' : 'Read entire passport aloud'}
      </button>

      {!supported && <p className="muted center">Text-to-speech not supported in this browser.</p>}

      {data.childName && (
        <div className="block" style={{ marginTop: 20 }}>
          <strong>{data.childName}</strong>
          {data.childAge && <span className="muted"> — age {data.childAge}</span>}
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
          <div key={section.id} className="block caregiver-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2>{section.title}</h2>
              {supported && (
                <button type="button" className="btn-link" onClick={() => speak(`${section.title}. ${sectionText}`)}>
                  Read
                </button>
              )}
            </div>
            <dl>
              {filledFields.map((field) => (
                <div key={field.id}>
                  <dt>{field.label}</dt>
                  <dd>{formatFieldValue(field, sectionData[field.id])}</dd>
                </div>
              ))}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
