import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { sseManager } from './services/sse.service.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import forecastRoutes from './routes/forecast.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import surplusRoutes from './routes/surplus.routes.js';
import ngoRoutes from './routes/ngo.routes.js';
import redistributionRoutes from './routes/redistribution.routes.js';
import logisticsRoutes from './routes/logistics.routes.js';
import monitoringRoutes from './routes/monitoring.routes.js';
import qualityRoutes from './routes/quality.routes.js';
import processingRoutes from './routes/processing.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded food inspection images
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'SmartFood AI Core Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Real-Time Server-Sent Events (SSE) Bus
app.get('/api/events', (req: Request, res: Response) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  sseManager.addClient(clientId, res);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/surplus', surplusRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/donations', redistributionRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/sensors', monitoringRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/processing', processingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SmartFood AI Server running on port ${PORT}`);
  console.log(`🌐 REST API base: http://localhost:${PORT}/api`);
  console.log(`📡 Real-time SSE stream: http://localhost:${PORT}/api/events`);
  console.log(`====================================================`);
});

export default app;
