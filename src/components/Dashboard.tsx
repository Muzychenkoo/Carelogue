import type { PassportData } from '../types/passport'
import { SECTIONS } from '../data/sections'
import { getCompletionPercent, getMissingFields, getSectionCompletion } from '../lib/passport'

type View = 'dashboard' | 'section' | 'guide' | 'caregiver'

const ICON_COLORS = ['purple', 'teal', 'pink', 'coral', 'sky'] as const

interface DashboardProps {
  data: PassportData
  onNavigate: (view: View, sectionId?: string) => void
}

export function Dashboard({ data, onNavigate }: DashboardProps) {
  const percent = getCompletionPercent(data)
  const missing = getMissingFields(data)

  return (
    <div>
      <header className="hero">
        <p className="site-title">Carelogue</p>
        <h1>{data.childName ? `${data.childName}'s care passport` : 'Care passport'}</h1>
        {data.childAge && <p className="muted">Age {data.childAge}</p>}
        <div className="hero-badge">
          <span className="dot" />
          {percent}% complete
          {percent < 100 && ` · ${missing.length} to go`}
        </div>
      </header>

      {missing.length > 0 && (
        <div className="card card-highlight">
          <h2>What&apos;s missing</h2>
          <p className="muted">Fill gaps quickly with voice — we&apos;ll walk you through each one.</p>
          <ul className="missing-list">
            {missing.slice(0, 6).map((m) => (
              <li key={`${m.sectionId}-${m.field.id}`}>
                <span>
                  <strong>{m.field.label}</strong>
                  <span className="muted"> · {m.sectionTitle}</span>
                </span>
              </li>
            ))}
            {missing.length > 6 && (
              <li><span className="muted">+{missing.length - 6} more items</span></li>
            )}
          </ul>
          <button type="button" className="btn btn-primary btn-block" onClick={() => onNavigate('guide')}>
            Guide me with voice
          </button>
        </div>
      )}

      <p className="section-label">Sections</p>
      <div className="section-grid">
        {SECTIONS.map((section, i) => {
          const sectionPercent = getSectionCompletion(data, section.id)
          const color = ICON_COLORS[i % ICON_COLORS.length]
          return (
            <button
              key={section.id}
              type="button"
              className="section-btn"
              onClick={() => onNavigate('section', section.id)}
            >
              <span className={`section-icon ${color}`}>{section.icon}</span>
              <div className="section-btn-body">
                <div className="section-btn-title">{section.title}</div>
                <div className="section-btn-meta">{section.description}</div>
              </div>
              <span className={`section-progress ${sectionPercent === 100 ? 'done' : 'pending'}`}>
                {sectionPercent}%
              </span>
            </button>
          )
        })}
      </div>

      {percent > 20 && (
        <>
          <div className="divider" />
          <button type="button" className="btn btn-secondary btn-block" onClick={() => onNavigate('caregiver')}>
            Read to caregiver
          </button>
        </>
      )}
    </div>
  )
}

export type { View }
