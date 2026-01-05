import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateChaptersTable1750000000400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chapters',
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
            name: 'comic_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'team_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'chapter_index',
            type: 'int',
          },
          {
            name: 'chapter_label',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published'],
            default: "'draft'",
          },
          {
            name: 'view_count',
            type: 'bigint',
            unsigned: true,
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
      'chapters',
      new TableIndex({
        name: 'idx_comic_id',
        columnNames: ['comic_id'],
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_comic_chapter_index',
        columnNames: ['comic_id', 'chapter_index'],
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_comic_chapter_unique',
        columnNames: ['comic_id', 'chapter_index'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_team_id',
        columnNames: ['team_id'],
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_view_count',
        columnNames: ['view_count'],
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'chapters',
      new TableIndex({
        name: 'idx_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'chapters',
      new TableForeignKey({
        columnNames: ['comic_id'],
        referencedTableName: 'comics',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'chapters',
      new TableForeignKey({
        columnNames: ['team_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'chapters',
      new TableForeignKey({
        columnNames: ['created_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'chapters',
      new TableForeignKey({
        columnNames: ['updated_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chapters', true);
  }
}



