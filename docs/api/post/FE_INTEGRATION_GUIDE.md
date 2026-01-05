# Tài liệu tích hợp API Post, Post Category, Post Tag cho trang Home

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [API Endpoints](#api-endpoints)
3. [Chi tiết các Entity](#chi-tiết-các-entity)
4. [Hướng dẫn tích hợp cho trang Home](#hướng-dẫn-tích-hợp-cho-trang-home)
5. [Ví dụ Request/Response](#ví-dụ-requestresponse)

---

## Tổng quan

Tài liệu này mô tả chi tiết cách tích hợp API cho **Post** (Bài viết), **Post Category** (Danh mục bài viết), và **Post Tag** (Thẻ bài viết) để hiển thị trên trang Home.

### Base URL
```
http://localhost:8000/api/public
```

### Authentication
**KHÔNG YÊU CẦU** - Tất cả các API này là public endpoints, không cần token authentication, nếu có đăng nhập thì vẫn truyền như bình thường.

### Headers
```
Content-Type: application/json
```

---

## API Endpoints

### 1. Posts API

#### 1.1. Lấy danh sách bài viết
```
GET /public/posts
```

**Query Parameters:**
| Tham số | Kiểu | Bắt buộc | Mô tả | Mặc định |
|---------|------|----------|-------|----------|
| `page` | number | Không | Số trang | 1 |
| `limit` | number | Không | Số lượng mỗi trang | 10 |
| `search` | string | Không | Tìm kiếm theo tên bài viết | - |
| `category_slug` | string | Không | Lọc theo slug của danh mục | - |
| `tag_slug` | string | Không | Lọc theo slug của thẻ | - |
| `is_featured` | boolean | Không | Lọc bài viết nổi bật (true/false) | - |
| `is_pinned` | boolean | Không | Lọc bài viết được ghim (true/false) | - |
| `sort` | string | Không | Sắp xếp (format: `field:ORDER`) | `created_at:DESC` |

**Ví dụ:**
```bash
GET /public/posts?page=1&limit=10&is_featured=true&sort=view_count:DESC
```

#### 1.2. Lấy bài viết nổi bật
```
GET /public/posts/featured
```

**Query Parameters:**
| Tham số | Kiểu | Bắt buộc | Mô tả | Mặc định |
|---------|------|----------|-------|----------|
| `limit` | number | Không | Số lượng bài viết | 5 |

**Ví dụ:**
```bash
GET /public/posts/featured?limit=5
```

#### 1.3. Lấy chi tiết bài viết theo slug
```
GET /public/posts/:slug
```

**Path Parameters:**
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `slug` | string | Có | Slug của bài viết |

**Ví dụ:**
```bash
GET /public/posts/bai-viet-mau
```

---

### 2. Post Categories API

#### 2.1. Lấy danh sách danh mục
```
GET /public/post-categories
```

**Query Parameters:**
| Tham số | Kiểu | Bắt buộc | Mô tả | Mặc định |
|---------|------|----------|-------|----------|
| `page` | number | Không | Số trang | 1 |
| `limit` | number | Không | Số lượng mỗi trang | 10 |
| `search` | string | Không | Tìm kiếm theo tên danh mục | - |
| `parent_id` | number | Không | Lọc theo ID danh mục cha | - |
| `status` | string | Không | Lọc theo trạng thái (`active`, `inactive`) | `active` |
| `sort` | string | Không | Sắp xếp | `sort_order:ASC` |

**Ví dụ:**
```bash
GET /public/post-categories?page=1&limit=20&parent_id=null&status=active
```

#### 2.2. Lấy chi tiết danh mục theo slug
```
GET /public/post-categories/:slug
```

**Path Parameters:**
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `slug` | string | Có | Slug của danh mục |

**Ví dụ:**
```bash
GET /public/post-categories/technology
```

---

### 3. Post Tags API

#### 3.1. Lấy danh sách thẻ
```
GET /public/post-tags
```

**Query Parameters:**
| Tham số | Kiểu | Bắt buộc | Mô tả | Mặc định |
|---------|------|----------|-------|----------|
| `page` | number | Không | Số trang | 1 |
| `limit` | number | Không | Số lượng mỗi trang | 10 |
| `search` | string | Không | Tìm kiếm theo tên thẻ | - |
| `status` | string | Không | Lọc theo trạng thái (`active`, `inactive`) | `active` |
| `sort` | string | Không | Sắp xếp | `createdAt:DESC` |

**Ví dụ:**
```bash
GET /public/post-tags?page=1&limit=20&status=active&sort=name:ASC
```

#### 3.2. Lấy chi tiết thẻ theo slug
```
GET /public/post-tags/:slug
```

**Path Parameters:**
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `slug` | string | Có | Slug của thẻ |

**Ví dụ:**
```bash
GET /public/post-tags/javascript
```

---

## Chi tiết các Entity

### 1. Post (Bài viết)

#### Các trường trong Response

| Tên trường | Kiểu dữ liệu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|------------|--------------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ API tự sinh | ID của bài viết | **KHÔNG** gửi từ FE |
| `name` | string | ✅ | ❌ | Tên bài viết | Từ API |
| `slug` | string | ✅ | ✅ API tự sinh | URL-friendly identifier | Từ API, unique |
| `excerpt` | string \| null | ❌ | ❌ | Tóm tắt ngắn bài viết | Từ API, có thể null |
| `content` | string | ✅ | ❌ | Nội dung đầy đủ bài viết | Từ API (chỉ có trong detail) |
| `image` | string \| null | ❌ | ❌ | URL ảnh đại diện | Từ API, có thể null |
| `cover_image` | string \| null | ❌ | ❌ | URL ảnh bìa | Từ API, có thể null |
| `post_type` | enum | ✅ | ✅ API tự sinh | Loại bài viết (`text`, `video`, `image`, `audio`) | Từ API, mặc định `text` |
| `video_url` | string \| null | ❌ | ❌ | URL video | Từ API, có giá trị khi `post_type` = `video` |
| `audio_url` | string \| null | ❌ | ❌ | URL audio | Từ API, có giá trị khi `post_type` = `audio` |
| `published_at` | Date \| null | ❌ | ✅ API tự sinh | Thời gian xuất bản | Từ API, có thể null |
| `view_count` | number | ✅ | ✅ API tự sinh | Số lượt xem | Từ API, mặc định 0 |
| `createdAt` | Date | ✅ | ✅ API tự sinh | Thời gian tạo | Từ API |
| `updatedAt` | Date | ✅ | ✅ API tự sinh | Thời gian cập nhật | Từ API |
| `status` | enum | ✅ | ✅ API tự sinh | Trạng thái (`published`) | Từ API, chỉ trả về `published` |
| `is_featured` | boolean | ✅ | ❌ | Bài viết nổi bật | Từ API, mặc định false |
| `is_pinned` | boolean | ✅ | ❌ | Bài viết được ghim | Từ API, mặc định false |
| `primary_category` | object \| null | ❌ | ❌ | Danh mục chính | Từ API PostCategory |
| `categories` | array | ❌ | ❌ | Danh sách danh mục | Từ API PostCategory |
| `tags` | array | ❌ | ❌ | Danh sách thẻ | Từ API PostTag |

#### Các trường liên quan từ API khác

**`primary_category`** (object | null):
- Lấy từ API PostCategory
- Chỉ trả về khi status = `active`
- Các trường: `id`, `name`, `slug`, `description`

**`categories`** (array):
- Lấy từ API PostCategory (many-to-many)
- Chỉ trả về categories có status = `active`
- Mỗi item có: `id`, `name`, `slug`, `description`

**`tags`** (array):
- Lấy từ API PostTag (many-to-many)
- Chỉ trả về tags có status = `active`
- Mỗi item có: `id`, `name`, `slug`, `description`

#### Response Format - List Posts

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

#### Response Format - Detail Post

```json
{
  "success": true,
  "message": "Lấy thông tin bài viết thành công.",
  "data": {
    "id": 1,
    "name": "Bài viết mẫu",
    "slug": "bai-viet-mau",
    "excerpt": "Đây là excerpt của bài viết...",
    "content": "Nội dung đầy đủ của bài viết...",
    "image": "https://example.com/image.jpg",
    "cover_image": "https://example.com/cover.jpg",
    "post_type": "text",
    "video_url": null,
    "audio_url": null,
    "published_at": "2025-01-11T05:00:00.000Z",
    "view_count": 100,
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
    ]
  }
}
```

---

### 2. Post Category (Danh mục bài viết)

#### Các trường trong Response

| Tên trường | Kiểu dữ liệu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|------------|--------------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ API tự sinh | ID của danh mục | **KHÔNG** gửi từ FE |
| `name` | string | ✅ | ❌ | Tên danh mục | Từ API |
| `slug` | string | ✅ | ✅ API tự sinh | URL-friendly identifier | Từ API, unique |
| `description` | string \| null | ❌ | ❌ | Mô tả danh mục | Từ API, có thể null |
| `image` | string \| null | ❌ | ❌ | URL ảnh danh mục | Từ API, có thể null |
| `status` | enum | ✅ | ✅ API tự sinh | Trạng thái (`active`, `inactive`) | Từ API, mặc định `active` |
| `sort_order` | number | ✅ | ✅ API tự sinh | Thứ tự sắp xếp | Từ API, mặc định 0 |
| `parent_id` | number \| null | ❌ | ❌ | ID danh mục cha | Từ API, có thể null |
| `parent` | object \| null | ❌ | ❌ | Thông tin danh mục cha | Từ API (relation) |
| `children` | array | ❌ | ❌ | Danh sách danh mục con | Từ API (relation) |
| `createdAt` | Date | ✅ | ✅ API tự sinh | Thời gian tạo | Từ API |
| `updatedAt` | Date | ✅ | ✅ API tự sinh | Thời gian cập nhật | Từ API |

#### Các trường liên quan từ API khác

**`parent`** (object | null):
- Thông tin danh mục cha (nếu có)
- Chỉ có trong detail endpoint
- Các trường: `id`, `name`, `slug`

**`children`** (array):
- Danh sách danh mục con
- Chỉ có trong detail endpoint
- Mỗi item có: `id`, `name`, `slug`

#### Response Format - List Categories

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
      "createdAt": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Programming",
      "slug": "programming",
      "description": "Programming related posts",
      "image": "https://example.com/category-image-2.jpg",
      "status": "active",
      "sort_order": 2,
      "createdAt": "2025-01-11T05:00:00.000Z"
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

#### Response Format - Detail Category

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

---

### 3. Post Tag (Thẻ bài viết)

#### Các trường trong Response

| Tên trường | Kiểu dữ liệu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|------------|--------------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ API tự sinh | ID của thẻ | **KHÔNG** gửi từ FE |
| `name` | string | ✅ | ❌ | Tên thẻ | Từ API |
| `slug` | string | ✅ | ✅ API tự sinh | URL-friendly identifier | Từ API, unique |
| `description` | string \| null | ❌ | ❌ | Mô tả thẻ | Từ API, có thể null |
| `status` | enum | ✅ | ✅ API tự sinh | Trạng thái (`active`, `inactive`) | Từ API, mặc định `active` |
| `createdAt` | Date | ✅ | ✅ API tự sinh | Thời gian tạo | Từ API |
| `updatedAt` | Date | ✅ | ✅ API tự sinh | Thời gian cập nhật | Từ API |

#### Response Format - List Tags

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
      "createdAt": "2025-01-11T05:00:00.000Z",
      "updatedAt": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "name": "TypeScript",
      "slug": "typescript",
      "description": "TypeScript programming language",
      "status": "active",
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

#### Response Format - Detail Tag

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
    "createdAt": "2025-01-11T05:00:00.000Z",
    "updatedAt": "2025-01-11T05:00:00.000Z"
  }
}
```

---

## Lấy dữ liệu từ API khác

### 1. Enum API - Lấy danh sách giá trị enum

#### Lấy tất cả enums
```bash
GET /api/enums
```

**Sử dụng:** Lấy tất cả enum values để populate dropdowns, select boxes

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
      "id": "published",
      "value": "published",
      "name": "Đã xuất bản",
      "label": "Đã xuất bản"
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
    }
  ]
}
```

#### Lấy enum theo tên
```bash
GET /api/enums/post_type
GET /api/enums/post_status
```

**Ví dụ sử dụng:**
```javascript
// Lấy danh sách loại bài viết
const fetchPostTypes = async () => {
  const response = await fetch('/api/enums/post_type');
  const data = await response.json();
  return data; // Array of post types
};

// Lấy danh sách trạng thái bài viết
const fetchPostStatuses = async () => {
  const response = await fetch('/api/enums/post_status');
  const data = await response.json();
  return data; // Array of post statuses
};
```

### 2. Post Categories API - Lấy danh sách danh mục

```bash
GET /api/public/post-categories?page=1&limit=20&status=active
```

**Sử dụng cho:**
- Hiển thị menu danh mục
- Filter bài viết theo danh mục
- Breadcrumb navigation

**Response fields:**
- `id`: ID danh mục (dùng cho `primary_postcategory_id`, `category_ids`)
- `name`: Tên danh mục
- `slug`: Slug danh mục (dùng cho filter `category_slug`)

### 3. Post Tags API - Lấy danh sách thẻ

```bash
GET /api/public/post-tags?page=1&limit=20&status=active
```

**Sử dụng cho:**
- Hiển thị tag cloud
- Filter bài viết theo thẻ
- Chọn tags khi tạo/cập nhật bài viết

**Response fields:**
- `id`: ID thẻ (dùng cho `tag_ids`)
- `name`: Tên thẻ
- `slug`: Slug thẻ (dùng cho filter `tag_slug`)

### 4. File Upload API - Upload media files

```bash
POST /api/upload/file
Content-Type: multipart/form-data
```

**Sử dụng cho:**
- Upload video → `video_url`
- Upload audio → `audio_url`
- Upload image → `image`, `cover_image`

**Response:**
```json
{
  "url": "https://your-domain.com/uploads/1234567890-abc123.mp4",
  "filename": "1234567890-abc123.mp4",
  "size": 10485760,
  "mimetype": "video/mp4"
}
```

**Ví dụ sử dụng:**
```javascript
// Upload video file
const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/file', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.url; // Use as video_url
};
```

---

## Hướng dẫn tích hợp cho trang Home

### 1. Lấy dữ liệu cho trang Home

#### Bước 1: Lấy danh sách danh mục (Menu/Navigation)
```javascript
// GET /public/post-categories?page=1&limit=20&status=active&sort=sort_order:ASC
// Lấy danh sách danh mục để hiển thị menu
```

**Sử dụng:**
- Hiển thị menu danh mục ở header/footer
- Lọc bài viết theo danh mục
- Breadcrumb navigation

#### Bước 2: Lấy bài viết nổi bật (Featured Posts)
```javascript
// GET /public/posts/featured?limit=5
// Lấy 5 bài viết nổi bật để hiển thị ở phần hero/banner
```

**Sử dụng:**
- Hiển thị slider/carousel bài viết nổi bật
- Hero section trên trang home

#### Bước 3: Lấy danh sách bài viết mới nhất
```javascript
// GET /public/posts?page=1&limit=10&sort=created_at:DESC
// Lấy 10 bài viết mới nhất
```

**Sử dụng:**
- Hiển thị danh sách bài viết mới nhất
- Pagination cho danh sách bài viết

#### Bước 4: Lấy danh sách thẻ phổ biến (Popular Tags)
```javascript
// GET /public/post-tags?page=1&limit=10&status=active&sort=createdAt:DESC
// Lấy danh sách thẻ để hiển thị tag cloud
```

**Sử dụng:**
- Hiển thị tag cloud ở sidebar
- Filter bài viết theo thẻ

### 2. Flow tích hợp đề xuất

```javascript
// Ví dụ với React/Next.js

// 1. Fetch categories cho menu
const fetchCategories = async () => {
  const response = await fetch('/api/public/post-categories?page=1&limit=20&status=active&sort=sort_order:ASC');
  const data = await response.json();
  return data.data; // Array of categories
};

// 2. Fetch featured posts
const fetchFeaturedPosts = async () => {
  const response = await fetch('/api/public/posts/featured?limit=5');
  const data = await response.json();
  return data.data; // Array of featured posts
};

// 3. Fetch latest posts
const fetchLatestPosts = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/public/posts?page=${page}&limit=${limit}&sort=created_at:DESC`);
  const data = await response.json();
  return {
    posts: data.data,
    meta: data.meta // Pagination info
  };
};

// 4. Fetch popular tags
const fetchPopularTags = async () => {
  const response = await fetch('/api/public/post-tags?page=1&limit=10&status=active&sort=createdAt:DESC');
  const data = await response.json();
  return data.data; // Array of tags
};
```

### 3. Lọc bài viết theo danh mục/thẻ

```javascript
// Lọc bài viết theo danh mục
const fetchPostsByCategory = async (categorySlug, page = 1, limit = 10) => {
  const response = await fetch(`/api/public/posts?category_slug=${categorySlug}&page=${page}&limit=${limit}`);
  const data = await response.json();
  return {
    posts: data.data,
    meta: data.meta
  };
};

// Lọc bài viết theo thẻ
const fetchPostsByTag = async (tagSlug, page = 1, limit = 10) => {
  const response = await fetch(`/api/public/posts?tag_slug=${tagSlug}&page=${page}&limit=${limit}`);
  const data = await response.json();
  return {
    posts: data.data,
    meta: data.meta
  };
};
```

### 4. Lấy chi tiết bài viết

```javascript
// Lấy chi tiết bài viết theo slug
const fetchPostDetail = async (slug) => {
  const response = await fetch(`/api/public/posts/${slug}`);
  const data = await response.json();
  return data.data; // Post object với đầy đủ thông tin
};
```

---

## Ví dụ Request/Response

### Ví dụ 1: Lấy danh sách bài viết nổi bật

**Request:**
```bash
GET /api/public/posts/featured?limit=5
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy bài viết nổi bật thành công.",
  "data": [
    {
      "id": 1,
      "name": "Bài viết nổi bật 1",
      "slug": "bai-viet-noi-bat-1",
      "excerpt": "Đây là excerpt của bài viết nổi bật...",
      "image": "https://example.com/image1.jpg",
      "cover_image": "https://example.com/cover1.jpg",
      "published_at": "2025-01-11T05:00:00.000Z",
      "view_count": 500,
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
    "itemCount": 5,
    "itemsPerPage": 5,
    "totalItems": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Ví dụ 2: Lấy danh sách danh mục

**Request:**
```bash
GET /api/public/post-categories?page=1&limit=20&status=active&sort=sort_order:ASC
```

**Response:**
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
      "createdAt": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemCount": 20,
    "itemsPerPage": 20,
    "totalItems": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Ví dụ 3: Lấy bài viết theo danh mục

**Request:**
```bash
GET /api/public/posts?category_slug=technology&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách bài viết thành công.",
  "data": [
    {
      "id": 1,
      "name": "Bài viết về Technology",
      "slug": "bai-viet-ve-technology",
      "excerpt": "Đây là excerpt...",
      "image": "https://example.com/image.jpg",
      "cover_image": "https://example.com/cover.jpg",
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

## Lưu ý quan trọng

### 1. Trường tự động sinh (KHÔNG gửi từ FE)
- `id`: Tự động tăng
- `slug`: Tự động sinh từ `name`
- `createdAt`, `updatedAt`: Tự động ghi nhận thời gian
- `view_count`: Tự động tăng khi xem bài viết
- `status`: Tự động set (chỉ trả về `published` cho posts, `active` cho categories/tags)

### 2. Trường bắt buộc khi tạo mới (Admin API - không áp dụng cho Public API)
- **Post**: `name`, `content`
- **Post Category**: `name`
- **Post Tag**: `name`

### 3. Trường có thể null
- `excerpt`, `image`, `cover_image`, `description`: Có thể null
- `video_url`, `audio_url`: Có thể null (chỉ có giá trị khi `post_type` tương ứng)
- `parent_id`, `parent`: Có thể null (danh mục gốc không có parent)

### 4. Filtering & Sorting
- Public API chỉ trả về dữ liệu có status phù hợp:
  - Posts: chỉ `published`
  - Categories: chỉ `active` (nếu không chỉ định)
  - Tags: chỉ `active` (nếu không chỉ định)

### 5. Relations
- `primary_category`, `categories`, `tags` trong Post: Tự động load từ API, không cần gọi riêng
- `parent`, `children` trong Category: Chỉ có trong detail endpoint

### 6. Pagination
- Tất cả list endpoints đều hỗ trợ pagination
- Response có `meta` object chứa thông tin pagination
- Sử dụng `hasNextPage`, `hasPreviousPage` để điều hướng

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "data": null
}
```

### Status Codes
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found (không tìm thấy resource)
- `500` - Internal Server Error

### Ví dụ Error Response
```json
{
  "success": false,
  "message": "Không tìm thấy bài viết.",
  "data": null
}
```

---

## Checklist tích hợp

- [ ] Setup base URL và headers
- [ ] Implement fetch categories cho menu
- [ ] Implement fetch featured posts cho hero section
- [ ] Implement fetch latest posts với pagination
- [ ] Implement fetch popular tags cho sidebar
- [ ] Implement filter posts by category
- [ ] Implement filter posts by tag
- [ ] Implement post detail page
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Implement pagination UI
- [ ] Test với dữ liệu thực tế

---

## Liên hệ hỗ trợ

Nếu có thắc mắc hoặc cần hỗ trợ trong quá trình tích hợp, vui lòng liên hệ Backend Team.

**Tài liệu liên quan:**
- [Public Posts API](./public/post.md)
- [Public Post Categories API](./public/post-category.md)
- [Public Post Tags API](./public/post-tag.md)
- [Enum API](../../../shared/enums/README.md) - Lấy danh sách enum values
- [File Upload API](../../file-upload.md) - Upload video/audio/image files
- [Post Video Support Guide](./post-video-support.md) - Hướng dẫn chi tiết về hỗ trợ video, audio, image

