import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateComicReviewsTable1750000000900 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comic_reviews',
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
            name: 'rating',
            type: 'tinyint',
            unsigned: true,
          },
          {
            name: 'content',
            type: 'text',
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
      'comic_reviews',
      new TableIndex({
        name: 'idx_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'comic_reviews',
      new TableIndex({
        name: 'idx_comic_id',
        columnNames: ['comic_id'],
      }),
    );
    await queryRunner.createIndex(
      'comic_reviews',
      new TableIndex({
        name: 'idx_user_comic',
        columnNames: ['user_id', 'comic_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'comic_reviews',
      new TableIndex({
        name: 'idx_rating',
        columnNames: ['rating'],
      }),
    );
    await queryRunner.createIndex(
      'comic_reviews',
      new TableIndex({
        name: 'idx_created_at',
        columnNames: ['created_at'],
      }),
    );
    await queryRunner.createIndex(
      'comic_reviews',
      new TableIndex({
        name: 'idx_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'comic_reviews',
      new TableIndex({
        name: 'idx_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'comic_reviews',
      new TableIndex({
        name: 'idx_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'comic_reviews',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'comic_reviews',
      new TableForeignKey({
        columnNames: ['comic_id'],
        referencedTableName: 'comics',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'comic_reviews',
      new TableForeignKey({
        columnNames: ['created_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'comic_reviews',
      new TableForeignKey({
        columnNames: ['updated_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comic_reviews', true);
  }
}



