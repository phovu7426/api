import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@/shared/entities/user.entity';
import { Profile } from '@/shared/entities/profile.entity';
import { Context } from '@/shared/entities/context.entity';
import { ChangePasswordDto } from '@/modules/user-management/admin/user/dtos/change-password.dto';
import { CrudService } from '@/common/base/services/crud.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { Filters, Options } from '@/common/base/interfaces/list.interface';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';
import { getCurrentContext, getCurrentGroup } from '@/common/utils/group-ownership.util';

@Injectable()
export class UserService extends CrudService<User> {
  private get profileRepo(): Repository<Profile> {
    return this.repository.manager.getRepository(Profile);
  }

  // Biến tạm để lưu role_ids khi update
  private tempRoleIds: number[] | null = null;

  constructor(
    @InjectRepository(User) protected readonly repository: Repository<User>,
    private readonly rbacService: RbacService,
  ) {
    super(repository);
  }

  /**
   * Override getOne để đảm bảo load relations trong admin
   * Optimize: Load profile và user_role_assignments trong cùng query để tránh N+1
   */
  async getOne(
    where: any,
    options?: any,
  ) {
    const adminOptions = {
      ...options,
      relations: ['user_role_assignments', 'profile'],
    };
    return super.getOne(where, adminOptions);
  }

  private get contextRepo(): Repository<Context> {
    return this.repository.manager.getRepository(Context);
  }

  /**
   * Override prepareFilters để filter users theo context
   * Query user IDs có trong context và dùng In() operator để filter
   */
  protected override async prepareFilters(
    filters?: Filters<User>,
    _options?: Options,
  ): Promise<boolean | any> {
    const prepared = { ...(filters || {}) };

    // Lấy context từ RequestContext
    const context = RequestContext.get<Context>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;

    // System admin (context.type = 'system') → không filter, lấy tất cả
    if (!context || context.type === 'system') {
      return prepared;
    }

    // ✅ MỚI: Group admin → query user IDs có trong groups của context này
    const groupId = RequestContext.get<number | null>('groupId');
    
    // System context (id=1) → không filter, lấy tất cả users
    if (contextId === 1 || !groupId) {
      return prepared;
    }

    // Query users thuộc group này từ user_groups
    const userGroupRepo = this.repository.manager.getRepository('UserGroup');
    const userGroups = await userGroupRepo.find({
      where: { group_id: groupId } as any,
      select: ['user_id'],
    });

    const userIds = userGroups.map(ug => (ug as any).user_id);

    // Nếu không có user nào trong group, trả về false để skip query (trả về empty result)
    if (userIds.length === 0) {
      return false;
    }

    // Thêm filter id: In(userIds) để chỉ lấy users có trong group
    return {
      ...prepared,
      id: In(userIds),
    };
  }

  /**
   * Override prepareOptions để đảm bảo load relations trong admin
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['user_role_assignments', 'profile'],
    } as any;
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.repository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    user.password = await bcrypt.hash(dto.password, 10);
    await this.repository.save(user as any);
  }

  protected async beforeCreate(_entity: User, createDto: DeepPartial<User>): Promise<boolean> {
    if ((createDto as any).password) {
      (createDto as any).password = await bcrypt.hash((createDto as any).password, 10);
    }
    
    // Handle role_ids - lưu vào biến tạm để xử lý sau khi create
    const roleIds = (createDto as any).role_ids;
    if (roleIds !== undefined) {
      if (Array.isArray(roleIds)) {
        // Lưu vào biến tạm để xử lý trong afterCreate
        this.tempRoleIds = roleIds.map(id => Number(id)).filter(id => !isNaN(id));
      } else {
        // role_ids không phải array → không gán roles
        this.tempRoleIds = [];
      }
    }
    delete (createDto as any).role_ids;
    
    if ('profile' in (createDto as any)) delete (createDto as any).profile;
    return true;
  }

  protected async afterCreate(entity: User, createDto: DeepPartial<User>): Promise<void> {
    // Xử lý profile
    const profilePayload = (createDto as any).profile ?? null;
    if (profilePayload) {
      // Kiểm tra xem profile đã tồn tại chưa (1 user chỉ có 1 profile)
      const existingProfile = await this.profileRepo.findOne({ where: { userId: entity.id } });
      if (!existingProfile) {
        const profile = this.profileRepo.create({ ...(profilePayload as any), userId: entity.id });
        await this.profileRepo.save(profile);
      }
    }

    // Xử lý role_ids - gán roles cho user mới trong context hiện tại
    if (this.tempRoleIds !== null && this.tempRoleIds.length > 0) {
      // ✅ MỚI: Lấy groupId từ RequestContext (đã được set bởi GroupInterceptor)
      const groupId = RequestContext.get<number | null>('groupId');
      
      if (!groupId) {
        // System context - không có group, skip role assignment
        // Hoặc có thể tạo SYSTEM_ADMIN group assignment nếu cần
        this.tempRoleIds = null;
        return;
      }
      
      // Sync roles (gán roles cho user mới)
      // Bỏ qua validation vì đây là admin API
      await this.rbacService.syncRolesInGroup(
        entity.id,
        groupId,
        this.tempRoleIds,
        true // skipValidation = true cho admin API
      );
      
      // Reset biến tạm
      this.tempRoleIds = null;
    }
  }

  protected async beforeUpdate(_entity: User, updateDto: DeepPartial<User>): Promise<boolean> {
    if ((updateDto as any).password) {
      (updateDto as any).password = await bcrypt.hash((updateDto as any).password, 10);
    } else if ('password' in (updateDto as any)) {
      delete (updateDto as any).password;
    }
    
    // Handle role_ids - lưu vào biến tạm để xử lý sau khi update
    const roleIds = (updateDto as any).role_ids;
    if (roleIds !== undefined) {
      if (Array.isArray(roleIds)) {
        // Lưu vào biến tạm để xử lý trong afterUpdate
        this.tempRoleIds = roleIds.map(id => Number(id)).filter(id => !isNaN(id));
      } else {
        // role_ids không phải array → xóa hết roles
        this.tempRoleIds = [];
      }
    }
    delete (updateDto as any).role_ids;
    
    if ('profile' in (updateDto as any)) delete (updateDto as any).profile;
    return true;
  }

  protected async afterUpdate(entity: User, updateDto: DeepPartial<User>): Promise<void> {
    // Xử lý profile
    const profilePayload = (updateDto as any).profile ?? null;
    if (profilePayload && Object.keys(profilePayload).length) {
      // 1 user chỉ có 1 profile, tìm profile hiện tại hoặc tạo mới
      let profile = await this.profileRepo.findOne({ where: { userId: entity.id } });
      if (profile) {
        // Cập nhật profile hiện tại
        Object.assign(profile, profilePayload as any);
        await this.profileRepo.save(profile);
      } else {
        // Tạo profile mới nếu chưa có
        const createdProfile = this.profileRepo.create({ ...(profilePayload as any), userId: entity.id });
        await this.profileRepo.save(createdProfile);
      }
    }

    // ✅ MỚI: Xử lý role_ids - đồng bộ lại toàn bộ roles trong group hiện tại
    if (this.tempRoleIds !== null) {
      // Lấy groupId từ RequestContext (đã được set bởi GroupInterceptor)
      const groupId = RequestContext.get<number | null>('groupId');
      
      if (!groupId) {
        // System context - không có group, skip role assignment
        this.tempRoleIds = null;
        return;
      }
      
      // Sync roles (xóa toàn bộ roles cũ và thêm roles mới)
      // Bỏ qua validation vì đây là admin API, user đã có quyền update user thì có quyền gán roles
      await this.rbacService.syncRolesInGroup(
        entity.id,
        groupId,
        this.tempRoleIds,
        true // skipValidation = true cho admin API
      );
      
      // Reset biến tạm
      this.tempRoleIds = null;
    }
  }

  protected async afterDelete(entity: User): Promise<void> {
    // Xóa profile sau khi xóa user
    try {
      const profile = await this.profileRepo.findOne({ where: { userId: entity.id } });
      if (profile) {
        await this.profileRepo.remove(profile);
      }
    } catch (error) {
      // Log error nhưng không throw vì user đã được xóa
      // Removed console.error for production
    }
  }

  /**
   * Transform data sau khi lấy một entity để thêm role_ids và làm sạch response
   */
  protected async afterGetOne(
    entity: User,
    where?: any,
    options?: any
  ): Promise<User> {
    // ✅ MỚI: Lấy role_ids từ user_role_assignments của group hiện tại
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId && (entity as any).user_role_assignments) {
      const roleIds = (entity as any).user_role_assignments
        .filter((ura: any) => ura.group_id === groupId)
        .map((ura: any) => ura.role_id);
      (entity as any).role_ids = roleIds;
      // Xóa user_role_assignments khỏi response để tránh dư thừa (đã có role_ids)
      delete (entity as any).user_role_assignments;
    } else {
      (entity as any).role_ids = [];
    }

    // Xóa contexts khỏi response nếu không cần thiết (đã có role_ids)
    if ((entity as any).contexts) {
      delete (entity as any).contexts;
    }

    return entity;
  }

  /**
   * Transform data sau khi lấy danh sách để thêm role_ids cho mỗi user và làm sạch response
   */
  protected async afterGetList(
    data: User[],
    filters?: any,
    options?: any
  ): Promise<User[]> {
    // ✅ MỚI: Lấy role_ids từ user_role_assignments của group hiện tại
    const groupId = RequestContext.get<number | null>('groupId');

    return data.map(user => {
      // Lấy role_ids từ user_role_assignments của group hiện tại
      if (groupId && (user as any).user_role_assignments) {
        const roleIds = (user as any).user_role_assignments
          .filter((ura: any) => ura.group_id === groupId)
          .map((ura: any) => ura.role_id);
        
        (user as any).role_ids = roleIds;
        // Xóa user_role_assignments khỏi response để tránh dư thừa (đã có role_ids)
        delete (user as any).user_role_assignments;
      } else {
        (user as any).role_ids = [];
      }

      // Xóa contexts khỏi response nếu không cần thiết (đã có role_ids)
      if ((user as any).contexts) {
        delete (user as any).contexts;
      }

      return user;
    });
  }
}


