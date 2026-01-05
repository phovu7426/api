import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Migration: Thêm cột code vào contexts
 */
export class AddCodeToContexts1747000000400 implements MigrationInterface {
  private readonly logger = new Logger(AddCodeToContexts1747000000400.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem cột code đã tồn tại chưa
    const table = await queryRunner.getTable('contexts');
    const hasCodeColumn = table?.columns.find((col) => col.name === 'code');

    if (!hasCodeColumn) {
      // Thêm cột code
      await queryRunner.addColumn(
        'contexts',
        new TableColumn({
          name: 'code',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );

      // Generate code từ name (tạm thời)
      await queryRunner.query(`
        UPDATE contexts 
        SET code = CONCAT(
          LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '_'), '-', '_'), '.', '_')),
          '_',
          id
        )
        WHERE code IS NULL
      `);

      // Set NOT NULL sau khi có dữ liệu
      await queryRunner.query(`
        ALTER TABLE contexts 
        MODIFY COLUMN code VARCHAR(100) NOT NULL
      `);

      // Tạo unique index
      await queryRunner.createIndex(
        'contexts',
        new TableIndex({
          name: 'UQ_contexts_code',
          columnNames: ['code'],
          isUnique: true,
        }),
      );

      this.logger.log('Added code column to contexts table');
    } else {
      this.logger.log('Code column already exists in contexts table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('contexts');
    const codeColumn = table?.columns.find((col) => col.name === 'code');
    
    if (codeColumn) {
      await queryRunner.dropIndex('contexts', 'UQ_contexts_code');
      await queryRunner.dropColumn('contexts', 'code');
      this.logger.log('Removed code column from contexts table');
    }
  }
}


