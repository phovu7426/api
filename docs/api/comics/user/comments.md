# User Comments API - Bình luận Truyện Tranh

API dành cho user để bình luận trên truyện tranh hoặc chương. Yêu cầu authentication và permission `comic.read`.

## Cấu trúc

- Base URL: `http://localhost:3000/api/user/comments`
- Authentication: **Yêu cầu** (Bearer Token)
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`

---

## 1. Get My Comments (Lấy bình luận của tôi)

### Request

```bash
curl -X GET "http://localhost:3000/api/user/comments?page=1&limit=20" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
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
      "chapter_id": null,
      "parent_id": null,
      "content": "Truyện này hay quá!",
      "status": "visible",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "comic": {
        "id": 1,
        "title": "Truyện Tranh Mẫu",
        "slug": "truyen-tranh-mau"
      },
      "replies": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

---

## 2. Create Comment (Tạo bình luận)

### Request

```bash
curl -X POST "http://localhost:3000/api/user/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "comic_id": 1,
    "chapter_id": null,
    "parent_id": null,
    "content": "Truyện này hay quá! Nội dung rất hấp dẫn."
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `comic_id` | number | ✅ | ID truyện |
| `chapter_id` | number | ❌ | ID chương (nếu comment trên chương cụ thể) |
| `parent_id` | number | ❌ | ID comment cha (nếu là reply) |
| `content` | string | ✅ | Nội dung bình luận (HTML sẽ được sanitize) |

### Trường API tự sinh (không cần gửi từ FE)

- `id`: ID tự động tăng
- `user_id`: ID user (tự động lấy từ token)
- `status`: Trạng thái (mặc định: `visible`)
- `created_at`: Thời gian tạo (tự động)
- `updated_at`: Thời gian cập nhật (tự động)
- `created_user_id`: ID user tạo (tự động lấy từ token)
- `updated_user_id`: ID user cập nhật (tự động lấy từ token)
- `deleted_at`: Thời gian xóa (null nếu chưa xóa)

### Rate Limit

- **Limit:** 20 requests per minute per user
- **Purpose:** Tránh spam comments

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Bình luận thành công.",
  "data": {
    "id": 1,
    "user_id": 1,
    "comic_id": 1,
    "chapter_id": null,
    "parent_id": null,
    "content": "Truyện này hay quá! Nội dung rất hấp dẫn.",
    "status": "visible",
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "user": {
      "id": 1,
      "username": "user1",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

---

## 3. Update Comment (Cập nhật bình luận)

### Request

```bash
curl -X PUT "http://localhost:3000/api/user/comments/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Nội dung đã chỉnh sửa..."
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `content` | string | ✅ | Nội dung bình luận mới (HTML sẽ được sanitize) |

### Trường API tự sinh

- `updated_at`: Thời gian cập nhật (tự động)
- `updated_user_id`: ID user cập nhật (tự động lấy từ token)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật bình luận thành công.",
  "data": {
    "id": 1,
    "content": "Nội dung đã chỉnh sửa...",
    "updated_at": "2025-01-11T06:00:00.000Z",
    "updated_user_id": 1
  }
}
```

**Lưuý:** Chỉ user tạo comment mới có thể cập nhật comment của mình.

---

## 4. Delete Comment (Xóa bình luận)

### Request

```bash
curl -X DELETE "http://localhost:3000/api/user/comments/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa bình luận thành công."
}
```

**Lưu ý:** 
- Đây là soft delete, comment sẽ được đánh dấu `deleted_at` nhưng không bị xóa khỏi database
- Khi xóa comment cha, các reply sẽ vẫn hiển thị nhưng không có parent

---

## 5. Get Comments by Comic (Public - Lấy bình luận của truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/comments/comics/1?page=1&limit=20" \
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
      "chapter_id": null,
      "parent_id": null,
      "content": "Truyện này hay quá!",
      "status": "visible",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "user": {
        "id": 1,
        "username": "user1",
        "avatar": "https://example.com/avatar.jpg"
      },
      "replies": [
        {
          "id": 2,
          "user_id": 2,
          "parent_id": 1,
          "content": "Đồng ý!",
          "created_at": "2025-01-11T06:00:00.000Z",
          "user": {
            "id": 2,
            "username": "user2",
            "avatar": "https://example.com/avatar2.jpg"
          }
        }
      ]
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
- Chỉ hiển thị các comment có `status = 'visible'` và chưa bị xóa
- Comments được sắp xếp theo `created_at` DESC (mới nhất trước)
- Replies được nested trong comment cha (tree structure)

---

## 6. Get Comments by Chapter (Public - Lấy bình luận của chương)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/comments/chapters/1?page=1&limit=20" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 20)

### Response

Tương tự như Get Comments by Comic, nhưng chỉ lấy comments của chương cụ thể.

---

## Comment Structure (Cấu trúc bình luận)

### Comment Types

1. **Comment trên truyện:**
   - `comic_id`: ID truyện
   - `chapter_id`: null
   - `parent_id`: null (nếu là comment gốc) hoặc ID comment cha (nếu là reply)

2. **Comment trên chương:**
   - `comic_id`: ID truyện
   - `chapter_id`: ID chương
   - `parent_id`: null (nếu là comment gốc) hoặc ID comment cha (nếu là reply)

3. **Reply comment:**
   - `parent_id`: ID comment cha
   - Có thể reply comment trên truyện hoặc chương

### Tree Structure

```
Comment 1 (parent_id: null)
  └── Reply 1.1 (parent_id: 1)
      └── Reply 1.1.1 (parent_id: 1.1)
  └── Reply 1.2 (parent_id: 1)
Comment 2 (parent_id: null)
  └── Reply 2.1 (parent_id: 2)
```

---

## Status

| Giá trị | Mô tả |
|---------|-------|
| `visible` | Hiển thị công khai |
| `hidden` | Ẩn (chỉ admin mới thấy) |

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

### 404 Not Found
```json
{
  "success": false,
  "message": "Bình luận không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID comment

### 403 Forbidden - Not Owner
```json
{
  "success": false,
  "message": "Bạn không có quyền chỉnh sửa/xóa bình luận này"
}
```
**Giải pháp:** Chỉ user tạo comment mới có thể cập nhật/xóa

### 400 Bad Request - Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "content": ["content should not be empty"]
  }
}
```
**Giải pháp:** Kiểm tra dữ liệu request body

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```
**Giải pháp:** Đợi 1 phút trước khi comment lại

---

## Ghi chú tích hợp

1. **Tree Structure:** Comments hỗ trợ reply/reply của reply (nested comments)
2. **Comment Location:** Có thể comment trên truyện (comic) hoặc chương cụ thể (chapter)
3. **HTML Sanitize:** Nội dung `content` sẽ được sanitize để loại bỏ HTML độc hại
4. **Rate Limit:** Có rate limit 20 requests/phút để tránh spam
5. **Soft Delete:** Xóa comment chỉ đánh dấu `deleted_at`, replies vẫn hiển thị
6. **Public Comments:** Endpoints `/public/comments/comics/:comicId` và `/public/comments/chapters/:chapterId` để xem comments (không cần auth)
7. **User Info:** Public comments hiển thị thông tin user (username, avatar) nhưng ẩn thông tin nhạy cảm
8. **Status:** Comment mặc định có `status = 'visible'`, admin có thể ẩn comment
9. **Ownership:** Chỉ user tạo comment mới có thể cập nhật/xóa comment của mình
10. **Audit fields:** `created_user_id`, `updated_user_id` tự động lấy từ token, không cần gửi từ FE


