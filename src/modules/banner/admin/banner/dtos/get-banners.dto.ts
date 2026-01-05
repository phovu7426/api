import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class GetBannersDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    search?: string;

    @IsOptional()
    status?: BasicStatus;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    location_id?: number;
}