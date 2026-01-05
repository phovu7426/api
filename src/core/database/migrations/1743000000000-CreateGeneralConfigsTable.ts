import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateGeneralConfigsTable1743000000000 implements MigrationInterface {
  name = 'CreateGeneralConfigsTable1743000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'general_configs',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'site_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'site_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'site_logo',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'site_favicon',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'site_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'site_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'site_address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'site_copyright',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
            default: "'Asia/Ho_Chi_Minh'",
          },
          {
            name: 'locale',
            type: 'varchar',
            length: '10',
            default: "'vi'",
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '10',
            default: "'VND'",
          },
          {
            name: 'contact_channels',
            type: 'json',
            isNullable: true,
          },
          // SEO fields
          {
            name: 'meta_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'meta_keywords',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'og_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'og_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'og_image',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'canonical_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'google_analytics_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'google_search_console',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'facebook_pixel_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'twitter_site',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'created_user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'updated_user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'general_configs',
      new TableIndex({
        name: 'idx_general_configs_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('general_configs');
  }
}
