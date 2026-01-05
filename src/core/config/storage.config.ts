import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  // Storage type: 'local' or 's3'
  type: process.env.STORAGE_TYPE || 'local',
  
  // Max file size (bytes), default 10MB
  maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '10485760', 10),
  
  // Local storage config
  local: {
    destination: './storage/uploads', // Hardcoded - not sensitive
    baseUrl: '/uploads', // Hardcoded - not sensitive
  },
  
  // AWS S3 config
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    baseUrl: process.env.AWS_S3_BASE_URL || '',
  },
}));

