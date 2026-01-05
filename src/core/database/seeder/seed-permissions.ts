import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedPermissions {
  private readonly logger = new Logger(SeedPermissions.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding permissions...');

    // Check if permissions already exist
    const existingPermissions = await this.prisma.permission.count({
      where: { deleted_at: null },
    });
    if (existingPermissions > 0) {
      this.logger.log('Permissions already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await this.prisma.user.findFirst({
      where: { username: 'admin', deleted_at: null },
    });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    // Seed permissions - Chỉ có quyền manage level, không chia nhỏ thành read, create, update, delete
    // 1 menu = 1 quyền manage cho tất cả
    const permissions = [
      // ========== DASHBOARD MODULE ==========
      { code: 'dashboard.manage', name: 'Quản lý Dashboard', status: 'active', parent_code: null },
      
      // ========== POST MODULE (Blog/Tin tức) ==========
      { code: 'post.manage', name: 'Quản lý Bài viết', status: 'active', parent_code: null },
      { code: 'post_category.manage', name: 'Quản lý Danh mục bài viết', status: 'active', parent_code: null },
      { code: 'post_tag.manage', name: 'Quản lý Thẻ bài viết', status: 'active', parent_code: null },
      
      // ========== USER MODULE ==========
      { code: 'user.manage', name: 'Quản lý Người dùng', status: 'active', parent_code: null },
      
      // ========== ROLE MODULE ==========
      { code: 'role.manage', name: 'Quản lý Vai trò', status: 'active', parent_code: null },
      
      // ========== PERMISSION MODULE ==========
      { code: 'permission.manage', name: 'Quản lý Quyền', status: 'active', parent_code: null },
      
      // ========== SYSTEM MODULE ==========
      { code: 'system.manage', name: 'Quản lý Hệ thống', status: 'active', parent_code: null },
      
      // ========== MENU MODULE ==========
      { code: 'menu.manage', name: 'Quản lý Menu', status: 'active', parent_code: null },
      
      // ========== CONFIG MODULE ==========
      { code: 'config.manage', name: 'Quản lý Cấu hình', status: 'active', parent_code: null },
      
      // ========== BANNER MODULE ==========
      { code: 'banner.manage', name: 'Quản lý Banner', status: 'active', parent_code: null },
      { code: 'banner_location.manage', name: 'Quản lý Vị trí Banner', status: 'active', parent_code: null },
      
      // ========== NOTIFICATION MODULE ==========
      { code: 'notification.manage', name: 'Quản lý Thông báo', status: 'active', parent_code: null },
      
      // ========== CONTACT MODULE ==========
      { code: 'contact.manage', name: 'Quản lý Liên hệ', status: 'active', parent_code: null },
      
      // ========== GROUP MODULE ==========
      { code: 'group.manage', name: 'Quản lý Nhóm', status: 'active', parent_code: null },
    ];

    const createdPermissions: Map<string, any> = new Map();

    // Create permissions in order (parents first)
    const sortedPermissions = this.sortPermissionsByParent(permissions);
    
    for (const permData of sortedPermissions) {
      let parentId: bigint | null = null;
      if (permData.parent_code) {
        const parentPermission = createdPermissions.get(permData.parent_code);
        if (parentPermission) {
          parentId = parentPermission.id;
        } else {
          this.logger.warn(`Parent permission not found for ${permData.code}, skipping parent relation`);
        }
      }

      // Tự động set scope: nếu code bắt đầu bằng 'system.' thì scope = 'system', ngược lại = 'context'
      const scope = permData.code.startsWith('system.') ? 'system' : 'context';

      const permission = await this.prisma.permission.create({
        data: {
          code: permData.code,
          name: permData.name,
          status: permData.status,
          scope: scope,
          parent_id: parentId,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
      createdPermissions.set(permission.code, permission);
      this.logger.log(`Created permission: ${permission.code}${parentId ? ` (parent: ${permData.parent_code})` : ''}`);
    }

    this.logger.log(`Permissions seeding completed - Total: ${createdPermissions.size}`);
  }

  private sortPermissionsByParent(permissions: Array<{code: string, name: string, status: string, parent_code: string | null}>): Array<{code: string, name: string, status: string, parent_code: string | null}> {
    const result: Array<{code: string, name: string, status: string, parent_code: string | null}> = [];
    const processed = new Set<string>();

    // First pass: add all permissions without parents
    for (const perm of permissions) {
      if (!perm.parent_code) {
        result.push(perm);
        processed.add(perm.code);
      }
    }

    // Second pass: add children
    let changed = true;
    while (changed) {
      changed = false;
      for (const perm of permissions) {
        if (!processed.has(perm.code)) {
          if (!perm.parent_code || processed.has(perm.parent_code)) {
            result.push(perm);
            processed.add(perm.code);
            changed = true;
          }
        }
      }
    }

    return result;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing permissions...');
    await this.prisma.permission.deleteMany({});
    this.logger.log('Permissions cleared');
  }
}
