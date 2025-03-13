import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pincodeRoutes from './routes/pincode';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', pincodeRoutes);

export default app; 