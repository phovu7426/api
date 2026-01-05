# User Notifications API

API quản lý thông báo của người dùng (user notifications).

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get My Notifications (Lấy danh sách thông báo của tôi)

### Request

```bash
curl -X GET "http://localhost:3000/api/user/notifications?page=1&limit=10" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `is_read` (optional): Lọc theo trạng thái đọc (true/false)
- `type` (optional): Lọc theo loại thông báo

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "order",
      "title": "Đơn hàng đã được xác nhận",
      "message": "Đơn hàng #ORD-2025-001 đã được xác nhận và đang chuẩn bị giao",
      "data": {
        "order_id": 12345,
        "order_code": "ORD-2025-001",
        "status": "confirmed"
      },
      "is_read": false,
      "read_at": null,
      "created_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "type": "promotion",
      "title": "Khuyến mãi đặc biệt",
      "message": "Giảm giá 50% tất cả sản phẩm điện thoại",
      "data": {
        "promotion_id": 123,
        "discount": 50,
        "category": "phones"
      },
      "is_read": true,
      "read_at": "2025-01-11T06:00:00.000Z",
      "created_at": "2025-01-11T04:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "unreadCount": 5
  }
}
```

---

## 2. Get Notification by ID (Lấy thông tin thông báo)

### Request

```bash
curl -X GET http://localhost:3000/api/user/notifications/1 \
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
    "type": "order",
    "title": "Đơn hàng đã được xác nhận",
    "message": "Đơn hàng #ORD-2025-001 đã được xác nhận và đang chuẩn bị giao",
    "data": {
      "order_id": 12345,
      "order_code": "ORD-2025-001",
      "status": "confirmed"
    },
    "is_read": false,
    "read_at": null,
    "created_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Mark Notification as Read (Đánh dấu đã đọc)

### Request

```bash
curl -X PATCH http://localhost:3000/api/user/notifications/1/read \
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
    "read_at": "2025-01-11T06:10:00.000Z"
  },
  "message": "Đánh dấu đã đọc thành công"
}
```

---

## 4. Mark All as Read (Đánh dấu tất cả đã đọc)

### Request

```bash
curl -X PATCH http://localhost:3000/api/user/notifications/read-all \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "updated": 5
  },
  "message": "Đã đánh dấu tất cả thông báo là đã đọc"
}
```

---

## 5. Delete Notification (Xóa thông báo)

### Request

```bash
curl -X DELETE http://localhost:3000/api/user/notifications/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa thông báo thành công"
}
```

---

## 6. Delete All Read Notifications (Xóa tất cả thông báo đã đọc)

### Request

```bash
curl -X DELETE http://localhost:3000/api/user/notifications/read \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "deleted": 10
  },
  "message": "Đã xóa tất cả thông báo đã đọc"
}
```

---

## 7. Get Unread Count (Lấy số thông báo chưa đọc)

### Request

```bash
curl -X GET http://localhost:3000/api/user/notifications/unread-count \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  },
  "message": "Thành công"
}
```

---

## Notification Types

Các loại thông báo người dùng nhận được:

- `order`: Đơn hàng
  - Đơn hàng mới được tạo
  - Đơn hàng được xác nhận
  - Đơn hàng đang giao
  - Đơn hàng đã giao thành công
  - Đơn hàng bị hủy

- `payment`: Thanh toán
  - Thanh toán thành công
  - Thanh toán thất bại
  - Hoàn tiền

- `promotion`: Khuyến mãi
  - Khuyến mãi mới
  - Mã giảm giá
  - Flash sale

- `review`: Đánh giá
  - Phản hồi đánh giá
  - Đánh giá được duyệt

- `account`: Tài khoản
  - Thay đổi mật khẩu
  - Cập nhật thông tin
  - Xác minh email/số điện thoại

- `system`: Hệ thống
  - Bảo trì hệ thống
  - Cập nhật tính năng mới

---

## Notification Data Structure

Mỗi loại thông báo có cấu trúc data riêng:

### Order Notification
```json
{
  "type": "order",
  "data": {
    "order_id": 12345,
    "order_code": "ORD-2025-001",
    "status": "confirmed",
    "tracking_number": "TRACK123456"
  }
}
```

### Payment Notification
```json
{
  "type": "payment",
  "data": {
    "payment_id": 789,
    "order_code": "ORD-2025-001",
    "amount": 1000000,
    "status": "success",
    "method": "vnpay"
  }
}
```

### Promotion Notification
```json
{
  "type": "promotion",
  "data": {
    "promotion_id": 123,
    "discount": 50,
    "discount_type": "percentage",
    "coupon_code": "SALE50",
    "valid_until": "2025-01-20T23:59:59.000Z"
  }
}
```

---

## Real-time Updates

Thông báo hỗ trợ real-time updates qua WebSocket:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000/api', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Listen for new notifications
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});

// Listen for notification updates
socket.on('notification:update', (notification) => {
  console.log('Notification updated:', notification);
});
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 403 | Forbidden - Not your notification |
| 404 | Not Found - Notification not found |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Admin Notifications API](./../admin/notification.md)