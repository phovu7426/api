import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateComicViewsTable1750000001100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comic_views',
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
            name: 'chapter_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'comic_views',
      new TableIndex({
        name: 'idx_comic_id',
        columnNames: ['comic_id'],
      }),
    );
    await queryRunner.createIndex(
      'comic_views',
      new TableIndex({
        name: 'idx_chapter_id',
        columnNames: ['chapter_id'],
      }),
    );
    await queryRunner.createIndex(
      'comic_views',
      new TableIndex({
        name: 'idx_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'comic_views',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
    await queryRunner.createIndex(
      'comic_views',
      new TableIndex({
        name: 'idx_comic_created',
        columnNames: ['comic_id', 'created_at'],
      }),
    );
    await queryRunner.createIndex(
      'comic_views',
      new TableIndex({
        name: 'idx_chapter_created',
        columnNames: ['chapter_id', 'created_at'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'comic_views',
      new TableForeignKey({
        columnNames: ['comic_id'],
        referencedTableName: 'comics',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'comic_views',
      new TableForeignKey({
        columnNames: ['chapter_id'],
        referencedTableName: 'chapters',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'comic_views',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comic_views', true);
  }
}



