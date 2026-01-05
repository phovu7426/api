import { Module } from '@nestjs/common';
import { BannerService } from '@/modules/banner/admin/banner/services/banner.service';
import { BannerController } from '@/modules/banner/admin/banner/controllers/banner.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
    imports: [
        RbacModule,
    ],
    controllers: [BannerController],
    providers: [BannerService],
    exports: [BannerService],
})
export class AdminBannerModule { }