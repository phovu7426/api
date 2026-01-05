import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class CreateBannerLocationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    code: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    status?: BasicStatus = BasicStatus.Active;
}