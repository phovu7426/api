# RBAC Module API Documentation

Module quản lý phân quyền dựa trên vai trò (Role-Based Access Control).

## 📂 Cấu trúc Module

```
src/modules/rbac/
└── admin/              # Admin APIs
    ├── permission/
    ├── role/
    └── rbac/
```

---

## 🔐 Admin APIs

APIs dành cho quản trị viên - yêu cầu authentication và super admin permissions.

### Permissions (Quyền)
- **GET** `/admin/permissions` - Danh sách quyền
- **GET** `/admin/permissions/:id` - Chi tiết quyền
- **POST** `/admin/permissions` - Tạo quyền mới
- **PUT** `/admin/permissions/:id` - Cập nhật quyền
- **DELETE** `/admin/permissions/:id` - Xóa quyền

📖 [Chi tiết Admin Permissions API](./admin/permission.md)

### Roles (Vai trò)
- **GET** `/admin/roles` - Danh sách vai trò
- **GET** `/admin/roles/:id` - Chi tiết vai trò
- **POST** `/admin/roles` - Tạo vai trò mới
- **PUT** `/admin/roles/:id` - Cập nhật vai trò
- **DELETE** `/admin/roles/:id` - Xóa vai trò

📖 [Chi tiết Admin Roles API](./admin/role.md)

### RBAC Operations
- **POST** `/admin/rbac/assign-role` - Gán vai trò cho user
- **POST** `/admin/rbac/revoke-role` - Thu hồi vai trò
- **POST** `/admin/rbac/assign-permission` - Gán quyền cho role
- **POST** `/admin/rbac/revoke-permission` - Thu hồi quyền
- **GET** `/admin/rbac/user-permissions/:userId` - Quyền của user
- **GET** `/admin/rbac/role-permissions/:roleId` - Quyền của role

📖 [Chi tiết Admin RBAC API](./admin/rbac.md)

---

## 📊 Data Models

### Permission
```typescript
{
  id: number
  code: string        // unique: module.action (e.g., product:create)
  name: string
  description?: string
  status: 'active' | 'inactive'
  parent_id?: number  // hierarchical permissions
  created_at: Date
  updated_at: Date
}
```

### Role
```typescript
{
  id: number
  name: string
  code: string        // unique: admin, editor, customer
  description?: string
  status: 'active' | 'inactive'
  permissions: Permission[]
  created_at: Date
  updated_at: Date
}
```

### User-Role Relationship
```typescript
{
  user_id: number
  role_id: number
  assigned_at: Date
  assigned_by: number
}
```

### Role-Permission Relationship
```typescript
{
  role_id: number
  permission_id: number
  assigned_at: Date
  assigned_by: number
}
```

---

## 🎭 Default Roles

### Super Admin
**Code:** `super_admin`
- Quyền: Tất cả
- Mô tả: Quản trị viên cao nhất

### Admin
**Code:** `admin`
- Quyền: Quản lý hệ thống (trừ RBAC)
- Mô tả: Quản trị viên

### Editor
**Code:** `editor`
- Quyền: Quản lý nội dung
- Mô tả: Biên tập viên

### Customer
**Code:** `customer`
- Quyền: Người dùng cơ bản
- Mô tả: Khách hàng

---

## 🔑 Permission Convention

Format: `module:action` hoặc `module.action`

### Modules
- `post` - Bài viết
- `product` - Sản phẩm
- `order` - Đơn hàng
- `user` - Người dùng
- `role` - Vai trò
- `permission` - Quyền

### Actions
- `create` - Tạo mới
- `read` - Xem
- `update` - Cập nhật
- `delete` - Xóa
- `manage` - Quản lý (all actions)

### Examples
```
product:create    # Tạo sản phẩm
product:read      # Xem sản phẩm
product:update    # Cập nhật sản phẩm
product:delete    # Xóa sản phẩm
product:manage    # Quản lý sản phẩm (all)

order:read        # Xem đơn hàng
order:update      # Cập nhật đơn hàng
order:manage      # Quản lý đơn hàng

user:manage       # Quản lý người dùng
role:manage       # Quản lý vai trò
permission:manage # Quản lý quyền
```

---

## 🔄 RBAC Flow

### Assign Role to User
```
1. Admin gán role cho user
   POST /admin/rbac/assign-role
   {
     "user_id": 5,
     "role_id": 2
   }
   ↓
2. Hệ thống tạo relationship
   ↓
3. User có tất cả permissions của role
   ↓
4. Cache permissions
```

### Check Permission
```
1. User gọi API
   ↓
2. Middleware kiểm tra authentication
   ↓
3. Middleware kiểm tra permission
   - Lấy roles của user
   - Lấy permissions từ roles
   - So sánh với required permission
   ↓
4. Allow or Deny
```

### Permission Inheritance
```
Module Permissions:
  product:manage
    ├── product:create
    ├── product:read
    ├── product:update
    └── product:delete

Nếu user có product:manage
→ User tự động có tất cả sub-permissions
```

---

## ✨ Features

- ✅ Hierarchical permissions (parent-child)
- ✅ Multiple roles per user
- ✅ Role-based permission assignment
- ✅ Permission caching (Redis)
- ✅ Permission inheritance
- ✅ Dynamic permission checking
- ✅ Audit trail (who assigned what when)

---

## 🛡️ Permission Guards

### Using in Controllers

```typescript
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ProductController {
  
  @Get()
  @Permission('product:read')
  async getList() {
    // ...
  }
  
  @Post()
  @Permission('product:create')
  async create() {
    // ...
  }
  
  @Put(':id')
  @Permission('product:update')
  async update() {
    // ...
  }
  
  @Delete(':id')
  @Permission('product:delete')
  async delete() {
    // ...
  }
}
```

### Multiple Permissions (OR)

```typescript
@Get()
@Permission('product:read', 'product:manage')
async getList() {
  // User cần có product:read HOẶC product:manage
}
```

### Multiple Permissions (AND)

```typescript
@Post()
@Permission(['product:create', 'category:read'])
async create() {
  // User cần có CẢ product:create VÀ category:read
}
```

---

## 🎯 Use Cases

### Tạo role mới
```bash
POST /admin/roles
{
  "name": "Content Manager",
  "code": "content_manager",
  "description": "Quản lý nội dung"
}
```

### Gán permissions cho role
```bash
POST /admin/rbac/assign-permission
{
  "role_id": 3,
  "permission_ids": [1, 2, 3, 4]  // post permissions
}
```

### Gán role cho user
```bash
POST /admin/rbac/assign-role
{
  "user_id": 5,
  "role_id": 3
}
```

### Kiểm tra permissions của user
```bash
GET /admin/rbac/user-permissions/5
```

Response:
```json
{
  "success": true,
  "data": {
    "user_id": 5,
    "roles": [
      {
        "id": 3,
        "name": "Content Manager",
        "code": "content_manager"
      }
    ],
    "permissions": [
      "post:create",
      "post:read",
      "post:update",
      "post:delete"
    ]
  }
}
```

---

## 💾 Caching Strategy

### Permission Cache
```typescript
// Cache key: user_permissions:{userId}
// TTL: 1 hour
// Invalidate on:
// - Role assignment/revocation
// - Permission assignment/revocation
// - Role/Permission update

// Example
const cacheKey = `user_permissions:${userId}`;
const permissions = await redis.get(cacheKey);

if (!permissions) {
  permissions = await loadUserPermissions(userId);
  await redis.setex(cacheKey, 3600, JSON.stringify(permissions));
}
```

---

## 🔒 Security Best Practices

1. **Principle of Least Privilege**
   - Chỉ gán quyền tối thiểu cần thiết
   - Regular review permissions

2. **Role Separation**
   - Tách biệt roles rõ ràng
   - Avoid overlapping permissions

3. **Audit Trail**
   - Log tất cả RBAC operations
   - Track who assigned what when

4. **Permission Validation**
   - Always validate on server-side
   - Never trust client-side checks

5. **Cache Invalidation**
   - Clear cache khi có thay đổi
   - Implement proper TTL

---

## 📝 Permission Matrix Example

| Role | Product | Order | User | Role | Permission |
|------|---------|-------|------|------|------------|
| Super Admin | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| Admin | ✅ All | ✅ All | ✅ Read/Update | ❌ | ❌ |
| Editor | ✅ Create/Read/Update | ✅ Read | ❌ | ❌ | ❌ |
| Customer | ✅ Read | ✅ Read (own) | ✅ Read (own) | ❌ | ❌ |

---

## 🚀 Global Context System (Upcoming)

Hệ thống hiện tại sẽ được nâng cấp lên **Global Context System** - một thiết kế thống nhất loại bỏ hoàn toàn khái niệm "admin đặc biệt". Mọi quyền đều thông qua context, không có ngoại lệ.

**Tính năng chính:**
- ✅ System Admin = Admin của Global Context (context type = 'system')
- ✅ Mọi user đều gắn role qua context
- ✅ Permission phân tầng theo scope (system | context)
- ✅ Middleware đơn giản, không có nhánh if admin
- ✅ Menu thống nhất 100%

📖 [Chi tiết Kế Hoạch Nâng Cấp](../../core/global-context-upgrade-plan.md)

---

**Xem thêm:**
- [Main API Documentation](../README.md)
- [User Management Module](../user-management/README.md)
- [Authentication](../auth/auth.md)