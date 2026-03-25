import { useNavigate } from 'react-router-dom'
import type { Patient } from '../../api/patients'

interface Props {
  patients: Patient[]
  total: number
  page: number
  pages: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}

export default function PatientList({
  patients, total, page, pages, pageSize, onPageChange, onPageSizeChange
}: Props) {
  const navigate = useNavigate()

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No patients found. Try adjusting your filters or register a new patient.
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Date of Birth</th>
              <th className="px-4 py-3 font-medium text-gray-600">Gender</th>
              <th className="px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr
                key={p.id}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
              >
                <td className="px-4 py-3 font-medium">{p.first_name} {p.last_name}</td>
                <td className="px-4 py-3 text-gray-600">{p.date_of_birth}</td>
                <td className="px-4 py-3 text-gray-600">{p.gender ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{p.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{p.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {[10, 20, 50].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span>
          {total} total · Page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
