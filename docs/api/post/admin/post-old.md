# Admin Posts API

API quản lý bài viết (posts) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get Posts List (Lấy danh sách bài viết)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/posts?page=1&limit=10" \
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
      "title": "Bài viết mẫu",
      "slug": "bai-viet-mau",
      "content": "Nội dung bài viết...",
      "excerpt": "Tóm tắt bài viết",
      "featured_image": "https://example.com/image.jpg",
      "status": "published",
      "author_id": 1,
      "category_id": 1,
      "view_count": 100,
      "published_at": "2025-01-11T05:00:00.000Z",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Post by ID (Lấy thông tin bài viết)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/posts/1 \
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
    "title": "Bài viết mẫu",
    "slug": "bai-viet-mau",
    "content": "Nội dung bài viết...",
    "excerpt": "Tóm tắt bài viết",
    "featured_image": "https://example.com/image.jpg",
    "status": "published",
    "author_id": 1,
    "category_id": 1,
    "view_count": 100,
    "published_at": "2025-01-11T05:00:00.000Z",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Create Post (Tạo bài viết)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/posts \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bài viết mới",
    "slug": "bai-viet-moi",
    "content": "Nội dung bài viết...",
    "excerpt": "Tóm tắt",
    "featured_image": "https://example.com/image.jpg",
    "status": "draft",
    "category_id": 1
  }'
```

### Request Body

```json
{
  "title": "Bài viết mới",
  "slug": "bai-viet-moi",
  "content": "Nội dung bài viết...",
  "excerpt": "Tóm tắt",
  "featured_image": "https://example.com/image.jpg",
  "status": "draft",
  "category_id": 1,
  "tag_ids": [1, 2, 3]
}
```

**Fields:**
- `title` (required): Tiêu đề bài viết
- `slug` (optional): URL slug (tự động tạo nếu không có)
- `content` (required): Nội dung bài viết
- `excerpt` (optional): Tóm tắt bài viết
- `featured_image` (optional): URL ảnh đại diện
- `status` (optional): Trạng thái (draft, published, archived)
- `category_id` (optional): ID danh mục
- `tag_ids` (optional): Mảng ID các thẻ

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 51,
    "title": "Bài viết mới",
    "slug": "bai-viet-moi",
    "content": "Nội dung bài viết...",
    "excerpt": "Tóm tắt",
    "featured_image": "https://example.com/image.jpg",
    "status": "draft",
    "author_id": 1,
    "category_id": 1,
    "view_count": 0,
    "created_at": "2025-01-11T06:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 4. Update Post (Cập nhật bài viết)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/posts/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tiêu đề đã cập nhật",
    "status": "published"
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
    "title": "Tiêu đề đã cập nhật",
    "slug": "bai-viet-mau",
    "status": "published",
    "updated_at": "2025-01-11T06:05:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

---

## 5. Delete Post (Xóa bài viết)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/posts/1 \
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

## Post Status

Các trạng thái bài viết:

- `draft`: Bản nháp
- `published`: Đã xuất bản
- `archived`: Đã lưu trữ

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 404 | Not Found - Post not found |
| 409 | Conflict - Slug already exists |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Admin Post Categories API](./post-category.md)
- [Admin Post Tags API](./post-tag.md)
- [Public Posts API](./../public/post.md)