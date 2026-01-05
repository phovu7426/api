import { Module } from '@nestjs/common';
import { SeedService } from '@/core/database/seeder/seed-data';
import { SeedPermissions } from '@/core/database/seeder/seed-permissions';
import { SeedRoles } from '@/core/database/seeder/seed-roles';
import { SeedUsers } from '@/core/database/seeder/seed-users';
import { SeedPostCategories } from '@/core/database/seeder/seed-post-categories';
import { SeedPostTags } from '@/core/database/seeder/seed-post-tags';
import { SeedPosts } from '@/core/database/seeder/seed-posts';
import { SeedMenus } from '@/core/database/seeder/seed-menus';
import { SeedBannerLocations } from '@/core/database/seeder/seed-banner-locations';
import { SeedBanners } from '@/core/database/seeder/seed-banners';
import { SeedContacts } from '@/core/database/seeder/seed-contacts';
import { SeedGeneralConfigs } from '@/core/database/seeder/seed-general-configs';
import { SeedEmailConfigs } from '@/core/database/seeder/seed-email-configs';
import { SeedGroups } from '@/core/database/seeder/seed-groups';

@Module({
  imports: [],
  providers: [
    SeedService,
    SeedPermissions,
    SeedRoles,
    SeedUsers,
    SeedPostCategories,
    SeedPostTags,
    SeedPosts,
    SeedMenus,
    SeedBannerLocations,
    SeedBanners,
    SeedContacts,
    SeedGeneralConfigs,
    SeedEmailConfigs,
    SeedGroups,
  ],
  exports: [
    SeedService,
  ],
})
export class DatabaseModule { }
