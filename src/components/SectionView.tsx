import type { PassportData } from '../types/passport'
import { SECTIONS } from '../data/sections'
import { getSectionCompletion } from '../lib/passport'
import { FieldInput } from './FieldInput'

interface SectionViewProps {
  data: PassportData
  sectionId: string
  onBack: () => void
  onUpdateField: (sectionId: string, fieldId: string, value: string | string[]) => void
}

export function SectionView({ data, sectionId, onBack, onUpdateField }: SectionViewProps) {
  const section = SECTIONS.find((s) => s.id === sectionId)
  if (!section) return null

  const sectionData = data.sections[sectionId] ?? {}
  const percent = getSectionCompletion(data, sectionId)

  return (
    <div>
      <button type="button" className="btn-link" onClick={onBack}>
        ← Back
      </button>

      <header className="page-header">
        <span className="section-icon purple">{section.icon}</span>
        <h1>{section.title}</h1>
        <p className="muted">{section.description}</p>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="muted" style={{ fontSize: '0.85rem' }}>{percent}% complete</p>
      </header>

      <div className="card">
        {section.fields.map((field) => (
          <FieldInput
            key={field.id}
            field={field}
            value={sectionData[field.id] ?? (field.type === 'list' ? [] : '')}
            onChange={(value) => onUpdateField(sectionId, field.id, value)}
          />
        ))}
      </div>

      <p className="muted center" style={{ marginTop: 16 }}>
        Tap <strong>Mic</strong> on any field to fill it by voice
      </p>
    </div>
  )
}
