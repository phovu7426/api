import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '@/shared/entities/group.entity';
import { Context } from '@/shared/entities/context.entity';
import { UserGroup } from '@/shared/entities/user-group.entity';
import { User } from '@/shared/entities/user.entity';
import { Role } from '@/shared/entities/role.entity';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { ListService } from '@/common/base/services/list.service';

@Injectable()
export class AdminGroupService extends ListService<Group> {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Context)
    private readonly contextRepo: Repository<Context>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly rbacService: RbacService,
  ) {
    super(groupRepo);
  }

  /**
   * Kiểm tra user có phải system admin không
   */
  async isSystemAdmin(userId: number): Promise<boolean> {
    return this.rbacService.userHasPermissionsInGroup(userId, null, [
      'system.manage',
      'group.manage',
    ]);
  }

  /**
   * Tạo group mới (chỉ system admin)
   * Bắt buộc phải có context_id
   */
  async createGroup(
    data: {
      type: string;
      code: string;
      name: string;
      description?: string;
      metadata?: any;
      owner_id?: number;
      context_id: number;
    },
    requesterUserId: number,
  ): Promise<Group> {
    // Check system admin
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can create groups');
    }

    // Check context exists
    const context = await this.contextRepo.findOne({
      where: { id: data.context_id, status: 'active' },
    });
    if (!context) {
      throw new NotFoundException(`Context with id ${data.context_id} not found`);
    }

    // Check code unique
    const existing = await this.groupRepo.findOne({
      where: { code: data.code },
    });
    if (existing) {
      throw new BadRequestException(`Group with code "${data.code}" already exists`);
    }

    // Create group
    const group = this.groupRepo.create({
      type: data.type,
      code: data.code,
      name: data.name,
      description: data.description,
      metadata: data.metadata,
      owner_id: data.owner_id || null,
      context_id: data.context_id,
      status: 'active',
    });
    const savedGroup = await this.groupRepo.save(group);

    // Nếu có owner, tự động thêm owner vào user_groups và gán role 'admin'
    if (savedGroup.owner_id) {
      // Thêm owner vào user_groups
      const userGroupRepo = this.groupRepo.manager.getRepository(UserGroup);
      const existingUserGroup = await userGroupRepo.findOne({
        where: { user_id: savedGroup.owner_id, group_id: savedGroup.id },
      });

      if (!existingUserGroup) {
        await userGroupRepo.save({
          user_id: savedGroup.owner_id,
          group_id: savedGroup.id,
          joined_at: new Date(),
        });
      }

      // Gán role admin cho owner
      const ownerRole = await this.roleRepo.findOne({
        where: { code: 'admin' } as any,
      });
      if (ownerRole) {
        await this.rbacService.assignRoleToUser(savedGroup.owner_id, ownerRole.id, savedGroup.id);
      }
    }

    return savedGroup;
  }

  /**
   * Lấy group theo ID
   */
  async findById(id: number): Promise<Group | null> {
    return this.groupRepo.findOne({
      where: { id, status: 'active' },
      relations: ['context'],
    });
  }

  /**
   * Lấy group theo code
   */
  async findByCode(code: string): Promise<Group | null> {
    return this.groupRepo.findOne({
      where: { code, status: 'active' },
      relations: ['context'],
    });
  }

  /**
   * Update group (chỉ system admin)
   */
  async updateGroup(id: number, data: Partial<{ name: string; description: string; metadata: any }>): Promise<Group> {
    const group = await this.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    Object.assign(group, data);
    return this.groupRepo.save(group);
  }

  /**
   * Delete group (soft delete)
   */
  async deleteGroup(id: number): Promise<void> {
    const group = await this.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Soft delete
    await this.groupRepo.softDelete(id);
  }
}

