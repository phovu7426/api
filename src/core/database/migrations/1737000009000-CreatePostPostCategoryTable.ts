import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePostPostCategoryTable1737000009000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_postcategory',
        columns: [
          {
            name: 'post_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'postcategory_id',
            type: 'bigint',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    // Create primary key
    await queryRunner.createPrimaryKey('post_postcategory', ['post_id', 'postcategory_id']);

    // Create foreign keys
    await queryRunner.createForeignKey(
      'post_postcategory',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedTableName: 'posts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'post_postcategory',
      new TableForeignKey({
        columnNames: ['postcategory_id'],
        referencedTableName: 'postcategory',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('post_postcategory', true);
  }
}







