import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import Input from "../components/common/Input"
import { loginUser } from "../store/userSlice"
import type { AppDispatch, RootState } from "../store/store"

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state: RootState) => state.user)

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await dispatch(loginUser({ email, password })).unwrap()
      // Login successful, redirect to home
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <form className="w-80 p-8 bg-white rounded-lg shadow-md" onSubmit={onSubmitHandler}>
      <Input label="Email" type="email" value={email} onChange={setEmail} />
      <Input label="Password" type="password" value={password} onChange={setPassword} />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-4">
        <button
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Login'}
        </button>
      </div>
    </form>
  )
}

export default LoginPage
