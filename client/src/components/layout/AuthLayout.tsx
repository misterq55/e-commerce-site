import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'

function AuthLayout() {
  const { user } = useSelector((state: RootState) => state.user)

  // 이미 로그인된 경우 홈으로 리다이렉트
  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Outlet />
    </div>
  )
}

export default AuthLayout
