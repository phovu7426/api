import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Migration: Tạo bảng user_role_assignments
 */
export class CreateUserRoleAssignmentsTable1747000000300 implements MigrationInterface {
  private readonly logger = new Logger(CreateUserRoleAssignmentsTable1747000000300.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng user_role_assignments
    await queryRunner.createTable(
      new Table({
        name: 'user_role_assignments',
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
            name: 'role_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'group_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Unique constraint
    await queryRunner.createIndex(
      'user_role_assignments',
      new TableIndex({
        name: 'UQ_user_role_assignments',
        columnNames: ['user_id', 'role_id', 'group_id'],
        isUnique: true,
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'user_role_assignments',
      new TableIndex({
        name: 'IDX_user_role_assignments_user_group',
        columnNames: ['user_id', 'group_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_role_assignments',
      new TableIndex({
        name: 'IDX_user_role_assignments_group_id',
        columnNames: ['group_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_role_assignments',
      new TableIndex({
        name: 'IDX_user_role_assignments_role_id',
        columnNames: ['role_id'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'user_role_assignments',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_role_assignments',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_role_assignments',
      new TableForeignKey({
        columnNames: ['group_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'groups',
        onDelete: 'CASCADE',
      }),
    );

    // Migrate dữ liệu: Tạo user_role_assignments từ user_context_roles
    // Logic: Với mỗi user có role trong context, tìm group tương ứng
    await queryRunner.query(`
      INSERT INTO user_role_assignments (user_id, role_id, group_id, created_at)
      SELECT 
        ucr.user_id,
        ucr.role_id,
        g.id AS group_id,
        NOW() AS created_at
      FROM user_context_roles ucr
      INNER JOIN contexts c ON c.id = ucr.context_id
      INNER JOIN groups g ON g.id = c.ref_id AND g.type = c.type
      WHERE c.type != 'system'
      AND NOT EXISTS (
        SELECT 1 FROM user_role_assignments ura
        WHERE ura.user_id = ucr.user_id 
        AND ura.role_id = ucr.role_id 
        AND ura.group_id = g.id
      )
    `);

    // Migrate system context roles vào SYSTEM_ADMIN group
    await queryRunner.query(`
      INSERT INTO user_role_assignments (user_id, role_id, group_id, created_at)
      SELECT 
        ucr.user_id,
        ucr.role_id,
        (SELECT id FROM groups WHERE code = 'SYSTEM_ADMIN' LIMIT 1) AS group_id,
        NOW() AS created_at
      FROM user_context_roles ucr
      INNER JOIN contexts c ON c.id = ucr.context_id
      WHERE c.type = 'system'
      AND NOT EXISTS (
        SELECT 1 FROM user_role_assignments ura
        WHERE ura.user_id = ucr.user_id 
        AND ura.role_id = ucr.role_id 
        AND ura.group_id = (SELECT id FROM groups WHERE code = 'SYSTEM_ADMIN' LIMIT 1)
      )
    `);

    this.logger.log('Created user_role_assignments table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_role_assignments', true);
    this.logger.log('Dropped user_role_assignments table');
  }
}

