import { IsString, IsOptional, MaxLength } from 'class-validator';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class UpdateBannerLocationDto {
    @IsString()
    @IsOptional()
    @MaxLength(100)
    code?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    status?: BasicStatus;
}