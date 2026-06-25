import { useEffect } from 'react'
import type { PassportData } from '../types/passport'
import { SECTIONS } from '../data/sections'
import { buildReadAloudText, formatFieldValue } from '../lib/passport'
import { useSpeechSynthesis } from '../hooks/useVoice'

const ICON_COLORS = ['purple', 'teal', 'pink', 'coral', 'sky'] as const

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

      <header className="page-header">
        <h1>For caregivers</h1>
        <p className="muted">Everything to know about {name}</p>
      </header>

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={handleReadAll}
        disabled={!supported}
      >
        {isSpeaking ? 'Stop reading' : 'Read entire passport aloud'}
      </button>

      {!supported && <p className="muted center" style={{ marginTop: 12 }}>Text-to-speech not supported in this browser.</p>}

      {data.childName && (
        <div className="card" style={{ marginTop: 20 }}>
          <strong style={{ fontSize: '1.1rem' }}>{data.childName}</strong>
          {data.childAge && <span className="muted"> · age {data.childAge}</span>}
        </div>
      )}

      {SECTIONS.map((section, i) => {
        const sectionData = data.sections[section.id] ?? {}
        const filledFields = section.fields.filter((f) => {
          const v = sectionData[f.id]
          return v && (Array.isArray(v) ? v.length > 0 : v.trim())
        })
        if (filledFields.length === 0) return null

        const sectionText = filledFields
          .map((f) => `${f.label}: ${formatFieldValue(f, sectionData[f.id])}`)
          .join('. ')
        const color = ICON_COLORS[i % ICON_COLORS.length]

        return (
          <div key={section.id} className="card caregiver-section">
            <div className="caregiver-header">
              <h2 className="card-title">
                <span className={`section-icon ${color}`} style={{ width: 36, height: 36, fontSize: '1.1rem' }}>
                  {section.icon}
                </span>
                {section.title}
              </h2>
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
