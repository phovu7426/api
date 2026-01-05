import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ResponseUtil } from '@/common/utils/response.util';

export function applyGlobalPipes(app: INestApplication, options: { production: boolean }) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow extra properties but strip them
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: options.production,
      exceptionFactory: (validationErrors: any[] = []) => {
        // Log chi tiết lỗi validation để debug
        // Removed console.error for production
        const response = ResponseUtil.validationError(validationErrors);
        return new HttpException(response, response.httpStatus || HttpStatus.BAD_REQUEST);
      },
    }),
  );
}


