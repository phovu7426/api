import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePostCategoriesTable1737000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'postcategory',
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
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'parent_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
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
            name: 'og_image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
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
      'postcategory',
      new TableIndex({
        name: 'idx_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'idx_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'idx_parent_id',
        columnNames: ['parent_id'],
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'idx_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'idx_sort_order',
        columnNames: ['sort_order'],
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'idx_status_sort_order',
        columnNames: ['status', 'sort_order'],
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'idx_parent_status',
        columnNames: ['parent_id', 'status'],
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'IDX_postcategory_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'postcategory',
      new TableIndex({
        name: 'IDX_postcategory_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );

    // Create foreign key for parent_id
    await queryRunner.createForeignKey(
      'postcategory',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'postcategory',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('postcategory', true);
  }
}







