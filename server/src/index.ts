import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/supabase';
import authRoutes from './routes/auth.routes';
import shopRoutes from './routes/shop.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'QueueLess Kirana API is running',
    version: '2.0.0',
    database: 'Supabase (PostgreSQL)',
    endpoints: {
      auth: '/api/auth',
      shops: '/api/shops',
      products: '/api/products',
      orders: '/api/orders',
      cart: '/api/cart',
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    message: 'QueueLess Kirana API is running',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Start server and test Supabase connection
async function startServer() {
  try {
    console.log('🔌 Testing Supabase connection...');
    const connected = await testConnection();

    if (connected) {
      console.log('📦 Database: Supabase (PostgreSQL)');
    } else {
      console.log('⚠️  Database connection failed - check your .env file');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error: any) {
    console.error('❌ Server startup error:', error.message);
    app.listen(PORT, () => {
      console.log(`⚠️  Server running on port ${PORT} (Database not connected)`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  }
}

startServer();

export default app;

