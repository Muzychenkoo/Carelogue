import { useState } from 'react'
import type { FieldDefinition } from '../types/passport'
import { VoiceButton } from './VoiceButton'
import { useSpeechRecognition } from '../hooks/useVoice'
import { parseVoiceListInput } from '../lib/passport'

interface FieldInputProps {
  field: FieldDefinition
  value: string | string[]
  onChange: (value: string | string[]) => void
}

export function FieldInput({ field, value, onChange }: FieldInputProps) {
  const { isListening, transcript, supported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition()
  const [listInput, setListInput] = useState('')

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening((finalText) => {
        const text = finalText.trim()
        if (!text) return
        if (field.type === 'list') {
          const items = parseVoiceListInput(text)
          const current = Array.isArray(value) ? value : []
          onChange([...current, ...items])
        } else {
          onChange(text)
        }
        resetTranscript()
      })
    } else {
      startListening()
    }
  }

  const listValues = Array.isArray(value) ? value : []

  const addListItem = () => {
    const trimmed = listInput.trim()
    if (!trimmed) return
    onChange([...listValues, trimmed])
    setListInput('')
  }

  const removeListItem = (index: number) => {
    onChange(listValues.filter((_, i) => i !== index))
  }

  return (
    <div className="field">
      <div className="field-row">
        <label className="field-label">
          {field.label}
          {field.required && <span className="req"> *</span>}
        </label>
        <VoiceButton isListening={isListening} supported={supported} onClick={handleVoiceToggle} />
      </div>

      {isListening && (
        <p className="listening">Listening… {transcript && `"${transcript}"`}</p>
      )}

      {field.type === 'list' ? (
        <>
          <div className="list-row">
            <input
              type="text"
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem())}
              placeholder={field.placeholder}
            />
            <button type="button" className="btn" onClick={addListItem}>
              Add
            </button>
          </div>
          {listValues.length > 0 && (
            <ul className="tags">
              {listValues.map((item, i) => (
                <li key={`${item}-${i}`}>
                  {item}
                  <button type="button" onClick={() => removeListItem(i)} aria-label={`Remove ${item}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : field.type === 'textarea' ? (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      ) : (
        <input
          type={field.type === 'time' ? 'time' : 'text'}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}
    </div>
  )
}
