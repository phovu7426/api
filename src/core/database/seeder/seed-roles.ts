import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';
import { Context } from '@/shared/entities/context.entity';
import { RoleContext } from '@/shared/entities/role-context.entity';

@Injectable()
export class SeedRoles {
  private readonly logger = new Logger(SeedRoles.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding roles...');

    const roleRepo = this.dataSource.getRepository(Role);
    const permRepo = this.dataSource.getRepository(Permission);
    const userRepo = this.dataSource.getRepository(User);

    // Không skip nếu roles đã tồn tại - luôn update permissions để đảm bảo đồng bộ
    // Check if roles already exist để log
    const existingRoles = await roleRepo.count();
    if (existingRoles > 0) {
      this.logger.log('Roles already exist, will update permissions...');
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Seed roles - Theo yêu cầu: System có 2 roles, Shop/Comic mỗi context có 2 roles
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
      
      // ========== COMIC CONTEXT ROLES ==========
      {
        code: 'comic_admin',
        name: 'Quản trị viên Comic',
        status: 'active',
        parent_id: null,
      },
      {
        code: 'comic_manager',
        name: 'Quản lý Comic',
        status: 'active',
        parent_id: null,
      },
    ];

    const createdRoles: Map<string, Role> = new Map();

    // Create or update roles
    for (const roleData of rolesData) {
      let role = await roleRepo.findOne({ where: { code: roleData.code } as any });
      if (!role) {
        // Tạo mới nếu chưa có
        role = roleRepo.create({
          ...roleData,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        });
        role = await roleRepo.save(role);
        this.logger.log(`Created role: ${role.code}`);
      } else {
        // Update nếu đã có (chỉ update name và status)
        role.name = roleData.name;
        role.status = roleData.status;
        role.updated_user_id = defaultUserId;
        role = await roleRepo.save(role);
        this.logger.log(`Updated existing role: ${role.code}`);
      }
      createdRoles.set(role.code, role);
    }

    // Assign permissions to roles
    await this.assignPermissionsToRoles(roleRepo, permRepo, createdRoles);

    // Assign roles to contexts (role_contexts)
    await this.assignRolesToContexts(createdRoles);

    this.logger.log('Roles seeding completed');
  }

  private async assignPermissionsToRoles(
    roleRepo: Repository<Role>,
    permRepo: Repository<Permission>,
    createdRoles: Map<string, Role>
  ): Promise<void> {
    // Lấy toàn bộ permissions active - không phân chia theo scope
    // Mỗi permission là 1 chức năng, việc ai được dùng phụ thuộc vào role và group id
    const allPermissions = await permRepo.find({ where: { status: 'active' } as any });
    
    this.logger.log(`Total permissions: ${allPermissions.length}`);

    // ========== SYSTEM CONTEXT ROLES ==========
    
    // ===== System role: Full tất cả quyền =====
    const systemRole = createdRoles.get('system');
    if (systemRole) {
      systemRole.permissions = allPermissions;
      const saved = await roleRepo.save(systemRole);
      this.logger.log(`✅ Assigned ${saved.permissions?.length ?? 0} permissions to system role (full access)`);
    }

    // ===== System Manager: Full quyền trừ vai trò, quyền, phân quyền =====
    const systemManagerRole = createdRoles.get('system_manager');
    if (systemManagerRole) {
      const excludedPerms = [
        'role.manage',           // Quản lý Vai trò
        'permission.manage',     // Quản lý Quyền
      ];
      const systemManagerPerms = allPermissions.filter(p => !excludedPerms.includes(p.code));
      systemManagerRole.permissions = systemManagerPerms;
      const saved = await roleRepo.save(systemManagerRole);
      this.logger.log(`✅ Assigned ${saved.permissions?.length ?? 0} permissions to system_manager role (full trừ vai trò, quyền, phân quyền)`);
    }

    // ========== SHOP CONTEXT ROLES ==========
    
    // ===== Shop Admin: Full quyền trừ vai trò, quyền, phân quyền, quản lý hệ thống =====
    const shopAdminRole = createdRoles.get('shop_admin');
    if (shopAdminRole) {
      const excludedPerms = [
        'role.manage',                    // Quản lý Vai trò
        'permission.manage',              // Quản lý Quyền
        'system.manage',                   // Quản lý Hệ thống
      ];
      const shopAdminPerms = allPermissions.filter(p => !excludedPerms.includes(p.code));
      shopAdminRole.permissions = shopAdminPerms;
      const saved = await roleRepo.save(shopAdminRole);
      this.logger.log(`✅ Assigned ${saved.permissions?.length ?? 0} permissions to shop_admin role (full trừ vai trò, quyền, phân quyền, hệ thống)`);
    }

    // ===== Shop Manager: Giống shop_admin nhưng bỏ quản lý tài khoản =====
    const shopManagerRole = createdRoles.get('shop_manager');
    if (shopManagerRole) {
      const excludedPerms = [
        'role.manage',                    // Quản lý Vai trò
        'permission.manage',              // Quản lý Quyền
        'system.manage',                   // Quản lý Hệ thống
        'user.manage',                     // Quản lý Người dùng (quản lý tài khoản)
      ];
      const shopManagerPerms = allPermissions.filter(p => !excludedPerms.includes(p.code));
      shopManagerRole.permissions = shopManagerPerms;
      const saved = await roleRepo.save(shopManagerRole);
      this.logger.log(`✅ Assigned ${saved.permissions?.length ?? 0} permissions to shop_manager role (giống shop_admin trừ user.manage)`);
    }

    // ========== COMIC CONTEXT ROLES ==========
    
    // ===== Comic Admin: Full quyền trừ vai trò, quyền, phân quyền, quản lý hệ thống =====
    const comicAdminRole = createdRoles.get('comic_admin');
    if (comicAdminRole) {
      const excludedPerms = [
        'role.manage',                    // Quản lý Vai trò
        'permission.manage',              // Quản lý Quyền
        'system.manage',                   // Quản lý Hệ thống
      ];
      const comicAdminPerms = allPermissions.filter(p => !excludedPerms.includes(p.code));
      comicAdminRole.permissions = comicAdminPerms;
      const saved = await roleRepo.save(comicAdminRole);
      this.logger.log(`✅ Assigned ${saved.permissions?.length ?? 0} permissions to comic_admin role (full trừ vai trò, quyền, phân quyền, hệ thống)`);
    }

    // ===== Comic Manager: Giống comic_admin nhưng bỏ quản lý tài khoản =====
    const comicManagerRole = createdRoles.get('comic_manager');
    if (comicManagerRole) {
      const excludedPerms = [
        'role.manage',                    // Quản lý Vai trò
        'permission.manage',              // Quản lý Quyền
        'system.manage',                   // Quản lý Hệ thống
        'user.manage',                     // Quản lý Người dùng (quản lý tài khoản)
      ];
      const comicManagerPerms = allPermissions.filter(p => !excludedPerms.includes(p.code));
      comicManagerRole.permissions = comicManagerPerms;
      const saved = await roleRepo.save(comicManagerRole);
      this.logger.log(`✅ Assigned ${saved.permissions?.length ?? 0} permissions to comic_manager role (giống comic_admin trừ user.manage)`);
    }
  }

  /**
   * Gán roles vào contexts (role_contexts junction table)
   * - System roles: gán vào system context
   * - Shop roles: gán vào shop context
   * - Comic roles: gán vào comic context
   */
  private async assignRolesToContexts(createdRoles: Map<string, Role>): Promise<void> {
    const contextRepo = this.dataSource.getRepository(Context);
    const roleContextRepo = this.dataSource.getRepository(RoleContext);

    // Get contexts
    const systemContext = await contextRepo.findOne({ where: { code: 'system' } });
    const shopContext = await contextRepo.findOne({ where: { code: 'shop' } });
    const comicContext = await contextRepo.findOne({ where: { code: 'comic' } });

    if (!systemContext) {
      this.logger.warn('System context not found. Skipping role_contexts assignment.');
      return;
    }

    const roleContextsToCreate: Array<{ role_id: number; context_id: number; roleName: string }> = [];

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

    // ========== COMIC CONTEXT ROLES ==========
    if (comicContext) {
      const comicAdminRole = createdRoles.get('comic_admin');
      if (comicAdminRole) {
        roleContextsToCreate.push({
          role_id: comicAdminRole.id,
          context_id: comicContext.id,
          roleName: 'comic_admin',
        });
      }

      const comicManagerRole = createdRoles.get('comic_manager');
      if (comicManagerRole) {
        roleContextsToCreate.push({
          role_id: comicManagerRole.id,
          context_id: comicContext.id,
          roleName: 'comic_manager',
        });
      }
    }

    // Tạo tất cả role_contexts (xóa cũ trước nếu có)
    for (const rcData of roleContextsToCreate) {
      // Xóa cũ nếu có
      await roleContextRepo.delete({
        role_id: rcData.role_id,
        context_id: rcData.context_id,
      });
      
      // Tạo mới
      const roleContext = roleContextRepo.create({
        role_id: rcData.role_id,
        context_id: rcData.context_id,
      });
      await roleContextRepo.save(roleContext);
      this.logger.log(`✅ Assigned ${rcData.roleName} role to context (id=${rcData.context_id})`);
    }

    this.logger.log('✅ Role contexts assignment completed');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing roles...');
    const roleRepo = this.dataSource.getRepository(Role);
    await roleRepo.clear();
    this.logger.log('Roles cleared');
  }
}
