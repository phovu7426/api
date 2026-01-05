import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '@/common/validators/match.decorator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  password: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống.' })
  @IsString()
  @Match('password', { message: 'Xác nhận mật khẩu không khớp.' })
  password_confirmation: string;
}


