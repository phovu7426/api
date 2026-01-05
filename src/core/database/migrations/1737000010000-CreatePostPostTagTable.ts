import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePostPostTagTable1737000010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_posttag',
        columns: [
          {
            name: 'post_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'posttag_id',
            type: 'bigint',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    // Create primary key
    await queryRunner.createPrimaryKey('post_posttag', ['post_id', 'posttag_id']);

    // Create foreign keys
    await queryRunner.createForeignKey(
      'post_posttag',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedTableName: 'posts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'post_posttag',
      new TableForeignKey({
        columnNames: ['posttag_id'],
        referencedTableName: 'posttag',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('post_posttag', true);
  }
}







