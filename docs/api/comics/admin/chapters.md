# Admin Chapters API - Quản lý Chương Truyện

API dành cho quản trị viên để quản lý chương truyện (chapters). Yêu cầu authentication và permission `comic.manage`.

## Cấu trúc

- Base URL: `http://localhost:3000/api/admin/chapters`
- Authentication: **Yêu cầu** (Bearer Token)
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`

---

## 1. Get Chapters List (Lấy danh sách chương)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/chapters?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `filters[comic_id]` (optional): Lọc theo ID truyện
- `filters[status]` (optional): Lọc theo trạng thái (`draft`, `published`)
- `sort` (optional): Sắp xếp (mặc định: `chapter_index:ASC`)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "comic_id": 1,
      "team_id": null,
      "title": "Chương 1: Bắt đầu",
      "chapter_index": 1,
      "chapter_label": "Chapter 1",
      "status": "published",
      "view_count": 1000,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "created_user_id": 1,
      "updated_user_id": 1,
      "pages": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## 2. Get Chapter by ID (Lấy chi tiết chương)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/chapters/1" \
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
    "comic_id": 1,
    "team_id": null,
    "title": "Chương 1: Bắt đầu",
    "chapter_index": 1,
    "chapter_label": "Chapter 1",
    "status": "published",
    "view_count": 1000,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "created_user_id": 1,
    "updated_user_id": 1,
    "comic": {
      "id": 1,
      "title": "Truyện Tranh Mẫu",
      "slug": "truyen-tranh-mau"
    },
    "pages": [
      {
        "id": 1,
        "page_number": 1,
        "image_url": "https://example.com/pages/page-1.jpg",
        "width": 800,
        "height": 1200,
        "file_size": 150000
      }
    ]
  }
}
```

---

## 3. Get Chapters by Comic ID (Lấy chương theo truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/chapters/comics/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

Trả về danh sách tất cả chương của truyện có ID = 1, sắp xếp theo `chapter_index`.

---

## 4. Create Chapter (Tạo chương mới)

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/chapters" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "comic_id": 1,
    "team_id": null,
    "title": "Chương 1: Bắt đầu",
    "chapter_index": 1,
    "chapter_label": "Chapter 1",
    "status": "draft",
    "pages": []
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `comic_id` | number | ✅ | ID truyện |
| `team_id` | number | ❌ | ID nhóm dịch (nếu có) |
| `title` | string | ✅ | Tên chương (tối đa 255 ký tự) |
| `chapter_index` | number | ✅ | Số thứ tự chương (tối thiểu: 1) |
| `chapter_label` | string | ❌ | Nhãn chương (tối đa 50 ký tự), ví dụ: "Chapter 1", "Ep. 1" |
| `status` | enum | ❌ | Trạng thái: `draft`, `published` (mặc định: `draft`) |
| `pages` | array | ❌ | Mảng các trang (xem cấu trúc bên dưới) |

### Cấu trúc Page (trong pages array)

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `image_url` | string | ✅ | URL ảnh trang (tối đa 500 ký tự) |
| `width` | number | ❌ | Chiều rộng ảnh (pixels) |
| `height` | number | ❌ | Chiều cao ảnh (pixels) |
| `file_size` | number | ❌ | Kích thước file (bytes) |

### Trường API tự sinh (không cần gửi từ FE)

- `id`: ID tự động tăng
- `view_count`: Số lượt xem (mặc định: 0)
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
  "message": "Tạo chương thành công.",
  "data": {
    "id": 1,
    "comic_id": 1,
    "title": "Chương 1: Bắt đầu",
    "chapter_index": 1,
    "chapter_label": "Chapter 1",
    "status": "draft",
    "view_count": 0,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "created_user_id": 1,
    "updated_user_id": 1
  }
}
```

---

## 5. Update Chapter (Cập nhật chương)

### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/chapters/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Chương 1: Bắt đầu (Đã chỉnh sửa)",
    "status": "published",
    "chapter_label": "Chapter 1"
  }'
```

### Request Body

Tất cả các trường đều **optional** (chỉ gửi trường cần cập nhật):

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `team_id` | number | ID nhóm dịch |
| `title` | string | Tên chương (tối đa 255 ký tự) |
| `chapter_index` | number | Số thứ tự chương (tối thiểu: 1) |
| `chapter_label` | string | Nhãn chương (tối đa 50 ký tự) |
| `status` | enum | Trạng thái: `draft`, `published` |

### Trường API tự sinh

- `updated_at`: Thời gian cập nhật (tự động)
- `updated_user_id`: ID user cập nhật (tự động lấy từ token)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật chương thành công.",
  "data": {
    "id": 1,
    "title": "Chương 1: Bắt đầu (Đã chỉnh sửa)",
    "status": "published",
    "updated_at": "2025-01-11T06:00:00.000Z",
    "updated_user_id": 1
  }
}
```

---

## 6. Delete Chapter (Xóa chương - Soft Delete)

### Request

```bash
curl -X DELETE "http://localhost:3000/api/admin/chapters/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa chương thành công."
}
```

**Lưu ý:** Đây là soft delete, chương sẽ được đánh dấu `deleted_at` nhưng không bị xóa khỏi database.

---

## 7. Restore Chapter (Khôi phục chương đã xóa)

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/chapters/1/restore" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Khôi phục chương thành công.",
  "data": {
    "id": 1,
    "deleted_at": null
  }
}
```

---

## 8. Reorder Chapter (Sắp xếp lại thứ tự chương)

### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/chapters/1/reorder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "chapter_index": 5
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `chapter_index` | number | ✅ | Số thứ tự mới (tối thiểu: 1) |

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Sắp xếp lại chương thành công.",
  "data": {
    "id": 1,
    "chapter_index": 5,
    "updated_at": "2025-01-11T06:00:00.000Z"
  }
}
```

---

## 9. Get Pages (Lấy danh sách trang của chương)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/chapters/1/pages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "chapter_id": 1,
      "page_number": 1,
      "image_url": "https://example.com/pages/page-1.jpg",
      "width": 800,
      "height": 1200,
      "file_size": 150000,
      "created_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "chapter_id": 1,
      "page_number": 2,
      "image_url": "https://example.com/pages/page-2.jpg",
      "width": 800,
      "height": 1200,
      "file_size": 145000,
      "created_at": "2025-01-11T05:00:00.000Z"
    }
  ]
}
```

---

## 10. Upload Pages (Upload nhiều trang ảnh)

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/chapters/1/pages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/page1.jpg" \
  -F "files=@/path/to/page2.jpg" \
  -F "files=@/path/to/page3.jpg"
```

### Request Body

- `files` (multipart/form-data): Mảng file ảnh (tối đa 100 files mỗi lần upload)

**Lưu ý:** 
- Files sẽ được upload và tự động sắp xếp theo thứ tự gửi lên
- API sẽ tự động tạo `page_number` theo thứ tự (1, 2, 3, ...)
- API sẽ tự động extract metadata (width, height, file_size) nếu có thể

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Upload trang thành công.",
  "data": {
    "chapter_id": 1,
    "pages": [
      {
        "id": 1,
        "page_number": 1,
        "image_url": "https://example.com/uploads/chapters/1/page-1.jpg",
        "width": 800,
        "height": 1200,
        "file_size": 150000
      },
      {
        "id": 2,
        "page_number": 2,
        "image_url": "https://example.com/uploads/chapters/1/page-2.jpg",
        "width": 800,
        "height": 1200,
        "file_size": 145000
      }
    ]
  }
}
```

---

## 11. Update Pages (Cập nhật danh sách trang)

### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/chapters/1/pages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pages": [
      {
        "image_url": "https://example.com/pages/page-1.jpg",
        "width": 800,
        "height": 1200,
        "file_size": 150000
      },
      {
        "image_url": "https://example.com/pages/page-2.jpg",
        "width": 800,
        "height": 1200,
        "file_size": 145000
      }
    ]
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `pages` | array | ✅ | Mảng các trang (xem cấu trúc bên dưới) |

### Cấu trúc Page

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `image_url` | string | ✅ | URL ảnh trang (tối đa 500 ký tự) |
| `width` | number | ❌ | Chiều rộng ảnh (pixels) |
| `height` | number | ❌ | Chiều cao ảnh (pixels) |
| `file_size` | number | ❌ | Kích thước file (bytes) |

**Lưu ý:** 
- Endpoint này sẽ **thay thế** toàn bộ trang hiện tại bằng danh sách mới
- `page_number` sẽ được tự động gán theo thứ tự trong mảng (1, 2, 3, ...)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật trang thành công.",
  "data": {
    "chapter_id": 1,
    "pages": [
      {
        "id": 1,
        "page_number": 1,
        "image_url": "https://example.com/pages/page-1.jpg",
        "width": 800,
        "height": 1200,
        "file_size": 150000
      },
      {
        "id": 2,
        "page_number": 2,
        "image_url": "https://example.com/pages/page-2.jpg",
        "width": 800,
        "height": 1200,
        "file_size": 145000
      }
    ]
  }
}
```

---

## Trạng thái (Status)

| Giá trị | Mô tả |
|---------|-------|
| `draft` | Nháp - Chưa xuất bản |
| `published` | Đã xuất bản - Hiển thị công khai |

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
  "message": "Chương không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID chương

### 400 Bad Request - Duplicate chapter_index
```json
{
  "success": false,
  "message": "chapter_index đã tồn tại cho truyện này"
}
```
**Giải pháp:** Mỗi truyện chỉ có thể có 1 chương với `chapter_index` duy nhất

### 400 Bad Request - Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "chapter_index": ["chapter_index must not be less than 1"]
  }
}
```
**Giải pháp:** Kiểm tra dữ liệu request body

---

## Ghi chú tích hợp

1. **Chapter Index:** Mỗi truyện chỉ có thể có 1 chương với `chapter_index` duy nhất (unique constraint)
2. **Upload Pages:** Nên sử dụng endpoint `/admin/chapters/:id/pages` với multipart/form-data để upload nhiều ảnh cùng lúc
3. **Page Number:** `page_number` tự động gán theo thứ tự trong mảng (bắt đầu từ 1)
4. **View Count:** `view_count` tự động tăng khi có người xem (qua public API)
5. **Soft Delete:** Xóa chương chỉ đánh dấu `deleted_at`, có thể khôi phục
6. **Reorder:** Có thể thay đổi thứ tự chương bằng endpoint `/admin/chapters/:id/reorder`
7. **Audit fields:** `created_user_id`, `updated_user_id` tự động lấy từ token, không cần gửi từ FE


