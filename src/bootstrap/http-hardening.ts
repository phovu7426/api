import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';

export function applyHttpHardening(app: INestApplication, payloadLimit = '1mb') {
  // Helmet for API-only backend (disable CSP to avoid blocking third-party API calls from clients)
  // Note: crossOriginResourcePolicy is set to 'cross-origin' to allow static files to be accessed from different origins
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for static files
    referrerPolicy: { policy: 'no-referrer' },
  }));
  app.use(hpp());
  app.use(bodyParser.json({ limit: payloadLimit }));
  app.use(bodyParser.urlencoded({ limit: payloadLimit, extended: true }));
  app.use(compression());
}


