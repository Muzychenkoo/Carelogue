import type { PassportData } from '../types/passport'
import { SECTIONS } from '../data/sections'
import { getCompletionPercent, getMissingFields, getSectionCompletion } from '../lib/passport'
import { ProgressRing } from './ProgressRing'

type View = 'dashboard' | 'section' | 'guide' | 'caregiver'

interface DashboardProps {
  data: PassportData
  onNavigate: (view: View, sectionId?: string) => void
}

export function Dashboard({ data, onNavigate }: DashboardProps) {
  const percent = getCompletionPercent(data)
  const missing = getMissingFields(data)

  return (
    <div className="animate-fade-in space-y-6">
      <header className="text-center space-y-4">
        <p className="text-sm font-medium text-sage uppercase tracking-wider">Carelogue</p>
        <h1 className="text-3xl font-bold text-navy">
          {data.childName ? `${data.childName}'s` : 'Your'} Care Passport
        </h1>
        {data.childAge && (
          <p className="text-navy-light">Age {data.childAge}</p>
        )}
        <ProgressRing percent={percent} />
        <p className="text-navy-light text-sm">
          {percent === 100
            ? 'Passport complete! Ready to share with caregivers.'
            : `${missing.length} item${missing.length === 1 ? '' : 's'} still needed`}
        </p>
      </header>

      {missing.length > 0 && (
        <div className="rounded-2xl bg-white border border-warm p-5 space-y-3 shadow-sm">
          <h2 className="font-semibold text-navy flex items-center gap-2">
            <span>📝</span> What&apos;s missing
          </h2>
          <p className="text-sm text-navy-light">
            Tap &ldquo;Guide me&rdquo; to fill these in by voice, one at a time.
          </p>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {missing.slice(0, 5).map((m) => (
              <li key={`${m.sectionId}-${m.field.id}`} className="text-sm text-navy flex items-start gap-2">
                <span className="text-coral mt-0.5">○</span>
                <span>
                  <span className="font-medium">{m.field.label}</span>
                  <span className="text-navy-light"> — {m.sectionTitle}</span>
                </span>
              </li>
            ))}
            {missing.length > 5 && (
              <li className="text-sm text-navy-light pl-5">
                +{missing.length - 5} more…
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={() => onNavigate('guide')}
            className="w-full rounded-xl bg-coral text-white py-3.5 font-semibold hover:bg-coral-dark active:scale-[0.98] transition-all shadow-md shadow-coral/20"
          >
            🎤 Guide me — fill by voice
          </button>
        </div>
      )}

      <div className="grid gap-3">
        <h2 className="font-semibold text-navy px-1">Sections</h2>
        {SECTIONS.map((section) => {
          const sectionPercent = getSectionCompletion(data, section.id)
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onNavigate('section', section.id)}
              className="flex items-center gap-4 rounded-2xl bg-white border border-warm p-4 text-left hover:border-sage/50 active:scale-[0.99] transition-all shadow-sm"
            >
              <span className="text-3xl">{section.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy">{section.title}</p>
                <p className="text-sm text-navy-light truncate">{section.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-sm font-bold ${sectionPercent === 100 ? 'text-sage' : 'text-coral'}`}>
                  {sectionPercent}%
                </span>
                <div className="w-12 h-1.5 rounded-full bg-warm overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sage transition-all"
                    style={{ width: `${sectionPercent}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {percent > 20 && (
        <button
          type="button"
          onClick={() => onNavigate('caregiver')}
          className="w-full rounded-xl border-2 border-sage text-sage py-3.5 font-semibold hover:bg-sage/10 active:scale-[0.98] transition-all"
        >
          🔊 Read passport to caregiver
        </button>
      )}
    </div>
  )
}

export type { View }
