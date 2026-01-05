import { ForbiddenException } from '@nestjs/common';
import { RequestContext } from '@/common/utils/request-context.util';
import { PrismaService } from '@/core/database/prisma/prisma.service';

/**
 * Interface cho entity có group_id
 */
export interface GroupOwnedEntity {
  group_id?: number | null;
}

/**
 * Helper function: Lấy group hiện tại từ RequestContext
 * Nếu chưa có trong cache, sẽ query từ database và cache lại
 * 
 * @param prisma - PrismaService (optional, chỉ cần khi chưa có trong cache)
 * @returns Group hoặc null
 * 
 * @example
 * ```typescript
 * const group = await getCurrentGroup(this.prisma);
 * if (group && group.type === 'system') {
 *   // System admin logic
 * }
 * ```
 */
export async function getCurrentGroup(
  prisma?: PrismaService
): Promise<any | null> {
  // Thử lấy từ RequestContext cache trước
  const groupId = RequestContext.get<number | null>('groupId');
  if (!groupId) {
    return null;
  }

  // Nếu có prisma, query và cache lại
  if (prisma) {
    const group = await prisma.group.findUnique({
      where: { id: BigInt(groupId) },
      include: {
        context: true,
      },
    });

    if (group && !group.deleted_at) {
      const groupData = {
        ...group,
        id: Number(group.id),
        context_id: Number(group.context_id),
        owner_id: group.owner_id ? Number(group.owner_id) : null,
        context: group.context ? {
          ...group.context,
          id: Number(group.context.id),
          ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
        } : null,
      };
      RequestContext.set('group', groupData);
      if (group.context) {
        RequestContext.set('context', {
          ...group.context,
          id: Number(group.context.id),
          ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
        });
        RequestContext.set('contextId', Number(group.context.id));
      }
      return groupData;
    }
    return null;
  }

  // Nếu không có prisma, chỉ trả về null
  return null;
}

/**
 * Helper function: Lấy context hiện tại từ RequestContext (từ group)
 * Nếu chưa có trong cache, sẽ query từ database và cache lại
 * 
 * @param prisma - PrismaService (optional, chỉ cần khi chưa có trong cache)
 * @returns Context hoặc null
 * 
 * @example
 * ```typescript
 * const context = await getCurrentContext(this.prisma);
 * if (context && context.type === 'system') {
 *   // System admin logic
 * }
 * ```
 */
export async function getCurrentContext(
  prisma?: PrismaService
): Promise<any | null> {
  // Thử lấy từ RequestContext cache trước
  const cachedContext = RequestContext.get<any>('context');
  if (cachedContext) {
    return cachedContext;
  }

  // Nếu chưa có và có prisma, query từ groupId
  if (prisma) {
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId) {
      // Query context từ group
      const group = await prisma.group.findUnique({
        where: { id: BigInt(groupId) },
        include: {
          context: true,
        },
      });
      
      if (group && group.context && !group.deleted_at) {
        const contextData = {
          ...group.context,
          id: Number(group.context.id),
          ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
        };
        RequestContext.set('context', contextData);
        RequestContext.set('contextId', Number(group.context.id));
        return contextData;
      } else if (group && group.context_id) {
        const context = await prisma.context.findUnique({
          where: { id: group.context_id },
        });
        if (context && !context.deleted_at) {
          const contextData = {
            ...context,
            id: Number(context.id),
            ref_id: context.ref_id ? Number(context.ref_id) : null,
          };
          RequestContext.set('context', contextData);
          RequestContext.set('contextId', Number(context.id));
          return contextData;
        }
      }
    } else {
      // Fallback: system context
      const contextId = RequestContext.get<number>('contextId') || 1;
      const context = await prisma.context.findUnique({
        where: { id: BigInt(contextId) },
      });
      if (context && !context.deleted_at) {
        const contextData = {
          ...context,
          id: Number(context.id),
          ref_id: context.ref_id ? Number(context.ref_id) : null,
        };
        RequestContext.set('context', contextData);
        RequestContext.set('contextId', Number(context.id));
        return contextData;
      }
    }
  }

  // Nếu không có prisma, chỉ trả về null
  return null;
}

/**
 * Verify ownership: kiểm tra entity có thuộc về group hiện tại không
 * 
 * @param entity - Entity có group_id (Product, Order, Post, Coupon, Warehouse, ...)
 * @throws ForbiddenException nếu không có quyền truy cập
 * 
 * @example
 * ```typescript
 * verifyGroupOwnership(product);
 * verifyGroupOwnership(order);
 * ```
 */
export function verifyGroupOwnership(entity: GroupOwnedEntity): void {
  const groupId = RequestContext.get<number | null>('groupId');
  const contextId = RequestContext.get<number>('contextId');

  // System context (id=1) hoặc không có groupId → có thể truy cập tất cả entities
  if (contextId === 1 || !groupId) {
    return;
  }

  // Group khác: chỉ được truy cập entities có group_id = groupId hiện tại
  if (entity.group_id !== null && entity.group_id !== undefined) {
    if (entity.group_id !== groupId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập bản ghi này. Bản ghi thuộc về group khác.'
      );
    }
  } else {
    // Entity không có group_id (global) → chỉ system group mới được truy cập
    throw new ForbiddenException(
      'Bạn không có quyền truy cập bản ghi này. Bản ghi này thuộc về system group.'
    );
  }
}

/**
 * @deprecated Use verifyGroupOwnership instead
 * Verify ownership: kiểm tra entity có thuộc về group hiện tại không
 */
export function verifyContextOwnership(entity: GroupOwnedEntity): void {
  verifyGroupOwnership(entity);
}
