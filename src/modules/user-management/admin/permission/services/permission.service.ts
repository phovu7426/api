import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Permission } from '@/shared/entities/permission.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

@Injectable()
export class PermissionService extends CrudService<Permission> {
  constructor(
    @InjectRepository(Permission) protected readonly repository: Repository<Permission>,
    private readonly rbacCache: RbacCacheService,
  ) {
    super(repository);
  }

  protected prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['parent', 'children'],
    } as any;
  }

  protected async beforeCreate(
    entity: Permission,
    createDto: DeepPartial<Permission>,
    response?: ResponseRef<Permission | null>
  ): Promise<boolean> {
    // Validate code unique
    const code = (createDto as any).code;
    if (code) {
      const exists = await this.repository.findOne({ where: { code } as any });
      if (exists) {
        if (response) {
          response.message = 'Permission code already exists';
          response.code = 'PERMISSION_CODE_EXISTS';
        }
        return false;
      }
    }

    // Handle parent_id
    const parentId = (createDto as any).parent_id;
    if (parentId !== undefined) {
      if (parentId === null) {
        (createDto as any).parent = null;
      } else {
        const parent = await this.repository.findOne({ where: { id: parentId } as any });
        if (parent) {
          (createDto as any).parent = parent;
        }
      }
      delete (createDto as any).parent_id;
    }

    return true;
  }

  protected async beforeUpdate(
    entity: Permission,
    updateDto: DeepPartial<Permission>,
    response?: ResponseRef<Permission | null>
  ): Promise<boolean> {
    // Validate code unique (exclude current)
    const code = (updateDto as any).code;
    if (code && code !== entity.code) {
      const exists = await this.repository.findOne({ where: { code } as any });
      if (exists) {
        if (response) {
          response.message = 'Permission code already exists';
          response.code = 'PERMISSION_CODE_EXISTS';
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

    // RBAC changed (permission updated) might affect users; bump version to invalidate cache
    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }
    return true;
  }

  protected async beforeDelete(
    entity: Permission,
    response?: ResponseRef<null>
  ): Promise<boolean> {
    // Check if permission has children
    const childrenCount = await this.repository.count({ where: { parent: { id: entity.id } } as any });
    if (childrenCount > 0) {
      if (response) {
        response.message = 'Cannot delete permission with children';
        response.code = 'PERMISSION_HAS_CHILDREN';
      }
      return false;
    }

    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }
    return true;
  }
}


