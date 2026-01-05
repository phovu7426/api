import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') as string,
      issuer: configService.get<string>('jwt.issuer'),
      audience: configService.get<string>('jwt.audience'),
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;
    
    // Load thông tin user cơ bản
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(Number(userId)) },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        status: true,
        email_verified_at: true,
        phone_verified_at: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) return null;

    // Trả về thông tin user
    return {
      id: Number(user.id),
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      email_verified_at: user.email_verified_at,
      phone_verified_at: user.phone_verified_at,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
