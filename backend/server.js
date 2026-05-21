import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

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

// Database connection check middleware to fail fast or establish connection on serverless environments
app.use(async (req, res, next) => {
  if (process.env.VERCEL || process.env.NETLIFY) {
    if (!process.env.MONGO_URI) {
      return res.status(503).json({
        message: 'Database is not configured. Please add the MONGO_URI environment variable in your Netlify site settings (under Site configuration -> Environment variables) to connect to your live MongoDB database.'
      });
    }
    try {
      // Ensure the database is fully connected before any route handlers execute
      await connectDB();
    } catch (error) {
      return res.status(503).json({
        message: error.message || 'Database connection is not active. Please check your MONGO_URI value or database server availability.'
      });
    }
  }
  next();
});

// Map Routes
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/animals', '/animals'], animalRoutes);
app.use(['/api/vaccinations', '/vaccinations'], vaccinationRoutes);
app.use(['/api/visitors', '/visitors'], visitorRoutes);
app.use(['/api/diseases', '/diseases'], diseaseRoutes);
app.use(['/api/feed', '/feed'], feedRoutes);
app.use(['/api/sanitation', '/sanitation'], sanitationRoutes);
app.use(['/api/notifications', '/notifications'], notificationRoutes);
app.use(['/api/analytics', '/analytics'], analyticsRoutes);

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

if (!process.env.VERCEL && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
