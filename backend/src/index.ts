
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth';

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget app backend is running!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})