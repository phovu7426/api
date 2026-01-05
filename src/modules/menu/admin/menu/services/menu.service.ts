import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { MenuTreeItem } from '@/modules/menu/admin/menu/interfaces/menu-tree-item.interface';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(RbacService) private readonly rbacService: RbacService,
  ) {}

  /**
   * Get simple list (without relations)
   */
  async getSimpleList(filters?: any, options?: any) {
    return this.getList(filters, options);
  }

  /**
   * Get list of menus
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.MenuWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.code && { code: { contains: filters.code } }),
      ...(filters?.parent_id !== undefined && { parent_id: filters.parent_id ? BigInt(filters.parent_id) : null }),
      deleted_at: null,
    };

    const orderBy: Prisma.MenuOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ sort_order: 'asc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.menu.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          parent: true,
          children: true,
          required_permission: true,
          menu_permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      this.prisma.menu.count({ where }),
    ]);

    return {
      data: data.map((menu: any) => ({
        ...menu,
        id: Number(menu.id),
        parent_id: menu.parent_id ? Number(menu.parent_id) : null,
        required_permission_id: menu.required_permission_id ? Number(menu.required_permission_id) : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get one menu
   */
  async getOne(where: any): Promise<any | null> {
    const whereInput: Prisma.MenuWhereInput = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.code && { code: where.code }),
      deleted_at: null,
    };

    const menu = await this.prisma.menu.findFirst({
      where: whereInput,
      include: {
        parent: true,
        children: true,
        required_permission: true,
        menu_permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!menu) {
      return null;
    }

    return {
      ...menu,
      id: Number(menu.id),
      parent_id: menu.parent_id ? Number(menu.parent_id) : null,
      required_permission_id: menu.required_permission_id ? Number(menu.required_permission_id) : null,
    };
  }

  /**
   * Create menu
   */
  async create(data: any, createdBy?: number) {
    // Check code unique
    if (data.code) {
      const exists = await this.getOne({ code: data.code });
      if (exists) {
        throw new Error('Menu code already exists');
      }
    }

    return this.prisma.menu.create({
      data: {
        code: data.code,
        name: data.name,
        path: data.path ?? null,
        icon: data.icon ?? null,
        type: data.type ?? 'menu',
        status: data.status ?? BasicStatus.active,
        show_in_menu: data.show_in_menu ?? true,
        sort_order: data.sort_order ?? 0,
        is_public: data.is_public ?? false,
        parent_id: data.parent_id ? BigInt(data.parent_id) : null,
        required_permission_id: data.required_permission_id ? BigInt(data.required_permission_id) : null,
        created_user_id: createdBy ?? null,
        updated_user_id: createdBy ?? null,
      },
      include: {
        parent: true,
        children: true,
        required_permission: true,
        menu_permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Update menu
   */
  async update(id: number, data: any, updatedBy?: number) {
    const existing = await this.prisma.menu.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new Error(`Menu with ID ${id} not found`);
    }

    // Check code unique if changed
    if (data.code && data.code !== existing.code) {
      const exists = await this.getOne({ code: data.code });
      if (exists) {
        throw new Error('Menu code already exists');
      }
    }

    return this.prisma.menu.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.path !== undefined && { path: data.path }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.show_in_menu !== undefined && { show_in_menu: data.show_in_menu }),
        ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
        ...(data.is_public !== undefined && { is_public: data.is_public }),
        ...(data.parent_id !== undefined && { parent_id: data.parent_id ? BigInt(data.parent_id) : null }),
        ...(data.required_permission_id !== undefined && { required_permission_id: data.required_permission_id ? BigInt(data.required_permission_id) : null }),
        updated_user_id: updatedBy ?? existing.updated_user_id,
      },
      include: {
        parent: true,
        children: true,
        required_permission: true,
        menu_permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Delete menu (soft delete)
   */
  async delete(id: number) {
    return this.prisma.menu.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
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
    
    // Get groupId from RequestContext
    const groupId = RequestContext.get<number | null>('groupId');
    
    // Get context from RequestContext or from group
    let context = RequestContext.get<any>('context');
    let contextType: string | null = null;
    
    if (groupId) {
      // If has groupId, get context from group
      const group = await this.prisma.group.findUnique({
        where: { id: BigInt(groupId) },
        include: {
          context: true,
        },
      });
      
      if (group?.context) {
        context = group.context;
        contextType = group.context.type;
      } else if (group?.context_id) {
        const contextData = await this.prisma.context.findUnique({
          where: { id: group.context_id },
        });
        context = contextData;
        contextType = contextData?.type || null;
      }
    } else {
      // If no groupId, get from RequestContext
      context = RequestContext.get<any>('context');
      contextType = context?.type || null;
    }
    
    // Fallback: if no context type, use system
    if (!contextType) {
      contextType = 'system';
    }

    // Query menus
    const where: Prisma.MenuWhereInput = {
      show_in_menu: true,
      ...(!includeInactive && { status: BasicStatus.active }),
      deleted_at: null,
    };

    const menus = await this.prisma.menu.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      include: {
        parent: true,
        children: true,
        required_permission: true,
        menu_permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    
    this.logger.debug(`Query result: Found ${menus.length} menus for user ${userId} in groupId=${groupId}, contextType=${contextType}`);

    // If no menus, return empty
    if (!menus || menus.length === 0) {
      this.logger.warn(`No menus found for user ${userId} in groupId ${groupId}`);
      return [];
    }

    this.logger.debug(`Found ${menus.length} menus, checking permissions for user ${userId} in groupId ${groupId}`);
    
    // Get all permissions user has
    const allPerms = new Set<string>();
    const testPerms = menus
      .filter((m: any) => m.required_permission?.code || m.menu_permissions?.length)
      .flatMap((m: any) => [
        ...(m.required_permission?.code ? [m.required_permission.code] : []),
        ...(m.menu_permissions?.map((mp: any) => mp.permission?.code).filter((code: any) => Boolean(code)) || []),
      ]);

    // Check each permission
    for (const perm of new Set(testPerms)) {
      const permStr = String(perm); // Convert to string
      const hasPerm = await this.rbacService.userHasPermissionsInGroup(userId, groupId ?? null, [permStr]);
      if (hasPerm) {
        allPerms.add(permStr);
      }
    }

    // Filter menus by permissions
    let filteredMenus = menus.filter((menu: any) => {
      // Menu public always show
      if (menu.is_public) {
        this.logger.debug(`Menu ${menu.code}: PUBLIC - showing`);
        return true;
      }
      
      // Menu no permission requirement → show
      const hasNoPermissionRequirement = 
        (!menu.required_permission_id && !menu.required_permission);
      
      if (hasNoPermissionRequirement) {
        this.logger.debug(`Menu ${menu.code}: NO PERMISSION REQUIREMENT - showing`);
        return true;
      }
      
      // Menu has required_permission → check user has permission in group
      if (menu.required_permission?.code) {
        const hasRequiredPerm = allPerms.has(menu.required_permission.code);
        this.logger.debug(`Menu ${menu.code}: required_permission=${menu.required_permission.code}, has=${hasRequiredPerm}`);
        if (hasRequiredPerm) {
          return true;
        }
      }
      
      // Fallback: If still using menu_permissions (legacy)
      if (menu.menu_permissions && menu.menu_permissions.length > 0) {
        const menuPermCodes = menu.menu_permissions.map((mp: any) => mp.permission?.code).filter((code: any) => Boolean(code));
        const hasAnyPerm = menuPermCodes.some((code: any) => allPerms.has(code));
        this.logger.debug(`Menu ${menu.code}: menu_permissions=[${menuPermCodes.join(', ')}], hasAny=${hasAnyPerm}`);
        if (hasAnyPerm) {
          return true;
        }
      }
      
      this.logger.debug(`Menu ${menu.code}: FILTERED OUT - no matching permissions`);
      return false;
    });

    // Filter system-only menus (only show in system group)
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
      
      filteredMenus = filteredMenus.filter((menu: any) => {
        // Check by permission code
        if (menu.required_permission?.code && systemOnlyPermissions.includes(menu.required_permission.code)) {
          this.logger.debug(`Menu ${menu.code}: SYSTEM-ONLY (permission=${menu.required_permission.code}) - filtered out`);
          return false;
        }
        
        // Check by menu code
        if (systemOnlyMenuCodes.includes(menu.code)) {
          this.logger.debug(`Menu ${menu.code}: SYSTEM-ONLY (menu code) - filtered out`);
          return false;
        }
        
        return true;
      });
    }

    this.logger.debug(`Filtered ${filteredMenus.length} menus from ${menus.length} total menus`);

    const tree = this.buildTree(filteredMenus.map((m: any) => ({
      ...m,
      id: Number(m.id),
      parent_id: m.parent_id ? Number(m.parent_id) : null,
    })));
    this.logger.debug(`Built tree with ${tree.length} root items`);
    return flatten ? this.flattenTree(tree) : tree;
  }

  /**
   * Build tree structure from flat menu list
   */
  private buildTree(menus: any[]): MenuTreeItem[] {
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

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.MenuOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.MenuOrderByWithRelationInput;
    });
  }
}
