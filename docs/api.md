# API Documentation

Base URL: `http://localhost:3000`

## Authentication

All requests requiring authentication must include HTTP-only cookie (automatically sent by browser with `withCredentials: true`).

---

## User Routes

### POST /api/users/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": 0,
    "createdAt": "2026-02-22T...",
    "updatedAt": "2026-02-22T..."
  }
}
```

**Errors:**
- `400 Bad Request` - Validation errors or duplicate email/name

---

### POST /api/users/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": 0,
    "cart": []
  }
}
```

**Sets Cookie:**
```
token=eyJhbGc...; HttpOnly; SameSite=Strict; Max-Age=3600
```

**Errors:**
- `400 Bad Request` - Missing email or password
- `404 Not Found` - Email not found
- `401 Unauthorized` - Wrong password

---

### POST /api/users/logout

Logout (clear cookie).

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### GET /api/users/me

Get current authenticated user.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": 0,
  "cart": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

**Errors:**
- `401 Unauthorized` - Not logged in

---

### POST /api/users/cart

Add product to cart (or increase quantity if already exists).

**Authentication:** Required

**Request:**
```json
{
  "productId": 1
}
```

**Response:** `200 OK`

**First time adding:**
```json
{
  "message": "장바구니에 추가되었습니다.",
  "cart": [
    { "productId": 1, "quantity": 1 }
  ]
}
```

**Adding duplicate:**
```json
{
  "message": "장바구니 수량이 2개로 증가했습니다.",
  "cart": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

**Errors:**
- `401 Unauthorized` - Not logged in
- `404 Not Found` - User not found

---

## Product Routes

### GET /api/products

Get products with pagination, filtering, and search.

**Query Parameters:**
- `skip` (number, default: 0) - Offset for pagination
- `limit` (number, default: 8) - Number of products per page
- `filters` (JSON string) - Filter criteria
- `searchTerm` (string) - Search in title/description

**Example Request:**
```
GET /api/products?skip=0&limit=4&filters={"continents":[1,2],"prices":[200,249]}&searchTerm=phone
```

**Frontend Usage:**
```typescript
const params = {
  skip: 0,
  limit: 4,
  filters: JSON.stringify({ continents: [1, 2], prices: [200, 249] }),
  searchTerm: 'phone'
}
const response = await api.get('/api/products', { params })
```

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": 1,
      "title": "Product 1",
      "description": "Description",
      "price": 29999,
      "images": ["1234567890_image1.jpg"],
      "sold": 0,
      "continents": 1,
      "views": 0,
      "writer": 1,
      "cart": [],
      "history": []
    }
  ],
  "hasMore": true
}
```

**Filters Object:**
```typescript
interface Filters {
  continents?: number[]  // [1, 2, 3] - Filter by continent IDs
  prices?: [number, number]  // [200, 249] - Min and max price
}
```

---

### POST /api/products

Create a new product.

**Authentication:** Required

**Request:**
```json
{
  "title": "Product Name",
  "description": "Product description",
  "price": 29999,
  "images": ["1234567890_image1.jpg", "1234567890_image2.jpg"],
  "continents": 1,
  "writer": 1
}
```

**Response:** `201 Created`
```json
{
  "product": {
    "id": 1,
    "title": "Product Name",
    "description": "Product description",
    "price": 29999,
    "images": ["1234567890_image1.jpg", "1234567890_image2.jpg"],
    "sold": 0,
    "continents": 1,
    "views": 0,
    "writer": 1,
    "cart": [],
    "history": []
  }
}
```

**Errors:**
- `401 Unauthorized` - Not logged in

---

### POST /api/products/image

Upload product image.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request:**
```
POST /api/products/image
Content-Type: multipart/form-data

file: [binary image data]
```

**Frontend Usage:**
```typescript
const formData = new FormData()
formData.append('file', imageFile)

const response = await api.post('/api/products/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

**Response:** `200 OK`
```json
{
  "fileName": "1234567890_myimage.jpg"
}
```

**Image Access:**
```
http://localhost:3000/1234567890_myimage.jpg
```

**Validation:**
- File types: jpeg, jpg, png, gif, webp
- Max size: 5MB

**Errors:**
- `400 Bad Request` - No file uploaded
- `401 Unauthorized` - Not logged in
- `500 Internal Server Error` - Invalid file type or size exceeded

---

### GET /api/products/:id

Get product(s) by ID.

**Query Parameters:**
- `type` (string) - "single" for one product, omit for multiple

**Get Single Product:**
```
GET /api/products/1?type=single
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Product Name",
    "description": "Description",
    "price": 29999,
    "images": ["image1.jpg"],
    "sold": 0,
    "continents": 1,
    "views": 0,
    "writer": 1,
    "cart": [],
    "history": []
  }
]
```

**Get Multiple Products:**
```
GET /api/products/1,2,3
```

**Response:** `200 OK`
```json
[
  { "id": 1, "title": "Product 1", ... },
  { "id": 2, "title": "Product 2", ... },
  { "id": 3, "title": "Product 3", ... }
]
```

**Errors:**
- `400 Bad Request` - Missing product ID
- `404 Not Found` - Product not found (single mode only)

---

## Error Responses

All error responses follow this format:

**400 Bad Request:**
```json
{
  "message": "Error message",
  "errors": {
    "field": "Validation error message"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthenticated"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Data Types

### User
```typescript
interface User {
  id: number
  email: string
  name: string
  role: number
  image?: string
  cart: CartItem[]
  createdAt: Date
  updatedAt: Date
}
```

### Product
```typescript
interface Product {
  id: number
  title: string
  description: string
  price: number
  images: string[]
  sold: number
  continents: number
  views: number
  writer: number
  cart: number[]
  history: number[]
}
```

### CartItem
```typescript
interface CartItem {
  productId: number
  quantity: number
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding in production:
- Login attempts: 5 per 15 minutes
- API requests: 100 per minute
- File uploads: 10 per hour

---

## CORS

Allowed origins are configured via `CLIENT_URL` environment variable.

Default: `http://localhost:5173`

Credentials are enabled to support HTTP-only cookies.
