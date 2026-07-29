import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../store/authStore'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children || <Outlet />
}
