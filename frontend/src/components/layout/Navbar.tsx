import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/patients" className="text-xl font-bold tracking-tight hover:text-blue-200">
          Healthcare Platform
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/patients" className="hover:text-blue-200 text-sm font-medium">
            Patients
          </Link>
          <Link to="/prescriptions/pending" className="hover:text-blue-200 text-sm font-medium">
            Active Prescriptions
          </Link>
          {user && (
            <span className="bg-blue-600 text-xs px-2 py-1 rounded-full font-medium">
              {user.role}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-600 text-sm px-3 py-1.5 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
