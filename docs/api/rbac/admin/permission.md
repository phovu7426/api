# Admin Permissions API

API quản lý quyền hạn (permissions) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get Permissions List (Lấy danh sách quyền)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/permissions?page=1&limit=10" \
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
      "code": "post.manage",
      "name": "Quản lý bài viết",
      "status": "active",
      "parent_id": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "code": "postcategory.manage",
      "name": "Quản lý danh mục bài viết",
      "status": "active",
      "parent_id": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 36,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Permission by ID (Lấy thông tin quyền)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/permissions/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "post.manage",
    "name": "Quản lý bài viết",
    "status": "active",
    "parent_id": null,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Create Permission (Tạo quyền)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/permissions \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "product.manage",
    "name": "Quản lý sản phẩm",
    "status": "active",
    "parent_id": null
  }'
```

### Request Body

```json
{
  "code": "product.manage",
  "name": "Quản lý sản phẩm",
  "status": "active",
  "parent_id": null
}
```

**Fields:**
- `code` (required): Mã quyền (unique, format: module.action)
- `name` (optional): Tên quyền
- `status` (optional): Trạng thái (mặc định: "active")
- `parent_id` (optional): ID quyền cha (hierarchical permissions)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 37,
    "code": "product.manage",
    "name": "Quản lý sản phẩm",
    "status": "active",
    "parent_id": null,
    "created_at": "2025-01-11T05:50:00.000Z",
    "updated_at": "2025-01-11T05:50:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 4. Update Permission (Cập nhật quyền)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/permissions/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tên quyền đã cập nhật",
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
    "code": "post.manage",
    "name": "Tên quyền đã cập nhật",
    "status": "active",
    "parent_id": null,
    "updated_at": "2025-01-11T05:55:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

---

## 5. Delete Permission (Xóa quyền)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/permissions/1 \
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

## Permission Codes Convention

Quy ước đặt tên mã quyền: `module.action`

**Module:**
- `post`: Bài viết
- `postcategory`: Danh mục bài viết
- `posttag`: Thẻ bài viết
- `user`: Người dùng
- `role`: Vai trò
- `permission`: Quyền
- `system`: Hệ thống

**Action:**
- `manage`: Quản lý chung (có thể chia nhỏ)
- `create`: Tạo mới
- `read`: Xem
- `update`: Cập nhật
- `delete`: Xóa

**Ví dụ:**
- `post.manage`: Quản lý bài viết
- `post.create`: Tạo bài viết
- `post.read`: Xem bài viết
- `post.update`: Cập nhật bài viết
- `post.delete`: Xóa bài viết
- `post.publish`: Xuất bản bài viết

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 404 | Not Found - Permission not found |
| 409 | Conflict - Code already exists |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Authentication API](./../auth.md)
- [Admin Users API](./user.md)
- [Admin Roles API](./role.md)
- [Admin RBAC API](./rbac.md)






