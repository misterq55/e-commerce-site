import 'reflect-metadata'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { AppDataSource } from './data-source'
import userRoutes from './routes/user'
import productRoutes from './routes/product'
import { Request, Response, NextFunction } from 'express'

// .env 파일 로드
dotenv.config()

// 환경 변수 체크
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env file')
}
if (!process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL is not defined in .env file')
}

const app = express()
const port = process.env.PORT

// 미들웨어
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true // Cookie 전송 허용
}))
app.use(express.static(path.join(__dirname,'../uploads')))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500)
  res.send(error.message || 'Error')
})

// 데이터베이스 연결 후 서버 시작
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully')

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error)
  })