import { screen, waitFor, fireEvent, act } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test/utils'
import PatientFilters from '../../components/patients/PatientFilters'

describe('PatientFilters', () => {
  const defaultFilters = { page: 1, page_size: 20 }

  it('renders all filter inputs', () => {
    renderWithProviders(
      <PatientFilters filters={defaultFilters} onFiltersChange={vi.fn()} />
    )
    expect(screen.getByPlaceholderText(/first or last name/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByLabelText(/min age/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max age/i)).toBeInTheDocument()
  })

  it('calls onFiltersChange with gender when gender is selected', async () => {
    const onFiltersChange = vi.fn()
    renderWithProviders(
      <PatientFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />
    )
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Female')
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ gender: 'Female', page: 1 })
    )
  })

  it('calls onFiltersChange with min_age when min age is entered', async () => {
    const onFiltersChange = vi.fn()
    renderWithProviders(
      <PatientFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />
    )
    fireEvent.change(screen.getByLabelText(/min age/i), { target: { value: '18' } })
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ min_age: 18 })
    )
  })

  it('resets all filters when Clear is clicked', async () => {
    const onFiltersChange = vi.fn()
    renderWithProviders(
      <PatientFilters
        filters={{ ...defaultFilters, gender: 'Male', min_age: 30 }}
        onFiltersChange={onFiltersChange}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(onFiltersChange).toHaveBeenCalledWith({ page: 1, page_size: 20 })
  })

  it('debounces name input before calling onFiltersChange', async () => {
    vi.useFakeTimers()
    const onFiltersChange = vi.fn()
    renderWithProviders(
      <PatientFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />
    )
    fireEvent.change(screen.getByPlaceholderText(/first or last name/i), { target: { value: 'Smi' } })
    expect(onFiltersChange).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'Smi' }))
    act(() => { vi.runAllTimers() })
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Smi' }))
    vi.useRealTimers()
  })
})
