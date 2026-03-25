import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthUser {
  id: string
  role: string
}

interface AuthContextType {
  token: string | null
  user: AuthUser | null
  login: (token: string, role: string, userId: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hc_token'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const id = localStorage.getItem('hc_user_id')
    const role = localStorage.getItem('hc_role')
    return id && role ? { id, role } : null
  })

  const login = (newToken: string, role: string, userId: string) => {
    localStorage.setItem('hc_token', newToken)
    localStorage.setItem('hc_role', role)
    localStorage.setItem('hc_user_id', userId)
    setToken(newToken)
    setUser({ id: userId, role })
  }

  const logout = () => {
    localStorage.removeItem('hc_token')
    localStorage.removeItem('hc_role')
    localStorage.removeItem('hc_user_id')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
