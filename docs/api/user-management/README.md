# User Management Module API Documentation

Module quản lý người dùng và thông tin cá nhân.

## 📂 Cấu trúc Module

```
src/modules/user-management/
├── admin/              # Admin APIs
│   └── user/
└── user/               # User APIs
    └── user/
```

---

## 🔐 Admin APIs

APIs dành cho quản trị viên - yêu cầu authentication và permissions.

### Users
- **GET** `/admin/users` - Danh sách người dùng
- **GET** `/admin/users/:id` - Chi tiết người dùng
- **POST** `/admin/users` - Tạo người dùng mới
- **PUT** `/admin/users/:id` - Cập nhật người dùng
- **DELETE** `/admin/users/:id` - Xóa người dùng
- **PATCH** `/admin/users/:id/status` - Cập nhật trạng thái
- **POST** `/admin/users/:id/reset-password` - Reset mật khẩu
- **GET** `/admin/users/:id/roles` - Vai trò của người dùng
- **GET** `/admin/users/:id/permissions` - Quyền của người dùng

📖 [Chi tiết Admin Users API](./admin/user.md)

---

## 👤 User APIs

APIs dành cho người dùng đã đăng nhập.

### Profile
- **GET** `/user/profile` - Thông tin cá nhân
- **PUT** `/user/profile` - Cập nhật thông tin
- **POST** `/user/change-password` - Đổi mật khẩu
- **POST** `/user/upload-avatar` - Upload ảnh đại diện
- **DELETE** `/user/delete-account` - Xóa tài khoản

📖 [Chi tiết User Profile API](./user/user.md)

---

## 📊 Data Models

### User
```typescript
{
  id: number
  email: string           // unique
  password: string        // hashed
  name: string
  phone?: string
  avatar?: string
  status: UserStatus
  email_verified: boolean
  phone_verified: boolean
  last_login_at?: Date
  created_at: Date
  updated_at: Date
}
```

### Profile
```typescript
{
  id: number
  user_id: number
  first_name?: string
  last_name?: string
  gender?: Gender
  date_of_birth?: Date
  address?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
  bio?: string
  preferences?: {
    language: string
    currency: string
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  created_at: Date
  updated_at: Date
}
```

---

## 🎭 User Status

```typescript
enum UserStatus {
  ACTIVE = 'active',      // Hoạt động
  INACTIVE = 'inactive',  // Không hoạt động
  SUSPENDED = 'suspended',// Tạm khóa
  BANNED = 'banned',      // Bị cấm
  PENDING = 'pending'     // Chờ xác thực
}
```

---

## 👫 Gender

```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}
```

---

## 🔄 User Lifecycle

```
1. Registration
   POST /auth/register
   ↓
2. Email Verification
   GET /auth/verify-email?token=xxx
   ↓
3. Login
   POST /auth/login
   ↓
4. Use System (Active)
   ↓
5. Update Profile
   PUT /user/profile
   ↓
6. Change Password
   POST /user/change-password
   ↓
7. (Optional) Delete Account
   DELETE /user/delete-account
```

---

## ✨ Features

### User Management
- ✅ CRUD operations
- ✅ Status management
- ✅ Role assignment
- ✅ Password reset
- ✅ Email verification
- ✅ Phone verification
- ✅ Avatar upload
- ✅ Account deletion

### Profile Management
- ✅ Personal information
- ✅ Address management
- ✅ Preferences
- ✅ Notification settings
- ✅ Privacy settings

### Security
- ✅ Password hashing (bcrypt)
- ✅ Password strength validation
- ✅ Failed login attempts tracking
- ✅ Account lockout
- ✅ Two-factor authentication (2FA)
- ✅ Session management

---

## 🎯 Use Cases

### Admin: Tạo người dùng mới
```bash
POST /admin/users
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Nguyễn Văn A",
  "phone": "0123456789",
  "status": "active"
}
```

### Admin: Cập nhật trạng thái
```bash
PATCH /admin/users/5/status
{
  "status": "suspended",
  "reason": "Violate terms of service"
}
```

### Admin: Reset mật khẩu
```bash
POST /admin/users/5/reset-password
{
  "send_email": true
}
```

### User: Xem profile
```bash
GET /user/profile
Authorization: Bearer TOKEN
```

### User: Cập nhật profile
```bash
PUT /user/profile
{
  "name": "Tên mới",
  "phone": "0987654321",
  "address": "123 ABC Street",
  "city": "Hà Nội",
  "preferences": {
    "language": "vi",
    "notifications": {
      "email": true,
      "push": true
    }
  }
}
```

### User: Đổi mật khẩu
```bash
POST /user/change-password
{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!",
  "confirm_password": "NewPass456!"
}
```

---

## 🖼️ Avatar Upload

### Upload Flow
```
1. User chọn ảnh
   ↓
2. Validate
   - File type (jpg, png, gif)
   - File size (max 5MB)
   - Dimensions (min 200x200)
   ↓
3. Upload to storage (S3/Local)
   POST /user/upload-avatar
   ↓
4. Resize & optimize
   - Thumbnail: 50x50
   - Small: 100x100
   - Medium: 200x200
   - Large: 400x400
   ↓
5. Update user avatar URL
   ↓
6. Delete old avatar
```

---

## 🔒 Password Policy

- **Minimum length:** 8 characters
- **Must contain:**
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- **Cannot:**
  - Be same as email
  - Be same as username
  - Use common passwords
  - Reuse last 5 passwords

---

## 🔐 Security Features

### Failed Login Attempts
```typescript
{
  max_attempts: 5,
  lockout_duration: 30 * 60, // 30 minutes
  reset_after: 24 * 60 * 60  // 24 hours
}
```

### Session Management
```typescript
{
  session_timeout: 24 * 60 * 60,     // 24 hours
  refresh_token_ttl: 7 * 24 * 60 * 60, // 7 days
  max_concurrent_sessions: 3
}
```

### Email Verification
```typescript
{
  token_ttl: 24 * 60 * 60,  // 24 hours
  resend_delay: 60,         // 1 minute
  max_resend: 3             // per day
}
```

---

## 📧 Email Notifications

Users receive emails for:
- ✅ Registration confirmation
- ✅ Email verification
- ✅ Password reset
- ✅ Password changed
- ✅ Account status changed
- ✅ Login from new device
- ✅ Account deletion confirmation

---

## 🗑️ Account Deletion

### Soft Delete Flow
```
1. User requests deletion
   DELETE /user/delete-account
   {
     "password": "current_password",
     "reason": "No longer needed"
   }
   ↓
2. Mark account as deleted
   - Set status to 'deleted'
   - Set deleted_at timestamp
   - Anonymize personal data
   ↓
3. Retention period (30 days)
   - User can restore account
   ↓
4. Permanent deletion
   - After 30 days
   - Delete all user data
   - GDPR compliance
```

---

## 📊 User Statistics

Admin có thể xem:
- Total users
- Active users (last 30 days)
- New registrations (this month)
- Users by status
- Users by role
- Login activity
- Geographic distribution

---

## 🔍 User Search & Filter

```bash
GET /admin/users?
  search=nguyen&
  status=active&
  role_id=2&
  verified=true&
  registered_after=2025-01-01&
  page=1&
  limit=20&
  sort=created_at:DESC
```

---

## 📝 Best Practices

1. **Always hash passwords** - Never store plain text
2. **Validate email uniqueness** before registration
3. **Implement rate limiting** on sensitive endpoints
4. **Use HTTPS** for all user data transmission
5. **Regular security audits** of user accounts
6. **GDPR compliance** for data handling
7. **Clear password policy** communication
8. **Multi-factor authentication** for sensitive actions

---

**Xem thêm:**
- [Main API Documentation](../README.md)
- [Authentication](../auth/auth.md)
- [RBAC Module](../rbac/README.md)