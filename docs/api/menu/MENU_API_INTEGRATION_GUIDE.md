# Hướng Dẫn Tích Hợp API Menu

Tài liệu này hướng dẫn chi tiết cách tích hợp API Menu cho Frontend, bao gồm API quản lý menu (Admin) và API lấy menu tree cho người dùng.

---

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [API Admin - Quản Lý Menu](#api-admin---quản-lý-menu)
   - [Lấy Danh Sách Menu](#1-lấy-danh-sách-menu)
   - [Lấy Menu Tree (Admin)](#2-lấy-menu-tree-admin)
   - [Lấy Chi Tiết Menu](#3-lấy-chi-tiết-menu)
   - [Tạo Menu Mới](#4-tạo-menu-mới)
   - [Cập Nhật Menu](#5-cập-nhật-menu)
   - [Xóa Menu](#6-xóa-menu)
3. [API User - Lấy Menu Tree](#api-user---lấy-menu-tree)
4. [Chi Tiết Các Trường Dữ Liệu](#chi-tiết-các-trường-dữ-liệu)
5. [Enums và Constants](#enums-và-constants)
6. [Error Handling](#error-handling)
7. [Ví Dụ Tích Hợp](#ví-dụ-tích-hợp)

---

## Tổng Quan

Hệ thống Menu cho phép:
- **Admin**: Quản lý menu (CRUD) với đầy đủ thông tin
- **User**: Lấy menu tree đã được lọc theo quyền của người dùng

### Base URL
```
Admin API: /api/admin/menus
User API: /api/admin/user/menus
```

### Authentication
Tất cả API đều yêu cầu **Bearer Token** trong header:
```
Authorization: Bearer <access_token>
```

### Permissions Required
- `menu.read` - Xem danh sách và chi tiết menu
- `menu.create` - Tạo menu mới
- `menu.update` - Cập nhật menu
- `menu.delete` - Xóa menu

---

## API Admin - Quản Lý Menu

### 1. Lấy Danh Sách Menu

**Endpoint:** `GET /admin/menus`

**Permission:** `menu.read`

**Query Parameters:**

| Tên | Type | Required | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| `page` | number | No | 1 | Số trang |
| `limit` | number | No | 20 | Số lượng item mỗi trang (max: 100) |
| `q` | string | No | - | Tìm kiếm theo tên, code |
| `status` | enum | No | - | Lọc theo status: `active`, `inactive` |
| `parent_id` | number | No | - | Lọc theo menu cha (null = root menu) |
| `show_in_menu` | boolean | No | - | Lọc theo hiển thị trong menu |
| `sort` | string | No | `sort_order:ASC` | Sắp xếp (format: `field:ASC|DESC`) |

**Response Structure:**

```json
{
  "data": [
    {
      "id": 1,
      "code": "dashboard",
      "name": "Dashboard",
      "path": "/admin/dashboard",
      "api_path": "/api/admin/dashboard",
      "icon": "mdi-view-dashboard",
      "type": "route",
      "status": "active",
      "parent_id": null,
      "sort_order": 0,
      "is_public": false,
      "show_in_menu": true,
      "required_permission_id": 1,
      "created_user_id": 1,
      "updated_user_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "deleted_at": null,
      "parent": null,
      "children": [],
      "required_permission": {
        "id": 1,
        "code": "dashboard.read",
        "name": "Xem Dashboard"
      },
      "menu_permissions": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextPage": 2,
    "previousPage": null
  }
}
```

**Ví dụ Request:**

```bash
GET /admin/menus?page=1&limit=20&status=active&sort=sort_order:ASC
```

---

### 2. Lấy Menu Tree (Admin)

**Endpoint:** `GET /admin/menus/tree`

**Permission:** `menu.read`

**Description:** Lấy toàn bộ menu dạng tree structure (không lọc theo permission)

**Response Structure:**

```json
[
  {
    "id": 1,
    "code": "dashboard",
    "name": "Dashboard",
    "path": "/admin/dashboard",
    "icon": "mdi-view-dashboard",
    "type": "route",
    "status": "active",
    "children": [
      {
        "id": 2,
        "code": "dashboard.analytics",
        "name": "Analytics",
        "path": "/admin/dashboard/analytics",
        "icon": "mdi-chart-line",
        "type": "route",
        "status": "active",
        "children": []
      }
    ]
  }
]
```

**Lưu ý:**
- Response là array, không có pagination
- Chỉ trả về các trường cần thiết cho tree structure
- Đã được sắp xếp theo `sort_order`

---

### 3. Lấy Chi Tiết Menu

**Endpoint:** `GET /admin/menus/:id`

**Permission:** `menu.read`

**Path Parameters:**

| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `id` | number | Yes | ID của menu |

**Response Structure:**

```json
{
  "id": 1,
  "code": "dashboard",
  "name": "Dashboard",
  "path": "/admin/dashboard",
  "api_path": "/api/admin/dashboard",
  "icon": "mdi-view-dashboard",
  "type": "route",
  "status": "active",
  "parent_id": null,
  "sort_order": 0,
  "is_public": false,
  "show_in_menu": true,
  "required_permission_id": 1,
  "created_user_id": 1,
  "updated_user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "deleted_at": null,
  "parent": null,
  "children": [],
  "required_permission": {
    "id": 1,
    "code": "dashboard.read",
    "name": "Xem Dashboard"
  },
  "menu_permissions": [
    {
      "id": 1,
      "menu_id": 1,
      "permission_id": 2,
      "permission": {
        "id": 2,
        "code": "dashboard.export",
        "name": "Xuất dữ liệu Dashboard"
      }
    }
  ]
}
```

---

### 4. Tạo Menu Mới

**Endpoint:** `POST /admin/menus`

**Permission:** `menu.create`

**Request Body:**

```json
{
  "code": "products",
  "name": "Sản phẩm",
  "path": "/admin/products",
  "api_path": "/api/admin/products",
  "icon": "mdi-package-variant",
  "type": "route",
  "status": "active",
  "parent_id": null,
  "sort_order": 10,
  "is_public": false,
  "show_in_menu": true,
  "required_permission_id": 5
}
```

**Chi Tiết Các Trường:**

| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `code` | string | **Yes** | Mã menu (unique, 3-120 ký tự) |
| `name` | string | **Yes** | Tên menu (max 150 ký tự) |
| `path` | string | No | Đường dẫn route (max 255 ký tự) |
| `api_path` | string | No | Đường dẫn API (max 255 ký tự) |
| `icon` | string | No | Icon class/name (max 120 ký tự) |
| `type` | enum | No | Loại menu: `route`, `group`, `link` (mặc định: `route`) |
| `status` | enum | No | Trạng thái: `active`, `inactive` (mặc định: `active`) |
| `parent_id` | number | No | ID menu cha (null = root menu) |
| `sort_order` | number | No | Thứ tự sắp xếp (mặc định: 0) |
| `is_public` | boolean | No | Menu công khai (mặc định: false) |
| `show_in_menu` | boolean | No | Hiển thị trong menu (mặc định: true) |
| `required_permission_id` | number | No | ID permission bắt buộc để truy cập |

**Response:** Trả về object menu vừa tạo (giống response của GET /admin/menus/:id)

**Lưu ý:**
- `code` phải unique, nếu trùng sẽ trả về lỗi `MENU_CODE_EXISTS`
- `parent_id` phải tồn tại trong database
- `required_permission_id` phải tồn tại trong bảng permissions (lấy từ API `/admin/permissions`)

**Error Response:**

```json
{
  "statusCode": 400,
  "message": "Menu code already exists",
  "code": "MENU_CODE_EXISTS"
}
```

---

### 5. Cập Nhật Menu

**Endpoint:** `PUT /admin/menus/:id`

**Permission:** `menu.update`

**Path Parameters:**

| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `id` | number | Yes | ID của menu cần cập nhật |

**Request Body:** Tất cả các trường đều optional (chỉ gửi trường cần cập nhật)

```json
{
  "name": "Sản phẩm (Updated)",
  "sort_order": 15,
  "status": "inactive"
}
```

**Response:** Trả về object menu đã được cập nhật

**Lưu ý:**
- Nếu cập nhật `code`, phải đảm bảo không trùng với code khác
- Có thể set `parent_id = null` để chuyển menu về root
- Có thể set `required_permission_id = null` để bỏ permission requirement

---

### 6. Xóa Menu

**Endpoint:** `DELETE /admin/menus/:id`

**Permission:** `menu.delete`

**Path Parameters:**

| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `id` | number | Yes | ID của menu cần xóa |

**Response:**

```json
{
  "message": "Menu deleted successfully"
}
```

**Lưu ý:**
- Xóa menu sẽ xóa luôn các menu con (cascade)
- Xóa soft delete (set `deleted_at`), không xóa cứng

---

## API User - Lấy Menu Tree

### Endpoint: `GET /api/admin/user/menus`

**Permission:** `public` (chỉ cần authenticated)

**Description:** Lấy menu tree đã được lọc theo quyền của user hiện tại

**Query Parameters:**

| Tên | Type | Required | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| `include_inactive` | boolean | No | false | Bao gồm menu inactive |
| `flatten` | boolean | No | false | Trả về dạng array phẳng thay vì tree |

**Response Structure (Tree - mặc định):**

```json
[
  {
    "id": 1,
    "code": "dashboard",
    "name": "Dashboard",
    "path": "/admin/dashboard",
    "icon": "mdi-view-dashboard",
    "type": "route",
    "status": "active",
    "allowed": true,
    "children": [
      {
        "id": 2,
        "code": "dashboard.analytics",
        "name": "Analytics",
        "path": "/admin/dashboard/analytics",
        "icon": "mdi-chart-line",
        "type": "route",
        "status": "active",
        "allowed": true,
        "children": []
      }
    ]
  }
]
```

**Response Structure (Flatten - khi `flatten=true`):**

```json
[
  {
    "id": 1,
    "code": "dashboard",
    "name": "Dashboard",
    "path": "/admin/dashboard",
    "icon": "mdi-view-dashboard",
    "type": "route",
    "status": "active",
    "allowed": true
  },
  {
    "id": 2,
    "code": "dashboard.analytics",
    "name": "Analytics",
    "path": "/admin/dashboard/analytics",
    "icon": "mdi-chart-line",
    "type": "route",
    "status": "active",
    "allowed": true
  }
]
```

**Logic Lọc Menu:**
Menu sẽ được hiển thị nếu:
1. `is_public = true` (menu công khai)
2. User có permission trong `required_permission`
3. User có ít nhất 1 permission trong `menu_permissions`
4. Menu không có `required_permission` và không có `menu_permissions` (menu mặc định)

**Ví dụ Request:**

```bash
# Lấy menu tree
GET /api/admin/user/menus

# Lấy menu tree dạng phẳng
GET /api/admin/user/menus?flatten=true

# Lấy menu tree bao gồm inactive
GET /api/admin/user/menus?include_inactive=true
```

---

## Chi Tiết Các Trường Dữ Liệu

### Trường Bắt Buộc (Required)

| Trường | API | Mô tả |
|--------|-----|-------|
| `code` | Create | Mã menu, phải unique, 3-120 ký tự |
| `name` | Create | Tên menu, max 150 ký tự |

### Trường Tự Sinh (Auto-generated) - Không Cần Hiển Thị Ở FE

| Trường | Mô tả | Khi Nào Có Giá Trị |
|--------|-------|-------------------|
| `id` | ID tự động | Sau khi tạo |
| `created_at` | Thời gian tạo | Sau khi tạo |
| `updated_at` | Thời gian cập nhật | Tự động cập nhật khi edit |
| `deleted_at` | Thời gian xóa | Khi xóa (soft delete) |
| `created_user_id` | ID user tạo | Tự động lấy từ token |
| `updated_user_id` | ID user cập nhật | Tự động lấy từ token |

**Lưu ý:** FE không cần gửi các trường này khi Create/Update, backend sẽ tự xử lý.

### Trường Optional (Có Thể Bỏ Trống)

| Trường | Mặc Định | Mô tả |
|--------|----------|-------|
| `path` | `null` | Đường dẫn route |
| `api_path` | `null` | Đường dẫn API |
| `icon` | `null` | Icon class/name |
| `type` | `route` | Loại menu |
| `status` | `active` | Trạng thái |
| `parent_id` | `null` | ID menu cha |
| `sort_order` | `0` | Thứ tự sắp xếp |
| `is_public` | `false` | Menu công khai |
| `show_in_menu` | `true` | Hiển thị trong menu |
| `required_permission_id` | `null` | ID permission bắt buộc |

### Trường Lấy Từ API Khác

| Trường | API Nguồn | Mô tả |
|--------|-----------|-------|
| `required_permission_id` | `GET /admin/permissions` | Lấy danh sách permissions để chọn |
| `parent_id` | `GET /admin/menus` hoặc `GET /admin/menus/tree` | Lấy danh sách menu để chọn menu cha |

**Ví dụ:**
- Khi tạo menu, FE cần gọi `GET /admin/permissions` để lấy danh sách permissions và hiển thị dropdown
- Khi chọn menu cha, FE cần gọi `GET /admin/menus/tree` để hiển thị tree selector

### Trường Chỉ Có Trong Response (Không Gửi Khi Create/Update)

| Trường | Mô tả |
|--------|-------|
| `parent` | Object menu cha (relation) |
| `children` | Array menu con (relation) |
| `required_permission` | Object permission (relation) |
| `menu_permissions` | Array menu permissions (relation) |
| `allowed` | Chỉ có trong API user menu, cho biết user có quyền truy cập |

---

## Enums và Constants

### MenuType

```typescript
enum MenuType {
  ROUTE = 'route',    // Menu route nội bộ
  GROUP = 'group',    // Menu group (header không click được)
  LINK = 'link'       // Menu link ngoài
}
```

**Labels:**
- `route`: "Route"
- `group`: "Group"
- `link`: "Link"

### BasicStatus

```typescript
enum BasicStatus {
  Active = 'active',
  Inactive = 'inactive'
}
```

**Labels:**
- `active`: "Hoạt động"
- `inactive`: "Ngừng hoạt động"

---

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": {
    "field": ["Error detail"]
  }
}
```

### Common Error Codes

| Code | Status | Mô tả |
|------|--------|-------|
| `MENU_CODE_EXISTS` | 400 | Menu code đã tồn tại |
| `MENU_NOT_FOUND` | 404 | Menu không tồn tại |
| `PARENT_MENU_NOT_FOUND` | 400 | Menu cha không tồn tại |
| `PERMISSION_NOT_FOUND` | 400 | Permission không tồn tại |
| `UNAUTHORIZED` | 401 | Chưa đăng nhập |
| `FORBIDDEN` | 403 | Không có quyền truy cập |

### Validation Errors

Khi validation fail, response sẽ có format:

```json
{
  "statusCode": 400,
  "message": [
    "Menu code must be between 3 and 120 characters",
    "Menu name is required"
  ],
  "error": "Bad Request"
}
```

---

## Ví Dụ Tích Hợp

### 1. Lấy Danh Sách Menu (Admin)

```typescript
// Vue/React example
const fetchMenus = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...filters
  });
  
  const response = await fetch(`/admin/menus?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

### 2. Tạo Menu Mới

```typescript
const createMenu = async (menuData) => {
  const response = await fetch('/admin/menus', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      code: menuData.code,
      name: menuData.name,
      path: menuData.path,
      icon: menuData.icon,
      type: menuData.type || 'route',
      status: menuData.status || 'active',
      parent_id: menuData.parent_id || null,
      sort_order: menuData.sort_order || 0,
      is_public: menuData.is_public || false,
      show_in_menu: menuData.show_in_menu !== false,
      required_permission_id: menuData.required_permission_id || null
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};
```

### 3. Lấy Menu Tree Cho User

```typescript
const fetchUserMenus = async (flatten = false) => {
  const params = new URLSearchParams();
  if (flatten) params.append('flatten', 'true');
  
  const response = await fetch(`/api/admin/user/menus?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const menus = await response.json();
  return menus;
};
```

### 4. Render Menu Tree (Vue Example)

```vue
<template>
  <div>
    <menu-item
      v-for="menu in menuTree"
      :key="menu.id"
      :menu="menu"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const menuTree = ref([]);

onMounted(async () => {
  menuTree.value = await fetchUserMenus();
});
</script>
```

### 5. Form Tạo Menu (Vue Example)

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>Code *</label>
      <input v-model="form.code" required />
    </div>
    
    <div>
      <label>Name *</label>
      <input v-model="form.name" required />
    </div>
    
    <div>
      <label>Path</label>
      <input v-model="form.path" />
    </div>
    
    <div>
      <label>Icon</label>
      <input v-model="form.icon" />
    </div>
    
    <div>
      <label>Type</label>
      <select v-model="form.type">
        <option value="route">Route</option>
        <option value="group">Group</option>
        <option value="link">Link</option>
      </select>
    </div>
    
    <div>
      <label>Parent Menu</label>
      <select v-model="form.parent_id">
        <option :value="null">Root</option>
        <option v-for="menu in parentMenus" :key="menu.id" :value="menu.id">
          {{ menu.name }}
        </option>
      </select>
    </div>
    
    <div>
      <label>Required Permission</label>
      <select v-model="form.required_permission_id">
        <option :value="null">None</option>
        <option v-for="perm in permissions" :key="perm.id" :value="perm.id">
          {{ perm.name }} ({{ perm.code }})
        </option>
      </select>
    </div>
    
    <button type="submit">Create</button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const form = ref({
  code: '',
  name: '',
  path: '',
  icon: '',
  type: 'route',
  parent_id: null,
  required_permission_id: null
});

const parentMenus = ref([]);
const permissions = ref([]);

onMounted(async () => {
  // Load parent menus
  const menuResponse = await fetch('/admin/menus/tree');
  parentMenus.value = await menuResponse.json();
  
  // Load permissions
  const permResponse = await fetch('/admin/permissions');
  const permData = await permResponse.json();
  permissions.value = permData.data || permData;
});

const handleSubmit = async () => {
  try {
    await createMenu(form.value);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
</script>
```

---

## Checklist Tích Hợp

### Admin Menu Management
- [ ] Lấy danh sách menu với pagination và filter
- [ ] Lấy menu tree để hiển thị selector
- [ ] Lấy chi tiết menu khi edit
- [ ] Tạo menu mới với validation
- [ ] Cập nhật menu
- [ ] Xóa menu với confirmation
- [ ] Load permissions từ API `/admin/permissions` cho dropdown
- [ ] Xử lý error cases (code trùng, parent không tồn tại, etc.)

### User Menu Display
- [ ] Lấy menu tree cho user đã login
- [ ] Render menu tree với nested structure
- [ ] Highlight menu active dựa trên current route
- [ ] Ẩn/hiện menu dựa trên `allowed` flag
- [ ] Xử lý menu type (route, group, link)
- [ ] Xử lý icon display

---

## Lưu Ý Quan Trọng

1. **Code Uniqueness**: `code` phải unique, FE nên validate trước khi submit
2. **Parent Menu**: Khi chọn parent menu, không được chọn chính nó hoặc menu con của nó (FE nên filter)
3. **Permission**: `required_permission_id` phải lấy từ API permissions, không hardcode
4. **Tree Structure**: Menu tree được sắp xếp theo `sort_order`, FE nên giữ nguyên thứ tự
5. **User Menu**: API user menu tự động lọc theo permission, FE không cần filter thêm
6. **Soft Delete**: Menu đã xóa vẫn còn trong DB nhưng có `deleted_at`, FE nên filter khi hiển thị

---

## Support

Nếu có vấn đề khi tích hợp, vui lòng liên hệ Backend Team.

