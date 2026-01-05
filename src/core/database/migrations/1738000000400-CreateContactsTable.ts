import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateContactsTable1738000000400 implements MigrationInterface {
  name = 'CreateContactsTable1738000000400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contacts',
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
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'read', 'replied', 'closed'],
            default: "'pending'",
          },
          {
            name: 'reply',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'replied_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'replied_by',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'created_user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'updated_user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
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

    // Create indexes
    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'idx_contacts_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'idx_contacts_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'idx_contacts_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'idx_contacts_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'idx_contacts_status_created',
        columnNames: ['status', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contacts');
  }
}

