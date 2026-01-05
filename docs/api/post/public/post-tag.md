# Public Post Tags API

API công khai để lấy thông tin thẻ bài viết (post tags). Không yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/post-tags`
- Authentication: **Không yêu cầu** (Public endpoints)
- Headers: `Content-Type: application/json`

---

## 1. Get Tags List (Lấy danh sách thẻ)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/post-tags?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1, tối thiểu: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10, tối thiểu: 1)
- `search` (optional): Tìm kiếm theo tên thẻ
- `status` (optional): Lọc theo trạng thái (`active`, `inactive`)
- `sort` (optional): Sắp xếp (mặc định: `createdAt:DESC`)

### Ví dụ với filters

```bash
# Tìm kiếm thẻ
curl -X GET "http://localhost:3000/api/public/post-tags?search=javascript&page=1&limit=10" \
  -H "Content-Type: application/json"

# Lấy chỉ thẻ active
curl -X GET "http://localhost:3000/api/public/post-tags?status=active&page=1&limit=10" \
  -H "Content-Type: application/json"

# Sắp xếp theo tên
curl -X GET "http://localhost:3000/api/public/post-tags?sort=name:ASC&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách thẻ thành công.",
  "data": [
    {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript",
      "description": "JavaScript programming language",
      "status": "active",
      "meta_title": "JavaScript - Tag",
      "meta_description": "JavaScript tag description",
      "canonical_url": "https://example.com/tags/javascript",
      "createdAt": "2025-01-11T05:00:00.000Z",
      "updatedAt": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "name": "TypeScript",
      "slug": "typescript",
      "description": "TypeScript programming language",
      "status": "active",
      "meta_title": "TypeScript - Tag",
      "meta_description": "TypeScript tag description",
      "canonical_url": "https://example.com/tags/typescript",
      "createdAt": "2025-01-11T05:00:00.000Z",
      "updatedAt": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemCount": 10,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Tag by Slug (Lấy thẻ theo slug)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/post-tags/javascript" \
  -H "Content-Type: application/json"
```

### Path Parameters

- `slug` (required): Slug của thẻ

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin thẻ thành công.",
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "description": "JavaScript programming language",
    "status": "active",
    "meta_title": "JavaScript - Tag",
    "meta_description": "JavaScript tag description",
    "canonical_url": "https://example.com/tags/javascript",
    "createdAt": "2025-01-11T05:00:00.000Z",
    "updatedAt": "2025-01-11T05:00:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy thẻ.",
  "data": null
}
```

### Lưu ý

- Chỉ trả về thẻ có status là `active`
- Nếu thẻ không tồn tại hoặc đã bị xóa, sẽ trả về 404

---

## Ví dụ đầy đủ - Flow hoàn chỉnh

```bash
# 1. Lấy danh sách thẻ
curl -X GET "http://localhost:3000/api/public/post-tags?page=1&limit=10" \
  -H "Content-Type: application/json"

# 2. Tìm kiếm thẻ
curl -X GET "http://localhost:3000/api/public/post-tags?search=js&page=1&limit=10" \
  -H "Content-Type: application/json"

# 3. Lấy chi tiết thẻ
curl -X GET "http://localhost:3000/api/public/post-tags/javascript" \
  -H "Content-Type: application/json"

# 4. Lấy thẻ và bài viết có thẻ đó (kết hợp với Posts API)
curl -X GET "http://localhost:3000/api/public/posts?tag_slug=javascript&page=1&limit=10" \
  -H "Content-Type: application/json"
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... } | [ ... ],
  "meta": { ... }  // Chỉ có trong GET list
}
```

### Error Response

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "data": null
}
```

---

## Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found (thẻ không tồn tại)
- `500` - Internal Server Error

---

## Lưu ý

1. **Public Endpoints**: Tất cả endpoints đều không yêu cầu authentication
2. **Active Only**: Chỉ trả về thẻ có status là `active`
3. **Pagination**: Hỗ trợ pagination với `page` và `limit`
4. **Filtering**: Có thể lọc theo search, status
5. **Sorting**: Có thể sắp xếp theo các trường khác nhau (mặc định: `createdAt:DESC`)

---

## Xem thêm

- [Public Posts API](./post.md) - Để lấy bài viết theo thẻ
- [Public Post Categories API](./post-category.md)
- [Admin Post Tags API](../admin/post-tag.md) - Để quản lý thẻ (yêu cầu authentication)

