# Public Posts API

API công khai để lấy thông tin bài viết (posts). Không yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/posts`
- Authentication: **Không yêu cầu** (Public endpoints)
- Headers: `Content-Type: application/json`

---

## 1. Get Posts List (Lấy danh sách bài viết)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/posts?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1, tối thiểu: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10, tối thiểu: 1)
- `search` (optional): Tìm kiếm theo tên bài viết
- `category_slug` (optional): Lọc theo slug của danh mục
- `tag_slug` (optional): Lọc theo slug của thẻ
- `status` (optional): Lọc theo trạng thái (`draft`, `scheduled`, `published`, `archived`)
- `is_featured` (optional): Lọc bài viết nổi bật (true/false)
- `is_pinned` (optional): Lọc bài viết được ghim (true/false)
- `sort` (optional): Sắp xếp (mặc định: `created_at:DESC`)
- `filters[post_type]` (optional): Lọc theo loại bài viết (`text`, `video`, `image`, `audio`)

### Ví dụ với filters

```bash
# Lấy bài viết theo danh mục
curl -X GET "http://localhost:3000/api/public/posts?category_slug=technology&page=1&limit=10" \
  -H "Content-Type: application/json"

# Lấy bài viết theo thẻ
curl -X GET "http://localhost:3000/api/public/posts?tag_slug=javascript&page=1&limit=10" \
  -H "Content-Type: application/json"

# Tìm kiếm bài viết
curl -X GET "http://localhost:3000/api/public/posts?search=react&page=1&limit=10" \
  -H "Content-Type: application/json"

# Lấy bài viết nổi bật
curl -X GET "http://localhost:3000/api/public/posts?is_featured=true&page=1&limit=10" \
  -H "Content-Type: application/json"

# Lấy bài viết được ghim
curl -X GET "http://localhost:3000/api/public/posts?is_pinned=true&page=1&limit=10" \
  -H "Content-Type: application/json"

# Sắp xếp theo view count
curl -X GET "http://localhost:3000/api/public/posts?sort=view_count:DESC&page=1&limit=10" \
  -H "Content-Type: application/json"

# Lọc bài viết theo loại (video)
curl -X GET "http://localhost:3000/api/public/posts?filters[post_type]=video&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách bài viết thành công.",
  "data": [
    {
      "id": 1,
      "name": "Bài viết mẫu",
      "slug": "bai-viet-mau",
      "excerpt": "Đây là excerpt của bài viết...",
      "image": "https://example.com/image.jpg",
      "cover_image": "https://example.com/cover.jpg",
      "post_type": "text",
      "video_url": null,
      "audio_url": null,
      "published_at": "2025-01-11T05:00:00.000Z",
      "view_count": 100,
      "createdAt": "2025-01-11T05:00:00.000Z",
      "primary_category": {
        "id": 1,
        "name": "Technology",
        "slug": "technology",
        "description": "Technology category"
      },
      "categories": [
        {
          "id": 1,
          "name": "Technology",
          "slug": "technology",
          "description": "Technology category"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "JavaScript",
          "slug": "javascript",
          "description": "JavaScript tag"
        }
      ]
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

## 2. Get Featured Posts (Lấy bài viết nổi bật)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/posts/featured?limit=5" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `limit` (optional): Số lượng bài viết (mặc định: 5)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy bài viết nổi bật thành công.",
  "data": [
    {
      "id": 1,
      "name": "Bài viết nổi bật 1",
      "slug": "bai-viet-noi-bat-1",
      "excerpt": "Đây là excerpt...",
      "image": "https://example.com/image.jpg",
      "cover_image": "https://example.com/cover.jpg",
      "post_type": "video",
      "video_url": "https://example.com/video.mp4",
      "audio_url": null,
      "published_at": "2025-01-11T05:00:00.000Z",
      "view_count": 500,
      "createdAt": "2025-01-11T05:00:00.000Z",
      "primary_category": {
        "id": 1,
        "name": "Technology",
        "slug": "technology"
      },
      "categories": [...],
      "tags": [...]
    }
  ]
}
```

---

## 3. Get Post by Slug (Lấy bài viết theo slug)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/posts/bai-viet-mau" \
  -H "Content-Type: application/json"
```

### Path Parameters

- `slug` (required): Slug của bài viết

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin bài viết thành công.",
  "data": {
    "id": 1,
    "name": "Bài viết mẫu",
    "slug": "bai-viet-mau",
    "excerpt": "Đây là excerpt của bài viết...",
    "content": "Đây là nội dung đầy đủ của bài viết...",
    "image": "https://example.com/image.jpg",
    "cover_image": "https://example.com/cover.jpg",
    "post_type": "text",
    "video_url": null,
    "audio_url": null,
    "published_at": "2025-01-11T05:00:00.000Z",
    "view_count": 101,
    "createdAt": "2025-01-11T05:00:00.000Z",
    "updatedAt": "2025-01-11T05:00:00.000Z",
    "primary_category": {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Technology category"
    },
    "categories": [
      {
        "id": 1,
        "name": "Technology",
        "slug": "technology",
        "description": "Technology category"
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "JavaScript",
        "slug": "javascript",
        "description": "JavaScript tag"
      }
    ],
    "meta_title": "Bài viết mẫu - SEO Title",
    "meta_description": "SEO description",
    "canonical_url": "https://example.com/posts/bai-viet-mau",
    "og_title": "Open Graph Title",
    "og_description": "Open Graph Description",
    "og_image": "https://example.com/og-image.jpg"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy bài viết.",
  "data": null
}
```

### Lưu ý

- Endpoint này tự động tăng `view_count` khi được gọi
- Chỉ trả về bài viết có status là `published`
- Nếu bài viết không tồn tại hoặc đã bị xóa, sẽ trả về 404

---

## Ví dụ đầy đủ - Flow hoàn chỉnh

```bash
# 1. Lấy danh sách bài viết
curl -X GET "http://localhost:3000/api/public/posts?page=1&limit=10" \
  -H "Content-Type: application/json"

# 2. Lấy bài viết nổi bật
curl -X GET "http://localhost:3000/api/public/posts/featured?limit=5" \
  -H "Content-Type: application/json"

# 3. Lấy bài viết theo danh mục
curl -X GET "http://localhost:3000/api/public/posts?category_slug=technology&page=1&limit=10" \
  -H "Content-Type: application/json"

# 4. Lấy bài viết theo thẻ
curl -X GET "http://localhost:3000/api/public/posts?tag_slug=javascript&page=1&limit=10" \
  -H "Content-Type: application/json"

# 5. Tìm kiếm bài viết
curl -X GET "http://localhost:3000/api/public/posts?search=react&page=1&limit=10" \
  -H "Content-Type: application/json"

# 6. Lấy chi tiết bài viết
curl -X GET "http://localhost:3000/api/public/posts/bai-viet-mau" \
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
- `404` - Not Found (bài viết không tồn tại)
- `500` - Internal Server Error

---

## Post Type

Các loại bài viết:

- `text`: Bài viết văn bản thông thường (mặc định)
- `video`: Bài viết dạng video
- `image`: Bài viết dạng hình ảnh (gallery)
- `audio`: Bài viết dạng âm thanh

**Response fields:**
- `post_type`: Loại bài viết
- `video_url`: URL video (có giá trị khi `post_type` = `video`)
- `audio_url`: URL audio (có giá trị khi `post_type` = `audio`)

**Lưu ý:**
- Có thể lọc bài viết theo loại: `?filters[post_type]=video`
- Có thể lấy danh sách loại bài viết qua: `GET /api/enums/post_type`

## Lấy dữ liệu từ API khác

### 1. Enum API - Lấy danh sách giá trị enum

#### Lấy enum post_type
```bash
GET /api/enums/post_type
```

**Response:**
```json
[
  {
    "id": "text",
    "value": "text",
    "name": "Văn bản",
    "label": "Văn bản"
  },
  {
    "id": "video",
    "value": "video",
    "name": "Video",
    "label": "Video"
  },
  {
    "id": "image",
    "value": "image",
    "name": "Hình ảnh",
    "label": "Hình ảnh"
  },
  {
    "id": "audio",
    "value": "audio",
    "name": "Âm thanh",
    "label": "Âm thanh"
  }
]
```

#### Lấy tất cả enums
```bash
GET /api/enums
```

**Sử dụng:** Lấy tất cả enum values để populate dropdowns, select boxes trong form

### 2. Post Categories API - Lấy danh sách danh mục

```bash
GET /api/public/post-categories
```

**Sử dụng:**
- Hiển thị danh sách danh mục trong sidebar/navigation
- Lọc bài viết theo danh mục
- Hiển thị breadcrumb

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Technology category"
    }
  ]
}
```

📖 [Chi tiết Public Post Categories API](./post-category.md)

### 3. Post Tags API - Lấy danh sách thẻ

```bash
GET /api/public/post-tags
```

**Sử dụng:**
- Hiển thị tag cloud
- Lọc bài viết theo thẻ
- Hiển thị tags của bài viết

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript",
      "description": "JavaScript tag"
    }
  ]
}
```

📖 [Chi tiết Public Post Tags API](./post-tag.md)

## Lưu ý

1. **Public Endpoints**: Tất cả endpoints đều không yêu cầu authentication
2. **Published Only**: Chỉ trả về bài viết có status là `published`
3. **View Count**: View count tự động tăng khi xem chi tiết bài viết
4. **Pagination**: Hỗ trợ pagination với `page` và `limit`
5. **Filtering**: Có thể lọc theo category, tag, search, featured, pinned, post_type
6. **Sorting**: Có thể sắp xếp theo các trường khác nhau
7. **Post Types**: Hỗ trợ nhiều loại bài viết (text, video, image, audio)

---

## Xem thêm

- [Public Post Categories API](./post-category.md) - Lấy danh sách danh mục
- [Public Post Tags API](./post-tag.md) - Lấy danh sách thẻ
- [Enum API](../../../shared/enums/README.md) - Lấy danh sách enum values
- [Admin Posts API](../admin/post.md) - Để quản lý bài viết (yêu cầu authentication)
- [Post Video Support Guide](../post-video-support.md) - Hướng dẫn chi tiết về hỗ trợ video

