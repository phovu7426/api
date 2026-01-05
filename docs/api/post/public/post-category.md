# Public Post Categories API

API công khai để lấy thông tin danh mục bài viết (post categories). Không yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/post-categories`
- Authentication: **Không yêu cầu** (Public endpoints)
- Headers: `Content-Type: application/json`

---

## 1. Get Categories List (Lấy danh sách danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/post-categories?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1, tối thiểu: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10, tối thiểu: 1)
- `search` (optional): Tìm kiếm theo tên danh mục
- `parent_id` (optional): Lọc theo ID danh mục cha
- `status` (optional): Lọc theo trạng thái (`active`, `inactive`)
- `sort` (optional): Sắp xếp (mặc định: `sort_order:ASC`)

### Ví dụ với filters

```bash
# Lấy danh mục con của danh mục có ID = 1
curl -X GET "http://localhost:3000/api/public/post-categories?parent_id=1&page=1&limit=10" \
  -H "Content-Type: application/json"

# Tìm kiếm danh mục
curl -X GET "http://localhost:3000/api/public/post-categories?search=technology&page=1&limit=10" \
  -H "Content-Type: application/json"

# Lấy chỉ danh mục active
curl -X GET "http://localhost:3000/api/public/post-categories?status=active&page=1&limit=10" \
  -H "Content-Type: application/json"

# Sắp xếp theo tên
curl -X GET "http://localhost:3000/api/public/post-categories?sort=name:ASC&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách danh mục thành công.",
  "data": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Technology related posts",
      "image": "https://example.com/category-image.jpg",
      "status": "active",
      "sort_order": 1,
      "parent_id": null,
      "meta_title": "Technology - Category",
      "meta_description": "Technology category description",
      "canonical_url": "https://example.com/categories/technology",
      "createdAt": "2025-01-11T05:00:00.000Z",
      "updatedAt": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Programming",
      "slug": "programming",
      "description": "Programming related posts",
      "image": "https://example.com/category-image-2.jpg",
      "status": "active",
      "sort_order": 2,
      "parent_id": 1,
      "meta_title": "Programming - Category",
      "meta_description": "Programming category description",
      "canonical_url": "https://example.com/categories/programming",
      "createdAt": "2025-01-11T05:00:00.000Z",
      "updatedAt": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemCount": 10,
    "itemsPerPage": 10,
    "totalItems": 20,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Category by Slug (Lấy danh mục theo slug)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/post-categories/technology" \
  -H "Content-Type: application/json"
```

### Path Parameters

- `slug` (required): Slug của danh mục

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin danh mục thành công.",
  "data": {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "description": "Technology related posts",
    "image": "https://example.com/category-image.jpg",
    "status": "active",
    "sort_order": 1,
    "parent_id": null,
    "meta_title": "Technology - Category",
    "meta_description": "Technology category description",
    "canonical_url": "https://example.com/categories/technology",
    "createdAt": "2025-01-11T05:00:00.000Z",
    "updatedAt": "2025-01-11T05:00:00.000Z",
    "parent": {
      "id": null,
      "name": null,
      "slug": null
    },
    "children": [
      {
        "id": 2,
        "name": "Programming",
        "slug": "programming"
      },
      {
        "id": 3,
        "name": "Web Development",
        "slug": "web-development"
      }
    ]
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy danh mục.",
  "data": null
}
```

### Lưu ý

- Endpoint này tự động load quan hệ `parent` và `children`
- Chỉ trả về danh mục có status là `active`
- Nếu danh mục không tồn tại hoặc đã bị xóa, sẽ trả về 404

---

## Ví dụ đầy đủ - Flow hoàn chỉnh

```bash
# 1. Lấy danh sách danh mục
curl -X GET "http://localhost:3000/api/public/post-categories?page=1&limit=10" \
  -H "Content-Type: application/json"

# 2. Lấy danh mục con của danh mục có ID = 1
curl -X GET "http://localhost:3000/api/public/post-categories?parent_id=1&page=1&limit=10" \
  -H "Content-Type: application/json"

# 3. Tìm kiếm danh mục
curl -X GET "http://localhost:3000/api/public/post-categories?search=tech&page=1&limit=10" \
  -H "Content-Type: application/json"

# 4. Lấy chi tiết danh mục
curl -X GET "http://localhost:3000/api/public/post-categories/technology" \
  -H "Content-Type: application/json"

# 5. Lấy danh mục và bài viết trong danh mục đó (kết hợp với Posts API)
curl -X GET "http://localhost:3000/api/public/posts?category_slug=technology&page=1&limit=10" \
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
- `404` - Not Found (danh mục không tồn tại)
- `500` - Internal Server Error

---

## Lưu ý

1. **Public Endpoints**: Tất cả endpoints đều không yêu cầu authentication
2. **Active Only**: Chỉ trả về danh mục có status là `active`
3. **Hierarchy**: Hỗ trợ danh mục cha-con (parent-child)
4. **Pagination**: Hỗ trợ pagination với `page` và `limit`
5. **Filtering**: Có thể lọc theo parent_id, search, status
6. **Sorting**: Có thể sắp xếp theo các trường khác nhau (mặc định: `sort_order:ASC`)

---

## Xem thêm

- [Public Posts API](./post.md) - Để lấy bài viết theo danh mục
- [Public Post Tags API](./post-tag.md)
- [Admin Post Categories API](../admin/post-category.md) - Để quản lý danh mục (yêu cầu authentication)

