import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateP1FeaturesTables1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // All ecommerce tables removed (promotions, tracking_history, warehouses, warehouse_inventory, stock_transfers)
    // These tables are no longer needed as ecommerce features have been removed
    return;
    /* Commented out - Ecommerce removed
    // Create promotions table
    await queryRunner.createTable(
      new Table({
        name: 'promotions',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
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
            name: 'type',
            type: 'enum',
            enum: ['buy_x_get_y', 'bundle', 'flash_sale', 'combo'],
          },
          {
            name: 'rules',
            type: 'json',
          },
          {
            name: 'applicable_products',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'applicable_categories',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'start_date',
            type: 'datetime',
          },
          {
            name: 'end_date',
            type: 'datetime',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
          },
          {
            name: 'usage_limit',
            type: 'int',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'used_count',
            type: 'int',
            unsigned: true,
            default: 0,
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

    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'idx_promotions_type',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'idx_promotions_status',
        columnNames: ['status'],
      }),
    );

    // tracking_history table removed - không còn orders table

    // Create warehouses table
    await queryRunner.createTable(
      new Table({
        name: 'warehouses',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'group_id',
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
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'district',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'manager_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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

    await queryRunner.createIndex(
      'warehouses',
      new TableIndex({
        name: 'idx_warehouses_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'warehouses',
      new TableIndex({
        name: 'idx_warehouses_priority',
        columnNames: ['priority'],
      }),
    );

    await queryRunner.createIndex(
      'warehouses',
      new TableIndex({
        name: 'idx_warehouses_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    await queryRunner.createIndex(
      'warehouses',
      new TableIndex({
        name: 'idx_warehouses_group_id',
        columnNames: ['group_id'],
      }),
    );

    // Create warehouse_inventory table
    await queryRunner.createTable(
      new Table({
        name: 'warehouse_inventory',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'warehouse_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'product_variant_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'quantity',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'reserved_quantity',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'min_stock_level',
            type: 'int',
            unsigned: true,
            default: 0,
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

    await queryRunner.createIndex(
      'warehouse_inventory',
      new TableIndex({
        name: 'idx_warehouse_inventory_warehouse_id',
        columnNames: ['warehouse_id'],
      }),
    );

    await queryRunner.createIndex(
      'warehouse_inventory',
      new TableIndex({
        name: 'idx_warehouse_inventory_variant_id',
        columnNames: ['product_variant_id'],
      }),
    );

    await queryRunner.createIndex(
      'warehouse_inventory',
      new TableIndex({
        name: 'uk_warehouse_variant',
        columnNames: ['warehouse_id', 'product_variant_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'warehouse_inventory',
      new TableForeignKey({
        columnNames: ['warehouse_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'warehouses',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'warehouse_inventory',
      new TableForeignKey({
        columnNames: ['product_variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_variants',
        onDelete: 'CASCADE',
      }),
    );

    // Create stock_transfers table
    await queryRunner.createTable(
      new Table({
        name: 'stock_transfers',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'transfer_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'from_warehouse_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'to_warehouse_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'product_variant_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'quantity',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in_transit', 'completed', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'approved_by',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'approved_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'completed_at',
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

    await queryRunner.createIndex(
      'stock_transfers',
      new TableIndex({
        name: 'idx_stock_transfers_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createForeignKey(
      'stock_transfers',
      new TableForeignKey({
        columnNames: ['from_warehouse_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'warehouses',
      }),
    );

    await queryRunner.createForeignKey(
      'stock_transfers',
      new TableForeignKey({
        columnNames: ['to_warehouse_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'warehouses',
      }),
    );

    await queryRunner.createForeignKey(
      'stock_transfers',
      new TableForeignKey({
        columnNames: ['product_variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_variants',
      }),
    );
    */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // All ecommerce tables removed
    return;
    /* Commented out - Ecommerce removed
    await queryRunner.dropTable('stock_transfers');
    await queryRunner.dropTable('warehouse_inventory');
    await queryRunner.dropTable('warehouses');
    await queryRunner.dropTable('tracking_history');
    await queryRunner.dropTable('promotions');
    */
  }
}