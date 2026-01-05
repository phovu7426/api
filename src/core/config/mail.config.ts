import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  from: {
    name: process.env.MAIL_FROM_NAME || '',
    address: process.env.MAIL_FROM_ADDRESS || '',
  },
  template: {
    dir: process.env.MAIL_TEMPLATE_DIR || './templates',
    adapter: process.env.MAIL_TEMPLATE_ADAPTER || 'handlebars',
    options: {
      strict: true,
    },
  },
}));
