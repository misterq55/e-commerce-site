# Frontend Documentation

## Architecture

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit + redux-persist
- **Form Management**: react-hook-form
- **Routing**: React Router v7
- **API Client**: Axios
- **Notifications**: react-toastify v11
- **Port**: 5173

## File Structure

```
frontend/src/
├── api/
│   └── axios.ts              # Axios instance (baseURL, withCredentials)
├── components/
│   ├── common/
│   │   ├── Input.tsx         # Reusable input (forwardRef for react-hook-form)
│   │   ├── NavItem.tsx       # Navigation item with dropdown & badge
│   │   ├── FileUpload.tsx    # Image upload (react-dropzone)
│   │   ├── ProductImage.tsx  # Image gallery (react-image-gallery)
│   │   ├── ProductInfo.tsx   # Product details (price, cart button)
│   │   ├── ImageSlider.tsx   # Carousel (react-responsive-carousel)
│   │   ├── CardItem.tsx      # Product card for grid
│   │   ├── CheckBox.tsx      # Continent filter (multiple selection)
│   │   ├── RadioBox.tsx      # Price filter (single selection)
│   │   └── SearchInput.tsx   # Search input
│   ├── layout/
│   │   ├── AuthLayout.tsx    # Layout for login/register
│   │   ├── MainLayout.tsx    # Layout with NavBar & Footer
│   │   ├── NavBar.tsx        # Navigation (dropdown, cart badge)
│   │   └── Footer.tsx
│   └── ProtectedRoute.tsx    # Route guard for auth
├── pages/
│   ├── LandingPage.tsx       # Home page (product list, filters)
│   ├── DetailProductPage.tsx # Product detail (ProductImage, ProductInfo)
│   ├── LoginPage.tsx         # Login form
│   ├── RegisterPage.tsx      # Registration form
│   ├── UploadProductPage.tsx # Product upload (protected)
│   ├── CartPage.tsx          # Shopping cart
│   └── HistoryPage.tsx       # Purchase history
├── store/
│   ├── store.ts              # Redux store + redux-persist
│   └── userSlice.ts          # User auth slice (login, register, addToCart, getCartItems)
├── types/
│   └── product.ts            # Product, Filters, CartItem interfaces
├── utils/
│   ├── validationRules.ts    # Form validation rules
│   └── filterData.ts         # Filter options (continents, prices)
├── App.tsx                   # Routes
├── main.tsx                  # Entry (Redux Provider + PersistGate)
└── index.css                 # Tailwind directives
```

## Environment Variables

Create `.env` in frontend directory:
```env
VITE_API_URL=http://localhost:3000
```

**Note**: Vite requires `VITE_` prefix.

## Authentication Flow

### JWT Storage
- Stored in **HttpOnly cookies** (set by backend)
- Expiration: 1 hour (login), 7 days (register)
- No manual token management in frontend

### Redux State
```typescript
interface UserState {
  user: User | null
  cartDetail: CartDetail[]  // 장바구니 상품 상세 목록 (수량 포함)
  isLoading: boolean
  error: string | null
}
```

### Auto-fetch on App Load
```typescript
// App.tsx
useEffect(() => {
  dispatch(fetchCurrentUser())  // GET /api/users/me
}, [])
```

### Protected Routes
```typescript
// Redirect to /login if not authenticated
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  <Route path="/product/upload" element={<UploadProductPage />} />
  <Route path="/user/cart" element={<CartPage />} />
</Route>
```

### Axios Configuration
```typescript
// api/axios.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true  // Send cookies automatically
})
```

## State Management (Redux Toolkit)

### User Slice

```typescript
// userSlice.ts
export const loginUser = createAsyncThunk('user/login', async (credentials) => {
  const response = await api.post('/api/users/login', credentials)
  return response.data.user
})

export const addToCart = createAsyncThunk('user/addToCart', async (body) => {
  const response = await api.post('/api/users/cart', body)
  return response.data
})

export const getCartItems = createAsyncThunk('user/getCartItems', async (body) => {
  const { cartItemIds, userCart } = body
  const response = await api.post(`/api/products/${cartItemIds}?type=array`, body)
  // userCart의 quantity를 response.data에 병합
  userCart.forEach(cartItem => {
    response.data.forEach((productDetail, index) => {
      if (cartItem.productId === productDetail.id) {
        response.data[index].quantity = cartItem.quantity
      }
    })
  })
  return response.data  // CartDetail[]
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
        toast.success('로그인에 성공했습니다!')
      })
      .addCase(addToCart.fulfilled, (state) => {
        toast.success('장바구니에 추가되었습니다!')
      })
      .addCase(getCartItems.fulfilled, (state, action) => {
        state.cartDetail = action.payload
      })
  }
})
```

### Persistence
```typescript
// store.ts
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user']  // Persist user state to localStorage
}
```

## TypeScript Best Practices

### Type-only Imports
```typescript
// ✅ Correct
import type { Product } from '../types/product'
import { useState } from 'react'

// ❌ Wrong (React 19)
import React from 'react'
```

### Centralized Types
```typescript
// types/product.ts
export interface Product {
  id: number
  title: string
  description: string
  price: number
  images: string[]
  continents: number
  sold: number
  views: number
  writer: number
  cart: number[]
  history: number[]
}

export interface CartItem {
  productId: number
  quantity: number
}

export interface CartDetail {
  id: number
  title: string
  description: string
  price: number
  images: string[]
  sold: number
  continents: number
  views: number
  writer: number
  quantity: number  // userCart에서 병합된 수량
}

export interface Filters {
  continents: number[]
  prices: number[]
}
```

### Component Props
```typescript
interface ProductInfoProps {
  product: Product
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const dispatch = useDispatch<AppDispatch>()  // ← Type the dispatch!

  const handleClick = () => {
    dispatch(addToCart({ productId: product.id }))
  }

  return <button onClick={handleClick}>장바구니 담기</button>
}
```

### Null Safety (Type Narrowing)
```typescript
const DetailProductPage = () => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // Early return pattern
  if (loading) return <div>로딩 중...</div>
  if (!product) return <div>상품을 찾을 수 없습니다</div>

  // From here, product is NEVER null (Type Narrowing)
  return <h1>{product.title}</h1>  // ✅ Safe
}
```

## Form Management (react-hook-form)

### Login Form
```typescript
import { useForm } from 'react-hook-form'

interface LoginForm {
  email: string
  password: string
}

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()
  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = (data: LoginForm) => {
    dispatch(loginUser(data))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: '이메일을 입력해주세요',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '올바른 이메일 형식이 아닙니다'
          }
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">로그인</button>
    </form>
  )
}
```

### Validation Rules
```typescript
// utils/validationRules.ts
export const emailRules = {
  required: '이메일을 입력해주세요',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: '올바른 이메일 형식이 아닙니다'
  }
}

export const passwordRules = {
  required: '비밀번호를 입력해주세요',
  minLength: {
    value: 6,
    message: '비밀번호는 6자 이상이어야 합니다'
  }
}
```

## Product Filtering & Search

### Filter State
```typescript
const [filters, setFilters] = useState<Filters>({
  continents: [],
  prices: []
})
```

### Handle Filter Changes
```typescript
const handleFilters = (newFilteredData: number[], category: keyof Filters) => {
  const newFilters = { ...filters, [category]: newFilteredData }
  setFilters(newFilters)
  showFilteredResults(newFilters)
}
```

### Fetch with Filters
```typescript
const showFilteredResults = (filters: Filters) => {
  const body = {
    skip: 0,
    limit,
    filters: JSON.stringify(filters),  // ← Must stringify!
    searchTerm
  }

  setSkip(0)
  fetchProducts(body)
}
```

### Search Input
```typescript
const handleSearchTerm = (event: any) => {
  const body = {
    skip: 0,
    limit,
    filters,
    searchTerm: event.target.value
  }

  setSkip(0)
  setSearchTerm(event.target.value)
  fetchProducts(body)  // Immediate fetch on keystroke
}
```

### Load More (Pagination)
```typescript
const handleLoadMore = () => {
  const body = {
    skip: skip + limit,  // Next page
    limit,
    filters,
    searchTerm,
    loadMore: true
  }

  setSkip(skip + limit)
  fetchProducts(body)
}

const fetchProducts = async (body: FetchProductsParams) => {
  const { data } = await api.get('/api/products', { params: body })

  if (body.loadMore) {
    // Append to existing list
    setProducts(prev => [...prev, ...data.products])
  } else {
    // Replace list
    setProducts(data.products)
  }

  setHasMore(data.hasMore)
}
```

## Component Patterns

### Controlled Components
```typescript
// ✅ CheckBox - Multiple selection
interface CheckBoxProps {
  continents: { _id: number, name: string }[]
  checkedContinents: number[]
  onFilters: (checked: number[]) => void
}

const CheckBox = ({ continents, checkedContinents, onFilters }: CheckBoxProps) => {
  const handleToggle = (id: number) => {
    const newChecked = checkedContinents.includes(id)
      ? checkedContinents.filter(item => item !== id)
      : [...checkedContinents, id]

    onFilters(newChecked)  // Must call this!
  }

  return continents.map(continent => (
    <input
      type="checkbox"
      checked={checkedContinents.includes(continent._id)}
      onChange={() => handleToggle(continent._id)}
    />
  ))
}
```

### State Updates with Dependencies
```typescript
// ❌ Wrong - uses stale state
setProducts([...products, ...newProducts])

// ✅ Correct - functional update
setProducts(prev => [...prev, ...newProducts])
```

## Image Components

### ProductImage (Gallery)
```typescript
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'

interface ImageItem {
  original: string
  thumbnail: string
}

const ProductImage = ({ product }: { product: Product }) => {
  const [images, setImages] = useState<ImageItem[]>([])

  useEffect(() => {
    const formattedImages = product.images.map(imageName => ({
      original: `${import.meta.env.VITE_API_URL}/${imageName}`,
      thumbnail: `${import.meta.env.VITE_API_URL}/${imageName}`
    }))
    setImages(formattedImages)
  }, [product])

  return <ImageGallery items={images} />
}
```

### FileUpload (Dropzone)
```typescript
import { useDropzone } from 'react-dropzone'

const FileUpload = ({ onImageChange }: { onImageChange: (images: any[]) => void }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      onImageChange(acceptedFiles)
    }
  })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>이미지를 드래그하거나 클릭하세요</p>
    </div>
  )
}
```

## Toast Notifications

### Setup
```typescript
// App.tsx
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
/>
```

### Usage
```typescript
import { toast } from 'react-toastify'

// Success
toast.success('장바구니에 추가되었습니다!')

// Error
toast.error('로그인에 실패했습니다.')

// Info
toast.info('상품이 품절되었습니다.')
```

## Styling (Tailwind CSS v4)

### Installation
```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

### Configuration
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}']
}

// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

### Usage
```typescript
<div className="flex gap-4 p-4">
  <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700">
    장바구니 담기
  </button>
</div>
```

## Common Issues

### Issue: Module not found
```bash
# Missing types
npm install --save-dev @types/react-image-gallery

# Missing package
npm install react-dropzone
```

### Issue: Stale state in callbacks
```typescript
// ❌ Wrong
const handleClick = () => {
  setCount(count + 1)  // Uses stale count
}

// ✅ Correct
const handleClick = () => {
  setCount(prev => prev + 1)  // Always fresh
}
```

### Issue: Filters not working
```typescript
// ❌ Wrong - sends object
const params = { filters: { continents: [1] } }

// ✅ Correct - stringify!
const params = { filters: JSON.stringify({ continents: [1] }) }
```
