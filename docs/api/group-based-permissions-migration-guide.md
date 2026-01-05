# Group-Based Permissions - API Migration Guide

Tài liệu chi tiết về các thay đổi API khi chuyển từ Context-based sang Group-based Permissions.

**⚠️ QUAN TRỌNG:** Hệ thống đã chuyển sang **Group-based permissions**. Tài liệu này mô tả rõ ràng API nào cần giữ, bỏ, cập nhật hoặc thêm mới.

---

## 📋 Mục lục

1. [Tổng quan thay đổi](#tổng-quan-thay-đổi)
2. [API cần GIỮ LẠI (vẫn hoạt động)](#api-cần-giữ-lại)
3. [API cần CẬP NHẬT](#api-cần-cập-nhật)
4. [API MỚI cần thêm](#api-mới-cần-thêm)
5. [API DEPRECATED (bỏ đi hoặc không dùng nữa)](#api-deprecated)
6. [Headers & Query Parameters](#headers--query-parameters)
7. [Migration Checklist cho FE](#migration-checklist-cho-fe)

---

## 🎯 Tổng quan thay đổi {#tổng-quan-thay-đổi}

### Khái niệm mới

**Trước đây (Context-based):**
- User có roles trực tiếp trong Context
- Header: `X-Context-Id`
- Query: `?context_id=1`

**Hiện tại (Group-based):**
- User là member của Groups, có roles trong mỗi Group
- Header: `X-Group-Id` (ưu tiên) hoặc `X-Context-Id` (auto-resolve)
- Query: `?group_id=1` (ưu tiên) hoặc `?context_id=1` (auto-resolve)

### Luồng hoạt động mới

```
User → Member của Groups → Có roles trong mỗi Group → Có permissions theo roles
```

Mỗi Group thuộc về 1 Context. Khi user chọn Context, hệ thống sẽ tự động resolve Group (nếu context chỉ có 1 group) hoặc yêu cầu chọn Group cụ thể.

---

## ✅ API cần GIỮ LẠI (vẫn hoạt động) {#api-cần-giữ-lại}

### 1. `GET /api/user/contexts` - Lấy danh sách contexts user có thể truy cập

**Status:** ✅ **GIỮ NGUYÊN** (vẫn hoạt động bình thường)

**Endpoint:** `GET /api/user/contexts`

**Authentication:** Optional (nếu không đăng nhập trả về `[]`)

**Request:**
```http
GET /api/user/contexts
Authorization: Bearer {token}
```

**Response:** (KHÔNG THAY ĐỔI)
```json
[
  {
    "id": "1",
    "type": "system",
    "ref_id": null,
    "name": "System"
  },
  {
    "id": "2",
    "type": "shop",
    "ref_id": "1",
    "name": "Shop Trung Tâm"
  }
]
```

**Lưu ý:** API này vẫn hoạt động nhưng backend đã chuyển sang query từ `user_groups` thay vì `user_context_roles`.

---

### 2. `POST /api/user/contexts/switch` - Switch context

**Status:** ✅ **GIỮ NGUYÊN** (nhưng cần cập nhật để hỗ trợ `group_id`)

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

**Response:** (KHÔNG THAY ĐỔI)
```json
{
  "context": {
    "id": "2",
    "type": "shop",
    "ref_id": "1",
    "name": "Shop Trung Tâm"
  },
  "message": "Context switched. Use X-Context-Id header or ?context_id query param in subsequent requests."
}
```

**⚠️ Lưu ý:** API này vẫn hoạt động, nhưng **khuyến nghị** chuyển sang dùng API mới `POST /api/contexts/switch` với `group_id` để chính xác hơn.

---

### 3. `GET /api/admin/groups` - Lấy danh sách groups

**Status:** ✅ **GIỮ NGUYÊN** (đã có sẵn, vẫn hoạt động)

**Endpoint:** `GET /api/admin/groups`

**Authentication:** Optional

**Request:**
```http
GET /api/admin/groups?page=1&limit=10&filters[type]=shop
Authorization: Bearer {token}
```

**Response:** (KHÔNG THAY ĐỔI)
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
      "metadata": {...},
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

---

### 4. `GET /api/admin/users` - Lấy danh sách users

**Status:** ✅ **GIỮ NGUYÊN** (nhưng response structure đã thay đổi)

**Endpoint:** `GET /api/admin/users`

**Authentication:** Required

**Permission:** `user.read` (trong group hiện tại)

**Request:**
```http
GET /api/admin/users?page=1&limit=10
X-Group-Id: 5
Authorization: Bearer {token}
```

**Response:** (✅ **ĐÃ THAY ĐỔI** - Xem phần "API cần cập nhật" bên dưới)

---

### 5. `GET /api/groups/:id/members` - Lấy danh sách members của group

**Status:** ✅ **GIỮ NGUYÊN** (đã có sẵn, vẫn hoạt động)

**Endpoint:** `GET /api/groups/:id/members`

**Authentication:** Optional

**Request:**
```http
GET /api/groups/5/members
Authorization: Bearer {token}
```

**Response:** (KHÔNG THAY ĐỔI)
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

## 🔄 API cần CẬP NHẬT {#api-cần-cập-nhật}

### 1. `POST /api/user/contexts/switch` - Hỗ trợ thêm `group_id`

**Status:** 🔄 **CẬP NHẬT** (thêm hỗ trợ `group_id` nhưng vẫn backward compatible)

**Endpoint:** `POST /api/user/contexts/switch`

**Authentication:** Required

**Request (CŨ - vẫn hoạt động):**
```http
POST /api/user/contexts/switch
Authorization: Bearer {token}
Content-Type: application/json

{
  "context_id": 2
}
```

**Request (MỚI - khuyến nghị):**
```http
POST /api/user/contexts/switch
Authorization: Bearer {token}
Content-Type: application/json

{
  "group_id": 5
}
```

**Hoặc cả hai:**
```http
POST /api/user/contexts/switch
Authorization: Bearer {token}
Content-Type: application/json

{
  "context_id": 2,
  "group_id": 5
}
```

**Response (CŨ - vẫn giữ nguyên):**
```json
{
  "context": {
    "id": "2",
    "type": "shop",
    "ref_id": "1",
    "name": "Shop Trung Tâm"
  },
  "message": "Context switched. Use X-Context-Id header or ?context_id query param in subsequent requests."
}
```

**Response (MỚI - nếu gửi `group_id`):**
```json
{
  "group": {
    "id": 5,
    "code": "shop-001",
    "name": "Shop Trung Tâm",
    "type": "shop"
  },
  "context": {
    "id": "2",
    "type": "shop",
    "name": "Shop Trung Tâm"
  },
  "message": "Group switched. Use X-Group-Id header or ?group_id query param in subsequent requests."
}
```

**Khuyến nghị:** FE nên cập nhật để gửi `group_id` thay vì chỉ `context_id` để chính xác hơn.

---

### 2. `GET /api/admin/users` - Response structure đã thay đổi

**Status:** 🔄 **CẬP NHẬT** (Response structure thay đổi)

**Endpoint:** `GET /api/admin/users`

**Authentication:** Required

**Permission:** `user.read` (trong group hiện tại)

**Request:**
```http
GET /api/admin/users?page=1&limit=10
X-Group-Id: 5
Authorization: Bearer {token}
```

**Response (CŨ - KHÔNG CÒN):**
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "user_context_roles": [...]  // ❌ KHÔNG CÒN
    }
  ]
}
```

**Response (MỚI - HIỆN TẠI):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "status": "active",
      "profile": {...},
      "user_role_assignments": [  // ✅ MỚI: Thay thế user_context_roles
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
  "meta": {...}
}
```

**⚠️ BREAKING CHANGE:** 
- Field `user_context_roles` → `user_role_assignments`
- Mỗi assignment có `group_id` thay vì `context_id`

**Action cho FE:**
- Cập nhật code parse response từ `user_context_roles` → `user_role_assignments`
- Cập nhật logic filter/search theo `group_id` thay vì `context_id`

---

### 3. `POST /api/admin/rbac/sync-roles` - Bây giờ yêu cầu `group_id`

**Status:** 🔄 **CẬP NHẬT** (Bây giờ yêu cầu `group_id` trong header/query)

**Endpoint:** `PUT /api/admin/users/:id/roles`

**Authentication:** Required

**Permission:** `rbac.manage` (trong group hiện tại)

**Request (CŨ - KHÔNG CÒN HOẠT ĐỘNG):**
```http
PUT /api/admin/users/10/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4, 5]
}
```

**Request (MỚI - BẮT BUỘC):**
```http
PUT /api/admin/users/10/roles
X-Group-Id: 5
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4, 5]
}
```

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

**⚠️ BREAKING CHANGE:** 
- Bây giờ **BẮT BUỘC** phải có `X-Group-Id` header hoặc `?group_id` query param
- Nếu không có → lỗi 400: "Group ID is required"

**Action cho FE:**
- Đảm bảo luôn gửi `X-Group-Id` header khi gọi API này
- Hoặc thêm `?group_id=5` vào query string

---

## 🆕 API MỚI cần thêm {#api-mới-cần-thêm}

### 1. `GET /api/contexts/my-groups` - Lấy danh sách groups của user hiện tại

**Status:** 🆕 **MỚI** (Cần thêm vào FE)

**Endpoint:** `GET /api/contexts/my-groups`

**Authentication:** Required

**Mô tả:** Lấy danh sách groups mà user hiện tại là member, kèm theo roles trong mỗi group.

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

**Use case:** 
- Hiển thị dropdown để user chọn group
- Hiển thị danh sách groups user có thể truy cập
- Kiểm tra roles của user trong từng group

**⚠️ Lưu ý:** API này chưa có trong backend hiện tại, cần implement. Tuy nhiên, FE có thể dùng `GET /api/admin/groups` và filter client-side dựa trên response.

---

### 2. `POST /api/contexts/switch` - Switch group/context (API mới, tốt hơn)

**Status:** 🆕 **MỚI** (Khuyến nghị dùng thay cho `/api/user/contexts/switch`)

**Endpoint:** `POST /api/contexts/switch`

**Authentication:** Required

**Mô tả:** Chuyển đổi group/context hiện tại. Tốt hơn API cũ vì hỗ trợ cả `group_id` và `context_id`.

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

**⚠️ Lưu ý:** API này có thể chưa có trong backend hiện tại. FE có thể tiếp tục dùng `POST /api/user/contexts/switch` với `group_id`.

---

## 🗑️ API DEPRECATED (bỏ đi hoặc không dùng nữa) {#api-deprecated}

### 1. Các API liên quan đến `user_context_roles`

**Status:** 🗑️ **DEPRECATED** (Không còn tồn tại trong backend)

**Các endpoint đã bỏ:**
- ❌ `GET /api/admin/users/:id/context-roles` (nếu có)
- ❌ `POST /api/admin/users/:id/context-roles` (nếu có)
- ❌ `PUT /api/admin/users/:id/context-roles` (nếu có)
- ❌ `DELETE /api/admin/users/:id/context-roles` (nếu có)

**Thay thế:**
- ✅ Dùng `PUT /api/admin/users/:id/roles` với `X-Group-Id` header

---

## 🔧 Headers & Query Parameters {#headers--query-parameters}

### Headers mới (ưu tiên)

**`X-Group-Id`** (MỚI - Ưu tiên cao nhất)
```http
GET /api/admin/users
X-Group-Id: 5
Authorization: Bearer {token}
```

**`X-Context-Id`** (Vẫn hoạt động - Auto-resolve group)
```http
GET /api/admin/users
X-Context-Id: 2
Authorization: Bearer {token}
```
> Nếu context chỉ có 1 group → tự động resolve
> Nếu context có nhiều groups → lỗi 400: "Multiple groups found in context. Please specify group_id"

### Query Parameters mới

**`group_id`** (MỚI - Ưu tiên cao nhất)
```http
GET /api/admin/users?group_id=5
Authorization: Bearer {token}
```

**`context_id`** (Vẫn hoạt động - Auto-resolve group)
```http
GET /api/admin/users?context_id=2
Authorization: Bearer {token}
```

### Thứ tự ưu tiên

1. `X-Group-Id` header (ưu tiên cao nhất)
2. `group_id` query parameter
3. `X-Context-Id` header (auto-resolve)
4. `context_id` query parameter (auto-resolve)

---

## ✅ Migration Checklist cho FE {#migration-checklist-cho-fe}

### Phase 1: Cập nhật Headers & Query Parameters

- [ ] Thay `X-Context-Id` bằng `X-Group-Id` trong tất cả requests (nếu có thể)
- [ ] Hoặc thêm `X-Group-Id` như một fallback khi không có `X-Context-Id`
- [ ] Cập nhật logic lưu/load từ localStorage: lưu cả `group_id` và `context_id`

### Phase 2: Cập nhật Response Parsing

- [ ] Tìm và thay `user_context_roles` → `user_role_assignments` trong code
- [ ] Cập nhật logic hiển thị roles: dùng `user_role_assignments[].role` thay vì `user_context_roles[].role`
- [ ] Cập nhật logic filter/search: dùng `group_id` thay vì `context_id` (nếu có)

### Phase 3: Cập nhật APIs

- [ ] `POST /api/user/contexts/switch`: Thêm hỗ trợ gửi `group_id` trong body
- [ ] `PUT /api/admin/users/:id/roles`: Đảm bảo luôn gửi `X-Group-Id` header
- [ ] `GET /api/admin/users`: Cập nhật parse response với `user_role_assignments`

### Phase 4: Testing

- [ ] Test switch context/group
- [ ] Test lấy danh sách users với `X-Group-Id`
- [ ] Test gán roles với `X-Group-Id`
- [ ] Test backward compatibility với `X-Context-Id` (nếu vẫn dùng)

---

## 📚 Summary Table

| API Endpoint | Status | Action Required |
|--------------|--------|-----------------|
| `GET /api/user/contexts` | ✅ Giữ nguyên | Không cần thay đổi |
| `POST /api/user/contexts/switch` | 🔄 Cập nhật | Thêm hỗ trợ `group_id` (optional) |
| `GET /api/admin/groups` | ✅ Giữ nguyên | Không cần thay đổi |
| `GET /api/admin/users` | 🔄 Cập nhật | Parse `user_role_assignments` thay vì `user_context_roles` |
| `PUT /api/admin/users/:id/roles` | 🔄 Cập nhật | **Bắt buộc** gửi `X-Group-Id` header |
| `GET /api/groups/:id/members` | ✅ Giữ nguyên | Không cần thay đổi |
| `GET /api/contexts/my-groups` | 🆕 Mới | Cần implement (hoặc dùng `/api/admin/groups`) |
| `POST /api/contexts/switch` | 🆕 Mới | Cần implement (hoặc dùng `/api/user/contexts/switch`) |

---

## 🚨 Breaking Changes Summary

1. **Response structure của `GET /api/admin/users`:**
   - `user_context_roles` → `user_role_assignments`
   - Mỗi assignment có `group_id` thay vì `context_id`

2. **`PUT /api/admin/users/:id/roles`:**
   - Bây giờ **BẮT BUỘC** phải có `X-Group-Id` header
   - Nếu không có → lỗi 400

3. **Headers ưu tiên:**
   - Nên dùng `X-Group-Id` thay vì `X-Context-Id` để chính xác hơn

---

**Last Updated:** 2025-01-15  
**API Version:** v2.0.0 (Group-Based Permissions)


