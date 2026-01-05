import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from '@/common/utils/request-context.util';
import { AdminContextService } from '@/modules/context/admin/context/services/context.service';
import { AdminGroupService } from '@/modules/context/admin/group/services/group.service';
import { UserGroupService } from '@/modules/context/user/group/services/group.service';
import { Auth } from '@/common/utils/auth.util';

@Injectable()
export class GroupInterceptor implements NestInterceptor {
  constructor(
    private readonly contextService: AdminContextService,
    private readonly groupService: AdminGroupService,
    private readonly userGroupService: UserGroupService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // ✅ Chỉ dùng group_id, không cần context_id
    const groupIdFromHeader = request.headers['x-group-id'];
    const groupIdFromQuery = (request.query as any)?.group_id;

    if (groupIdFromHeader || groupIdFromQuery) {
      // Nếu có group_id trong request
      const groupId = Number(groupIdFromHeader || groupIdFromQuery);
      const group = await this.groupService.findById(groupId);
      
      if (!group) {
        throw new BadRequestException('Group not found');
      }
      
      // Validate user có quyền truy cập group này không
      const userId = Auth.id(context);
      if (userId) {
        const userGroups = await this.userGroupService.getUserGroups(userId);
        const hasAccess = userGroups.some((g: any) => g.id === group.id);
        
        if (!hasAccess) {
          throw new ForbiddenException(
            `Access denied to group ${group.id}. You do not have permission to access this group.`
          );
        }
      }
      
      // Set group và context từ group
      RequestContext.set('groupId', group.id);
      if (group.context) {
        RequestContext.set('context', group.context);
        RequestContext.set('contextId', group.context.id);
      } else {
        // Load context nếu chưa có
        const contextEntity = await this.contextService.findById(group.context_id);
        if (contextEntity) {
          RequestContext.set('context', contextEntity);
          RequestContext.set('contextId', contextEntity.id);
        }
      }
    } else {
      // Không có group_id → tự động resolve group từ user's groups
      const userId = Auth.id(context);
      
      if (userId) {
        // Lấy groups mà user là member
        const userGroups = await this.userGroupService.getUserGroups(userId);
        
        if (userGroups.length > 0) {
          // Ưu tiên group không phải system (shop/comic) hơn system group
          let selectedGroup = userGroups.find((g: any) => g.type !== 'system') || userGroups[0];
          
          if (selectedGroup) {
            RequestContext.set('groupId', selectedGroup.id);
            
            // Load context từ group
            const group = await this.groupService.findById(selectedGroup.id);
            if (group && group.context) {
              RequestContext.set('context', group.context);
              RequestContext.set('contextId', group.context.id);
            } else if (selectedGroup.context?.id) {
              const contextEntity = await this.contextService.findById(Number(selectedGroup.context.id));
              if (contextEntity) {
                RequestContext.set('context', contextEntity);
                RequestContext.set('contextId', contextEntity.id);
              }
            }
          } else {
            // Fallback: system group
            const systemGroup = await this.groupService.findByCode('system');
            if (systemGroup) {
              RequestContext.set('groupId', systemGroup.id);
              const systemContext = await this.contextService.findById(1);
              if (systemContext) {
                RequestContext.set('context', systemContext);
                RequestContext.set('contextId', 1);
              }
            } else {
              RequestContext.set('contextId', 1);
              RequestContext.set('groupId', null);
            }
          }
        } else {
          // User không có group nào → dùng system context
          RequestContext.set('contextId', 1);
          RequestContext.set('groupId', null);
        }
      } else {
        // Chưa authenticated → dùng system context
        RequestContext.set('contextId', 1);
        RequestContext.set('groupId', null);
      }
    }
    
    return next.handle();
  }
}

