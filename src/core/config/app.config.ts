import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || '',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  version: process.env.APP_VERSION || '1.0.0',
  url: process.env.APP_URL || 'http://localhost:8000',
  globalPrefix: process.env.GLOBAL_PREFIX || 'api',
  corsEnabled: (process.env.CORS_ENABLED ?? 'true') === 'true',
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    : process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['*'],
  timezone: process.env.APP_TIMEZONE || 'Asia/Ho_Chi_Minh',
}));
