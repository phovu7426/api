import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { SeedRoles } from '@/core/database/seeder/seed-roles';
import { SeedPermissions } from '@/core/database/seeder/seed-permissions';
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

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly seedPermissions: SeedPermissions,
    private readonly seedRoles: SeedRoles,
    private readonly seedUsers: SeedUsers,
    private readonly seedPostCategories: SeedPostCategories,
    private readonly seedPostTags: SeedPostTags,
    private readonly seedPosts: SeedPosts,
    private readonly seedMenus: SeedMenus,
    private readonly seedBannerLocations: SeedBannerLocations,
    private readonly seedBanners: SeedBanners,
    private readonly seedContacts: SeedContacts,
    private readonly seedGeneralConfigs: SeedGeneralConfigs,
    private readonly seedEmailConfigs: SeedEmailConfigs,
    private readonly seedGroups: SeedGroups,
  ) { }

  async seedAll(): Promise<void> {
    this.logger.log('Starting database seeding...');

    try {
      // Seed in order:
      // permissions -> roles -> users -> groups (contexts)
      await this.seedPermissions.seed();
      await this.seedRoles.seed();
      await this.seedUsers.seed();
      await this.seedGroups.seed();

      // blog demo
      await this.seedPostCategories.seed();
      await this.seedPostTags.seed();
      await this.seedPosts.seed();

      // ecommerce demo (gắn với group/context nếu có)
      await this.seedMenus.seed();

      // Banner system
      await this.seedBannerLocations.seed();
      await this.seedBanners.seed();

      // Contact system
      await this.seedContacts.seed();

      // System config
      await this.seedGeneralConfigs.seed();
      await this.seedEmailConfigs.seed();

      // Groups and contexts (sau khi có users và system context)
      await this.seedGroups.seed();

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    this.logger.log('Clearing database...');

    try {
      // Disable foreign key checks temporarily
      await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;

      // Helper function to safely truncate table
      const truncateTable = async (tableName: string) => {
        try {
          await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\``);
        } catch (error: any) {
          // If table doesn't exist, just log and continue
          if (error.code === 'ER_NO_SUCH_TABLE') {
            this.logger.warn(`Table ${tableName} does not exist, skipping...`);
          } else {
            throw error;
          }
        }
      };

      // Clear in reverse order (children first, then parents)
      // Clear junction tables first (many-to-many)
      await truncateTable('post_posttag');
      await truncateTable('post_postcategory');
      await truncateTable('user_role_assignments');
      await truncateTable('user_groups');
      await truncateTable('role_has_permissions');
      await truncateTable('role_contexts');

      // Clear main tables
      await truncateTable('posts');
      await truncateTable('posttag');
      await truncateTable('postcategory');
      await truncateTable('notifications');
      await truncateTable('contacts');
      await truncateTable('banners');
      await truncateTable('banner_locations');
      await truncateTable('menus');
      await truncateTable('email_configs');
      await truncateTable('general_configs');
      await truncateTable('profiles');
      await truncateTable('users');
      await truncateTable('roles');
      await truncateTable('permissions');
      await truncateTable('groups');
      await truncateTable('contexts');

      // Re-enable foreign key checks
      await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;

      this.logger.log('Database cleared successfully');
    } catch (error) {
      this.logger.error('Database clearing failed', error);
      throw error;
    }
  }
}
