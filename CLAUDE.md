# CLAUDE.md

This file provides guidance to Claude Code when working with this e-commerce project.

**Language Preference**: Communicate with the user in Korean.

---

## 📂 Documentation Structure

- **[Backend Documentation](./docs/backend.md)** - Express.js, TypeORM, Auth, File Upload, Cart
- **[Frontend Documentation](./docs/frontend.md)** - React, Redux, TypeScript, Components
- **[API Documentation](./docs/api.md)** - Complete API reference with examples

---

## Project Overview

E-commerce site with full-stack TypeScript:

- **Backend**: Express.js + TypeORM + PostgreSQL (port 3000)
- **Frontend**: React 19 + Vite + Redux (port 5173)
- **Database**: PostgreSQL 16 (Docker)

---

## Quick Start

```bash
# 1. Start database
docker-compose up -d

# 2. Start both servers (from root)
npm install
npm run dev

# Or start separately:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

Visit: **http://localhost:5173**

---

## Key Technologies

### Backend
- **Framework**: Express.js with TypeScript (CommonJS)
- **ORM**: TypeORM with reflect-metadata
- **Database**: PostgreSQL 16
- **Auth**: JWT in HttpOnly cookies
- **Validation**: class-validator
- **File Upload**: Multer (images to `backend/uploads/`)

### Frontend
- **Framework**: React 19 with TypeScript
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4
- **State**: Redux Toolkit + redux-persist
- **Forms**: react-hook-form
- **Routing**: React Router v7
- **API**: Axios with credentials
- **Notifications**: react-toastify

---

## Important Conventions

### Backend
- **Module System**: CommonJS (NOT ESM) - required by TypeORM decorators
- **Runtime**: Use `ts-node` (NOT `tsx`)
- **Entity Properties**: Must use `!` assertion (e.g., `id!: number`)
- **Creating Products**: Use `repository.create()` not `new Product()`
- **Cookies**: HttpOnly, SameSite=strict, secure in production

### Frontend
- **React 19**: NO `import React from 'react'` needed
- **Type Imports**: Use `import type { ... }` for better tree-shaking
- **Null Safety**: Early return pattern for type narrowing
- **State Updates**: Use functional updates `setState(prev => ...)` in callbacks
- **Filters**: Always stringify when sending to API: `JSON.stringify(filters)`

---

## API Endpoints

### User Routes (`/api/users`)
- `POST /register` - Register new user
- `POST /login` - Login (sets HttpOnly cookie)
- `POST /logout` - Logout (clears cookie)
- `GET /me` - Get current user (protected)
- `POST /cart` - Add to cart (protected)

### Product Routes (`/api/products`)
- `GET /` - List products (pagination, filters, search)
- `POST /` - Create product (protected)
- `POST /image` - Upload image (protected)
- `GET /:id` - Get product(s) by ID

---

## File Structure

### Backend (`backend/src/`)
```
entities/
  User.ts        # id, email, password, name, cart: CartItem[]
  Product.ts     # title, description, price, images[]
  Payment.ts     # user, products, data
middlewares/
  user.ts        # Optional auth (sets res.locals.user)
  auth.ts        # Required auth (401 if no user)
routes/
  user.ts        # /api/users routes
  product.ts     # /api/products routes
data-source.ts   # TypeORM config
index.ts         # Express app
```

### Frontend (`frontend/src/`)
```
components/
  common/        # Input, FileUpload, ProductImage, ProductInfo, etc.
  layout/        # MainLayout, AuthLayout, NavBar, Footer
  ProtectedRoute.tsx
pages/
  LandingPage.tsx         # Product list with filters
  DetailProductPage.tsx   # Product detail
  LoginPage.tsx
  RegisterPage.tsx
  UploadProductPage.tsx
  CartPage.tsx
store/
  userSlice.ts   # Auth + cart state
types/
  product.ts     # Shared types
```

---

## Data Models

### User Entity
```typescript
interface CartItem {
  productId: number
  quantity: number
}

@Entity()
export class User {
  id!: number
  email!: string
  password!: string  // bcrypt hashed
  name!: string
  role!: number
  image?: string
  cart!: CartItem[]  // stored as JSON
}
```

### Product Entity
```typescript
@Entity()
export class Product {
  id!: number
  title!: string
  description!: string
  price!: number
  images!: string[]
  sold!: number
  continents!: number
  views!: number
  writer!: number
}
```

---

## Cart System

### Add to Cart Flow
1. Frontend: `dispatch(addToCart({ productId: 1 }))`
2. Redux: `POST /api/users/cart { productId: 1 }`
3. Backend: Check if product exists in user.cart
   - If exists: `quantity += 1`
   - If not: `cart.push({ productId, quantity: 1 })`
4. Save to database (JSON format)
5. Toast notification

### Data Structure
```typescript
// User.cart in DB: [{"productId":1,"quantity":2}]
// TypeScript: CartItem[] = [{ productId: 1, quantity: 2 }]
```

---

## Environment Variables

### Backend (`.env`)
```env
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=ecommerce_password
POSTGRES_DB=ecommerce
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

## Common Patterns

### Protected Routes
```typescript
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  <Route path="/product/upload" element={<UploadProductPage />} />
</Route>
```

### Redux Async Thunk
```typescript
export const addToCart = createAsyncThunk(
  'user/addToCart',
  async (body: { productId: number }) => {
    const response = await api.post('/api/users/cart', body)
    return response.data
  }
)
```

### Type-safe Dispatch
```typescript
const dispatch = useDispatch<AppDispatch>()
dispatch(addToCart({ productId: 1 }))
```

### Controlled Filter Components
```typescript
const handleFilters = (newData: number[], category: keyof Filters) => {
  setFilters({ ...filters, [category]: newData })
}
```

---

## Best Practices

### TypeScript
- ✅ Use `import type` for types
- ✅ Define interface for all component props
- ✅ Use type narrowing (early returns)
- ❌ Don't use `any` or non-null assertions (`!`)

### React
- ✅ Functional setState in callbacks: `setState(prev => ...)`
- ✅ useEffect dependencies: include all used variables
- ❌ Don't import React in React 19

### Redux
- ✅ Type dispatch with `AppDispatch`
- ✅ Use createAsyncThunk for API calls
- ✅ Add toast notifications in extraReducers

### API
- ✅ Always stringify filters: `JSON.stringify(filters)`
- ✅ Use `withCredentials: true` for cookies
- ❌ Don't manually handle JWT tokens

---

## Development Commands

```bash
# Database
docker-compose up -d          # Start PostgreSQL
docker-compose down           # Stop
docker-compose logs postgres  # View logs

# Backend
cd backend
npm install
npm run dev    # Start with nodemon
npm run build  # Compile TypeScript

# Frontend
cd frontend
npm install
npm run dev    # Start Vite dev server
npm run build  # Build for production
```

---

## Troubleshooting

### TypeScript Errors
- Backend: Check `"module": "commonjs"` in tsconfig.json
- Frontend: Check `import type` syntax
- Both: Run `npm install` to update type definitions

### API 404 Errors
- Check route paths match: `/api/users/cart` vs `/api/products/cart`
- Verify middleware order: `userMiddleware, authMiddleware`

### Auth Issues
- Backend: Check JWT_SECRET in .env
- Frontend: Verify `withCredentials: true` in axios
- Both: Clear cookies and re-login

### Filter Not Working
- Frontend: Stringify filters before sending
- Backend: Parse JSON string in query handler

---

For detailed information, see documentation in `docs/` folder:
- [Backend Details](./docs/backend.md)
- [Frontend Details](./docs/frontend.md)
- [API Reference](./docs/api.md)
