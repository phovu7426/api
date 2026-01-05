import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRoleHasPermissionsTable1737000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create role_has_permissions table
    await queryRunner.createTable(
      new Table({
        name: 'role_has_permissions',
        columns: [
          {
            name: 'role_id',
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

    // Create role_has_permissions primary key
    await queryRunner.createPrimaryKey('role_has_permissions', ['role_id', 'permission_id']);

    // Create role_has_permissions foreign keys
    await queryRunner.createForeignKey(
      'role_has_permissions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'role_has_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('role_has_permissions', true);
  }
}


