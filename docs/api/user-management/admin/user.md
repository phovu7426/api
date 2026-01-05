# Admin Users API

API quản lý người dùng trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Create User (Tạo người dùng mới)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "phone": "0901234567",
    "password": "password123",
    "role_ids": [1],
    "profile": {
      "name": "Người dùng mới",
      "image": "https://example.com/avatar.jpg",
      "birthday": "1990-01-01",
      "gender": "male",
      "address": "123 Đường ABC, Quận XYZ",
      "about": "Giới thiệu về người dùng"
    }
  }'
```

### Request Body

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "phone": "0901234567",
  "password": "password123",
  "role_ids": [1],
  "profile": {
    "name": "Người dùng mới",
    "image": "https://example.com/avatar.jpg",
    "birthday": "1990-01-01",
    "gender": "male",
    "address": "123 Đường ABC, Quận XYZ",
    "about": "Giới thiệu về người dùng"
  }
}
```

**Fields:**
- `username` (optional): Tên đăng nhập
- `email` (optional): Email
- `phone` (optional): Số điện thoại
- `password` (required): Mật khẩu (tối thiểu 6 ký tự)
- `role_ids` (optional): Mảng ID vai trò - **Lưu ý:** Field này sẽ bị bỏ qua khi tạo user. Để gán roles cho user, vui lòng sử dụng [RBAC API](./rbac.md#4-assign-roles-to-user-gán-vai-trò-cho-user)
- `profile` (optional): Thông tin profile

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 21,
    "username": "newuser",
    "email": "newuser@example.com",
    "phone": "0901234567",
    "status": "active",
    "created_at": "2025-01-11T05:30:00.000Z",
    "updated_at": "2025-01-11T05:30:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 2. Update User (Cập nhật người dùng)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/users/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "updateduser",
    "email": "updated@example.com",
    "phone": "0987654321",
    "profile": {
      "name": "Người dùng đã cập nhật",
      "image": "https://example.com/new-avatar.jpg"
    }
  }'
```

### Request Body

Tương tự như Create User, tất cả các fields đều optional.

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "updateduser",
    "email": "updated@example.com",
    "phone": "0987654321",
    "status": "active",
    "updated_at": "2025-01-11T05:35:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

---

## 3. Get User by ID (Lấy thông tin người dùng)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/users/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

**Lưu ý**: Endpoint này tự động load các relations mặc định (`roles`) và `profile`. Phân quyền chỉ được thực hiện qua roles, không có direct permissions.

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "phone": "0901234567",
    "status": "active",
    "roles": [
      {
        "id": 1,
        "code": "admin",
        "name": "Admin",
        "status": "active",
        "permissions": [...]
      }
    ],
    "profile": {
      "id": 1,
      "userId": 1,
      "name": "Admin User",
      "image": "https://example.com/avatar.jpg",
      "birthday": "1985-01-01",
      "gender": "male",
      "address": "123 Main Street",
      "about": "System Administrator"
    },
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 4. Change Password (Đổi mật khẩu)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/users/1/password \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "Hoanghoang1.",
    "password_confirmation": "Hoanghoang1."
  }'
```

### Request Body

```json
{
  "password": "Hoanghoang1.",
  "password_confirmation": "Hoanghoang1."
}
```

**Fields:**
- `password` (required): Mật khẩu mới (tối thiểu 6 ký tự)
- `password_confirmation` (required): Xác nhận mật khẩu (phải khớp với `password`)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Đổi mật khẩu thành công"
}
```

---

## 5. Delete User (Xóa người dùng)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/users/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

**Lưu ý**: Endpoint này sẽ xóa cả profile của user (nếu có). Xóa này là hard delete (xóa vĩnh viễn khỏi database).

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa thành công"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Entity with ID 1 not found",
  "data": null
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 404 | Not Found - User not found |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Authentication API](./../auth/auth.md)
- [Admin Roles API](./role.md)
- [Admin Permissions API](./permission.md)
- [RBAC API](./rbac.md) - Để gán vai trò và quyền cho user


