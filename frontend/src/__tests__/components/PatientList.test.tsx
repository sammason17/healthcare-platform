import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test/utils'
import PatientList from '../../components/patients/PatientList'
import type { Patient } from '../../api/patients'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const makePatient = (overrides: Partial<Patient> = {}): Patient => ({
  id: '1',
  first_name: 'Jane',
  last_name: 'Smith',
  date_of_birth: '1990-05-15',
  gender: 'Female',
  email: 'jane@test.com',
  phone: '07700900000',
  address: '1 Test St',
  created_at: '2024-01-01T00:00:00',
  updated_at: '2024-01-01T00:00:00',
  ...overrides,
})

const defaultProps = {
  patients: [makePatient()],
  total: 1,
  page: 1,
  pages: 1,
  pageSize: 20,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
}

describe('PatientList', () => {
  it('renders a patient row', () => {
    renderWithProviders(<PatientList {...defaultProps} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('1990-05-15')).toBeInTheDocument()
    expect(screen.getByText('Female')).toBeInTheDocument()
  })

  it('renders empty state when no patients', () => {
    renderWithProviders(<PatientList {...defaultProps} patients={[]} total={0} />)
    expect(screen.getByText(/no patients found/i)).toBeInTheDocument()
  })

  it('shows total count and page info', () => {
    renderWithProviders(<PatientList {...defaultProps} total={42} page={2} pages={5} />)
    expect(screen.getByText(/42 total/)).toBeInTheDocument()
    expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument()
  })

  it('disables Previous button on first page', () => {
    renderWithProviders(<PatientList {...defaultProps} page={1} pages={3} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    renderWithProviders(<PatientList {...defaultProps} page={3} pages={3} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('calls onPageChange when Next is clicked', async () => {
    const onPageChange = vi.fn()
    renderWithProviders(<PatientList {...defaultProps} page={1} pages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('navigates to patient detail when View is clicked', async () => {
    renderWithProviders(<PatientList {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /view/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/patients/1')
  })
})
