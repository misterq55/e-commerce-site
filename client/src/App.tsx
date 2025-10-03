import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { fetchCurrentUser } from './store/userSlice'
import type { AppDispatch } from './store/store'

function App() {
  const dispatch = useDispatch<AppDispatch>()

  // 앱 시작 시 현재 로그인된 유저 정보 가져오기
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <Router>
      <Routes>
        {/* Main Layout - Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth Layout - Login/Register */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes 예시 */}
        {/* <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route> */}
      </Routes>
    </Router>
  )
}

export default App
