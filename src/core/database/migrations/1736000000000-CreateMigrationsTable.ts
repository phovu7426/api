import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration để tạo bảng migrations với cấu trúc đúng cho TypeORM
 * 
 * Migration này phải chạy đầu tiên, trước tất cả các migration khác.
 * Nó sẽ:
 * 1. Tạo bảng migrations nếu chưa tồn tại (database mới)
 * 2. Kiểm tra và sửa cấu trúc nếu bảng đã tồn tại nhưng sai cấu trúc (trường hợp migrate từ hệ thống cũ)
 */
export class CreateMigrationsTable1736000000000 implements MigrationInterface {
  name = 'CreateMigrationsTable1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem bảng migrations đã tồn tại chưa
    const tableExists = await queryRunner.hasTable('migrations');

    if (tableExists) {
      try {
        // Kiểm tra xem bảng có cột timestamp chưa
        const table = await queryRunner.getTable('migrations');
        const hasTimestampColumn = table?.columns.some((col) => col.name === 'timestamp');
        const hasNameColumn = table?.columns.some((col) => col.name === 'name');

        if (!hasTimestampColumn || !hasNameColumn) {
          // Bảng tồn tại nhưng thiếu cột cần thiết - cần fix
          // Removed console.log for production
          await queryRunner.query('DROP TABLE IF EXISTS `migrations`');
          // Tạo lại bảng với cấu trúc đúng
          await this.createMigrationsTable(queryRunner);
          // Removed console.log for production
        } else {
          // Bảng đã đúng cấu trúc, không cần làm gì
          // Removed console.log for production
          return;
        }
      } catch (error) {
        // Nếu có lỗi khi kiểm tra, xóa và tạo lại
        // Removed console.log for production
        await queryRunner.query('DROP TABLE IF EXISTS `migrations`');
        await this.createMigrationsTable(queryRunner);
      }
    } else {
      // Database hoàn toàn mới - tạo bảng migrations đầu tiên
      await this.createMigrationsTable(queryRunner);
      // Removed console.log for production
    }
  }

  private async createMigrationsTable(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'migrations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'timestamp',
            type: 'bigint',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Không cần revert migration này
    // Vì nó chỉ tạo/sửa bảng migrations
  }
}

