import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './utils/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Health check route at root
app.get('/', (req, res) => {
  res.send('Bitespeed Identity Reconciliation API is running successfully!');
});

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

export default app;