# Public Comics API - Xem Danh sách Truyện Tranh

API công khai để xem danh sách và chi tiết truyện tranh. Không yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/comics`
- Authentication: **Không yêu cầu** (Public endpoints)
- Headers: `Content-Type: application/json`

---

## 1. Get Comics List (Lấy danh sách truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/comics?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `search` (optional): Tìm kiếm theo tên truyện
- `filters[status]` (optional): Lọc theo trạng thái (chỉ `published`, `completed` được hiển thị)
- `filters[author]` (optional): Lọc theo tác giả
- `filters[category_slug]` (optional): Lọc theo slug danh mục
- `sort` (optional): Sắp xếp (mặc định: `created_at:DESC`)

### Ví dụ với filters

```bash
# Lấy truyện theo danh mục
curl -X GET "http://localhost:3000/api/public/comics?filters[category_slug]=hanh-dong&page=1&limit=10" \
  -H "Content-Type: application/json"

# Tìm kiếm truyện
curl -X GET "http://localhost:3000/api/public/comics?search=naruto&page=1&limit=10" \
  -H "Content-Type: application/json"

# Lọc theo tác giả
curl -X GET "http://localhost:3000/api/public/comics?filters[author]=Tác giả A&page=1&limit=10" \
  -H "Content-Type: application/json"

# Sắp xếp theo view count
curl -X GET "http://localhost:3000/api/public/comics?sort=view_count:DESC&page=1&limit=10" \
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
      "slug": "truyen-tranh-mau",
      "title": "Truyện Tranh Mẫu",
      "description": "Mô tả truyện...",
      "cover_image": "https://example.com/cover.jpg",
      "author": "Tác giả",
      "status": "published",
      "created_at": "2025-01-11T05:00:00.000Z",
      "categories": [
        {
          "id": 1,
          "name": "Hành động",
          "slug": "hanh-dong"
        }
      ],
      "stats": {
        "view_count": 1000,
        "follow_count": 50,
        "review_count": 20,
        "average_rating": 4.5,
        "chapter_count": 10
      }
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

## 2. Get Trending Comics (Lấy truyện đang hot)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/comics/trending?limit=20" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `limit` (optional): Số lượng truyện (mặc định: 20)

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
      "cover_image": "https://example.com/cover.jpg",
      "author": "Tác giả",
      "stats": {
        "view_count": 10000,
        "follow_count": 500
      }
    }
  ]
}
```

**Lưu ý:** Truyện trending được tính dựa trên lượt xem và tương tác trong thời gian gần đây.

---

## 3. Get Popular Comics (Lấy truyện phổ biến)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/comics/popular?limit=20" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `limit` (optional): Số lượng truyện (mặc định: 20)

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
      "cover_image": "https://example.com/cover.jpg",
      "author": "Tác giả",
      "stats": {
        "view_count": 50000,
        "follow_count": 2000,
        "average_rating": 4.8
      }
    }
  ]
}
```

**Lưu ý:** Truyện popular được tính dựa trên tổng lượt xem, lượt follow và đánh giá.

---

## 4. Get Newest Comics (Lấy truyện mới nhất)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/comics/newest?limit=20" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `limit` (optional): Số lượng truyện (mặc định: 20)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "truyen-tranh-moi",
      "title": "Truyện Tranh Mới",
      "cover_image": "https://example.com/cover.jpg",
      "author": "Tác giả",
      "created_at": "2025-01-11T05:00:00.000Z"
    }
  ]
}
```

**Lưu ý:** Truyện mới nhất được sắp xếp theo `created_at` DESC.

---

## 5. Get Comic by Slug (Lấy chi tiết truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/comics/truyen-tranh-mau" \
  -H "Content-Type: application/json"
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
    "description": "Mô tả đầy đủ của truyện...",
    "cover_image": "https://example.com/cover.jpg",
    "author": "Tác giả",
    "status": "published",
    "created_at": "2025-01-11T05:00:00.000Z",
    "categories": [
      {
        "id": 1,
        "name": "Hành động",
        "slug": "hanh-dong"
      }
    ],
    "stats": {
      "view_count": 10000,
      "follow_count": 500,
      "review_count": 20,
      "average_rating": 4.5,
      "chapter_count": 10
    },
    "chapters": [
      {
        "id": 1,
        "title": "Chương 1: Bắt đầu",
        "chapter_index": 1,
        "chapter_label": "Chapter 1",
        "view_count": 1000,
        "created_at": "2025-01-11T05:00:00.000Z"
      }
    ]
  }
}
```

---

## 6. Get Chapters by Comic Slug (Lấy danh sách chương của truyện)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/comics/truyen-tranh-mau/chapters" \
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
      "title": "Chương 1: Bắt đầu",
      "chapter_index": 1,
      "chapter_label": "Chapter 1",
      "view_count": 1000,
      "created_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Chương 2: Tiếp tục",
      "chapter_index": 2,
      "chapter_label": "Chapter 2",
      "view_count": 800,
      "created_at": "2025-01-12T05:00:00.000Z"
    }
  ]
}
```

**Lưu ý:** Chỉ trả về các chương có status `published`.

---

## Lỗi thường gặp

### 404 Not Found
```json
{
  "success": false,
  "message": "Truyện không tồn tại"
}
```
**Giải pháp:** Kiểm tra slug truyện

### 404 Not Found - Hidden Comic
```json
{
  "success": false,
  "message": "Truyện không tồn tại hoặc đã bị ẩn"
}
```
**Giải pháp:** Chỉ truyện có status `published` hoặc `completed` mới hiển thị công khai

---

## Ghi chú tích hợp

1. **Public Status:** Chỉ truyện có status `published` hoặc `completed` mới hiển thị trong public API
2. **Slug-based:** Public API sử dụng `slug` thay vì `id` để thân thiện với SEO
3. **Stats:** Thống kê (view_count, follow_count, etc.) được tính tự động và cập nhật real-time
4. **Categories:** Mỗi truyện có thể thuộc nhiều danh mục
5. **Chapters:** Chỉ hiển thị các chương có status `published`
6. **Pagination:** Tất cả danh sách đều hỗ trợ phân trang
7. **Search:** Hỗ trợ tìm kiếm theo tên truyện
8. **Sorting:** Có thể sắp xếp theo nhiều tiêu chí (created_at, view_count, etc.)


