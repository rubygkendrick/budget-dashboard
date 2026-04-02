// Entry point for the Express server: registers middleware and mounts all API routes.
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth';
import accountsRouter from './routes/accounts';

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget app backend is running!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})