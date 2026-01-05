import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRolesTable1737000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles table
    await queryRunner.createTable(
      new Table({
        name: 'roles',
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
            length: '100',
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

    // Create roles indexes
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_roles_code',
        columnNames: ['code'],
      }),
    );
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_roles_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_roles_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_roles_parent_id',
        columnNames: ['parent_id'],
      }),
    );
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_roles_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_roles_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'UQ_roles_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // Create roles foreign key for parent_id
    await queryRunner.createForeignKey(
      'roles',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles', true);
  }
}


