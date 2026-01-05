# Notification Module API Documentation

Module quản lý thông báo hệ thống.

## 📂 Cấu trúc Module

```
src/modules/notification/
├── admin/              # Admin APIs
│   └── notification/
└── user/               # User APIs
    └── notification/
```

---

## 🔐 Admin APIs

APIs dành cho quản trị viên - yêu cầu authentication và permissions.

### Notifications
- **GET** `/admin/notifications` - Danh sách thông báo
- **GET** `/admin/notifications/:id` - Chi tiết thông báo
- **POST** `/admin/notifications` - Tạo thông báo
- **PUT** `/admin/notifications/:id` - Cập nhật thông báo
- **DELETE** `/admin/notifications/:id` - Xóa thông báo
- **POST** `/admin/notifications/broadcast` - Gửi thông báo hàng loạt
- **PATCH** `/admin/notifications/:id/read` - Đánh dấu đã đọc
- **PATCH** `/admin/notifications/read-all` - Đánh dấu tất cả đã đọc

📖 [Chi tiết Admin Notifications API](./admin/notification.md)

---

## 👤 User APIs

APIs dành cho người dùng đã đăng nhập.

### My Notifications
- **GET** `/user/notifications` - Danh sách thông báo của tôi
- **GET** `/user/notifications/:id` - Chi tiết thông báo
- **PATCH** `/user/notifications/:id/read` - Đánh dấu đã đọc
- **PATCH** `/user/notifications/read-all` - Đánh dấu tất cả đã đọc
- **DELETE** `/user/notifications/:id` - Xóa thông báo
- **DELETE** `/user/notifications/read` - Xóa tất cả đã đọc
- **GET** `/user/notifications/unread-count` - Số thông báo chưa đọc

📖 [Chi tiết User Notifications API](./user/notification.md)

---

## 📊 Data Model

```typescript
{
  id: number
  user_id: number
  type: string  // order, payment, system, promotion, review, message, account
  title: string
  message: string
  data?: {
    // Custom data tùy theo type
    [key: string]: any
  }
  is_read: boolean
  read_at?: Date
  created_at: Date
  updated_at: Date
}
```

---

## 🔔 Notification Types

### 1. Order Notifications (`order`)
Thông báo liên quan đến đơn hàng.

**Data Structure:**
```json
{
  "type": "order",
  "data": {
    "order_id": 123,
    "order_code": "ORD-2025-001",
    "status": "confirmed",
    "tracking_number": "TRACK123456"
  }
}
```

**Examples:**
- Đơn hàng mới được tạo
- Đơn hàng được xác nhận
- Đơn hàng đang giao
- Đơn hàng đã giao thành công
- Đơn hàng bị hủy

---

### 2. Payment Notifications (`payment`)
Thông báo liên quan đến thanh toán.

**Data Structure:**
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

**Examples:**
- Thanh toán thành công
- Thanh toán thất bại
- Hoàn tiền

---

### 3. System Notifications (`system`)
Thông báo hệ thống.

**Examples:**
- Bảo trì hệ thống
- Cập nhật tính năng mới
- Thay đổi chính sách

---

### 4. Promotion Notifications (`promotion`)
Thông báo khuyến mãi.

**Data Structure:**
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

**Examples:**
- Khuyến mãi mới
- Mã giảm giá
- Flash sale

---

### 5. Review Notifications (`review`)
Thông báo về đánh giá.

**Examples:**
- Phản hồi đánh giá
- Đánh giá được duyệt

---

### 6. Account Notifications (`account`)
Thông báo về tài khoản.

**Examples:**
- Thay đổi mật khẩu
- Cập nhật thông tin
- Xác minh email

---

## 🔄 Notification Flow

### Admin Send Notification
```
1. Admin tạo thông báo
   POST /admin/notifications
   ↓
2. Hệ thống lưu thông báo
   ↓
3. Push notification (optional)
   ↓
4. User nhận thông báo
```

### Broadcast Notification
```
1. Admin gửi broadcast
   POST /admin/notifications/broadcast
   {
     "user_ids": [1, 2, 3] hoặc "all",
     "type": "promotion",
     "title": "...",
     "message": "..."
   }
   ↓
2. Hệ thống tạo notification cho từng user
   ↓
3. Push to all users
```

### User Read Notification
```
1. User xem notification
   GET /user/notifications
   ↓
2. Click vào notification
   ↓
3. Mark as read
   PATCH /user/notifications/:id/read
   ↓
4. Update unread count
```

---

## ✨ Features

- ✅ Multiple notification types
- ✅ Custom data per type
- ✅ Read/Unread status
- ✅ Broadcast to multiple users
- ✅ Unread count
- ✅ Bulk mark as read
- ✅ Auto-delete old notifications
- ✅ Real-time updates (WebSocket)

---

## 🔌 Real-time Updates

Notifications hỗ trợ real-time qua WebSocket:

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
  // Update UI
  showNotification(notification);
  updateUnreadCount();
});

// Listen for notification updates
socket.on('notification:update', (notification) => {
  console.log('Notification updated:', notification);
});

// Listen for mark as read
socket.on('notification:read', (data) => {
  console.log('Notification read:', data.notificationId);
});
```

---

## 🎯 Use Cases

### Admin: Gửi thông báo đơn hàng mới
```bash
POST /admin/notifications
{
  "user_id": 5,
  "type": "order",
  "title": "Đơn hàng mới #ORD-2025-001",
  "message": "Đơn hàng của bạn đã được xác nhận",
  "data": {
    "order_id": 123,
    "order_code": "ORD-2025-001",
    "status": "confirmed"
  }
}
```

### Admin: Gửi broadcast khuyến mãi
```bash
POST /admin/notifications/broadcast
{
  "user_ids": "all",  // hoặc [1, 2, 3]
  "type": "promotion",
  "title": "Flash Sale 50%",
  "message": "Giảm giá 50% tất cả sản phẩm",
  "data": {
    "promotion_id": 123,
    "discount": 50,
    "coupon_code": "SALE50"
  }
}
```

### User: Lấy thông báo chưa đọc
```bash
GET /user/notifications?is_read=false&page=1&limit=10
```

### User: Đánh dấu tất cả đã đọc
```bash
PATCH /user/notifications/read-all
```

### User: Lấy số thông báo chưa đọc
```bash
GET /user/notifications/unread-count
```

---

## 📱 Push Notifications

Tích hợp với Firebase Cloud Messaging (FCM):

```typescript
// Server-side
async sendPushNotification(
  userId: number,
  notification: Notification
) {
  const userDevices = await getUserDevices(userId);
  
  for (const device of userDevices) {
    await fcm.send({
      token: device.fcm_token,
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: notification.data,
    });
  }
}
```

---

## 🧹 Auto Cleanup

Tự động xóa thông báo cũ:

```typescript
// Xóa thông báo đã đọc sau 30 ngày
// Xóa thông báo chưa đọc sau 90 ngày
// Chạy hàng ngày vào 2:00 AM
```

---

## 📝 Best Practices

1. **Group notifications** by type for better UX
2. **Limit notification frequency** to avoid spam
3. **Provide action buttons** in notifications when appropriate
4. **Use meaningful titles** and clear messages
5. **Include relevant data** for deep linking
6. **Auto-mark as read** when user views related content
7. **Provide bulk actions** for user convenience

---

**Xem thêm:**
- [Main API Documentation](../README.md)
- [E-commerce Module](../ecommerce/README.md)
- [User Management](../user-management/README.md)