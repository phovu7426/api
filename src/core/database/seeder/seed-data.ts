import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { SeedRoles } from '@/core/database/seeder/seed-roles';
import { SeedPermissions } from '@/core/database/seeder/seed-permissions';
import { SeedUsers } from '@/core/database/seeder/seed-users';
import { SeedPostCategories } from '@/core/database/seeder/seed-post-categories';
import { SeedPostTags } from '@/core/database/seeder/seed-post-tags';
import { SeedPosts } from '@/core/database/seeder/seed-posts';
// import { SeedShippingMethods } from '@/core/database/seeder/seed-shipping-methods'; // Commented out vì shipping-method đã bị xóa
// import { SeedWarehouses } from '@/core/database/seeder/seed-warehouses';
import { SeedMenus } from '@/core/database/seeder/seed-menus';
import { SeedBannerLocations } from '@/core/database/seeder/seed-banner-locations';
import { SeedBanners } from '@/core/database/seeder/seed-banners';
import { SeedContacts } from '@/core/database/seeder/seed-contacts';
import { SeedGeneralConfigs } from '@/core/database/seeder/seed-general-configs';
import { SeedEmailConfigs } from '@/core/database/seeder/seed-email-configs';
import { SeedGroups } from '@/core/database/seeder/seed-groups';
import { SeedComicCategories } from '@/core/database/seeder/seed-comic-categories';
import { SeedComics } from '@/core/database/seeder/seed-comics';
import { SeedChapters } from '@/core/database/seeder/seed-chapters';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly seedPermissions: SeedPermissions,
    private readonly seedRoles: SeedRoles,
    private readonly seedUsers: SeedUsers,
    private readonly seedPostCategories: SeedPostCategories,
    private readonly seedPostTags: SeedPostTags,
    private readonly seedPosts: SeedPosts,
    // private readonly seedShippingMethods: SeedShippingMethods, // Commented out vì shipping-method đã bị xóa
    // private readonly seedWarehouses: SeedWarehouses,
    private readonly seedMenus: SeedMenus,
    private readonly seedBannerLocations: SeedBannerLocations,
    private readonly seedBanners: SeedBanners,
    private readonly seedContacts: SeedContacts,
    private readonly seedGeneralConfigs: SeedGeneralConfigs,
    private readonly seedEmailConfigs: SeedEmailConfigs,
    private readonly seedGroups: SeedGroups,
    private readonly seedComicCategories: SeedComicCategories,
    private readonly seedComics: SeedComics,
    private readonly seedChapters: SeedChapters,
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

      // comics demo
      await this.seedComicCategories.seed();
      await this.seedComics.seed();
      await this.seedChapters.seed();

      // ecommerce demo (gắn với group/context nếu có)
      // await this.seedWarehouses.seed(); // Commented out vì liên quan đến product
      // await this.seedShippingMethods.seed(); // Commented out vì shipping-method đã bị xóa
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
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Disable foreign key checks temporarily
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

        // Helper function to safely truncate table
        const truncateTable = async (tableName: string) => {
          try {
            await queryRunner.query(`TRUNCATE TABLE \`${tableName}\``);
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
        await truncateTable('comic_category');
        await truncateTable('user_role_assignments');
        await truncateTable('user_groups');
        await truncateTable('role_has_permissions');

        // Clear main tables
        await truncateTable('posts');
        await truncateTable('post_posttag');
        await truncateTable('post_postcategory');
        await truncateTable('posttag');
        await truncateTable('postcategory');
        
        // Clear comics tables
        await truncateTable('chapter_pages');
        await truncateTable('chapters');
        await truncateTable('comic_stats');
        await truncateTable('comics');
        await truncateTable('comic_categories');

        // ecommerce junctions first
        await truncateTable('product_category');
        await truncateTable('product_variant_attributes');
        await truncateTable('stock_transfers');
        await truncateTable('warehouse_inventory');
        await truncateTable('warehouses');

        // ecommerce main tables
        await truncateTable('order_items');
        await truncateTable('payments');
        await truncateTable('orders');
        await truncateTable('shipping_methods');
        await truncateTable('carts');
        await truncateTable('cart_headers');
        await truncateTable('product_attribute_values');
        await truncateTable('product_attributes');
        await truncateTable('product_variants');
        await truncateTable('products');
        await truncateTable('product_categories');
        await truncateTable('profiles');
        await truncateTable('users');
        await truncateTable('roles');
        await truncateTable('permissions');

        // Banner tables
        await truncateTable('banners');
        await truncateTable('banner_locations');

        // Contact tables
        await truncateTable('contacts');

        // Re-enable foreign key checks
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

        await queryRunner.commitTransaction();
        this.logger.log('Database cleared successfully');
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Database clearing failed', error);
      throw error;
    }
  }

  async clearDatabase(): Promise<void> {
    this.logger.log('Clearing database...');

    const entities = this.dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.clear();
    }

    this.logger.log('Database cleared successfully');
  }
}
