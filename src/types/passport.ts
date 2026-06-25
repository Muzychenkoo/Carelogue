export type FieldType = 'text' | 'textarea' | 'list' | 'time'

export interface FieldDefinition {
  id: string
  label: string
  prompt: string
  type: FieldType
  placeholder?: string
  required?: boolean
}

export interface SectionDefinition {
  id: string
  title: string
  icon: string
  description: string
  fields: FieldDefinition[]
}

export type FieldValues = Record<string, string | string[]>

export interface PassportData {
  childName: string
  childAge: string
  sections: Record<string, FieldValues>
  updatedAt: string
}

export interface MissingField {
  sectionId: string
  sectionTitle: string
  field: FieldDefinition
}
