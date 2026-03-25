const colours: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Dispensed: 'bg-blue-100 text-blue-800',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colours[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}
