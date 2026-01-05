import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateReadingHistoriesTable1750000000600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reading_histories',
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
            isNullable: false,
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
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'reading_histories',
      new TableIndex({
        name: 'idx_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'reading_histories',
      new TableIndex({
        name: 'idx_comic_id',
        columnNames: ['comic_id'],
      }),
    );
    await queryRunner.createIndex(
      'reading_histories',
      new TableIndex({
        name: 'idx_user_comic',
        columnNames: ['user_id', 'comic_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'reading_histories',
      new TableIndex({
        name: 'idx_updated_at',
        columnNames: ['updated_at'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'reading_histories',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'reading_histories',
      new TableForeignKey({
        columnNames: ['comic_id'],
        referencedTableName: 'comics',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'reading_histories',
      new TableForeignKey({
        columnNames: ['chapter_id'],
        referencedTableName: 'chapters',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reading_histories', true);
  }
}



