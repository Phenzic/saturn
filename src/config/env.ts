import 'dotenv/config';

export const env = {
  port: process.env.PORT || '8080',
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  contractsDir: process.env.CONTRACTS_DIR || '/Users/home/Documents/Project_pegasus/contracts',
  web3StorageToken: process.env.WEB3_STORAGE_TOKEN || '',
};

