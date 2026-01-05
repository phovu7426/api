# Post Module API Documentation

Module quản lý blog và nội dung (posts, categories, tags).

## 📂 Cấu trúc Module

```
src/modules/post/
├── admin/              # Admin APIs
│   ├── post/
│   ├── post-category/
│   └── post-tag/
└── public/             # Public APIs
    ├── post/
    ├── post-category/
    └── post-tag/
```

---

## 🔐 Admin APIs

APIs dành cho quản trị viên - yêu cầu authentication và permissions.

### Posts (Bài viết)
- **GET** `/admin/posts` - Danh sách bài viết
- **GET** `/admin/posts/:id` - Chi tiết bài viết
- **POST** `/admin/posts` - Tạo bài viết mới
- **PUT** `/admin/posts/:id` - Cập nhật bài viết
- **DELETE** `/admin/posts/:id` - Xóa bài viết

📖 [Chi tiết Admin Posts API](./admin/post.md)

### Post Categories (Danh mục)
- **GET** `/admin/post-categories` - Danh sách danh mục
- **GET** `/admin/post-categories/:id` - Chi tiết danh mục
- **POST** `/admin/post-categories` - Tạo danh mục
- **PUT** `/admin/post-categories/:id` - Cập nhật danh mục
- **DELETE** `/admin/post-categories/:id` - Xóa danh mục

📖 [Chi tiết Admin Post Categories API](./admin/post-category.md)

### Post Tags (Thẻ)
- **GET** `/admin/post-tags` - Danh sách thẻ
- **GET** `/admin/post-tags/:id` - Chi tiết thẻ
- **POST** `/admin/post-tags` - Tạo thẻ
- **PUT** `/admin/post-tags/:id` - Cập nhật thẻ
- **DELETE** `/admin/post-tags/:id` - Xóa thẻ

📖 [Chi tiết Admin Post Tags API](./admin/post-tag.md)

---

## 🌐 Public APIs

APIs công khai - không yêu cầu authentication.

### Posts
- **GET** `/posts` - Danh sách bài viết
- **GET** `/posts/:slug` - Chi tiết bài viết
- **GET** `/posts/featured` - Bài viết nổi bật
- **GET** `/posts/search` - Tìm kiếm bài viết

📖 [Chi tiết Public Posts API](./public/post.md)

### Post Categories
- **GET** `/post-categories` - Danh sách danh mục
- **GET** `/post-categories/:slug` - Chi tiết danh mục
- **GET** `/post-categories/tree` - Cây danh mục

📖 [Chi tiết Public Post Categories API](./public/post-category.md)

### Post Tags
- **GET** `/post-tags` - Danh sách thẻ
- **GET** `/post-tags/:slug` - Chi tiết thẻ
- **GET** `/post-tags/popular` - Thẻ phổ biến

📖 [Chi tiết Public Post Tags API](./public/post-tag.md)

---

## 📊 Data Models

### Post
```typescript
{
  id: number
  name: string
  slug: string
  content: string
  excerpt?: string
  image?: string
  cover_image?: string
  post_type: 'text' | 'video' | 'image' | 'audio'
  video_url?: string
  audio_url?: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  is_featured: boolean
  is_pinned: boolean
  primary_postcategory_id?: number
  view_count: number
  published_at?: Date
  createdAt: Date
  updatedAt: Date
  primary_category?: PostCategory
  categories?: PostCategory[]
  tags?: PostTag[]
  // SEO fields
  meta_title?: string
  meta_description?: string
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: string
}
```

### Post Category
```typescript
{
  id: number
  name: string
  slug: string
  description?: string
  parent_id?: number
  status: 'active' | 'inactive'
  created_at: Date
  updated_at: Date
}
```

### Post Tag
```typescript
{
  id: number
  name: string
  slug: string
  description?: string
  status: 'active' | 'inactive'
  created_at: Date
  updated_at: Date
}
```

---

## 🔗 Relationships

- **Post** belongs to **Category**
- **Post** belongs to **User** (author)
- **Post** has many **Tags** (many-to-many)
- **Category** có thể có **Parent Category** (hierarchical)

---

## ✨ Features

### Posts
- ✅ Draft & Publish workflow
- ✅ Multiple post types (text, video, image, audio)
- ✅ Video & Audio support
- ✅ SEO metadata
- ✅ Featured images & Cover images
- ✅ Excerpt/Summary
- ✅ View counter
- ✅ Tag management
- ✅ Category assignment
- ✅ Featured & Pinned posts

### Categories
- ✅ Hierarchical structure (parent-child)
- ✅ SEO metadata
- ✅ Active/Inactive status

### Tags
- ✅ Tag cloud
- ✅ Popular tags
- ✅ Tag statistics

---

## 🎯 Use Cases

### Admin Use Cases
1. **Tạo bài viết mới**
   - Draft → Review → Publish
   - Assign category & tags
   - Upload featured image

2. **Quản lý danh mục**
   - Create hierarchical categories
   - Organize content structure

3. **Quản lý thẻ**
   - Create tags
   - Manage tag relationships

### Public Use Cases
1. **Đọc bài viết**
   - Browse published posts
   - View by category
   - Filter by tags

2. **Tìm kiếm**
   - Search posts by keyword
   - Filter by category/tag

---

## 🔧 Common Operations

### Tạo bài viết mới với category và tags

```bash
POST /admin/posts
{
  "name": "Bài viết mới",
  "content": "Nội dung...",
  "post_type": "text",
  "primary_postcategory_id": 1,
  "category_ids": [1, 2],
  "tag_ids": [1, 2, 3],
  "status": "draft"
}
```

### Tạo bài viết video

```bash
POST /admin/posts
{
  "name": "Video hướng dẫn",
  "content": "Mô tả video...",
  "post_type": "video",
  "video_url": "https://example.com/video.mp4",
  "cover_image": "https://example.com/thumbnail.jpg",
  "status": "published"
}
```

### Lấy bài viết theo danh mục

```bash
GET /public/posts?category_slug=technology&page=1&limit=10
```

### Lọc bài viết theo loại

```bash
GET /public/posts?filters[post_type]=video&page=1&limit=10
```

### Tìm kiếm bài viết

```bash
GET /posts/search?q=keyword&category_id=1
```

---

## Lấy dữ liệu từ API khác

### Enum API
- **GET** `/api/enums` - Lấy tất cả enums
- **GET** `/api/enums/post_type` - Lấy danh sách loại bài viết
- **GET** `/api/enums/post_status` - Lấy danh sách trạng thái bài viết

**Sử dụng:** Populate dropdowns, select boxes với enum values

### Post Categories API
- **GET** `/api/admin/post-categories` - Danh sách danh mục (Admin)
- **GET** `/api/public/post-categories` - Danh sách danh mục (Public)

**Sử dụng cho:** `primary_postcategory_id`, `category_ids`

### Post Tags API
- **GET** `/api/admin/post-tags` - Danh sách thẻ (Admin)
- **GET** `/api/public/post-tags` - Danh sách thẻ (Public)

**Sử dụng cho:** `tag_ids`

### File Upload API
- **POST** `/api/upload/file` - Upload file (video, audio, image)

**Sử dụng cho:** `video_url`, `audio_url`, `image`, `cover_image`

---

**Xem thêm:**
- [Main API Documentation](../README.md)
- [Authentication](../auth/auth.md)
- [Enum API Documentation](../../shared/enums/README.md)
- [File Upload API](../file-upload.md)