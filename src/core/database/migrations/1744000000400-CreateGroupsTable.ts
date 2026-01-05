import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Migration tạo bảng Groups - Tổng quát cho shop, team, project, department, v.v.
 */
export class CreateGroupsTable1744000000400 implements MigrationInterface {
  private readonly logger = new Logger(CreateGroupsTable1744000000400.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create groups table
    await queryRunner.createTable(
      new Table({
        name: 'groups',
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
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '30',
            default: "'active'",
          },
          {
            name: 'owner_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_user_id',
            type: 'bigint',
            isNullable: true,
            unsigned: true as any,
          },
          {
            name: 'updated_user_id',
            type: 'bigint',
            isNullable: true,
            unsigned: true as any,
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

    // Create groups indexes
    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'IDX_groups_type',
        columnNames: ['type'],
      }),
    );
    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'UQ_groups_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'UQ_groups_type_code',
        columnNames: ['type', 'code'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'IDX_groups_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'IDX_groups_owner_id',
        columnNames: ['owner_id'],
      }),
    );
    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'IDX_groups_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    this.logger.log('Created groups table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('groups', true);
    this.logger.log('Dropped groups table');
  }
}

