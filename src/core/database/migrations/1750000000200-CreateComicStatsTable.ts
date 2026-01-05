import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateComicStatsTable1750000000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comic_stats',
        columns: [
          {
            name: 'comic_id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
          },
          {
            name: 'view_count',
            type: 'bigint',
            unsigned: true,
            default: 0,
          },
          {
            name: 'follow_count',
            type: 'bigint',
            unsigned: true,
            default: 0,
          },
          {
            name: 'rating_count',
            type: 'bigint',
            unsigned: true,
            default: 0,
          },
          {
            name: 'rating_sum',
            type: 'bigint',
            unsigned: true,
            default: 0,
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
      'comic_stats',
      new TableIndex({
        name: 'idx_view_count',
        columnNames: ['view_count'],
      }),
    );
    await queryRunner.createIndex(
      'comic_stats',
      new TableIndex({
        name: 'idx_follow_count',
        columnNames: ['follow_count'],
      }),
    );
    await queryRunner.createIndex(
      'comic_stats',
      new TableIndex({
        name: 'idx_updated_at',
        columnNames: ['updated_at'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'comic_stats',
      new TableForeignKey({
        columnNames: ['comic_id'],
        referencedTableName: 'comics',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comic_stats', true);
  }
}



