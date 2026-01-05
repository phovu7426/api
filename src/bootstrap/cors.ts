import { INestApplication } from '@nestjs/common';

export function applyCors(app: INestApplication, options: {
  enabled: boolean;
  origins: string[];
}) {
  if (!options.enabled) return;
  const hasWildcard = options.origins.includes('*');
  app.enableCors({
    origin: hasWildcard ? '*' : options.origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
      'X-Context-Id',
      'X-Group-Id',
      'Accept',
      'Accept-Language',
      'Origin',
    ],
    // Không thể dùng credentials với wildcard origin. Chỉ bật khi không dùng '*'
    credentials: !hasWildcard,
  });
}


