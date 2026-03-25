import api from './axios'
import type { Prescription } from './prescriptions'
import type { MedicalReport } from './medicalReports'

export type { Prescription, MedicalReport }

export interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender?: string
  email?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface PatientDetail extends Patient {
  prescriptions: Prescription[]
  medical_reports: MedicalReport[]
}

export interface PaginatedPatients {
  items: Patient[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface PatientFilters {
  page?: number
  page_size?: number
  name?: string
  gender?: string
  min_age?: number
  max_age?: number
}

export const getPatients = (filters: PatientFilters) =>
  api.get<PaginatedPatients>('/patients', { params: filters }).then((r) => r.data)

export const getPatient = (id: string) =>
  api.get<PatientDetail>(`/patients/${id}`).then((r) => r.data)

export const createPatient = (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<Patient>('/patients', data).then((r) => r.data)

export const updatePatient = (id: string, data: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>) =>
  api.put<Patient>(`/patients/${id}`, data).then((r) => r.data)
