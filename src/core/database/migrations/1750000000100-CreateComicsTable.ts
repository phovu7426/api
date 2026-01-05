import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateComicsTable1750000000100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comics',
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
            name: 'slug',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'cover_image',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'author',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published', 'completed', 'hidden'],
            default: "'draft'",
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
      'comics',
      new TableIndex({
        name: 'idx_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'comics',
      new TableIndex({
        name: 'idx_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'comics',
      new TableIndex({
        name: 'idx_author',
        columnNames: ['author'],
      }),
    );
    await queryRunner.createIndex(
      'comics',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
    await queryRunner.createIndex(
      'comics',
      new TableIndex({
        name: 'idx_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'comics',
      new TableIndex({
        name: 'idx_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'comics',
      new TableIndex({
        name: 'idx_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'comics',
      new TableForeignKey({
        columnNames: ['created_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'comics',
      new TableForeignKey({
        columnNames: ['updated_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comics', true);
  }
}



