import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBannerLocationsTable1738000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'banner_locations',
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
                        isUnique: true,
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
                        type: 'enum',
                        enum: ['active', 'inactive'],
                        default: "'active'",
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
            'banner_locations',
            new TableIndex({
                name: 'idx_banner_locations_code',
                columnNames: ['code'],
                isUnique: true,
            }),
        );

        await queryRunner.createIndex(
            'banner_locations',
            new TableIndex({
                name: 'idx_banner_locations_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'banner_locations',
            new TableIndex({
                name: 'idx_banner_locations_deleted_at',
                columnNames: ['deleted_at'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('banner_locations');
    }
}