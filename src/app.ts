import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { router } from './routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/api', router);

  app.get('/health', (_req, res) => {
    res.status(200).send('ok');
  });

  // Root 404 with JSON message
  app.all('/', (_req, res) => {
    res.status(404).json({ message: 'Welcome to saturn' });
  });

  // Fallback 404 for other routes
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}


