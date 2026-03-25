import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getActivePrescriptions, updatePrescriptionStatus } from '../api/prescriptions'
import PrescriptionList from '../components/prescriptions/PrescriptionList'
import Navbar from '../components/layout/Navbar'

export default function PendingPrescriptionsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['active-prescriptions'],
    queryFn: getActivePrescriptions,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updatePrescriptionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-prescriptions'] })
    },
  })

  const pendingCount = data?.filter((p) => p.status === 'Pending').length ?? 0
  const approvedCount = data?.filter((p) => p.status === 'Approved').length ?? 0

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Active Prescriptions</h1>
          {data && (
            <p className="text-gray-500 text-sm mt-0.5">
              {pendingCount} pending · {approvedCount} approved
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading && <div className="text-center py-8 text-gray-500">Loading...</div>}
          {isError && <div className="text-center py-8 text-red-500">Failed to load prescriptions.</div>}
          {data && (
            <PrescriptionList
              prescriptions={data}
              showStatusUpdate
              onStatusUpdate={(id, status) => statusMutation.mutate({ id, status })}
            />
          )}
        </div>
      </div>
    </div>
  )
}
