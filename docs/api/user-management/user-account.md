# API Quản lý tài khoản người dùng

## Tổng quan

Module quản lý tài khoản người dùng cung cấp các API để người dùng có thể xem thông tin cá nhân, cập nhật hồ sơ và đổi mật khẩu. Tất cả các API này yêu cầu xác thực thông qua token.

## Base URL

```
/users
```

## Authentication

Tất cả các endpoint trong module này yêu cầu header:

```
Authorization: Bearer {token}
```

## 1. Lấy thông tin người dùng hiện tại

### Endpoint

```
GET /users/me
```

### Response

Trả về thông tin chi tiết của người dùng hiện tại:

```json
{
  "id": 1,
  "username": "nguyenvana",
  "email": "nguyenvana@example.com",
  "phone": "0912345678",
  "status": "active",
  "email_verified_at": "2023-01-01T00:00:00.000Z",
  "phone_verified_at": "2023-01-01T00:00:00.000Z",
  "last_login_at": "2023-12-13T10:30:00.000Z",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-12-13T10:30:00.000Z",
  "profile": {
    "id": 1,
    "user_id": 1,
    "name": "Nguyễn Văn A",
    "image": "https://example.com/avatar.jpg",
    "birthday": "1990-01-15",
    "gender": "male",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "about": "Tôi là một lập trình viên với 5 năm kinh nghiệm.",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-12-13T10:30:00.000Z"
  }
}
```

## 2. Cập nhật thông tin cá nhân

### Endpoint

```
PATCH /users/me
```

### Request Body

Đây là các trường có thể gửi trong request body. Tất cả các trường đều là optional, người dùng chỉ cần gửi những trường muốn cập nhật.

| Trường | Kiểu dữ liệu | Nguồn | Mô tả | Giới hạn | Ví dụ |
|--------|--------------|-------|-------|----------|-------|
| name | string | profiles | Tên hiển thị của người dùng | Tối đa 100 ký tự | "Nguyễn Văn A" |
| phone | string | users | Số điện thoại | Định dạng số điện thoại Việt Nam | "0912345678" |
| image | string | profiles | URL ảnh đại diện | Tối đa 255 ký tự | "https://example.com/avatar.jpg" |
| birthday | string | profiles | Ngày sinh (ISO 8601) | Định dạng YYYY-MM-DD | "1990-01-15" |
| gender | string | profiles | Giới tính | "male", "female", "other" | "male" |
| address | string | profiles | Địa chỉ | Tối đa 500 ký tự | "123 Đường ABC, Quận 1, TP.HCM" |
| about | string | profiles | Giới thiệu bản thân | Tối đa 1000 ký tự | "Tôi là một lập trình viên..." |

### Ví dụ Request Body

```json
{
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "image": "https://example.com/avatar.jpg",
  "birthday": "1990-01-15",
  "gender": "male",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "about": "Tôi là một lập trình viên với 5 năm kinh nghiệm."
}
```

### Response

Trả về thông tin người dùng đã được cập nhật (giống format response của GET /users/me).

## 3. Đổi mật khẩu

### Endpoint

```
PATCH /users/me/password
```

### Request Body

| Trường | Kiểu dữ liệu | Mô tả | Giới hạn | Bắt buộc |
|--------|--------------|-------|----------|----------|
| oldPassword | string | Mật khẩu hiện tại | Tối thiểu 6 ký tự | Có |
| newPassword | string | Mật khẩu mới | Tối thiểu 6 ký tự | Có |

### Ví dụ Request Body

```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Response

Thành công (200 OK):

```json
null
```

Lỗi (400 Bad Request):

```json
{
  "message": "Mật khẩu hiện tại không đúng",
  "error": "Bad Request",
  "statusCode": 400
}
```

## Cấu trúc dữ liệu

### Bảng Users

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | number | ID người dùng |
| username | string | Tên đăng nhập |
| email | string | Email |
| phone | string | Số điện thoại |
| password | string | Mật khẩu (đã hash) |
| status | string | Trạng thái tài khoản |
| email_verified_at | datetime | Thời gian xác thực email |
| phone_verified_at | datetime | Thời gian xác thực SĐT |
| last_login_at | datetime | Lần đăng nhập cuối |
| created_at | datetime | Thời gian tạo |
| updated_at | datetime | Thời gian cập nhật |

### Bảng Profiles

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | number | ID profile |
| user_id | number | ID người dùng (khóa ngoại) |
| name | string | Tên hiển thị |
| image | string | URL ảnh đại diện |
| birthday | date | Ngày sinh |
| gender | string | Giới tính |
| address | string | Địa chỉ |
| about | text | Giới thiệu bản thân |
| created_at | datetime | Thời gian tạo |
| updated_at | datetime | Thời gian cập nhật |

## Lưu ý quan trọng

1. **Phân chia dữ liệu**: 
   - Thông tin xác thực (`phone`, `password`) được lưu trong bảng `users`
   - Thông tin cá nhân (`name`, `image`, `birthday`, `gender`, `address`, `about`) được lưu trong bảng `profiles`

2. **Validation**:
   - `phone` phải là số điện thoại hợp lệ của Việt Nam
   - `gender` phải là một trong các giá trị: "male", "female", "other"
   - `birthday` phải là ngày hợp lệ theo định dạng ISO 8601
   - Mật khẩu phải có ít nhất 6 ký tự

3. **Unique constraint**:
   - Số điện thoại phải là duy nhất trong hệ thống

4. **Profile tự động tạo**:
   - Nếu người dùng chưa có profile, hệ thống sẽ tự động tạo một profile mới khi cập nhật thông tin

5. **Security**:
   - Mật khẩu cũ phải chính xác khi đổi mật khẩu
   - Mật khẩu mới được hash trước khi lưu vào database

## Ví dụ sử dụng với JavaScript

```javascript
// Lấy thông tin người dùng
const getUserInfo = async () => {
  try {
    const response = await fetch('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Cập nhật thông tin cá nhân
const updateProfile = async (userData) => {
  try {
    const response = await fetch('/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Đổi mật khẩu
const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await fetch('/users/me/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Sử dụng
getUserInfo()
.then(userInfo => console.log('User info:', userInfo))
.catch(error => console.error('Get user info failed:', error));

updateProfile({
  name: "Nguyễn Văn A",
  phone: "0912345678",
  image: "https://example.com/avatar.jpg",
  birthday: "1990-01-15",
  gender: "male"
})
.then(data => console.log('Profile updated:', data))
.catch(error => console.error('Update failed:', error));

changePassword("oldpassword123", "newpassword456")
.then(() => console.log('Password changed successfully'))
.catch(error => console.error('Change password failed:', error));