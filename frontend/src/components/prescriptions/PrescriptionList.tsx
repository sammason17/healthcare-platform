import type { Prescription } from '../../api/prescriptions'
import StatusBadge from './StatusBadge'

interface Props {
  prescriptions: Prescription[]
  showStatusUpdate?: boolean
  onStatusUpdate?: (id: string, status: string) => void
}

const STATUS_OPTIONS = ['Pending', 'Approved', 'Dispensed']

export default function PrescriptionList({ prescriptions, showStatusUpdate, onStatusUpdate }: Props) {
  if (prescriptions.length === 0) {
    return <p className="text-gray-500 text-sm">No prescriptions found.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-3 py-2 font-medium text-gray-600">Medication</th>
            <th className="px-3 py-2 font-medium text-gray-600">Dosage</th>
            <th className="px-3 py-2 font-medium text-gray-600">Instructions</th>
            <th className="px-3 py-2 font-medium text-gray-600">Status</th>
            <th className="px-3 py-2 font-medium text-gray-600">Date</th>
            {showStatusUpdate && <th className="px-3 py-2 font-medium text-gray-600">Update</th>}
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((rx, i) => (
            <tr key={rx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 font-medium">{rx.medication_name}</td>
              <td className="px-3 py-2 text-gray-600">{rx.dosage ?? '—'}</td>
              <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{rx.instructions ?? '—'}</td>
              <td className="px-3 py-2"><StatusBadge status={rx.status} /></td>
              <td className="px-3 py-2 text-gray-500">{new Date(rx.created_at).toLocaleDateString()}</td>
              {showStatusUpdate && (
                <td className="px-3 py-2">
                  <select
                    defaultValue={rx.status}
                    onChange={(e) => onStatusUpdate?.(rx.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
