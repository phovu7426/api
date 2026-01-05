# API Cập nhật thông tin người dùng

## Endpoint

```
PATCH /users/me
```

## Mô tả

API này cho phép người dùng cập nhật thông tin cá nhân của mình. Người dùng cần xác thực thông qua token để sử dụng API này.

## Headers

| Header | Giá trị | Bắt buộc |
|--------|---------|----------|
| Authorization | Bearer {token} | Có |
| Content-Type | application/json | Có |

## Request Body

Đây là các trường có thể gửi trong request body. Tất cả các trường đều là optional, người dùng chỉ cần gửi những trường muốn cập nhật.

| Trường | Kiểu dữ liệu | Mô tả | Giới hạn | Ví dụ |
|--------|--------------|-------|----------|-------|
| name | string | Tên hiển thị của người dùng | Tối đa 100 ký tự | "Nguyễn Văn A" |
| phone | string | Số điện thoại | Định dạng số điện thoại Việt Nam | "0912345678" |
| image | string | URL ảnh đại diện | Tối đa 255 ký tự | "https://example.com/avatar.jpg" |
| birthday | string | Ngày sinh (ISO 8601) | Định dạng YYYY-MM-DD | "1990-01-15" |
| gender | string | Giới tính | "male", "female", "other" | "male" |
| address | string | Địa chỉ | Tối đa 500 ký tự | "123 Đường ABC, Quận 1, TP.HCM" |
| about | string | Giới thiệu bản thân | Tối đa 1000 ký tự | "Tôi là một lập trình viên..." |

## Ví dụ Request Body

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

## Response

### Thành công (200 OK)

Trả về thông tin người dùng đã được cập nhật:

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

### Lỗi (400 Bad Request)

```json
{
  "message": "Số điện thoại đã được sử dụng.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Lỗi xác thực (401 Unauthorized)

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

## Lưu ý quan trọng

1. **Phân chia dữ liệu**: 
   - `phone` được lưu trong bảng `users`
   - Các trường còn lại (`name`, `avatarUrl`, `birthday`, `gender`, `address`, `about`) được lưu trong bảng `profiles`

2. **Xử lý image**:
   - Trường `image` trong request sẽ được lưu vào trường `image` trong bảng `profiles`

3. **Validation**:
   - `phone` phải là số điện thoại hợp lệ của Việt Nam
   - `gender` phải là một trong các giá trị: "male", "female", "other"
   - `birthday` phải là ngày hợp lệ theo định dạng ISO 8601

4. **Unique constraint**:
   - Số điện thoại phải là duy nhất trong hệ thống

5. **Profile tự động tạo**:
   - Nếu người dùng chưa có profile, hệ thống sẽ tự động tạo một profile mới

## Ví dụ sử dụng với JavaScript

```javascript
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

// Sử dụng
updateProfile({
  name: "Nguyễn Văn A",
  phone: "0912345678",
  image: "https://example.com/avatar.jpg",
  birthday: "1990-01-15",
  gender: "male"
})
.then(data => console.log('Profile updated:', data))
.catch(error => console.error('Update failed:', error));