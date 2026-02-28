import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import type { AxiosError } from 'axios'
import api from '../api/axios'
import type { CartProduct } from '../types/product'
import type { User, CartItem } from '../types/user'

interface UserState {
  user: User | null
  cartDetail: CartProduct[]
  isLoading: boolean
  error: string | null
}

interface RegisterInput {
  email: string
  name: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

interface CartActionInput {
  productId: number
}

interface GetCartItemsInput {
  cartItemIds: number[]
  userCart: CartItem[]
}

const initialState: UserState = {
  user: null,
  cartDetail: [],
  isLoading: false,
  error: null,
}

// Async thunk for register
export const registerUser = createAsyncThunk(
  'user/register',
  async ({ email, name, password }: RegisterInput) => {
    const response = await api.post('/api/users/register', {
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
  async ({ email, password }: LoginInput) => {
    const response = await api.post('/api/users/login', {
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
    const response = await api.get('/api/users/me')
    return response.data
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'user/logout',
  async () => {
    const response = await api.post('/api/users/logout')
    return response.data
  }
)

// Async thunk for add to cart
export const addToCart = createAsyncThunk(
  'user/addToCart',
  async (body: CartActionInput, thunkAPI) => {
    try {
      const response = await api.post('/api/users/cart', body)
      return response.data
    } catch (err) {
      const error = err as AxiosError
      console.error(error)
      return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Async thunk for remove cart item
export const removeCartItem = createAsyncThunk(
  'user/removeCartItem',
  async (body: CartActionInput, thunkAPI) => {
    try {
      const response = await api.delete(`/api/users/cart?productId=${body.productId}`)
      return response.data
    } catch (err) {
      const error = err as AxiosError
      console.error(error)
      return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Async thunk for get cart items
export const getCartItems = createAsyncThunk(
  'user/getCartItems',
  async (body: GetCartItemsInput, thunkAPI) => {
    try {
      const response = await api.get(`/api/products/${body.cartItemIds}?type=array`)
      body.userCart.forEach((cartItem: CartItem) => {
        response.data.forEach((productDetail: { id: number; quantity?: number }, index: number) => {
          if (cartItem.productId === productDetail.id) {
            response.data[index].quantity = cartItem.quantity
          }
        })
      })
      return response.data
    } catch (err) {
      const error = err as AxiosError
      console.error(error)
      return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
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

    // Get cart items
    builder
      .addCase(getCartItems.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCartItems.fulfilled, (state, action) => {
        state.isLoading = false
        state.cartDetail = action.payload
      })
      .addCase(getCartItems.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to load cart items'
        toast.error('장바구니 상품을 불러오는데 실패했습니다.')
      })

    // Remove cart item
    builder
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.user) {
          state.user.cart = action.payload.cart
        }
        state.cartDetail = state.cartDetail.filter(
          item => item.id !== action.meta.arg.productId
        )
        toast.success('장바구니에서 삭제되었습니다.')
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Remove cart item failed'
        toast.error('장바구니 삭제에 실패했습니다.')
      })

    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.user) {
          state.user.cart = action.payload.cart
        }
        toast.success('장바구니에 추가되었습니다!')
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Add to cart failed'
        toast.error(action.error.message || '장바구니 추가에 실패했습니다.')
      })
  },
})

export const { clearError } = userSlice.actions
export default userSlice.reducer
