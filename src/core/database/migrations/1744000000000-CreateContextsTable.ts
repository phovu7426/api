import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateContextsTable1744000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create contexts table
    await queryRunner.createTable(
      new Table({
        name: 'contexts',
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
            name: 'ref_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '30',
            default: "'active'",
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

    // Create contexts indexes
    await queryRunner.createIndex(
      'contexts',
      new TableIndex({
        name: 'IDX_contexts_type',
        columnNames: ['type'],
      }),
    );
    await queryRunner.createIndex(
      'contexts',
      new TableIndex({
        name: 'IDX_contexts_ref_id',
        columnNames: ['ref_id'],
      }),
    );
    await queryRunner.createIndex(
      'contexts',
      new TableIndex({
        name: 'IDX_contexts_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    await queryRunner.createIndex(
      'contexts',
      new TableIndex({
        name: 'UQ_contexts_type_ref_id',
        columnNames: ['type', 'ref_id'],
        isUnique: true,
      }),
    );

    // Create system context mặc định
    await queryRunner.query(`
      INSERT INTO contexts (id, type, ref_id, name, status) 
      VALUES (1, 'system', NULL, 'System', 'active');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contexts', true);
  }
}

