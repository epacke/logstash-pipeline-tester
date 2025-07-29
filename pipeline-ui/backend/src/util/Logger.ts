import pino from 'pino';

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Create a pretty print stream for development


// Logger configuration
const logger = pino({
  level: logLevel,
  base: {
    env: process.env.NODE_ENV,
    service: 'logstash-pipeline-tester',
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => {
      return {level: label.toUpperCase()};
    },
  },
  // Use pretty print in development, JSON in production
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

// Create child loggers for different parts of the application
export const apiLogger = logger.child({module: 'api'});
export const websocketLogger = logger.child({module: 'websocket'});
export const pipelineLogger = logger.child({module: 'pipeline'});

// Export the main logger as default
export default logger;
