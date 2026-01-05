# Contact Module API Documentation

Module quản lý liên hệ từ người dùng.

## 📂 Cấu trúc Module

```
src/modules/contact/
├── admin/              # Admin APIs
│   └── contact/
└── public/             # Public APIs
    └── contact/
```

---

## 🔐 Admin APIs

APIs dành cho quản trị viên - yêu cầu authentication và permissions.

### Contacts (Liên hệ)
- **GET** `/admin/contacts` - Danh sách liên hệ
- **GET** `/admin/contacts/:id` - Chi tiết liên hệ
- **POST** `/admin/contacts` - Tạo liên hệ mới
- **PUT** `/admin/contacts/:id` - Cập nhật liên hệ
- **DELETE** `/admin/contacts/:id` - Xóa liên hệ
- **PUT** `/admin/contacts/:id/reply` - Gửi phản hồi cho liên hệ
- **PUT** `/admin/contacts/:id/read` - Đánh dấu đã đọc
- **PUT** `/admin/contacts/:id/close` - Đóng liên hệ

📖 [Chi tiết Admin Contacts API](./admin/contact.md)

---

## 🌐 Public APIs

APIs công khai - không yêu cầu authentication.

### Contacts
- **POST** `/public/contacts` - Gửi liên hệ mới (form liên hệ)

📖 [Chi tiết Public Contacts API](./public/contact.md)

---

## 📊 Contact Status (Trạng thái liên hệ)

Contact có 4 trạng thái (enum `ContactStatus`):

| Value | Label (Tiếng Việt) | Mô tả |
|-------|-------------------|-------|
| `pending` | Chờ xử lý | Trạng thái mặc định khi contact được tạo mới |
| `read` | Đã đọc | Contact đã được admin đọc/xem |
| `replied` | Đã trả lời | Contact đã được admin phản hồi |
| `closed` | Đã đóng | Contact đã được đóng, không xử lý thêm |

**TypeScript/JavaScript Definition:**
```typescript
enum ContactStatus {
  Pending = 'pending',
  Read = 'read',
  Replied = 'replied',
  Closed = 'closed',
}

const ContactStatusLabels: Record<ContactStatus, string> = {
  [ContactStatus.Pending]: 'Chờ xử lý',
  [ContactStatus.Read]: 'Đã đọc',
  [ContactStatus.Replied]: 'Đã trả lời',
  [ContactStatus.Closed]: 'Đã đóng',
};
```

---

## 🔄 Workflow xử lý liên hệ

1. Người dùng gửi liên hệ → Status: `pending`
2. Admin đọc liên hệ → Status: `read` (tự động khi đọc)
3. Admin phản hồi → Status: `replied` (tự động khi reply)
4. Admin đóng → Status: `closed`

---

## 📝 Notes

- Tất cả các trường audit (`id`, `created_at`, `updated_at`, `created_user_id`, `updated_user_id`) được tự động tạo bởi hệ thống
- Khi reply, `replied_at` và `replied_by` được tự động set
- Contact không thể bị xóa vĩnh viễn (soft delete với `deleted_at`)

---

## 🔌 Enum API

Để lấy danh sách giá trị enum `ContactStatus` cho frontend:

```bash
# Lấy enum contact_status
GET /api/enums/contact_status

# Lấy tất cả enums (bao gồm contact_status)
GET /api/enums
```

**Response Example:**
```json
[
  {
    "id": "pending",
    "value": "pending",
    "name": "Chờ xử lý",
    "label": "Chờ xử lý"
  },
  {
    "id": "read",
    "value": "read",
    "name": "Đã đọc",
    "label": "Đã đọc"
  },
  {
    "id": "replied",
    "value": "replied",
    "name": "Đã trả lời",
    "label": "Đã trả lời"
  },
  {
    "id": "closed",
    "value": "closed",
    "name": "Đã đóng",
    "label": "Đã đóng"
  }
]
```

**Sử dụng:**
- Populate dropdown filter status trong admin
- Hiển thị badge status với label tiếng Việt
- Validation status values

---

**Last Updated:** 2025-01-16  
**API Version:** v1.0.0

