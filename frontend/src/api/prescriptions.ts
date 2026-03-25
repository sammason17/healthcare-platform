import api from './axios'

export interface Prescription {
  id: string
  patient_id: string
  prescribed_by: string
  medication_name: string
  dosage?: string
  instructions?: string
  status: 'Pending' | 'Approved' | 'Dispensed'
  created_at: string
  updated_at: string
}

export const createPrescription = (data: {
  patient_id: string
  medication_name: string
  dosage?: string
  instructions?: string
}) => api.post<Prescription>('/prescriptions', data).then((r) => r.data)

export const getActivePrescriptions = () =>
  api.get<Prescription[]>('/prescriptions/active').then((r) => r.data)

export const updatePrescriptionStatus = (id: string, status: string) =>
  api.patch<Prescription>(`/prescriptions/${id}/status`, { status }).then((r) => r.data)
