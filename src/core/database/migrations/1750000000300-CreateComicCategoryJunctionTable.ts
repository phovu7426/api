import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateComicCategoryJunctionTable1750000000300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comic_category',
        columns: [
          {
            name: 'comic_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'comic_category_id',
            type: 'bigint',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    // Create composite primary key
    await queryRunner.createPrimaryKey('comic_category', ['comic_id', 'comic_category_id']);

    // Create indexes
    await queryRunner.createIndex(
      'comic_category',
      new TableIndex({
        name: 'idx_comic_category_id',
        columnNames: ['comic_category_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'comic_category',
      new TableForeignKey({
        columnNames: ['comic_id'],
        referencedTableName: 'comics',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'comic_category',
      new TableForeignKey({
        columnNames: ['comic_category_id'],
        referencedTableName: 'comic_categories',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comic_category', true);
  }
}



