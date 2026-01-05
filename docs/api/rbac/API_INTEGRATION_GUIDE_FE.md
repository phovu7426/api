# Hướng Dẫn Tích Hợp API Roles & Permissions (Cho Frontend)

Tài liệu này mô tả chi tiết các API Roles và Permissions để Frontend tích hợp.

---

## 📋 Mục Lục

1. [Roles API](#roles-api)
2. [Permissions API](#permissions-api)
3. [Assign Roles to User API](#assign-roles-to-user-api)
4. [Các Trường Dữ Liệu](#các-trường-dữ-liệu)

---

## 🔐 Authentication

Tất cả API đều yêu cầu **JWT Bearer Token** trong header:

```
Authorization: Bearer <access_token>
```

---

## 👑 Roles API

### Base URL
```
/api/admin/roles
```

### 1. Lấy Danh Sách Roles

**Endpoint:** `GET /api/admin/roles`

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `status` (optional): Lọc theo status (`active`, `inactive`)
- `code` (optional): Tìm kiếm theo code
- `name` (optional): Tìm kiếm theo name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "admin",
      "name": "Administrator",
      "status": "active",
      "parent_id": null,
      "parent": null,
      "children": [],
      "permissions": [],
      "context_ids": [1],
      "contexts": [
        {
          "id": 1,
          "type": "system",
          "name": "System",
          "status": "active",
          "ref_id": null
        }
      ],
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

**Lưu ý về `contexts` và `context_ids`:**
- `context_ids`: Mảng ID của các contexts mà role này được gán (dùng để submit khi update)
- `contexts`: Mảng thông tin đầy đủ của contexts (dùng để hiển thị ở giao diện)
  - `id`: ID của context
  - `type`: Loại context (`system`, `shop`, `group`, ...)
  - `name`: Tên context
  - `status`: Trạng thái (`active`, `inactive`)
  - `ref_id`: ID tham chiếu (NULL cho system context, ID của shop/group cho các context khác)

### 2. Lấy Danh Sách Roles Đơn Giản (Không Pagination)

**Endpoint:** `GET /api/admin/roles/simple`

**Response:** Trả về mảng roles không có pagination, dùng cho dropdown/select

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "admin",
      "name": "Administrator",
      "status": "active"
    }
  ]
}
```

### 3. Lấy Chi Tiết Role

**Endpoint:** `GET /api/admin/roles/:id`

**Response:** Tự động load relations (`parent`, `children`, `permissions`, `contexts`)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "admin",
    "name": "Administrator",
    "status": "active",
    "parent_id": null,
    "parent": null,
    "children": [],
    "permissions": [
      {
        "id": 1,
        "code": "post.manage",
        "name": "Quản lý bài viết",
        "scope": "context",
        "status": "active"
      }
    ],
    "context_ids": [1],
    "contexts": [
      {
        "id": 1,
        "type": "system",
        "name": "System",
        "status": "active",
        "ref_id": null
      }
    ],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  }
}
```

**Lưu ý về `contexts` và `context_ids`:**
- `context_ids`: Mảng ID của các contexts mà role này được gán (dùng để submit khi update)
- `contexts`: Mảng thông tin đầy đủ của contexts (dùng để hiển thị ở giao diện)
  - `id`: ID của context
  - `type`: Loại context (`system`, `shop`, `group`, ...)
  - `name`: Tên context
  - `status`: Trạng thái (`active`, `inactive`)
  - `ref_id`: ID tham chiếu (NULL cho system context, ID của shop/group cho các context khác)

### 4. Tạo Role

**Endpoint:** `POST /api/admin/roles`

**Request Body:**
```json
{
  "code": "shop_manager",
  "name": "Quản lý Shop",
  "status": "active",
  "parent_id": null,
  "context_ids": [2, 3]
}
```

**Fields:**
- `code` (required): Mã vai trò (unique, max 100 ký tự)
- `name` (optional): Tên vai trò (max 150 ký tự)
- `status` (optional): Trạng thái (`active`, `inactive`) - mặc định: `active`
- `parent_id` (optional): ID vai trò cha (hierarchical roles)
- `context_ids` (optional): Mảng ID của contexts mà role này sẽ được gán. Nếu không có, role chỉ hiển thị cho system admin.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "code": "shop_manager",
    "name": "Quản lý Shop",
    "status": "active",
    "parent_id": null,
    "context_ids": [2, 3],
    "contexts": [
      {
        "id": 2,
        "type": "shop",
        "name": "Shop A",
        "status": "active",
        "ref_id": 101
      },
      {
        "id": 3,
        "type": "shop",
        "name": "Shop B",
        "status": "active",
        "ref_id": 102
      }
    ],
    "created_at": "2025-01-11T05:40:00.000Z",
    "updated_at": "2025-01-11T05:40:00.000Z"
  },
  "message": "Thành công"
}
```

### 5. Cập Nhật Role

**Endpoint:** `PUT /api/admin/roles/:id`

**Request Body:** Tất cả fields đều optional
```json
{
  "name": "Tên vai trò đã cập nhật",
  "status": "active",
  "parent_id": 1,
  "context_ids": [2, 3, 4]
}
```

**Fields:**
- `name` (optional): Tên vai trò
- `status` (optional): Trạng thái (`active`, `inactive`)
- `parent_id` (optional): ID vai trò cha
- `context_ids` (optional): Mảng ID của contexts. Nếu không có, sẽ giữ nguyên contexts hiện tại. Nếu có, sẽ thay thế toàn bộ contexts bằng danh sách mới.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "admin",
    "name": "Tên vai trò đã cập nhật",
    "status": "active",
    "parent_id": 1,
    "context_ids": [2, 3, 4],
    "contexts": [
      {
        "id": 2,
        "type": "shop",
        "name": "Shop A",
        "status": "active",
        "ref_id": 101
      },
      {
        "id": 3,
        "type": "shop",
        "name": "Shop B",
        "status": "active",
        "ref_id": 102
      },
      {
        "id": 4,
        "type": "group",
        "name": "Team Dev",
        "status": "active",
        "ref_id": 9
      }
    ],
    "updated_at": "2025-01-11T05:45:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

### 6. Xóa Role

**Endpoint:** `DELETE /api/admin/roles/:id`

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa thành công"
}
```

### 7. Gán Permissions Cho Role

**Endpoint:** `POST /api/admin/roles/:id/permissions`

**Request Body:**
```json
{
  "permission_ids": [1, 2, 3, 4, 5]
}
```

**Lưu ý:** API này sẽ **thay thế toàn bộ** permissions hiện tại của role bằng danh sách mới.

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Gán quyền thành công"
}
```

---

## 🔑 Permissions API

### Base URL
```
/api/admin/permissions
```

### 1. Lấy Danh Sách Permissions

**Endpoint:** `GET /api/admin/permissions`

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `status` (optional): Lọc theo status (`active`, `inactive`)
- `scope` (optional): Lọc theo scope (`system`, `context`)
- `code` (optional): Tìm kiếm theo code
- `name` (optional): Tìm kiếm theo name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "post.manage",
      "scope": "context",
      "name": "Quản lý bài viết",
      "status": "active",
      "parent_id": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. Lấy Danh Sách Permissions Đơn Giản

**Endpoint:** `GET /api/admin/permissions/simple`

**Response:** Trả về mảng permissions không có pagination

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "post.manage",
      "scope": "context",
      "name": "Quản lý bài viết",
      "status": "active"
    }
  ]
}
```

### 3. Lấy Chi Tiết Permission

**Endpoint:** `GET /api/admin/permissions/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "post.manage",
    "scope": "context",
    "name": "Quản lý bài viết",
    "status": "active",
    "parent_id": null,
    "parent": null,
    "children": [],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  }
}
```

### 4. Tạo Permission

**Endpoint:** `POST /api/admin/permissions`

**Request Body:**
```json
{
  "code": "product.manage",
  "scope": "context",
  "name": "Quản lý sản phẩm",
  "status": "active",
  "parent_id": null
}
```

**Fields:**
- `code` (required): Mã quyền (unique, max 120 ký tự, format: `module.action`)
- `scope` (optional): Phạm vi (`system`, `context`) - mặc định: `context`
- `name` (optional): Tên quyền (max 150 ký tự)
- `status` (optional): Trạng thái (`active`, `inactive`) - mặc định: `active`
- `parent_id` (optional): ID quyền cha (hierarchical permissions)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 37,
    "code": "product.manage",
    "scope": "context",
    "name": "Quản lý sản phẩm",
    "status": "active",
    "parent_id": null,
    "created_at": "2025-01-11T05:50:00.000Z",
    "updated_at": "2025-01-11T05:50:00.000Z"
  },
  "message": "Thành công"
}
```

### 5. Cập Nhật Permission

**Endpoint:** `PUT /api/admin/permissions/:id`

**Request Body:** Tất cả fields đều optional
```json
{
  "name": "Tên quyền đã cập nhật",
  "status": "active",
  "scope": "context"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "post.manage",
    "scope": "context",
    "name": "Tên quyền đã cập nhật",
    "status": "active",
    "parent_id": null,
    "updated_at": "2025-01-11T05:55:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

### 6. Xóa Permission

**Endpoint:** `DELETE /api/admin/permissions/:id`

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa thành công"
}
```

---

## 👤 Assign Roles to User API

Có **2 API** để gán roles cho user trong context, tùy thuộc vào quyền của người dùng:

---

### 1. System Admin API (Gán Roles Cho Bất Kỳ Context)

**Endpoint:** `PUT /api/admin/users/:userId/roles`

**Permission:** `system.role.manage` (chỉ system admin)

**Request Body:**
```json
{
  "role_ids": [1, 2, 3],
  "context_id": 2
}
```

**URL Parameters:**
- `userId` (required): ID của user cần gán roles

**Request Body Fields:**
- `role_ids` (required): Mảng ID roles cần gán (nếu rỗng `[]` thì xóa hết roles)

**Trường tự sinh (API tự động xử lý, KHÔNG cần gửi từ FE):**
- `context_id` - Tự động lấy từ RequestContext (đã được set bởi ContextInterceptor)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Gán vai trò thành công"
}
```

**Ví dụ:**
```javascript
// Gán roles cho user (context_id tự động lấy từ RequestContext)
PUT /api/admin/users/10/roles
{
  "role_ids": [3, 4]
}
```

---

### 2. Context Admin API (Gán Roles Cho Members Trong Group/Context)

**Endpoint:** `PUT /api/groups/:id/members/:memberId/roles`

**Permission:** `group.member.manage` (context admin - owner hoặc có quyền)

**Request Body:**
```json
{
  "role_ids": [1, 2, 3]
}
```

**URL Parameters:**
- `id` (required): ID của group
- `memberId` (required): ID của user (member) cần gán roles

**Request Body Fields:**
- `role_ids` (required): Mảng ID roles cần gán (nếu rỗng `[]` thì xóa hết roles)

**Trường tự sinh (API tự động xử lý, KHÔNG cần gửi từ FE):**
- `context_id` - Tự động lấy từ group (tìm context có `ref_id` = group id)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Roles assigned successfully"
  }
}
```

**Ví dụ:**
```javascript
// Context admin (shop owner) gán roles cho member trong shop của họ
PUT /api/groups/5/members/10/roles
{
  "role_ids": [3, 4]
}
// context_id tự động = context của group 5
```

---

### So Sánh 2 API

| Đặc điểm | System Admin API | Context Admin API |
|----------|-----------------|-------------------|
| **Endpoint** | `/api/admin/users/:userId/roles` | `/api/groups/:id/members/:memberId/roles` |
| **Permission** | `system.role.manage` | `group.member.manage` |
| **Người dùng** | System admin | Context admin (owner hoặc có quyền) |
| **Context ID** | Tự động lấy từ RequestContext | Tự động lấy từ group |
| **Phạm vi** | Bất kỳ context nào | Chỉ context của group đó |

---

### Lưu Ý Quan Trọng

1. **Cả 2 API đều thay thế toàn bộ roles:**
   - API sẽ **xóa hết** roles hiện tại của user trong context
   - Sau đó **gán lại** danh sách roles mới
   - Nếu `role_ids = []` → xóa hết roles của user trong context đó

2. **Một role có thể dùng cho nhiều contexts:**
   - Role `shop_manager` có thể gán cho user A trong shop1
   - Và cũng gán cho user B trong shop2
   - Roles là GLOBAL, không gắn với context cụ thể

3. **Context Admin chỉ quản lý context của họ:**
   - Context admin (shop owner) chỉ có thể gán roles cho users trong shop của họ
   - Không thể gán roles cho users trong shop khác
   - System admin có thể gán roles cho bất kỳ context nào

---

## 📊 Các Trường Dữ Liệu

### Role Entity

| Trường | Type | Required | Mô tả | API Tự Sinh | FE Cần Nhập |
|--------|------|----------|-------|-------------|-------------|
| `id` | number | - | ID tự động | ✅ | ❌ |
| `code` | string | ✅ | Mã vai trò (unique, max 100) | ❌ | ✅ |
| `name` | string | ❌ | Tên vai trò (max 150) | ❌ | ✅ |
| `status` | string | ❌ | Trạng thái (`active`, `inactive`) | ❌ | ✅ |
| `parent_id` | number \| null | ❌ | ID vai trò cha | ❌ | ✅ |
| `parent` | Role \| null | - | Object vai trò cha (relation) | ✅ | ❌ |
| `children` | Role[] | - | Mảng vai trò con (relation) | ✅ | ❌ |
| `permissions` | Permission[] | - | Mảng quyền (relation) | ✅ | ❌ |
| `context_ids` | number[] | - | Mảng ID contexts mà role được gán (dùng để submit) | ✅ | ✅ (khi create/update) |
| `contexts` | Context[] | - | Mảng thông tin đầy đủ contexts (dùng để hiển thị) | ✅ | ❌ |
| `created_user_id` | number \| null | - | ID user tạo | ✅ | ❌ |
| `updated_user_id` | number \| null | - | ID user cập nhật | ✅ | ❌ |
| `created_at` | Date | - | Thời gian tạo | ✅ | ❌ |
| `updated_at` | Date | - | Thời gian cập nhật | ✅ | ❌ |
| `deleted_at` | Date \| null | - | Thời gian xóa (soft delete) | ✅ | ❌ |

**Lưu ý về `context_ids` và `contexts`:**
- `context_ids`: Mảng ID của contexts (dùng khi tạo/cập nhật role)
- `contexts`: Mảng object context với các trường: `id`, `type`, `name`, `status`, `ref_id` (chỉ để hiển thị, không cần gửi khi create/update)

### Permission Entity

| Trường | Type | Required | Mô tả | API Tự Sinh | FE Cần Nhập |
|--------|------|----------|-------|-------------|-------------|
| `id` | number | - | ID tự động | ✅ | ❌ |
| `code` | string | ✅ | Mã quyền (unique, max 120) | ❌ | ✅ |
| `scope` | string | ❌ | Phạm vi (`system`, `context`) | ❌ | ✅ |
| `name` | string | ❌ | Tên quyền (max 150) | ❌ | ✅ |
| `status` | string | ❌ | Trạng thái (`active`, `inactive`) | ❌ | ✅ |
| `parent_id` | number \| null | ❌ | ID quyền cha | ❌ | ✅ |
| `parent` | Permission \| null | - | Object quyền cha (relation) | ✅ | ❌ |
| `children` | Permission[] | - | Mảng quyền con (relation) | ✅ | ❌ |
| `roles` | Role[] | - | Mảng vai trò (relation) | ✅ | ❌ |
| `created_user_id` | number \| null | - | ID user tạo | ✅ | ❌ |
| `updated_user_id` | number \| null | - | ID user cập nhật | ✅ | ❌ |
| `created_at` | Date | - | Thời gian tạo | ✅ | ❌ |
| `updated_at` | Date | - | Thời gian cập nhật | ✅ | ❌ |
| `deleted_at` | Date \| null | - | Thời gian xóa (soft delete) | ✅ | ❌ |

---

## 🎯 Quy Ước Permission Code

**Format:** `module.action`

**Module:**
- `post`: Bài viết
- `product`: Sản phẩm
- `user`: Người dùng
- `role`: Vai trò
- `permission`: Quyền
- `system`: Hệ thống
- `order`: Đơn hàng
- `warehouse`: Kho hàng
- ...

**Action:**
- `manage`: Quản lý chung
- `create`: Tạo mới
- `read`: Xem
- `update`: Cập nhật
- `delete`: Xóa
- `publish`: Xuất bản
- `cancel`: Hủy
- ...

**Ví dụ:**
- `post.manage`: Quản lý bài viết
- `post.create`: Tạo bài viết
- `system.user.manage`: Quản lý user hệ thống (scope = system)
- `user.manage`: Quản lý user context (scope = context)

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Roles là GLOBAL nhưng có thể gán vào Contexts
- Roles là global entities, không thuộc về context cụ thể
- Một role có thể được gán vào nhiều contexts khác nhau thông qua `role_contexts` junction table
- Khi tạo/cập nhật role, có thể chỉ định `context_ids` để role đó chỉ hiển thị cho các contexts được chọn
- Ví dụ: Role `shop_manager` có thể gán vào shop1, shop2, shop3... → context admin của các shops này sẽ thấy role này
- Nếu role không có `context_ids` → chỉ system admin thấy, context admin không thấy

### 2. Permissions có Scope
- `scope = 'system'`: Chỉ dùng trong system context
- `scope = 'context'`: Dùng trong các contexts khác (shop, group, ...)
- System admin có thể tạo/sửa permissions
- Context admin **KHÔNG THỂ** tạo/sửa permissions, chỉ được gán roles

### 3. Assign Roles
- Context admin chỉ được gán roles cho users trong context của họ
- System admin có thể gán roles cho users trong bất kỳ context nào
- API `PUT /api/admin/users/:userId/roles` sẽ **thay thế toàn bộ** roles hiện tại

### 4. Hierarchical Structure
- Roles và Permissions đều hỗ trợ parent-child relationship
- Có thể tạo role/permission con kế thừa từ role/permission cha

---

## 🔄 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized - Token không hợp lệ |
| 403 | Forbidden - Không có quyền |
| 404 | Not Found - Không tìm thấy |
| 409 | Conflict - Code đã tồn tại |
| 500 | Internal Server Error |

---

## 📝 Ví Dụ Tích Hợp

### Tạo Role Mới
```javascript
const createRole = async (roleData) => {
  const response = await fetch('/api/admin/roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: 'shop_manager',
      name: 'Quản lý Shop',
      status: 'active'
    })
  });
  return response.json();
};
```

### Gán Permissions Cho Role
```javascript
const assignPermissions = async (roleId, permissionIds) => {
  const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      permission_ids: permissionIds
    })
  });
  return response.json();
};
```

### Gán Roles Cho User Trong Context
```javascript
const assignRolesToUser = async (userId, roleIds) => {
  // context_id tự động lấy từ RequestContext (đã được set bởi ContextInterceptor)
  const response = await fetch(`/api/admin/users/${userId}/roles`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role_ids: roleIds
    })
  });
  return response.json();
};
```

---

**Xem thêm:**
- [RBAC Module README](./README.md)
- [Admin Roles API](./admin/role.md)
- [Admin Permissions API](./admin/permission.md)
- [Admin RBAC API](./admin/rbac.md)

