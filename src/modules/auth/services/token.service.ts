import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { RedisUtil } from '@/core/utils/redis.util';

@Injectable()
export class TokenService {
  private readonly DEFAULT_AT_TTL = 3600; // 1h
  private readonly DEFAULT_RT_TTL = 86400; // 1d

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisUtil,
  ) {}

  private parseDurationToSeconds(input: string | undefined | null, fallback: number): number {
    if (!input) return fallback;
    const match = /^(\d+)([smhd])?$/.exec(input.trim());
    if (!match) return fallback;
    const val = parseInt(match[1], 10);
    const unit = match[2] || 's';
    switch (unit) {
      case 's': return val;
      case 'm': return val * 60;
      case 'h': return val * 3600;
      case 'd': return val * 86400;
      default: return fallback;
    }
  }

  getAccessTtlSec(): number {
    const exp = this.config.get<string>('jwt.expiresIn') || process.env.JWT_EXPIRES_IN;
    return this.parseDurationToSeconds(exp, this.DEFAULT_AT_TTL);
    }

  getRefreshTtlSec(): number {
    const exp = this.config.get<string>('jwt.refreshExpiresIn') || process.env.JWT_REFRESH_EXPIRES_IN;
    return this.parseDurationToSeconds(exp, this.DEFAULT_RT_TTL);
  }

  private getJwtIssuer(): string | undefined { return this.config.get<string>('jwt.issuer'); }
  private getJwtAudience(): string | undefined { return this.config.get<string>('jwt.audience'); }
  private getRefreshSecret(): string { return (this.config.get<string>('jwt.refreshSecret') || process.env.JWT_REFRESH_SECRET) as string; }

  private generateJti(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  generateTokens(userId: number, email?: string) {
    const payload = { sub: userId, email } as Record<string, any>;
    const accessToken = this.jwtService.sign(payload);
    const accessTtlSec = this.getAccessTtlSec();

    const jti = this.generateJti();
    const issuer = this.getJwtIssuer();
    const audience = this.getJwtAudience();
    const refreshSecret = this.getRefreshSecret();
    const refreshExpiresIn = (this.config.get<string>('jwt.refreshExpiresIn') || process.env.JWT_REFRESH_EXPIRES_IN || '1d') as any;

    const refreshToken = jwt.sign(
      { sub: userId, email, jti },
      refreshSecret,
      { expiresIn: refreshExpiresIn, issuer, audience }
    );

    const refreshTtlSec = this.getRefreshTtlSec();
    return { accessToken, refreshToken, refreshJti: jti, accessTtlSec, refreshTtlSec } as const;
  }

  verifyRefreshToken(refreshToken: string) {
    const refreshSecret = this.getRefreshSecret();
    const audience = this.getJwtAudience();
    const issuer = this.getJwtIssuer();
    return jwt.verify(refreshToken, refreshSecret, { audience, issuer }) as jwt.JwtPayload & {
      sub: number | string;
      jti?: string;
      email?: string;
    };
  }

  decodeRefresh(refreshToken: string) {
    try {
      return this.verifyRefreshToken(refreshToken);
    } catch {
      return null;
    }
  }

  async issueAndStoreNewTokens(userId: number, email?: string) {
    const { accessToken, refreshToken, refreshJti, accessTtlSec } = this.generateTokens(userId, email);
    try {
      if (this.redis && this.redis.isEnabled()) {
        const key = this.buildRefreshKey(userId, refreshJti);
        await this.redis.set(key, '1', this.getRefreshTtlSec());
      }
    } catch {}
    return { accessToken, refreshToken, accessTtlSec } as const;
  }

  buildRefreshKey(userId: number, jti: string): string {
    return `auth:refresh:${userId}:${jti}`;
  }
}



