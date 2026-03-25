import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { createPatient, updatePatient, type Patient } from '../../api/patients'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Gender fluid', 'Transgender male', 'Transgender female', 'Genderqueer', 'Agender', 'Prefer not to say', 'Other']).optional(),
  email: z.preprocess(val => (val === '' ? undefined : val), z.string().email('Invalid email').optional()),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSuccess?: (patient: Patient) => void
  initialData?: Partial<Patient>
  patientId?: string
}

export default function PatientRegistrationForm({ onSuccess, initialData, patientId }: Props) {
  const isEdit = !!patientId
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: initialData?.first_name ?? '',
      last_name: initialData?.last_name ?? '',
      date_of_birth: initialData?.date_of_birth ?? '',
      gender: (initialData?.gender as FormData['gender']) ?? undefined,
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      address: initialData?.address ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, email: data.email || undefined }
      return isEdit ? updatePatient(patientId!, payload) : createPatient(payload as Omit<Patient, 'id' | 'created_at' | 'updated_at'>)
    },
    onSuccess: (patient) => onSuccess?.(patient),
    onError: (err: any) => {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') {
        setError('root', { message: detail })
      }
    },
  })

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            id="first_name"
            {...register('first_name')}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            id="last_name"
            {...register('last_name')}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
          <input
            id="date_of_birth"
            type="date"
            {...register('date_of_birth')}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>}
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            id="gender"
            {...register('gender')}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Gender fluid">Gender fluid</option>
            <option value="Transgender male">Transgender male</option>
            <option value="Transgender female">Transgender female</option>
            <option value="Genderqueer">Genderqueer</option>
            <option value="Agender">Agender</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          id="phone"
          {...register('phone')}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          id="address"
          {...register('address')}
          rows={2}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
      {mutation.isError && !errors.root && (
        <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
      )}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving...' : isEdit ? 'Update Patient' : 'Register Patient'}
      </button>
    </form>
  )
}
