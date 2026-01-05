# Comics API Documentation

Tài liệu API đầy đủ cho module Truyện Tranh (Comics).

## 📂 Cấu trúc tài liệu

```
docs/api/comics/
├── admin/                    # Admin APIs
│   ├── comics.md            # Quản lý truyện tranh
│   ├── chapters.md          # Quản lý chương truyện
│   └── comic-categories.md  # Quản lý danh mục truyện
├── public/                   # Public APIs
│   ├── comics.md            # Xem danh sách truyện
│   └── chapters.md          # Đọc truyện
└── user/                    # User APIs
    ├── reviews.md           # Đánh giá truyện
    ├── comments.md          # Bình luận
    ├── follows.md           # Theo dõi truyện
    ├── bookmarks.md         # Đánh dấu trang
    └── reading-history.md   # Lịch sử đọc
```

---

## 🚀 Quick Start

### Base URLs

```
Admin APIs:    http://localhost:3000/api/admin/comics
Public APIs:   http://localhost:3000/api/public/comics
User APIs:     http://localhost:3000/api/user/comics
```

### Authentication

- **Admin APIs:** Yêu cầu Bearer Token và permission `comic.manage`
- **User APIs:** Yêu cầu Bearer Token và permission `comic.read`
- **Public APIs:** Không yêu cầu authentication

```bash
curl -X GET http://localhost:3000/api/admin/comics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Modules

### 🔐 Admin APIs

APIs dành cho quản trị viên - yêu cầu authentication và permissions.

#### Comics (Truyện tranh)
- **GET** `/admin/comics` - Danh sách truyện
- **GET** `/admin/comics/:id` - Chi tiết truyện
- **POST** `/admin/comics` - Tạo truyện mới
- **PUT** `/admin/comics/:id` - Cập nhật truyện
- **DELETE** `/admin/comics/:id` - Xóa truyện (soft delete)
- **POST** `/admin/comics/:id/restore` - Khôi phục truyện
- **POST** `/admin/comics/:id/cover` - Upload ảnh bìa
- **POST** `/admin/comics/:id/comic-categories` - Gán danh mục

📖 [Chi tiết Admin Comics API](./admin/comics.md)

#### Chapters (Chương truyện)
- **GET** `/admin/chapters` - Danh sách chương
- **GET** `/admin/chapters/:id` - Chi tiết chương
- **POST** `/admin/chapters` - Tạo chương mới
- **PUT** `/admin/chapters/:id` - Cập nhật chương
- **DELETE** `/admin/chapters/:id` - Xóa chương (soft delete)
- **POST** `/admin/chapters/:id/restore` - Khôi phục chương
- **PUT** `/admin/chapters/:id/reorder` - Sắp xếp lại thứ tự
- **GET** `/admin/chapters/:id/pages` - Lấy danh sách trang
- **POST** `/admin/chapters/:id/pages` - Upload nhiều trang
- **PUT** `/admin/chapters/:id/pages` - Cập nhật danh sách trang

📖 [Chi tiết Admin Chapters API](./admin/chapters.md)

#### Comic Categories (Danh mục truyện)
- **GET** `/admin/comic-categories` - Danh sách danh mục
- **GET** `/admin/comic-categories/:id` - Chi tiết danh mục
- **POST** `/admin/comic-categories` - Tạo danh mục mới
- **PUT** `/admin/comic-categories/:id` - Cập nhật danh mục
- **DELETE** `/admin/comic-categories/:id` - Xóa danh mục (soft delete)

📖 [Chi tiết Admin Comic Categories API](./admin/comic-categories.md)

---

### 🌐 Public APIs

APIs công khai - không yêu cầu authentication.

#### Comics (Xem danh sách truyện)
- **GET** `/public/comics` - Danh sách truyện
- **GET** `/public/comics/trending` - Truyện đang hot
- **GET** `/public/comics/popular` - Truyện phổ biến
- **GET** `/public/comics/newest` - Truyện mới nhất
- **GET** `/public/comics/:slug` - Chi tiết truyện
- **GET** `/public/comics/:slug/chapters` - Danh sách chương

📖 [Chi tiết Public Comics API](./public/comics.md)

#### Chapters (Đọc truyện)
- **GET** `/public/chapters` - Danh sách chương
- **GET** `/public/chapters/:id` - Chi tiết chương
- **GET** `/public/chapters/:id/pages` - Danh sách trang
- **GET** `/public/chapters/:id/next` - Chương tiếp theo
- **GET** `/public/chapters/:id/prev` - Chương trước đó
- **POST** `/public/chapters/:id/view` - Đếm lượt xem

📖 [Chi tiết Public Chapters API](./public/chapters.md)

---

### 👤 User APIs

APIs dành cho user - yêu cầu authentication và permission `comic.read`.

#### Reviews (Đánh giá)
- **GET** `/user/reviews` - Đánh giá của tôi
- **POST** `/user/reviews/comics/:comicId` - Tạo/cập nhật đánh giá
- **DELETE** `/user/reviews/comics/:comicId` - Xóa đánh giá
- **GET** `/public/reviews/comics/:comicId` - Xem đánh giá của truyện (public)

📖 [Chi tiết User Reviews API](./user/reviews.md)

#### Comments (Bình luận)
- **GET** `/user/comments` - Bình luận của tôi
- **POST** `/user/comments` - Tạo bình luận
- **PUT** `/user/comments/:id` - Cập nhật bình luận
- **DELETE** `/user/comments/:id` - Xóa bình luận
- **GET** `/public/comments/comics/:comicId` - Xem bình luận của truyện (public)
- **GET** `/public/comments/chapters/:chapterId` - Xem bình luận của chương (public)

📖 [Chi tiết User Comments API](./user/comments.md)

#### Follows (Theo dõi)
- **GET** `/user/follows` - Danh sách truyện đang theo dõi
- **POST** `/user/follows/comics/:comicId` - Theo dõi truyện
- **DELETE** `/user/follows/comics/:comicId` - Bỏ theo dõi truyện
- **GET** `/user/follows/comics/:comicId/is-following` - Kiểm tra đang theo dõi

📖 [Chi tiết User Follows API](./user/follows.md)

#### Bookmarks (Đánh dấu trang)
- **GET** `/user/bookmarks` - Danh sách bookmark
- **POST** `/user/bookmarks` - Tạo bookmark
- **DELETE** `/user/bookmarks/:id` - Xóa bookmark

📖 [Chi tiết User Bookmarks API](./user/bookmarks.md)

#### Reading History (Lịch sử đọc)
- **GET** `/user/reading-history` - Lịch sử đọc của tôi
- **POST** `/user/reading-history` - Cập nhật/tạo lịch sử đọc
- **DELETE** `/user/reading-history/:comicId` - Xóa lịch sử đọc

📖 [Chi tiết User Reading History API](./user/reading-history.md)

---

## 📋 Trường API tự sinh (không cần gửi từ FE)

### BaseEntity fields (tất cả entities)
- `id`: ID tự động tăng
- `created_at`: Thời gian tạo (tự động)
- `updated_at`: Thời gian cập nhật (tự động)
- `created_user_id`: ID user tạo (tự động lấy từ token)
- `updated_user_id`: ID user cập nhật (tự động lấy từ token)
- `deleted_at`: Thời gian xóa (null nếu chưa xóa)

### Comics
- `slug`: Nếu không gửi, API tự sinh từ `title`

### Chapters
- `view_count`: Số lượt xem (mặc định: 0, tự động tăng khi có người xem)

### Comic Categories
- `slug`: Nếu không gửi, API tự sinh từ `name`

### Reviews
- `user_id`: Tự động lấy từ token
- Rating tự động sync vào `comic_stats` (average_rating, review_count)

### Comments
- `user_id`: Tự động lấy từ token
- `status`: Mặc định `visible`

### Follows
- `user_id`: Tự động lấy từ token
- Follow count tự động sync vào `comic_stats.follow_count`

### Bookmarks
- `user_id`: Tự động lấy từ token
- `created_at`: Thời gian tạo (tự động)

### Reading History
- `user_id`: Tự động lấy từ token
- `updated_at`: Tự động cập nhật mỗi lần gọi API

---

## 🔄 Flow tích hợp đề xuất

### 1. Flow đọc truyện
1. User xem danh sách truyện: `GET /public/comics`
2. User chọn truyện: `GET /public/comics/:slug`
3. User xem danh sách chương: `GET /public/comics/:slug/chapters`
4. User đọc chương: `GET /public/chapters/:id/pages`
5. Track view: `POST /public/chapters/:id/view`
6. Cập nhật reading history: `POST /user/reading-history`

### 2. Flow quản lý truyện (Admin)
1. Tạo truyện: `POST /admin/comics`
2. Upload ảnh bìa: `POST /admin/comics/:id/cover`
3. Gán danh mục: `POST /admin/comics/:id/comic-categories`
4. Tạo chương: `POST /admin/chapters`
5. Upload trang: `POST /admin/chapters/:id/pages`
6. Xuất bản: `PUT /admin/chapters/:id` (status: published)

### 3. Flow tương tác (User)
1. Follow truyện: `POST /user/follows/comics/:comicId`
2. Đánh giá: `POST /user/reviews/comics/:comicId`
3. Bình luận: `POST /user/comments`
4. Bookmark trang: `POST /user/bookmarks`

---

## 📝 Ghi chú quan trọng

1. **Status:** Chỉ truyện/chương có status `published` hoặc `completed` mới hiển thị trong public API
2. **Soft Delete:** Xóa truyện/chương là soft delete (đánh dấu `deleted_at`), có thể khôi phục
3. **Unique Constraints:**
   - Mỗi truyện chỉ có 1 chương với `chapter_index` duy nhất
   - Mỗi user chỉ có 1 đánh giá cho mỗi truyện
   - Mỗi user chỉ có 1 follow cho mỗi truyện
   - Mỗi user chỉ có 1 reading history cho mỗi truyện
4. **Rate Limits:**
   - Reviews: 10 requests/phút
   - Comments: 20 requests/phút
   - Track View: 10 requests/phút
5. **HTML Sanitize:** Nội dung reviews và comments sẽ được sanitize để loại bỏ HTML độc hại
6. **Auto Sync:** Ratings và follow counts tự động sync vào `comic_stats`

---

## 🐛 Lỗi thường gặp

Xem chi tiết trong từng file tài liệu API cụ thể.

---

## 📞 Hỗ trợ

Nếu có thắc mắc về API, vui lòng liên hệ team backend.


