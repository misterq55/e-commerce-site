import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/userSlice'
import type { AppDispatch, RootState } from '../../store/store'

function NavBar() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.user)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <nav className="p-4 bg-gray-800 text-white">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-bold">
          Boilerplate
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <label
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              >
                Logout
              </label>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default NavBar
