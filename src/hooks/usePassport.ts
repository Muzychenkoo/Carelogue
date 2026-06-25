import { useCallback, useEffect, useState } from 'react'
import type { PassportData } from '../types/passport'
import { loadPassport, savePassport, setFieldValue } from '../lib/passport'

export function usePassport() {
  const [data, setData] = useState<PassportData>(() => loadPassport())

  useEffect(() => {
    savePassport(data)
  }, [data])

  const updateField = useCallback(
    (sectionId: string, fieldId: string, value: string | string[]) => {
      setData((prev) => setFieldValue(prev, sectionId, fieldId, value))
    },
    [],
  )

  const updateProfile = useCallback((childName: string, childAge: string) => {
    setData((prev) => ({ ...prev, childName, childAge }))
  }, [])

  return { data, updateField, updateProfile, setData }
}
