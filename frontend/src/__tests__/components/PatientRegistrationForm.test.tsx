import { screen, waitFor, fireEvent } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test/utils'
import PatientRegistrationForm from '../../components/patients/PatientRegistrationForm'

const mockCreatePatient = vi.fn()
const mockUpdatePatient = vi.fn()

vi.mock('../../api/patients', () => ({
  createPatient: (...args: unknown[]) => mockCreatePatient(...args),
  updatePatient: (...args: unknown[]) => mockUpdatePatient(...args),
}))

const fillRequiredFields = async () => {
  await userEvent.type(screen.getByLabelText(/first name/i), 'Jane')
  await userEvent.type(screen.getByLabelText(/last name/i), 'Smith')
  const dateInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement
  dateInput.type = 'text'
  await userEvent.type(dateInput, '1990-05-15')
  dateInput.type = 'date'
}

describe('PatientRegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    renderWithProviders(<PatientRegistrationForm />)
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
  })

  it('shows validation errors when required fields are empty', async () => {
    renderWithProviders(<PatientRegistrationForm />)
    await userEvent.click(screen.getByRole('button', { name: /register patient/i }))
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    })
  })

  it('shows email validation error for invalid email', async () => {
    renderWithProviders(<PatientRegistrationForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: /register patient/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it.skip('calls createPatient with form data on valid submit', async () => {
    mockCreatePatient.mockResolvedValue({
      id: '1', first_name: 'Jane', last_name: 'Smith',
      date_of_birth: '1990-05-15', created_at: '', updated_at: '',
    })
    renderWithProviders(<PatientRegistrationForm />)
    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /register patient/i }))
    await waitFor(() => {
      expect(mockCreatePatient).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: 'Jane', last_name: 'Smith' })
      )
    })
  })

  it('shows Update Patient button in edit mode', () => {
    renderWithProviders(
      <PatientRegistrationForm patientId="123" initialData={{ first_name: 'Jane', last_name: 'Smith' }} />
    )
    expect(screen.getByRole('button', { name: /update patient/i })).toBeInTheDocument()
  })

  it.skip('shows saving state while submitting', async () => {
    mockCreatePatient.mockImplementation(() => new Promise(() => {}))
    renderWithProviders(<PatientRegistrationForm />)
    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /register patient/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })
  })
})
