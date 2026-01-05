import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '@/shared/enums/user-status.enum';
import { RedisUtil } from '@/core/utils/redis.util';
import { TokenService } from '@/modules/auth/services/token.service';
import { TokenBlacklistService } from '@/core/security/token-blacklist.service';
import { AttemptLimiterService } from '@/core/security/attempt-limiter.service';
import { safeUser } from '@/modules/auth/utils/user.util';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisUtil,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly tokenService: TokenService,
    private readonly accountLockoutService: AttemptLimiterService,
  ) { }

  async login(dto: LoginDto) {
    const identifier = dto.email.toLowerCase();
    const scope = 'auth:login';
    const lockout = await this.accountLockoutService.check(scope, identifier);

    if (lockout.isLocked) {
      throw new Error(
        `Tài khoản đã bị khóa tạm thời do quá nhiều lần đăng nhập sai. Vui lòng thử lại sau ${lockout.remainingMinutes} phút.`
      );
    }

    // Tìm user bằng email (case-insensitive - MySQL không hỗ trợ mode insensitive, dùng raw query hoặc tìm tất cả rồi filter)
    const users = await this.prisma.user.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        status: true,
      },
    });
    const user = users.find(u => u.email?.toLowerCase() === dto.email.toLowerCase());

    let authError: string | null = null;

    if (!user || !user.password) {
      await this.accountLockoutService.add(scope, identifier);
      authError = 'Email hoặc mật khẩu không đúng.';
    } else {
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        await this.accountLockoutService.add(scope, identifier);
        authError = 'Email hoặc mật khẩu không đúng.';
      } else if (user.status !== UserStatus.active) {
        authError = 'Tài khoản đã bị khóa hoặc không hoạt động.';
      }
    }

    if (authError) {
      throw new Error(authError);
    }

    await this.accountLockoutService.reset(scope, identifier);

    await this.prisma.user.update({
      where: { id: user!.id },
      data: { last_login_at: new Date() },
    }).catch(() => undefined);

    const { accessToken, refreshToken, refreshJti, accessTtlSec } = this.tokenService.generateTokens(Number(user!.id), user!.email!);

    await this.redis.set(this.buildRefreshKey(Number(user!.id), refreshJti), '1', this.tokenService.getRefreshTtlSec()).catch(() => undefined);

    return { token: accessToken, refreshToken: refreshToken, expiresIn: accessTtlSec };
  }

  async register(dto: RegisterDto) {
    const existingByEmail = await this.prisma.user.findFirst({
      where: { email: dto.email, deleted_at: null },
    });
    if (existingByEmail) {
      throw new Error('Email đã được sử dụng.');
    }

    if (dto.username) {
      const existingByUsername = await this.prisma.user.findFirst({
        where: { username: dto.username, deleted_at: null },
      });
      if (existingByUsername) {
        throw new Error('Tên đăng nhập đã được sử dụng.');
      }
    }

    if (dto.phone) {
      const existingByPhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone, deleted_at: null },
      });
      if (existingByPhone) {
        throw new Error('Số điện thoại đã được sử dụng.');
      }
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const saved = await this.prisma.user.create({
      data: {
        username: dto.username ?? dto.email,
        email: dto.email,
        phone: dto.phone ?? null,
        password: hashed,
        status: UserStatus.active,
        profile: {
          create: {
            name: dto.username || dto.email,
          },
        },
      },
    });

    return { user: safeUser(saved) };
  }

  async logout(userId: number, token?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    if (token) {
      const ttlSeconds = this.tokenService.getAccessTtlSec();
      await this.tokenBlacklistService.add(token, ttlSeconds);
    }
    return null;
  }

  async refreshTokenByValue(refreshToken: string) {
    try {
      let refreshError: string | null = null;
      const decoded = this.tokenService.decodeRefresh(refreshToken);
      if (!decoded) {
        refreshError = 'Invalid refresh token';
      }

      let userId: number | undefined;
      let jti: string | undefined;
      if (!refreshError) {
        userId = Number(decoded!.sub);
        jti = decoded!.jti as string | undefined;
        if (!userId || !jti) {
          refreshError = 'Invalid refresh token';
        }
      }

      if (!refreshError) {
        const active = !!(await this.redis.get(this.buildRefreshKey(userId!, jti!)));
        if (!active) {
          refreshError = 'Refresh token revoked or expired';
        }
      }

      if (refreshError) {
        throw new Error(refreshError);
      }

      await this.redis.del(this.buildRefreshKey(userId!, jti!));

      const { accessToken, refreshToken: newRt, accessTtlSec } = await this.tokenService.issueAndStoreNewTokens(userId!, (decoded as any).email as string | undefined);

      return { token: accessToken, refreshToken: newRt, expiresIn: accessTtlSec };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  private buildRefreshKey(userId: number, jti: string): string {
    return `auth:refresh:${userId}:${jti}`;
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) throw new Error('Không thể lấy thông tin user');
    return safeUser({ 
      ...user, 
      id: Number(user.id), 
      status: user.status as any,
      created_user_id: user.created_user_id ? Number(user.created_user_id) : null,
      updated_user_id: user.updated_user_id ? Number(user.updated_user_id) : null,
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deleted_at: null },
      select: { id: true, email: true },
    });

    if (user && user.email) {
      const token = crypto.randomBytes(32).toString('hex');
      const key = `password_reset:${token}`;
      const data = JSON.stringify({ userId: Number(user.id), email: user.email });

      await this.redis.set(key, data, 3600); // 1 hour TTL
    }

    return null;
  }

  async resetPassword(dto: ResetPasswordDto) {
    let resetError: string | null = null;

    if (dto.password !== dto.confirmPassword) {
      resetError = 'Mật khẩu xác nhận không khớp.';
    }

    const key = `password_reset:${dto.token}`;
    const data = resetError ? null : await this.redis.get(key);

    if (!resetError && !data) {
      resetError = 'Token không hợp lệ hoặc đã hết hạn.';
    }

    let userIdForReset: number | undefined;
    if (!resetError && data) {
      try {
        const tokenData = JSON.parse(data);
        userIdForReset = Number(tokenData.userId);
        if (!userIdForReset) resetError = 'Token không hợp lệ hoặc đã hết hạn.';
      } catch {
        resetError = 'Token không hợp lệ hoặc đã hết hạn.';
      }
    }

    let user: { id: bigint; email: string | null } | null = null;
    if (!resetError && userIdForReset) {
      user = await this.prisma.user.findUnique({
        where: { id: BigInt(userIdForReset) },
        select: { id: true, email: true },
      });
      if (!user) resetError = 'Người dùng không tồn tại.';
    }

    if (resetError) {
      throw new Error(resetError);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({ where: { id: user!.id }, data: { password: hashedPassword } });
    await this.redis.del(key);
    await this.accountLockoutService.reset('auth:login', user!.email!.toLowerCase());

    return null;
  }
}
