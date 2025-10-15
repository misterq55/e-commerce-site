import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import api from '../api/axios'

interface User {
  id: number
  email: string
  name: string
  role: number
  image?: string
}

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
}

// Async thunk for register
export const registerUser = createAsyncThunk(
  'user/register',
  async ({ email, name, password }: { email: string; name: string; password: string }) => {
    const response = await api.post('/api/auth/register', {
      email,
      name,
      password,
    })
    return response.data.user
  }
)

// Async thunk for login
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    })
    return response.data.user
  }
)

// Async thunk for getting current user
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrent',
  async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'user/logout',
  async () => {
    const response = await api.post('/api/auth/logout')
    return response.data
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        toast.success('회원가입에 성공했습니다!')
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Register failed'
        toast.error(action.error.message || '회원가입에 실패했습니다.')
      })

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        toast.success('로그인에 성공했습니다!')
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Login failed'
        toast.error(action.error.message || '로그인에 실패했습니다.')
      })

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
      })

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.error = null
      })
  },
})

export const { clearError } = userSlice.actions
export default userSlice.reducer
