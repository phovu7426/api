# User Reviews API - Đánh giá Truyện Tranh

API dành cho user để đánh giá và xem đánh giá truyện tranh. Yêu cầu authentication và permission `comic.read`.

## Cấu trúc

- Base URL: `http://localhost:3000/api/user/reviews`
- Authentication: **Yêu cầu** (Bearer Token)
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`

---

## 1. Get My Reviews (Lấy đánh giá của tôi)

### Request

```bash
curl -X GET "http://localhost:3000/api/user/reviews" \
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
      "user_id": 1,
      "comic_id": 1,
      "rating": 5,
      "content": "Truyện rất hay!",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "comic": {
        "id": 1,
        "title": "Truyện Tranh Mẫu",
        "slug": "truyen-tranh-mau",
        "cover_image": "https://example.com/cover.jpg"
      }
    }
  ]
}
```

---

## 2. Create or Update Review (Tạo hoặc cập nhật đánh giá)

### Request

```bash
curl -X POST "http://localhost:3000/api/user/reviews/comics/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rating": 5,
    "content": "Truyện rất hay! Nội dung hấp dẫn, hình ảnh đẹp."
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `rating` | number | ✅ | Điểm đánh giá (1-5) |
| `content` | string | ❌ | Nội dung đánh giá (HTML sẽ được sanitize) |

### Trường API tự sinh (không cần gửi từ FE)

- `id`: ID tự động tăng
- `user_id`: ID user (tự động lấy từ token)
- `comic_id`: ID truyện (từ URL parameter)
- `created_at`: Thời gian tạo (tự động)
- `updated_at`: Thời gian cập nhật (tự động)
- `created_user_id`: ID user tạo (tự động lấy từ token)
- `updated_user_id`: ID user cập nhật (tự động lấy từ token)
- `deleted_at`: Thời gian xóa (null nếu chưa xóa)

### Rate Limit

- **Limit:** 10 requests per minute per user
- **Purpose:** Tránh spam reviews

### Response

**Success (200/201):**
```json
{
  "success": true,
  "message": "Đánh giá thành công.",
  "data": {
    "id": 1,
    "user_id": 1,
    "comic_id": 1,
    "rating": 5,
    "content": "Truyện rất hay! Nội dung hấp dẫn, hình ảnh đẹp.",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "comic": {
      "id": 1,
      "title": "Truyện Tranh Mẫu",
      "slug": "truyen-tranh-mau"
    }
  }
}
```

**Lưu ý:** 
- Nếu user chưa có đánh giá cho truyện này → Tạo mới (201)
- Nếu user đã có đánh giá → Cập nhật (200)
- Mỗi user chỉ có thể có 1 đánh giá cho mỗi truyện (unique constraint)

---

## 3. Delete Review (Xóa đánh giá)

### Request

```bash
curl -X DELETE "http://localhost:3000/api/user/reviews/comics/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa đánh giá thành công."
}
```

**Lưu ý:** Đây là soft delete, đánh giá sẽ được đánh dấu `deleted_at` nhưng không bị xóa khỏi database.

---

## 4. Get Reviews by Comic (Public - Lấy đánh giá của truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/reviews/comics/1?page=1&limit=20" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 20)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "comic_id": 1,
      "rating": 5,
      "content": "Truyện rất hay!",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "user": {
        "id": 1,
        "username": "user1",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Lưu ý:** 
- Endpoint này là public, không cần authentication
- Chỉ hiển thị các đánh giá chưa bị xóa (deleted_at = null)
- Tự động sync rating vào `comic_stats` (average_rating, review_count)

---

## Rating System

| Giá trị | Mô tả |
|---------|-------|
| 1 | Rất tệ |
| 2 | Tệ |
| 3 | Bình thường |
| 4 | Tốt |
| 5 | Rất tốt |

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
  "message": "Forbidden - Không có quyền comic.read"
}
```
**Giải pháp:** User cần có permission `comic.read`

### 400 Bad Request - Invalid Rating
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "rating": ["rating must be between 1 and 5"]
  }
}
```
**Giải pháp:** Rating phải từ 1-5

### 404 Not Found
```json
{
  "success": false,
  "message": "Truyện không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID truyện

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```
**Giải pháp:** Đợi 1 phút trước khi tạo đánh giá lại

---

## Ghi chú tích hợp

1. **One Review Per Comic:** Mỗi user chỉ có thể có 1 đánh giá cho mỗi truyện (unique constraint)
2. **Create or Update:** Endpoint `POST /user/reviews/comics/:comicId` tự động tạo mới hoặc cập nhật đánh giá hiện có
3. **Rating Sync:** Rating tự động sync vào `comic_stats` (average_rating, review_count)
4. **HTML Sanitize:** Nội dung `content` sẽ được sanitize để loại bỏ HTML độc hại
5. **Rate Limit:** Có rate limit 10 requests/phút để tránh spam
6. **Soft Delete:** Xóa đánh giá chỉ đánh dấu `deleted_at`, có thể khôi phục (nếu cần)
7. **Public Reviews:** Endpoint `/public/reviews/comics/:comicId` để xem tất cả đánh giá của truyện (không cần auth)
8. **User Info:** Public reviews hiển thị thông tin user (username, avatar) nhưng ẩn thông tin nhạy cảm
9. **Audit fields:** `created_user_id`, `updated_user_id` tự động lấy từ token, không cần gửi từ FE


