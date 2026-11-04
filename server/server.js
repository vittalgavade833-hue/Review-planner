import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';
import User from './models/User.js';
import Article from './models/Article.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow development frontend
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'KnowledgeTrack API',
    uptime: process.uptime(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);

// Serve Frontend static assets if available (Production All-in-One deployment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, 'public');
const clientDistPath = path.join(__dirname, '../client/dist');
const staticPath = fs.existsSync(publicPath) ? publicPath : (fs.existsSync(clientDistPath) ? clientDistPath : null);

if (staticPath) {
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Check if initial seed is needed (e.g. fresh memory or blank DB)
    const userCount = await User.countDocuments();
    const articleCount = await Article.countDocuments();

    if (userCount === 0 || articleCount === 0) {
      console.log('No data found in database. Initializing automatic demo seed...');
      await seedDatabase();
      console.log('Auto-seeding complete! Ready for evaluation.');
    } else {
      console.log(`Database already populated (${userCount} users, ${articleCount} articles).`);
    }

    app.listen(PORT, () => {
      console.log(`KnowledgeTrack Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`API endpoints accessible at: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
