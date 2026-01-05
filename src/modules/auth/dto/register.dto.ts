import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from '@/common/validators/match.decorator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống.' })
  @IsString()
  @MaxLength(255, { message: 'Họ tên không được vượt quá 255 ký tự.' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @IsNotEmpty({ message: 'Email không được để trống.' })
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
  password: string;

  @IsString()
  @Match('password', { message: 'Xác nhận mật khẩu không khớp.' })
  confirmPassword: string;
}


