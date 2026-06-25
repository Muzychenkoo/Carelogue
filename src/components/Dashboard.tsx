import type { PassportData } from '../types/passport'
import { SECTIONS } from '../data/sections'
import { getCompletionPercent, getMissingFields, getSectionCompletion } from '../lib/passport'

type View = 'dashboard' | 'section' | 'guide' | 'caregiver'

interface DashboardProps {
  data: PassportData
  onNavigate: (view: View, sectionId?: string) => void
}

export function Dashboard({ data, onNavigate }: DashboardProps) {
  const percent = getCompletionPercent(data)
  const missing = getMissingFields(data)

  return (
    <div>
      <p className="site-title">Carelogue</p>
      <h1>{data.childName ? `${data.childName}'s care passport` : 'Care passport'}</h1>
      {data.childAge && <p className="muted">Age {data.childAge}</p>}
      <p className="progress-text">
        {percent}% complete
        {percent < 100 && ` — ${missing.length} item${missing.length === 1 ? '' : 's'} missing`}
      </p>

      {missing.length > 0 && (
        <div className="block">
          <h2>What&apos;s missing</h2>
          <p className="muted">Use &ldquo;Guide me&rdquo; to fill these in by voice.</p>
          <ul className="missing-list">
            {missing.slice(0, 8).map((m) => (
              <li key={`${m.sectionId}-${m.field.id}`}>
                {m.field.label} <span className="muted">({m.sectionTitle})</span>
              </li>
            ))}
            {missing.length > 8 && <li className="muted">+{missing.length - 8} more</li>}
          </ul>
          <button type="button" className="btn btn-primary btn-block" onClick={() => onNavigate('guide')}>
            Guide me (voice)
          </button>
        </div>
      )}

      <hr />

      <h2>Sections</h2>
      {SECTIONS.map((section) => {
        const sectionPercent = getSectionCompletion(data, section.id)
        return (
          <button
            key={section.id}
            type="button"
            className="section-btn"
            onClick={() => onNavigate('section', section.id)}
          >
            <div className="section-btn-title">{section.title}</div>
            <div className="section-btn-meta">
              {section.description} — {sectionPercent}% done
            </div>
          </button>
        )
      })}

      {percent > 20 && (
        <>
          <hr />
          <button type="button" className="btn btn-block" onClick={() => onNavigate('caregiver')}>
            Read to caregiver
          </button>
        </>
      )}
    </div>
  )
}

export type { View }
