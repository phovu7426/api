import { MigrationInterface, QueryRunner } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Migration để xóa các bảng không dùng nữa sau khi nâng cấp lên Global Context System
 * 
 * ⚠️ LƯU Ý: Migration này là OPTIONAL
 * - Nếu muốn giữ lại để rollback → không chạy migration này
 * - Nếu chắc chắn không cần rollback → chạy migration này để cleanup
 * 
 * Các bảng sẽ bị xóa:
 * - user_roles: Đã migrate sang user_context_roles
 * - user_permissions: Không được sử dụng trong hệ thống (phân quyền chỉ qua roles)
 */
export class DropDeprecatedTables1744000000300 implements MigrationInterface {
  private readonly logger = new Logger(DropDeprecatedTables1744000000300.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xóa bảng user_permissions (không dùng)
    await queryRunner.query(`DROP TABLE IF EXISTS user_permissions`);
    this.logger.log('Dropped table: user_permissions');

    // Xóa bảng user_roles (đã migrate sang user_context_roles)
    // ⚠️ CHỈ XÓA SAU KHI ĐÃ XÁC NHẬN DỮ LIỆU ĐÃ ĐƯỢC MIGRATE THÀNH CÔNG
    // Uncomment dòng dưới khi chắc chắn muốn xóa
    // await queryRunner.query(`DROP TABLE IF EXISTS user_roles`);
    // this.logger.log('Dropped table: user_roles');
    
    this.logger.warn('⚠️ user_roles table is kept for safety. Uncomment in migration to drop it.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Tạo lại các bảng (nếu cần)
    // Note: Cần có migration files gốc để tạo lại
    this.logger.warn('⚠️ Rollback DropDeprecatedTables: Tables cannot be recreated automatically. Use original migration files.');
  }
}

