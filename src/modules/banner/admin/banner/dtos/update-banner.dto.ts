import { IsString, IsOptional, IsUrl, MaxLength, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BannerLinkTarget } from '@/shared/entities/banner.entity';

export class UpdateBannerDto {
    @IsString()
    @IsOptional()
    @MaxLength(255)
    title?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    subtitle?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    image?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    mobile_image?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    link?: string;

    @IsOptional()
    @IsEnum(BannerLinkTarget)
    link_target?: BannerLinkTarget;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    button_text?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    button_color?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    text_color?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    location_id?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    sort_order?: number;

    @IsOptional()
    status?: BasicStatus;

    @IsOptional()
    @Type(() => Date)
    start_date?: Date;

    @IsOptional()
    @Type(() => Date)
    end_date?: Date;
}