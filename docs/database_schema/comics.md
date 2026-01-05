# Database Schema - Hệ Thống Truyện Tranh (Comics/Manga)

Tài liệu mô tả các bảng chính của mô-đun truyện tranh. Mỗi bảng liệt kê mục đích, các cột, kiểu dữ liệu và ghi chú quan trọng.

---

## 1. `comics`

**Mục đích**: Thông tin truyện tranh (comic/manga)

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
slug                    VARCHAR(255) NOT NULL UNIQUE
title                   VARCHAR(255) NOT NULL
description             TEXT NULL
cover_image             VARCHAR(500) NULL
author                  VARCHAR(255) NULL
status                  ENUM('draft', 'published', 'completed', 'hidden') DEFAULT 'draft'
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

### Indexes

```sql
INDEX idx_slug (slug)
INDEX idx_status (status)
INDEX idx_author (author)
INDEX idx_created_at (created_at)
INDEX idx_created_user_id (created_user_id)
INDEX idx_updated_user_id (updated_user_id)
INDEX idx_deleted_at (deleted_at)
```

### Relations

- one-to-one → comic_stats
- one-to-many → chapters
- one-to-many → comic_reviews
- one-to-many → comments
- one-to-many → comic_follows
- one-to-many → reading_histories
- one-to-many → comic_views
- many-to-many → comic_categories (via comic_category)

### Foreign Keys

- created_user_id → users(id) ON DELETE SET NULL
- updated_user_id → users(id) ON DELETE SET NULL

### Ghi chú

- `slug`: URL-friendly identifier, unique, dùng cho SEO
- `status`: 
  - `draft`: Bản nháp, chưa publish
  - `published`: Đã publish, đang cập nhật
  - `completed`: Hoàn thành
  - `hidden`: Ẩn khỏi public (có thể xem qua link trực tiếp)
- `cover_image`: URL/path đến ảnh bìa
- Soft delete: Có `deleted_at` để có thể khôi phục sau

---

## 2. `comic_stats`

**Mục đích**: Thống kê truyện (tách riêng để tránh lock table `comics` khi cập nhật view/follow count)

### Columns

```sql
comic_id                BIGINT UNSIGNED NOT NULL PRIMARY KEY
view_count              BIGINT UNSIGNED DEFAULT 0
follow_count            BIGINT UNSIGNED DEFAULT 0
rating_count            BIGINT UNSIGNED DEFAULT 0
rating_sum              BIGINT UNSIGNED DEFAULT 0
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### Indexes

```sql
INDEX idx_view_count (view_count)
INDEX idx_follow_count (follow_count)
INDEX idx_updated_at (updated_at)
```

### Relations

- many-to-one → comics

### Foreign Keys

- comic_id → comics(id) ON DELETE CASCADE

### Ghi chú

- **Không update trực tiếp vào `comics`** → tránh lock table khi có nhiều view/follow đồng thời
- `rating_sum`: Tổng điểm rating (1-5), dùng để tính average = rating_sum / rating_count
- Cập nhật async qua queue/job từ `comic_views`, `comic_follows`, `comic_reviews`
- Không có `created_user_id`, `updated_user_id`, `created_at`, `deleted_at` vì đây là bảng thống kê tự động

---

## 3. `comic_categories`

**Mục đích**: Thể loại truyện (Category/Genre)

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name                    VARCHAR(255) NOT NULL
slug                    VARCHAR(255) NOT NULL UNIQUE
description             TEXT NULL
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

### Indexes

```sql
INDEX idx_slug (slug)
INDEX idx_name (name)
INDEX idx_created_at (created_at)
INDEX idx_created_user_id (created_user_id)
INDEX idx_updated_user_id (updated_user_id)
INDEX idx_deleted_at (deleted_at)
```

### Relations

- many-to-many → comics (via comic_category)

### Foreign Keys

- created_user_id → users(id) ON DELETE SET NULL
- updated_user_id → users(id) ON DELETE SET NULL

### Ghi chú

- `slug`: URL-friendly identifier
- Soft delete: Có `deleted_at`

---

## 4. `comic_category`

**Mục đích**: Junction table - Quan hệ many-to-many giữa comics và comic_categories

### Columns

```sql
comic_id                BIGINT UNSIGNED NOT NULL
comic_category_id       BIGINT UNSIGNED NOT NULL
PRIMARY KEY (comic_id, comic_category_id)
```

### Indexes

```sql
INDEX idx_comic_category_id (comic_category_id)
```

### Relations

- many-to-one → comics
- many-to-one → comic_categories

### Foreign Keys

- comic_id → comics(id) ON DELETE CASCADE
- comic_category_id → comic_categories(id) ON DELETE CASCADE

### Ghi chú

- Junction table: **KHÔNG có** audit fields (created_user_id, updated_user_id, created_at, updated_at, deleted_at)
- Composite primary key: (comic_id, comic_category_id)

---

## 5. `chapters`

**Mục đích**: Chương truyện

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
comic_id                BIGINT UNSIGNED NOT NULL
team_id                 BIGINT UNSIGNED NULL
title                   VARCHAR(255) NOT NULL
chapter_index           INT NOT NULL
chapter_label           VARCHAR(50) NULL
status                  ENUM('draft', 'published') DEFAULT 'draft'
view_count              BIGINT UNSIGNED DEFAULT 0
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

### Indexes

```sql
INDEX idx_comic_id (comic_id)
INDEX idx_comic_chapter_index (comic_id, chapter_index)
UNIQUE INDEX idx_comic_chapter_unique (comic_id, chapter_index)
INDEX idx_team_id (team_id)
INDEX idx_status (status)
INDEX idx_view_count (view_count)
INDEX idx_created_at (created_at)
INDEX idx_created_user_id (created_user_id)
INDEX idx_updated_user_id (updated_user_id)
INDEX idx_deleted_at (deleted_at)
```

### Relations

- many-to-one → comics
- many-to-one → groups (team_id) - team dịch/upload
- one-to-many → chapter_pages
- one-to-many → reading_histories
- one-to-many → comments
- one-to-many → bookmarks
- one-to-many → comic_views

### Foreign Keys

- comic_id → comics(id) ON DELETE CASCADE
- team_id → groups(id) ON DELETE SET NULL
- created_user_id → users(id) ON DELETE SET NULL
- updated_user_id → users(id) ON DELETE SET NULL

### Ghi chú

- `chapter_index`: Số thứ tự để sort (1, 2, 3, 4...)
- `chapter_label`: Hiển thị cho user (có thể là "1", "1.5", "Extra", "Prologue", ...)
- Unique constraint: (comic_id, chapter_index) - không cho phép trùng chapter_index trong cùng 1 comic
- `team_id`: Nhóm dịch/upload chapter (nullable)
- Soft delete: Có `deleted_at`

---

## 6. `chapter_pages`

**Mục đích**: Trang ảnh của chương

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
chapter_id              BIGINT UNSIGNED NOT NULL
page_number             INT NOT NULL
image_url               VARCHAR(500) NOT NULL
width                   INT NULL
height                  INT NULL
file_size               BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
```

### Indexes

```sql
INDEX idx_chapter_id (chapter_id)
INDEX idx_chapter_page (chapter_id, page_number)
UNIQUE INDEX idx_chapter_page_unique (chapter_id, page_number)
```

### Relations

- many-to-one → chapters

### Foreign Keys

- chapter_id → chapters(id) ON DELETE CASCADE

### Ghi chú

- `page_number`: Thứ tự trang (1, 2, 3...)
- Unique constraint: (chapter_id, page_number) - không cho phép trùng page_number trong cùng 1 chapter
- Load ảnh theo `page_number` để hiển thị
- `file_size`: Kích thước file (bytes), nullable
- `width`, `height`: Kích thước ảnh (pixels), nullable
- Không có `created_user_id`, `updated_user_id`, `updated_at`, `deleted_at` vì đây là data upload tự động

---

## 7. `reading_histories`

**Mục đích**: Lịch sử đọc của user

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
user_id                 BIGINT UNSIGNED NOT NULL
comic_id                BIGINT UNSIGNED NOT NULL
chapter_id              BIGINT UNSIGNED NOT NULL
last_page               INT NULL
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### Indexes

```sql
INDEX idx_user_id (user_id)
INDEX idx_comic_id (comic_id)
UNIQUE INDEX idx_user_comic (user_id, comic_id)
INDEX idx_chapter_id (chapter_id)
INDEX idx_updated_at (updated_at)
```

### Relations

- many-to-one → users
- many-to-one → comics
- many-to-one → chapters

### Foreign Keys

- user_id → users(id) ON DELETE CASCADE
- comic_id → comics(id) ON DELETE CASCADE
- chapter_id → chapters(id) ON DELETE CASCADE

### Ghi chú

- Unique constraint: (user_id, comic_id) - mỗi user chỉ có 1 reading history cho 1 comic
- `last_page`: Trang cuối cùng đã đọc (nullable nếu chưa đọc)
- Tự động cập nhật `updated_at` khi user đọc tiếp
- Không có `created_user_id`, `updated_user_id`, `created_at`, `deleted_at`

---

## 8. `bookmarks`

**Mục đích**: Đánh dấu trang (bookmark) của user

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
user_id                 BIGINT UNSIGNED NOT NULL
chapter_id              BIGINT UNSIGNED NOT NULL
page_number             INT NOT NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
```

### Indexes

```sql
INDEX idx_user_id (user_id)
INDEX idx_chapter_id (chapter_id)
INDEX idx_user_chapter (user_id, chapter_id)
INDEX idx_created_at (created_at)
```

### Relations

- many-to-one → users
- many-to-one → chapters

### Foreign Keys

- user_id → users(id) ON DELETE CASCADE
- chapter_id → chapters(id) ON DELETE CASCADE

### Ghi chú

- User có thể bookmark nhiều trang trong nhiều chapter khác nhau
- Không unique constraint - cho phép nhiều bookmark
- Không có `created_user_id`, `updated_user_id`, `updated_at`, `deleted_at`

---

## 9. `comic_follows`

**Mục đích**: User follow/unfollow truyện

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
user_id                 BIGINT UNSIGNED NOT NULL
comic_id                BIGINT UNSIGNED NOT NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
```

### Indexes

```sql
INDEX idx_user_id (user_id)
INDEX idx_comic_id (comic_id)
UNIQUE INDEX idx_user_comic (user_id, comic_id)
INDEX idx_created_at (created_at)
```

### Relations

- many-to-one → users
- many-to-one → comics

### Foreign Keys

- user_id → users(id) ON DELETE CASCADE
- comic_id → comics(id) ON DELETE CASCADE

### Ghi chú

- Unique constraint: (user_id, comic_id) - mỗi user chỉ follow 1 comic 1 lần
- Khi unfollow → xóa record (hard delete)
- Không có `created_user_id`, `updated_user_id`, `updated_at`, `deleted_at`

---

## 10. `comic_reviews`

**Mục đích**: Đánh giá (review/rating) của user cho truyện

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
user_id                 BIGINT UNSIGNED NOT NULL
comic_id                BIGINT UNSIGNED NOT NULL
rating                  TINYINT UNSIGNED NOT NULL
content                 TEXT NULL
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

### Indexes

```sql
INDEX idx_user_id (user_id)
INDEX idx_comic_id (comic_id)
UNIQUE INDEX idx_user_comic (user_id, comic_id)
INDEX idx_rating (rating)
INDEX idx_created_at (created_at)
INDEX idx_created_user_id (created_user_id)
INDEX idx_updated_user_id (updated_user_id)
INDEX idx_deleted_at (deleted_at)
```

### Relations

- many-to-one → users
- many-to-one → comics

### Foreign Keys

- user_id → users(id) ON DELETE CASCADE
- comic_id → comics(id) ON DELETE CASCADE
- created_user_id → users(id) ON DELETE SET NULL
- updated_user_id → users(id) ON DELETE SET NULL

### Ghi chú

- `rating`: 1-5 (TINYINT UNSIGNED)
- Unique constraint: (user_id, comic_id) - mỗi user chỉ review 1 comic 1 lần
- `content`: Nội dung review (nullable, có thể chỉ rating không comment)
- Soft delete: Có `deleted_at`
- Cần sync với `comic_stats.rating_count` và `comic_stats.rating_sum`

---

## 11. `comments`

**Mục đích**: Bình luận (có thể comment trên comic hoặc chapter, hỗ trợ reply/reply của reply)

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
user_id                 BIGINT UNSIGNED NOT NULL
comic_id                BIGINT UNSIGNED NOT NULL
chapter_id              BIGINT UNSIGNED NULL
parent_id               BIGINT UNSIGNED NULL
content                 TEXT NOT NULL
status                  ENUM('visible', 'hidden') DEFAULT 'visible'
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

### Indexes

```sql
INDEX idx_user_id (user_id)
INDEX idx_comic_id (comic_id)
INDEX idx_chapter_id (chapter_id)
INDEX idx_parent_id (parent_id)
INDEX idx_status (status)
INDEX idx_created_at (created_at)
INDEX idx_comic_created (comic_id, created_at)
INDEX idx_chapter_created (chapter_id, created_at)
INDEX idx_created_user_id (created_user_id)
INDEX idx_updated_user_id (updated_user_id)
INDEX idx_deleted_at (deleted_at)
```

### Relations

- many-to-one → users
- many-to-one → comics
- many-to-one → chapters (nullable)
- many-to-one → comments (self-reference, parent_id)
- one-to-many → comments (replies)

### Foreign Keys

- user_id → users(id) ON DELETE CASCADE
- comic_id → comics(id) ON DELETE CASCADE
- chapter_id → chapters(id) ON DELETE SET NULL
- parent_id → comments(id) ON DELETE CASCADE
- created_user_id → users(id) ON DELETE SET NULL
- updated_user_id → users(id) ON DELETE SET NULL

### Ghi chú

- `chapter_id`: Nullable - nếu null thì comment trên comic, nếu có thì comment trên chapter
- `parent_id`: Nullable - nếu null thì là top-level comment, nếu có thì là reply
- Cấu trúc dạng cây (tree) - hỗ trợ nested comments
- `status`: `visible` (hiển thị) hoặc `hidden` (ẩn bởi admin/mod)
- Soft delete: Có `deleted_at`

---

## 12. `notifications`

**Mục đích**: Thông báo cho user

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
user_id                 BIGINT UNSIGNED NOT NULL
type                    VARCHAR(50) NOT NULL
reference_id            BIGINT UNSIGNED NULL
title                   VARCHAR(255) NULL
content                 TEXT NULL
is_read                 BOOLEAN DEFAULT FALSE
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
```

### Indexes

```sql
INDEX idx_user_id (user_id)
INDEX idx_user_read (user_id, is_read)
INDEX idx_type (type)
INDEX idx_reference_id (reference_id)
INDEX idx_created_at (created_at)
INDEX idx_user_created (user_id, created_at)
```

### Relations

- many-to-one → users

### Foreign Keys

- user_id → users(id) ON DELETE CASCADE

### Ghi chú

- `type`: Loại thông báo (ví dụ: 'new_chapter', 'new_comment', 'system', 'review_reply', ...)
- `reference_id`: ID của entity liên quan (comic_id, chapter_id, comment_id, ...)
- `is_read`: Đã đọc chưa
- Không có `created_user_id`, `updated_user_id`, `updated_at`, `deleted_at` - thông báo tự động generate
- Có thể clean up old notifications sau 90 ngày

---

## 13. `comic_views`

**Mục đích**: Log view của comic/chapter (dùng để aggregate vào `comic_stats`)

### Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
comic_id                BIGINT UNSIGNED NOT NULL
chapter_id              BIGINT UNSIGNED NULL
user_id                 BIGINT UNSIGNED NULL
ip                      VARCHAR(45) NULL
user_agent              VARCHAR(500) NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
```

### Indexes

```sql
INDEX idx_comic_id (comic_id)
INDEX idx_chapter_id (chapter_id)
INDEX idx_user_id (user_id)
INDEX idx_created_at (created_at)
INDEX idx_comic_created (comic_id, created_at)
INDEX idx_chapter_created (chapter_id, created_at)
```

### Relations

- many-to-one → comics
- many-to-one → chapters (nullable)
- many-to-one → users (nullable)

### Foreign Keys

- comic_id → comics(id) ON DELETE CASCADE
- chapter_id → chapters(id) ON DELETE SET NULL
- user_id → users(id) ON DELETE SET NULL

### Ghi chú

- **Dùng để aggregate view** → `comic_stats.view_count`
- `user_id`: Nullable - có thể view không cần login
- `chapter_id`: Nullable - nếu null thì view comic, nếu có thì view chapter
- `ip`: IPv4 hoặc IPv6 (max 45 chars)
- Có thể clean up old logs sau 1-3 tháng (giữ lại để analytics)
- Không có `created_user_id`, `updated_user_id`, `updated_at`, `deleted_at`

---

## Tổng Kết Indexes Chiến Lược

### Indexes cho Performance

1. **Search/Filter**:
   - `comics`: slug, status, author, created_at
   - `comic_categories`: slug, name
   - `chapters`: comic_id + chapter_index (composite)

2. **Relations**:
   - Tất cả foreign keys đều có index
   - Junction tables: index cho cả 2 FK

3. **Sorting**:
   - `created_at`, `updated_at` cho các bảng chính
   - `chapter_index` cho chapters
   - `page_number` cho chapter_pages

4. **Unique Constraints**:
   - `comics.slug`
   - `comic_categories.slug`
   - `(comic_id, chapter_index)` trong chapters
   - `(chapter_id, page_number)` trong chapter_pages
   - `(user_id, comic_id)` trong reading_histories, comic_follows, comic_reviews

---

## Foreign Key Constraints

### Cascade Rules

- **CASCADE**: 
  - Xóa comic → xóa chapters, comic_stats, comic_reviews, comments, comic_follows, reading_histories, comic_views
  - Xóa chapter → xóa chapter_pages, comments, reading_histories, bookmarks, comic_views
  - Xóa record từ comic_categories → xóa entries trong comic_category (junction table)
  - Xóa comment → xóa replies (parent_id CASCADE)
  - Xóa user → xóa reviews, comments, follows, bookmarks, reading_histories, notifications, comic_views

- **SET NULL**: 
  - Xóa user → set null cho created_user_id, updated_user_id
  - Xóa team/group → set null cho chapters.team_id
  - Xóa chapter → set null cho comments.chapter_id, comic_views.chapter_id

---

## Soft Delete Rules

- **Có `deleted_at`**: 
  - `comics`, `comic_categories`, `chapters`, `comic_reviews`, `comments`
  - Cho phép restore sau khi xóa

- **Không có `deleted_at`**: 
  - Junction tables (comic_category)
  - Stats tables (comic_stats)
  - Log/History tables (comic_views, reading_histories, notifications)
  - User actions (comic_follows, bookmarks)

---

## Ghi Chú Quan Trọng

1. **Performance**:
   - `comic_stats` tách riêng để tránh lock `comics` table
   - Aggregate views async qua queue/job từ `comic_views`
   - Index đầy đủ cho các query thường dùng

2. **Data Integrity**:
   - Unique constraints để tránh duplicate
   - Foreign keys với CASCADE/SET NULL phù hợp
   - Soft delete cho content chính

3. **Scalability**:
   - `comic_views` có thể partition theo tháng/năm
   - Có thể archive old data sang data warehouse
   - Cân nhắc caching cho hot comics/chapters

4. **Missing Tables** (có thể bổ sung sau):
   - `teams` hoặc dùng `groups` table có sẵn (team_id → groups.id)
   - `tags` (tách riêng với comic_categories)
   - `comment_likes` (like/unlike comments)
   - `reports` (báo cáo spam/inappropriate content)

