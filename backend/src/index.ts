import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import contributionRoutes from './routes/contribution.routes';

const app = express();
const prisma = new PrismaClient();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', contributionRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

export { app, prisma };
