import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateEmailConfigsTable1743000000100 implements MigrationInterface {
  name = 'CreateEmailConfigsTable1743000000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_configs',
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
            name: 'smtp_host',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'smtp_port',
            type: 'int',
            default: 587,
          },
          {
            name: 'smtp_secure',
            type: 'boolean',
            default: true,
          },
          {
            name: 'smtp_username',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'smtp_password',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'from_email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'from_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'reply_to_email',
            type: 'varchar',
            length: '255',
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
      'email_configs',
      new TableIndex({
        name: 'idx_email_configs_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('email_configs');
  }
}
