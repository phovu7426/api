# User Reading History API - Lịch sử Đọc Truyện

API dành cho user để quản lý lịch sử đọc truyện tranh. Yêu cầu authentication và permission `comic.read`.

## Cấu trúc

- Base URL: `http://localhost:3000/api/user/reading-history`
- Authentication: **Yêu cầu** (Bearer Token)
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`

---

## 1. Get My Reading History (Lấy lịch sử đọc của tôi)

### Request

```bash
curl -X GET "http://localhost:3000/api/user/reading-history" \
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
      "chapter_id": 1,
      "last_page": 5,
      "updated_at": "2025-01-11T05:00:00.000Z",
      "comic": {
        "id": 1,
        "title": "Truyện Tranh Mẫu",
        "slug": "truyen-tranh-mau",
        "cover_image": "https://example.com/cover.jpg",
        "author": "Tác giả",
        "status": "published",
        "stats": {
          "view_count": 10000,
          "follow_count": 500,
          "chapter_count": 10
        }
      },
      "chapter": {
        "id": 1,
        "title": "Chương 1: Bắt đầu",
        "chapter_index": 1,
        "chapter_label": "Chapter 1"
      }
    }
  ]
}
```

**Lưuý:** 
- Lịch sử được sắp xếp theo `updated_at` DESC (mới nhất trước)
- Mỗi truyện chỉ có 1 record trong lịch sử (unique constraint: user_id + comic_id)
- `last_page` có thể null nếu user chưa đọc trang nào

---

## 2. Update or Create Reading History (Cập nhật hoặc tạo lịch sử đọc)

### Request

```bash
curl -X POST "http://localhost:3000/api/user/reading-history" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "comic_id": 1,
    "chapter_id": 1,
    "last_page": 5
  }'
```

### Request Body

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `comic_id` | number | ✅ | ID truyện |
| `chapter_id` | number | ✅ | ID chương đang đọc |
| `last_page` | number | ❌ | Số trang cuối cùng đã đọc (bắt đầu từ 1) |

### Trường API tự sinh (không cần gửi từ FE)

- `id`: ID tự động tăng
- `user_id`: ID user (tự động lấy từ token)
- `updated_at`: Thời gian cập nhật (tự động, mỗi lần update sẽ tự động cập nhật)

### Response

**Success (200/201):**
```json
{
  "success": true,
  "message": "Cập nhật lịch sử đọc thành công.",
  "data": {
    "id": 1,
    "user_id": 1,
    "comic_id": 1,
    "chapter_id": 1,
    "last_page": 5,
    "updated_at": "2025-01-11T05:00:00.000Z",
    "comic": {
      "id": 1,
      "title": "Truyện Tranh Mẫu",
      "slug": "truyen-tranh-mau"
    },
    "chapter": {
      "id": 1,
      "title": "Chương 1: Bắt đầu",
      "chapter_index": 1
    }
  }
}
```

**Lưu ý:** 
- Nếu user chưa có lịch sử cho truyện này → Tạo mới (201)
- Nếu user đã có lịch sử → Cập nhật (200)
- Mỗi user chỉ có thể có 1 lịch sử cho mỗi truyện (unique constraint: user_id + comic_id)
- `updated_at` tự động cập nhật mỗi lần gọi API này

---

## 3. Delete Reading History (Xóa lịch sử đọc)

### Request

```bash
curl -X DELETE "http://localhost:3000/api/user/reading-history/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa lịch sử đọc thành công."
}
```

**Lưu ý:** Đây là hard delete, lịch sử sẽ bị xóa hoàn toàn khỏi database (không phải soft delete).

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
  "message": "Truyện hoặc chương không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID truyện và chương

### 400 Bad Request - Validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "comic_id": ["comic_id should not be empty"],
    "chapter_id": ["chapter_id should not be empty"]
  }
}
```
**Giải pháp:** Kiểm tra dữ liệu request body

---

## Ghi chú tích hợp

1. **One History Per Comic:** Mỗi user chỉ có thể có 1 lịch sử cho mỗi truyện (unique constraint: user_id + comic_id)
2. **Auto Update:** Khi user đọc chương mới, tự động cập nhật `chapter_id` và `last_page`
3. **Last Page:** `last_page` có thể null nếu user chưa đọc trang nào, hoặc số trang cuối cùng đã đọc
4. **Updated At:** `updated_at` tự động cập nhật mỗi lần gọi API update/create
5. **Hard Delete:** Xóa lịch sử sẽ xóa hoàn toàn record khỏi database (không phải soft delete)
6. **Sorting:** Lịch sử được sắp xếp theo `updated_at` DESC (mới nhất trước)
7. **User Context:** `user_id` tự động lấy từ token, không cần gửi từ FE
8. **Auto Sync:** Khi user đọc chương, nên tự động gọi API này để cập nhật lịch sử

---

## Use Cases

### 1. Cập nhật lịch sử khi user đọc chương

```javascript
// Khi user mở chương hoặc chuyển trang
const updateReadingHistory = async (comicId, chapterId, pageNumber) => {
  await fetch('/api/user/reading-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      comic_id: comicId,
      chapter_id: chapterId,
      last_page: pageNumber
    })
  });
};
```

### 2. Hiển thị danh sách truyện đã đọc

```javascript
// Lấy tất cả lịch sử đọc của user
const getMyReadingHistory = async () => {
  const response = await fetch('/api/user/reading-history', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  return data; // Array of reading histories with comic and chapter info
};
```

### 3. Lấy vị trí đọc cuối cùng của truyện

```javascript
// Lấy vị trí đọc cuối cùng của một truyện cụ thể
const getLastReadPosition = async (comicId) => {
  const history = await getMyReadingHistory();
  const comicHistory = history.find(h => h.comic_id === comicId);
  if (comicHistory) {
    return {
      chapterId: comicHistory.chapter_id,
      pageNumber: comicHistory.last_page || 1
    };
  }
  return null; // Chưa đọc truyện này
};
```

### 4. Xóa lịch sử đọc

```javascript
// Xóa lịch sử đọc của một truyện
const deleteReadingHistory = async (comicId) => {
  // Tìm ID của reading history
  const history = await getMyReadingHistory();
  const comicHistory = history.find(h => h.comic_id === comicId);
  
  if (comicHistory) {
    await fetch(`/api/user/reading-history/${comicHistory.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};
```

### 5. Điều hướng đến vị trí đọc cuối cùng

```javascript
// Khi user click vào truyện trong lịch sử, điều hướng đến vị trí đọc cuối cùng
const navigateToLastRead = async (comicId) => {
  const position = await getLastReadPosition(comicId);
  if (position) {
    const comic = await getComicById(comicId);
    // Navigate to: /comics/{comic.slug}/chapters/{position.chapterId}?page={position.pageNumber}
    window.location.href = `/comics/${comic.slug}/chapters/${position.chapterId}?page=${position.pageNumber}`;
  } else {
    // Chưa đọc, điều hướng đến chương đầu tiên
    window.location.href = `/comics/${comic.slug}`;
  }
};
```

---

## Tích hợp với Public Chapters API

Khi user đọc chương qua Public Chapters API, nên tự động cập nhật reading history:

```javascript
// Flow đọc truyện
const readChapter = async (chapterId) => {
  // 1. Lấy thông tin chương
  const chapter = await fetch(`/api/public/chapters/${chapterId}`);
  
  // 2. Track view
  await fetch(`/api/public/chapters/${chapterId}/view`, { method: 'POST' });
  
  // 3. Cập nhật reading history (khi user bắt đầu đọc)
  await updateReadingHistory(chapter.comic_id, chapterId, 1);
  
  // 4. Khi user chuyển trang, cập nhật lại
  const onPageChange = (pageNumber) => {
    updateReadingHistory(chapter.comic_id, chapterId, pageNumber);
  };
};
```


