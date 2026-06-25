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
    <div className="animate-fade-in space-y-6">
      <header className="space-y-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sage font-medium text-sm hover:underline"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{section.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-navy">{section.title}</h1>
            <p className="text-navy-light text-sm">{section.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-warm overflow-hidden">
            <div
              className="h-full rounded-full bg-sage transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-sage">{percent}%</span>
        </div>
      </header>

      <div className="space-y-6 rounded-2xl bg-white border border-warm p-5 shadow-sm">
        {section.fields.map((field) => (
          <FieldInput
            key={field.id}
            field={field}
            value={sectionData[field.id] ?? (field.type === 'list' ? [] : '')}
            onChange={(value) => onUpdateField(sectionId, field.id, value)}
          />
        ))}
      </div>

      <p className="text-center text-sm text-navy-light">
        Tap the 🎤 on any field to fill it by voice
      </p>
    </div>
  )
}
