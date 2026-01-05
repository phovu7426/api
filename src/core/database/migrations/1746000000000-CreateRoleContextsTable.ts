import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRoleContextsTable1746000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create role_contexts junction table
    await queryRunner.createTable(
      new Table({
        name: 'role_contexts',
        columns: [
          {
            name: 'role_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'context_id',
            type: 'bigint',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    // Create primary key
    await queryRunner.createPrimaryKey('role_contexts', ['role_id', 'context_id']);

    // Create indexes
    await queryRunner.createIndex(
      'role_contexts',
      new TableIndex({
        name: 'IDX_role_contexts_role_id',
        columnNames: ['role_id'],
      }),
    );

    await queryRunner.createIndex(
      'role_contexts',
      new TableIndex({
        name: 'IDX_role_contexts_context_id',
        columnNames: ['context_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'role_contexts',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_contexts',
      new TableForeignKey({
        columnNames: ['context_id'],
        referencedTableName: 'contexts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('role_contexts', true);
  }
}

