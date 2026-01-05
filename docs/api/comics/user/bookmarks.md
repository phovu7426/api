# User Bookmarks API - Đánh dấu Trang Đọc

API dành cho user để đánh dấu (bookmark) trang đang đọc trong chương truyện. Yêu cầu authentication và permission `comic.read`.

## Cấu trúc

- Base URL: `http://localhost:3000/api/user/bookmarks`
- Authentication: **Yêu cầu** (Bearer Token)
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`

---

## 1. Get My Bookmarks (Lấy danh sách bookmark của tôi)

### Request

```bash
curl -X GET "http://localhost:3000/api/user/bookmarks" \
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
      "chapter_id": 1,
      "page_number": 5,
      "created_at": "2025-01-11T05:00:00.000Z",
      "chapter": {
        "id": 1,
        "title": "Chương 1: Bắt đầu",
        "chapter_index": 1,
        "comic": {
          "id": 1,
          "title": "Truyện Tranh Mẫu",
          "slug": "truyen-tranh-mau",
          "cover_image": "https://example.com/cover.jpg"
        }
      }
    }
  ]
}
```

---

## 2. Create Bookmark (Tạo bookmark)

### Request

```bash
curl -X POST "http://localhost:3000/api/user/bookmarks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "chapter_id": 1,
    "page_number": 5
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `chapter_id` | number | ✅ | ID chương |
| `page_number` | number | ✅ | Số trang (bắt đầu từ 1) |

### Trường API tự sinh (không cần gửi từ FE)

- `id`: ID tự động tăng
- `user_id`: ID user (tự động lấy từ token)
- `created_at`: Thời gian tạo (tự động)

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Tạo bookmark thành công.",
  "data": {
    "id": 1,
    "user_id": 1,
    "chapter_id": 1,
    "page_number": 5,
    "created_at": "2025-01-11T05:00:00.000Z",
    "chapter": {
      "id": 1,
      "title": "Chương 1: Bắt đầu",
      "chapter_index": 1,
      "comic": {
        "id": 1,
        "title": "Truyện Tranh Mẫu",
        "slug": "truyen-tranh-mau"
      }
    }
  }
}
```

**Lưu ý:** 
- User có thể tạo nhiều bookmark cho nhiều chương khác nhau
- User có thể tạo nhiều bookmark trong cùng một chương (không có unique constraint)
- `page_number` phải hợp lệ (từ 1 đến số trang tối đa của chương)

---

## 3. Delete Bookmark (Xóa bookmark)

### Request

```bash
curl -X DELETE "http://localhost:3000/api/user/bookmarks/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa bookmark thành công."
}
```

**Lưu ý:** Đây là hard delete, bookmark sẽ bị xóa hoàn toàn khỏi database (không phải soft delete).

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
  "message": "Chương không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID chương

### 400 Bad Request - Invalid Page Number
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "page_number": ["page_number must be greater than 0"]
  }
}
```
**Giải pháp:** `page_number` phải từ 1 trở lên và không vượt quá số trang của chương

### 404 Not Found - Bookmark
```json
{
  "success": false,
  "message": "Bookmark không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID bookmark

---

## Ghi chú tích hợp

1. **Multiple Bookmarks:** User có thể tạo nhiều bookmark cho nhiều chương hoặc nhiều trang trong cùng một chương
2. **Hard Delete:** Xóa bookmark sẽ xóa hoàn toàn record khỏi database (không phải soft delete)
3. **Page Number:** `page_number` phải hợp lệ (từ 1 đến số trang tối đa của chương)
4. **User Context:** `user_id` tự động lấy từ token, không cần gửi từ FE
5. **No Unique Constraint:** Không có unique constraint, user có thể bookmark cùng một trang nhiều lần (nếu cần)
6. **Chapter Info:** Response bao gồm thông tin chương và truyện để dễ dàng điều hướng
7. **Created At:** `created_at` tự động gán khi tạo bookmark

---

## Use Cases

### 1. Lưu vị trí đọc hiện tại

```javascript
// Tạo bookmark khi user đọc đến trang 5 của chương 1
const createBookmark = async (chapterId, pageNumber) => {
  const response = await fetch('/api/user/bookmarks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      chapter_id: chapterId,
      page_number: pageNumber
    })
  });
  const { data } = await response.json();
  return data;
};
```

### 2. Hiển thị danh sách bookmark

```javascript
// Lấy tất cả bookmark của user
const getMyBookmarks = async () => {
  const response = await fetch('/api/user/bookmarks', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  return data; // Array of bookmarks with chapter and comic info
};
```

### 3. Xóa bookmark khi không cần

```javascript
// Xóa bookmark
const deleteBookmark = async (bookmarkId) => {
  await fetch(`/api/user/bookmarks/${bookmarkId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

### 4. Điều hướng đến trang đã bookmark

```javascript
// Khi user click vào bookmark, điều hướng đến chương và trang đó
const navigateToBookmark = (bookmark) => {
  const { chapter, page_number } = bookmark;
  const comicSlug = chapter.comic.slug;
  // Navigate to: /comics/{comicSlug}/chapters/{chapter.id}?page={page_number}
  window.location.href = `/comics/${comicSlug}/chapters/${chapter.id}?page=${page_number}`;
};
```


