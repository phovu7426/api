# Admin Roles API

API quản lý vai trò (roles) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get Roles List (Lấy danh sách vai trò)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/roles?page=1&limit=10" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `sortBy` (optional): Trường sắp xếp
- `sortOrder` (optional): Thứ tự (`ASC` hoặc `DESC`)
- `filters` (optional): JSON filters

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "admin",
      "name": "Admin",
      "status": "active",
      "parent_id": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "code": "manager",
      "name": "Manager",
      "status": "active",
      "parent_id": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 2,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Role by ID (Lấy thông tin vai trò)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/roles/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

**Lưu ý**: Endpoint này tự động load các relations mặc định (`parent`, `children`, `permissions`).

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "admin",
    "name": "Admin",
    "status": "active",
    "parent_id": null,
    "parent": null,
    "children": [],
    "permissions": [
      {
        "id": 1,
        "code": "post.manage",
        "name": "Quản lý bài viết"
      },
      {
        "id": 2,
        "code": "postcategory.manage",
        "name": "Quản lý danh mục bài viết"
      }
    ],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Create Role (Tạo vai trò)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/roles \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "moderator",
    "name": "Điều phối viên",
    "status": "active",
    "parent_id": 1
  }'
```

### Request Body

```json
{
  "code": "moderator",
  "name": "Điều phối viên",
  "status": "active",
  "parent_id": 1
}
```

**Fields:**
- `code` (required): Mã vai trò (unique)
- `name` (optional): Tên vai trò
- `status` (optional): Trạng thái (mặc định: "active")
- `parent_id` (optional): ID vai trò cha (hierarchical roles)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "code": "moderator",
    "name": "Điều phối viên",
    "status": "active",
    "parent_id": 1,
    "created_at": "2025-01-11T05:40:00.000Z",
    "updated_at": "2025-01-11T05:40:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 4. Update Role (Cập nhật vai trò)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/roles/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tên vai trò đã cập nhật",
    "status": "active"
  }'
```

### Request Body

Tất cả fields đều optional.

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "admin",
    "name": "Tên vai trò đã cập nhật",
    "status": "active",
    "parent_id": null,
    "updated_at": "2025-01-11T05:45:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

---

## 5. Delete Role (Xóa vai trò)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/roles/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa thành công"
}
```

---

## 6. Assign Permissions to Role (Gán quyền cho vai trò)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/roles/1/permissions \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_ids": [1, 2, 3, 4, 5]
  }'
```

### Request Body

```json
{
  "permission_ids": [1, 2, 3, 4, 5]
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
  "message": "Gán quyền thành công"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 404 | Not Found - Role not found |
| 409 | Conflict - Code already exists |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Authentication API](./../auth.md)
- [Admin Users API](./user.md)
- [Admin Permissions API](./permission.md)


