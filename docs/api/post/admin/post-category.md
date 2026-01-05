# Admin Post Categories API

API quản lý danh mục bài viết (post categories) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get Post Categories List (Lấy danh sách danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/post-categories?page=1&limit=10" \
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
      "name": "Công nghệ",
      "slug": "cong-nghe",
      "description": "Các bài viết về công nghệ",
      "parent_id": null,
      "status": "active",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 20,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Post Category by ID (Lấy thông tin danh mục)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/post-categories/1 \
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
    "name": "Công nghệ",
    "slug": "cong-nghe",
    "description": "Các bài viết về công nghệ",
    "parent_id": null,
    "status": "active",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Create Post Category (Tạo danh mục)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/post-categories \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lập trình",
    "slug": "lap-trinh",
    "description": "Các bài viết về lập trình",
    "parent_id": 1,
    "status": "active"
  }'
```

### Request Body

```json
{
  "name": "Lập trình",
  "slug": "lap-trinh",
  "description": "Các bài viết về lập trình",
  "parent_id": 1,
  "status": "active"
}
```

**Fields:**
- `name` (required): Tên danh mục
- `slug` (optional): URL slug (tự động tạo nếu không có)
- `description` (optional): Mô tả danh mục
- `parent_id` (optional): ID danh mục cha (hierarchical categories)
- `status` (optional): Trạng thái (mặc định: "active")

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 21,
    "name": "Lập trình",
    "slug": "lap-trinh",
    "description": "Các bài viết về lập trình",
    "parent_id": 1,
    "status": "active",
    "created_at": "2025-01-11T06:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 4. Update Post Category (Cập nhật danh mục)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/post-categories/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tên danh mục đã cập nhật",
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
    "name": "Tên danh mục đã cập nhật",
    "slug": "cong-nghe",
    "status": "active",
    "updated_at": "2025-01-11T06:05:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

---

## 5. Delete Post Category (Xóa danh mục)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/post-categories/1 \
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

## Hierarchical Categories

Hệ thống hỗ trợ danh mục cây (parent-child):

```json
{
  "id": 1,
  "name": "Công nghệ",
  "parent_id": null,
  "children": [
    {
      "id": 2,
      "name": "Lập trình",
      "parent_id": 1
    },
    {
      "id": 3,
      "name": "AI & Machine Learning",
      "parent_id": 1
    }
  ]
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 404 | Not Found - Category not found |
| 409 | Conflict - Slug already exists |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Admin Posts API](./post.md)
- [Admin Post Tags API](./post-tag.md)
- [Public Post Categories API](./../public/post-category.md)