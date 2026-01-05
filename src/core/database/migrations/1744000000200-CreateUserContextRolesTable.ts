import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUserContextRolesTable1744000000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_context_roles table
    await queryRunner.createTable(
      new Table({
        name: 'user_context_roles',
        columns: [
          {
            name: 'user_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'context_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'role_id',
            type: 'bigint',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    // Create user_context_roles primary key
    await queryRunner.createPrimaryKey('user_context_roles', ['user_id', 'context_id', 'role_id']);

    // Create user_context_roles indexes
    await queryRunner.createIndex(
      'user_context_roles',
      new TableIndex({
        name: 'IDX_user_context_roles_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'user_context_roles',
      new TableIndex({
        name: 'IDX_user_context_roles_context_id',
        columnNames: ['context_id'],
      }),
    );
    await queryRunner.createIndex(
      'user_context_roles',
      new TableIndex({
        name: 'IDX_user_context_roles_role_id',
        columnNames: ['role_id'],
      }),
    );
    await queryRunner.createIndex(
      'user_context_roles',
      new TableIndex({
        name: 'IDX_user_context_roles_user_context',
        columnNames: ['user_id', 'context_id'],
      }),
    );

    // Create user_context_roles foreign keys
    await queryRunner.createForeignKey(
      'user_context_roles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'user_context_roles',
      new TableForeignKey({
        columnNames: ['context_id'],
        referencedTableName: 'contexts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'user_context_roles',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Migrate dữ liệu từ user_roles → user_context_roles (tất cả vào system context id=1)
    await queryRunner.query(`
      INSERT INTO user_context_roles (user_id, context_id, role_id)
      SELECT user_id, 1, role_id 
      FROM user_roles;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: migrate lại về user_roles (chỉ lấy từ system context)
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT user_id, role_id 
      FROM user_context_roles 
      WHERE context_id = 1
      ON DUPLICATE KEY UPDATE user_id = user_id;
    `);

    await queryRunner.dropTable('user_context_roles', true);
  }
}

