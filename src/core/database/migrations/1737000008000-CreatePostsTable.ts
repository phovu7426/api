import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePostsTable1737000008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
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
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'excerpt',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'longtext',
          },
          {
            name: 'image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'cover_image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'primary_postcategory_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'scheduled', 'published', 'archived'],
            default: "'draft'",
          },
          {
            name: 'post_type',
            type: 'enum',
            enum: ['text', 'video', 'image', 'audio'],
            default: "'text'",
            isNullable: false,
          },
          {
            name: 'video_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'audio_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'is_featured',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_pinned',
            type: 'boolean',
            default: false,
          },
          {
            name: 'published_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'view_count',
            type: 'bigint',
            unsigned: true,
            default: 0,
          },
          {
            name: 'meta_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'meta_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'canonical_url',
            type: 'varchar',
            length: '255',
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
            length: '255',
            isNullable: true,
          },
          {
            name: 'group_id',
            type: 'bigint',
            unsigned: true,
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
      'posts',
      new TableIndex({
        name: 'idx_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_primary_postcategory_id',
        columnNames: ['primary_postcategory_id'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_post_type',
        columnNames: ['post_type'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_is_featured',
        columnNames: ['is_featured'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_is_pinned',
        columnNames: ['is_pinned'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_published_at',
        columnNames: ['published_at'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_view_count',
        columnNames: ['view_count'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_status_published_at',
        columnNames: ['status', 'published_at'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_is_featured_status',
        columnNames: ['is_featured', 'status'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_primary_category_status',
        columnNames: ['primary_postcategory_id', 'status'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'idx_posts_group_id',
        columnNames: ['group_id'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_posts_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_posts_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        columnNames: ['primary_postcategory_id'],
        referencedTableName: 'postcategory',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts', true);
  }
}







