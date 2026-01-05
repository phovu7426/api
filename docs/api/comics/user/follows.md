# User Follows API - Theo dõi Truyện Tranh

API dành cho user để theo dõi (follow/unfollow) truyện tranh. Yêu cầu authentication và permission `comic.read`.

## Cấu trúc

- Base URL: `http://localhost:3000/api/user/follows`
- Authentication: **Yêu cầu** (Bearer Token)
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`

---

## 1. Get My Follows (Lấy danh sách truyện đang theo dõi)

### Request

```bash
curl -X GET "http://localhost:3000/api/user/follows" \
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
      "created_at": "2025-01-11T05:00:00.000Z",
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
          "review_count": 20,
          "average_rating": 4.5,
          "chapter_count": 10
        }
      }
    }
  ]
}
```

---

## 2. Follow Comic (Theo dõi truyện)

### Request

```bash
curl -X POST "http://localhost:3000/api/user/follows/comics/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200/201):**
```json
{
  "success": true,
  "message": "Theo dõi truyện thành công.",
  "data": {
    "id": 1,
    "user_id": 1,
    "comic_id": 1,
    "created_at": "2025-01-11T05:00:00.000Z",
    "comic": {
      "id": 1,
      "title": "Truyện Tranh Mẫu",
      "slug": "truyen-tranh-mau"
    }
  }
}
```

**Lưu ý:** 
- Nếu user chưa follow → Tạo mới (201)
- Nếu user đã follow → Trả về follow hiện có (200)
- Mỗi user chỉ có thể follow 1 truyện 1 lần (unique constraint)

---

## 3. Unfollow Comic (Bỏ theo dõi truyện)

### Request

```bash
curl -X DELETE "http://localhost:3000/api/user/follows/comics/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Bỏ theo dõi truyện thành công."
}
```

**Lưu ý:** Đây là hard delete, follow sẽ bị xóa hoàn toàn khỏi database (không phải soft delete).

---

## 4. Check Is Following (Kiểm tra đang theo dõi)

### Request

```bash
curl -X GET "http://localhost:3000/api/user/follows/comics/1/is-following" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "is_following": true
  }
}
```

**Nếu chưa follow:**
```json
{
  "success": true,
  "data": {
    "is_following": false
  }
}
```

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
  "message": "Truyện không tồn tại"
}
```
**Giải pháp:** Kiểm tra ID truyện

---

## Ghi chú tích hợp

1. **One Follow Per Comic:** Mỗi user chỉ có thể follow 1 truyện 1 lần (unique constraint: user_id + comic_id)
2. **Hard Delete:** Unfollow sẽ xóa hoàn toàn record khỏi database (không phải soft delete)
3. **Follow Count:** Số lượt follow tự động cập nhật vào `comic_stats.follow_count`
4. **Auto Sync:** Khi follow/unfollow, `comic_stats.follow_count` được cập nhật real-time
5. **Check Status:** Sử dụng endpoint `/user/follows/comics/:comicId/is-following` để kiểm tra trạng thái follow
6. **Idempotent:** Follow nhiều lần cùng một truyện sẽ không tạo duplicate, chỉ trả về follow hiện có
7. **User Context:** `user_id` tự động lấy từ token, không cần gửi từ FE
8. **No Rate Limit:** Không có rate limit cho follow/unfollow (user có thể follow/unfollow tự do)

---

## Use Cases

### 1. Hiển thị nút Follow/Unfollow

```javascript
// Kiểm tra trạng thái follow
const checkFollow = async (comicId) => {
  const response = await fetch(`/api/user/follows/comics/${comicId}/is-following`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  return data.is_following;
};

// Toggle follow
const toggleFollow = async (comicId, isFollowing) => {
  if (isFollowing) {
    await fetch(`/api/user/follows/comics/${comicId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } else {
    await fetch(`/api/user/follows/comics/${comicId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};
```

### 2. Hiển thị danh sách truyện đang follow

```javascript
const getMyFollows = async () => {
  const response = await fetch('/api/user/follows', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  return data; // Array of follows with comic info
};
```


