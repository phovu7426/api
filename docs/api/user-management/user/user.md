# User API

API cho người dùng quản lý thông tin cá nhân. Yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api/users`
- Authentication: **JWT Bearer Token** (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get Current User (Lấy thông tin user hiện tại)

### Request

```bash
curl -X GET "http://localhost:3000/api/users/me" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin user thành công",
  "data": {
    "id": 1,
    "username": "nguyenvana",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "status": "active",
    "email_verified_at": null,
    "phone_verified_at": null,
    "last_login_at": "2025-01-11T05:00:00.000Z",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "profile": {
      "id": 1,
      "userId": 1,
      "name": "Nguyễn Văn A",
      "avatarUrl": "https://example.com/avatar.jpg",
      "birthday": "1990-01-01",
      "gender": "male",
      "address": "123 Đường ABC, Quận XYZ",
      "about": "Giới thiệu về bản thân"
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Không thể lấy thông tin user",
  "data": null
}
```

### Lưu ý

- Endpoint này yêu cầu authentication
- Tự động lấy thông tin user từ JWT token
- Trả về thông tin user và profile (nếu có)

---

## 2. Update Profile (Cập nhật thông tin cá nhân)

### Request

```bash
curl -X PATCH "http://localhost:3000/api/users/me" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn B",
    "phone": "0987654321",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  }'
```

### Request Body

```json
{
  "name": "Nguyễn Văn B",
  "phone": "0987654321",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Fields:**
- `name` (optional): Tên đầy đủ (tối đa 100 ký tự)
- `phone` (optional): Số điện thoại (phải đúng format số điện thoại Việt Nam)
- `avatarUrl` (optional): URL ảnh đại diện (tối đa 255 ký tự)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin thành công",
  "data": {
    "id": 1,
    "username": "nguyenvana",
    "email": "nguyenvana@example.com",
    "phone": "0987654321",
    "status": "active",
    "updated_at": "2025-01-11T05:30:00.000Z",
    "profile": {
      "id": 1,
      "userId": 1,
      "name": "Nguyễn Văn B",
      "avatarUrl": "https://example.com/new-avatar.jpg",
      "birthday": "1990-01-01",
      "gender": "male",
      "address": "123 Đường ABC, Quận XYZ",
      "about": "Giới thiệu về bản thân"
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "phone": ["phone must be a valid phone number"]
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Không thể cập nhật thông tin user",
  "data": null
}
```

### Lưu ý

- Tất cả các fields đều optional
- Chỉ cập nhật các fields được gửi lên
- Phone phải đúng format số điện thoại Việt Nam
- Name tối đa 100 ký tự
- AvatarUrl tối đa 255 ký tự

---

## 3. Change Password (Đổi mật khẩu)

### Request

```bash
curl -X PATCH "http://localhost:3000/api/users/me/password" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "oldpassword123",
    "newPassword": "newpassword123"
  }'
```

### Request Body

```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Fields:**
- `oldPassword` (required): Mật khẩu cũ (tối thiểu 6 ký tự)
- `newPassword` (required): Mật khẩu mới (tối thiểu 6 ký tự)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Mật khẩu cũ không đúng",
  "data": null
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Không thể đổi mật khẩu",
  "data": null
}
```

### Lưu ý

- Phải cung cấp mật khẩu cũ để xác thực
- Mật khẩu mới phải tối thiểu 6 ký tự
- Mật khẩu cũ phải đúng với mật khẩu hiện tại
- Sau khi đổi mật khẩu thành công, user có thể cần đăng nhập lại

---

## Ví dụ đầy đủ - Flow hoàn chỉnh

```bash
# 1. Đăng nhập để lấy token (nếu chưa có)
curl -X POST "http://localhost:3000/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nguyenvana@example.com",
    "password": "password123"
  }'

# Lưu token từ response
TOKEN="YOUR_JWT_TOKEN_HERE"

# 2. Lấy thông tin user hiện tại
curl -X GET "http://localhost:3000/api/users/me" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"

# 3. Cập nhật thông tin cá nhân
curl -X PATCH "http://localhost:3000/api/users/me" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn B",
    "phone": "0987654321",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  }'

# 4. Đổi mật khẩu
curl -X PATCH "http://localhost:3000/api/users/me/password" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... } | null
}
```

### Error Response

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "data": null,
  "errors": { ... }  // Chỉ có khi validation error
}
```

---

## Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `500` - Internal Server Error

---

## Lưu ý

1. **Authentication**: Tất cả endpoints yêu cầu JWT token
2. **Self Service**: User chỉ có thể quản lý thông tin của chính mình
3. **Profile**: Thông tin profile được tự động tạo khi đăng ký
4. **Password**: Phải cung cấp mật khẩu cũ để đổi mật khẩu mới
5. **Validation**: Tất cả inputs đều được validate

---

## Xem thêm

- [Authentication API](../auth/auth.md) - Để đăng nhập và đăng ký
- [Admin Users API](../admin/user.md) - Để quản lý user (yêu cầu admin permissions)

