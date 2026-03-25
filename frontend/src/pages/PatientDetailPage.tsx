import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPatient } from '../api/patients'
import PatientDetails from '../components/patients/PatientDetails'
import Navbar from '../components/layout/Navbar'

export default function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId!),
    enabled: !!patientId,
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/patients')}
          className="text-blue-600 hover:underline text-sm mb-4 flex items-center gap-1"
        >
          ← Back to Patients
        </button>

        {isLoading && <div className="text-center py-12 text-gray-500">Loading patient...</div>}
        {isError && <div className="text-center py-12 text-red-500">Patient not found or failed to load.</div>}
        {data && <PatientDetails patient={data} />}
      </div>
    </div>
  )
}
