# Hướng Dẫn Nâng Cấp Hệ Thống Phân Quyền & Menu

## 📋 Tổng Quan

Nâng cấp hệ thống phân quyền để hỗ trợ **context-based permissions** (quyền theo ngữ cảnh) và menu động theo context.

---

## 🗄️ Database Changes

### 1. Bảng `partner_members` (Cần tạo mới)

**Các trường:**
- `id` - BIGINT UNSIGNED PK
- `partner_id` - BIGINT UNSIGNED FK → partners.id
- `user_id` - BIGINT UNSIGNED FK → users.id
- `permissions` - JSON - Array permissions: `["comic:edit", "comic:upload-chapter"]`
- `status` - ENUM('active', 'inactive') DEFAULT 'active'
- `joined_at` - DATETIME
- `created_at`, `updated_at` - DATETIME

**Index:**
- UNIQUE: (partner_id, user_id)
- INDEX: (user_id, partner_id, status)
- INDEX: (partner_id, status)

**Migration:**
```sql
CREATE TABLE partner_members (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  partner_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  permissions JSON,
  status ENUM('active', 'inactive') DEFAULT 'active',
  joined_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_partner_user (partner_id, user_id),
  INDEX idx_user_partner (user_id, partner_id, status),
  INDEX idx_partner_status (partner_id, status)
);
```

---

### 2. Bảng `menus` (Cần bổ sung - Tùy chọn)

**Option 1: Thêm trường explicit (Recommended)**
- `context_type` - VARCHAR(50) DEFAULT 'global'
  - Values: 'global', 'partner', 'shop', 'team', ...

**Option 2: Dùng naming convention (Không cần migration)**
- Menu code có prefix `partner.` → tự động là partner menu
- Ví dụ: `partner.comics`, `partner.members`

**Migration (nếu dùng Option 1):**
```sql
ALTER TABLE menus
ADD COLUMN context_type VARCHAR(50) DEFAULT 'global' AFTER show_in_menu,
ADD INDEX idx_menus_context (context_type, status);
```

---

## 🔧 Services Cần Tạo

### 1. `ContextPermissionService`

**File:** `src/modules/rbac/services/context-permission.service.ts`

**Chức năng chính:**
- `getUserContextPermissions(userId, contextType, contextId)` - Lấy permissions (có cache)
- `hasContextPermission(userId, contextType, contextId, permission)` - Check quyền
- `invalidateCache(userId, contextType, contextId)` - Xóa cache khi thay đổi

**Dependencies:**
- `PartnerRepository`, `PartnerMemberRepository`
- `RbacCacheService`

**Cache Key:** `context_perms:{contextType}:{userId}:{contextId}` (TTL: 1h)

---

### 2. `ResourcePermissionService`

**File:** `src/common/services/resource-permission.service.ts`

**Chức năng chính:**
- `canAccessResource(resourceType, resourceId, action, userId)` - Check quyền tổng quát
  - Tự động phát hiện resource có context hay không
  - Nếu không có context → Check global RBAC
  - Nếu có context → Check context permissions

**Logic:**
1. Admin → Full access
2. Resource không có context → Check global permission
3. Resource có context → Check context permission

**Dependencies:**
- `RbacService` (global permissions)
- `ContextPermissionService` (context permissions)

---

### 3. Context Handlers

**Interface:** `IContextHandler`

**File:** `src/common/interfaces/context-handler.interface.ts`

**Methods:**
- `getUserPermissions(userId, contextId)` - Lấy permissions
- `getOwnerId(contextId)` - Lấy owner ID
- `getOwnerPermissions()` - Permissions mặc định cho owner

**Implementation:** `PartnerContextHandler`

**File:** `src/modules/rbac/services/handlers/partner-context.handler.ts`

- Xử lý logic lấy permissions cho partner context
- Owner tự động có tất cả permissions

---

## 🛡️ Guards & Decorators

### 1. Decorator: `@ContextPermission()`

**File:** `src/common/decorators/context-permission.decorator.ts`

**Config:**
```typescript
{
  resourceType: string,      // 'comic', 'product', 'order', ...
  action: string,            // 'edit', 'delete', 'view', ...
  contextSource: {
    type: 'param' | 'body' | 'query' | 'resource',
    key: string,             // Tên field trong request
    resourceType?: string    // Nếu type = 'resource'
  }
}
```

**Ví dụ:**
```typescript
@ContextPermission({
  resourceType: 'comic',
  action: 'edit',
  contextSource: { type: 'resource', key: 'comic_id', resourceType: 'comic' }
})
```

**Helper decorator:**
```typescript
@PartnerPermission('comic:edit', 'comic_id') // Backward compatible
```

---

### 2. Guard: `ContextPermissionGuard`

**File:** `src/common/guards/context-permission.guard.ts`

**Logic:**
1. Admin bypass → Full access
2. Đọc metadata từ `@ContextPermission()`
3. Lấy resource ID từ request (param/body/query)
4. Gọi `ResourcePermissionService.canAccessResource()`

**Đăng ký:**
- Thêm vào `CommonModule` providers
- Hoặc dùng `APP_GUARD` để global (tùy chọn)

---

## 📝 Permissions Cần Tạo

**Trong bảng `permissions` (RBAC global):**

```
Comic Permissions:
- comic:create
- comic:edit
- comic:delete
- comic:upload-chapter
- comic:edit-chapter
- comic:delete-chapter
- comic:approve
- comic:manage-members
- comic:view-stats

Order Permissions:
- order:view
- order:manage
- order:create
- order:delete

User Permissions:
- user:create
- user:manage
- user:view

Product Permissions (nếu có):
- product:create
- product:edit
- product:delete
```

**Cách sử dụng:**
1. **Global RBAC:** Gán permissions cho roles (admin, user, ...)
2. **Context Permissions:** Lưu trong `partner_members.permissions` (JSON array)
   - Ví dụ: `["comic:edit", "comic:upload-chapter"]`
   - Owner tự động có tất cả (không cần lưu)

---

## 🔄 Cache Strategy

### Cache Keys:
```
context_perms:{contextType}:{userId}:{contextId}
- TTL: 1 hour
- Format: JSON array of permissions
```

### Invalidate Cache:
**Khi nào:**
- Update `partner_members.permissions`
- Update `partner_members.status` (active/inactive)
- Delete `partner_members`
- Update `partners.user_id` (owner thay đổi)

**Code:**
```typescript
await contextPermService.invalidateCache(userId, 'partner', partnerId);
```

### Cache Menu:
```
menus:active - Cache menu list (TTL: 30 phút)
- Invalidate khi menu thay đổi
```

---

## 📦 Modules Cần Cập Nhật

### 1. RBAC Module (`src/modules/rbac/rbac.module.ts`)
**Cần thêm:**
- Import `PartnerRepository`, `PartnerMemberRepository`
- Provide `ContextPermissionService`
- Provide `PartnerContextHandler`
- Export `ContextPermissionService`

### 2. Common Module (`src/common/common.module.ts`)
**Cần thêm:**
- Provide `ResourcePermissionService`
- Provide `ContextPermissionGuard`
- Export decorator `@ContextPermission()`
- Export guard `ContextPermissionGuard`

### 3. Menu Module (`src/modules/menu/`)
**Cần cập nhật `MenuService.getUserMenus()`:**
- Thêm params: `context_type?: string`, `context_id?: number`
- Lấy context permissions từ `ContextPermissionService`
- Filter menu: Global menu (global permissions) + Context menu (context permissions)

**Cập nhật Controller:**
```typescript
@Get()
async getUserMenus(
  @Query('context_type') contextType?: string,
  @Query('context_id') contextId?: number,
) {
  return this.menuService.getUserMenus(userId, {
    context_type: contextType,
    context_id: contextId ? Number(contextId) : undefined
  });
}
```

**API:**
```
GET /api/admin/user/menus
GET /api/admin/user/menus?context_type=partner&context_id=123
```

---

## 🎯 Workflow Implementation

### Bước 1: Database
1. ✅ Tạo migration `partner_members`
2. ✅ (Tùy chọn) Thêm `context_type` vào `menus`

### Bước 2: Services
1. ✅ Tạo interface `IContextHandler`
2. ✅ Tạo `PartnerContextHandler`
3. ✅ Tạo `ContextPermissionService`
4. ✅ Tạo `ResourcePermissionService`
5. ✅ Register handlers trong service

### Bước 3: Guards & Decorators
1. ✅ Tạo decorator `@ContextPermission()`
2. ✅ Tạo guard `ContextPermissionGuard`
3. ✅ Export trong `CommonModule`

### Bước 4: Menu Module
1. ✅ Cập nhật `MenuService.getUserMenus()` 
2. ✅ Thêm logic filter theo context
3. ✅ Cập nhật controller (thêm query params)

### Bước 5: Permissions
1. ✅ Tạo permissions trong DB
2. ✅ Gán permissions cho admin role

### Bước 6: Cache
1. ✅ Implement cache logic trong services
2. ✅ Implement invalidate logic
3. ✅ Test cache

---

## ✅ Checklist

**Database:**
- [ ] Tạo bảng `partner_members`
- [ ] (Tùy chọn) Thêm `context_type` vào `menus`

**Services:**
- [ ] Interface `IContextHandler`
- [ ] `PartnerContextHandler`
- [ ] `ContextPermissionService`
- [ ] `ResourcePermissionService`
- [ ] Register handlers

**Guards & Decorators:**
- [ ] Decorator `@ContextPermission()`
- [ ] Guard `ContextPermissionGuard`
- [ ] Export trong `CommonModule`

**Menu:**
- [ ] Cập nhật `MenuService.getUserMenus()`
- [ ] Thêm params `context_type`, `context_id`
- [ ] Filter menu theo context
- [ ] Cập nhật API endpoint

**Permissions:**
- [ ] Tạo permissions trong DB
- [ ] Gán permissions cho admin role

**Cache:**
- [ ] Implement cache trong services
- [ ] Implement invalidate logic

**Testing:**
- [ ] Test global permissions
- [ ] Test context permissions (partner)
- [ ] Test menu filtering (global + context)
- [ ] Test cache performance

---

## 📚 Tài Liệu Tham Khảo

- Chi tiết database: `docs/truyen-tranh-database.md`
- Chi tiết tối ưu: `docs/truyen-tranh-permission-optimization.md`

