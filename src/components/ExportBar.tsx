import { useEffect, useRef, useState } from 'react'
import type { PassportData } from '../types/passport'
import { downloadPassportPdf, sendPassportEmail } from '../lib/export'

interface ExportBarProps {
  data: PassportData
}

export function ExportBar({ data }: ExportBarProps) {
  const [open, setOpen] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setShowEmail(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePdf = async () => {
    await downloadPassportPdf(data)
    setOpen(false)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendPassportEmail(data, email)
    setOpen(false)
    setShowEmail(false)
    setEmail('')
  }

  return (
    <div className="export-bar" ref={menuRef}>
      <button
        type="button"
        className="btn btn-export"
        onClick={() => {
          setOpen((v) => !v)
          setShowEmail(false)
        }}
        aria-expanded={open}
      >
        Export care log
      </button>

      {open && (
        <div className="export-menu">
          {!showEmail ? (
            <>
              <p className="export-menu-hint">Share your care passport with a caregiver.</p>
              <button type="button" className="export-menu-item" onClick={handlePdf}>
                Download PDF
              </button>
              <button
                type="button"
                className="export-menu-item"
                onClick={() => setShowEmail(true)}
              >
                Send to email
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailSubmit}>
              <p className="export-menu-hint">Opens your email app with the care log included.</p>
              <label className="field-label" htmlFor="export-email">
                Send to (optional)
              </label>
              <input
                id="export-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caregiver@email.com"
                autoFocus
              />
              <div className="export-menu-actions">
                <button type="button" className="btn" onClick={() => setShowEmail(false)}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary">
                  Open email
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
