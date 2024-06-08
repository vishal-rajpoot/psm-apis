#!/usr/bin/env node

import http from 'http';
import app from './src/app';
import Logger from './src/utils/logger';
import appConfig from './src/config/appconfig';
import { initializeDbConnection } from './src/utils/db';

const logger = new Logger();
const server = http.createServer(app);

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
};

const port = normalizePort(appConfig.app.port);
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  switch (error.code) {
    case 'EACCES':
      logger.log(`${port} requires elevated privileges`, 'error');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.log(`${port} is already in use`, 'error');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

  logger.log(`the server started listening on ${bind}`, 'info');
};

process.on('SIGINT', () => {
  logger.log('stopping the server', 'info');
  process.exit();
});

initializeDbConnection();

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
