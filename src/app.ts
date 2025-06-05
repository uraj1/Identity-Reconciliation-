import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './utils/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

export default app;