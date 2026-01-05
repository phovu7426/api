# Admin RBAC API

API quản lý phân quyền (Role-Based Access Control).

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Create Role (Tạo vai trò mới)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/rbac/roles \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "staff",
    "name": "Nhân viên",
    "parent_id": null
  }'
```

### Request Body

```json
{
  "code": "staff",
  "name": "Nhân viên",
  "parent_id": null
}
```

**Fields:**
- `code` (required): Mã vai trò (unique)
- `name` (optional): Tên vai trò
- `parent_id` (optional): ID vai trò cha

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "code": "staff",
    "name": "Nhân viên",
    "status": "active",
    "parent_id": null,
    "created_at": "2025-01-11T06:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Tạo vai trò thành công"
}
```

---

## 2. Create Permission (Tạo quyền mới)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/rbac/permissions \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "order.manage",
    "name": "Quản lý đơn hàng",
    "parent_id": null
  }'
```

### Request Body

```json
{
  "code": "order.manage",
  "name": "Quản lý đơn hàng",
  "parent_id": null
}
```

**Fields:**
- `code` (required): Mã quyền (unique)
- `name` (optional): Tên quyền
- `parent_id` (optional): ID quyền cha

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 37,
    "code": "order.manage",
    "name": "Quản lý đơn hàng",
    "status": "active",
    "parent_id": null,
    "created_at": "2025-01-11T06:05:00.000Z",
    "updated_at": "2025-01-11T06:05:00.000Z"
  },
  "message": "Tạo quyền thành công"
}
```

---

## 3. Assign Permissions to Role (Gán quyền cho vai trò)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/rbac/roles/1/permissions \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_ids": [1, 2, 3, 4, 5, 6]
  }'
```

### Request Body

```json
{
  "permission_ids": [1, 2, 3, 4, 5, 6]
}
```

**Fields:**
- `permission_ids` (required): Mảng ID quyền

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Gán quyền cho vai trò thành công"
}
```

---

## 4. Assign Roles to User (Gán vai trò cho user)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/rbac/users/1/roles \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": [1, 2]
  }'
```

### Request Body

```json
{
  "role_ids": [1, 2]
}
```

**Fields:**
- `role_ids` (required): Mảng ID vai trò

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Gán vai trò cho user thành công"
}
```

---

## 5. Sync Roles to User (Đồng bộ vai trò cho user)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/users/1/roles \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": [1, 2, 3]
  }'
```

### Request Body

```json
{
  "role_ids": [1, 2, 3]
}
```

**Fields:**
- `role_ids` (required): Mảng ID vai trò (thay thế toàn bộ roles hiện có)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "roles": [...]
  },
  "message": "Roles synced successfully"
}
```

---

## 6. Add Roles to User (Thêm vai trò cho user)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/users/1/roles \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": [4, 5]
  }'
```

### Request Body

```json
{
  "role_ids": [4, 5]
}
```

**Fields:**
- `role_ids` (required): Mảng ID vai trò (thêm vào roles hiện có)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "roles": [...]
  },
  "message": "Roles added successfully"
}
```

---

## 7. Remove Roles from User (Xóa vai trò khỏi user)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/users/1/roles \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": [2]
  }'
```

### Request Body

```json
{
  "role_ids": [2]
}
```

**Fields:**
- `role_ids` (required): Mảng ID vai trò cần xóa

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "roles": [...]
  },
  "message": "Roles removed successfully"
}
```

---

## 8. Get User Permissions (Lấy thông tin phân quyền của user)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/users/1/permissions \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "roles": [
      {
        "id": 1,
        "code": "admin",
        "name": "Administrator",
        "status": "active",
        "permissions": [...]
      }
    ]
  }
}
```

**Lưu ý:** Phân quyền chỉ được thực hiện qua roles. Không có direct permissions cho user.

---

## RBAC Concepts

### Hierarchical Structure

**Roles Hierarchy:**
- Admin (Top level)
  - Manager
    - Editor
      - Author

**Permissions Hierarchy:**
- post.manage (Parent)
  - post.create
  - post.read
  - post.update
  - post.delete

### Permission Inheritance

Hệ thống phân quyền hoạt động theo mô hình Role-Based:
1. **Permission → Role**: Gán permissions cho role
2. **Role → User**: Gán roles cho user
3. **User nhận quyền**: User tự động nhận tất cả permissions từ các roles được gán

**Lưu ý quan trọng:**
- **KHÔNG có phân quyền trực tiếp permissions cho user**
- Tất cả quyền đều phải thông qua roles
- Khi role hoặc permission có `status = 'inactive'`, user sẽ không có quyền đó

### Permission Check Flow

```
User Request
  ↓
JwtAuthGuard (global)
  - Check token blacklist
  - Validate JWT token
  - Set req.user nếu token hợp lệ
  - Nếu route có @Permission('public') → optional authentication (token lỗi vẫn cho qua)
  - Nếu không → yêu cầu authentication (protected-by-default)
  ↓
RbacGuard (global)
  - Nếu route có @Permission('public') → Allow (bỏ qua check quyền)
  - Nếu route có @Permission() khác → Check quyền
  - Nếu không có @Permission() → Không check quyền (nhưng đã được bảo vệ bởi JwtAuthGuard)
  ↓
RbacService.userHasRoles() → Chỉ kiểm tra roles có status = 'active'
  ↓
RbacService.userHasPermissions() → Chỉ kiểm tra permissions từ active roles
  ↓
Allow/Deny Access
```

### Best Practices

1. **Sử dụng Roles** cho nhóm người dùng có cùng quyền
2. **Tạo hierarchical roles** để quản lý dễ hơn (parent-child relationship)
3. **Phân quyền module-based** để dễ maintain (ví dụ: `post.*`, `user.*`)
4. **Quản lý status** để vô hiệu hóa tạm thời roles/permissions mà không cần xóa
5. **Không gán trực tiếp permissions cho user** - luôn thông qua roles

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Authentication API](./../auth.md)
- [Admin Users API](./user.md)
- [Admin Roles API](./role.md)
- [Admin Permissions API](./permission.md)


