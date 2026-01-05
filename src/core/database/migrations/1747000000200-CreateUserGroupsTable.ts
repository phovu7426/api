import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Migration: Tạo bảng user_groups
 */
export class CreateUserGroupsTable1747000000200 implements MigrationInterface {
  private readonly logger = new Logger(CreateUserGroupsTable1747000000200.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng user_groups
    await queryRunner.createTable(
      new Table({
        name: 'user_groups',
        columns: [
          {
            name: 'user_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'group_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'joined_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Primary key
    await queryRunner.createPrimaryKey('user_groups', ['user_id', 'group_id']);

    // Indexes
    await queryRunner.createIndex(
      'user_groups',
      new TableIndex({
        name: 'IDX_user_groups_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_groups',
      new TableIndex({
        name: 'IDX_user_groups_group_id',
        columnNames: ['group_id'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'user_groups',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_groups',
      new TableForeignKey({
        columnNames: ['group_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'groups',
        onDelete: 'CASCADE',
      }),
    );

    // Migrate dữ liệu: Tạo user_groups từ user_context_roles
    // Logic: Với mỗi user có role trong context, tìm group tương ứng
    // Nếu context.ref_id = group.id → user thuộc group đó
    await queryRunner.query(`
      INSERT INTO user_groups (user_id, group_id, joined_at)
      SELECT DISTINCT
        ucr.user_id,
        g.id AS group_id,
        NOW() AS joined_at
      FROM user_context_roles ucr
      INNER JOIN contexts c ON c.id = ucr.context_id
      INNER JOIN groups g ON g.id = c.ref_id AND g.type = c.type
      WHERE c.type != 'system'  -- Bỏ qua system context
      AND NOT EXISTS (
        SELECT 1 FROM user_groups ug
        WHERE ug.user_id = ucr.user_id AND ug.group_id = g.id
      )
    `);

    // Tạo SYSTEM_ADMIN group cho system context
    await queryRunner.query(`
      INSERT INTO groups (type, code, name, status, context_id, created_at, updated_at)
      SELECT 
        'system',
        'SYSTEM_ADMIN',
        'System Administrators',
        'active',
        1,  -- System context id
        NOW(),
        NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM groups WHERE code = 'SYSTEM_ADMIN'
      )
    `);

    // Gán admin users vào SYSTEM_ADMIN group
    await queryRunner.query(`
      INSERT INTO user_groups (user_id, group_id, joined_at)
      SELECT DISTINCT
        ucr.user_id,
        (SELECT id FROM groups WHERE code = 'SYSTEM_ADMIN' LIMIT 1) AS group_id,
        NOW() AS joined_at
      FROM user_context_roles ucr
      INNER JOIN contexts c ON c.id = ucr.context_id
      INNER JOIN roles r ON r.id = ucr.role_id
      WHERE c.type = 'system'
      AND (r.code = 'admin' OR r.code = 'system_admin')
      AND NOT EXISTS (
        SELECT 1 FROM user_groups ug
        WHERE ug.user_id = ucr.user_id 
        AND ug.group_id = (SELECT id FROM groups WHERE code = 'SYSTEM_ADMIN' LIMIT 1)
      )
    `);

    this.logger.log('Created user_groups table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_groups', true);
    this.logger.log('Dropped user_groups table');
  }
}

