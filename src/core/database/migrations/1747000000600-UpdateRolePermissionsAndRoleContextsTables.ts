import { MigrationInterface, QueryRunner, TableIndex, TableForeignKey } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Migration để:
 * 1. Đổi tên bảng role_has_permissions thành role_permissions
 * 2. Thêm audit fields (id, created_user_id, updated_user_id, created_at, updated_at, deleted_at)
 * 3. Đổi từ composite primary key sang single id primary key với unique constraint
 * 4. Tương tự cho role_contexts
 */
export class UpdateRolePermissionsAndRoleContextsTables1747000000600 implements MigrationInterface {
  private readonly logger = new Logger(UpdateRolePermissionsAndRoleContextsTables1747000000600.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========== ROLE_PERMISSIONS ==========
    
    // Kiểm tra xem bảng role_has_permissions có tồn tại không
    const roleHasPermissionsExists = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'role_has_permissions'
    `);

    if (roleHasPermissionsExists[0].count > 0) {
      this.logger.log('Migrating role_has_permissions to role_permissions...');
      
      // 1. Tạo bảng mới role_permissions với cấu trúc mới
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          created_user_id BIGINT UNSIGNED NULL,
          updated_user_id BIGINT UNSIGNED NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL,
          role_id BIGINT UNSIGNED NOT NULL,
          permission_id BIGINT UNSIGNED NOT NULL,
          UNIQUE KEY uk_role_permission (role_id, permission_id),
          INDEX idx_role_id (role_id),
          INDEX idx_permission_id (permission_id),
          INDEX idx_deleted_at (deleted_at),
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 2. Copy dữ liệu từ role_has_permissions sang role_permissions
      await queryRunner.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT role_id, permission_id, NOW(), NOW()
        FROM role_has_permissions
        ON DUPLICATE KEY UPDATE role_id = role_id
      `);

      // 3. Xóa bảng cũ
      await queryRunner.query(`DROP TABLE IF EXISTS role_has_permissions`);
      
      this.logger.log('✅ Migrated role_has_permissions to role_permissions');
    } else {
      // Nếu bảng role_has_permissions không tồn tại, tạo mới role_permissions
      this.logger.log('Creating role_permissions table...');
      
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          created_user_id BIGINT UNSIGNED NULL,
          updated_user_id BIGINT UNSIGNED NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL,
          role_id BIGINT UNSIGNED NOT NULL,
          permission_id BIGINT UNSIGNED NOT NULL,
          UNIQUE KEY uk_role_permission (role_id, permission_id),
          INDEX idx_role_id (role_id),
          INDEX idx_permission_id (permission_id),
          INDEX idx_deleted_at (deleted_at),
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      this.logger.log('✅ Created role_permissions table');
    }

    // ========== ROLE_CONTEXTS ==========
    
    // Kiểm tra xem bảng role_contexts có tồn tại không
    const roleContextsExists = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'role_contexts'
    `);

    if (roleContextsExists[0].count > 0) {
      this.logger.log('Updating role_contexts table structure...');
      
      // Kiểm tra xem bảng đã có cột id chưa
      const hasIdColumn = await queryRunner.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'role_contexts' 
        AND column_name = 'id'
      `);

      if (hasIdColumn[0].count === 0) {
        // Tạo bảng tạm với cấu trúc mới
        await queryRunner.query(`
          CREATE TABLE role_contexts_new (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            created_user_id BIGINT UNSIGNED NULL,
            updated_user_id BIGINT UNSIGNED NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted_at DATETIME NULL,
            role_id BIGINT UNSIGNED NOT NULL,
            context_id BIGINT UNSIGNED NOT NULL,
            UNIQUE KEY uk_role_context (role_id, context_id),
            INDEX idx_role_id (role_id),
            INDEX idx_context_id (context_id),
            INDEX idx_deleted_at (deleted_at),
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Copy dữ liệu
        await queryRunner.query(`
          INSERT INTO role_contexts_new (role_id, context_id, created_at, updated_at)
          SELECT role_id, context_id, NOW(), NOW()
          FROM role_contexts
        `);

        // Xóa bảng cũ và đổi tên bảng mới
        await queryRunner.query(`DROP TABLE role_contexts`);
        await queryRunner.query(`RENAME TABLE role_contexts_new TO role_contexts`);
        
        this.logger.log('✅ Updated role_contexts table structure');
      } else {
        this.logger.log('role_contexts table already has id column, skipping...');
      }
    } else {
      // Tạo mới nếu chưa có
      this.logger.log('Creating role_contexts table...');
      
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS role_contexts (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          created_user_id BIGINT UNSIGNED NULL,
          updated_user_id BIGINT UNSIGNED NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL,
          role_id BIGINT UNSIGNED NOT NULL,
          context_id BIGINT UNSIGNED NOT NULL,
          UNIQUE KEY uk_role_context (role_id, context_id),
          INDEX idx_role_id (role_id),
          INDEX idx_context_id (context_id),
          INDEX idx_deleted_at (deleted_at),
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      this.logger.log('✅ Created role_contexts table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.warn('⚠️ Rollback: This migration cannot be fully rolled back automatically.');
    this.logger.warn('⚠️ Manual intervention required to restore role_has_permissions table if needed.');
    
    // Note: Rollback phức tạp vì đã thay đổi cấu trúc bảng
    // Có thể cần restore từ backup nếu cần rollback
  }
}

