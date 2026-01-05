import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBookmarksTable1750000000700 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookmarks',
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
            name: 'user_id',
            type: 'bigint',
            unsigned: true,
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
            name: 'page_number',
            type: 'int',
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
      'bookmarks',
      new TableIndex({
        name: 'idx_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'bookmarks',
      new TableIndex({
        name: 'idx_comic_id',
        columnNames: ['comic_id'],
      }),
    );
    await queryRunner.createIndex(
      'bookmarks',
      new TableIndex({
        name: 'idx_chapter_id',
        columnNames: ['chapter_id'],
      }),
    );
    await queryRunner.createIndex(
      'bookmarks',
      new TableIndex({
        name: 'idx_user_comic_chapter',
        columnNames: ['user_id', 'comic_id', 'chapter_id'],
        isUnique: true,
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'bookmarks',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'bookmarks',
      new TableForeignKey({
        columnNames: ['comic_id'],
        referencedTableName: 'comics',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'bookmarks',
      new TableForeignKey({
        columnNames: ['chapter_id'],
        referencedTableName: 'chapters',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bookmarks', true);
  }
}



