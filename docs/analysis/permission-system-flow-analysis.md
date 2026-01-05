# Phân Tích Hệ Thống Phân Quyền Theo Luồng

## 📋 Tổng Quan

Hệ thống phân quyền sử dụng mô hình **RBAC (Role-Based Access Control)** với **Context-based isolation**.

---

## 🔄 Luồng Xử Lý Phân Quyền

### 1. Request Flow Tổng Thể

```
User Request
    ↓
[1] ContextInterceptor (Global)
    - Resolve context từ header/query
    - Validate user có quyền truy cập context
    - Set RequestContext (contextId, groupId, context)
    ↓
[2] JwtAuthGuard (Global)
    - Validate JWT token
    - Check token blacklist
    - Set req.user nếu token hợp lệ
    - Handle public/optional auth routes
    ↓
[3] RbacGuard (Global)
    - Đọc @Permission() decorator
    - Lấy userId từ request
    - Lấy contextId từ RequestContext
    - Check permissions trong context
    ↓
[4] Controller Method
    - Execute business logic
    - Filter data theo context/group
    ↓
[5] Response
```

---

## 🔍 Chi Tiết Từng Bước

### Bước 1: ContextInterceptor

**File:** `src/common/interceptors/context.interceptor.ts`

**Luồng xử lý:**

```typescript
1. Đọc context_id từ:
   - Header: x-context-id
   - Query: ?context_id

2. Nếu có context_id:
   a) Resolve Context từ database
   b) Nếu contextId === 1 (system):
      - Cho phép mọi user đã authenticated
      - Set groupId = null
   
   c) Nếu contextId !== 1:
      - Validate user có role trong context này
      - Query: UserContextRole WHERE user_id = ? AND context_id = ?
      - Nếu không có → throw ForbiddenException
      - Set groupId = context.ref_id

3. Nếu không có context_id:
   - Default: contextId = 1 (system)
   - groupId = null

4. Set RequestContext:
   - contextId
   - groupId
   - context (object)
```

**✅ Điểm mạnh:**
- Validate sớm: User không có quyền truy cập context → reject ngay
- Tách biệt context resolution khỏi permission check
- Set groupId tự động từ context.ref_id

**⚠️ Vấn đề tiềm ẩn:**
- Nếu user chưa authenticated, vẫn set context (có thể gây confusion)
- Không có cơ chế fallback nếu context không tồn tại (chỉ catch exception)

---

### Bước 2: JwtAuthGuard

**File:** `src/common/guards/jwt-auth.guard.ts`

**Luồng xử lý:**

```typescript
1. Check token blacklist (nếu có)

2. Validate JWT token:
   - Parse token
   - Check expiration
   - Verify signature

3. Nếu route có @Permission('public'):
   - Optional auth: token lỗi vẫn cho qua
   - Nếu có token hợp lệ → set req.user
   - Nếu không có token → req.user = null

4. Nếu route không có @Permission('public'):
   - Required auth: token lỗi → throw UnauthorizedException
   - Token hợp lệ → set req.user

5. Set RequestContext.set('user', user)
```

**✅ Điểm mạnh:**
- Secure-by-default: mặc định yêu cầu auth
- Hỗ trợ optional auth cho public routes
- Check blacklist trước khi validate token

**⚠️ Vấn đề tiềm ẩn:**
- Development mode: bypass tất cả (có thể nguy hiểm nếu quên tắt)
- Không có rate limiting cho token validation

---

### Bước 3: RbacGuard

**File:** `src/common/guards/rbac.guard.ts`

**Luồng xử lý:**

```typescript
1. Development mode check:
   - Nếu NODE_ENV === 'development' → return true (bypass)

2. Đọc @Permission() decorator:
   - Reflector.getAllAndOverride('perms_required')
   - Lấy từ method hoặc class level

3. Secure-by-default:
   - Nếu không có @Permission() → throw ForbiddenException
   - Buộc phải khai báo permission rõ ràng

4. Public permission check:
   - Nếu có @Permission('public') → return true

5. Lấy userId:
   - Auth.id(context) → từ req.user
   - Nếu không có → throw UnauthorizedException

6. Lấy contextId:
   - RequestContext.get('contextId') || 1
   - Default: system context

7. Check permissions:
   - RbacService.userHasPermissionsInContext(userId, contextId, requiredPerms)
   - OR logic: chỉ cần 1 permission trong requiredPerms

8. Nếu không có quyền → throw ForbiddenException
```

**✅ Điểm mạnh:**
- Secure-by-default: không có @Permission() → chặn
- OR logic cho multiple permissions (linh hoạt)
- Tách biệt authentication và authorization

**⚠️ Vấn đề tiềm ẩn:**
- Development mode bypass hoàn toàn (nguy hiểm)
- Không hỗ trợ AND logic (chỉ có OR)
- Không có audit log cho permission checks

---

### Bước 4: RbacService.userHasPermissionsInContext

**File:** `src/modules/rbac/services/rbac.service.ts`

**Luồng xử lý:**

```typescript
1. Lấy Context từ database:
   - contextRepo.findOne({ id: contextId })
   - Nếu không có → throw NotFoundException

2. Xác định allowed scope:
   - context.type === 'system' → scope = 'system'
   - context.type !== 'system' → scope = 'context'
   - Chỉ permissions có scope phù hợp mới được dùng

3. Try cache first:
   - rbacCache.getUserPermissionsInContext(userId, contextId)
   - Nếu có cache → dùng cache

4. Nếu không có cache, query database:
   Query:
   ```
   SELECT perm.code, perm.scope, parent.code AS parent
   FROM users
   INNER JOIN user_context_roles ucr ON ucr.user_id = users.id AND ucr.context_id = ?
   INNER JOIN roles ON roles.id = ucr.role_id AND roles.status = 'active'
   INNER JOIN role_has_permissions rhp ON rhp.role_id = roles.id
   INNER JOIN permissions perm ON perm.id = rhp.permission_id AND perm.status = 'active'
   LEFT JOIN permissions parent ON parent.id = perm.parent_id
   WHERE users.id = ?
   ```

5. Filter permissions theo scope:
   - Chỉ giữ permissions có scope = allowedScope
   - Bỏ qua permissions có scope khác

6. Build permission set:
   - Thêm permission code
   - Thêm parent permission code (nếu có)
   - Loại bỏ duplicates

7. Cache kết quả:
   - rbacCache.setUserPermissionsInContext(userId, contextId, permissionSet)

8. Check required permissions:
   - OR logic: chỉ cần 1 permission trong requiredPerms
   - Return true nếu có, false nếu không
```

**✅ Điểm mạnh:**
- Scope isolation: system permissions chỉ dùng trong system context
- Cache để tối ưu performance
- Include parent permissions (hierarchical permissions)
- Chỉ check active roles và permissions

**⚠️ Vấn đề tiềm ẩn:**
- Query phức tạp với nhiều JOINs (có thể chậm nếu không có index)
- Không validate roles có trong context (chỉ check user có role trong context)
- Cache có thể stale nếu roles/permissions thay đổi

---

## 🔗 Mối Quan Hệ Giữa Các Thành Phần

### Entity Relationships

```
User
  ↓ (many-to-many qua UserContextRole)
Context ←→ Role (many-to-many qua RoleContext)
  ↓ (1-to-1)
Group (ref_id trong Context)

UserContextRole (user_id, context_id, role_id)
  - User có Role trong Context cụ thể
  - Một user có thể có nhiều roles trong nhiều contexts

RoleContext (role_id, context_id)
  - Role được gán vào Context
  - Một role có thể dùng trong nhiều contexts
  - Validate khi gán role cho user: role phải có trong context

Role → Permission (many-to-many qua role_has_permissions)
  - Role có nhiều Permissions
  - Permission có scope: 'system' hoặc 'context'
```

### Data Flow

```
1. User được gán Roles trong Contexts:
   UserContextRole(user_id=1, context_id=2, role_id=3)

2. Roles có Permissions:
   Role(id=3) → Permissions: ['post.create', 'post.read', ...]

3. Permissions có scope:
   Permission(code='post.create', scope='context')
   Permission(code='system.user.manage', scope='system')

4. Khi check permission:
   - Lấy contextId từ RequestContext
   - Lấy context.type để xác định allowed scope
   - Chỉ check permissions có scope phù hợp
   - User chỉ có permissions từ roles trong context đó
```

---

## 🎯 Logic Phân Quyền

### 1. Context Isolation

**Nguyên tắc:**
- Mỗi Context có danh sách Roles riêng (qua RoleContext)
- User chỉ có quyền trong Contexts mà họ có Roles
- Permissions được filter theo scope của Context

**Ví dụ:**
```
Context A (type='shop', id=2):
  - Roles: [context_admin, manager]
  - User X có role 'context_admin' trong Context A
  - User X chỉ thấy roles có trong Context A
  - User X chỉ có permissions từ roles trong Context A

Context B (type='shop', id=3):
  - Roles: [context_admin, staff]
  - User X không có role trong Context B
  - User X không thể truy cập Context B
```

### 2. Scope Isolation

**Nguyên tắc:**
- System context (type='system') → chỉ dùng permissions scope='system'
- Context khác (type='shop', 'team', ...) → chỉ dùng permissions scope='context'

**Ví dụ:**
```
System Context:
  - Permission: system.user.manage (scope='system') ✅
  - Permission: post.create (scope='context') ❌

Shop Context:
  - Permission: post.create (scope='context') ✅
  - Permission: system.user.manage (scope='system') ❌
```

### 3. Role Validation

**Khi gán role cho user trong context:**
```typescript
1. Validate role phải có trong context:
   - Query RoleContext WHERE role_id = ? AND context_id = ?
   - Nếu không có → throw BadRequestException

2. Chỉ system admin mới có thể skip validation:
   - skipValidation = true (chỉ cho system admin)
```

**✅ Điểm mạnh:**
- Đảm bảo chỉ gán roles có trong context
- System admin có quyền đặc biệt (có thể gán bất kỳ role nào)

---

## ⚠️ Các Vấn Đề Tiềm Ẩn

### 1. Context Resolution

**Vấn đề:**
- Nếu context không tồn tại → catch exception và fallback về system context
- Không có explicit error message cho user

**Đề xuất:**
- Validate context tồn tại trước khi set
- Throw explicit error nếu context không hợp lệ

### 2. Permission Check Logic

**Vấn đề:**
- Chỉ hỗ trợ OR logic (chỉ cần 1 permission)
- Không hỗ trợ AND logic (cần tất cả permissions)

**Ví dụ:**
```typescript
@Permission('post.create', 'post.update')  // OR: chỉ cần 1 trong 2
// Không thể: cần cả 2 permissions
```

**Đề xuất:**
- Thêm syntax cho AND logic: `@Permission({ and: ['perm1', 'perm2'] })`

### 3. Development Mode

**Vấn đề:**
- RbacGuard bypass hoàn toàn trong development
- Có thể quên tắt khi deploy

**Đề xuất:**
- Chỉ bypass trong local development
- Hoặc dùng flag riêng thay vì NODE_ENV

### 4. Cache Invalidation

**Vấn đề:**
- Cache permissions có thể stale khi:
  - Roles thay đổi
  - Permissions thay đổi
  - User roles thay đổi

**Đề xuất:**
- Invalidate cache khi có thay đổi
- Hoặc dùng TTL ngắn hơn

### 5. Group vs Context

**Vấn đề:**
- Group không có roles riêng
- Roles chỉ gán vào Context
- Group và Context có quan hệ 1-1 (qua ref_id)

**Hiện tại:**
- Group có Context → Context có Roles → User có Roles trong Context
- Không thể có roles khác nhau cho cùng 1 Group trong các Contexts khác nhau

**Đề xuất:**
- Nếu cần Group có roles riêng → thêm RoleGroup entity
- Hoặc giữ nguyên nếu logic hiện tại đã đủ

---

## ✅ Đánh Giá Tổng Thể

### Điểm Mạnh

1. **Tách biệt rõ ràng:**
   - Context resolution (Interceptor)
   - Authentication (JwtAuthGuard)
   - Authorization (RbacGuard)

2. **Secure-by-default:**
   - Không có @Permission() → chặn
   - Mặc định yêu cầu authentication

3. **Context isolation:**
   - Mỗi context có roles riêng
   - Permissions được filter theo scope
   - User chỉ có quyền trong contexts có roles

4. **Validation chặt chẽ:**
   - Validate role có trong context khi gán
   - Validate user có quyền truy cập context

5. **Caching:**
   - Cache permissions để tối ưu performance

### Điểm Yếu

1. **Development mode bypass:**
   - Có thể nguy hiểm nếu quên tắt

2. **Chỉ hỗ trợ OR logic:**
   - Không có AND logic cho permissions

3. **Cache có thể stale:**
   - Không có cơ chế invalidate rõ ràng

4. **Group không có roles riêng:**
   - Chỉ có roles qua Context

5. **Error handling:**
   - Một số trường hợp fallback im lặng

---

## 🎯 Kết Luận

**Hệ thống phân quyền hiện tại:**
- ✅ **Logic đúng đắn:** Context-based isolation, scope separation
- ✅ **Bảo mật tốt:** Secure-by-default, validation chặt chẽ
- ✅ **Cấu trúc rõ ràng:** Tách biệt các concerns
- ⚠️ **Cần cải thiện:** Development mode, cache invalidation, AND logic

**Đánh giá:** **8/10** - Hệ thống tốt, cần một số cải thiện nhỏ.

