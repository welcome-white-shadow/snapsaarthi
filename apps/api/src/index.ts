import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '@snapsaarthi/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// Example route using Prisma
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(port, () => {
  console.log(`🚀 SnapSaarthi API running at http://localhost:${port}`);
});
