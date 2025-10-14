import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { User } from './entities/User'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_DATABASE || 'ecommerce',
  synchronize: true, // 개발 환경에서만 사용, 프로덕션에서는 false
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
})
