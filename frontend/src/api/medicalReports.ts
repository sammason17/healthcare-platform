import api from './axios'

export interface MedicalReport {
  id: string
  patient_id: string
  recorded_by: string
  blood_pressure?: string
  heart_rate?: number
  temperature?: number
  weight_kg?: number
  height_cm?: number
  notes?: string
  recorded_at: string
}

export const createMedicalReport = (
  data: Omit<MedicalReport, 'id' | 'recorded_by' | 'recorded_at'>
) => api.post<MedicalReport>('/medical-reports', data).then((r) => r.data)
