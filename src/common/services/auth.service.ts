import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuthUser } from '@/common/interfaces/auth-user.interface';

/**
 * Auth Service
 * Cho phép truy cập user hiện tại trong service/controller methods
 * 
 * Lưu ý về public routes:
 * - Route không có @Permission() → mặc định là public (không bắt buộc authentication)
 * - Route có @Permission('public') → explicit public route
 * - Public route vẫn validate token nếu có, nhưng không bắt buộc
 * - Nếu user gửi token hợp lệ, req.user sẽ được set
 * - this.auth.isLogin() = true nếu có token hợp lệ, false nếu không có token hoặc token invalid
 * - this.auth.guest() = false nếu đã đăng nhập, true nếu chưa đăng nhập
 * - Cho phép user đăng nhập vào public route để có thêm thông tin (ví dụ: bài viết đã like chưa)
 * 
 * Lưu ý
 * - Nếu có token hợp lệ, req.user sẽ được set
 * - this.auth.isLogin() sẽ trả về true nếu có user, false nếu không
 */
@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(@Inject(REQUEST) private request: Request) { }

  /**
   * Lấy user hiện tại từ request
   * Tương tự Auth::user()
   */
  user(): AuthUser | null {
    return (this.request as any)?.user || null;
  }

  /**
   * Lấy user ID hiện tại
   * Tương tự Auth::id()
   */
  id(): number | null {
    const user = this.user();
    return user?.id || null;
  }

  /**
   * Kiểm tra user có đăng nhập không
   * Tương tự Auth::check()
   */
  check(): boolean {
    return !!this.user();
  }

  /**
   * Kiểm tra user có đăng nhập không
   * Tương tự Auth::isLogin() hoặc Auth::guest()
   */
  isLogin(): boolean {
    return this.check();
  }

  /**
   * Kiểm tra user chưa đăng nhập
   * Tương tự Auth::guest()
   */
  guest(): boolean {
    return !this.check();
  }

  /**
   * Lấy property của user hiện tại
   * Tương tự Auth::user()->email
   * 
   * @example
   * ```typescript
   * const email = this.auth.get('email');
   * const status = this.auth.get('status');
   * ```
   */
  get<K extends keyof AuthUser>(key: K): AuthUser[K] | undefined {
    const user = this.user();
    return user?.[key];
  }

  /**
   * Lấy email của user hiện tại
   */
  email(): string | null {
    return this.get('email') || null;
  }

  /**
   * Lấy username của user hiện tại
   */
  username(): string | null {
    return this.get('username') || null;
  }

  /**
   * Lấy status của user hiện tại
   */
  status(): string | null {
    return this.get('status') || null;
  }
}
