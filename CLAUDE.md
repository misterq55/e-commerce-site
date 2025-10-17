# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Language Preference**: Communicate with the user in Korean.

## Project Structure

This is a e commerce site project with a basic Express server setup:

- `backend/` - Express.js + TypeORM backend (port 3000)
- `frontend/` - React + Vite + Redux frontend (port 5173)
- `docker-compose.yml` - PostgreSQL 16 database

## Quick Start

```bash
# 1. Start database
docker-compose up -d

# 2. Start backend (Terminal 1)
cd backend && npm install && npm run dev

# 3. Start frontend (Terminal 2)
cd frontend && npm install && npm run dev

# Or use concurrently (from root)
npm install
npm run dev
```

Visit: http://localhost:5173

## Commands

### Root (Concurrently)

```bash
# Run both backend and frontend
npm run dev
```

### Database (Docker)

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop PostgreSQL container
docker-compose down

# View logs
docker-compose logs -f postgres
```

### Backend Development

All backend commands should be run from the `backend/` directory:

```bash
# Install dependencies
cd backend && npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture Notes

### Backend (Express.js + TypeORM)

- **Entry point**: `backend/src/index.ts`
- **Runtime**: TypeScript with `ts-node` (CommonJS module system)
- **Database**: PostgreSQL 16 (via Docker)
- **ORM**: TypeORM with reflect-metadata
- **Validation**: class-validator, class-transformer
- **Port**: 3000

#### File Structure
```
backend/src/
├── entities/
│   └── User.ts               # User entity with auth & validation
├── middlewares/
│   ├── user.ts               # Optional auth (sets res.locals.user)
│   └── auth.ts               # Required auth (401 if no user)
├── routes/
│   └── user.ts               # /api/users routes
├── data-source.ts            # TypeORM DataSource config
└── index.ts                  # Express app entry point

backend/
├── .env                      # JWT_SECRET, CLIENT_URL, DB credentials
└── tsconfig.json             # CommonJS config
```

**API Endpoints**
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login (returns user, sets cookie)
- `POST /api/users/logout` - Logout (clears cookie)
- `GET /api/users/me` - Get current user (protected)

#### Important Configuration Notes
- **Module System**: CommonJS (NOT ESM) - TypeORM's `emitDecoratorMetadata` requires CommonJS
- **Runtime**: Use `ts-node` (NOT `tsx`) for proper decorator metadata support
- **tsconfig.json** must have:
  - `"module": "commonjs"`
  - `"experimentalDecorators": true`
  - `"emitDecoratorMetadata": true`
  - `"esModuleInterop": true`
- **package.json**: Do NOT include `"type": "module"`

#### Database Configuration
- TypeORM is configured with `synchronize: true` for development (auto-creates tables from entities)
- In production, set `synchronize: false` and use migrations instead
- Connection credentials are in `.env` file

#### Authentication & Security
- **JWT Storage**: HttpOnly cookies (OWASP recommended approach)
- **Token Expiration**: 1 hour (`maxAge: 60 * 60 * 1000`)
- **Cookie Security Flags**:
  - `httpOnly: true` - Prevents XSS attacks (JavaScript cannot access)
  - `secure: true` - HTTPS only (in production)
  - `sameSite: 'strict'` - CSRF protection
- **Password Hashing**: bcrypt with automatic salting
- **CORS**: Configured with `credentials: true` for cookie support
- **Why HttpOnly Cookies vs localStorage**:
  - ✅ XSS attack protection (token not accessible via JavaScript)
  - ✅ Automatic cookie transmission with `withCredentials: true`
  - ✅ Browser handles token management
  - ⚠️ Requires CSRF protection (handled by SameSite flag)

#### Creating Entities
All entity properties must use the definite assignment assertion (`!`) to satisfy TypeScript strict mode:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ unique: true })
  email!: string
}
```

Import entities in `data-source.ts` by adding them to the entities array.

### Frontend (React + Vite + TypeScript)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit + redux-persist
- **Form Management**: react-hook-form
- **Routing**: React Router v7
- **API Client**: Axios with custom instance
- **Notifications**: react-toastify v11
- **Port**: 5173 (dev server)

#### File Structure
```
frontend/src/
├── api/
│   └── axios.ts              # Axios instance with baseURL config
├── components/
│   ├── common/
│   │   └── Input.tsx         # Reusable input component (forwardRef)
│   ├── layout/
│   │   ├── AuthLayout.tsx    # Layout for login/register (no NavBar/Footer)
│   │   ├── MainLayout.tsx    # Layout with NavBar & Footer
│   │   ├── NavBar.tsx        # Navigation with login state
│   │   └── Footer.tsx
│   └── ProtectedRoute.tsx    # Route guard for authenticated users
├── pages/
│   ├── LandingPage.tsx       # Public home page
│   ├── LoginPage.tsx         # Login form (react-hook-form)
│   └── RegisterPage.tsx      # Registration form (react-hook-form)
├── store/
│   ├── store.ts              # Redux store + redux-persist config
│   └── userSlice.ts          # User authentication slice
├── utils/
│   └── validationRules.ts    # Form validation rules
├── App.tsx                   # Main app with routes
├── main.tsx                  # Entry point with Redux Provider + PersistGate
└── index.css                 # Tailwind directives

frontend/
├── .env                      # VITE_API_URL=http://localhost:3000
├── tailwind.config.js        # Tailwind v4 config
└── postcss.config.js         # PostCSS with @tailwindcss/postcss
```

#### Commands

```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Key Features

**Authentication Flow**
- JWT stored in HttpOnly cookies (set by server, 1-hour expiration)
- Redux manages user state globally
- redux-persist keeps state across page refreshes (localStorage)
- Auto-fetch user on app load (`fetchCurrentUser`)
- Protected routes redirect to `/login` if not authenticated
- Login/Register pages redirect to `/` if already authenticated
- Toast notifications for auth events (success/error messages)

**State Management (Redux Toolkit + redux-persist)**
- `userSlice`: User authentication state
  - `loginUser`: Login async thunk
  - `registerUser`: Register async thunk
  - `logoutUser`: Logout async thunk
  - `fetchCurrentUser`: Get current user from cookie
- TypeScript types: `RootState`, `AppDispatch`
- Persisted to localStorage for seamless page refreshes

**Form Management (react-hook-form)**
- Used in LoginPage and RegisterPage
- Automatic form validation with custom rules
- Validation rules centralized in `utils/validationRules.ts`
- Input component uses `forwardRef` for react-hook-form compatibility
- Benefits: Less re-renders, cleaner code, built-in validation

**Routing**
- Public routes: `/` (LandingPage)
- Auth routes: `/login`, `/register` (AuthLayout)
- Protected routes: Use `<ProtectedRoute>` wrapper

**API Configuration**
- Axios instance in `src/api/axios.ts`
- BaseURL from environment variable (`VITE_API_URL`)
- `withCredentials: true` for automatic cookie transmission
- No manual token management needed (HttpOnly cookies handle it)

**User Notifications (react-toastify)**
- Toast notifications for authentication events
- Configured in `App.tsx` with `<ToastContainer>`
- Used in `userSlice.ts` for success/error messages
- Position: top-right, 3-second auto-close

**Styling**
- Tailwind CSS v4 with PostCSS
- Custom Input component for forms
- Responsive layouts with Flexbox
- Dark NavBar, light backgrounds

**TypeScript Type Management**
- Current approach: Types defined inline in component files
  - `userSlice.ts`: `User`, `UserState` interfaces
  - `LoginPage.tsx`: `LoginForm` interface
  - `RegisterPage.tsx`: `RegisterForm` interface
- This is appropriate for the current project size
- Consider refactoring to domain-based structure when:
  - Types are reused across multiple files
  - New domains are added (products, orders, etc.)
  - Files become too large or complex
- Recommended future structure:
  ```
  frontend/src/
  ├── features/
  │   └── auth/
  │       └── types.ts      # User, LoginFormData, RegisterFormData
  └── types/
      └── common.ts         # ApiResponse, LoadingState (global types)
  ```

#### Adding New Pages

1. Create page component in `src/pages/`
2. Add route to `App.tsx`:
   - Public: Use `<MainLayout>`
   - Protected: Use `<ProtectedRoute><MainLayout /></ProtectedRoute>`
   - Auth: Use `<AuthLayout>`

#### Environment Variables

Create `.env` in frontend directory:
```env
VITE_API_URL=http://localhost:3000
```

Note: Vite requires `VITE_` prefix for env variables.
