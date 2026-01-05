import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateChapterPagesTable1750000000500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chapter_pages',
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
            name: 'chapter_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'page_number',
            type: 'int',
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'width',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'height',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'file_size',
            type: 'bigint',
            unsigned: true,
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
      'chapter_pages',
      new TableIndex({
        name: 'idx_chapter_id',
        columnNames: ['chapter_id'],
      }),
    );
    await queryRunner.createIndex(
      'chapter_pages',
      new TableIndex({
        name: 'idx_chapter_page',
        columnNames: ['chapter_id', 'page_number'],
      }),
    );
    await queryRunner.createIndex(
      'chapter_pages',
      new TableIndex({
        name: 'idx_chapter_page_unique',
        columnNames: ['chapter_id', 'page_number'],
        isUnique: true,
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'chapter_pages',
      new TableForeignKey({
        columnNames: ['chapter_id'],
        referencedTableName: 'chapters',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chapter_pages', true);
  }
}



