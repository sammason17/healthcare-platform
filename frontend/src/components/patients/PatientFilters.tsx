import { useState, useEffect } from 'react'
import type { PatientFilters } from '../../api/patients'

interface Props {
  filters: PatientFilters
  onFiltersChange: (f: PatientFilters) => void
}

export default function PatientFilters({ filters, onFiltersChange }: Props) {
  const [nameInput, setNameInput] = useState(filters.name ?? '')

  // Debounce name input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, name: nameInput || undefined, page: 1 })
    }, 300)
    return () => clearTimeout(timer)
  }, [nameInput])

  return (
    <div className="flex flex-wrap gap-3 items-end bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex-1 min-w-[180px]">
        <label htmlFor="filter-name" className="block text-xs font-medium text-gray-600 mb-1">Search by name</label>
        <input
          id="filter-name"
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="First or last name..."
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="min-w-[130px]">
        <label htmlFor="filter-gender" className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
        <select
          id="filter-gender"
          value={filters.gender ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, gender: e.target.value || undefined, page: 1 })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
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
      <div className="min-w-[90px]">
        <label htmlFor="filter-min-age" className="block text-xs font-medium text-gray-600 mb-1">Min age</label>
        <input
          id="filter-min-age"
          type="number"
          min={0}
          value={filters.min_age ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, min_age: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="min-w-[90px]">
        <label htmlFor="filter-max-age" className="block text-xs font-medium text-gray-600 mb-1">Max age</label>
        <input
          id="filter-max-age"
          type="number"
          min={0}
          value={filters.max_age ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, max_age: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={() => { setNameInput(''); onFiltersChange({ page: 1, page_size: filters.page_size }) }}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm"
      >
        Clear
      </button>
    </div>
  )
}
