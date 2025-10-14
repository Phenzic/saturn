import 'dotenv/config';

export const env = {
  port: process.env.PORT || '8080',
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

