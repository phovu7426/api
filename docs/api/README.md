# API Documentation

Tài liệu API đầy đủ cho hệ thống NestJS E-commerce & CMS.

## 📋 Cấu trúc tài liệu

Tài liệu được tổ chức theo **module** tương tự như cấu trúc source code `src/modules/`:

```
docs/api/
├── auth/                    # Authentication & Authorization
├── post/                    # Blog & Content Management
│   ├── admin/              # Admin APIs
│   ├── public/             # Public APIs
│   └── README.md
├── ecommerce/              # E-commerce Management
│   ├── admin/              # Admin APIs
│   ├── public/             # Public APIs  
│   ├── user/               # User APIs
│   └── README.md
├── payment-method/         # Payment Methods
│   ├── admin/
│   ├── public/
│   └── README.md
├── notification/           # Notifications
│   ├── admin/
│   ├── user/
│   └── README.md
├── rbac/                   # Role-Based Access Control
│   ├── admin/
│   └── README.md
├── user-management/        # User Management
│   ├── admin/
│   ├── user/
│   └── README.md
└── README.md               # File này
```

---

## 🚀 Quick Start

### Base URL

```
Production: https://api.yoursite.com
Development: http://localhost:3000/api
```

### Authentication

Sử dụng JWT Bearer Token:

```bash
curl -X GET http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer YOUR_TOKEN"
```

📖 **Chi tiết:** [Authentication API](./auth/auth.md)

---

## 📚 Modules

### 🔐 Authentication (auth/)
- **POST** `/auth/login` - Đăng nhập
- **POST** `/auth/register` - Đăng ký
- **POST** `/auth/refresh` - Refresh token
- **POST** `/auth/logout` - Đăng xuất

📖 [Authentication Documentation](./auth/auth.md)

---

### 📝 Post Module (post/)

Quản lý blog và nội dung.

#### Admin APIs
- **Posts**: [`/admin/posts`](./post/admin/post.md)
- **Categories**: [`/admin/post-categories`](./post/admin/post-category.md)
- **Tags**: [`/admin/post-tags`](./post/admin/post-tag.md)

#### Public APIs
- **Posts**: [`/posts`](./post/public/post.md)
- **Categories**: [`/post-categories`](./post/public/post-category.md)
- **Tags**: [`/post-tags`](./post/public/post-tag.md)

📖 [Post Module Documentation](./post/README.md)

---

### 📬 Contact Module (contact/)

Quản lý liên hệ từ người dùng.

#### Admin APIs
- **Contacts**: [`/admin/contacts`](./contact/admin/contact.md)

#### Public APIs
- **Contacts**: [`/public/contacts`](./contact/public/contact.md)

📖 [Contact Module Documentation](./contact/README.md)

---

### 🛍️ E-commerce Module (ecommerce/)

Quản lý sản phẩm, đơn hàng, giỏ hàng.

#### Admin APIs
- **Products**: [`/admin/products`](./ecommerce/admin/product.md)
- **Product Categories**: [`/admin/product-categories`](./ecommerce/admin/product-category.md)
- **Product Variants**: [`/admin/product-variants`](./ecommerce/admin/product-variant.md)
- **Product Attribute Values**: [`/admin/product-attribute-values`](./ecommerce/admin/product-attribute-value.md)
- **Coupons**: [`/admin/coupons`](./ecommerce/admin/coupon.md)
- **Orders**: [`/admin/orders`](./ecommerce/admin/order.md)
- **Warehouses**: [`/admin/warehouses`](./ecommerce/admin/warehouse.md)
- **Customers**: `/admin/customers`

#### Public APIs
- **Products**: [`/public/products`](./ecommerce/public/product.md)
- **Categories**: [`/public/product-categories`](./ecommerce/public/product-category.md)
- **Cart**: [`/public/cart`](./ecommerce/public/cart.md)
- **Orders**: [`/public/orders`](./ecommerce/public/order.md)
- **Payments**: [`/public/payments`](./ecommerce/public/payment.md)
- **Payment Methods**: [`/payment-methods`](./payment-method/public/payment-method.md)
- **Discounts**: [`/public/discounts`](./ecommerce/public/discount.md)
- **Shipping Methods**: [`/public/shipping-methods`](./ecommerce/public/shipping-method.md)
- **Shipping Tracking**: [`/public/tracking`](./ecommerce/public/shipping-tracking.md)
- **Product Reviews**: [`/public/product-reviews`](./ecommerce/public/product-review.md)
- **Checkout**: `/checkout`

#### User APIs
- **Products**: [`/user/products`](./ecommerce/user/product.md)
- **Product Categories**: [`/user/product-categories`](./ecommerce/user/product-category.md)
- **Orders**: [`/user/orders`](./ecommerce/user/order.md)
- **Cart**: [`/public/cart`](./ecommerce/public/cart.md)
- **Reviews**: [`/user/reviews`](./ecommerce/user/product-review.md)
- **Wishlist**: `/user/wishlist`

📖 [E-commerce Module Documentation](./ecommerce/README.md)

---

### 💳 Payment Method Module (payment-method/)

Quản lý phương thức thanh toán.

#### Admin APIs
- **Payment Methods**: [`/admin/payment-methods`](./payment-method/admin/payment-method.md)

#### Public APIs
- **Payment Methods**: [`/payment-methods`](./payment-method/public/payment-method.md)

📖 [Payment Method Documentation](./payment-method/README.md)

---

### 🔔 Notification Module (notification/)

Quản lý thông báo hệ thống.

#### Admin APIs
- **Notifications**: [`/admin/notifications`](./notification/admin/notification.md)
- **Broadcast**: `/admin/notifications/broadcast`

#### User APIs
- **My Notifications**: [`/user/notifications`](./notification/user/notification.md)
- **Mark as Read**: `/user/notifications/{id}/read`

📖 [Notification Documentation](./notification/README.md)

---

### 👥 RBAC Module (rbac/)

Quản lý quyền và vai trò (Role-Based Access Control).

#### Admin APIs
- **Permissions**: [`/admin/permissions`](./rbac/admin/permission.md)
- **Roles**: [`/admin/roles`](./rbac/admin/role.md)
- **RBAC Operations**: [`/admin/rbac`](./rbac/admin/rbac.md)

📖 [RBAC Documentation](./rbac/README.md)

---

### 👤 User Management Module (user-management/)

Quản lý người dùng.

#### Admin APIs
- **Users**: [`/admin/users`](./user-management/admin/user.md)
- **User Roles**: `/admin/users/{id}/roles`

#### User APIs
- **Profile**: [`/user/profile`](./user-management/user/user.md)
- **Change Password**: `/user/change-password`

📖 [User Management Documentation](./user-management/README.md)

---

## 🔧 Common Conventions

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Thành công",
  "meta": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "statusCode": 400
}
```

### Pagination

```bash
GET /api/endpoint?page=1&limit=10
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Sorting

```bash
GET /api/endpoint?sortBy=created_at&sortOrder=DESC
# hoặc
GET /api/endpoint?sort=created_at:DESC
```

### Filtering

```bash
GET /api/endpoint?status=active&category_id=1
# hoặc
GET /api/endpoint?filters={"status":"active","category_id":1}
```

### Search

```bash
GET /api/endpoint?search=keyword
# hoặc
GET /api/endpoint?q=keyword
```

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 🚦 Rate Limiting

- **Public APIs**: 100 requests/minute
- **Authenticated APIs**: 300 requests/minute
- **Admin APIs**: 1000 requests/minute

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## 🌐 CORS

Hỗ trợ CORS cho các origins được cấu hình:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📦 API Collections

### Postman
Download: [NestJS API Collection.postman_collection.json](./postman_collection.json)

### Insomnia
Download: [NestJS API Collection.insomnia.json](./insomnia_collection.json)

---

## 📖 Module Documentation

Mỗi module có file README riêng với thông tin chi tiết:

- [Post Module](./post/README.md)
- [Contact Module](./contact/README.md)
- [E-commerce Module](./ecommerce/README.md)
- [Payment Method Module](./payment-method/README.md)
- [Notification Module](./notification/README.md)
- [RBAC Module](./rbac/README.md)
- [User Management Module](./user-management/README.md)

---

## 🏠 Frontend Integration Guides

### Home Page Design
- **[Home Page Design Guide](./HOME_PAGE_DESIGN.md)** - Hướng dẫn thiết kế trang home với các sections và API endpoints tương ứng

### User Account Management
- **[User Account Management Guide](./USER_ACCOUNT_MANAGEMENT.md)** - Hướng dẫn tích hợp đổi thông tin tài khoản, đổi mật khẩu, và đăng xuất

---

## 🆘 Support

- **Documentation**: https://docs.yoursite.com
- **Issues**: https://github.com/yourrepo/issues
- **Email**: support@yoursite.com

---

**Last Updated:** 2025-01-15  
**API Version:** v1.0.0
