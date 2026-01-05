import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    RequestContext.run(req, res, () => {
      const method = req.method;
      const url = req.originalUrl || req.url;
      const userAgent = req.get('User-Agent') || '';
      const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '').toString();

      // Prefer incoming header, else generate
      const ridHeader = req.headers['x-request-id'];
      const requestId = Array.isArray(ridHeader)
        ? (ridHeader[0] as string)
        : (typeof ridHeader === 'string' && ridHeader.length > 0
            ? ridHeader
            : `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

      // Save to per-request store
      RequestContext.set('method', method);
      RequestContext.set('url', url);
      RequestContext.set('userAgent', userAgent);
      RequestContext.set('ip', ip);
      RequestContext.set('requestId', requestId);

      // Reflect request id back to response
      res.setHeader('X-Request-ID', requestId);

      next();
    });
  }
}


