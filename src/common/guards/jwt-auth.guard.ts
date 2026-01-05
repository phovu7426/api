import {
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PERMS_REQUIRED_KEY, PUBLIC_PERMISSION } from '@/common/decorators/rbac.decorators';
import { ResponseUtil } from '@/common/utils/response.util';
import { TokenBlacklistService } from '@/core/security/token-blacklist.service';
import { RequestContext } from '@/common/utils/request-context.util';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private tokenBlacklist: TokenBlacklistService,
  ) {
    super();
  }

  /**
   * Kiểm tra token có hết hạn không (decode mà không verify)
   * Trả về true nếu token đã hết hạn, false nếu chưa hết hạn hoặc không thể decode
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded !== 'object' || !decoded.payload) {
        return false;
      }
      const payload = decoded.payload as jwt.JwtPayload;
      if (payload.exp) {
        const exp = typeof payload.exp === 'number' ? payload.exp : parseInt(payload.exp, 10);
        const now = Math.floor(Date.now() / 1000);
        return exp < now;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Clear Auth (request.user và RequestContext)
   */
  private clearAuth(request: any): void {
    request.user = null;
    try {
      RequestContext.set('user', null);
    } catch { }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Kiểm tra route có @Permission() không
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMS_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];

    // Kiểm tra có @Permission('public') không
    const isPublicPermission = requiredPerms.includes(PUBLIC_PERMISSION);

    // Kiểm tra token blacklist nếu có token (ưu tiên Redis để đồng bộ nhiều instance)
    if (this.tokenBlacklist && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const blocked = await this.tokenBlacklist.has(token);
        if (blocked) {
          // Clear Auth nếu token bị blacklist
          this.clearAuth(request);
          return false;
        }
      }
    }

    // Protect-by-default: chỉ optional khi có @Permission('public')
    if (isPublicPermission) {
      // Public route: không có token thì cho phép truy cập ngay
      // Không gọi Passport strategy để tránh throw error
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Clear Auth để đảm bảo không có thông tin cũ
        this.clearAuth(request);
        return true;
      }

      // Public route có token: kiểm tra expiration trước
      const token = authHeader.substring(7);
      if (token && this.isTokenExpired(token)) {
        // Token đã hết hạn: clear Auth và không gọi Passport
        this.clearAuth(request);
        return true; // Vẫn cho phép truy cập vì là public route
      }

      // Public route có token hợp lệ: thử validate token (optional)
      // Nếu token không hợp lệ, vẫn cho phép truy cập
      try {
        const result = super.canActivate(context);
        // Chuẩn hóa kết quả về boolean
        if (result instanceof Promise) {
          return await result.catch(() => {
            // Nếu có lỗi, clear Auth
            this.clearAuth(request);
            return true;
          });
        }
        if (result instanceof Observable) {
          return await new Promise<boolean>((resolve) => {
            result.pipe(catchError(() => {
              // Nếu có lỗi, clear Auth
              this.clearAuth(request);
              return of(true);
            })).subscribe({
              next: (v) => resolve(!!v),
              error: () => {
                this.clearAuth(request);
                resolve(true);
              },
            });
          });
        }
        return !!result;
      } catch {
        // Nếu có lỗi, clear Auth
        this.clearAuth(request);
        return true;
      }
    }

    // Route protected (mặc định): bắt buộc phải có token hợp lệ
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return await result;
      }
      if (result instanceof Observable) {
        return await new Promise<boolean>((resolve, reject) => {
          result.subscribe({
            next: (v) => resolve(!!v),
            error: () => reject(false),
          });
        });
      }
      return !!result;
    } catch {
      return false;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Kiểm tra route có @Permission() không
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMS_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];

    // Kiểm tra có @Permission('public') không
    const isPublicPermission = requiredPerms.includes(PUBLIC_PERMISSION);

    // Route public/optional auth: chỉ khi có @Permission('public')
    if (isPublicPermission) {
      // Nếu token hết hạn, clear Auth để đảm bảo không sử dụng thông tin token đã hết hạn
      if (info?.name === 'TokenExpiredError') {
        this.clearAuth(request);
        return null;
      }
      
      if (err || !user) {
        // Clear Auth nếu có lỗi hoặc không có user
        this.clearAuth(request);
        return null; // optional auth
      }
      try {
        if (user) {
          RequestContext.set('user', user);
        }
      } catch { }
      return user;
    }

    // Route protected: bắt buộc phải có user hợp lệ
    if (err || !user) {
      let message = 'Unauthorized';

      if (info?.name === 'TokenExpiredError') {
        message = 'Token expired';
      } else if (info?.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      } else if (info?.message) {
        message = info.message;
      }

      // Dùng ResponseUtil thay vì UnauthorizedException
      if (err) {
        throw err;
      }

      const response = ResponseUtil.unauthorized(message);
      throw new HttpException(response, response.httpStatus || HttpStatus.UNAUTHORIZED);
    }

    try {
      if (user) {
        RequestContext.set('user', user);
      }
    } catch { }
    return user;
  }
}
