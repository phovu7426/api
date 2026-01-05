import { Controller, Put, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { Auth } from '@/common/utils/auth.util';
import { ExecutionContext } from '@nestjs/common';

@Controller('admin/users')
export class RbacController {
  constructor(private readonly service: RbacService) {}

  /**
   * Sync roles cho user trong group (thay thế toàn bộ roles hiện tại trong group)
   * System admin (có permission role.manage) có thể bỏ qua validation
   * Group_id tự động lấy từ RequestContext (không cần truyền trong body)
   */
  @Permission('role.manage')
  @LogRequest()
  @Put(':id/roles')
  async syncRoles(
    @Param('id', ParseIntPipe) targetUserId: number,
    @Body() body: { role_ids: number[] },
    context?: ExecutionContext,
  ) {
    // Lấy groupId từ RequestContext (đã được set bởi GroupInterceptor)
    const groupId = RequestContext.get<number | null>('groupId');
    
    if (!groupId) {
      throw new BadRequestException('Group ID is required. Please specify X-Group-Id header or group_id query parameter');
    }
    
    // Check nếu user hiện tại là system admin (có permission role.manage)
    const currentUserId = Auth.id(context);
    const isSystemAdmin = currentUserId 
      ? await this.service.userHasPermissionsInGroup(currentUserId, null, ['role.manage'])
      : false;
    
    // System admin có thể bỏ qua validation (có thể gán bất kỳ role nào)
    const skipValidation = isSystemAdmin;
    
    return this.service.syncRolesInGroup(targetUserId, groupId, body.role_ids || [], skipValidation);
  }
}



