import { screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import { useAuth } from '../../context/AuthContext'

function TestConsumer() {
  const { user, token, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <span data-testid="role">{user?.role ?? 'none'}</span>
      <span data-testid="token">{token ?? 'none'}</span>
      <button onClick={() => login('test-token', 'Doctor', 'user-1')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated with no stored token', () => {
    renderWithProviders(<TestConsumer />)
    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    expect(screen.getByTestId('role')).toHaveTextContent('none')
  })

  it('restores auth state from localStorage on mount', () => {
    localStorage.setItem('hc_token', 'existing-token')
    localStorage.setItem('hc_role', 'Pharmacist')
    localStorage.setItem('hc_user_id', 'user-99')
    renderWithProviders(<TestConsumer />)
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('role')).toHaveTextContent('Pharmacist')
  })

  it('sets authenticated state and stores to localStorage on login', async () => {
    renderWithProviders(<TestConsumer />)
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('role')).toHaveTextContent('Doctor')
    expect(localStorage.getItem('hc_token')).toBe('test-token')
    expect(localStorage.getItem('hc_role')).toBe('Doctor')
    expect(localStorage.getItem('hc_user_id')).toBe('user-1')
  })

  it('clears state and localStorage on logout', async () => {
    renderWithProviders(<TestConsumer />)
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    await userEvent.click(screen.getByRole('button', { name: /logout/i }))
    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    expect(localStorage.getItem('hc_token')).toBeNull()
    expect(localStorage.getItem('hc_role')).toBeNull()
  })
})
