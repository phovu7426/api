import { MigrationInterface, QueryRunner } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Migration: Xóa bảng user_context_roles (đã migrate sang group-based permissions)
 * 
 * ⚠️ CHỈ CHẠY SAU KHI:
 * - Đã chạy migrations 1747000000100 -> 1747000000400 thành công
 * - Đã verify dữ liệu đã được migrate đầy đủ sang user_groups và user_role_assignments
 * - Đã test hệ thống hoạt động ổn định với group-based permissions
 */
export class DropUserContextRolesTable1747000000500 implements MigrationInterface {
  private readonly logger = new Logger(DropUserContextRolesTable1747000000500.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem bảng có tồn tại không
    const table = await queryRunner.getTable('user_context_roles');
    if (!table) {
      this.logger.log('Table user_context_roles does not exist, skipping...');
      return;
    }

    // Xóa bảng user_context_roles
    await queryRunner.dropTable('user_context_roles', true);
    this.logger.log('Dropped table: user_context_roles');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Tạo lại bảng user_context_roles (nếu cần rollback)
    // Note: Dữ liệu sẽ không được restore, cần restore từ backup
    this.logger.warn('⚠️ Rollback: user_context_roles table cannot be recreated automatically. Use backup to restore data.');
  }
}


