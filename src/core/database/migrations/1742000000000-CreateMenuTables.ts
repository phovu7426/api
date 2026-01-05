import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMenuTables1742000000000 implements MigrationInterface {
  name = 'CreateMenuTables1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if menus table already exists
    const menusTableExists = await queryRunner.hasTable('menus');
    if (menusTableExists) {
      // Removed console.log for production
      return;
    }

    // Create menus table
    await queryRunner.createTable(
      new Table({
        name: 'menus',
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
            name: 'name',
            type: 'varchar',
            length: '150',
          },
          {
            name: 'path',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'api_path',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '120',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['route', 'group', 'link'],
            default: "'route'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
          },
          {
            name: 'parent_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_public',
            type: 'tinyint',
            length: '1',
            default: 0,
          },
          {
            name: 'show_in_menu',
            type: 'tinyint',
            length: '1',
            default: 1,
          },
          {
            name: 'required_permission_id',
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

    // Create menus indexes
    await queryRunner.createIndex(
      'menus',
      new TableIndex({
        name: 'UQ_menus_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'menus',
      new TableIndex({
        name: 'IDX_menus_parent_id',
        columnNames: ['parent_id'],
      }),
    );

    await queryRunner.createIndex(
      'menus',
      new TableIndex({
        name: 'IDX_menus_required_permission_id',
        columnNames: ['required_permission_id'],
      }),
    );

    await queryRunner.createIndex(
      'menus',
      new TableIndex({
        name: 'IDX_menus_status_show_in_menu',
        columnNames: ['status', 'show_in_menu'],
      }),
    );

    await queryRunner.createIndex(
      'menus',
      new TableIndex({
        name: 'IDX_menus_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create foreign keys for menus
    await queryRunner.createForeignKey(
      'menus',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'menus',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'menus',
      new TableForeignKey({
        columnNames: ['required_permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Create menu_permissions table
    await queryRunner.createTable(
      new Table({
        name: 'menu_permissions',
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
            name: 'menu_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'permission_id',
            type: 'bigint',
            unsigned: true,
          },
        ],
      }),
      true,
    );

    // Create menu_permissions indexes
    await queryRunner.createIndex(
      'menu_permissions',
      new TableIndex({
        name: 'IDX_menu_permissions_menu_id',
        columnNames: ['menu_id'],
      }),
    );

    await queryRunner.createIndex(
      'menu_permissions',
      new TableIndex({
        name: 'IDX_menu_permissions_permission_id',
        columnNames: ['permission_id'],
      }),
    );

    // Create foreign keys for menu_permissions
    await queryRunner.createForeignKey(
      'menu_permissions',
      new TableForeignKey({
        columnNames: ['menu_id'],
        referencedTableName: 'menus',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('menu_permissions', true);
    await queryRunner.dropTable('menus', true);
  }
}

