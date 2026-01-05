import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePermissionsTable1737000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permissions table
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
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
            name: 'code',
            type: 'varchar',
            length: '120',
          },
          {
            name: 'scope',
            type: 'varchar',
            length: '30',
            default: "'context'",
          },
          {
            name: 'name',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '30',
            default: "'active'",
          },
          {
            name: 'parent_id',
            type: 'bigint',
            unsigned: true,
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

    // Create permissions indexes
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_code',
        columnNames: ['code'],
      }),
    );
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_scope',
        columnNames: ['scope'],
      }),
    );
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_parent_id',
        columnNames: ['parent_id'],
      }),
    );
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'UQ_permissions_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // Create permissions foreign key for parent_id
    await queryRunner.createForeignKey(
      'permissions',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('permissions', true);
  }
}


