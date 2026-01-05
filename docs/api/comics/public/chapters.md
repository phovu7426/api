# Public Chapters API - Đọc Truyện Tranh

API công khai để đọc truyện tranh (chapters). Không yêu cầu authentication cho hầu hết endpoints, nhưng một số tính năng như track view có rate limit.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/chapters`
- Authentication: **Không yêu cầu** (Public endpoints)
- Headers: `Content-Type: application/json`

---

## 1. Get Chapters List (Lấy danh sách chương)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/chapters?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `filters[comic_id]` (optional): Lọc theo ID truyện
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
      "title": "Chương 1: Bắt đầu",
      "chapter_index": 1,
      "chapter_label": "Chapter 1",
      "view_count": 1000,
      "created_at": "2025-01-11T05:00:00.000Z",
      "comic": {
        "id": 1,
        "title": "Truyện Tranh Mẫu",
        "slug": "truyen-tranh-mau"
      }
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

**Lưu ý:** Chỉ trả về các chương có status `published`.

---

## 2. Get Chapter by ID (Lấy chi tiết chương)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/chapters/1" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "comic_id": 1,
    "title": "Chương 1: Bắt đầu",
    "chapter_index": 1,
    "chapter_label": "Chapter 1",
    "view_count": 1000,
    "created_at": "2025-01-11T05:00:00.000Z",
    "comic": {
      "id": 1,
      "title": "Truyện Tranh Mẫu",
      "slug": "truyen-tranh-mau",
      "cover_image": "https://example.com/cover.jpg"
    }
  }
}
```

---

## 3. Get Pages (Lấy danh sách trang của chương)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/chapters/1/pages" \
  -H "Content-Type: application/json"
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
      "file_size": 150000
    },
    {
      "id": 2,
      "chapter_id": 1,
      "page_number": 2,
      "image_url": "https://example.com/pages/page-2.jpg",
      "width": 800,
      "height": 1200,
      "file_size": 145000
    }
  ]
}
```

**Lưu ý:** 
- Trang được sắp xếp theo `page_number` ASC
- Chỉ trả về trang của chương có status `published`

---

## 4. Get Next Chapter (Lấy chương tiếp theo)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/chapters/1/next" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "comic_id": 1,
    "title": "Chương 2: Tiếp tục",
    "chapter_index": 2,
    "chapter_label": "Chapter 2",
    "view_count": 800,
    "created_at": "2025-01-12T05:00:00.000Z"
  }
}
```

**Nếu không có chương tiếp theo:**
```json
{
  "success": true,
  "data": null,
  "message": "Không có chương tiếp theo"
}
```

---

## 5. Get Previous Chapter (Lấy chương trước đó)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/chapters/2/prev" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "comic_id": 1,
    "title": "Chương 1: Bắt đầu",
    "chapter_index": 1,
    "chapter_label": "Chapter 1",
    "view_count": 1000,
    "created_at": "2025-01-11T05:00:00.000Z"
  }
}
```

**Nếu không có chương trước đó:**
```json
{
  "success": true,
  "data": null,
  "message": "Không có chương trước đó"
}
```

---

## 6. Track View (Đếm lượt xem)

### Request

```bash
curl -X POST "http://localhost:3000/api/public/chapters/1/view" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "tracked": true,
    "chapter_id": 1,
    "comic_id": 1
  }
}
```

### Rate Limit

- **Limit:** 10 requests per minute per IP
- **Purpose:** Tránh spam view count
- **Behavior:** Nếu vượt quá limit, request vẫn thành công nhưng không tăng view count

### Lưu ý

- API tự động lấy `user_id` từ token nếu user đã đăng nhập (optional)
- API tự động lấy `ip` và `user_agent` từ request
- View count được cập nhật async để không làm chậm response
- Hệ thống tự động ngăn duplicate views trong cùng một khoảng thời gian

---

## Lỗi thường gặp

### 404 Not Found
```json
{
  "success": false,
  "message": "Chương không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID chương

### 404 Not Found - Draft Chapter
```json
{
  "success": false,
  "message": "Chương không tồn tại hoặc chưa được xuất bản"
}
```
**Giải pháp:** Chỉ chương có status `published` mới hiển thị công khai

### 429 Too Many Requests (Track View)
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```
**Giải pháp:** Đợi 1 phút trước khi track view lại

---

## Ghi chú tích hợp

1. **Published Only:** Chỉ chương có status `published` mới hiển thị trong public API
2. **Page Order:** Trang được sắp xếp theo `page_number` ASC (1, 2, 3, ...)
3. **Next/Prev:** Dựa trên `chapter_index` của cùng một truyện
4. **View Tracking:** 
   - Tự động track khi user xem chương
   - Có rate limit để tránh spam
   - Tự động aggregate vào `comic_stats`
5. **Image URLs:** Tất cả `image_url` đều là absolute URLs, sẵn sàng để hiển thị
6. **Metadata:** `width`, `height`, `file_size` có thể null nếu không extract được
7. **Pagination:** Danh sách chương hỗ trợ phân trang
8. **Comic Info:** Mỗi chương đều có thông tin truyện (comic) để dễ dàng điều hướng

---

## Flow đọc truyện đề xuất

1. **Lấy danh sách chương:** `GET /public/comics/:slug/chapters`
2. **Lấy chi tiết chương:** `GET /public/chapters/:id`
3. **Lấy danh sách trang:** `GET /public/chapters/:id/pages`
4. **Track view:** `POST /public/chapters/:id/view` (sau khi user bắt đầu đọc)
5. **Chuyển chương:** `GET /public/chapters/:id/next` hoặc `GET /public/chapters/:id/prev`


