import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pincodeRoutes from './routes/pincode';

dotenv.config();

const app = express();
const expressApp = app();

expressApp.use(cors());
expressApp.use(express.json());

// Routes
expressApp.use('/api', pincodeRoutes);

export default app; 