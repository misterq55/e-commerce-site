import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import Input from "../components/common/Input"
import { registerUser } from "../store/userSlice"
import type { AppDispatch, RootState } from "../store/store"

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmesPassword] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state: RootState) => state.user)

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmedPassword) {
      return alert('비밀번호와 비밀번호 확인이 다릅니다')
    }

    try {
      await dispatch(registerUser({ email, name, password })).unwrap()
      // Register successful, redirect to home
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <form className="w-80 p-8 bg-white rounded-lg shadow-md" onSubmit={onSubmitHandler}>
      <Input label="Email" type="email" value={email} onChange={setEmail} />
      <Input label="Name" type="name" value={name} onChange={setName} />
      <Input label="Password" type="password" value={password} onChange={setPassword} />
      <Input label="Confirm Password" type="password" value={confirmedPassword} onChange={setConfirmesPassword} />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-4">
        <button
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Register'}
        </button>
      </div>
    </form>
  )
}

export default RegisterPage
