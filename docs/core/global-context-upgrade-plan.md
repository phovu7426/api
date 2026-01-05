# Kế Hoạch Nâng Cấp: Global Context System

## 🎯 Tổng Quan

Thiết kế mới loại bỏ hoàn toàn khái niệm "admin đặc biệt" và thay vào đó sử dụng **Global Context** để thống nhất mọi quyền. Mọi thứ đều là context, không có ngoại lệ.

### Ý Tưởng Cốt Lõi

**System Admin thực chất chỉ là admin của một "Global Context"**

- ✅ KHÔNG có ngoại lệ
- ✅ KHÔNG có `if (isAdmin)`
- ✅ Mọi quyền đều thống nhất theo 1 công thức

---

## 📊 1. Database Schema Changes

### 1.1. Tạo Bảng `contexts`

**Mục đích**: Lưu thông tin các context (system, shop, group, project, ...)

```sql
CREATE TABLE contexts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,              -- 'system' | 'shop' | 'group' | 'project' | ...
  ref_id BIGINT UNSIGNED NULL,            -- NULL cho system context, ID của shop/group/project cho các context khác
  name VARCHAR(255) NOT NULL,
  status VARCHAR(30) DEFAULT 'active',
  created_user_id BIGINT UNSIGNED NULL,
  updated_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  
  INDEX idx_type (type),
  INDEX idx_ref_id (ref_id),
  INDEX idx_deleted_at (deleted_at),
  UNIQUE KEY uk_type_ref_id (type, ref_id)  -- Đảm bảo mỗi shop/group chỉ có 1 context
);
```

**Dữ liệu mẫu:**
```sql
INSERT INTO contexts (id, type, ref_id, name) VALUES
(1, 'system', NULL, 'System'),
(2, 'shop', 101, 'Shop A'),
(3, 'group', 9, 'One Piece Team');
```

### 1.2. Thay Đổi Bảng `user_roles` → `user_context_roles`

**Hiện tại:**
```sql
user_roles (
  user_id BIGINT UNSIGNED,
  role_id BIGINT UNSIGNED,
  PRIMARY KEY (user_id, role_id)
)
```

**Mới:**
```sql
-- Migration: Rename và thêm context_id
ALTER TABLE user_roles 
  RENAME TO user_context_roles,
  ADD COLUMN context_id BIGINT UNSIGNED NOT NULL AFTER user_id,
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (user_id, context_id, role_id),
  ADD FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
  ADD INDEX idx_context_id (context_id);
```

**Cấu trúc mới:**
```sql
user_context_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  context_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, context_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  INDEX idx_context_id (context_id)
)
```

**Dữ liệu mẫu:**
```sql
-- System admin
INSERT INTO user_context_roles (user_id, context_id, role_id) VALUES
(1, 1, 1);  -- User 1 có role system_admin trong context system

-- Shop admin
INSERT INTO user_context_roles (user_id, context_id, role_id) VALUES
(2, 2, 3);  -- User 2 có role shop_admin trong context shop#101

-- Multi-context user
INSERT INTO user_context_roles (user_id, context_id, role_id) VALUES
(3, 1, 2),  -- User 3 có role viewer trong context system
(3, 2, 4);  -- User 3 có role editor trong context shop#101
```

### 1.3. Thêm Cột `scope` Vào Bảng `permissions`

**Migration:**
```sql
ALTER TABLE permissions 
  ADD COLUMN scope VARCHAR(30) NOT NULL DEFAULT 'context' AFTER code,
  ADD INDEX idx_scope (scope);
```

**Cấu trúc mới:**
```sql
permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(120) NOT NULL UNIQUE,
  scope VARCHAR(30) NOT NULL DEFAULT 'context',  -- 'system' | 'context'
  name VARCHAR(150) NULL,
  status VARCHAR(30) DEFAULT 'active',
  parent_id BIGINT UNSIGNED NULL,
  ...
  INDEX idx_scope (scope)
)
```

**Dữ liệu mẫu:**
```sql
-- System permissions
INSERT INTO permissions (code, scope, name) VALUES
('system.context.create', 'system', 'Create Context'),
('system.user.ban', 'system', 'Ban User'),
('system.role.manage', 'system', 'Manage Roles');

-- Context permissions
INSERT INTO permissions (code, scope, name) VALUES
('product.edit', 'context', 'Edit Product'),
('chapter.approve', 'context', 'Approve Chapter'),
('order.view', 'context', 'View Order');
```

---

## 🏗️ 2. Entity Changes

### 2.1. Tạo Entity `Context`

**File:** `src/shared/entities/context.entity.ts`

```typescript
import { Entity, Column, ManyToMany, JoinTable, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('contexts')
@Index(['type', 'ref_id'], { unique: true })
@Index('idx_deleted_at', ['deleted_at'])
export class Context extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  type: string;  // 'system' | 'shop' | 'group' | 'project' | ...

  @Column({ type: 'bigint', nullable: true })
  ref_id?: number | null;  // NULL cho system, ID của shop/group/project cho các context khác

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  // Relations
  @ManyToMany(() => User, (user) => user.contexts, { cascade: false })
  @JoinTable({
    name: 'user_context_roles',
    joinColumn: { name: 'context_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users?: User[];

  @OneToMany(() => UserContextRole, (ucr) => ucr.context)
  user_context_roles?: UserContextRole[];
}
```

### 2.2. Tạo Entity `UserContextRole`

**File:** `src/shared/entities/user-context-role.entity.ts`

```typescript
import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Context } from './context.entity';
import { Role } from './role.entity';

@Entity('user_context_roles')
@Index(['context_id'])
@Index(['user_id', 'context_id'])
export class UserContextRole {
  @PrimaryColumn({ type: 'bigint' })
  user_id: number;

  @PrimaryColumn({ type: 'bigint' })
  context_id: number;

  @PrimaryColumn({ type: 'bigint' })
  role_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Context, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'context_id' })
  context?: Context;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role?: Role;
}
```

### 2.3. Cập Nhật Entity `User`

**File:** `src/shared/entities/user.entity.ts`

```typescript
// Thêm relation mới
@ManyToMany(() => Context, (context) => context.users, { cascade: false })
@JoinTable({
  name: 'user_context_roles',
  joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'context_id', referencedColumnName: 'id' },
})
contexts?: Context[];

@OneToMany(() => UserContextRole, (ucr) => ucr.user)
user_context_roles?: UserContextRole[];

// Giữ lại roles relation (deprecated, sẽ migrate dần)
@ManyToMany(() => Role, (role) => role.users, { cascade: false })
@JoinTable({
  name: 'user_roles',  // Giữ tên cũ để migration
  joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
})
roles?: Role[];  // DEPRECATED: Sử dụng user_context_roles thay thế
```

### 2.4. Cập Nhật Entity `Permission`

**File:** `src/shared/entities/permission.entity.ts`

```typescript
@Column({ type: 'varchar', length: 30, default: 'context' })
scope: string;  // 'system' | 'context'

@Index(['scope'])
```

---

## 🔧 3. Service Changes

### 3.1. Tạo Service `ContextService`

**File:** `src/modules/context/services/context.service.ts`

```typescript
@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(Context)
    private readonly contextRepo: Repository<Context>,
  ) {}

  /**
   * Resolve context từ request
   * - Header: X-Context-Id
   * - Query: ?context_id=1
   * - Default: system context (id=1)
   */
  async resolveContext(req: Request): Promise<Context> {
    const contextId = 
      req.headers['x-context-id'] || 
      (req.query as any).context_id || 
      1;  // Default: system context

    const context = await this.contextRepo.findOne({
      where: { id: Number(contextId), status: 'active' },
    });

    if (!context) {
      throw new NotFoundException('Context not found');
    }

    return context;
  }

  /**
   * Lấy tất cả contexts mà user có quyền truy cập
   */
  async getUserContexts(userId: number): Promise<Context[]> {
    return this.contextRepo
      .createQueryBuilder('context')
      .innerJoin('context.user_context_roles', 'ucr', 'ucr.user_id = :userId', { userId })
      .where('context.status = :status', { status: 'active' })
      .getMany();
  }

  /**
   * Tạo system context mặc định (chạy 1 lần khi setup)
   */
  async createSystemContext(): Promise<Context> {
    const exists = await this.contextRepo.findOne({
      where: { type: 'system', ref_id: null },
    });

    if (exists) return exists;

    const context = this.contextRepo.create({
      type: 'system',
      ref_id: null,
      name: 'System',
      status: 'active',
    });

    return this.contextRepo.save(context);
  }
}
```

### 3.2. Cập Nhật `RbacService`

**File:** `src/modules/rbac/services/rbac.service.ts`

**Thay đổi chính:**

1. **Thêm method `userHasPermissionsInContext`**:
```typescript
/**
 * Kiểm tra user có permissions trong context cụ thể
 */
async userHasPermissionsInContext(
  userId: number, 
  contextId: number, 
  required: string[]
): Promise<boolean> {
  const ACTIVE = 'active';

  // Cache key bao gồm contextId
  const cacheKey = `user_permissions:${userId}:${contextId}`;
  let cached = await this.rbacCache.getUserPermissionsInContext(userId, contextId);
  
  if (!cached) {
    const rows = await this.userRepo
      .createQueryBuilder('user')
      .select(['perm.code AS code', 'perm.scope AS scope', 'parent.code AS parent'])
      .where('user.id = :userId', { userId })
      .innerJoin('user.user_context_roles', 'ucr', 'ucr.context_id = :contextId', { contextId })
      .innerJoin('ucr.role', 'role', 'role.status = :rstatus', { rstatus: ACTIVE })
      .innerJoin('role.permissions', 'perm', 'perm.status = :pstatus', { pstatus: ACTIVE })
      .leftJoin('perm.parent', 'parent')
      .getRawMany<{ code: string; scope: string; parent: string | null }>();

    const set = new Set<string>();
    for (const r of rows) {
      if (r.code) set.add(r.code);
      if (r.parent) set.add(r.parent);
    }
    
    await this.rbacCache.setUserPermissionsInContext(userId, contextId, set);
    cached = set;
  }

  for (const need of required) {
    if (cached.has(need)) return true;
  }
  return false;
}
```

2. **Cập nhật `userHasPermissions` để tương thích ngược** (deprecated):
```typescript
/**
 * @deprecated Sử dụng userHasPermissionsInContext thay thế
 * Tự động resolve context từ request hoặc dùng system context
 */
async userHasPermissions(userId: number, required: string[]): Promise<boolean> {
  // Tương thích ngược: mặc định dùng system context
  return this.userHasPermissionsInContext(userId, 1, required);
}
```

3. **Thêm method `syncRolesInContext`**:
```typescript
/**
 * Sync roles cho user trong context cụ thể
 */
async syncRolesInContext(
  userId: number, 
  contextId: number, 
  roleIds: number[]
) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const context = await this.contextRepo.findOne({ where: { id: contextId } });
  if (!context) throw new NotFoundException('Context not found');

  // Xóa tất cả roles cũ trong context này
  await this.userContextRoleRepo.delete({ user_id: userId, context_id: contextId });

  // Thêm roles mới
  if (roleIds.length > 0) {
    const roles = await this.roleRepo.findBy({ id: In(roleIds) });
    if (roles.length !== roleIds.length) {
      throw new BadRequestException('Some role IDs are invalid');
    }

    const userContextRoles = roles.map(role => 
      this.userContextRoleRepo.create({
        user_id: userId,
        context_id: contextId,
        role_id: role.id,
      })
    );

    await this.userContextRoleRepo.save(userContextRoles);
  }

  // Clear cache
  await this.rbacCache.clearUserPermissionsInContext(userId, contextId);
}
```

### 3.3. Cập Nhật `MenuService`

**File:** `src/modules/menu/admin/menu/services/menu.service.ts`

**Thay đổi:**

1. **Loại bỏ hardcoded `admin@example.com` bypass**:
```typescript
// XÓA dòng này:
const isBypassUser = (options?.user_email || '').toLowerCase() === 'admin@example.com';

// Thay bằng check permission trong context
async getUserMenus(
  userId: number,
  contextId: number,  // Thêm contextId
  options?: { include_inactive?: boolean; flatten?: boolean }
): Promise<MenuTreeItem[]> {
  // Lấy permissions trong context
  const userPermissions = await this.rbacService.getUserPermissionsInContext(
    userId, 
    contextId
  );

  // Filter menus theo permissions (không có bypass)
  const filteredMenus = menus.filter(menu => {
    if (menu.is_public) return true;
    if (menu.required_permission?.code && userPermissions.has(menu.required_permission.code)) return true;
    // ...
  });
}
```

---

## 🛡️ 4. Guard & Middleware Changes

### 4.1. Tạo Interceptor `ContextInterceptor`

**File:** `src/common/interceptors/context.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from '@/common/utils/request-context.util';
import { ContextService } from '@/modules/context/services/context.service';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private readonly contextService: ContextService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // Resolve context từ request
    const resolvedContext = await this.contextService.resolveContext(request);
    
    // Lưu vào RequestContext để dùng trong services
    RequestContext.set('context', resolvedContext);
    RequestContext.set('contextId', resolvedContext.id);
    
    return next.handle();
  }
}
```

### 4.2. Cập Nhật `RbacGuard`

**File:** `src/common/guards/rbac.guard.ts`

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  // ... existing code ...

  const userId = Auth.id(context);
  if (!userId) {
    // ... error ...
  }

  // Lấy contextId từ RequestContext (đã set bởi ContextInterceptor)
  const contextId = RequestContext.get<number>('contextId') || 1;  // Default: system

  // Kiểm tra permissions trong context
  const ok = await this.rbac.userHasPermissionsInContext(userId, contextId, requiredPerms);
  
  if (!ok) {
    // ... error ...
  }

  return true;
}
```

### 4.3. Cập Nhật `RbacCacheService`

**File:** `src/modules/rbac/services/rbac-cache.service.ts`

**Thêm methods:**

```typescript
/**
 * Get user permissions in context
 */
async getUserPermissionsInContext(
  userId: number, 
  contextId: number
): Promise<Set<string> | null> {
  const key = `user_permissions:${userId}:${contextId}`;
  const cached = await this.redis.get(key);
  return cached ? new Set(JSON.parse(cached)) : null;
}

/**
 * Set user permissions in context
 */
async setUserPermissionsInContext(
  userId: number, 
  contextId: number, 
  permissions: Set<string>
): Promise<void> {
  const key = `user_permissions:${userId}:${contextId}`;
  await this.redis.setex(key, 3600, JSON.stringify([...permissions]));
}

/**
 * Clear user permissions in context
 */
async clearUserPermissionsInContext(
  userId: number, 
  contextId: number
): Promise<void> {
  const key = `user_permissions:${userId}:${contextId}`;
  await this.redis.del(key);
}
```

---

## 📝 5. Migration Scripts

### 5.1. Migration: Tạo Bảng `contexts`

**File:** `src/core/database/migrations/XXXXXX-CreateContextsTable.ts`

```typescript
export class CreateContextsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE contexts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        ref_id BIGINT UNSIGNED NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(30) DEFAULT 'active',
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        
        INDEX idx_type (type),
        INDEX idx_ref_id (ref_id),
        INDEX idx_deleted_at (deleted_at),
        UNIQUE KEY uk_type_ref_id (type, ref_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tạo system context mặc định
    await queryRunner.query(`
      INSERT INTO contexts (id, type, ref_id, name, status) 
      VALUES (1, 'system', NULL, 'System', 'active');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS contexts`);
  }
}
```

### 5.2. Migration: Thêm `scope` Vào `permissions`

**File:** `src/core/database/migrations/XXXXXX-AddScopeToPermissions.ts`

```typescript
export class AddScopeToPermissions implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE permissions 
      ADD COLUMN scope VARCHAR(30) NOT NULL DEFAULT 'context' AFTER code,
      ADD INDEX idx_scope (scope);
    `);

    // Cập nhật permissions hiện có: nếu code bắt đầu bằng 'system.' thì scope = 'system'
    await queryRunner.query(`
      UPDATE permissions 
      SET scope = 'system' 
      WHERE code LIKE 'system.%' OR code LIKE 'system:%';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE permissions 
      DROP INDEX idx_scope,
      DROP COLUMN scope;
    `);
  }
}
```

### 5.3. Migration: Chuyển `user_roles` → `user_context_roles`

**File:** `src/core/database/migrations/XXXXXX-MigrateUserRolesToContext.ts`

```typescript
export class MigrateUserRolesToContext implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tạo bảng mới
    await queryRunner.query(`
      CREATE TABLE user_context_roles (
        user_id BIGINT UNSIGNED NOT NULL,
        context_id BIGINT UNSIGNED NOT NULL,
        role_id BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY (user_id, context_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        INDEX idx_context_id (context_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Migrate dữ liệu: tất cả user_roles cũ → system context (id=1)
    await queryRunner.query(`
      INSERT INTO user_context_roles (user_id, context_id, role_id)
      SELECT user_id, 1, role_id FROM user_roles;
    `);

    // 3. Xóa bảng cũ (hoặc giữ lại để rollback)
    // await queryRunner.query(`DROP TABLE user_roles`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: migrate lại về user_roles (chỉ lấy từ system context)
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT user_id, role_id 
      FROM user_context_roles 
      WHERE context_id = 1;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS user_context_roles`);
  }
}
```

---

## 🧪 6. Seeder Updates

### 6.1. Cập Nhật Seeder Roles

**File:** `src/core/database/seeder/seed-roles.ts`

Thêm roles cho system context:
- `system_admin` - Quản trị hệ thống
- `system_viewer` - Xem hệ thống

Thêm roles cho context:
- `context_admin` - Quản trị context
- `context_editor` - Chỉnh sửa context
- `context_viewer` - Xem context

### 6.2. Cập Nhật Seeder Permissions

**File:** `src/core/database/seeder/seed-permissions.ts`

Thêm scope cho tất cả permissions:
- Permissions bắt đầu bằng `system.*` → `scope = 'system'`
- Permissions khác → `scope = 'context'`

### 6.3. Cập Nhật Seeder Users

**File:** `src/core/database/seeder/seed-users.ts`

Gán roles qua `user_context_roles` thay vì `user_roles`:
```typescript
// Thay vì:
user.roles = [adminRole];

// Dùng:
await userContextRoleRepo.save({
  user_id: user.id,
  context_id: 1,  // system context
  role_id: adminRole.id,
});
```

---

## 🎨 7. API Changes

### 7.1. Context Resolution

**Cách 1: Header (Recommended)**
```http
GET /api/admin/products
X-Context-Id: 2
```

**Cách 2: Query Parameter**
```http
GET /api/admin/products?context_id=2
```

**Cách 3: Default**
- Nếu không có header/query → dùng system context (id=1)

### 7.2. API Lấy Contexts Của User

**Endpoint:** `GET /api/user/contexts`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "system",
      "ref_id": null,
      "name": "System"
    },
    {
      "id": 2,
      "type": "shop",
      "ref_id": 101,
      "name": "Shop A"
    }
  ]
}
```

### 7.3. API Chuyển Context

**Endpoint:** `POST /api/user/switch-context`

**Request:**
```json
{
  "context_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "context": {
      "id": 2,
      "type": "shop",
      "name": "Shop A"
    },
    "permissions": ["product.edit", "order.view"]
  }
}
```

---

## 🧹 8. Cleanup Tasks

### 8.1. Loại Bỏ Hardcoded Admin Checks

**Files cần sửa:**
- `src/modules/menu/admin/menu/services/menu.service.ts` - Xóa `admin@example.com` bypass
- Tất cả files có `isAdmin` hoặc `isSystemAdmin` checks

### 8.2. Deprecate Old Methods

**Mark as deprecated:**
- `RbacService.userHasPermissions()` → Dùng `userHasPermissionsInContext()` thay thế
- `User.roles` relation → Dùng `User.contexts` và `User.user_context_roles` thay thế

### 8.3. Update Documentation

- Cập nhật `docs/api/rbac/README.md`
- Cập nhật `docs/database_schema/roles.md`
- Cập nhật `docs/database_schema/permissions.md`
- Thêm `docs/database_schema/contexts.md`

---

## ✅ 9. Testing Checklist

### 9.1. Unit Tests
- [ ] ContextService.resolveContext()
- [ ] RbacService.userHasPermissionsInContext()
- [ ] MenuService.getUserMenus() với context

### 9.2. Integration Tests
- [ ] User có quyền trong system context
- [ ] User có quyền trong shop context
- [ ] User không có quyền trong context khác
- [ ] Permission scope validation (system permission chỉ dùng trong system context)

### 9.3. E2E Tests
- [ ] Login → Chọn context → Access resources
- [ ] Switch context → Permissions thay đổi
- [ ] Menu filtering theo context

---

## 🚀 10. Rollout Strategy

### Phase 1: Database & Entities (Week 1)
1. Tạo migration cho `contexts` table
2. Tạo migration cho `user_context_roles` table
3. Tạo migration thêm `scope` vào `permissions`
4. Tạo entities: `Context`, `UserContextRole`
5. Cập nhật entities: `User`, `Permission`

### Phase 2: Services (Week 2)
1. Tạo `ContextService`
2. Cập nhật `RbacService` với context support
3. Cập nhật `RbacCacheService`
4. Cập nhật `MenuService`

### Phase 3: Guards & Interceptors (Week 2)
1. Tạo `ContextInterceptor`
2. Cập nhật `RbacGuard`
3. Register interceptor globally

### Phase 4: Migration Data (Week 3)
1. Chạy migration scripts
2. Migrate dữ liệu từ `user_roles` → `user_context_roles`
3. Update permissions với scope
4. Tạo system context

### Phase 5: API Updates (Week 3)
1. Thêm API `/api/user/contexts`
2. Thêm API `/api/user/switch-context`
3. Update tất cả admin APIs để support context header

### Phase 6: Cleanup (Week 4)
1. Loại bỏ hardcoded admin checks
2. Deprecate old methods
3. Update documentation
4. Testing & bug fixes

---

## 📋 11. Checklist Tổng Hợp

### Database
- [ ] Tạo bảng `contexts`
- [ ] Tạo bảng `user_context_roles`
- [ ] Thêm cột `scope` vào `permissions`
- [ ] Migrate dữ liệu từ `user_roles` → `user_context_roles`
- [ ] Tạo system context (id=1)

### Entities
- [ ] Tạo `Context` entity
- [ ] Tạo `UserContextRole` entity
- [ ] Cập nhật `User` entity
- [ ] Cập nhật `Permission` entity

### Services
- [ ] Tạo `ContextService`
- [ ] Cập nhật `RbacService`
- [ ] Cập nhật `RbacCacheService`
- [ ] Cập nhật `MenuService`

### Guards & Interceptors
- [ ] Tạo `ContextInterceptor`
- [ ] Cập nhật `RbacGuard`

### APIs
- [ ] API lấy contexts của user
- [ ] API chuyển context
- [ ] Update tất cả admin APIs

### Cleanup
- [ ] Loại bỏ `admin@example.com` bypass
- [ ] Loại bỏ `isAdmin` checks
- [ ] Deprecate old methods
- [ ] Update documentation

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

## 🎯 12. Lợi Ích

### ✅ Không Special-Case
- Mọi quyền đều thống nhất
- Không có `if (isAdmin)` logic

### ✅ Không Cờ isAdmin
- Loại bỏ hoàn toàn khái niệm "admin đặc biệt"
- Mọi thứ đều qua context

### ✅ Test Dễ
- Logic đơn giản, dễ test
- Không có edge cases

### ✅ Scale Vô Hạn
- Hỗ trợ multi-tenant
- Hỗ trợ nhiều context types

### ✅ Phù Hợp IAM Chuẩn
- Tương tự AWS IAM, GCP IAM, Keycloak
- Dễ integrate với các hệ thống khác

---

## 📚 13. References

- [AWS IAM Concepts](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [GCP IAM Overview](https://cloud.google.com/iam/docs/overview)
- [Keycloak Authorization Services](https://www.keycloak.org/docs/latest/authorization_services/)

---

**Tác giả:** AI Assistant  
**Ngày tạo:** 2024  
**Phiên bản:** 1.0

