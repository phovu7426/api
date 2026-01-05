import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { transformFilePaths } from '@/common/utils/file-path.util';

/**
 * Interceptor để tự động thêm domain vào các file paths trong response
 * Chuyển đổi các path như /uploads/banners/home-slider-3.jpg 
 * thành https://yourdomain.com/uploads/banners/home-slider-3.jpg
 */
@Injectable()
export class FilePathInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Lấy base URL dựa trên storage type (giống như upload.service.ts)
    const storageType = this.configService.get<string>('storage.type', 'local');
    let baseUrl: string;

    if (storageType === 's3') {
      // Nếu dùng S3, lấy baseUrl từ S3 config
      const s3Config = this.configService.get('storage.s3');
      const s3BaseUrl = s3Config?.baseUrl;
      
      if (s3BaseUrl) {
        baseUrl = s3BaseUrl;
      } else {
        // Fallback: tạo URL từ bucket và region nếu không có baseUrl
        const bucket = s3Config?.bucket || '';
        const region = s3Config?.region || 'us-east-1';
        baseUrl = `https://${bucket}.s3.${region}.amazonaws.com`;
      }
    } else {
      // Nếu dùng local storage, dùng app.url
      baseUrl = this.configService.get<string>('app.url', 'http://localhost:8000');
    }
    
    return next.handle().pipe(
      map((data) => {
        // Nếu data là null hoặc undefined, trả về nguyên bản
        if (data === null || data === undefined) {
          return data;
        }

        // Nếu data đã được format thành ApiResponse (có structure với success, data, meta, timestamp)
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          // Transform file paths trong data field của ApiResponse
          return {
            ...data,
            data: transformFilePaths(data.data, baseUrl),
          };
        }

        // Nếu data chưa được format (trường hợp này ít xảy ra vì TransformInterceptor chạy trước)
        // Transform toàn bộ data
        return transformFilePaths(data, baseUrl);
      })
    );
  }
}

