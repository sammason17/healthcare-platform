import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test/utils'
import LoginPage from '../../pages/LoginPage'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../api/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}))

vi.mock('../../api/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders email and password inputs', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Unauthorized'))
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('navigates to /patients on successful login', async () => {
    mockLogin.mockResolvedValue({
      access_token: 'test-token',
      token_type: 'bearer',
      role: 'Doctor',
      user_id: 'user-1',
    })
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/email/i), 'doctor@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/patients')
    })
  })

  it('shows register link', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('disables submit button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}))
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/email/i), 'doctor@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
  })
})
