import { ExecutionContext } from '@nestjs/common';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { RequestContext } from '@/common/utils/request-context.util';

/**
 * Auth Helper Functions
 * Tương tự Laravel's Auth::user(), Auth::id()
 * 
 * @example
 * ```typescript
 * // Trong guard/interceptor
 * const userId = Auth.id(context);
 * const user = Auth.user(context);
 * if (Auth.check(context)) { ... }
 * ```
 */
export class Auth {
  /**
   * Lấy user hiện tại từ ExecutionContext
   * Tương tự Auth::user()
   */
  static user(context?: ExecutionContext): AuthUser | null {
    const userFromCtx = RequestContext.get<AuthUser>('user');
    if (userFromCtx) return userFromCtx;
    if (context) {
      const request = context.switchToHttp().getRequest();
      return (request as any)?.user || null;
    }
    return null;
  }

  /**
   * Lấy user ID hiện tại từ ExecutionContext
   * Tương tự Auth::id()
   */
  static id(context?: ExecutionContext): number | null {
    const user = this.user(context);
    return user?.id || null;
  }

  /**
   * Kiểm tra user có đăng nhập không
   * Tương tự Auth::check()
   */
  static check(context?: ExecutionContext): boolean {
    return !!this.user(context);
  }

  /**
   * Kiểm tra user có đăng nhập không
   * Tương tự Auth::isLogin()
   */
  static isLogin(context?: ExecutionContext): boolean {
    return this.check(context);
  }

  /**
   * Kiểm tra user chưa đăng nhập
   * Tương tự Auth::guest()
   */
  static guest(context?: ExecutionContext): boolean {
    return !this.check(context);
  }

  /**
   * Lấy property của user hiện tại
   * Tương tự Auth::user()->email
   * 
   * @example
   * ```typescript
   * const email = Auth.get(context, 'email');
   * const status = Auth.get(context, 'status');
   * ```
   */
  static get<K extends keyof AuthUser>(context: ExecutionContext | undefined, key: K): AuthUser[K] | undefined {
    const user = this.user(context);
    return user?.[key];
  }
}

