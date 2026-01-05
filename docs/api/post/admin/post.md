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
      "name": "Bài viết mẫu",
      "slug": "bai-viet-mau",
      "content": "Nội dung bài viết...",
      "excerpt": "Tóm tắt bài viết",
      "image": "https://example.com/image.jpg",
      "cover_image": "https://example.com/cover.jpg",
      "post_type": "text",
      "video_url": null,
      "audio_url": null,
      "status": "published",
      "is_featured": true,
      "is_pinned": false,
      "view_count": 100,
      "published_at": "2025-01-11T05:00:00.000Z",
      "createdAt": "2025-01-11T05:00:00.000Z",
      "updatedAt": "2025-01-11T05:00:00.000Z",
      "primary_category": {
        "id": 1,
        "name": "Technology",
        "slug": "technology"
      },
      "categories": [
        {
          "id": 1,
          "name": "Technology",
          "slug": "technology"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "JavaScript",
          "slug": "javascript"
        }
      ]
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
    "name": "Bài viết mẫu",
    "slug": "bai-viet-mau",
    "content": "Nội dung bài viết...",
    "excerpt": "Tóm tắt bài viết",
    "image": "https://example.com/image.jpg",
    "cover_image": "https://example.com/cover.jpg",
    "post_type": "text",
    "video_url": null,
    "audio_url": null,
    "status": "published",
    "is_featured": true,
    "is_pinned": false,
    "view_count": 100,
    "published_at": "2025-01-11T05:00:00.000Z",
    "createdAt": "2025-01-11T05:00:00.000Z",
    "updatedAt": "2025-01-11T05:00:00.000Z",
    "primary_category": {
      "id": 1,
      "name": "Technology",
      "slug": "technology"
    },
    "categories": [...],
    "tags": [...]
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
    "name": "Bài viết mới",
    "slug": "bai-viet-moi",
    "content": "Nội dung bài viết...",
    "excerpt": "Tóm tắt",
    "image": "https://example.com/image.jpg",
    "post_type": "text",
    "status": "draft",
    "primary_postcategory_id": 1,
    "category_ids": [1],
    "tag_ids": [1, 2]
  }'
```

### Request Body

```json
{
  "name": "Bài viết mới",
  "slug": "bai-viet-moi",
  "content": "Nội dung bài viết...",
  "excerpt": "Tóm tắt",
  "image": "https://example.com/image.jpg",
  "cover_image": "https://example.com/cover.jpg",
  "post_type": "text",
  "video_url": null,
  "audio_url": null,
  "status": "draft",
  "primary_postcategory_id": 1,
  "category_ids": [1, 2],
  "tag_ids": [1, 2, 3],
  "is_featured": false,
  "is_pinned": false
}
```

**Fields:**
- `name` (required): Tên bài viết
- `slug` (optional): URL slug (tự động tạo nếu không có)
- `content` (required): Nội dung bài viết
- `excerpt` (optional): Tóm tắt bài viết
- `image` (optional): URL ảnh đại diện
- `cover_image` (optional): URL ảnh bìa
- `post_type` (optional): Loại bài viết (`text`, `video`, `image`, `audio`) - mặc định: `text`
- `video_url` (optional): URL video (khuyến nghị khi `post_type` = `video`)
- `audio_url` (optional): URL audio (khuyến nghị khi `post_type` = `audio`)
- `status` (optional): Trạng thái (`draft`, `scheduled`, `published`, `archived`) - mặc định: `draft`
- `primary_postcategory_id` (optional): ID danh mục chính
- `category_ids` (optional): Mảng ID các danh mục
- `tag_ids` (optional): Mảng ID các thẻ
- `is_featured` (optional): Bài viết nổi bật (mặc định: `false`)
- `is_pinned` (optional): Bài viết được ghim (mặc định: `false`)
- `published_at` (optional): Thời gian xuất bản (ISO date string)
- `meta_title`, `meta_description`, `canonical_url`, `og_title`, `og_description`, `og_image` (optional): SEO metadata

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 51,
    "name": "Bài viết mới",
    "slug": "bai-viet-moi",
    "content": "Nội dung bài viết...",
    "excerpt": "Tóm tắt",
    "image": "https://example.com/image.jpg",
    "cover_image": null,
    "post_type": "text",
    "video_url": null,
    "audio_url": null,
    "status": "draft",
    "is_featured": false,
    "is_pinned": false,
    "view_count": 0,
    "published_at": null,
    "createdAt": "2025-01-11T06:00:00.000Z",
    "updatedAt": "2025-01-11T06:00:00.000Z",
    "primary_category": {
      "id": 1,
      "name": "Technology",
      "slug": "technology"
    },
    "categories": [...],
    "tags": [...]
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
    "name": "Tiêu đề đã cập nhật",
    "status": "published",
    "post_type": "video",
    "video_url": "https://example.com/video.mp4"
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
    "name": "Tiêu đề đã cập nhật",
    "slug": "bai-viet-mau",
    "post_type": "video",
    "video_url": "https://example.com/video.mp4",
    "status": "published",
    "updatedAt": "2025-01-11T06:05:00.000Z"
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
- `scheduled`: Đã lên lịch xuất bản
- `published`: Đã xuất bản
- `archived`: Đã lưu trữ

## Post Type

Các loại bài viết:

- `text`: Bài viết văn bản thông thường (mặc định)
- `video`: Bài viết dạng video
- `image`: Bài viết dạng hình ảnh (gallery)
- `audio`: Bài viết dạng âm thanh

**Lưu ý:**
- Khi `post_type` = `video`, nên cung cấp `video_url`
- Khi `post_type` = `audio`, nên cung cấp `audio_url`

## Lấy dữ liệu từ API khác

### 1. Enum API - Lấy danh sách giá trị enum

#### Lấy tất cả enums
```bash
GET /api/enums
```

**Response:**
```json
{
  "post_status": [
    {
      "id": "draft",
      "value": "draft",
      "name": "Nháp",
      "label": "Nháp"
    },
    {
      "id": "scheduled",
      "value": "scheduled",
      "name": "Đã lên lịch",
      "label": "Đã lên lịch"
    },
    {
      "id": "published",
      "value": "published",
      "name": "Đã xuất bản",
      "label": "Đã xuất bản"
    },
    {
      "id": "archived",
      "value": "archived",
      "name": "Lưu trữ",
      "label": "Lưu trữ"
    }
  ],
  "post_type": [
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
}
```

#### Lấy enum theo tên
```bash
GET /api/enums/post_type
GET /api/enums/post_status
```

**Response (GET /api/enums/post_type):**
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

**Các enum key có sẵn:**
- `post_status`: Trạng thái bài viết
- `post_type`: Loại bài viết
- `basic_status`: Trạng thái cơ bản (active/inactive)
- `gender`: Giới tính
- Và nhiều enum khác...

### 2. Post Categories API - Lấy danh sách danh mục

```bash
GET /api/admin/post-categories
```

**Sử dụng cho:**
- `primary_postcategory_id`: Chọn danh mục chính
- `category_ids`: Chọn nhiều danh mục

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

📖 [Chi tiết Admin Post Categories API](./post-category.md)

### 3. Post Tags API - Lấy danh sách thẻ

```bash
GET /api/admin/post-tags
```

**Sử dụng cho:**
- `tag_ids`: Chọn nhiều thẻ

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

📖 [Chi tiết Admin Post Tags API](./post-tag.md)

### 4. File Upload API - Upload video/audio/image

```bash
POST /api/upload/file
Content-Type: multipart/form-data
```

**Sử dụng cho:**
- Upload video file → lấy `url` → dùng làm `video_url`
- Upload audio file → lấy `url` → dùng làm `audio_url`
- Upload image → lấy `url` → dùng làm `image` hoặc `cover_image`

**Response:**
```json
{
  "path": "path/to/file.mp4",
  "url": "https://your-domain.com/uploads/1234567890-abc123.mp4",
  "filename": "1234567890-abc123.mp4",
  "size": 10485760,
  "mimetype": "video/mp4"
}
```

📖 [Chi tiết File Upload API](../../file-upload.md)

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
- [Admin Post Categories API](./post-category.md) - Lấy danh sách danh mục
- [Admin Post Tags API](./post-tag.md) - Lấy danh sách thẻ
- [Enum API](../../../shared/enums/README.md) - Lấy danh sách enum values
- [File Upload API](../../file-upload.md) - Upload video/audio/image files
- [Public Posts API](./../../post/public/post.md)
- [Post Video Support Guide](./../post-video-support.md) - Hướng dẫn chi tiết về hỗ trợ video