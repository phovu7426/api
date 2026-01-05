# Admin Comic Categories API - Quản lý Danh mục Truyện

API dành cho quản trị viên để quản lý danh mục truyện tranh (comic categories). Yêu cầu authentication và permission `comic.manage`.

## Cấu trúc

- Base URL: `http://localhost:3000/api/admin/comic-categories`
- Authentication: **Yêu cầu** (Bearer Token)
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`

---

## 1. Get Categories List (Lấy danh sách danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/comic-categories?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `search` (optional): Tìm kiếm theo tên danh mục
- `sort` (optional): Sắp xếp (mặc định: `created_at:DESC`)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hành động",
      "slug": "hanh-dong",
      "description": "Truyện hành động",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "created_user_id": 1,
      "updated_user_id": 1
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

---

## 2. Get Category by ID (Lấy chi tiết danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/comic-categories/1" \
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
    "name": "Hành động",
    "slug": "hanh-dong",
    "description": "Truyện hành động",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "created_user_id": 1,
    "updated_user_id": 1,
    "comics": [
      {
        "id": 1,
        "title": "Truyện Tranh Mẫu",
        "slug": "truyen-tranh-mau"
      }
    ]
  }
}
```

---

## 3. Create Category (Tạo danh mục mới)

### Request

```bash
curl -X POST "http://localhost:3000/api/admin/comic-categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Hành động",
    "slug": "hanh-dong",
    "description": "Truyện hành động"
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `name` | string | ✅ | Tên danh mục (tối đa 255 ký tự) |
| `slug` | string | ❌ | URL slug (tối đa 255 ký tự). **Nếu không gửi, API tự sinh từ name** |
| `description` | string | ❌ | Mô tả danh mục |

### Trường API tự sinh (không cần gửi từ FE)

- `id`: ID tự động tăng
- `slug`: Nếu không gửi, API tự sinh từ `name` (chuyển thành slug format)
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
  "message": "Tạo danh mục thành công.",
  "data": {
    "id": 1,
    "name": "Hành động",
    "slug": "hanh-dong",
    "description": "Truyện hành động",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "created_user_id": 1,
    "updated_user_id": 1
  }
}
```

---

## 4. Update Category (Cập nhật danh mục)

### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/comic-categories/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Hành động (Đã cập nhật)",
    "description": "Mô tả mới..."
  }'
```

### Request Body

Tất cả các trường đều **optional** (chỉ gửi trường cần cập nhật):

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `name` | string | Tên danh mục (tối đa 255 ký tự) |
| `slug` | string | URL slug (tối đa 255 ký tự) |
| `description` | string | Mô tả danh mục |

### Trường API tự sinh

- `updated_at`: Thời gian cập nhật (tự động)
- `updated_user_id`: ID user cập nhật (tự động lấy từ token)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật danh mục thành công.",
  "data": {
    "id": 1,
    "name": "Hành động (Đã cập nhật)",
    "slug": "hanh-dong",
    "description": "Mô tả mới...",
    "updated_at": "2025-01-11T06:00:00.000Z",
    "updated_user_id": 1
  }
}
```

---

## 5. Delete Category (Xóa danh mục - Soft Delete)

### Request

```bash
curl -X DELETE "http://localhost:3000/api/admin/comic-categories/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa danh mục thành công."
}
```

**Lưu ý:** 
- Đây là soft delete, danh mục sẽ được đánh dấu `deleted_at` nhưng không bị xóa khỏi database
- Xóa danh mục **không** xóa các truyện thuộc danh mục đó, chỉ ngắt liên kết

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
  "message": "Danh mục không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID danh mục

### 400 Bad Request - Duplicate slug
```json
{
  "success": false,
  "message": "slug đã tồn tại"
}
```
**Giải pháp:** `slug` phải là duy nhất trong hệ thống

### 400 Bad Request - Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["name should not be empty"]
  }
}
```
**Giải pháp:** Kiểm tra dữ liệu request body

---

## Ghi chú tích hợp

1. **Slug tự động:** Nếu không gửi `slug`, API sẽ tự động tạo từ `name` (chuyển thành dạng URL-friendly)
2. **Slug unique:** `slug` phải là duy nhất trong hệ thống
3. **Soft Delete:** Xóa danh mục chỉ đánh dấu `deleted_at`, không xóa các truyện liên quan
4. **Audit fields:** `created_user_id`, `updated_user_id` tự động lấy từ token, không cần gửi từ FE
5. **Many-to-Many:** Một truyện có thể thuộc nhiều danh mục, một danh mục có thể chứa nhiều truyện


