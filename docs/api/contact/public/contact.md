# Public Contacts API

API gửi liên hệ từ người dùng (không yêu cầu authentication).

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: **Không cần** (Public API)
- Headers: `Content-Type: application/json`

---

## Enums (Các giá trị liệt kê)

### ContactStatus (Trạng thái liên hệ)

**Lưu ý:** Enum này được dùng trong response, không cần gửi trong request (API tự động set `pending`).

**Enum Values:**

| Value | Label (Tiếng Việt) | Mô tả |
|-------|-------------------|-------|
| `pending` | Chờ xử lý | Trạng thái mặc định khi contact được tạo mới |
| `read` | Đã đọc | Contact đã được admin đọc |
| `replied` | Đã trả lời | Contact đã được admin phản hồi |
| `closed` | Đã đóng | Contact đã được đóng |

**TypeScript Definition:**
```typescript
enum ContactStatus {
  Pending = 'pending',
  Read = 'read',
  Replied = 'replied',
  Closed = 'closed',
}
```

**JavaScript/Object Usage:**
```javascript
const ContactStatus = {
  Pending: 'pending',
  Read: 'read',
  Replied: 'replied',
  Closed: 'closed',
};
```

---

## 1. Create Contact (Gửi liên hệ)

### Request

```bash
curl -X POST http://localhost:3000/api/public/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "subject": "Câu hỏi về sản phẩm",
    "message": "Tôi muốn biết thêm thông tin về sản phẩm này. Có thể tư vấn cho tôi không?"
  }'
```

### Request Body

```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0901234567",
  "subject": "Câu hỏi về sản phẩm",
  "message": "Tôi muốn biết thêm thông tin về sản phẩm này. Có thể tư vấn cho tôi không?"
}
```

**Fields:**

| Field | Type | Required | Mô tả | Validation | Ghi chú |
|-------|------|----------|-------|------------|---------|
| `name` | string | ✅ | Tên người liên hệ | Max 255 ký tự | **Bắt buộc từ form** |
| `email` | string | ✅ | Email người liên hệ | Email format, max 255 ký tự | **Bắt buộc từ form** |
| `phone` | string | ❌ | Số điện thoại | Max 20 ký tự | Tùy chọn, có thể để trống |
| `subject` | string | ❌ | Tiêu đề liên hệ | Max 255 ký tự | Tùy chọn, có thể để trống |
| `message` | string | ✅ | Nội dung tin nhắn | Required | **Bắt buộc từ form** |

**Fields tự động tạo bởi API (KHÔNG cần gửi):**
- ❌ `id` - ID tự động tăng
- ❌ `status` - Tự động set thành `pending`
- ❌ `reply`, `replied_at`, `replied_by` - Tự động set null (chỉ admin mới set khi reply)
- ❌ `created_user_id` - Tự động set null (vì là public contact)
- ❌ `updated_user_id` - Tự động set null
- ❌ `created_at` - Timestamp tự động
- ❌ `updated_at` - Timestamp tự động
- ❌ `deleted_at` - Tự động set null

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

### Response Fields (Các trường trong response)

| Field | Type | Mô tả | Từ đâu? |
|-------|------|-------|---------|
| `id` | number | ID liên hệ | ✅ API tự động tạo |
| `name` | string | Tên người liên hệ | ❌ Từ form input |
| `email` | string | Email người liên hệ | ❌ Từ form input |
| `phone` | string \| null | Số điện thoại | ❌ Từ form input (tùy chọn) |
| `subject` | string \| null | Tiêu đề liên hệ | ❌ Từ form input (tùy chọn) |
| `message` | string | Nội dung tin nhắn | ❌ Từ form textarea |
| `status` | enum | Trạng thái (mặc định: `pending`) - Xem [ContactStatus Enum](#contactstatus-trạng-thái-liên-hệ) | ✅ API tự động set |
| `reply` | string \| null | Phản hồi từ admin | ✅ Admin set qua Admin API |
| `replied_at` | string \| null | Thời gian phản hồi | ✅ Admin set khi reply |
| `replied_by` | number \| null | ID admin đã phản hồi | ✅ Admin set khi reply |
| `created_user_id` | null | ID người tạo (luôn null cho public) | ✅ API tự động set null |
| `updated_user_id` | null | ID người cập nhật (luôn null cho public) | ✅ API tự động set null |
| `created_at` | string | Thời gian tạo (ISO 8601) | ✅ API tự động tạo |
| `updated_at` | string | Thời gian cập nhật (ISO 8601) | ✅ API tự động tạo |
| `deleted_at` | null | Thời gian xóa (luôn null ban đầu) | ✅ API tự động set null |

---

## Error Responses

### 400 Bad Request (Validation Error)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be an email"
    },
    {
      "field": "name",
      "message": "name should not be empty"
    }
  ],
  "code": "VALIDATION_ERROR",
  "httpStatus": 400
}
```

**Các lỗi validation thường gặp:**
- `name` không được để trống
- `email` phải đúng định dạng email
- `email` không được để trống
- `message` không được để trống
- `phone` tối đa 20 ký tự
- `subject` tối đa 255 ký tự

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR",
  "httpStatus": 500
}
```

---

## 📝 Frontend Integration Guide

### Form Liên Hệ HTML/React

```jsx
import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/public/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setError(result.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div className="alert alert-success">
          Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div>
        <label>
          Họ và tên <span style={{color: 'red'}}>*</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={255}
          />
        </label>
      </div>

      <div>
        <label>
          Email <span style={{color: 'red'}}>*</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            maxLength={255}
          />
        </label>
      </div>

      <div>
        <label>
          Số điện thoại (Tùy chọn)
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={20}
          />
        </label>
      </div>

      <div>
        <label>
          Tiêu đề (Tùy chọn)
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength={255}
          />
        </label>
      </div>

      <div>
        <label>
          Nội dung tin nhắn <span style={{color: 'red'}}>*</span>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
          />
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
      </button>
    </form>
  );
}
```

### Form Validation (Client-side)

```javascript
const validateForm = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Vui lòng nhập họ và tên';
  }
  if (data.name && data.name.length > 255) {
    errors.name = 'Tên không được quá 255 ký tự';
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email không hợp lệ';
  }
  if (data.email && data.email.length > 255) {
    errors.email = 'Email không được quá 255 ký tự';
  }

  if (data.phone && data.phone.length > 20) {
    errors.phone = 'Số điện thoại không được quá 20 ký tự';
  }

  if (data.subject && data.subject.length > 255) {
    errors.subject = 'Tiêu đề không được quá 255 ký tự';
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.message = 'Vui lòng nhập nội dung tin nhắn';
  }

  return errors;
};
```

### Vue.js Example

```vue
<template>
  <form @submit.prevent="submitContact">
    <div>
      <label>
        Họ và tên <span style="color: red">*</span>
        <input v-model="form.name" required maxlength="255" />
      </label>
    </div>

    <div>
      <label>
        Email <span style="color: red">*</span>
        <input v-model="form.email" type="email" required maxlength="255" />
      </label>
    </div>

    <div>
      <label>
        Số điện thoại (Tùy chọn)
        <input v-model="form.phone" type="tel" maxlength="20" />
      </label>
    </div>

    <div>
      <label>
        Tiêu đề (Tùy chọn)
        <input v-model="form.subject" maxlength="255" />
      </label>
    </div>

    <div>
      <label>
        Nội dung tin nhắn <span style="color: red">*</span>
        <textarea v-model="form.message" required rows="5"></textarea>
      </label>
    </div>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Đang gửi...' : 'Gửi liên hệ' }}
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      },
      loading: false
    };
  },
  methods: {
    async submitContact() {
      this.loading = true;
      try {
        const response = await fetch('/api/public/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        const result = await response.json();
        if (result.success) {
          alert('Cảm ơn bạn đã liên hệ!');
          // Reset form
          this.form = {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
          };
        }
      } catch (error) {
        alert('Có lỗi xảy ra');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

---

## 📋 Checklist cho Frontend Developer

### Form Fields (Các trường cần có trong form)

- [x] **Họ và tên** (`name`) - Required, text input, max 255
- [x] **Email** (`email`) - Required, email input, max 255
- [x] **Số điện thoại** (`phone`) - Optional, tel input, max 20
- [x] **Tiêu đề** (`subject`) - Optional, text input, max 255
- [x] **Nội dung** (`message`) - Required, textarea, no limit

### Không cần trong form (API tự động tạo)

- [ ] `id` - API tự động tạo
- [ ] `status` - API tự động set `pending`
- [ ] `reply`, `replied_at`, `replied_by` - Admin sẽ set sau
- [ ] `created_user_id`, `updated_user_id` - API tự động set null
- [ ] `created_at`, `updated_at` - API tự động tạo
- [ ] `deleted_at` - API tự động set null

### Validation

- [x] Validate `name` không được để trống
- [x] Validate `email` phải đúng format và không được để trống
- [x] Validate `message` không được để trống
- [x] Validate độ dài các trường (nếu có)
- [x] Hiển thị lỗi validation từ API response

### UX/UI Recommendations

- Hiển thị loading state khi đang gửi
- Hiển thị success message sau khi gửi thành công
- Reset form sau khi gửi thành công
- Hiển thị lỗi validation từ server
- Disable submit button khi đang loading
- Thêm reCAPTCHA (nếu cần chống spam)

---

## Lấy dữ liệu từ API khác

### Enum API - Lấy danh sách giá trị enum

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

**Lưu ý:** Enum này chủ yếu dùng để hiển thị status trong response, không cần dùng trong form tạo contact (API tự động set `pending`).

**Sử dụng:** Hiển thị trạng thái contact sau khi gửi thành công (nếu cần).

---

**Last Updated:** 2025-01-16  
**API Version:** v1.0.0

