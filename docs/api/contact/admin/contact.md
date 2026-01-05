# Admin Contacts API

API quản lý liên hệ (contacts) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## Enums (Các giá trị liệt kê)

### ContactStatus (Trạng thái liên hệ)

Trạng thái của contact, dùng cho field `status`.

**Enum Values:**

| Value | Label (Tiếng Việt) | Mô tả |
|-------|-------------------|-------|
| `pending` | Chờ xử lý | Trạng thái mặc định khi contact được tạo mới, chưa được xử lý |
| `read` | Đã đọc | Contact đã được admin đọc/xem |
| `replied` | Đã trả lời | Contact đã được admin phản hồi |
| `closed` | Đã đóng | Contact đã được đóng, không xử lý thêm |

**TypeScript Definition:**
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

**JavaScript/Object Usage:**
```javascript
const ContactStatus = {
  Pending: 'pending',
  Read: 'read',
  Replied: 'replied',
  Closed: 'closed',
};

const ContactStatusLabels = {
  pending: 'Chờ xử lý',
  read: 'Đã đọc',
  replied: 'Đã trả lời',
  closed: 'Đã đóng',
};
```

**Ví dụ sử dụng trong Frontend:**
```javascript
// Filter contacts by status
const pendingContacts = contacts.filter(c => c.status === 'pending');

// Display status label
const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xử lý',
    read: 'Đã đọc',
    replied: 'Đã trả lời',
    closed: 'Đã đóng',
  };
  return labels[status] || status;
};

// Status badge colors
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',    // Chờ xử lý - màu cam
    read: 'blue',         // Đã đọc - màu xanh dương
    replied: 'green',     // Đã trả lời - màu xanh lá
    closed: 'gray',       // Đã đóng - màu xám
  };
  return colors[status] || 'default';
};
```

---

## 1. Get Contacts List (Lấy danh sách liên hệ)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/contacts?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `sortBy` (optional): Trường sắp xếp (ví dụ: `created_at`)
- `sortOrder` (optional): Thứ tự (`ASC` hoặc `DESC`, mặc định: `DESC`)
- `status` (optional): Lọc theo trạng thái (`pending`, `read`, `replied`, `closed`)
- `email` (optional): Lọc theo email (tìm kiếm)
- `name` (optional): Lọc theo tên (tìm kiếm)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "subject": "Câu hỏi về sản phẩm",
      "message": "Tôi muốn biết thêm thông tin về sản phẩm này. Có thể tư vấn cho tôi không?",
      "status": "pending",
      "reply": null,
      "replied_at": null,
      "replied_by": null,
      "created_user_id": null,
      "updated_user_id": null,
      "created_at": "2025-01-16T09:00:00.000Z",
      "updated_at": "2025-01-16T09:00:00.000Z",
      "deleted_at": null
    },
    {
      "id": 2,
      "name": "Trần Thị B",
      "email": "tranthib@example.com",
      "phone": "0909876543",
      "subject": "Yêu cầu hỗ trợ",
      "message": "Tôi gặp vấn đề với đơn hàng của mình.",
      "status": "replied",
      "reply": "Chúng tôi đã nhận được yêu cầu và sẽ xử lý sớm nhất.",
      "replied_at": "2025-01-16T10:00:00.000Z",
      "replied_by": 1,
      "created_user_id": null,
      "updated_user_id": 1,
      "created_at": "2025-01-16T08:00:00.000Z",
      "updated_at": "2025-01-16T10:00:00.000Z",
      "deleted_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Response Fields (Các trường trong response)

| Field | Type | Mô tả | Tự động tạo? |
|-------|------|-------|--------------|
| `id` | number | ID liên hệ | ✅ Tự động |
| `name` | string | Tên người liên hệ | ❌ |
| `email` | string | Email người liên hệ | ❌ |
| `phone` | string \| null | Số điện thoại (tùy chọn) | ❌ |
| `subject` | string \| null | Tiêu đề liên hệ (tùy chọn) | ❌ |
| `message` | string | Nội dung tin nhắn | ❌ |
| `status` | enum | Trạng thái: `pending`, `read`, `replied`, `closed` (xem [ContactStatus Enum](#contactstatus-trạng-thái-liên-hệ)) | ✅ Tự động (mặc định: `pending`) |
| `reply` | string \| null | Phản hồi từ admin | ✅ Tự động (khi reply) |
| `replied_at` | string \| null | Thời gian phản hồi (ISO 8601) | ✅ Tự động (khi reply) |
| `replied_by` | number \| null | ID admin đã phản hồi | ✅ Tự động (từ JWT token) |
| `created_user_id` | number \| null | ID người tạo (thường null cho public contact) | ✅ Tự động |
| `updated_user_id` | number \| null | ID người cập nhật cuối | ✅ Tự động |
| `created_at` | string | Thời gian tạo (ISO 8601) | ✅ Tự động |
| `updated_at` | string | Thời gian cập nhật (ISO 8601) | ✅ Tự động |
| `deleted_at` | string \| null | Thời gian xóa (soft delete) | ✅ Tự động |

---

## 2. Get Contact by ID (Lấy thông tin liên hệ)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/contacts/1 \
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
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "subject": "Câu hỏi về sản phẩm",
    "message": "Tôi muốn biết thêm thông tin về sản phẩm này. Có thể tư vấn cho tôi không?",
    "status": "pending",
    "reply": null,
    "replied_at": null,
    "replied_by": null,
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2025-01-16T09:00:00.000Z",
    "updated_at": "2025-01-16T09:00:00.000Z",
    "deleted_at": null
  },
  "message": "Thành công"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Contact not found",
  "code": "NOT_FOUND",
  "httpStatus": 404
}
```

---

## 3. Create Contact (Tạo liên hệ mới - Admin)

> **Lưu ý:** API này chủ yếu dùng cho admin tạo liên hệ thủ công. Người dùng thông thường nên dùng Public API (`POST /public/contacts`).

### Request

```bash
curl -X POST http://localhost:3000/api/admin/contacts \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "subject": "Câu hỏi về sản phẩm",
    "message": "Tôi muốn biết thêm thông tin về sản phẩm này."
  }'
```

### Request Body

```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0901234567",
  "subject": "Câu hỏi về sản phẩm",
  "message": "Tôi muốn biết thêm thông tin về sản phẩm này."
}
```

**Fields:**

| Field | Type | Required | Mô tả | Validation |
|-------|------|----------|-------|------------|
| `name` | string | ✅ | Tên người liên hệ | Max 255 ký tự |
| `email` | string | ✅ | Email người liên hệ | Email format, max 255 ký tự |
| `phone` | string | ❌ | Số điện thoại | Max 20 ký tự |
| `subject` | string | ❌ | Tiêu đề liên hệ | Max 255 ký tự |
| `message` | string | ✅ | Nội dung tin nhắn | Required |

**Fields tự động tạo (không cần gửi):**
- `id` - ID tự động tăng
- `status` - Mặc định: `pending`
- `reply`, `replied_at`, `replied_by` - Null ban đầu
- `created_user_id`, `updated_user_id` - Từ JWT token
- `created_at`, `updated_at` - Timestamp tự động
- `deleted_at` - Null ban đầu

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "subject": "Câu hỏi về sản phẩm",
    "message": "Tôi muốn biết thêm thông tin về sản phẩm này.",
    "status": "pending",
    "reply": null,
    "replied_at": null,
    "replied_by": null,
    "created_user_id": 1,
    "updated_user_id": 1,
    "created_at": "2025-01-16T09:00:00.000Z",
    "updated_at": "2025-01-16T09:00:00.000Z",
    "deleted_at": null
  },
  "message": "Thành công"
}
```

---

## 4. Update Contact (Cập nhật liên hệ)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/contacts/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A (Updated)",
    "status": "read"
  }'
```

### Request Body

```json
{
  "name": "Nguyễn Văn A (Updated)",
  "email": "newemail@example.com",
  "phone": "0909999999",
  "subject": "Tiêu đề mới",
  "message": "Nội dung mới",
  "status": "read",
  "reply": "Phản hồi từ admin"
}
```

**Fields (tất cả optional, chỉ gửi các trường cần cập nhật):**

| Field | Type | Mô tả | Validation |
|-------|------|-------|------------|
| `name` | string | Tên người liên hệ | Max 255 ký tự |
| `email` | string | Email người liên hệ | Email format, max 255 ký tự |
| `phone` | string | Số điện thoại | Max 20 ký tự |
| `subject` | string | Tiêu đề liên hệ | Max 255 ký tự |
| `message` | string | Nội dung tin nhắn | - |
| `status` | enum | Trạng thái: `pending`, `read`, `replied`, `closed` (xem [ContactStatus Enum](#contactstatus-trạng-thái-liên-hệ)) | - |
| `reply` | string | Phản hồi từ admin | - |
| `replied_at` | string | Thời gian phản hồi (ISO 8601) | Date format |
| `replied_by` | number | ID admin đã phản hồi | - |

**Lưu ý:**
- Các trường audit (`created_user_id`, `updated_user_id`, `created_at`, `updated_at`) được tự động cập nhật bởi hệ thống
- `updated_user_id` sẽ được set từ JWT token của admin đang cập nhật

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A (Updated)",
    "email": "newemail@example.com",
    "phone": "0909999999",
    "subject": "Tiêu đề mới",
    "message": "Nội dung mới",
    "status": "read",
    "reply": "Phản hồi từ admin",
    "replied_at": null,
    "replied_by": null,
    "created_user_id": null,
    "updated_user_id": 1,
    "created_at": "2025-01-16T09:00:00.000Z",
    "updated_at": "2025-01-16T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Thành công"
}
```

---

## 5. Reply to Contact (Phản hồi liên hệ)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/contacts/1/reply \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "reply": "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể."
  }'
```

### Request Body

```json
{
  "reply": "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể."
}
```

**Fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `reply` | string | ✅ | Nội dung phản hồi |

**Fields tự động cập nhật:**
- `status` → Tự động đổi thành `replied`
- `replied_at` → Tự động set thời gian hiện tại
- `replied_by` → Tự động set từ JWT token (ID admin đang reply)
- `updated_at` → Tự động cập nhật
- `updated_user_id` → Tự động set từ JWT token

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "subject": "Câu hỏi về sản phẩm",
    "message": "Tôi muốn biết thêm thông tin về sản phẩm này.",
    "status": "replied",
    "reply": "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
    "replied_at": "2025-01-16T10:30:00.000Z",
    "replied_by": 1,
    "created_user_id": null,
    "updated_user_id": 1,
    "created_at": "2025-01-16T09:00:00.000Z",
    "updated_at": "2025-01-16T10:30:00.000Z",
    "deleted_at": null
  },
  "message": "Thành công"
}
```

---

## 6. Mark Contact as Read (Đánh dấu đã đọc)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/contacts/1/read \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Request Body

Không cần body.

**Hành vi:**
- Nếu contact đang ở trạng thái `pending`, sẽ tự động đổi thành `read`
- Nếu đã là `read`, `replied`, hoặc `closed`, giữ nguyên trạng thái

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "status": "read",
    ...
  },
  "message": "Thành công"
}
```

---

## 7. Close Contact (Đóng liên hệ)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/contacts/1/close \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Request Body

Không cần body.

**Hành vi:**
- Đổi status thành `closed`
- `updated_at` và `updated_user_id` được tự động cập nhật

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "status": "closed",
    ...
  },
  "message": "Thành công"
}
```

---

## 8. Delete Contact (Xóa liên hệ)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/contacts/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Request Body

Không cần body.

**Lưu ý:** Xóa mềm (soft delete). Contact không bị xóa vĩnh viễn, chỉ set `deleted_at`. Có thể khôi phục bằng cách update `deleted_at = null`.

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be an email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED",
  "httpStatus": 401
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Contact not found",
  "code": "NOT_FOUND",
  "httpStatus": 404
}
```

---

## Lấy dữ liệu từ API khác

### 1. Enum API - Lấy danh sách giá trị enum

#### Lấy enum contact_status
```bash
GET /api/enums/contact_status
```

**Response:**
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

#### Lấy tất cả enums
```bash
GET /api/enums
```

**Response:** Trả về object chứa tất cả các enum, trong đó có `contact_status`.

**Sử dụng:** Lấy enum values để populate dropdowns, select boxes trong form filter hoặc status select.

**Ví dụ Frontend:**
```javascript
// Lấy enum contact_status
const response = await fetch('/api/enums/contact_status');
const statusOptions = await response.json();
// [
//   { id: 'pending', value: 'pending', name: 'Chờ xử lý', label: 'Chờ xử lý' },
//   { id: 'read', value: 'read', name: 'Đã đọc', label: 'Đã đọc' },
//   ...
// ]

// Sử dụng trong dropdown filter
<Select>
  <option value="">Tất cả</option>
  {statusOptions.map(status => (
    <option key={status.value} value={status.value}>
      {status.label}
    </option>
  ))}
</Select>
```

**Các enum key có sẵn:**
- `contact_status` - Trạng thái liên hệ (pending, read, replied, closed)
- `basic_status` - Trạng thái cơ bản (active/inactive)
- `post_status` - Trạng thái bài viết
- `product_status` - Trạng thái sản phẩm
- Và nhiều enum khác...

---

## 📝 Frontend Integration Notes

### Lấy danh sách contacts với filter

```javascript
// Lấy danh sách contacts chờ xử lý
const response = await fetch('/api/admin/contacts?status=pending&page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Hiển thị trạng thái

```javascript
const statusLabels = {
  pending: 'Chờ xử lý',
  read: 'Đã đọc',
  replied: 'Đã trả lời',
  closed: 'Đã đóng'
};

const statusColors = {
  pending: 'orange',
  read: 'blue',
  replied: 'green',
  closed: 'gray'
};
```

### Gửi phản hồi

```javascript
const replyToContact = async (contactId, replyMessage) => {
  const response = await fetch(`/api/admin/contacts/${contactId}/reply`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reply: replyMessage })
  });
  
  const result = await response.json();
  // Status sẽ tự động đổi thành 'replied'
  // replied_at và replied_by sẽ tự động được set
  return result;
};
```

---

**Last Updated:** 2025-01-16  
**API Version:** v1.0.0

