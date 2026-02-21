# Backend Documentation

## Architecture

- **Framework**: Express.js
- **ORM**: TypeORM with reflect-metadata
- **Database**: PostgreSQL 16 (Docker)
- **Runtime**: TypeScript with `ts-node` (CommonJS)
- **Validation**: class-validator, class-transformer
- **Port**: 3000

## File Structure

```
backend/src/
├── entities/
│   ├── User.ts               # User entity (id, email, password, name, role, image, cart)
│   ├── Product.ts            # Product entity (title, description, price, images, etc.)
│   └── Payment.ts            # Payment entity (user, products, data)
├── middlewares/
│   ├── user.ts               # Optional auth (sets res.locals.user)
│   └── auth.ts               # Required auth (401 if no user)
├── routes/
│   ├── user.ts               # /api/users routes (register, login, logout, cart)
│   └── product.ts            # /api/products routes (list, create, upload)
├── data-source.ts            # TypeORM DataSource config
└── index.ts                  # Express app entry point
```

## Important Configuration

### TypeScript Config
- **Module System**: CommonJS (NOT ESM)
- **tsconfig.json**:
  - `"module": "commonjs"`
  - `"experimentalDecorators": true`
  - `"emitDecoratorMetadata": true`
- **Runtime**: Use `ts-node` (NOT `tsx`)

### Database Configuration
- `synchronize: true` for development (auto-creates tables)
- In production: set `synchronize: false` and use migrations
- Connection credentials in `.env` file

### Environment Variables (.env)
```env
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=ecommerce_password
POSTGRES_DB=ecommerce
POSTGRES_PORT=5432
```

## Authentication & Security

### JWT Storage
- **Method**: HttpOnly cookies (OWASP recommended)
- **Token Expiration**: 1 hour for login, 7 days for register
- **Cookie Flags**:
  - `httpOnly: true` - Prevents XSS attacks
  - `secure: true` - HTTPS only (production)
  - `sameSite: 'strict'` - CSRF protection

### Password Hashing
- **Library**: bcrypt
- **Method**: Automatic salting in `@BeforeInsert()` hook

### CORS Configuration
```typescript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true  // Allow cookies
}))
```

## Entities

### User Entity

```typescript
import { CartItem } from '../entities/User'

export interface CartItem {
  productId: number
  quantity: number
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  @IsEmail()
  email!: string

  @Column()
  @Length(6, 255)
  password!: string

  @Column()
  @Length(2, 32)
  name!: string

  @Column({ default: 0 })
  role!: number

  @Column({ nullable: true })
  image?: string

  @Column('simple-json', { default: '[]' })
  cart!: CartItem[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }
}
```

### Product Entity

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column()
  description!: string

  @Column()
  price!: number

  @Column('simple-array')
  images!: string[]

  @Column({ default: 0 })
  sold!: number

  @Column()
  continents!: number

  @Column({ default: 0 })
  views!: number

  @Column()
  writer!: number

  @Column('simple-array', { default: '' })
  cart!: number[]

  @Column('simple-array', { default: '' })
  history!: number[]
}
```

### Creating Entities

**Important**: Use definite assignment assertion (`!`) for all properties:

```typescript
// ✅ Correct
@Column()
name!: string

// ❌ Wrong
@Column()
name: string
```

**Creating Products**:
```typescript
// Use repository.create() instead of new Product()
const productRepository = AppDataSource.getRepository(Product)
const product = productRepository.create(req.body)
await productRepository.save(product)
```

## File Upload (Multer)

### Configuration
- **Upload Directory**: `backend/uploads/` (auto-created, gitignored)
- **File Types**: Images only (jpeg, jpg, png, gif, webp)
- **File Size Limit**: 5MB
- **File Naming**: `${timestamp}_${originalname}`
- **Static Files**: Served via `express.static` at `/`

### Upload Flow
1. Frontend: `POST /api/products/image` with `multipart/form-data`
2. Backend: Saves to `uploads/`, returns `{ fileName: "..." }`
3. Frontend: Stores filename in array
4. Product creation: Includes filenames array
5. Display: `${VITE_API_URL}/${filename}`

### Multer Setup
```typescript
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'))
    }
  }
}).single('file')
```

## Product Query Features

### Pagination
- Parameters: `skip` (offset), `limit` (page size)
- Response: `{ products: Product[], hasMore: boolean }`

### Search
- Parameter: `searchTerm`
- Searches in: title and description (LIKE query)

### Filters
- **Continents**: Array of continent IDs
- **Price Range**: Single array `[min, max]`
- **Important**: Frontend must send as JSON string:
  ```typescript
  filters: JSON.stringify({ continents: [1, 2], prices: [200, 249] })
  ```

### Sorting
- Default: Latest first (`ORDER BY id DESC`)

### Example Query
```typescript
// Backend
const { skip = 0, limit = 8, filters = {}, searchTerm = '' } = req.query

let query = productRepository.createQueryBuilder('product')

if (searchTerm) {
  query = query.where(
    'product.title LIKE :searchTerm OR product.description LIKE :searchTerm',
    { searchTerm: `%${searchTerm}%` }
  )
}

if (filters) {
  const parsedFilters = JSON.parse(filters)

  if (parsedFilters.continents?.length > 0) {
    query = query.andWhere('product.continents IN (:...continents)', {
      continents: parsedFilters.continents
    })
  }

  if (parsedFilters.prices?.length > 0) {
    const [minPrice, maxPrice] = parsedFilters.prices
    query = query.andWhere('product.price >= :minPrice AND product.price <= :maxPrice', {
      minPrice, maxPrice
    })
  }
}

const products = await query
  .orderBy('product.id', 'DESC')
  .skip(Number(skip))
  .take(Number(limit))
  .getMany()
```

## Cart System

### Data Structure
```typescript
interface CartItem {
  productId: number
  quantity: number
}

// User.cart: CartItem[]
// Example: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }]
```

### Add to Cart Logic
```typescript
const addToCart = async (req, res, next) => {
  const { productId } = req.body
  const user = res.locals.user

  const userInfo = await userRepository.findOne({ where: { id: user.id } })

  if (!userInfo.cart) {
    userInfo.cart = []
  }

  const existingItem = userInfo.cart.find(item => item.productId === productId)

  if (existingItem) {
    // Increase quantity
    existingItem.quantity += 1
  } else {
    // Add new item
    userInfo.cart.push({ productId, quantity: 1 })
  }

  await userRepository.save(userInfo)
  return res.json({ cart: userInfo.cart })
}
```

### Storage
- **Type**: `simple-json` column
- **DB Format**: JSON string
- **TypeScript**: CartItem[] array
- **Example DB value**: `[{"productId":1,"quantity":2}]`

## Database Management

### Using psql
```bash
docker exec -it ecommerce-postgres psql -U ecommerce_user -d ecommerce

# View tables
\dt

# View users
SELECT id, email, name, cart FROM users;

# View products
SELECT id, title, price FROM product;
```

### Using pgAdmin
1. Connection:
   - Host: localhost
   - Port: 5432
   - Database: ecommerce
   - User: ecommerce_user
   - Password: ecommerce_password
2. Navigate: Servers → ecommerce → Schemas → public → Tables
3. Right-click table → View/Edit Data → All Rows
