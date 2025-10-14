import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import Input from "../components/common/Input"
import { loginUser } from "../store/userSlice"
import type { AppDispatch, RootState } from "../store/store"
import { userEmail, userPassword } from "../utils/validationRules"

interface LoginForm {
  email: string
  password: string
}

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state: RootState) => state.user)

  const onSubmit = async (data: LoginForm) => {
    try {
      await dispatch(loginUser(data)).unwrap()
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
        label="Password"
        type="password"
        {...register('password', userPassword)}
        error={errors.password?.message}
      />

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

      <p className="text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
          회원가입
        </Link>
      </p>
    </form>
  )
}

export default LoginPage
