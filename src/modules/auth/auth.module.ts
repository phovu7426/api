import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '@/modules/auth/services/auth.service';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { User } from '@/shared/entities/user.entity';
import { Profile } from '@/shared/entities/profile.entity';
import jwtConfig from '@/core/config/jwt.config';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { TokenService } from '@/modules/auth/services/token.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    ConfigModule.forFeature(jwtConfig),
    RbacModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          // jsonwebtoken@9 has stricter typings for expiresIn
          expiresIn: (configService.get<string>('jwt.expiresIn') || '60m') as any,
          issuer: configService.get<string>('jwt.issuer'),
          audience: configService.get<string>('jwt.audience'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule { }


