import type { PassportData } from '../types/passport'
import { SECTIONS } from '../data/sections'
import { formatFieldValue } from './passport'

function isFieldEmpty(value: string | string[] | undefined): boolean {
  if (value === undefined) return true
  if (Array.isArray(value)) return value.length === 0 || value.every((v) => !v.trim())
  return !value.trim()
}

export function buildExportText(data: PassportData): string {
  const lines: string[] = ['CARELOGUE — CARE PASSPORT', '']

  if (data.childName) {
    lines.push(`Child: ${data.childName}`)
    if (data.childAge) lines.push(`Age: ${data.childAge}`)
    lines.push('')
  }

  for (const section of SECTIONS) {
    const sectionData = data.sections[section.id] ?? {}
    const filledFields = section.fields.filter((f) => !isFieldEmpty(sectionData[f.id]))
    if (filledFields.length === 0) continue

    lines.push(section.title.toUpperCase())
    lines.push('-'.repeat(section.title.length))
    for (const field of filledFields) {
      const value = formatFieldValue(field, sectionData[field.id])
      lines.push(`${field.label}: ${value}`)
    }
    lines.push('')
  }

  lines.push('—')
  lines.push('Created with Carelogue')

  return lines.join('\n')
}

export async function downloadPassportPdf(data: PassportData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 18
  const pageWidth = doc.internal.pageSize.getWidth()
  const maxWidth = pageWidth - margin * 2
  let y = margin

  const addLine = (text: string, opts?: { bold?: boolean; size?: number; gap?: number }) => {
    const size = opts?.size ?? 11
    const gap = opts?.gap ?? 6
    doc.setFontSize(size)
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal')

    const wrapped = doc.splitTextToSize(text, maxWidth) as string[]
    for (const line of wrapped) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += size * 0.45
    }
    y += gap
  }

  addLine('Carelogue', { bold: true, size: 20, gap: 4 })
  addLine(
    data.childName
      ? `${data.childName}'s Care Passport${data.childAge ? ` · Age ${data.childAge}` : ''}`
      : 'Care Passport',
    { size: 14, gap: 10 },
  )

  for (const section of SECTIONS) {
    const sectionData = data.sections[section.id] ?? {}
    const filledFields = section.fields.filter((f) => !isFieldEmpty(sectionData[f.id]))
    if (filledFields.length === 0) continue

    addLine(section.title, { bold: true, size: 13, gap: 4 })
    for (const field of filledFields) {
      const value = formatFieldValue(field, sectionData[field.id])
      addLine(`${field.label}: ${value}`, { size: 10, gap: 4 })
    }
    y += 4
  }

  addLine('Created with Carelogue', { size: 9, gap: 0 })

  const filename = data.childName
    ? `${data.childName.replace(/\s+/g, '-').toLowerCase()}-care-passport.pdf`
    : 'care-passport.pdf'

  doc.save(filename)
}

export function sendPassportEmail(data: PassportData, recipientEmail: string): void {
  const name = data.childName || 'your child'
  const subject = `Care Passport for ${name}`
  let body = buildExportText(data)

  const maxLength = 1800
  if (body.length > maxLength) {
    body =
      body.slice(0, maxLength) +
      '\n\n[Content truncated — please download the full PDF from Carelogue and attach it to this email.]'
  }

  const params = new URLSearchParams()
  params.set('subject', subject)
  params.set('body', body)

  const to = recipientEmail.trim()
  window.location.href = to ? `mailto:${to}?${params.toString()}` : `mailto:?${params.toString()}`
}
