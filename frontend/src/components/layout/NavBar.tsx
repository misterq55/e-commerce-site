import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import UserInfo from '../common/UserInfo'

function NavBar() {
  const { user } = useSelector((state: RootState) => state.user)

  return (
    <nav className="bg-black border-b border-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="text-white text-2xl sm:text-3xl font-semibold hover:text-gray-300 transition-colors"
          >
            LOGO
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {user ? (
              <UserInfo />
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
