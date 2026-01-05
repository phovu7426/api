import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from '@/modules/auth/services/auth.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { RefreshTokenDto } from '@/modules/auth/dto/refresh-token.dto';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { Auth } from '@/common/utils/auth.util';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @LogRequest({ fileBaseName: 'auth_login' })
  @Permission('public')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    if (result?.token) {
      const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
      res.cookie('auth_token', result.token, { maxAge: 60 * 60 * 1000, httpOnly: false, secure: false, domain, path: '/' });
    }
    return result;
  }

  @LogRequest({ fileBaseName: 'auth_register' })
  @Permission('public')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @LogRequest({ fileBaseName: 'auth_logout' })
  @Permission('public')
  @Post('logout')
  async logout(@Headers('authorization') authHeader: string, @Res({ passthrough: true }) res: Response) {
    const userId = Auth.id(undefined) as number;
    // Extract token from authorization header
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    await this.authService.logout(userId, token || undefined);
    const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
    res.clearCookie('auth_token', { domain, path: '/' });
    return null;
  }

  @LogRequest({ fileBaseName: 'auth_refresh' })
  @Permission('public')
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshTokenByValue(dto.refreshToken);

    if (result?.token) {
      const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
      res.cookie('auth_token', result.token, { maxAge: 60 * 60 * 1000, httpOnly: false, secure: false, domain, path: '/' });
    }
    return result;
  }

  @LogRequest({ fileBaseName: 'auth_forgot_password' })
  @Permission('public')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute (more restrictive for password reset)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @LogRequest({ fileBaseName: 'auth_reset_password' })
  @Permission('public')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute (more restrictive for password reset)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
