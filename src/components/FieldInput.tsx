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
      stopListening()
      if (transcript.trim()) {
        if (field.type === 'list') {
          const items = parseVoiceListInput(transcript)
          const current = Array.isArray(value) ? value : []
          onChange([...current, ...items])
        } else {
          onChange(transcript.trim())
        }
        resetTranscript()
      }
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
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <label className="block text-sm font-medium text-navy">
          {field.label}
          {field.required && <span className="text-coral ml-1">*</span>}
        </label>
        <VoiceButton
          isListening={isListening}
          supported={supported}
          onClick={handleVoiceToggle}
          size="sm"
        />
      </div>

      {isListening && (
        <p className="text-sm text-coral italic animate-fade-in">
          Listening… {transcript && `"${transcript}"`}
        </p>
      )}

      {field.type === 'list' ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem())}
              placeholder={field.placeholder}
              className="flex-1 rounded-xl border border-warm bg-white px-4 py-3 text-navy placeholder:text-navy-light/50 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            />
            <button
              type="button"
              onClick={addListItem}
              className="rounded-xl bg-sage px-4 py-3 text-white font-medium hover:bg-sage-dark active:scale-95 transition-all"
            >
              Add
            </button>
          </div>
          {listValues.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {listValues.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className="flex items-center gap-1 rounded-full bg-warm px-3 py-1.5 text-sm text-navy"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeListItem(i)}
                    className="ml-1 text-navy-light hover:text-coral"
                    aria-label={`Remove ${item}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : field.type === 'textarea' ? (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-xl border border-warm bg-white px-4 py-3 text-navy placeholder:text-navy-light/50 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 resize-y min-h-[80px]"
        />
      ) : (
        <input
          type={field.type === 'time' ? 'time' : 'text'}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-warm bg-white px-4 py-3 text-navy placeholder:text-navy-light/50 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
        />
      )}
    </div>
  )
}
