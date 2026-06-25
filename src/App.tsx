import { useState } from 'react'
import { usePassport } from './hooks/usePassport'
import { Dashboard, type View } from './components/Dashboard'
import { SectionView } from './components/SectionView'
import { VoiceGuide } from './components/VoiceGuide'
import { CaregiverView } from './components/CaregiverView'
import { ExportBar } from './components/ExportBar'

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
    <div className="center">
      <div className="welcome-emoji">✨</div>
      <p className="site-title">Carelogue</p>
      <h1>Your child&apos;s care passport</h1>

      <div className="intro">
        <p>
          This helps you collect all the necessary information about your child,
          so they can feel comfortable with anyone — a grandparent, babysitter, or nursery.
        </p>
        <p>
          We&apos;ll guide you step by step and show you what&apos;s still missing,
          so you don&apos;t forget anything important.
        </p>
      </div>

      <div className="card" style={{ marginTop: 24, textAlign: 'left' }}>
        <div className="field">
          <label className="field-label">
            Child&apos;s name <span className="req">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emma"
          />
        </div>
        <div className="field">
          <label className="field-label">
            Age <span className="req">*</span>
          </label>
          <input
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 18 months"
          />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => onSave(name.trim(), age.trim())}
          disabled={!name.trim() || !age.trim()}
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
    <div className="container">
      {!showSetup && <ExportBar data={data} />}
      {showSetup ? (
        <ProfileSetup childName={data.childName} childAge={data.childAge} onSave={updateProfile} />
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
        <VoiceGuide data={data} onUpdate={setData} onBack={() => navigate('dashboard')} />
      ) : view === 'caregiver' ? (
        <CaregiverView data={data} onBack={() => navigate('dashboard')} />
      ) : null}
    </div>
  )
}
