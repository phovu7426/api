import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateUtil } from '@/core/utils/date.util';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

// Config loaders
import appConfig from '@/core/config/app.config';
import databaseConfig from '@/core/config/database.config';
import jwtConfig from '@/core/config/jwt.config';
import mailConfig from '@/core/config/mail.config';
import storageConfig from '@/core/config/storage.config';
import { ModuleRef } from '@nestjs/core';

// Infrastructure modules
import { DatabaseModule } from '@/core/database/database.module';
import { RedisUtil } from '@/core/utils/redis.util';
import { TokenBlacklistService } from '@/core/security/token-blacklist.service';
import { AttemptLimiterService } from '@/core/security/attempt-limiter.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, jwtConfig, mailConfig, storageConfig],
      validationSchema: Joi.object({
        // App
        NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
        PORT: Joi.number().port().default(3000),
        GLOBAL_PREFIX: Joi.string().default('api'),
        APP_TIMEZONE: Joi.string().default('Asia/Ho_Chi_Minh'),

        // CORS
        CORS_ENABLED: Joi.boolean().truthy('true').falsy('false').default(true),
        CORS_ORIGINS: Joi.alternatives(
          Joi.string().allow(''),
          Joi.array().items(Joi.string())
        ).optional(),

        // Redis (optional)
        REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).optional(),

        // JWT (required)
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES_IN: Joi.string().default('1h'),
        JWT_REFRESH_SECRET: Joi.string().min(16).required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('1d'),
        JWT_ISSUER: Joi.string().allow(''),
        JWT_AUDIENCE: Joi.string().allow(''),

        // Database
        DB_TYPE: Joi.string().default('mysql'),
        DB_HOST: Joi.string().hostname().default('localhost'),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().allow(''),
        DB_DATABASE: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.boolean().truthy('true').falsy('false').default(false),
        DB_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),
        DB_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
        DB_CHARSET: Joi.string().default('utf8mb4'),
        DB_TIMEZONE: Joi.string().default('+07:00'),
        DB_CONNECTION_LIMIT: Joi.number().default(50),
        // DB_ACQUIRE_TIMEOUT: Joi.number().default(60000),
        // DB_TIMEOUT: Joi.number().default(60000),
        // DB_RECONNECT: Joi.boolean().truthy('true').falsy('false').default(true),

        // Mail (optional but warn if partially provided)
        MAIL_HOST: Joi.string().hostname().default('localhost'),
        MAIL_PORT: Joi.number().default(587),
        MAIL_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
        MAIL_USERNAME: Joi.string().allow(''),
        MAIL_PASSWORD: Joi.string().allow(''),
        MAIL_FROM_NAME: Joi.string().allow(''),
        MAIL_FROM_ADDRESS: Joi.string().email({ tlds: { allow: false } }).allow(''),
        MAIL_TEMPLATE_DIR: Joi.string().default('./templates'),
        MAIL_TEMPLATE_ADAPTER: Joi.string().valid('handlebars', 'nunjucks', 'pug').default('handlebars'),

        // RBAC cache
        RBAC_CACHE_TTL: Joi.number().min(30).max(1800).default(300),

        // Attempt limiter (generalized)
        SECURITY_ATTEMPT_MAX: Joi.number().min(1).max(20).default(5),
        SECURITY_ATTEMPT_LOCKOUT_SECONDS: Joi.number().min(60).max(7200).default(1800), // 30 minutes
        SECURITY_ATTEMPT_WINDOW_SECONDS: Joi.number().min(30).max(7200).default(900), // 15 minutes

        // Storage
        STORAGE_TYPE: Joi.string().valid('local', 's3').default('local'),
        STORAGE_MAX_FILE_SIZE: Joi.number().min(1024).max(104857600).default(10485760), // 1KB to 100MB, default 10MB
        AWS_REGION: Joi.string().default('us-east-1'),
        AWS_S3_BUCKET: Joi.string().allow(''),
        AWS_ACCESS_KEY_ID: Joi.string().allow(''),
        AWS_SECRET_ACCESS_KEY: Joi.string().allow(''),
        AWS_S3_BASE_URL: Joi.string().allow(''),
      }),
    }),
    DatabaseModule,
  ],
  providers: [RedisUtil, TokenBlacklistService, AttemptLimiterService],
  exports: [ConfigModule, DatabaseModule, RedisUtil, TokenBlacklistService, AttemptLimiterService],
})
export class CoreModule {
  constructor(private readonly configService: ConfigService) {
    const tz = this.configService.get<string>('app.timezone') || process.env.APP_TIMEZONE || 'Asia/Ho_Chi_Minh';
    DateUtil.setTimezone(tz);
  }
}


