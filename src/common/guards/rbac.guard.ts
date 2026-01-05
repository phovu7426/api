import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMS_REQUIRED_KEY, PUBLIC_PERMISSION } from '@/common/decorators/rbac.decorators';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { Auth } from '@/common/utils/auth.util';
import { RequestContext } from '@/common/utils/request-context.util';
import { ResponseUtil } from '@/common/utils/response.util';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbac: RbacService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMS_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];

    // Secure-by-default: nếu không có @Permission() → chặn truy cập
    if (requiredPerms.length === 0) {
      const response = ResponseUtil.forbidden('Access denied.');
      throw new HttpException(response, response.httpStatus || HttpStatus.FORBIDDEN);
    }

    // Nếu có @Permission('public') → không cần check quyền
    if (requiredPerms.includes(PUBLIC_PERMISSION)) return true;

    // Lấy userId từ context (đã được set bởi JwtAuthGuard nếu có token hợp lệ)
    const userId = Auth.id(context);

    if (!userId) {
      const response = ResponseUtil.unauthorized('Authentication required');
      throw new HttpException(response, response.httpStatus || HttpStatus.UNAUTHORIZED);
    }

    // ✅ MỚI: Lấy groupId thay vì contextId
    const groupId = RequestContext.get<number | null>('groupId') ?? null; // Có thể null

    // ✅ MỚI: Check permissions trong group
    const ok = await this.rbac.userHasPermissionsInGroup(userId, groupId, requiredPerms);
    
    if (!ok) {
      const response = ResponseUtil.forbidden(
        `Access denied. Required permissions: ${requiredPerms.join(', ')}`
      );
      throw new HttpException(response, response.httpStatus || HttpStatus.FORBIDDEN);
    }

    return true;
  }
}

