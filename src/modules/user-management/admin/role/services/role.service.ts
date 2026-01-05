import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, In } from 'typeorm';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { Context } from '@/shared/entities/context.entity';
import { RoleContext } from '@/shared/entities/role-context.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { Filters, Options } from '@/common/base/interfaces/list.interface';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';
import { getCurrentContext, getCurrentGroup } from '@/common/utils/group-ownership.util';

@Injectable()
export class RoleService extends CrudService<Role> {
  private get permRepo(): Repository<Permission> {
    return this.repository.manager.getRepository(Permission);
  }

  private get contextRepo(): Repository<Context> {
    return this.repository.manager.getRepository(Context);
  }

  private get roleContextRepo(): Repository<RoleContext> {
    return this.repository.manager.getRepository(RoleContext);
  }

  // Biến tạm để lưu context_ids khi create/update
  private tempContextIds: number[] | null = null;

  constructor(
    @InjectRepository(Role) protected readonly repository: Repository<Role>,
    private readonly rbacCache: RbacCacheService,
  ) {
    super(repository);
  }

  /**
   * Override prepareOptions để load relations
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    const context = RequestContext.get<Context>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;

    // Base relations
    const baseRelations = ['parent', 'children', 'permissions', 'role_contexts'];

    // System admin → load thêm role_contexts.context
    if (!context || context.type === 'system') {
      return {
        ...base,
        relations: [
          ...baseRelations,
          'role_contexts.context'
        ].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
      } as any;
    }

    // Context admin → load role_contexts và context
    return {
      ...base,
      relations: [
        ...baseRelations,
        'role_contexts',
        'role_contexts.context'
      ].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    } as any;
  }

  /**
   * Override prepareFilters để filter roles theo context
   * Query role IDs có trong context và dùng In() operator để filter
   */
  protected override async prepareFilters(
    filters?: Filters<Role>,
    _options?: Options,
  ): Promise<boolean | any> {
    const prepared = { ...(filters || {}) };

    // Lấy context từ RequestContext
    const context = await getCurrentContext(this.contextRepo);
    const contextId = RequestContext.get<number>('contextId') || 1;

    // System admin (context.type = 'system') → không filter, lấy tất cả
    if (!context || context.type === 'system') {
      return prepared;
    }

    // Context admin → query role IDs có trong context
    const roleContexts = await this.roleContextRepo.find({
      where: { context_id: contextId } as any,
      select: ['role_id'],
    });

    const roleIds = roleContexts.map(rc => rc.role_id);

    // Nếu không có role nào trong context, trả về false để skip query (trả về empty result)
    if (roleIds.length === 0) {
      return false;
    }

    // Thêm filter id: In(roleIds) để chỉ lấy roles có trong context
    return {
      ...prepared,
      id: In(roleIds),
    };
  }


  /**
   * Override getOne - tương tự product service
   * Controller đã truyền relations trong options rồi
   */
  override async getOne(where: any, options?: any): Promise<Role | null> {
    return super.getOne(where, options);
  }

  /**
   * Transform data sau khi lấy danh sách để chỉ giữ các fields cần thiết
   */
  protected async afterGetList(
    data: Role[],
    filters?: any,
    options?: any
  ): Promise<Role[]> {
    return data.map(role => {
      if (role.parent) {
        const { id, code, name, status } = role.parent;
        role.parent = { id, code, name, status } as any;
      }
      if (role.children) {
        role.children = role.children.map(child => {
          const { id, code, name, status } = child;
          return { id, code, name, status } as any;
        });
      }
      if (role.permissions) {
        role.permissions = role.permissions.map(perm => {
          const { id, code, name, status } = perm;
          return { id, code, name, status } as any;
        });
      }
      // Transform role_contexts để trả về contexts và context_ids cho FE
      if (role.role_contexts) {
        const contextId = RequestContext.get<number>('contextId') || 1;
        const context = RequestContext.get<Context>('context');
        
        // Nếu không phải system admin, chỉ lấy role_contexts của context hiện tại
        let filteredRoleContexts = role.role_contexts;
        if (context && context.type !== 'system') {
          filteredRoleContexts = role.role_contexts.filter(rc => rc.context_id === contextId);
        }
        
        (role as any).context_ids = filteredRoleContexts.map(rc => Number(rc.context_id));
        // Trả về thông tin context đầy đủ để hiển thị ở giao diện
        (role as any).contexts = filteredRoleContexts
          .filter(rc => rc.context) // Chỉ lấy những context đã load
          .map(rc => {
            const ctx = rc.context!;
            return {
              id: Number(ctx.id),
              type: ctx.type,
              name: ctx.name,
              status: ctx.status,
              ref_id: ctx.ref_id ? Number(ctx.ref_id) : null,
            };
          });
        // Bỏ role_contexts khỏi response để tránh dư thừa (đã có contexts và context_ids)
        delete (role as any).role_contexts;
      } else {
        (role as any).context_ids = [];
        (role as any).contexts = [];
      }
      return role;
    });
  }

  /**
   * Transform data sau khi lấy một entity
   */
  protected async afterGetOne(
    entity: Role,
    where?: any,
    options?: any
  ): Promise<Role> {
    if (entity.parent) {
      const { id, code, name, status } = entity.parent;
      entity.parent = { id, code, name, status } as any;
    }
    if (entity.children) {
      entity.children = entity.children.map(child => {
        const { id, code, name, status } = child;
        return { id, code, name, status } as any;
      });
    }
    if (entity.permissions) {
      entity.permissions = entity.permissions.map(perm => {
        const { id, code, name, status } = perm;
        return { id, code, name, status } as any;
      });
    }
    // Transform role_contexts để trả về contexts và context_ids cho FE
    if (entity.role_contexts) {
      const contextId = RequestContext.get<number>('contextId') || 1;
      const context = RequestContext.get<Context>('context');
      
      // Nếu không phải system admin, chỉ lấy role_contexts của context hiện tại
      let filteredRoleContexts = entity.role_contexts;
      if (context && context.type !== 'system') {
        filteredRoleContexts = entity.role_contexts.filter(rc => rc.context_id === contextId);
      }
      
      (entity as any).context_ids = filteredRoleContexts.map(rc => Number(rc.context_id));
      // Trả về thông tin context đầy đủ để hiển thị ở giao diện
      (entity as any).contexts = filteredRoleContexts
        .filter(rc => rc.context) // Chỉ lấy những context đã load
        .map(rc => {
          const ctx = rc.context!;
          return {
            id: Number(ctx.id),
            type: ctx.type,
            name: ctx.name,
            status: ctx.status,
            ref_id: ctx.ref_id ? Number(ctx.ref_id) : null,
          };
        });
      // Bỏ role_contexts khỏi response để tránh dư thừa (đã có contexts và context_ids)
      delete (entity as any).role_contexts;
    } else {
      (entity as any).context_ids = [];
      (entity as any).contexts = [];
    }
    return entity;
  }

  protected async beforeCreate(
    entity: Role,
    createDto: DeepPartial<Role>,
    response?: ResponseRef<Role | null>
  ): Promise<boolean> {
    // Validate code unique
    const code = (createDto as any).code;
    if (code) {
      const exists = await this.repository.findOne({ where: { code } as any });
      if (exists) {
        if (response) {
          response.message = 'Role code already exists';
          response.code = 'ROLE_CODE_EXISTS';
        }
        return false;
      }
    }

    // Handle parent_id
    const parentId = (createDto as any).parent_id;
    if (parentId) {
      const parent = await this.repository.findOne({ where: { id: parentId } as any });
      if (parent) {
        (createDto as any).parent = parent;
      }
      delete (createDto as any).parent_id;
    }

    // Handle context_ids - lưu vào biến tạm để xử lý sau khi create
    const contextIds = (createDto as any).context_ids;
    if (contextIds && Array.isArray(contextIds) && contextIds.length > 0) {
      // Validate contexts exist
      const contexts = await this.contextRepo.findBy({ id: In(contextIds) });
      if (contexts.length !== contextIds.length) {
        if (response) {
          response.message = 'Some context IDs are invalid';
          response.code = 'INVALID_CONTEXT_IDS';
        }
        return false;
      }
      // Lưu vào biến tạm để xử lý trong afterCreate
      this.tempContextIds = contextIds;
    } else {
      this.tempContextIds = [];
    }
    delete (createDto as any).context_ids;

    return true;
  }

  /**
   * Override afterCreate để lưu context_ids vào role_contexts
   */
  protected async afterCreate(
    entity: Role,
    createDto: DeepPartial<Role>,
  ): Promise<void> {
    if (this.tempContextIds !== null) {
      if (this.tempContextIds.length > 0) {
        const roleContexts = this.tempContextIds.map(contextId =>
          this.roleContextRepo.create({
            role_id: entity.id,
            context_id: contextId,
          }),
        );
        await this.roleContextRepo.save(roleContexts);
      }
      // Reset biến tạm
      this.tempContextIds = null;
    }
  }

  protected async beforeUpdate(
    entity: Role,
    updateDto: DeepPartial<Role>,
    response?: ResponseRef<Role | null>
  ): Promise<boolean> {
    // Validate code unique (exclude current)
    const code = (updateDto as any).code;
    if (code && code !== entity.code) {
      const exists = await this.repository.findOne({ where: { code } as any });
      if (exists) {
        if (response) {
          response.message = 'Role code already exists';
          response.code = 'ROLE_CODE_EXISTS';
        }
        return false;
      }
    }

    // Handle parent_id
    const parentId = (updateDto as any).parent_id;
    if (parentId !== undefined) {
      if (parentId === null) {
        (updateDto as any).parent = null;
      } else {
        const parent = await this.repository.findOne({ where: { id: parentId } as any });
        if (parent) {
          (updateDto as any).parent = parent;
        }
      }
      delete (updateDto as any).parent_id;
    }

    // Handle context_ids - lưu vào biến tạm để xử lý sau khi update
    const contextIds = (updateDto as any).context_ids;
    if (contextIds !== undefined) {
      if (Array.isArray(contextIds) && contextIds.length > 0) {
        // Validate contexts exist
        const contexts = await this.contextRepo.findBy({ id: In(contextIds) });
        if (contexts.length !== contextIds.length) {
          if (response) {
            response.message = 'Some context IDs are invalid';
            response.code = 'INVALID_CONTEXT_IDS';
          }
          return false;
        }
        // Lưu vào biến tạm để xử lý trong afterUpdate
        this.tempContextIds = contextIds;
      } else {
        // context_ids = [] hoặc null → xóa hết contexts
        this.tempContextIds = [];
      }
    }
    delete (updateDto as any).context_ids;

    return true;
  }

  /**
   * Override afterUpdate để sync context_ids vào role_contexts
   */
  protected async afterUpdate(
    entity: Role,
    updateDto: DeepPartial<Role>,
  ): Promise<void> {
    if (this.tempContextIds !== null) {
      // Xóa tất cả contexts cũ
      await this.roleContextRepo.delete({ role_id: entity.id });

      // Thêm contexts mới
      if (this.tempContextIds.length > 0) {
        const roleContexts = this.tempContextIds.map(contextId =>
          this.roleContextRepo.create({
            role_id: entity.id,
            context_id: contextId,
          }),
        );
        await this.roleContextRepo.save(roleContexts);
      }
      // Reset biến tạm
      this.tempContextIds = null;
    }
  }

  protected async beforeDelete(
    entity: Role,
    response?: ResponseRef<null>
  ): Promise<boolean> {
    // Check if role has children
    const childrenCount = await this.repository.count({ where: { parent: { id: entity.id } } as any });
    if (childrenCount > 0) {
      if (response) {
        response.message = 'Cannot delete role with children';
        response.code = 'ROLE_HAS_CHILDREN';
      }
      return false;
    }

    // Check if role is assigned to users
    const userCount = await this.repository.manager
      .getRepository('User')
      .count({ where: { roles: { id: entity.id } } as any });

    if (userCount > 0) {
      if (response) {
        response.message = 'Cannot delete role assigned to users';
        response.code = 'ROLE_ASSIGNED_TO_USERS';
      }
      return false;
    }

    return true;
  }

  /**
   * Assign permissions to role (sync - replace all)
   */
  async assignPermissions(roleId: number, permissionIds: number[]) {
    const role = await this.repository.findOne({
      where: { id: roleId } as any,
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (permissionIds.length > 0) {
      const permissions = await this.permRepo.findBy({ id: In(permissionIds) });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Some permission IDs are invalid');
      }
      role.permissions = permissions;
    } else {
      role.permissions = [];
    }

    const saved = await this.repository.save(role);
    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }
    return saved;
  }
}


