# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Language Preference**: Communicate with the user in Korean.

## Project Structure

This is a boilerplate project with a basic Express server setup:

- `server/` - Express.js + TypeORM backend (port 3000)
- `client/` - React + Vite + Redux frontend (port 5173)
- `docker-compose.yml` - PostgreSQL 16 database

## Quick Start

```bash
# 1. Start database
docker-compose up -d

# 2. Start server (Terminal 1)
cd server && npm install && npm run dev

# 3. Start client (Terminal 2)
cd client && npm install && npm run dev

# Or use concurrently (from root)
npm install
npm run dev
```

Visit: http://localhost:5173

## Commands

### Root (Concurrently)

```bash
# Run both server and client
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

### Server Development

All server commands should be run from the `server/` directory:

```bash
# Install dependencies
cd server && npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture Notes

### Server (Express.js + TypeORM)

- **Entry point**: `server/src/index.ts`
- **Runtime**: TypeScript with `ts-node` (CommonJS module system)
- **Database**: PostgreSQL 16 (via Docker)
- **ORM**: TypeORM with reflect-metadata
- **Validation**: class-validator, class-transformer
- **Port**: 3000

#### File Structure
```
server/src/
├── entities/
│   └── User.ts               # User entity with auth & validation
├── middlewares/
│   ├── user.ts               # Optional auth (sets res.locals.user)
│   └── auth.ts               # Required auth (401 if no user)
├── routes/
│   └── auth.ts               # /api/auth routes
├── data-source.ts            # TypeORM DataSource config
└── index.ts                  # Express app entry point

server/
├── .env                      # JWT_SECRET, CLIENT_URL, DB credentials
└── tsconfig.json             # CommonJS config
```

**API Endpoints**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns user, sets cookie)
- `GET /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user (protected)

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

### Client (React + Vite + TypeScript)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **API Client**: Axios with custom instance
- **Port**: 5173 (dev server)

#### File Structure
```
client/src/
├── api/
│   └── axios.ts              # Axios instance with baseURL config
├── components/
│   ├── common/
│   │   └── Input.tsx         # Reusable input component
│   ├── layout/
│   │   ├── AuthLayout.tsx    # Layout for login/register (no NavBar/Footer)
│   │   ├── MainLayout.tsx    # Layout with NavBar & Footer
│   │   ├── NavBar.tsx        # Navigation with login state
│   │   └── Footer.tsx
│   └── ProtectedRoute.tsx    # Route guard for authenticated users
├── pages/
│   ├── LandingPage.tsx       # Public home page
│   ├── LoginPage.tsx         # Login form
│   └── RegisterPage.tsx      # Registration form
├── store/
│   ├── store.ts              # Redux store configuration
│   └── userSlice.ts          # User authentication slice
├── App.tsx                   # Main app with routes
├── main.tsx                  # Entry point with Redux Provider
└── index.css                 # Tailwind directives

client/
├── .env                      # VITE_API_URL=http://localhost:3000
├── tailwind.config.js        # Tailwind v4 config
└── postcss.config.js         # PostCSS with @tailwindcss/postcss
```

#### Commands

```bash
# Install dependencies
cd client && npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Key Features

**Authentication Flow**
- JWT stored in HttpOnly cookies (set by server)
- Redux manages user state globally
- Auto-fetch user on app load (`fetchCurrentUser`)
- Protected routes redirect to `/login` if not authenticated
- Login/Register pages redirect to `/` if already authenticated

**State Management (Redux Toolkit)**
- `userSlice`: User authentication state
  - `loginUser`: Login async thunk
  - `registerUser`: Register async thunk
  - `logoutUser`: Logout async thunk
  - `fetchCurrentUser`: Get current user from cookie
- TypeScript types: `RootState`, `AppDispatch`

**Routing**
- Public routes: `/` (LandingPage)
- Auth routes: `/login`, `/register` (AuthLayout)
- Protected routes: Use `<ProtectedRoute>` wrapper

**API Configuration**
- Axios instance in `src/api/axios.ts`
- BaseURL from environment variable (`VITE_API_URL`)
- `withCredentials: true` for cookie support

**Styling**
- Tailwind CSS v4 with PostCSS
- Custom Input component for forms
- Responsive layouts with Flexbox
- Dark NavBar, light backgrounds

#### Adding New Pages

1. Create page component in `src/pages/`
2. Add route to `App.tsx`:
   - Public: Use `<MainLayout>`
   - Protected: Use `<ProtectedRoute><MainLayout /></ProtectedRoute>`
   - Auth: Use `<AuthLayout>`

#### Environment Variables

Create `.env` in client directory:
```env
VITE_API_URL=http://localhost:3000
```

Note: Vite requires `VITE_` prefix for env variables.
