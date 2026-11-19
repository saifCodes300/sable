import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import promoRoutes from './routes/promo.js';
import stylistRoutes from './routes/stylist.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Static public image serving so backend can also serve product imagery if needed
const publicImagesPath = path.join(__dirname, '../../public/images');
app.use('/images', express.static(publicImagesPath));

// Health Check
app.get(['/api/health', '/api/v1/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SABLE MERN Backend API',
    mongodb: connectDB ? 'configured' : 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/promo', promoRoutes);
app.use('/api/v1/stylist', stylistRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('[Global API Error]:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and start Express server
async function start() {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`[SABLE Backend] Running on http://localhost:${PORT}`);
    console.log(`[SABLE Backend] Health check: http://localhost:${PORT}/api/v1/health`);
  });
}

start();
