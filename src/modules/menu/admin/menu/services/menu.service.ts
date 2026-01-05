import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Menu } from '@/shared/entities/menu.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { MenuTreeItem } from '@/modules/menu/admin/menu/interfaces/menu-tree-item.interface';

@Injectable()
export class MenuService extends CrudService<Menu> {
  private readonly logger = new Logger(MenuService.name);

  private get permRepo(): Repository<Permission> {
    return this.repository.manager.getRepository(Permission);
  }

  constructor(
    @InjectRepository(Menu) protected readonly repository: Repository<Menu>,
    @Inject(RbacService) private readonly rbacService: RbacService,
  ) {
    super(repository);
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['parent', 'children', 'required_permission', 'menu_permissions'],
    } as any;
  }

  protected async beforeCreate(
    entity: Menu,
    createDto: DeepPartial<Menu>,
    response?: ResponseRef<Menu | null>
  ): Promise<boolean> {
    const code = (createDto as any).code;
    if (code) {
      const exists = await this.getOne({ code } as any);
      if (exists) {
        if (response) {
          response.message = 'Menu code already exists';
          response.code = 'MENU_CODE_EXISTS';
        }
        return false;
      }
    }

    const parentId = (createDto as any).parent_id;
    if (parentId) {
      const parent = await this.getOne({ id: parentId } as any);
      if (parent) {
        (createDto as any).parent = parent;
      }
      delete (createDto as any).parent_id;
    }

    const permissionId = (createDto as any).required_permission_id;
    if (permissionId) {
      const permission = await this.permRepo.findOne({ where: { id: permissionId } });
      if (permission) {
        (createDto as any).required_permission = permission;
      }
      delete (createDto as any).required_permission_id;
    }

    return true;
  }

  protected async beforeUpdate(
    entity: Menu,
    updateDto: DeepPartial<Menu>,
    response?: ResponseRef<Menu | null>
  ): Promise<boolean> {
    const code = (updateDto as any).code;
    if (code && code !== entity.code) {
      const exists = await this.getOne({ code } as any);
      if (exists) {
        if (response) {
          response.message = 'Menu code already exists';
          response.code = 'MENU_CODE_EXISTS';
        }
        return false;
      }
    }

    const parentId = (updateDto as any).parent_id;
    if (parentId !== undefined) {
      if (parentId === null) {
        (updateDto as any).parent = null;
      } else {
        const parent = await this.getOne({ id: parentId } as any);
        if (parent) {
          (updateDto as any).parent = parent;
        }
      }
      delete (updateDto as any).parent_id;
    }

    const permissionId = (updateDto as any).required_permission_id;
    if (permissionId !== undefined) {
      if (permissionId === null) {
        (updateDto as any).required_permission = null;
      } else {
        const permission = await this.permRepo.findOne({ where: { id: permissionId } });
        if (permission) {
          (updateDto as any).required_permission = permission;
        }
      }
      delete (updateDto as any).required_permission_id;
    }

    return true;
  }

  /**
   * Get menu tree for admin (no permission filtering)
   */
  async getTree(): Promise<MenuTreeItem[]> {
    const result = await this.getList(
      {},
      {
        page: 1,
        limit: 10000, // Get all menus for tree
        sort: 'sort_order:ASC',
        relations: ['parent', 'children', 'required_permission'],
      }
    );

    return this.buildTree(result.data);
  }

  /**
   * Get menu tree filtered by user permissions in context
   */
  async getUserMenus(
    userId: number,
    options?: { include_inactive?: boolean; flatten?: boolean; contextId?: number }
  ): Promise<MenuTreeItem[]> {
    const includeInactive = options?.include_inactive || false;
    const flatten = options?.flatten || false;
    
    // ✅ MỚI: Lấy groupId từ RequestContext (group-based)
    const groupId = RequestContext.get<number | null>('groupId');
    
    // Lấy context từ RequestContext hoặc từ group
    let context = RequestContext.get<any>('context');
    let contextType: string | null = null;
    
    if (groupId) {
      // Nếu có groupId, lấy context từ group
      const groupRepo = this.repository.manager.getRepository('Group');
      const group = await groupRepo.findOne({ 
        where: { id: groupId },
        relations: ['context']
      } as any);
      
      if (group && group.context) {
        context = group.context;
        contextType = group.context.type;
      } else if (group && group.context_id) {
        const contextRepo = this.repository.manager.getRepository('Context');
        context = await contextRepo.findOne({ where: { id: group.context_id } } as any);
        contextType = context?.type || null;
      }
    } else {
      // Nếu không có groupId, lấy từ RequestContext
      context = RequestContext.get<any>('context');
      contextType = context?.type || null;
    }
    
    // Fallback: nếu không có context type, dùng system
    if (!contextType) {
      contextType = 'system';
    }

    // Query menus using QueryBuilder to properly load nested relations
    // ✅ MỚI: Không filter theo context prefix nữa, chỉ filter theo permission
    const queryBuilder = this.repository.createQueryBuilder('menu')
      .leftJoinAndSelect('menu.parent', 'parent')
      .leftJoinAndSelect('menu.children', 'children')
      .leftJoinAndSelect('menu.required_permission', 'required_permission')
      .leftJoinAndSelect('menu.menu_permissions', 'menu_permissions')
      .leftJoinAndSelect('menu_permissions.permission', 'permission')
      .where('menu.show_in_menu = :showInMenu', { showInMenu: true });

    this.logger.debug(`Getting all menus for user ${userId} in groupId=${groupId}, contextType=${contextType}`);

    if (!includeInactive) {
      queryBuilder.andWhere('menu.status = :status', { status: BasicStatus.Active });
    }

    queryBuilder.orderBy('menu.sort_order', 'ASC');

    const menus = await queryBuilder.getMany();
    
    // Log menu codes để debug
    const menuCodes = menus.map(m => m.code).join(', ');
    this.logger.debug(`Query result: Found ${menus.length} menus with codes: [${menuCodes}]`);

    // Nếu không có menu nào, trả về empty
    if (!menus || menus.length === 0) {
      this.logger.warn(`No menus found for user ${userId} in groupId ${groupId}`);
      return [];
    }

    this.logger.debug(`Found ${menus.length} menus, checking permissions for user ${userId} in groupId ${groupId}`);
    
    // ✅ MỚI: Lấy tất cả permissions của user trong group để check
    // Build set of all permissions user has
    const allPerms = new Set<string>();
    const testPerms = menus
      .filter(m => m.required_permission?.code || m.menu_permissions?.length)
      .flatMap(m => [
        ...(m.required_permission?.code ? [m.required_permission.code] : []),
        ...(m.menu_permissions?.map(mp => mp.permission?.code).filter(Boolean) || []),
      ]);

    // Check từng permission một cách hiệu quả
    for (const perm of new Set(testPerms)) {
      // ✅ Dùng group-based permissions: user lấy menu dựa vào quyền trong group
      const hasPerm = await this.rbacService.userHasPermissionsInGroup(userId, groupId ?? null, [perm]);
      if (hasPerm) {
        allPerms.add(perm);
      }
    }

    // Filter menus by permissions (không có bypass)
    // ✅ MỚI: Mỗi menu chỉ có 1 permission (required_permission), không cần check menu_permissions nữa
    let filteredMenus = menus.filter(menu => {
      // Menu public luôn hiển thị
      if (menu.is_public) {
        this.logger.debug(`Menu ${menu.code}: PUBLIC - showing`);
        return true;
      }
      
      // Menu không có permission requirement → hiển thị
      const hasNoPermissionRequirement = 
        (!menu.required_permission_id && !menu.required_permission);
      
      if (hasNoPermissionRequirement) {
        this.logger.debug(`Menu ${menu.code}: NO PERMISSION REQUIREMENT - showing`);
        return true;
      }
      
      // ✅ MỚI: Menu có required_permission → check user có permission trong group không
      if (menu.required_permission?.code) {
        const hasRequiredPerm = allPerms.has(menu.required_permission.code);
        this.logger.debug(`Menu ${menu.code}: required_permission=${menu.required_permission.code}, has=${hasRequiredPerm}, userPerms=[${Array.from(allPerms).join(', ')}]`);
        if (hasRequiredPerm) {
          return true;
        }
      }
      
      // Fallback: Nếu vẫn dùng menu_permissions (legacy)
      if (menu.menu_permissions && menu.menu_permissions.length > 0) {
        const menuPermCodes = menu.menu_permissions.map(mp => mp.permission?.code).filter(Boolean);
        const hasAnyPerm = menuPermCodes.some(code => allPerms.has(code));
        this.logger.debug(`Menu ${menu.code}: menu_permissions=[${menuPermCodes.join(', ')}], hasAny=${hasAnyPerm}`);
        if (hasAnyPerm) {
          return true;
        }
      }
      
      this.logger.debug(`Menu ${menu.code}: FILTERED OUT - no matching permissions. required_permission=${menu.required_permission?.code || 'none'}, userPerms=[${Array.from(allPerms).join(', ')}]`);
      return false;
    });

    // ✅ MỚI: Filter các menu system-only (chỉ hiển thị trong system group)
    // Các menu này chỉ hiển thị khi context type là 'system'
    if (contextType !== 'system') {
      const systemOnlyPermissions = [
        'role.manage',
        'permission.manage',
        'group.manage',
        'system.manage',
        'config.manage',
      ];
      
      const systemOnlyMenuCodes = [
        'roles',
        'permissions',
        'groups',
        'contexts',
        'config-general',
        'config-email',
        'rbac-management',
        'config-management',
      ];
      
      filteredMenus = filteredMenus.filter(menu => {
        // Check theo permission code
        if (menu.required_permission?.code && systemOnlyPermissions.includes(menu.required_permission.code)) {
          this.logger.debug(`Menu ${menu.code}: SYSTEM-ONLY (permission=${menu.required_permission.code}) - filtered out for contextType=${contextType}`);
          return false;
        }
        
        // Check theo menu code
        if (systemOnlyMenuCodes.includes(menu.code)) {
          this.logger.debug(`Menu ${menu.code}: SYSTEM-ONLY (menu code) - filtered out for contextType=${contextType}`);
          return false;
        }
        
        return true;
      });
    }

    this.logger.debug(`Filtered ${filteredMenus.length} menus from ${menus.length} total menus for user ${userId} in groupId ${groupId}, contextType=${contextType}`);
    const filteredMenuCodes = filteredMenus.map(m => m.code).join(', ');
    this.logger.debug(`Filtered menu codes: [${filteredMenuCodes}]`);

    const tree = this.buildTree(filteredMenus);
    this.logger.debug(`Built tree with ${tree.length} root items`);
    return flatten ? this.flattenTree(tree) : tree;
  }

  /**
   * Build tree structure from flat menu list
   */
  private buildTree(menus: Menu[]): MenuTreeItem[] {
    const menuMap = new Map<number, MenuTreeItem>();
    const rootMenus: MenuTreeItem[] = [];

    menus.forEach(menu => {
      menuMap.set(menu.id, {
        id: menu.id,
        code: menu.code,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        type: menu.type,
        status: menu.status,
        children: [],
        allowed: true,
      });
    });

    menus.forEach(menu => {
      const item = menuMap.get(menu.id)!;
      if (menu.parent_id && menuMap.has(menu.parent_id)) {
        menuMap.get(menu.parent_id)!.children!.push(item);
      } else {
        rootMenus.push(item);
      }
    });

    const sortTree = (items: MenuTreeItem[]) => {
      items.sort((a, b) => {
        const menuA = menus.find(m => m.id === a.id);
        const menuB = menus.find(m => m.id === b.id);
        return (menuA?.sort_order || 0) - (menuB?.sort_order || 0);
      });
      items.forEach(item => item.children && sortTree(item.children));
    };

    sortTree(rootMenus);
    return rootMenus;
  }

  /**
   * Flatten tree to array
   */
  private flattenTree(tree: MenuTreeItem[]): MenuTreeItem[] {
    const result: MenuTreeItem[] = [];
    const traverse = (items: MenuTreeItem[]) => {
      items.forEach(item => {
        result.push({ ...item, children: undefined });
        if (item.children?.length) traverse(item.children);
      });
    };
    traverse(tree);
    return result;
  }
}

