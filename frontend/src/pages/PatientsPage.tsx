import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getPatients, type PatientFilters } from '../api/patients'
import PatientFilters from '../components/patients/PatientFilters'
import PatientList from '../components/patients/PatientList'
import Navbar from '../components/layout/Navbar'

export default function PatientsPage() {
  const [filters, setFilters] = useState<PatientFilters>({ page: 1, page_size: 20 })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patients', filters],
    queryFn: () => getPatients(filters),
    placeholderData: (prev) => prev,
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            {data && <p className="text-gray-500 text-sm mt-0.5">{data.total} patients registered</p>}
          </div>
          <Link
            to="/patients/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm"
          >
            + Register Patient
          </Link>
        </div>

        <PatientFilters filters={filters} onFiltersChange={setFilters} />

        {isLoading && <div className="text-center py-12 text-gray-500">Loading patients...</div>}
        {isError && <div className="text-center py-12 text-red-500">Failed to load patients. Please try again.</div>}

        {data && (
          <PatientList
            patients={data.items}
            total={data.total}
            page={data.page}
            pages={data.pages}
            pageSize={filters.page_size ?? 20}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            onPageSizeChange={(s) => setFilters((f) => ({ ...f, page_size: s, page: 1 }))}
          />
        )}
      </div>
    </div>
  )
}
