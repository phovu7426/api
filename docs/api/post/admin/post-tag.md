# API Post Tag - Admin Endpoints

Tài liệu curl commands cho Post Tag Admin API.

## Base URL

```
http://localhost:3000/api/admin/post-tags
```

## Authentication

Tất cả endpoints đều yêu cầu JWT token trong header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Lưu ý**: Thay `YOUR_JWT_TOKEN` bằng token thực tế sau khi đăng nhập.

---

## 1. Lấy danh sách Post Tags

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/post-tags?page=1&limit=10&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `status` (optional): Lọc theo status (`active`, `inactive`)
- `search` (optional): Tìm kiếm theo name hoặc slug
- `sort` (optional): Sắp xếp (ví dụ: `createdAt:DESC`)

### Ví dụ với filters

```bash
# Tìm kiếm tag có chứa "javascript"
curl -X GET "http://localhost:3000/api/admin/post-tags?search=javascript&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Lọc theo status và sắp xếp
curl -X GET "http://localhost:3000/api/admin/post-tags?status=active&sort=name:ASC&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 2. Lấy chi tiết một Post Tag

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/post-tags/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "success": true,
  "message": "Lấy thông tin thẻ thành công.",
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "description": "JavaScript related content",
    "status": "active",
    "meta_title": null,
    "meta_description": null,
    "canonical_url": null,
    "createdAt": "2025-01-11T04:00:00.000Z",
    "updatedAt": "2025-01-11T04:00:00.000Z"
  }
}
```

---

## 3. Tạo Post Tag mới

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/post-tags" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TypeScript",
    "slug": "typescript",
    "description": "TypeScript programming language",
    "status": "active",
    "meta_title": "TypeScript - Programming Language",
    "meta_description": "Learn TypeScript programming",
    "canonical_url": "https://example.com/tags/typescript"
  }'
```

### Body Parameters

- `name` (required): Tên tag (string, max 255 ký tự)
- `slug` (optional): URL slug (string, max 255 ký tự) - tự động tạo nếu không có
- `description` (optional): Mô tả (string)
- `status` (optional): Trạng thái (`active` hoặc `inactive`, mặc định: `active`)
- `meta_title` (optional): SEO meta title (string)
- `meta_description` (optional): SEO meta description (string)
- `canonical_url` (optional): Canonical URL (string)

### Ví dụ đơn giản (chỉ name, các field khác tự động)

```bash
curl -X POST "http://localhost:3000/api/admin/post-tags" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js"
  }'
```

---

## 4. Cập nhật Post Tag

### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/post-tags/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TypeScript Updated",
    "description": "Updated description for TypeScript",
    "status": "active"
  }'
```

### Body Parameters

Tất cả các parameters đều optional (chỉ gửi field muốn update):

- `name` (optional): Tên tag mới
- `slug` (optional): URL slug mới
- `description` (optional): Mô tả mới
- `status` (optional): Trạng thái mới (`active` hoặc `inactive`)
- `meta_title` (optional): SEO meta title
- `meta_description` (optional): SEO meta description
- `canonical_url` (optional): Canonical URL

### Ví dụ chỉ update status

```bash
curl -X PUT "http://localhost:3000/api/admin/post-tags/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

---

## 5. Xóa Post Tag

### Request

```bash
curl -X DELETE "http://localhost:3000/api/admin/post-tags/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "success": true,
  "message": "Xóa thẻ thành công.",
  "data": null
}
```

---

## Ví dụ đầy đủ - Flow hoàn chỉnh

```bash
# 1. Đăng nhập để lấy token (nếu chưa có)
curl -X POST "http://localhost:3000/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Lưu token từ response
TOKEN="YOUR_JWT_TOKEN_HERE"

# 2. Tạo tag mới
curl -X POST "http://localhost:3000/api/admin/post-tags" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "React",
    "description": "React library for building user interfaces",
    "status": "active"
  }'

# 3. Lấy danh sách tags
curl -X GET "http://localhost:3000/api/admin/post-tags?page=1&limit=10" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"

# 4. Lấy chi tiết tag (giả sử ID = 1)
curl -X GET "http://localhost:3000/api/admin/post-tags/1" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"

# 5. Cập nhật tag
curl -X PUT "http://localhost:3000/api/admin/post-tags/1" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description for React"
  }'

# 6. Xóa tag
curl -X DELETE "http://localhost:3000/api/admin/post-tags/1" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... },
  "meta": { ... }  // Chỉ có trong GET list
}
```

### Error Response

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "code": "ERROR_CODE",
  "errors": { ... }
}
```

---

## Status Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Lưu ý

1. **Authentication**: Tất cả endpoints yêu cầu JWT token
2. **Permissions**: Cần có quyền `posttag.manage` hoặc các quyền con tương ứng
3. **Slug**: Nếu không cung cấp slug, hệ thống sẽ tự động tạo từ name
4. **Status**: Mặc định là `active` nếu không chỉ định
5. **Soft Delete**: Xóa tag sẽ soft delete (không xóa vĩnh viễn)

---

## Test với Postman

Nếu muốn test với Postman thay vì curl:

1. Import collection với các endpoints trên
2. Set environment variable `BASE_URL = http://localhost:3000/api`
3. Set environment variable `TOKEN` sau khi login
4. Sử dụng `{{BASE_URL}}/admin/post-tags` trong requests

