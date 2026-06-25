import type { FieldDefinition, FieldValues, MissingField, PassportData } from '../types/passport'
import { SECTIONS, createEmptyPassport } from '../data/sections'

const STORAGE_KEY = 'carelogue-passport'

function isFieldEmpty(value: string | string[] | undefined): boolean {
  if (value === undefined) return true
  if (Array.isArray(value)) return value.length === 0 || value.every((v) => !v.trim())
  return !value.trim()
}

export function getMissingFields(data: PassportData): MissingField[] {
  const missing: MissingField[] = []

  if (!data.childName.trim()) {
    missing.push({
      sectionId: '_profile',
      sectionTitle: 'Profile',
      field: {
        id: 'childName',
        label: 'Child\'s name',
        prompt: 'What is your child\'s name?',
        type: 'text',
        required: true,
      },
    })
  }

  if (!data.childAge.trim()) {
    missing.push({
      sectionId: '_profile',
      sectionTitle: 'Profile',
      field: {
        id: 'childAge',
        label: 'Child\'s age',
        prompt: 'How old is your child?',
        type: 'text',
        required: true,
      },
    })
  }

  for (const section of SECTIONS) {
    const sectionData = data.sections[section.id] ?? {}
    for (const field of section.fields) {
      if (field.required && isFieldEmpty(sectionData[field.id])) {
        missing.push({ sectionId: section.id, sectionTitle: section.title, field })
      }
    }
  }

  return missing
}

export function getCompletionPercent(data: PassportData): number {
  let total = 2 // childName + childAge
  let filled = 0

  if (data.childName.trim()) filled++
  if (data.childAge.trim()) filled++

  for (const section of SECTIONS) {
    const sectionData = data.sections[section.id] ?? {}
    for (const field of section.fields) {
      if (field.required) {
        total++
        if (!isFieldEmpty(sectionData[field.id])) filled++
      }
    }
  }

  return total === 0 ? 0 : Math.round((filled / total) * 100)
}

export function getSectionCompletion(data: PassportData, sectionId: string): number {
  const section = SECTIONS.find((s) => s.id === sectionId)
  if (!section) return 0

  const required = section.fields.filter((f) => f.required)
  if (required.length === 0) return 100

  const sectionData = data.sections[sectionId] ?? {}
  const filled = required.filter((f) => !isFieldEmpty(sectionData[f.id])).length
  return Math.round((filled / required.length) * 100)
}

export function loadPassport(): PassportData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PassportData
      return mergeWithDefaults(parsed)
    }
  } catch {
    // fall through
  }
  return mergeWithDefaults(null)
}

function mergeWithDefaults(saved: PassportData | null): PassportData {
  const empty = createEmptyPassport()

  if (!saved) return empty

  return {
    childName: saved.childName ?? '',
    childAge: saved.childAge ?? '',
    sections: Object.fromEntries(
      SECTIONS.map((section) => {
        const savedSection = saved.sections?.[section.id] ?? {}
        const merged: FieldValues = {}
        for (const field of section.fields) {
          const val = savedSection[field.id]
          if (field.type === 'list') {
            merged[field.id] = Array.isArray(val) ? val : val ? [String(val)] : []
          } else {
            merged[field.id] = typeof val === 'string' ? val : Array.isArray(val) ? val.join(', ') : ''
          }
        }
        return [section.id, merged]
      }),
    ),
    updatedAt: saved.updatedAt ?? new Date().toISOString(),
  }
}

export function savePassport(data: PassportData): void {
  const toSave = { ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
}

export function buildReadAloudText(data: PassportData): string {
  const lines: string[] = []

  if (data.childName) {
    lines.push(`Care passport for ${data.childName}${data.childAge ? `, age ${data.childAge}` : ''}.`)
    lines.push('')
  }

  for (const section of SECTIONS) {
    const sectionData = data.sections[section.id] ?? {}
    const hasContent = section.fields.some((f) => !isFieldEmpty(sectionData[f.id]))
    if (!hasContent) continue

    lines.push(`${section.title}.`)
    for (const field of section.fields) {
      const value = sectionData[field.id]
      if (isFieldEmpty(value)) continue
      const display = Array.isArray(value) ? value.join(', ') : value
      lines.push(`${field.label}: ${display}.`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function formatFieldValue(_field: FieldDefinition, value: string | string[] | undefined): string {
  if (isFieldEmpty(value)) return ''
  if (Array.isArray(value)) return value.join(', ')
  return value ?? ''
}

export function setFieldValue(
  data: PassportData,
  sectionId: string,
  fieldId: string,
  value: string | string[],
): PassportData {
  if (sectionId === '_profile') {
    if (fieldId === 'childName') return { ...data, childName: value as string }
    if (fieldId === 'childAge') return { ...data, childAge: value as string }
  }

  return {
    ...data,
    sections: {
      ...data.sections,
      [sectionId]: {
        ...data.sections[sectionId],
        [fieldId]: value,
      },
    },
  }
}

export function getFieldValue(data: PassportData, sectionId: string, fieldId: string): string | string[] {
  if (sectionId === '_profile') {
    if (fieldId === 'childName') return data.childName
    if (fieldId === 'childAge') return data.childAge
  }
  return data.sections[sectionId]?.[fieldId] ?? ''
}

export function appendToListField(
  data: PassportData,
  sectionId: string,
  fieldId: string,
  item: string,
): PassportData {
  const current = getFieldValue(data, sectionId, fieldId)
  const list = Array.isArray(current) ? current : current ? [current] : []
  const trimmed = item.trim()
  if (!trimmed) return data
  return setFieldValue(data, sectionId, fieldId, [...list, trimmed])
}

export function parseVoiceListInput(text: string): string[] {
  return text
    .split(/,| and |\. /)
    .map((s) => s.trim())
    .filter(Boolean)
}
