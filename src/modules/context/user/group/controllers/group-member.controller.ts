import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';
import { UserGroupService } from '../services/group.service';

/**
 * Controller cho Owner/User quản lý Members trong Group
 * Routes: /api/groups/:id/members
 * 
 * Route không có "admin" vì đây là quản lý trong context của group,
 * không phải system admin. Permission check sẽ quyết định ai được phép.
 */
@Controller('groups')
export class GroupMemberController {
  constructor(
    private readonly groupService: UserGroupService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Thêm member vào group (owner hoặc user có permission trong context)
   */
  @Permission('group.member.add')
  @Post(':id/members')
  async addMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Body() body: { user_id: number; role_ids: number[] },
  ) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    await this.groupService.addMember(groupId, body.user_id, body.role_ids, userId);
    return { message: 'Member added successfully' };
  }

  /**
   * Gán roles cho member trong group (owner hoặc user có permission trong context)
   */
  @Permission('group.member.manage')
  @Put(':id/members/:memberId/roles')
  async assignRolesToMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() body: { role_ids: number[] },
  ) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    await this.groupService.assignRolesToMember(groupId, memberId, body.role_ids, userId);
    return { message: 'Roles assigned successfully' };
  }

  /**
   * Xóa member khỏi group (owner hoặc user có permission trong context)
   */
  @Permission('group.member.remove')
  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    await this.groupService.removeMember(groupId, memberId, userId);
    return { message: 'Member removed successfully' };
  }

  /**
   * Lấy danh sách members của group
   */
  @Permission('public')
  @Get(':id/members')
  async getGroupMembers(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.getGroupMembers(id);
  }
}

