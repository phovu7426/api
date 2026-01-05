# Admin Notifications API

API quản lý thông báo (notifications) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get Notifications List (Lấy danh sách thông báo)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/notifications?page=1&limit=10" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `sortBy` (optional): Trường sắp xếp
- `sortOrder` (optional): Thứ tự (`ASC` hoặc `DESC`)
- `filters` (optional): JSON filters (e.g., `{"is_read": false}`)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "type": "order",
      "title": "Đơn hàng mới",
      "message": "Bạn có đơn hàng mới #12345",
      "data": {
        "order_id": 12345,
        "order_code": "ORD-2025-001"
      },
      "is_read": false,
      "read_at": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 5,
      "type": "system",
      "title": "Cập nhật hệ thống",
      "message": "Hệ thống sẽ bảo trì vào 12h ngày 15/01/2025",
      "data": null,
      "is_read": true,
      "read_at": "2025-01-11T06:00:00.000Z",
      "created_at": "2025-01-11T04:00:00.000Z",
      "updated_at": "2025-01-11T06:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Notification by ID (Lấy thông tin thông báo)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/notifications/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 5,
    "type": "order",
    "title": "Đơn hàng mới",
    "message": "Bạn có đơn hàng mới #12345",
    "data": {
      "order_id": 12345,
      "order_code": "ORD-2025-001"
    },
    "is_read": false,
    "read_at": null,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Create Notification (Tạo thông báo)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/notifications \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "type": "system",
    "title": "Thông báo mới",
    "message": "Nội dung thông báo",
    "data": {
      "custom_field": "value"
    }
  }'
```

### Request Body

```json
{
  "user_id": 5,
  "type": "system",
  "title": "Thông báo mới",
  "message": "Nội dung thông báo",
  "data": {
    "custom_field": "value"
  }
}
```

**Fields:**
- `user_id` (required): ID người dùng nhận thông báo
- `type` (required): Loại thông báo (order, payment, system, promotion, etc.)
- `title` (required): Tiêu đề thông báo
- `message` (required): Nội dung thông báo
- `data` (optional): Dữ liệu JSON tùy chỉnh

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 46,
    "user_id": 5,
    "type": "system",
    "title": "Thông báo mới",
    "message": "Nội dung thông báo",
    "data": {
      "custom_field": "value"
    },
    "is_read": false,
    "read_at": null,
    "created_at": "2025-01-11T06:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 4. Update Notification (Cập nhật thông báo)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/notifications/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tiêu đề đã cập nhật",
    "message": "Nội dung đã cập nhật"
  }'
```

### Request Body

Tất cả fields đều optional.

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Tiêu đề đã cập nhật",
    "message": "Nội dung đã cập nhật",
    "updated_at": "2025-01-11T06:05:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

---

## 5. Delete Notification (Xóa thông báo)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/notifications/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa thành công"
}
```

---

## 6. Mark Notification as Read (Đánh dấu đã đọc)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/notifications/1/read \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_read": true,
    "read_at": "2025-01-11T06:10:00.000Z",
    "updated_at": "2025-01-11T06:10:00.000Z"
  },
  "message": "Đánh dấu đã đọc thành công"
}
```

---

## 7. Mark All as Read (Đánh dấu tất cả đã đọc)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/notifications/read-all \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Đã đánh dấu tất cả thông báo là đã đọc"
}
```

---

## 8. Broadcast Notification (Gửi thông báo hàng loạt)

Gửi thông báo cho nhiều người dùng cùng lúc.

### Request

```bash
curl -X POST http://localhost:3000/api/admin/notifications/broadcast \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": [1, 2, 3, 4, 5],
    "type": "promotion",
    "title": "Khuyến mãi đặc biệt",
    "message": "Giảm giá 50% tất cả sản phẩm",
    "data": {
      "promotion_id": 123,
      "discount": 50
    }
  }'
```

### Request Body

```json
{
  "user_ids": [1, 2, 3, 4, 5],
  "type": "promotion",
  "title": "Khuyến mãi đặc biệt",
  "message": "Giảm giá 50% tất cả sản phẩm",
  "data": {
    "promotion_id": 123,
    "discount": 50
  }
}
```

**Fields:**
- `user_ids` (required): Mảng ID người dùng (hoặc "all" để gửi cho tất cả)
- `type` (required): Loại thông báo
- `title` (required): Tiêu đề
- `message` (required): Nội dung
- `data` (optional): Dữ liệu tùy chỉnh

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "sent": 5,
    "failed": 0
  },
  "message": "Đã gửi thông báo thành công"
}
```

---

## Notification Types

Các loại thông báo:

- `order`: Đơn hàng (đơn hàng mới, cập nhật trạng thái)
- `payment`: Thanh toán (thanh toán thành công, thất bại)
- `system`: Hệ thống (bảo trì, cập nhật)
- `promotion`: Khuyến mãi
- `review`: Đánh giá (đánh giá mới)
- `message`: Tin nhắn
- `account`: Tài khoản (thay đổi thông tin)

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 404 | Not Found - Notification not found |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [User Notifications API](./../user/notification.md)