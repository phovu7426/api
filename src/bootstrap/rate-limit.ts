import { INestApplication } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';

export function applyRateLimiting(app: INestApplication, opts?: { points?: number; durationSec?: number }) {
  const rateLimiter = new RateLimiterMemory({
    points: opts?.points ?? 100,
    duration: opts?.durationSec ?? 60,
  });

  app.use(async (req: any, res: any, next: any) => {
    try {
      const ip = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
      await rateLimiter.consume(ip);
      next();
    } catch {
      res.status(429).json({ success: false, message: 'Too many requests', code: 'TOO_MANY_REQUESTS' });
    }
  });
}


