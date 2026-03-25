import { useState } from 'react'
import type { PatientDetail } from '../../api/patients'
import PrescriptionList from '../prescriptions/PrescriptionList'
import PrescriptionForm from '../prescriptions/PrescriptionForm'

interface Props {
  patient: PatientDetail
}

export default function PatientDetails({ patient }: Props) {
  const [showRxForm, setShowRxForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {patient.first_name} {patient.last_name}
        </h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 font-medium">Date of Birth</dt>
            <dd className="text-gray-900 mt-0.5">{patient.date_of_birth}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Gender</dt>
            <dd className="text-gray-900 mt-0.5">{patient.gender ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Email</dt>
            <dd className="text-gray-900 mt-0.5">{patient.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Phone</dt>
            <dd className="text-gray-900 mt-0.5">{patient.phone ?? '—'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-500 font-medium">Address</dt>
            <dd className="text-gray-900 mt-0.5">{patient.address ?? '—'}</dd>
          </div>
        </dl>
      </div>

      {/* Prescriptions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
          <button
            onClick={() => setShowRxForm((v) => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium"
          >
            {showRxForm ? 'Cancel' : '+ Add Prescription'}
          </button>
        </div>
        {showRxForm && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <PrescriptionForm
              patientId={patient.id}
              onSuccess={() => setShowRxForm(false)}
              onCancel={() => setShowRxForm(false)}
            />
          </div>
        )}
        <PrescriptionList prescriptions={patient.prescriptions} />
      </div>

      {/* Medical Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Reports</h3>
        {patient.medical_reports.length === 0 ? (
          <p className="text-gray-500 text-sm">No medical reports recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-medium text-gray-600">Date</th>
                  <th className="px-3 py-2 font-medium text-gray-600">BP</th>
                  <th className="px-3 py-2 font-medium text-gray-600">HR (bpm)</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Temp (°C)</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Weight (kg)</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {patient.medical_reports.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-gray-600">{new Date(r.recorded_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{r.blood_pressure ?? '—'}</td>
                    <td className="px-3 py-2">{r.heart_rate ?? '—'}</td>
                    <td className="px-3 py-2">{r.temperature ?? '—'}</td>
                    <td className="px-3 py-2">{r.weight_kg ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{r.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
