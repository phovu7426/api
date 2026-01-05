import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Migration: Thêm context_id vào groups
 */
export class AddContextIdToGroups1747000000100 implements MigrationInterface {
  private readonly logger = new Logger(AddContextIdToGroups1747000000100.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Bước 1: Thêm cột context_id (nullable tạm thời)
    await queryRunner.addColumn(
      'groups',
      new TableColumn({
        name: 'context_id',
        type: 'bigint',
        unsigned: true,
        isNullable: true, // Tạm thời nullable để migrate dữ liệu
      }),
    );

    // Bước 2: Tạo index
    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'IDX_groups_context_id',
        columnNames: ['context_id'],
      }),
    );

    // Bước 3: Migrate dữ liệu: Tạo context cho mỗi group (nếu chưa có)
    // Logic: Với mỗi group, tìm context có ref_id = group.id
    // Nếu không có → tạo context mới
    await queryRunner.query(`
      INSERT INTO contexts (type, ref_id, name, status, created_at, updated_at)
      SELECT 
        groups.type,
        groups.id AS ref_id,
        groups.name,
        groups.status,
        groups.created_at,
        groups.updated_at
      FROM groups
      WHERE NOT EXISTS (
        SELECT 1 FROM contexts 
        WHERE contexts.ref_id = groups.id 
        AND contexts.type = groups.type
      )
    `);

    // Bước 4: Update context_id trong groups từ contexts
    await queryRunner.query(`
      UPDATE groups g
      INNER JOIN contexts c ON c.ref_id = g.id AND c.type = g.type
      SET g.context_id = c.id
    `);

    // Bước 5: Set context_id NOT NULL
    await queryRunner.query(`
      ALTER TABLE groups 
      MODIFY COLUMN context_id BIGINT UNSIGNED NOT NULL
    `);

    // Bước 6: Tạo foreign key
    await queryRunner.createForeignKey(
      'groups',
      new TableForeignKey({
        columnNames: ['context_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contexts',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    this.logger.log('Added context_id to groups table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const table = await queryRunner.getTable('groups');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('context_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('groups', foreignKey);
    }

    // Drop index
    await queryRunner.dropIndex('groups', 'IDX_groups_context_id');

    // Drop column
    await queryRunner.dropColumn('groups', 'context_id');

    this.logger.log('Removed context_id from groups table');
  }
}


