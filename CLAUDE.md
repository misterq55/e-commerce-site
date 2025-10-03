# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Language Preference**: Communicate with the user in Korean.

## Project Structure

This is a boilerplate project with a basic Express server setup:

- `server/` - Express.js backend server
- `client/` - Currently empty, intended for future frontend code

## Commands

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
- `src/index.ts` - Express app entry point, initializes database connection
- `src/data-source.ts` - TypeORM DataSource configuration
- `src/entities/` - TypeORM entity definitions
  - `User.ts` - User entity with authentication fields
- `.env` - Database credentials (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)

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

### Client

The client directory is currently empty and ready for frontend implementation.
