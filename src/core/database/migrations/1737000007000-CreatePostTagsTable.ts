import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePostTagsTable1737000007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posttag',
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
      'posttag',
      new TableIndex({
        name: 'idx_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'posttag',
      new TableIndex({
        name: 'idx_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'posttag',
      new TableIndex({
        name: 'idx_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'posttag',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
    await queryRunner.createIndex(
      'posttag',
      new TableIndex({
        name: 'idx_status_created_at',
        columnNames: ['status', 'created_at'],
      }),
    );
    await queryRunner.createIndex(
      'posttag',
      new TableIndex({
        name: 'IDX_posttag_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'posttag',
      new TableIndex({
        name: 'IDX_posttag_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posttag', true);
  }
}







