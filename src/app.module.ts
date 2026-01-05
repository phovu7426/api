import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

// Core Modules
import { CoreModule } from '@/core/core.module';
import { CommonModule } from '@/common/common.module';

// Core Services
import { CustomLoggerService } from '@/core/logger/logger.service';

// Common Filters, Interceptors, Guards
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { QueryFailedFilter } from '@/common/filters/query-failed.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from '@/common/interceptors/timeout.interceptor';
import { FilePathInterceptor } from '@/common/interceptors/file-path.interceptor';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AuthModule } from '@/modules/auth/auth.module';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { RequestContextMiddleware } from '@/common/middlewares/request-context.middleware';
import { RateLimitModule } from '@/core/security/throttler.module';
import { ContextModule } from '@/modules/context/context.module';
import { GroupInterceptor } from '@/common/interceptors/group.interceptor';

// New Domain Modules
import { PostModule } from '@/modules/post/post.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { UserManagementModule } from '@/modules/user-management/user-management.module';
import { EnumModule } from '@/shared/enums/enum.module';
import { FileUploadModule } from '@/modules/file-upload/file-upload.module';
import { MenuModule } from '@/modules/menu/menu.module';
import { BannerModule } from '@/modules/banner/banner.module';
import { ContactModule } from '@/modules/contact/contact.module';
import { SystemConfigModule } from '@/modules/system-config/system-config.module';
import { AppMailModule } from '@/core/mail/mail.module';
import { ComicsModule } from '@/modules/comics/comics.module';

@Module({
  imports: [
    CoreModule,
    CommonModule,
    RateLimitModule, // Global rate limiting
    AuthModule,
    RbacModule,
    ContextModule,
    // New Domain Modules
    PostModule,
    NotificationModule,
    UserManagementModule,
    EnumModule,
    FileUploadModule,
    MenuModule,
    BannerModule,
    ContactModule,
    SystemConfigModule,
    AppMailModule,
    ComicsModule,
  ],
  controllers: [],
  providers: [
    CustomLoggerService,
    // Global Exception Filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedFilter,
    },
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: FilePathInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GroupInterceptor,
    },
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}

