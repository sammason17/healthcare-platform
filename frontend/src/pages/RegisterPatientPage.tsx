import { useNavigate } from 'react-router-dom'
import type { Patient } from '../api/patients'
import PatientRegistrationForm from '../components/patients/PatientRegistrationForm'
import Navbar from '../components/layout/Navbar'

export default function RegisterPatientPage() {
  const navigate = useNavigate()

  const handleSuccess = (patient: Patient) => {
    navigate(`/patients/${patient.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/patients')}
          className="text-blue-600 hover:underline text-sm mb-4 flex items-center gap-1"
        >
          ← Back to Patients
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Register New Patient</h1>
          <PatientRegistrationForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
