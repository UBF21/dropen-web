import { Navigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'
import type { AdminRole } from '@/types'

interface Props {
  children: React.ReactNode
  allowedRoles?: AdminRole[]
}

export default function AdminGuard({ children, allowedRoles }: Props) {
  const { user, profile, loading } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/admin/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
