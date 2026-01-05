import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateProfilesTable1737000000100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'profiles',
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
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'birthday',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'about',
            type: 'text',
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

    // Create unique index for user_id (1 user chỉ có 1 profile)
    await queryRunner.createIndex(
      'profiles',
      new TableIndex({
        name: 'UQ_profiles_user_id',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'profiles',
      new TableIndex({
        name: 'IDX_profiles_created_user_id',
        columnNames: ['created_user_id'],
      }),
    );
    await queryRunner.createIndex(
      'profiles',
      new TableIndex({
        name: 'IDX_profiles_updated_user_id',
        columnNames: ['updated_user_id'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('profiles', true);
  }
}


