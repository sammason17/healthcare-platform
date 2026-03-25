import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PatientsPage from './pages/PatientsPage'
import PatientDetailPage from './pages/PatientDetailPage'
import RegisterPatientPage from './pages/RegisterPatientPage'
import PendingPrescriptionsPage from './pages/PendingPrescriptionsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/patients"
        element={<ProtectedRoute><PatientsPage /></ProtectedRoute>}
      />
      <Route
        path="/patients/new"
        element={<ProtectedRoute><RegisterPatientPage /></ProtectedRoute>}
      />
      <Route
        path="/patients/:patientId"
        element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>}
      />
      <Route
        path="/prescriptions/pending"
        element={<ProtectedRoute><PendingPrescriptionsPage /></ProtectedRoute>}
      />
      <Route path="/" element={<Navigate to="/patients" replace />} />
      <Route path="*" element={<Navigate to="/patients" replace />} />
    </Routes>
  )
}
