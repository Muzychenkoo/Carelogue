import { useState } from 'react'
import { usePassport } from './hooks/usePassport'
import { Dashboard, type View } from './components/Dashboard'
import { SectionView } from './components/SectionView'
import { VoiceGuide } from './components/VoiceGuide'
import { CaregiverView } from './components/CaregiverView'

function ProfileSetup({
  childName,
  childAge,
  onSave,
}: {
  childName: string
  childAge: string
  onSave: (name: string, age: string) => void
}) {
  const [name, setName] = useState(childName)
  const [age, setAge] = useState(childAge)

  return (
    <div className="animate-fade-in text-center space-y-6 py-4">
      <div className="space-y-2">
        <span className="text-5xl">👶</span>
        <h1 className="text-3xl font-bold text-navy">Welcome to Carelogue</h1>
        <p className="text-navy-light max-w-sm mx-auto">
          Build a care passport so any new caregiver knows exactly how to look after your child.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-warm p-6 shadow-sm space-y-4 text-left max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            Child&apos;s name <span className="text-coral">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emma"
            className="w-full rounded-xl border border-warm bg-white px-4 py-3 text-navy placeholder:text-navy-light/50 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">
            Age <span className="text-coral">*</span>
          </label>
          <input
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 18 months"
            className="w-full rounded-xl border border-warm bg-white px-4 py-3 text-navy placeholder:text-navy-light/50 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          />
        </div>
        <button
          type="button"
          onClick={() => onSave(name.trim(), age.trim())}
          disabled={!name.trim() || !age.trim()}
          className="w-full rounded-xl bg-coral text-white py-3.5 font-semibold hover:bg-coral-dark active:scale-[0.98] transition-all disabled:opacity-40 shadow-md shadow-coral/20"
        >
          Get started
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const { data, updateField, updateProfile, setData } = usePassport()
  const [view, setView] = useState<View>('dashboard')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const navigate = (next: View, sectionId?: string) => {
    setView(next)
    if (sectionId) setActiveSection(sectionId)
  }

  const showSetup = !data.childName.trim() && view === 'dashboard'

  return (
    <div className="min-h-dvh bg-cream">
      <main className="mx-auto max-w-lg px-4 py-6 pb-12">
        {showSetup ? (
          <ProfileSetup
            childName={data.childName}
            childAge={data.childAge}
            onSave={updateProfile}
          />
        ) : view === 'dashboard' ? (
          <Dashboard data={data} onNavigate={navigate} />
        ) : view === 'section' && activeSection ? (
          <SectionView
            data={data}
            sectionId={activeSection}
            onBack={() => navigate('dashboard')}
            onUpdateField={updateField}
          />
        ) : view === 'guide' ? (
          <VoiceGuide
            data={data}
            onUpdate={setData}
            onBack={() => navigate('dashboard')}
          />
        ) : view === 'caregiver' ? (
          <CaregiverView
            data={data}
            onBack={() => navigate('dashboard')}
          />
        ) : null}
      </main>
    </div>
  )
}
