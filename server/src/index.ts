import 'reflect-metadata'
import express from 'express'
import { AppDataSource } from './data-source'
import authRoutes from './routes/auth'

const app = express()
const port = 3000

// JSON 파싱 미들웨어
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.use("/api/auth", authRoutes)

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