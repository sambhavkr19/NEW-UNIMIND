import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { logger } from './server/utils/logger';
import { connectDB, getDBStatus } from './server/config/db';
import { errorHandler } from './server/middleware/errorHandler';
import authRoutes from './server/routes/authRoutes';
import chatRoutes from './server/routes/chatRoutes';
import documentRoutes from './server/routes/documentRoutes';
import ticketRoutes from './server/routes/ticketRoutes';
import adminRoutes from './server/routes/adminRoutes';
import platformRoutes from './server/routes/platformRoutes';
import announcementRoutes from './server/routes/announcementRoutes';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up JSON and urlencoded body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB Connection
  const dbStatus = await connectDB();

  // Basic request logger middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Authentication Routes
  app.use('/api/auth', authRoutes);

  // Chat Routes
  app.use('/api/chat', chatRoutes);

  // Document Routes (PDF Management & RAG sources)
  app.use('/api/documents', documentRoutes);

  // Support Ticket Routes
  app.use('/api/tickets', ticketRoutes);

  // College Admin Routes
  app.use('/api/admin', adminRoutes);

  // Platform Admin (Developer) Routes
  app.use('/api/platform', platformRoutes);

  // Announcements Routes
  app.use('/api/announcements', announcementRoutes);

  // Health API endpoint
  app.get('/api/health', (req, res) => {
    const currentDbStatus = getDBStatus();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      server: {
        status: 'UP',
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
      },
      database: {
        connected: currentDbStatus.isConnected,
        mode: currentDbStatus.mode,
        error: currentDbStatus.error || null,
      },
      appName: 'UniMind AI',
      version: '1.0.0-phase1',
    });
  });

  // Vite static/asset serving integration
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Starting Vite development middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    logger.info('Serving static files in production mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server successfully running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
});
