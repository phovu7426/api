# Admin Comics API - Quản lý Truyện Tranh

API dành cho quản trị viên để quản lý truyện tranh (comics). Yêu cầu authentication và permission `comic.manage`.

## Cấu trúc

- Base URL: `http://localhost:3000/api/admin/comics`
- Authentication: **Yêu cầu** (Bearer Token)
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`

---

## 1. Get Comics List (Lấy danh sách truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/comics?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `search` (optional): Tìm kiếm theo tên truyện
- `filters[status]` (optional): Lọc theo trạng thái (`draft`, `published`, `completed`, `hidden`)
- `filters[author]` (optional): Lọc theo tác giả
- `filters[category_id]` (optional): Lọc theo danh mục
- `sort` (optional): Sắp xếp (mặc định: `created_at:DESC`)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "truyen-tranh-mau",
      "title": "Truyện Tranh Mẫu",
      "description": "Mô tả truyện...",
      "cover_image": "https://example.com/cover.jpg",
      "author": "Tác giả",
      "status": "published",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "created_user_id": 1,
      "updated_user_id": 1,
      "categories": [
        {
          "id": 1,
          "name": "Hành động",
          "slug": "hanh-dong"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 2. Get Simple Comics List (Lấy danh sách truyện đơn giản)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/comics/simple?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

Trả về danh sách truyện với ít thông tin hơn (chỉ id, title, slug) - dùng cho dropdown/select.

---

## 3. Get Comic by ID (Lấy chi tiết truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/comics/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "truyen-tranh-mau",
    "title": "Truyện Tranh Mẫu",
    "description": "Mô tả truyện...",
    "cover_image": "https://example.com/cover.jpg",
    "author": "Tác giả",
    "status": "published",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "created_user_id": 1,
    "updated_user_id": 1,
    "categories": [
      {
        "id": 1,
        "name": "Hành động",
        "slug": "hanh-dong"
      }
    ],
    "chapters": [],
    "stats": {
      "view_count": 1000,
      "follow_count": 50,
      "review_count": 20,
      "average_rating": 4.5
    }
  }
}
```

---

## 4. Create Comic (Tạo truyện mới)

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/comics" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Truyện Tranh Mới",
    "slug": "truyen-tranh-moi",
    "description": "Mô tả truyện...",
    "author": "Tác giả",
    "status": "draft",
    "category_ids": [1, 2]
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `title` | string | ✅ | Tên truyện (tối đa 255 ký tự) |
| `slug` | string | ❌ | URL slug (tối đa 255 ký tự). **Nếu không gửi, API tự sinh từ title** |
| `description` | string | ❌ | Mô tả truyện |
| `cover_image` | string | ❌ | URL ảnh bìa (tối đa 500 ký tự). **Nên upload qua endpoint riêng** |
| `author` | string | ❌ | Tác giả (tối đa 255 ký tự) |
| `status` | enum | ❌ | Trạng thái: `draft`, `published`, `completed`, `hidden` (mặc định: `draft`) |
| `category_ids` | number[] | ❌ | Mảng ID danh mục |

### Trường API tự sinh (không cần gửi từ FE)

- `id`: ID tự động tăng
- `slug`: Nếu không gửi, API tự sinh từ `title` (chuyển thành slug format)
- `created_at`: Thời gian tạo (tự động)
- `updated_at`: Thời gian cập nhật (tự động)
- `created_user_id`: ID user tạo (tự động lấy từ token)
- `updated_user_id`: ID user cập nhật (tự động lấy từ token)
- `deleted_at`: Thời gian xóa (null nếu chưa xóa)

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Tạo truyện thành công.",
  "data": {
    "id": 1,
    "slug": "truyen-tranh-moi",
    "title": "Truyện Tranh Mới",
    "description": "Mô tả truyện...",
    "cover_image": null,
    "author": "Tác giả",
    "status": "draft",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "created_user_id": 1,
    "updated_user_id": 1
  }
}
```

---

## 5. Update Comic (Cập nhật truyện)

### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/comics/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Truyện Tranh Đã Cập Nhật",
    "description": "Mô tả mới...",
    "status": "published",
    "category_ids": [1, 3]
  }'
```

### Request Body

Tất cả các trường đều **optional** (chỉ gửi trường cần cập nhật):

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `title` | string | Tên truyện (tối đa 255 ký tự) |
| `slug` | string | URL slug (tối đa 255 ký tự) |
| `description` | string | Mô tả truyện |
| `cover_image` | string | URL ảnh bìa (tối đa 500 ký tự) |
| `author` | string | Tác giả (tối đa 255 ký tự) |
| `status` | enum | Trạng thái: `draft`, `published`, `completed`, `hidden` |
| `category_ids` | number[] | Mảng ID danh mục (sẽ thay thế toàn bộ danh mục hiện tại) |

### Trường API tự sinh

- `updated_at`: Thời gian cập nhật (tự động)
- `updated_user_id`: ID user cập nhật (tự động lấy từ token)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật truyện thành công.",
  "data": {
    "id": 1,
    "slug": "truyen-tranh-da-cap-nhat",
    "title": "Truyện Tranh Đã Cập Nhật",
    "description": "Mô tả mới...",
    "status": "published",
    "updated_at": "2025-01-11T06:00:00.000Z",
    "updated_user_id": 1
  }
}
```

---

## 6. Delete Comic (Xóa truyện - Soft Delete)

### Request

```bash
curl -X DELETE "http://localhost:3000/api/admin/comics/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa truyện thành công."
}
```

**Lưu ý:** Đây là soft delete, truyện sẽ được đánh dấu `deleted_at` nhưng không bị xóa khỏi database.

---

## 7. Restore Comic (Khôi phục truyện đã xóa)

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/comics/1/restore" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Khôi phục truyện thành công.",
  "data": {
    "id": 1,
    "deleted_at": null
  }
}
```

---

## 8. Upload Cover Image (Upload ảnh bìa)

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/comics/1/cover" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Request Body

- `file` (multipart/form-data): File ảnh (jpg, png, webp)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Upload ảnh bìa thành công.",
  "data": {
    "id": 1,
    "cover_image": "https://example.com/uploads/comics/cover-1.jpg"
  }
}
```

---

## 9. Assign Categories (Gán danh mục cho truyện)

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/comics/1/comic-categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "category_ids": [1, 2, 3]
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `category_ids` | number[] | ✅ | Mảng ID danh mục |

**Lưu ý:** Endpoint này sẽ **thay thế** toàn bộ danh mục hiện tại bằng danh sách mới.

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Gán danh mục thành công.",
  "data": {
    "id": 1,
    "categories": [
      { "id": 1, "name": "Hành động", "slug": "hanh-dong" },
      { "id": 2, "name": "Phiêu lưu", "slug": "phieu-luu" },
      { "id": 3, "name": "Hài hước", "slug": "hai-huoc" }
    ]
  }
}
```

---

## 10. Get Chapters by Comic (Lấy danh sách chương của truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/comics/1/chapters" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "comic_id": 1,
    "chapters": []
  }
}
```

---

## Trạng thái (Status)

| Giá trị | Mô tả |
|---------|-------|
| `draft` | Nháp - Chưa xuất bản |
| `published` | Đã xuất bản - Hiển thị công khai |
| `completed` | Hoàn thành - Truyện đã kết thúc |
| `hidden` | Ẩn - Không hiển thị công khai |

---

## Lỗi thường gặp

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
**Giải pháp:** Kiểm tra token authentication

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden - Không có quyền comic.manage"
}
```
**Giải pháp:** User cần có permission `comic.manage`

### 404 Not Found
```json
{
  "success": false,
  "message": "Truyện không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID truyện

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": ["title should not be empty"]
  }
}
```
**Giải pháp:** Kiểm tra dữ liệu request body

---

## Ghi chú tích hợp

1. **Slug tự động:** Nếu không gửi `slug`, API sẽ tự động tạo từ `title` (chuyển thành dạng URL-friendly)
2. **Upload ảnh:** Nên sử dụng endpoint riêng `/admin/comics/:id/cover` để upload ảnh bìa
3. **Danh mục:** Có thể gán danh mục khi tạo (qua `category_ids`) hoặc sau đó qua endpoint `/admin/comics/:id/comic-categories`
4. **Soft Delete:** Xóa truyện chỉ đánh dấu `deleted_at`, có thể khôi phục bằng endpoint restore
5. **Audit fields:** `created_user_id`, `updated_user_id` tự động lấy từ token, không cần gửi từ FE


