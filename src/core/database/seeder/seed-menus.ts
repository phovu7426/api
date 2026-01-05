import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { MenuType } from '@/shared/enums/menu-type.enum';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedMenus {
  private readonly logger = new Logger(SeedMenus.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding menus...');

    // Xóa tất cả menu cũ để tạo lại từ đầu
    this.logger.log('Clearing existing menus...');
    await this.prisma.menu.deleteMany({});
    this.logger.log('Cleared all existing menus');

    // Get admin user for audit fields
    const adminUser = await this.prisma.user.findFirst({
      where: { username: 'systemadmin', deleted_at: null },
    });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    // Get permissions
    const permissions = await this.prisma.permission.findMany({
      where: { deleted_at: null },
    });
    const permMap = new Map<string, any>();
    permissions.forEach((perm: any) => permMap.set(perm.code, perm));

    // Seed menus - Mỗi menu chỉ có 1 bản ghi duy nhất, không phân biệt context
    // Menu ROUTE: có 1 permission (dùng required_permission_id)
    // Menu GROUP: có thể có nhiều permissions (dùng menu_permissions table)
    const menuData = [
      // ========== DASHBOARD ==========
      {
        code: 'dashboard',
        name: 'Dashboard',
        path: '/admin/dashboard',
        api_path: 'api/admin/dashboard',
        icon: '📊',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 1,
        is_public: false,
        show_in_menu: true,
        permission_code: 'dashboard.manage',
      },
      
      // ========== QUẢN LÝ TÀI KHOẢN (GROUP - check nhiều quyền) ==========
      {
        code: 'account-management',
        name: 'Quản lý tài khoản',
        path: '/admin/users',
        api_path: 'api/admin/users',
        icon: '👥',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'user.manage', // Permission chính
        permission_codes: ['user.manage', 'role.manage', 'permission.manage'], // Nhiều quyền cho group
      },
      {
        code: 'users',
        name: 'Tài khoản',
        path: '/admin/users',
        api_path: 'api/admin/users',
        icon: '👤',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'account-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'user.manage',
      },
      {
        code: 'roles',
        name: 'Vai trò',
        path: '/admin/roles',
        api_path: 'api/admin/roles',
        icon: '👔',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'account-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'role.manage',
      },
      {
        code: 'permissions',
        name: 'Quyền',
        path: '/admin/permissions',
        api_path: 'api/admin/permissions',
        icon: '🔑',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'account-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'permission.manage',
      },
      
      // ========== NHÓM & CONTEXT (GROUP) ==========
      {
        code: 'group-management',
        name: 'Nhóm & Context',
        path: '/admin/groups',
        api_path: 'api/admin/groups',
        icon: '👪',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'group.manage',
        permission_codes: ['group.manage'], // Nhiều quyền cho group
      },
      {
        code: 'groups',
        name: 'Nhóm',
        path: '/admin/groups',
        api_path: 'api/admin/groups',
        icon: '👪',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'group-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'group.manage',
      },
      {
        code: 'contexts',
        name: 'Context',
        path: '/admin/contexts',
        api_path: 'api/admin/contexts',
        icon: '🌐',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'group-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'group.manage',
      },
      
      // ========== CẤU HÌNH HỆ THỐNG (GROUP) ==========
      {
        code: 'config-management',
        name: 'Cấu hình hệ thống',
        path: '/admin/system-config/general',
        api_path: 'api/admin/system-config/general',
        icon: '⚙️',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'config.manage',
        permission_codes: ['config.manage'], // Có thể thêm permissions khác nếu cần
      },
      {
        code: 'config-general',
        name: 'Cấu hình chung',
        path: '/admin/system-config/general',
        api_path: 'api/admin/system-config/general',
        icon: '📋',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'config-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'config.manage',
      },
      {
        code: 'config-email',
        name: 'Cấu hình Email',
        path: '/admin/system-config/email',
        api_path: 'api/admin/system-config/email',
        icon: '📧',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'config-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'config.manage',
      },
      
      // ========== MENU ==========
      {
        code: 'menus',
        name: 'Menu',
        path: '/admin/menus',
        api_path: 'api/admin/menus',
        icon: '📑',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 31,
        is_public: false,
        show_in_menu: true,
        permission_code: 'menu.manage',
      },
      
      // ========== BÀI VIẾT (GROUP) ==========
      {
        code: 'post-management',
        name: 'Bài viết',
        path: '/admin/posts',
        api_path: 'api/admin/posts',
        icon: '📝',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 50,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
        permission_codes: ['post.manage', 'post_category.manage', 'post_tag.manage'], // Nhiều quyền cho group
      },
      {
        code: 'posts',
        name: 'Bài viết',
        path: '/admin/posts',
        api_path: 'api/admin/posts',
        icon: '📄',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'post-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
      },
      {
        code: 'post-categories',
        name: 'Danh mục bài viết',
        path: '/admin/post-categories',
        api_path: 'api/admin/post-categories',
        icon: '📂',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'post-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post_category.manage',
      },
      {
        code: 'post-tags',
        name: 'Thẻ bài viết',
        path: '/admin/post-tags',
        api_path: 'api/admin/post-tags',
        icon: '🏷️',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'post-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post_tag.manage',
      },
      
      // ========== BANNER (GROUP - check nhiều quyền) ==========
      {
        code: 'banner-management',
        name: 'Banner',
        path: '/admin/banners',
        api_path: 'api/admin/banners',
        icon: '🖼️',
        type: MenuType.group,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 100,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner.manage', // Permission chính
        permission_codes: ['banner.manage', 'banner_location.manage'], // Nhiều quyền cho group
      },
      {
        code: 'banners',
        name: 'Banner',
        path: '/admin/banners',
        api_path: 'api/admin/banners',
        icon: '🖼️',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'banner-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner.manage',
      },
      {
        code: 'banner-locations',
        name: 'Vị trí Banner',
        path: '/admin/banner-locations',
        api_path: 'api/admin/banner-locations',
        icon: '📍',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_code: 'banner-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner_location.manage',
      },
      
      // ========== LIÊN HỆ ==========
      {
        code: 'contacts',
        name: 'Liên hệ',
        path: '/admin/contacts',
        api_path: 'api/admin/contacts',
        icon: '📞',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 110,
        is_public: false,
        show_in_menu: true,
        permission_code: 'contact.manage',
      },
      
      // ========== THÔNG BÁO ==========
      {
        code: 'notifications',
        name: 'Thông báo',
        path: '/admin/notifications',
        api_path: 'api/admin/notifications',
        icon: '🔔',
        type: MenuType.route,
        status: BasicStatus.active,
        parent_id: null,
        sort_order: 120,
        is_public: false,
        show_in_menu: true,
        permission_code: 'notification.manage',
      },
    ];

    this.logger.log(`Will create ${menuData.length} menus (mỗi menu chỉ có 1 permission)`);

    const createdMenus = new Map<string, any>();

    // Sort menus: parents first
    const sortedMenus = this.sortMenusByParent(menuData);

    for (const menuItem of sortedMenus) {
      
      let parentId: bigint | null = null;
      if (menuItem.parent_code) {
        const parent = createdMenus.get(menuItem.parent_code);
        if (parent) {
          parentId = parent.id;
        } else {
          // Tìm parent trong DB nếu chưa có trong createdMenus
          const parentInDb = await this.prisma.menu.findFirst({
            where: { code: menuItem.parent_code, deleted_at: null },
          });
          if (parentInDb) {
            createdMenus.set(parentInDb.code, parentInDb);
            parentId = parentInDb.id;
          } else {
            this.logger.warn(`Parent menu not found for ${menuItem.code}, skipping parent relation`);
          }
        }
      }

      // Menu có 1 permission chính (required_permission)
      let requiredPermissionId: bigint | null = null;
      if (menuItem.permission_code) {
        const requiredPermission = permMap.get(menuItem.permission_code);
        if (requiredPermission) {
          requiredPermissionId = requiredPermission.id;
        } else {
          this.logger.warn(`Permission ${menuItem.permission_code} not found for menu ${menuItem.code}`);
        }
      }

      const menu = await this.prisma.menu.create({
        data: {
          code: menuItem.code,
          name: menuItem.name,
          path: menuItem.path,
          api_path: menuItem.api_path,
          icon: menuItem.icon,
          type: menuItem.type as any,
          status: menuItem.status as any,
          parent_id: parentId,
          sort_order: menuItem.sort_order,
          is_public: menuItem.is_public,
          show_in_menu: menuItem.show_in_menu,
          required_permission_id: requiredPermissionId,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
      
      // Nếu là menu GROUP và có nhiều permissions, tạo MenuPermission records
      if (menu.type === MenuType.group && menuItem.permission_codes && Array.isArray(menuItem.permission_codes)) {
        for (const permCode of menuItem.permission_codes) {
          const perm = permMap.get(permCode);
          if (perm) {
            await this.prisma.menuPermission.create({
              data: {
                menu_id: menu.id,
                permission_id: perm.id,
              },
            });
            this.logger.log(`  → Added permission ${permCode} to menu group ${menu.code}`);
          } else {
            this.logger.warn(`  → Permission ${permCode} not found for menu group ${menu.code}`);
          }
        }
      }
      
      createdMenus.set(menu.code, menu);
      this.logger.log(`Created menu: ${menu.code}${parentId ? ` (parent: ${menuItem.parent_code})` : ''}${requiredPermissionId ? ` (permission: ${menuItem.permission_code})` : ''}`);
    }

    this.logger.log(`✅ Menus seeding completed - Total: ${createdMenus.size}`);
    this.logger.log(`   - Menu ROUTE: có 1 permission (required_permission)`);
    this.logger.log(`   - Menu GROUP: có thể có nhiều permissions (menu_permissions)`);
  }

  private sortMenusByParent(menus: Array<any>): Array<any> {
    const result: Array<any> = [];
    const processed = new Set<string>();

    // First pass: add all menus without parents
    for (const menu of menus) {
      if (!menu.parent_code && (menu.parent_id === null || menu.parent_id === undefined)) {
        result.push(menu);
        processed.add(menu.code);
      }
    }

    // Second pass: add children
    let changed = true;
    while (changed) {
      changed = false;
      for (const menu of menus) {
        if (!processed.has(menu.code)) {
          if (!menu.parent_code || processed.has(menu.parent_code)) {
            result.push(menu);
            processed.add(menu.code);
            changed = true;
          }
        }
      }
    }

    return result;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing menus...');
    await this.prisma.menu.deleteMany({});
    this.logger.log('Menus cleared');
  }
}
