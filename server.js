import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import Route Handlers
import authRoutes from './routes/authRoutes.js';
import animalRoutes from './routes/animalRoutes.js';
import vaccinationRoutes from './routes/vaccinationRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import diseaseRoutes from './routes/diseaseRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import sanitationRoutes from './routes/sanitationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Base Root Check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Smart BioSecure Farm Portal API Server' });
});

// Map Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/sanitation', sanitationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
