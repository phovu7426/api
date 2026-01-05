# Group-Based Permissions API Documentation

Tài liệu này mô tả hệ thống phân quyền dựa trên **Group** cho Frontend tích hợp.

**⚠️ THAY ĐỔI QUAN TRỌNG:** Hệ thống đã chuyển từ **Context-based permissions** sang **Group-based permissions**.

---

## 📋 Mục lục

1. [Tổng quan về Group-Based Permissions](#tổng-quan)
2. [Header & Query Parameters](#header--query-parameters)
3. [Context & Group APIs](#context--group-apis)
4. [User & Role Management APIs](#user--role-management-apis)
5. [Migration Guide (Context → Group)](#migration-guide)
6. [Examples](#examples)

---

## 🎯 Tổng quan về Group-Based Permissions {#tổng-quan}

### Khái niệm

- **Group**: Một nhóm/phạm vi hoạt động (shop, team, project, department, ...)
- **Context**: Phạm vi dữ liệu, mỗi Group có một Context tương ứng
- **User Groups**: User có thể là member của nhiều Groups
- **User Role Assignments**: User có các roles khác nhau trong từng Group

### Luồng hoạt động

```
User → Member của Groups → Có roles trong mỗi Group → Có permissions theo roles
```

### So sánh với Context-based (CŨ)

| Context-based (CŨ) | Group-based (MỚI) |
|---------------------|-------------------|
| User có roles trực tiếp trong Context | User là member của Group, có roles trong Group |
| `user_context_roles` table | `user_groups` + `user_role_assignments` tables |
| Header: `X-Context-Id` | Header: `X-Group-Id` hoặc `X-Context-Id` (auto-resolve) |
| Query: `?context_id=1` | Query: `?group_id=1` hoặc `?context_id=1` (auto-resolve) |

---

## 🔧 Header & Query Parameters {#header--query-parameters}

### Chọn Group cho Request

**Option 1: Sử dụng `X-Group-Id` header (Ưu tiên)**
```http
GET /api/admin/users
X-Group-Id: 5
Authorization: Bearer {token}
```

**Option 2: Sử dụng `group_id` query parameter**
```http
GET /api/admin/users?group_id=5
Authorization: Bearer {token}
```

**Option 3: Sử dụng `X-Context-Id` header (Backward compatible)**
```http
GET /api/admin/users
X-Context-Id: 2
Authorization: Bearer {token}
```
> Nếu chỉ có `context_id`, hệ thống sẽ tự động resolve `group_id`:
> - Nếu context có đúng 1 group → dùng group đó
> - Nếu context có nhiều groups → lỗi 400 (cần chỉ định `group_id`)

**Option 4: Auto-resolve (Nếu user chỉ có 1 group trong context)**
```http
GET /api/admin/users
X-Context-Id: 2
Authorization: Bearer {token}
```
> Hệ thống tự động chọn group nếu user chỉ có 1 group trong context đó

### Headers được sử dụng

| Header | Type | Required | Mô tả |
|--------|------|----------|-------|
| `X-Group-Id` | number | ❌ | ID của group (ưu tiên cao nhất) |
| `X-Context-Id` | number | ❌ | ID của context (auto-resolve group) |
| `Authorization` | string | ✅ | Bearer token |

### Query Parameters

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `group_id` | number | ❌ | ID của group (alternative cho header) |
| `context_id` | number | ❌ | ID của context (alternative cho header) |

---

## 📡 Context & Group APIs {#context--group-apis}

### 1. Lấy danh sách Contexts user có thể truy cập

**Endpoint:** `GET /api/contexts/user-contexts`

**Authentication:** Required

**Mô tả:** Lấy danh sách contexts mà user là member của ít nhất 1 group trong context đó.

**Request:**
```http
GET /api/contexts/user-contexts
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "system",
      "ref_id": null,
      "name": "System",
      "code": "system",
      "status": "active",
      "groups": [
        {
          "id": 1,
          "code": "SYSTEM_ADMIN",
          "name": "System Administrators",
          "type": "system"
        }
      ]
    },
    {
      "id": 2,
      "type": "shop",
      "ref_id": 101,
      "name": "Shop Trung Tâm",
      "code": "shop_101",
      "status": "active",
      "groups": [
        {
          "id": 5,
          "code": "shop-001",
          "name": "Shop Trung Tâm",
          "type": "shop"
        }
      ]
    }
  ]
}
```

---

### 2. Lấy danh sách Groups user có thể truy cập

**Endpoint:** `GET /api/admin/groups`

**Authentication:** Optional

**Mô tả:** Lấy danh sách groups (có phân trang, filter, search).

**Request:**
```http
GET /api/admin/groups?page=1&limit=10&filters[type]=shop
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (number): Trang hiện tại (default: 1)
- `limit` (number): Số items mỗi trang (default: 10)
- `filters[type]` (string): Lọc theo type (shop, team, project, ...)
- `filters[status]` (string): Lọc theo status (active, inactive)
- `search` (string): Tìm kiếm theo name/code
- `sortBy` (string): Sắp xếp theo field (created_at, name, ...)
- `sortOrder` (string): ASC hoặc DESC

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "type": "shop",
      "code": "shop-001",
      "name": "Shop Trung Tâm",
      "description": "Cửa hàng trung tâm thành phố",
      "status": "active",
      "context_id": 2,
      "owner_id": 1,
      "metadata": {
        "address": "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
        "phone": "0281234567"
      },
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
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

---

### 3. Lấy Groups của User hiện tại

**Endpoint:** `GET /api/contexts/my-groups`

**Authentication:** Required

**Mô tả:** Lấy danh sách groups mà user hiện tại là member.

**Request:**
```http
GET /api/contexts/my-groups
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "SYSTEM_ADMIN",
      "name": "System Administrators",
      "type": "system",
      "context_id": 1,
      "joined_at": "2024-01-15T10:00:00.000Z",
      "roles": [
        {
          "id": 1,
          "code": "system_admin",
          "name": "System Administrator"
        }
      ]
    },
    {
      "id": 5,
      "code": "shop-001",
      "name": "Shop Trung Tâm",
      "type": "shop",
      "context_id": 2,
      "joined_at": "2024-01-15T11:00:00.000Z",
      "roles": [
        {
          "id": 3,
          "code": "admin",
          "name": "Administrator"
        }
      ]
    }
  ]
}
```

---

### 4. Switch Group/Context

**Endpoint:** `POST /api/contexts/switch`

**Authentication:** Required

**Mô tả:** Chuyển đổi group/context hiện tại (để lưu vào session/localStorage của FE).

**Request:**
```http
POST /api/contexts/switch
Authorization: Bearer {token}
Content-Type: application/json

{
  "group_id": 5
}
```

**Hoặc:**
```http
POST /api/contexts/switch
Authorization: Bearer {token}
Content-Type: application/json

{
  "context_id": 2
}
```

**Request Body:**
| Trường | Type | Required | Mô tả |
|--------|------|----------|-------|
| `group_id` | number | ❌ | ID của group (ưu tiên) |
| `context_id` | number | ❌ | ID của context (nếu user chỉ có 1 group trong context) |

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": 5,
      "code": "shop-001",
      "name": "Shop Trung Tâm",
      "type": "shop"
    },
    "context": {
      "id": 2,
      "type": "shop",
      "name": "Shop Trung Tâm"
    },
    "message": "Group switched. Use X-Group-Id header or ?group_id query param in subsequent requests."
  }
}
```

**Lưu ý:**
- API này chỉ trả về thông tin group/context, không lưu trên server
- FE cần tự lưu `group_id` vào localStorage/session và gửi trong các request tiếp theo
- Hoặc FE có thể gửi `X-Group-Id` header trực tiếp mà không cần gọi API này

---

## 👥 User & Role Management APIs {#user--role-management-apis}

### 1. Lấy danh sách Users trong Group

**Endpoint:** `GET /api/admin/users`

**Authentication:** Required

**Permission:** `user.read` (trong group hiện tại)

**Mô tả:** Lấy danh sách users, tự động filter theo `X-Group-Id` header.

**Request:**
```http
GET /api/admin/users?page=1&limit=10
X-Group-Id: 5
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "status": "active",
      "profile": {
        "full_name": "Administrator",
        "phone": "0123456789"
      },
      "user_role_assignments": [
        {
          "id": 10,
          "role_id": 3,
          "group_id": 5,
          "role": {
            "id": 3,
            "code": "admin",
            "name": "Administrator"
          }
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 15
  }
}
```

---

### 2. Gán Roles cho User trong Group

**Endpoint:** `POST /api/admin/rbac/sync-roles`

**Authentication:** Required

**Permission:** `rbac.manage` (trong group hiện tại)

**Mô tả:** Đồng bộ roles cho user trong group (xóa roles cũ và gán roles mới).

**Request:**
```http
POST /api/admin/rbac/sync-roles
X-Group-Id: 5
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 10,
  "role_ids": [3, 4, 5]
}
```

**Request Body:**
| Trường | Type | Required | Mô tả |
|--------|------|----------|-------|
| `user_id` | number | ✅ | ID của user |
| `role_ids` | number[] | ✅ | Danh sách role IDs |

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 10,
    "group_id": 5,
    "role_ids": [3, 4, 5],
    "message": "Roles synced successfully"
  }
}
```

**Lưu ý:**
- `group_id` được lấy từ `X-Group-Id` header hoặc `?group_id` query param
- Nếu không có `group_id`, sẽ lỗi 400

---

### 3. Thêm Member vào Group

**Endpoint:** `POST /api/groups/:id/members`

**Authentication:** Required

**Permission:** `group.member.manage` (trong group)

**Mô tả:** Thêm user vào group và gán roles.

**Request:**
```http
POST /api/groups/5/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 15,
  "role_ids": [4]
}
```

**Request Body:**
| Trường | Type | Required | Mô tả |
|--------|------|----------|-------|
| `user_id` | number | ✅ | ID của user |
| `role_ids` | number[] | ✅ | Danh sách role IDs để gán |

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 15,
    "group_id": 5,
    "role_ids": [4],
    "message": "Member added successfully"
  }
}
```

---

### 4. Xóa Member khỏi Group

**Endpoint:** `DELETE /api/groups/:id/members/:user_id`

**Authentication:** Required

**Permission:** `group.member.manage` (trong group)

**Mô tả:** Xóa user khỏi group (sẽ xóa tất cả roles của user trong group).

**Request:**
```http
DELETE /api/groups/5/members/15
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Member removed successfully"
  }
}
```

---

### 5. Lấy danh sách Members của Group

**Endpoint:** `GET /api/groups/:id/members`

**Authentication:** Required

**Permission:** `group.read` (trong group)

**Request:**
```http
GET /api/groups/5/members
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com"
      },
      "role_id": 3,
      "role": {
        "id": 3,
        "code": "admin",
        "name": "Administrator"
      }
    }
  ]
}
```

---

## 🔄 Migration Guide (Context → Group) {#migration-guide}

### Thay đổi chính

1. **Header thay đổi:**
   - ❌ CŨ: `X-Context-Id: 2`
   - ✅ MỚI: `X-Group-Id: 5` (hoặc vẫn dùng `X-Context-Id` nếu auto-resolve được)

2. **Query parameter thay đổi:**
   - ❌ CŨ: `?context_id=2`
   - ✅ MỚI: `?group_id=5` (hoặc vẫn dùng `?context_id=2` nếu auto-resolve được)

3. **API response thay đổi:**
   - Users response có `user_role_assignments` thay vì `user_context_roles`
   - Mỗi assignment có `group_id` thay vì `context_id`

### Checklist Migration

- [ ] Thay `X-Context-Id` bằng `X-Group-Id` trong các request cần thiết
- [ ] Cập nhật logic lấy danh sách groups user có thể truy cập
- [ ] Cập nhật logic switch context → switch group
- [ ] Cập nhật UI hiển thị groups thay vì contexts
- [ ] Cập nhật logic gán roles cho user (cần `group_id`)

---

## 📝 Examples {#examples}

### Example 1: Lấy users trong shop

```javascript
// Frontend code (JavaScript/TypeScript)
async function getShopUsers(shopGroupId) {
  const response = await fetch('/api/admin/users?page=1&limit=10', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Group-Id': shopGroupId.toString(),
    },
  });
  
  const result = await response.json();
  return result.data;
}
```

### Example 2: Switch group và lưu vào localStorage

```javascript
async function switchGroup(groupId) {
  const response = await fetch('/api/contexts/switch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ group_id: groupId }),
  });
  
  const result = await response.json();
  
  // Lưu vào localStorage
  localStorage.setItem('currentGroupId', groupId.toString());
  localStorage.setItem('currentGroup', JSON.stringify(result.data.group));
  
  return result.data;
}

// Sử dụng trong các request tiếp theo
function getAuthHeaders() {
  const groupId = localStorage.getItem('currentGroupId');
  return {
    'Authorization': `Bearer ${token}`,
    ...(groupId ? { 'X-Group-Id': groupId } : {}),
  };
}
```

### Example 3: Gán roles cho user trong group

```javascript
async function assignRolesToUser(userId, roleIds, groupId) {
  const response = await fetch('/api/admin/rbac/sync-roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Group-Id': groupId.toString(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      role_ids: roleIds,
    }),
  });
  
  return await response.json();
}
```

### Example 4: Lấy danh sách groups user có thể truy cập

```javascript
async function getUserGroups() {
  const response = await fetch('/api/contexts/my-groups', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const result = await response.json();
  
  // Hiển thị dropdown để user chọn group
  const groupSelect = document.getElementById('group-select');
  result.data.forEach(group => {
    const option = document.createElement('option');
    option.value = group.id;
    option.textContent = `${group.name} (${group.type})`;
    groupSelect.appendChild(option);
  });
  
  return result.data;
}
```

---

## 🚨 Error Codes

| Code | Message | Mô tả |
|------|---------|-------|
| `GROUP_NOT_FOUND` | Group not found | Group ID không tồn tại |
| `USER_NOT_MEMBER` | User is not a member of this group | User không phải member của group |
| `MULTIPLE_GROUPS_IN_CONTEXT` | Multiple groups found in context. Please specify group_id | Context có nhiều groups, cần chỉ định `group_id` |
| `PERMISSION_DENIED` | Access denied. Required permissions: ... | Không đủ quyền |

---

## 📚 Related Documentation

- [RBAC API Documentation](./rbac/admin/rbac.md)
- [User Management API Documentation](./user-management/admin/user.md)
- [Context API Documentation](./context/README.md)

---

**Last Updated:** 2025-01-15  
**API Version:** v2.0.0 (Group-Based Permissions)


