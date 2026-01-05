import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUserPermissionsTable1737000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_permissions table
    await queryRunner.createTable(
      new Table({
        name: 'user_permissions',
        columns: [
          {
            name: 'user_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'permission_id',
            type: 'bigint',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    // Create user_permissions primary key
    await queryRunner.createPrimaryKey('user_permissions', ['user_id', 'permission_id']);

    // Create user_permissions indexes
    await queryRunner.createIndex(
      'user_permissions',
      new TableIndex({
        name: 'IDX_user_permissions_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'user_permissions',
      new TableIndex({
        name: 'IDX_user_permissions_permission_id',
        columnNames: ['permission_id'],
      }),
    );

    // Create user_permissions foreign keys
    await queryRunner.createForeignKey(
      'user_permissions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'user_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_permissions', true);
  }
}

