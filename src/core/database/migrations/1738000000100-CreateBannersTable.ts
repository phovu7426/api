import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBannersTable1738000000100 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'banners',
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
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'subtitle',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'image',
                        type: 'varchar',
                        length: '500',
                    },
                    {
                        name: 'mobile_image',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'link',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'link_target',
                        type: 'enum',
                        enum: ['_self', '_blank'],
                        default: "'_self'",
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'button_text',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'button_color',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'text_color',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'location_id',
                        type: 'bigint',
                        unsigned: true,
                    },
                    {
                        name: 'sort_order',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['active', 'inactive'],
                        default: "'active'",
                    },
                    {
                        name: 'start_date',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'end_date',
                        type: 'datetime',
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
            'banners',
            new TableIndex({
                name: 'idx_banners_title',
                columnNames: ['title'],
            }),
        );

        await queryRunner.createIndex(
            'banners',
            new TableIndex({
                name: 'idx_banners_location_id',
                columnNames: ['location_id'],
            }),
        );

        await queryRunner.createIndex(
            'banners',
            new TableIndex({
                name: 'idx_banners_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'banners',
            new TableIndex({
                name: 'idx_banners_sort_order',
                columnNames: ['sort_order'],
            }),
        );

        await queryRunner.createIndex(
            'banners',
            new TableIndex({
                name: 'idx_banners_start_date',
                columnNames: ['start_date'],
            }),
        );

        await queryRunner.createIndex(
            'banners',
            new TableIndex({
                name: 'idx_banners_end_date',
                columnNames: ['end_date'],
            }),
        );

        await queryRunner.createIndex(
            'banners',
            new TableIndex({
                name: 'idx_banners_status_sort',
                columnNames: ['status', 'sort_order'],
            }),
        );

        await queryRunner.createIndex(
            'banners',
            new TableIndex({
                name: 'idx_banners_location_status',
                columnNames: ['location_id', 'status'],
            }),
        );

        await queryRunner.createIndex(
            'banners',
            new TableIndex({
                name: 'idx_banners_deleted_at',
                columnNames: ['deleted_at'],
            }),
        );

        // Create foreign key
        await queryRunner.createForeignKey(
            'banners',
            new TableForeignKey({
                name: 'FK_banners_location_id',
                columnNames: ['location_id'],
                referencedTableName: 'banner_locations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('banners');
    }
}