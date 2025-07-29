import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pinoHttp from 'pino-http';
import expressWs from 'express-ws';
import helmet from 'helmet';
import { z } from 'zod';
import { apiLogger, websocketLogger } from './util/Logger';
import apiV1Pipelines from './api/v1/pipelines/index';
import apiV1SendLogLines from './api/v1/sendLogLines/index';
import apiV1ReceiveLogstashOutput from './api/v1/receiveLogstashOutput/index';
import apiV1LogstashStatus from './api/v1/logstashStatus/index';

// Environment configuration
const port = process.env.PORT || 8080;
const nodeEnv = process.env.NODE_ENV || 'development';

if (!process.env.PORT) {
  apiLogger.warn('PORT environment variable not set, using default: 8080');
}

// Initialize Express with WebSocket support
const dummyApp = express();
expressWs(dummyApp);
const { app, getWss } = expressWs(express());

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(bodyParser.json({
  limit: '10mb',
}));

// Static files
app.use(express.static('public'));

// Logging
const httpLogger = pinoHttp({ logger: apiLogger });
app.use(httpLogger);

// Health check schema
const HealthCheckResponse = z.object({
  status: z.literal('healthy'),
  timestamp: z.string(),
  environment: z.string(),
});

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    const response = HealthCheckResponse.parse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
    });
    res.status(200).json(response);
  } catch (error) {
    apiLogger.error('Health check failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API routes
app.ws('/api/v1/getLogstashOutput', (ws) => {
  // Add WebSocket error handling
  ws.on('error', (error) => {
    websocketLogger.error('WebSocket error:', error);
  });
});

app.use('/api/v1/pipelines', apiV1Pipelines);
app.use('/api/v1/sendLogLines', apiV1SendLogLines);
app.use('/api/v1/receiveLogstashOutput', apiV1ReceiveLogstashOutput);
app.use('/api/v1/logstashStatus', apiV1LogstashStatus);

// Root route
app.get('/', (req, res) => {
  try {
    res.sendFile('index.html', { root: __dirname + '/public/index.html' });
  } catch (error) {
    apiLogger.error('Error serving index.html:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response) => {
  apiLogger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(port, () => {
  apiLogger.info(`Logstash config tester running on port ${port} in ${nodeEnv} mode!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  apiLogger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    apiLogger.info('Server closed. Exiting...');
    process.exit(0);
  });
});

export { getWss };
