import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Menu, MenuPermission } from '@/shared/entities/menu.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';
import { MenuType } from '@/shared/enums/menu-type.enum';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedMenus {
  private readonly logger = new Logger(SeedMenus.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding menus...');

    const menuRepo = this.dataSource.getRepository(Menu);
    const permRepo = this.dataSource.getRepository(Permission);
    const userRepo = this.dataSource.getRepository(User);

    // Xóa tất cả menu cũ để tạo lại từ đầu
    this.logger.log('Clearing existing menus...');
    await menuRepo
      .createQueryBuilder()
      .delete()
      .execute();
    this.logger.log('Cleared all existing menus');

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'systemadmin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Get permissions
    const permissions = await permRepo.find();
    const permMap = new Map<string, Permission>();
    permissions.forEach(perm => permMap.set(perm.code, perm));

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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.GROUP,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.GROUP,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.GROUP,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 31,
        is_public: false,
        show_in_menu: true,
        permission_code: 'menu.manage',
      },
      
      // ========== TRUYỆN TRANH (GROUP - check nhiều quyền) ==========
      {
        code: 'comic-management',
        name: 'Truyện tranh',
        path: '/admin/comics',
        api_path: 'api/admin/comics',
        icon: '📚',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 40,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage', // Permission chính
        permission_codes: ['comic.manage', 'comic_category.manage', 'chapter.manage'], // Nhiều quyền cho group
      },
      {
        code: 'comics',
        name: 'Truyện tranh',
        path: '/admin/comics',
        api_path: 'api/admin/comics',
        icon: '📖',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'comic-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic.manage',
      },
      {
        code: 'comic-categories',
        name: 'Danh mục truyện tranh',
        path: '/admin/comic-categories',
        api_path: 'api/admin/comic-categories',
        icon: '📂',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'comic-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'comic_category.manage',
      },
      {
        code: 'chapters',
        name: 'Chương',
        path: '/admin/chapters',
        api_path: 'api/admin/chapters',
        icon: '📑',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'comic-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'chapter.manage',
      },
      
      // ========== BÀI VIẾT (GROUP) ==========
      {
        code: 'post-management',
        name: 'Bài viết',
        path: '/admin/posts',
        api_path: 'api/admin/posts',
        icon: '📝',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.GROUP,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
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
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 120,
        is_public: false,
        show_in_menu: true,
        permission_code: 'notification.manage',
      },
    ];

    this.logger.log(`Will create ${menuData.length} menus (mỗi menu chỉ có 1 permission)`);

    const createdMenus = new Map<string, Menu>();

    // Sort menus: parents first
    const sortedMenus = this.sortMenusByParent(menuData);

    for (const menuItem of sortedMenus) {
      
      let parent: Menu | null = null;
      if (menuItem.parent_code) {
        parent = createdMenus.get(menuItem.parent_code) || null;
        if (!parent) {
          // Tìm parent trong DB nếu chưa có trong createdMenus
          parent = await menuRepo.findOne({ where: { code: menuItem.parent_code } as any });
          if (parent) {
            createdMenus.set(parent.code, parent);
          } else {
            this.logger.warn(`Parent menu not found for ${menuItem.code}, skipping parent relation`);
          }
        }
      }

      // Menu có 1 permission chính (required_permission)
      let requiredPermission: Permission | null = null;
      if (menuItem.permission_code) {
        requiredPermission = permMap.get(menuItem.permission_code) || null;
        if (!requiredPermission) {
          this.logger.warn(`Permission ${menuItem.permission_code} not found for menu ${menuItem.code}`);
        }
      }

      const menu = menuRepo.create({
        code: menuItem.code,
        name: menuItem.name,
        path: menuItem.path,
        api_path: menuItem.api_path,
        icon: menuItem.icon,
        type: menuItem.type,
        status: menuItem.status,
        parent: parent,
        sort_order: menuItem.sort_order,
        is_public: menuItem.is_public,
        show_in_menu: menuItem.show_in_menu,
        required_permission: requiredPermission, // Permission chính
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });

      const saved = await menuRepo.save(menu);
      
      // Nếu là menu GROUP và có nhiều permissions, tạo MenuPermission records
      if (saved.type === MenuType.GROUP && menuItem.permission_codes && Array.isArray(menuItem.permission_codes)) {
        const menuPermissionRepo = this.dataSource.getRepository(MenuPermission);
        for (const permCode of menuItem.permission_codes) {
          const perm = permMap.get(permCode);
          if (perm) {
            const menuPermission = menuPermissionRepo.create({
              menu_id: saved.id,
              permission_id: perm.id,
            });
            await menuPermissionRepo.save(menuPermission);
            this.logger.log(`  → Added permission ${permCode} to menu group ${saved.code}`);
          } else {
            this.logger.warn(`  → Permission ${permCode} not found for menu group ${saved.code}`);
          }
        }
      }
      
      createdMenus.set(saved.code, saved);
      this.logger.log(`Created menu: ${saved.code}${parent ? ` (parent: ${parent.code})` : ''}${requiredPermission ? ` (permission: ${requiredPermission.code})` : ''}`);
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
    const menuRepo = this.dataSource.getRepository(Menu);
    await menuRepo.clear();
    this.logger.log('Menus cleared');
  }
}
