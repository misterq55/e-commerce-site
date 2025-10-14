import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import Input from "../components/common/Input"
import { registerUser } from "../store/userSlice"
import type { AppDispatch, RootState } from "../store/store"
import { userEmail, userName, userPassword, userConfirmedPassword } from "../utils/validationRules"

interface RegisterForm {
  email: string
  name: string
  password: string
  confirmedPassword: string
}

function RegisterPage() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state: RootState) => state.user)
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    try {
      await dispatch(registerUser({
        email: data.email,
        name: data.name,
        password: data.password
      })).unwrap()
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <form className="w-80 p-8 bg-white rounded-lg shadow-md" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        type="email"
        {...register('email', userEmail)}
        error={errors.email?.message}
      />

      <Input
        label="Name"
        type="text"
        {...register('name', userName)}
        error={errors.name?.message}
      />

      <Input
        label="Password"
        type="password"
        {...register('password', userPassword)}
        error={errors.password?.message}
      />

      <Input
        label="Confirm Password"
        type="password"
        {...register('confirmedPassword', userConfirmedPassword(password))}
        error={errors.confirmedPassword?.message}
      />

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

      <p className="text-center text-sm text-gray-600">
        아이디가 있다면?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          로그인
        </Link>
      </p>
    </form>
  )
}

export default RegisterPage
