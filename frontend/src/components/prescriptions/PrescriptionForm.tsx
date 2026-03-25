import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPrescription } from '../../api/prescriptions'

const schema = z.object({
  medication_name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().optional(),
  instructions: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  patientId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PrescriptionForm({ patientId, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      createPrescription({ patient_id: patientId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
      queryClient.invalidateQueries({ queryKey: ['pending-prescriptions'] })
      reset()
      onSuccess?.()
    },
  })

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
        <input
          {...register('medication_name')}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Amoxicillin 500mg"
        />
        {errors.medication_name && <p className="text-red-500 text-xs mt-1">{errors.medication_name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
        <input
          {...register('dosage')}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. 1 tablet twice daily"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        <textarea
          {...register('instructions')}
          rows={2}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional instructions..."
        />
      </div>
      {mutation.isError && (
        <p className="text-red-500 text-sm">Failed to add prescription. Please try again.</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Add Prescription'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
