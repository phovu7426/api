import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedRoles {
  private readonly logger = new Logger(SeedRoles.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding roles...');

    // Không skip nếu roles đã tồn tại - luôn update permissions để đảm bảo đồng bộ
    // Check if roles already exist để log
    const existingRoles = await this.prisma.role.count({
      where: { deleted_at: null },
    });
    if (existingRoles > 0) {
      this.logger.log('Roles already exist, will update permissions...');
    }

    // Get admin user for audit fields
    const adminUser = await this.prisma.user.findFirst({
      where: { username: 'admin', deleted_at: null },
    });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    // Seed roles - Theo yêu cầu: System có 2 roles, Shop mỗi context có 2 roles
    const rolesData = [
      // ========== SYSTEM CONTEXT ROLES ==========
      {
        code: 'system',
        name: 'Quản trị viên Hệ thống',
        status: 'active',
        parent_id: null,
      },
      {
        code: 'system_manager',
        name: 'Quản lý Hệ thống',
        status: 'active',
        parent_id: null,
      },
      
      // ========== SHOP CONTEXT ROLES ==========
      {
        code: 'shop_admin',
        name: 'Quản trị viên Shop',
        status: 'active',
        parent_id: null,
      },
      {
        code: 'shop_manager',
        name: 'Quản lý Shop',
        status: 'active',
        parent_id: null,
      },
    ];

    const createdRoles: Map<string, any> = new Map();

    // Create or update roles
    for (const roleData of rolesData) {
      let role = await this.prisma.role.findFirst({
        where: { code: roleData.code, deleted_at: null },
      });
      
      if (!role) {
        // Tạo mới nếu chưa có
        role = await this.prisma.role.create({
          data: {
            ...roleData,
            created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
            updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          },
        });
        this.logger.log(`Created role: ${role.code}`);
      } else {
        // Update nếu đã có (chỉ update name và status)
        role = await this.prisma.role.update({
          where: { id: role.id },
          data: {
            name: roleData.name,
            status: roleData.status,
            updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          },
        });
        this.logger.log(`Updated existing role: ${role.code}`);
      }
      createdRoles.set(role.code, role);
    }

    // Assign permissions to roles
    await this.assignPermissionsToRoles(createdRoles);

    // Assign roles to contexts (role_contexts)
    await this.assignRolesToContexts(createdRoles);

    this.logger.log('Roles seeding completed');
  }

  private async assignPermissionsToRoles(createdRoles: Map<string, any>): Promise<void> {
    // Lấy toàn bộ permissions active - không phân chia theo scope
    const allPermissions = await this.prisma.permission.findMany({
      where: { status: 'active', deleted_at: null },
    });
    
    this.logger.log(`Total permissions: ${allPermissions.length}`);

    // ========== SYSTEM CONTEXT ROLES ==========
    
    // ===== System role: Full tất cả quyền =====
    const systemRole = createdRoles.get('system');
    if (systemRole) {
      await this.prisma.role.update({
        where: { id: systemRole.id },
        data: {
          permissions: {
            set: allPermissions.map(p => ({ id: p.id })),
          },
        },
      });
      this.logger.log(`✅ Assigned ${allPermissions.length} permissions to system role (full access)`);
    }

    // ===== System Manager: Full quyền trừ vai trò, quyền, phân quyền =====
    const systemManagerRole = createdRoles.get('system_manager');
    if (systemManagerRole) {
      const excludedPerms = [
        'role.manage',
        'permission.manage',
      ];
      const systemManagerPerms = allPermissions.filter(p => !excludedPerms.includes(p.code));
      await this.prisma.role.update({
        where: { id: systemManagerRole.id },
        data: {
          permissions: {
            set: systemManagerPerms.map(p => ({ id: p.id })),
          },
        },
      });
      this.logger.log(`✅ Assigned ${systemManagerPerms.length} permissions to system_manager role (full trừ vai trò, quyền, phân quyền)`);
    }

    // ========== SHOP CONTEXT ROLES ==========
    
    // ===== Shop Admin: Full quyền trừ vai trò, quyền, phân quyền, quản lý hệ thống =====
    const shopAdminRole = createdRoles.get('shop_admin');
    if (shopAdminRole) {
      const excludedPerms = [
        'role.manage',
        'permission.manage',
        'system.manage',
      ];
      const shopAdminPerms = allPermissions.filter(p => !excludedPerms.includes(p.code));
      await this.prisma.role.update({
        where: { id: shopAdminRole.id },
        data: {
          permissions: {
            set: shopAdminPerms.map(p => ({ id: p.id })),
          },
        },
      });
      this.logger.log(`✅ Assigned ${shopAdminPerms.length} permissions to shop_admin role (full trừ vai trò, quyền, phân quyền, hệ thống)`);
    }

    // ===== Shop Manager: Giống shop_admin nhưng bỏ quản lý tài khoản =====
    const shopManagerRole = createdRoles.get('shop_manager');
    if (shopManagerRole) {
      const excludedPerms = [
        'role.manage',
        'permission.manage',
        'system.manage',
        'user.manage',
      ];
      const shopManagerPerms = allPermissions.filter(p => !excludedPerms.includes(p.code));
      await this.prisma.role.update({
        where: { id: shopManagerRole.id },
        data: {
          permissions: {
            set: shopManagerPerms.map(p => ({ id: p.id })),
          },
        },
      });
      this.logger.log(`✅ Assigned ${shopManagerPerms.length} permissions to shop_manager role (giống shop_admin trừ user.manage)`);
    }
  }

  /**
   * Gán roles vào contexts (role_contexts junction table)
   * - System roles: gán vào system context
   * - Shop roles: gán vào shop context
   */
  private async assignRolesToContexts(createdRoles: Map<string, any>): Promise<void> {
    // Get contexts
    const systemContext = await this.prisma.context.findFirst({
      where: { code: 'system', deleted_at: null },
    });
    const shopContext = await this.prisma.context.findFirst({
      where: { code: 'shop', deleted_at: null },
    });

    if (!systemContext) {
      this.logger.warn('System context not found. Skipping role_contexts assignment.');
      return;
    }

    const roleContextsToCreate: Array<{ role_id: bigint; context_id: bigint; roleName: string }> = [];

    // ========== SYSTEM CONTEXT ROLES ==========
    const systemRole = createdRoles.get('system');
    if (systemRole && systemContext) {
      roleContextsToCreate.push({
        role_id: systemRole.id,
        context_id: systemContext.id,
        roleName: 'system',
      });
    }

    const systemManagerRole = createdRoles.get('system_manager');
    if (systemManagerRole && systemContext) {
      roleContextsToCreate.push({
        role_id: systemManagerRole.id,
        context_id: systemContext.id,
        roleName: 'system_manager',
      });
    }

    // ========== SHOP CONTEXT ROLES ==========
    if (shopContext) {
      const shopAdminRole = createdRoles.get('shop_admin');
      if (shopAdminRole) {
        roleContextsToCreate.push({
          role_id: shopAdminRole.id,
          context_id: shopContext.id,
          roleName: 'shop_admin',
        });
      }

      const shopManagerRole = createdRoles.get('shop_manager');
      if (shopManagerRole) {
        roleContextsToCreate.push({
          role_id: shopManagerRole.id,
          context_id: shopContext.id,
          roleName: 'shop_manager',
        });
      }
    }

    // Tạo tất cả role_contexts (xóa cũ trước nếu có)
    for (const rcData of roleContextsToCreate) {
      // Xóa cũ nếu có
      await this.prisma.roleContext.deleteMany({
        where: {
          role_id: rcData.role_id,
          context_id: rcData.context_id,
        },
      });
      
      // Tạo mới
      await this.prisma.roleContext.create({
        data: {
          role_id: rcData.role_id,
          context_id: rcData.context_id,
        },
      });
      this.logger.log(`✅ Assigned ${rcData.roleName} role to context (id=${Number(rcData.context_id)})`);
    }

    this.logger.log('✅ Role contexts assignment completed');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing roles...');
    await this.prisma.role.deleteMany({});
    this.logger.log('Roles cleared');
  }
}
