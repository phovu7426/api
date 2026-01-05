# Context & Groups API Documentation

Tài liệu API cho quản lý Context và Groups (shop, team, project, ...) với Global Context System.

**Base URL:** `http://localhost:8000/api`  
**Authentication:** JWT Bearer Token (bắt buộc cho các API protected)  
**Headers:** `Content-Type: application/json`

---

## 📋 Mục Lục

1. [Context APIs](#context-apis)
2. [Groups APIs](#groups-apis)
3. [Context Resolution](#context-resolution)
4. [Permissions](#permissions)

---

## 🔄 Context APIs

### 1. Lấy Danh Sách Contexts Của User

**Endpoint:** `GET /api/user/contexts`

**Authentication:** Optional (nếu không đăng nhập trả về `[]`)

**Request:**
```http
GET /api/user/contexts
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
      "name": "System"
    },
    {
      "id": 2,
      "type": "shop",
      "ref_id": 1,
      "name": "Shop A"
    },
    {
      "id": 3,
      "type": "team",
      "ref_id": 2,
      "name": "Development Team"
    }
  ]
}
```

**Trường tự sinh (API tự động tạo):**
- `id` - Tự động sinh bởi API
- `type` - Tự động từ group type
- `ref_id` - ID của group (NULL cho system context)

**Trường cần gửi từ FE:**
- Không có (GET request)

---

### 2. Chuyển Context

**Endpoint:** `POST /api/user/contexts/switch`

**Authentication:** Required

**Request:**
```http
POST /api/user/contexts/switch
Authorization: Bearer {token}
Content-Type: application/json

{
  "context_id": 2
}
```

**Request Body:**
| Trường | Type | Required | Mô tả |
|--------|------|----------|-------|
| `context_id` | number | ✅ | ID của context muốn chuyển |

**Response:**
```json
{
  "success": true,
  "data": {
    "context": {
      "id": 2,
      "type": "shop",
      "ref_id": 1,
      "name": "Shop A"
    },
    "message": "Context switched. Use X-Context-Id header or ?context_id query param in subsequent requests."
  }
}
```

**Lưu ý:**
- Sau khi switch context, cần gửi `X-Context-Id` header hoặc `?context_id` query param trong các request tiếp theo
- Nếu không gửi → mặc định dùng system context (id=1)

---

## 🏢 Groups APIs

**📌 Phân biệt Routes:**
- **System Admin quản lý Groups:** `/api/admin/groups` (tạo, sửa, xóa group)
- **Owner/User quản lý Members:** `/api/groups/:id/members` (thêm, xóa, phân quyền members)

**Lý do:** Route `/api/groups/:id/members` không có "admin" vì đây là quản lý trong context của group, không phải system admin. Permission check sẽ quyết định ai được phép (owner hoặc user có permission trong context).

---

### 1. Tạo Group Mới

**Endpoint:** `POST /api/admin/groups`

**Authentication:** Required

**Permission:** `system.group.create` (chỉ system admin mới được tạo group)

**Request:**
```http
POST /api/admin/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "team",
  "code": "team-dev",
  "name": "Development Team",
  "description": "Nhóm phát triển",
  "metadata": {
    "leader": "John Doe",
    "members_count": 5
  }
}
```

**Request Body:**
| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `type` | string | ✅ | Loại group: `shop`, `team`, `project`, `department`, `organization`, ... | ❌ |
| `code` | string | ✅ | Mã code unique: `shop-001`, `team-dev`, `project-abc`, ... | ❌ |
| `name` | string | ✅ | Tên group | ❌ |
| `description` | string | ❌ | Mô tả group | ❌ |
| `metadata` | object | ❌ | Thông tin bổ sung (JSON): shop có `address`, `phone`; team có `leader`, `members_count`; ... | ❌ |

**Trường tự sinh (API tự động tạo, KHÔNG cần gửi từ FE):**
- `id` - Tự động sinh
- `owner_id` - Tự động = user hiện tại (từ token)
- `status` - Tự động = `'active'`
- `created_at`, `updated_at` - Tự động
- `context` - Tự động tạo context tương ứng
- `context.id` - ID của context được tạo
- `context.type` - Tự động = group type
- `context.ref_id` - Tự động = group id
- `context.name` - Tự động = group name
- Owner role - Tự động gán role `admin` cho owner trong context

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": 1,
      "type": "team",
      "code": "team-dev",
      "name": "Development Team",
      "description": "Nhóm phát triển",
      "status": "active",
      "owner_id": 5,
      "metadata": {
        "leader": "John Doe",
        "members_count": 5
      },
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    },
    "context": {
      "id": 2,
      "type": "team",
      "ref_id": 1,
      "name": "Development Team",
      "status": "active"
    }
  }
}
```

**Lưu ý:**
- ⚠️ **Chỉ system admin mới được tạo group** (phải có permission `system.group.create` trong system context)
- Owner tự động được gán role `admin` trong context của group
- Context được tạo tự động với `type` = group type, `ref_id` = group id

---

### 2. Lấy Danh Sách Groups Theo Type

**Endpoint:** `GET /api/admin/groups/type/:type`

**Authentication:** Optional

**Request:**
```http
GET /api/admin/groups/type/team
Authorization: Bearer {token}
```

**URL Parameters:**
| Trường | Type | Required | Mô tả |
|--------|------|----------|-------|
| `type` | string | ✅ | Loại group: `shop`, `team`, `project`, ... |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "team",
      "code": "team-dev",
      "name": "Development Team",
      "description": "Nhóm phát triển",
      "status": "active",
      "owner_id": 5,
      "metadata": {
        "leader": "John Doe",
        "members_count": 5
      },
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Lấy Group Theo ID

**Endpoint:** `GET /api/admin/groups/:id`

**Authentication:** Optional

**Request:**
```http
GET /api/admin/groups/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "team",
    "code": "team-dev",
    "name": "Development Team",
    "description": "Nhóm phát triển",
    "status": "active",
    "owner_id": 5,
    "metadata": {
      "leader": "John Doe",
      "members_count": 5
    },
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 4. Cập Nhật Group

**Endpoint:** `PUT /api/admin/groups/:id`

**Authentication:** Required

**Permission:** `system.group.update` (chỉ system admin)

**Request:**
```http
PUT /api/admin/groups/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Development Team Updated",
  "description": "Nhóm phát triển - Updated",
  "metadata": {
    "leader": "Jane Smith",
    "members_count": 8
  }
}
```

**Request Body:**
| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `name` | string | ❌ | Tên group mới | ❌ |
| `description` | string | ❌ | Mô tả mới | ❌ |
| `metadata` | object | ❌ | Metadata mới | ❌ |

**Trường không được thay đổi:**
- `id` - Không thể thay đổi
- `type` - Không thể thay đổi
- `code` - Không thể thay đổi
- `owner_id` - Không thể thay đổi
- `status` - Không thể thay đổi (dùng DELETE để soft delete)

**Trường tự sinh (API tự động xử lý, KHÔNG cần gửi từ FE):**
- `updated_at` - Tự động cập nhật
- Context name - Tự động cập nhật nếu group name thay đổi

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "team",
    "code": "team-dev",
    "name": "Development Team Updated",
    "description": "Nhóm phát triển - Updated",
    "status": "active",
    "owner_id": 5,
    "metadata": {
      "leader": "Jane Smith",
      "members_count": 8
    },
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Lưu ý:**
- ⚠️ **Chỉ system admin mới có thể update group** (phải có permission `system.group.update` trong system context)
- Nếu `name` thay đổi, context name cũng tự động cập nhật

---

### 5. Xóa Group

**Endpoint:** `DELETE /api/admin/groups/:id`

**Authentication:** Required

**Permission:** `system.group.delete` (chỉ system admin)

**Request:**
```http
DELETE /api/admin/groups/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Group deleted successfully"
  }
}
```

**Lưu ý:**
- ⚠️ **Chỉ system admin mới có thể xóa group** (phải có permission `system.group.delete` trong system context)
- Soft delete (set `status = 'inactive'`)
- Context cũng bị soft delete

---

## 👥 Group Members APIs

**Lưu ý:** Các API quản lý members sử dụng route `/api/groups/:id/members` (không có "admin") vì đây là quản lý trong context của group, không phải system admin. Permission check sẽ quyết định ai được phép (owner hoặc user có permission trong context).

### 1. Thêm Member Vào Group

**Endpoint:** `POST /api/groups/:id/members`

**Authentication:** Required

**Permission:** `group.member.add` + Owner hoặc có quyền quản lý group

**Request:**
```http
POST /api/groups/1/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 10,
  "role_ids": [3, 4]
}
```

**Request Body:**
| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `user_id` | number | ✅ | ID của user muốn thêm vào group | ❌ |
| `role_ids` | number[] | ✅ | Mảng role IDs gán cho user trong context của group | ❌ |

**Trường tự sinh (API tự động tạo, KHÔNG cần gửi từ FE):**
- `context_id` - Tự động lấy từ group (tìm context có `ref_id` = group id)
- `user_context_role` records - Tự động tạo trong database

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Member added successfully"
  }
}
```

**Lưu ý:**
- Nếu user đã có roles trong context này, sẽ bị thay thế bằng roles mới
- Owner luôn có quyền thêm member (không cần check permission)

---

### 2. Gán Roles Cho Member

**Endpoint:** `PUT /api/groups/:id/members/:memberId/roles`

**Authentication:** Required

**Permission:** `group.member.manage` + Owner hoặc có quyền quản lý group

**Request:**
```http
PUT /api/groups/1/members/10/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [2, 3]
}
```

**URL Parameters:**
| Trường | Type | Required | Mô tả |
|--------|------|----------|-------|
| `id` | number | ✅ | ID của group |
| `memberId` | number | ✅ | ID của user (member) |

**Request Body:**
| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `role_ids` | number[] | ✅ | Mảng role IDs mới (thay thế toàn bộ roles cũ) | ❌ |

**Trường tự sinh (API tự động xử lý, KHÔNG cần gửi từ FE):**
- `context_id` - Tự động lấy từ group
- Roles cũ - Tự động xóa và thay bằng roles mới
- Cache invalidation - Tự động clear cache permissions

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Roles assigned successfully"
  }
}
```

**Lưu ý:**
- Thay thế toàn bộ roles cũ bằng roles mới
- Nếu `role_ids = []` → xóa hết roles của member trong context

---

### 3. Xóa Member Khỏi Group

**Endpoint:** `DELETE /api/groups/:id/members/:memberId`

**Authentication:** Required

**Permission:** `group.member.remove` + Owner hoặc có quyền quản lý group

**Request:**
```http
DELETE /api/groups/1/members/10
Authorization: Bearer {token}
```

**URL Parameters:**
| Trường | Type | Required | Mô tả |
|--------|------|----------|-------|
| `id` | number | ✅ | ID của group |
| `memberId` | number | ✅ | ID của user (member) |

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Member removed successfully"
  }
}
```

**Lưu ý:**
- Xóa tất cả roles của member trong context của group
- Không cho phép xóa owner khỏi group

---

### 4. Lấy Danh Sách Members Của Group

**Endpoint:** `GET /api/groups/:id/members`

**Authentication:** Optional

**Request:**
```http
GET /api/groups/1/members
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 5,
      "user": {
        "id": 5,
        "username": "admin",
        "email": "admin@example.com"
      },
      "role_id": 1,
      "role": {
        "id": 1,
        "code": "admin",
        "name": "Admin"
      }
    },
    {
      "user_id": 10,
      "user": {
        "id": 10,
        "username": "user1",
        "email": "user1@example.com"
      },
      "role_id": 3,
      "role": {
        "id": 3,
        "code": "editor",
        "name": "Editor"
      }
    }
  ]
}
```

---

## 🔐 Context Resolution

### Cách Sử Dụng Context Trong Requests

Sau khi user chọn context (từ danh sách contexts hoặc switch context), cần gửi `context_id` trong các request tiếp theo:

**Cách 1: Header (Recommended)**
```http
GET /api/admin/products
Authorization: Bearer {token}
X-Context-Id: 2
```

**Cách 2: Query Parameter**
```http
GET /api/admin/products?context_id=2
Authorization: Bearer {token}
```

**Cách 3: Mặc định**
- Nếu không gửi `X-Context-Id` hoặc `?context_id` → tự động dùng system context (id=1)

---

## 🔑 Permissions

### Group Permissions

**System-level Permissions (chỉ system admin - quản lý groups):**
| Permission | Mô tả | Scope |
|------------|-------|-------|
| `system.group.create` | Tạo group mới | system |
| `system.group.update` | Sửa group | system |
| `system.group.delete` | Xóa group | system |
| `system.group.manage` | Quản lý tất cả groups | system |

**Context-level Permissions (owner hoặc user có quyền trong context - quản lý members):**
| Permission | Mô tả | Scope |
|------------|-------|-------|
| `group.read` | Xem group | context |
| `group.manage` | Quản lý group (members) | context |
| `group.member.add` | Thêm member vào group | context |
| `group.member.manage` | Quản lý roles của member | context |
| `group.member.remove` | Xóa member khỏi group | context |

### Owner Permissions

- Owner luôn có quyền quản lý group (không cần check permission)
- Owner có thể thêm/xóa/sửa members
- Owner có thể gán roles cho members
- Không cho phép xóa owner khỏi group

---

## 📝 Ví Dụ Tích Hợp

### Flow Tạo Team Và Thêm Members

**1. System admin tạo team:**
```bash
curl -X POST http://localhost:8000/api/admin/groups \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "team",
    "code": "team-frontend",
    "name": "Frontend Team",
    "description": "Nhóm frontend developers"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": 5,
      "type": "team",
      "code": "team-frontend",
      "name": "Frontend Team",
      "description": "Nhóm frontend developers",
      "status": "active",
      "owner_id": 1,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    },
    "context": {
      "id": 10,
      "type": "team",
      "ref_id": 5,
      "name": "Frontend Team",
      "status": "active"
    }
  }
}
```

**Lưu ý:**
- `owner_id` tự động = user từ token
- `context` tự động được tạo
- Owner tự động có role `admin` trong context

**2. Owner thêm members:**
```bash
curl -X POST http://localhost:8000/api/groups/5/members \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 20,
    "role_ids": [3]
  }'
```

**3. Member sử dụng context:**
```bash
curl -X GET http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer {token}" \
  -H "X-Context-Id: 10"
```

→ Check permissions trong context của team (id=10)

---

### Flow Tạo Shop Và Phân Quyền

**1. System admin tạo shop:**
```bash
curl -X POST http://localhost:8000/api/admin/groups \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "shop",
    "code": "shop-001",
    "name": "Shop A",
    "description": "Cửa hàng A",
    "metadata": {
      "address": "123 Main St",
      "phone": "0123456789",
      "email": "shop-a@example.com"
    }
  }'
```

**2. Owner thêm staff và phân quyền:**
```bash
# Thêm staff với role editor
curl -X POST http://localhost:8000/api/groups/1/members \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 15,
    "role_ids": [4]
  }'
```

**3. Staff sử dụng shop context:**
```bash
# Lấy context_id từ response khi tạo shop (ví dụ: context.id = 2)
curl -X GET http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer {token}" \
  -H "X-Context-Id: 2"
```

→ Staff chỉ có permissions trong context của shop, không có trong system context

---

## ⚠️ Lưu Ý

1. **Quản Lý Group - Chỉ System Admin:**
   - ⚠️ **Chỉ system admin mới được tạo, sửa, xóa group** (phải có permission `system.group.*` trong system context)
   - Khi tạo group, `owner_id` tự động = user hiện tại (system admin)
   - Owner tự động được gán role `admin` trong context của group

2. **Quản Lý Members - Owner hoặc User có quyền:**
   - Owner của group luôn có quyền quản lý members (thêm, xóa, phân quyền)
   - User có permission `group.member.*` trong context của group cũng có quyền quản lý members

3. **Context tự động:**
   - Mỗi group tự động có 1 context tương ứng
   - Context `type` = group `type`
   - Context `ref_id` = group `id`

4. **Phân Quyền:**
   - **Tạo/Sửa/Xóa group:** Chỉ system admin (permission `system.group.*`)
   - **Quản lý members:** Owner luôn có quyền (không cần check permission) hoặc user có permission `group.member.*` trong context

5. **Metadata:**
   - Lưu thông tin bổ sung theo type (shop có address, team có leader, ...)
   - Format JSON, có thể mở rộng tùy ý

---

---

## 📊 Tóm Tắt Trường Cần Gửi vs Tự Sinh

### POST /api/admin/groups (Tạo Group) - Chỉ System Admin

**Trường cần gửi từ FE:**
- ✅ `type` - Loại group (shop, team, project, ...)
- ✅ `code` - Mã code unique
- ✅ `name` - Tên group
- ❌ `description` - Optional
- ❌ `metadata` - Optional

**Trường tự sinh (KHÔNG cần gửi):**
- ❌ `id` - Tự động
- ❌ `owner_id` - Tự động = user từ token
- ❌ `status` - Tự động = 'active'
- ❌ `created_at`, `updated_at` - Tự động
- ❌ `context` - Tự động tạo
- ❌ Owner role - Tự động gán admin role

### POST /api/groups/:id/members (Thêm Member) - Owner hoặc User có quyền

**Trường cần gửi từ FE:**
- ✅ `user_id` - ID của user muốn thêm
- ✅ `role_ids` - Mảng role IDs

**Trường tự sinh (KHÔNG cần gửi):**
- ❌ `context_id` - Tự động lấy từ group
- ❌ `user_context_role` records - Tự động tạo

### PUT /api/groups/:id/members/:memberId/roles (Gán Roles) - Owner hoặc User có quyền

**Trường cần gửi từ FE:**
- ✅ `role_ids` - Mảng role IDs mới

**Trường tự sinh (KHÔNG cần gửi):**
- ❌ `context_id` - Tự động lấy từ group
- ❌ Roles cũ - Tự động xóa
- ❌ Cache - Tự động clear

---

## ❌ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Group with code \"team-dev\" already exists",
  "code": "BAD_REQUEST"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden

**Không phải system admin khi tạo/sửa/xóa group:**
```json
{
  "success": false,
  "message": "Only system admin can create groups",
  "code": "FORBIDDEN"
}
```

**Không có quyền quản lý members:**
```json
{
  "success": false,
  "message": "You do not have permission to add members to this group",
  "code": "FORBIDDEN"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Group not found",
  "code": "NOT_FOUND"
}
```

---

## 🎯 Quick Reference

### Context Resolution

| Trường hợp | Header/Query | Context được dùng |
|------------|--------------|-------------------|
| Có `X-Context-Id: 2` | Header | Context id=2 |
| Có `?context_id=2` | Query | Context id=2 |
| Không có | - | System context (id=1) |

### System Admin vs Owner vs User có permission

| Hành động | System Admin | Owner | User có permission |
|-----------|--------------|-------|-------------------|
| Create group | ✅ | ❌ | ❌ |
| Update group | ✅ | ❌ | ❌ |
| Delete group | ✅ | ❌ | ❌ |
| Add member | ❌ | ✅ | ✅ (nếu có `group.member.add`) |
| Manage roles | ❌ | ✅ | ✅ (nếu có `group.member.manage`) |
| Remove member | ❌ | ✅ | ✅ (nếu có `group.member.remove`) |

---

**Xem thêm:**
- [RBAC API Documentation](../rbac/README.md)
- [Global Context Upgrade Plan](../../core/global-context-upgrade-plan.md)

