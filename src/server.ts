import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(parseInt(env.port, 10), () => {
  console.log(`saturn listening on :${env.port} (env=${env.nodeEnv})`);
});


