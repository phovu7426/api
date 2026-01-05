# Tài Liệu API: Groups và Context Admin

Tài liệu này mô tả chi tiết các API cho phần quản lý Groups và Context Admin để tích hợp vào giao diện Frontend.

---

## 📋 Mục Lục

1. [Context Admin APIs](#context-admin-apis)
2. [Groups Admin APIs](#groups-admin-apis)
3. [Group Members APIs](#group-members-apis)
4. [User Groups APIs](#user-groups-apis)

---

## 🔄 Context Admin APIs

### 1. Tạo Context Mới

**Endpoint:** `POST /api/admin/contexts`

**Authentication:** Required (Bearer Token)

**Permission:** `group.manage` (chỉ system admin)

**Mô tả:** Tạo context mới. System context (id=1) đã được tạo sẵn trong migration.

**Request:**
```http
POST /api/admin/contexts
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "shop",
  "name": "Shop Context",
  "code": "shop-context",
  "status": "active"
}
```

**Request Body:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `type` | string | ✅ | Loại context: `system`, `shop`, `team`, `project`, ... | ❌ FE gửi |
| `name` | string | ✅ | Tên context | ❌ FE gửi |
| `code` | string | ❌ | Mã code unique. Nếu không gửi → tự động tạo từ `type` | ❌ FE gửi (optional) |
| `status` | string | ❌ | Trạng thái (default: `active`) | ❌ FE gửi (optional) |
| `ref_id` | number \| null | ❌ | ID của entity liên quan (optional, có thể null). Thường không cần vì đã có `context_id` trong group | ❌ FE gửi (optional) |

**Lưu ý về `ref_id`:**
- `ref_id` là **optional** và có thể `null`
- Vì đã có `context_id` trong group để reference đến context, nên `ref_id` trong context thường không cần thiết
- Có thể để `null` hoặc không gửi trường này

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "type": "shop",
    "ref_id": null,
    "name": "Shop Context",
    "code": "shop-context",
    "status": "active",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Response Fields:**

| Trường | Type | Mô tả | Tự sinh |
|--------|------|-------|---------|
| `id` | number | ID của context | ✅ API tự sinh |
| `type` | string | Loại context | ❌ FE đã gửi |
| `ref_id` | number \| null | ID của entity liên quan (thường null) | ❌ FE đã gửi (optional) |
| `name` | string | Tên context | ❌ FE đã gửi |
| `code` | string | Mã code | ❌ FE đã gửi hoặc API tự sinh |
| `status` | string | Trạng thái | ❌ FE đã gửi hoặc default `active` |
| `created_at` | string | Thời gian tạo | ✅ API tự sinh |
| `updated_at` | string | Thời gian cập nhật | ✅ API tự sinh |

**Lưu ý:**
- Constraint unique: `(type, ref_id)` - không thể tạo 2 contexts cùng type và ref_id
- `code` phải unique trong hệ thống
- Nếu không gửi `code`, API tự động tạo: `{type}-{ref_id}` hoặc `{type}-system` nếu `ref_id` null

---

### 2. Lấy Danh Sách Contexts

**Endpoint:** `GET /api/admin/contexts`

**Authentication:** Optional (Bearer Token)

**Mô tả:** Lấy danh sách contexts với phân trang, filter, search.

**Request:**
```http
GET /api/admin/contexts?page=1&limit=10&filters[type]=shop&filters[status]=active&search=shop&sortBy=created_at&sortOrder=DESC
Authorization: Bearer {token}
```

**Query Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `page` | number | ❌ | Trang hiện tại (default: 1) | ❌ FE gửi |
| `limit` | number | ❌ | Số items mỗi trang (default: 10) | ❌ FE gửi |
| `filters[type]` | string | ❌ | Lọc theo type: `system`, `shop`, `team`, ... | ❌ FE gửi |
| `filters[status]` | string | ❌ | Lọc theo status: `active`, `inactive` | ❌ FE gửi |
| `search` | string | ❌ | Tìm kiếm theo name/code | ❌ FE gửi |
| `sortBy` | string | ❌ | Sắp xếp theo field: `created_at`, `name`, `code`, ... | ❌ FE gửi |
| `sortOrder` | string | ❌ | `ASC` hoặc `DESC` (default: `DESC`) | ❌ FE gửi |

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
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "type": "shop",
      "ref_id": null,
      "name": "Shop Context",
      "code": "shop-context",
      "status": "active",
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

**Response Fields:** Tương tự response của API tạo context (array)

---

### 3. Lấy Context Theo ID

**Endpoint:** `GET /api/admin/contexts/:id`

**Authentication:** Optional (Bearer Token)

**Mô tả:** Lấy thông tin chi tiết của một context.

**Request:**
```http
GET /api/admin/contexts/2
Authorization: Bearer {token}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của context | ❌ FE gửi |

**Response:** Tương tự response của API tạo context (chỉ có 1 item)

---

### 4. Cập Nhật Context

**Endpoint:** `PUT /api/admin/contexts/:id`

**Authentication:** Required (Bearer Token)

**Permission:** `group.manage` (chỉ system admin)

**Mô tả:** Cập nhật thông tin context. Chỉ có thể cập nhật `name`, `code`, `status`. Không thể cập nhật system context (id=1).

**Request:**
```http
PUT /api/admin/contexts/2
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Shop Context (Updated)",
  "code": "shop-context-updated",
  "status": "active"
}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của context | ❌ FE gửi |

**Request Body:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `name` | string | ❌ | Tên context mới | ❌ FE gửi (optional) |
| `code` | string | ❌ | Code mới (phải unique) | ❌ FE gửi (optional) |
| `status` | string | ❌ | Trạng thái mới | ❌ FE gửi (optional) |

**Lưu ý:**
- Không thể cập nhật `type`, `ref_id` (chỉ có thể tạo context mới)
- Không thể cập nhật system context (id=1)
- Chỉ cần gửi các trường muốn cập nhật (partial update)

**Response:** Tương tự response của API tạo context

---

### 5. Xóa Context

**Endpoint:** `DELETE /api/admin/contexts/:id`

**Authentication:** Required (Bearer Token)

**Permission:** `group.manage` (chỉ system admin)

**Mô tả:** Xóa context (soft delete). Không thể xóa system context (id=1) hoặc context đang được sử dụng bởi groups.

**Request:**
```http
DELETE /api/admin/contexts/2
Authorization: Bearer {token}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của context | ❌ FE gửi |

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Context deleted successfully"
  }
}
```

**Lưu ý:**
- Không thể xóa system context (id=1)
- Không thể xóa context nếu có groups đang sử dụng (sẽ báo lỗi)
- Xóa soft delete (set `deleted_at`), không xóa thật khỏi DB

---

## 🏢 Groups Admin APIs

### 1. Tạo Group Mới

**Endpoint:** `POST /api/admin/groups`

**Authentication:** Required (Bearer Token)

**Permission:** `group.manage` (chỉ system admin)

**Mô tả:** Tạo group mới. **Bắt buộc** phải gửi `context_id` của context có sẵn. API sẽ tự động gán owner làm admin nếu có.

**Request:**
```http
POST /api/admin/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "shop",
  "code": "shop-001",
  "name": "Shop Trung Tâm",
  "description": "Cửa hàng trung tâm",
  "context_id": 2,
  "metadata": {
    "address": "123 Main St",
    "phone": "0123456789"
  }
}
```

**Request Body:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `type` | string | ✅ | Loại group: `shop`, `team`, `project`, `department`, `organization`, ... | ❌ FE gửi |
| `code` | string | ✅ | Mã code unique: `shop-001`, `team-dev`, `project-abc`, ... | ❌ FE gửi |
| `name` | string | ✅ | Tên group | ❌ FE gửi |
| `context_id` | number | ✅ | ID của context có sẵn (phải tạo context trước) | ❌ FE gửi |
| `description` | string | ❌ | Mô tả group | ❌ FE gửi (optional) |
| `metadata` | object | ❌ | Thông tin bổ sung (JSON): shop có `address`, `phone`; team có `leader`, `members_count`; ... | ❌ FE gửi (optional) |

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": 5,
      "type": "shop",
      "code": "shop-001",
      "name": "Shop Trung Tâm",
      "description": "Cửa hàng trung tâm",
      "status": "active",
      "owner_id": 1,
      "context_id": 2,
      "metadata": {
        "address": "123 Main St",
        "phone": "0123456789"
      },
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Response Fields:**

| Trường | Type | Mô tả | Tự sinh |
|--------|------|-------|---------|
| `group.id` | number | ID của group | ✅ API tự sinh |
| `group.type` | string | Loại group | ❌ FE đã gửi |
| `group.code` | string | Mã code | ❌ FE đã gửi |
| `group.name` | string | Tên group | ❌ FE đã gửi |
| `group.description` | string \| null | Mô tả | ❌ FE đã gửi (optional) |
| `group.status` | string | Trạng thái (mặc định: `active`) | ✅ API tự sinh |
| `group.owner_id` | number \| null | ID của owner (tự động set = user hiện tại) | ✅ API tự sinh |
| `group.context_id` | number | ID của context | ❌ FE đã gửi |
| `group.metadata` | object \| null | Thông tin bổ sung | ❌ FE đã gửi (optional) |
| `group.created_at` | string | Thời gian tạo | ✅ API tự sinh |
| `group.updated_at` | string | Thời gian cập nhật | ✅ API tự sinh |

**Lưu ý:**
- **Bắt buộc** phải tạo context trước, sau đó tạo group với `context_id`
- Nếu có `owner_id` (tự động set = user hiện tại), API sẽ tự động thêm owner vào group và gán role `admin`
- `code` phải unique trong hệ thống
- `context_id` phải là ID của context đã tồn tại

---

### 2. Lấy Danh Sách Groups

**Endpoint:** `GET /api/admin/groups`

**Authentication:** Optional (Bearer Token)

**Mô tả:** Lấy danh sách groups với phân trang, filter, search.

**Request:**
```http
GET /api/admin/groups?page=1&limit=10&filters[type]=shop&filters[status]=active&filters[context_id]=2&search=shop&sortBy=created_at&sortOrder=DESC
Authorization: Bearer {token}
```

**Query Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `page` | number | ❌ | Trang hiện tại (default: 1) | ❌ FE gửi |
| `limit` | number | ❌ | Số items mỗi trang (default: 10) | ❌ FE gửi |
| `filters[type]` | string | ❌ | Lọc theo type: `shop`, `team`, `project`, ... | ❌ FE gửi |
| `filters[status]` | string | ❌ | Lọc theo status: `active`, `inactive` | ❌ FE gửi |
| `filters[context_id]` | number | ❌ | Lọc theo context_id | ❌ FE gửi |
| `search` | string | ❌ | Tìm kiếm theo name/code | ❌ FE gửi |
| `sortBy` | string | ❌ | Sắp xếp theo field: `created_at`, `name`, `code`, ... | ❌ FE gửi |
| `sortOrder` | string | ❌ | `ASC` hoặc `DESC` (default: `DESC`) | ❌ FE gửi |

**Backward-compatible:** Vẫn hỗ trợ `?type=shop` (không cần `filters[type]`)

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
      "description": "Cửa hàng trung tâm",
      "status": "active",
      "owner_id": 1,
      "context_id": 2,
      "metadata": {
        "address": "123 Main St",
        "phone": "0123456789"
      },
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "deleted_at": null
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

**Response Fields:**

| Trường | Type | Mô tả | Tự sinh |
|--------|------|-------|---------|
| `data[].id` | number | ID của group | ✅ API tự sinh |
| `data[].type` | string | Loại group | ✅ API tự sinh |
| `data[].code` | string | Mã code | ✅ API tự sinh |
| `data[].name` | string | Tên group | ✅ API tự sinh |
| `data[].description` | string \| null | Mô tả | ✅ API tự sinh |
| `data[].status` | string | Trạng thái | ✅ API tự sinh |
| `data[].owner_id` | number \| null | ID của owner | ✅ API tự sinh |
| `data[].context_id` | number | ID của context | ✅ API tự sinh |
| `data[].metadata` | object \| null | Thông tin bổ sung | ✅ API tự sinh |
| `data[].created_at` | string | Thời gian tạo | ✅ API tự sinh |
| `data[].updated_at` | string | Thời gian cập nhật | ✅ API tự sinh |
| `data[].deleted_at` | string \| null | Thời gian xóa (soft delete) | ✅ API tự sinh |
| `meta.page` | number | Trang hiện tại | ✅ API tự sinh |
| `meta.limit` | number | Số items mỗi trang | ✅ API tự sinh |
| `meta.totalItems` | number | Tổng số items | ✅ API tự sinh |
| `meta.totalPages` | number | Tổng số trang | ✅ API tự sinh |

**Lưu ý:**
- Tất cả các trường trong response đều do API tự sinh, FE chỉ cần hiển thị
- Hỗ trợ phân trang, filter, search, sort

---

### 3. Lấy Danh Sách Groups Theo Type

**Endpoint:** `GET /api/admin/groups/type/:type`

**Authentication:** Optional (Bearer Token)

**Mô tả:** Lấy danh sách groups theo type cụ thể (tương tự API lấy danh sách, nhưng filter theo type trong URL).

**Request:**
```http
GET /api/admin/groups/type/shop?page=1&limit=10
Authorization: Bearer {token}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `type` | string | ✅ | Loại group: `shop`, `team`, `project`, ... | ❌ FE gửi |

**Query Parameters:** Tương tự API lấy danh sách (page, limit, filters, search, sortBy, sortOrder)

**Response:** Tương tự API lấy danh sách

---

### 4. Lấy Group Theo ID

**Endpoint:** `GET /api/admin/groups/:id`

**Authentication:** Optional (Bearer Token)

**Mô tả:** Lấy thông tin chi tiết của một group.

**Request:**
```http
GET /api/admin/groups/5
Authorization: Bearer {token}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của group | ❌ FE gửi |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "type": "shop",
    "code": "shop-001",
    "name": "Shop Trung Tâm",
    "description": "Cửa hàng trung tâm",
    "status": "active",
    "owner_id": 1,
    "context_id": 2,
    "metadata": {
      "address": "123 Main St",
      "phone": "0123456789"
    },
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Response Fields:** Tương tự response của API lấy danh sách (chỉ có 1 item)

---

### 5. Cập Nhật Group

**Endpoint:** `PUT /api/admin/groups/:id`

**Authentication:** Required (Bearer Token)

**Permission:** `group.manage` (chỉ system admin)

**Mô tả:** Cập nhật thông tin group. Chỉ có thể cập nhật `name`, `description`, `metadata`. Không thể cập nhật `type`, `code`, `status`, `owner_id`, `context_id`.

**Request:**
```http
PUT /api/admin/groups/5
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Shop Trung Tâm (Updated)",
  "description": "Mô tả mới",
  "metadata": {
    "address": "456 New St",
    "phone": "0987654321"
  }
}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của group | ❌ FE gửi |

**Request Body:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `name` | string | ❌ | Tên group mới | ❌ FE gửi (optional) |
| `description` | string | ❌ | Mô tả mới | ❌ FE gửi (optional) |
| `metadata` | object | ❌ | Thông tin bổ sung mới | ❌ FE gửi (optional) |

**Lưu ý:**
- Không thể cập nhật `type`, `code`, `status`, `owner_id`, `context_id` (chỉ system admin có thể thay đổi qua DB hoặc API khác)
- Chỉ cần gửi các trường muốn cập nhật (partial update)

**Response:** Tương tự API lấy group theo ID

---

### 6. Xóa Group

**Endpoint:** `DELETE /api/admin/groups/:id`

**Authentication:** Required (Bearer Token)

**Permission:** `group.manage` (chỉ system admin)

**Mô tả:** Xóa group (soft delete).

**Request:**
```http
DELETE /api/admin/groups/5
Authorization: Bearer {token}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của group | ❌ FE gửi |

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
- Xóa soft delete (set `deleted_at`), không xóa thật khỏi DB
- Cần check permission trước khi cho phép xóa

---

## 👥 Group Members APIs

### 1. Lấy Danh Sách Members Của Group

**Endpoint:** `GET /api/groups/:id/members`

**Authentication:** Optional (Bearer Token)

**Mô tả:** Lấy danh sách members (users) của group, kèm roles của họ trong group đó.

**Request:**
```http
GET /api/groups/5/members
Authorization: Bearer {token}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của group | ❌ FE gửi |

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
    },
    {
      "user_id": 10,
      "user": {
        "id": 10,
        "username": "user1",
        "email": "user1@example.com"
      },
      "role_id": 4,
      "role": {
        "id": 4,
        "code": "editor",
        "name": "Editor"
      }
    }
  ]
}
```

**Response Fields:**

| Trường | Type | Mô tả | Tự sinh |
|--------|------|-------|---------|
| `data[].user_id` | number | ID của user (member) | ✅ API tự sinh |
| `data[].user.id` | number | ID của user | ✅ API tự sinh |
| `data[].user.username` | string | Username | ✅ API tự sinh |
| `data[].user.email` | string | Email | ✅ API tự sinh |
| `data[].role_id` | number | ID của role | ✅ API tự sinh |
| `data[].role.id` | number | ID của role | ✅ API tự sinh |
| `data[].role.code` | string | Code của role | ✅ API tự sinh |
| `data[].role.name` | string | Tên role | ✅ API tự sinh |

**Lưu ý:**
- Một user có thể có nhiều roles trong cùng 1 group (sẽ có nhiều items trong response)
- Tất cả các trường đều do API tự sinh, FE chỉ cần hiển thị

---

### 2. Thêm Member Vào Group

**Endpoint:** `POST /api/groups/:id/members`

**Authentication:** Required (Bearer Token)

**Permission:** `group.member.add` + Owner hoặc có quyền quản lý group

**Mô tả:** Thêm user vào group và gán roles cho user đó.

**Request:**
```http
POST /api/groups/5/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 15,
  "role_ids": [4, 5]
}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của group | ❌ FE gửi |

**Request Body:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `user_id` | number | ✅ | ID của user muốn thêm vào group | ❌ FE gửi |
| `role_ids` | number[] | ✅ | Danh sách ID của roles muốn gán cho user | ❌ FE gửi |

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
- API tự động thêm user vào `user_groups` table và tạo `user_role_assignments` cho các roles
- Nếu user đã là member, API sẽ chỉ thêm roles mới (không duplicate)
- Cache permissions sẽ được tự động clear

---

### 3. Gán Roles Cho Member

**Endpoint:** `PUT /api/groups/:id/members/:memberId/roles`

**Authentication:** Required (Bearer Token)

**Permission:** `group.member.manage` + Owner hoặc có quyền quản lý group

**Mô tả:** Gán/chỉnh sửa roles cho member trong group. API sẽ thay thế toàn bộ roles cũ bằng roles mới.

**Request:**
```http
PUT /api/groups/5/members/10/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [4, 5, 6]
}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của group | ❌ FE gửi |
| `memberId` | number | ✅ | ID của user (member) | ❌ FE gửi |

**Request Body:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `role_ids` | number[] | ✅ | Danh sách ID của roles mới (thay thế toàn bộ roles cũ) | ❌ FE gửi |

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
- Nếu `role_ids = []` → xóa hết roles của member trong group
- Cache permissions sẽ được tự động clear

---

### 4. Xóa Member Khỏi Group

**Endpoint:** `DELETE /api/groups/:id/members/:memberId`

**Authentication:** Required (Bearer Token)

**Permission:** `group.member.remove` + Owner hoặc có quyền quản lý group

**Mô tả:** Xóa member khỏi group. API sẽ xóa tất cả roles của member trong group.

**Request:**
```http
DELETE /api/groups/5/members/10
Authorization: Bearer {token}
```

**URL Parameters:**

| Trường | Type | Required | Mô tả | Tự sinh |
|--------|------|----------|-------|---------|
| `id` | number | ✅ | ID của group | ❌ FE gửi |
| `memberId` | number | ✅ | ID của user (member) | ❌ FE gửi |

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
- Xóa tất cả roles của member trong group
- Không cho phép xóa owner khỏi group (sẽ báo lỗi nếu cố gắng xóa owner)
- Cache permissions sẽ được tự động clear

---

## 👤 User Groups APIs

### 1. Lấy Danh Sách Groups Của User

**Endpoint:** `GET /api/user/groups`

**Authentication:** Required (Bearer Token)

**Mô tả:** Lấy danh sách groups mà user hiện tại là member, kèm context info và roles của user trong mỗi group.

**Request:**
```http
GET /api/user/groups
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "code": "shop-001",
      "name": "Shop Trung Tâm",
      "type": "shop",
      "description": "Cửa hàng trung tâm",
      "context": {
        "id": "2",
        "type": "shop",
        "ref_id": null,
        "name": "Shop Context"
      },
      "roles": [
        {
          "id": 3,
          "code": "admin",
          "name": "Administrator"
        },
        {
          "id": 4,
          "code": "manager",
          "name": "Manager"
        }
      ],
      "joined_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**Response Fields:**

| Trường | Type | Mô tả | Tự sinh |
|--------|------|-------|---------|
| `data[].id` | number | ID của group | ✅ API tự sinh |
| `data[].code` | string | Mã code của group | ✅ API tự sinh |
| `data[].name` | string | Tên group | ✅ API tự sinh |
| `data[].type` | string | Loại group | ✅ API tự sinh |
| `data[].description` | string \| null | Mô tả group | ✅ API tự sinh |
| `data[].context.id` | string | ID của context | ✅ API tự sinh |
| `data[].context.type` | string | Loại context | ✅ API tự sinh |
| `data[].context.ref_id` | string \| null | ID của entity liên quan (thường null) | ✅ API tự sinh |
| `data[].context.name` | string | Tên context | ✅ API tự sinh |
| `data[].roles[].id` | number | ID của role | ✅ API tự sinh |
| `data[].roles[].code` | string | Code của role | ✅ API tự sinh |
| `data[].roles[].name` | string | Tên role | ✅ API tự sinh |
| `data[].joined_at` | string | Thời gian user tham gia group | ✅ API tự sinh |

**Lưu ý:**
- Chỉ trả về các groups có `status = 'active'`
- Mỗi group kèm theo context info và danh sách roles của user trong group đó
- Tất cả các trường đều do API tự sinh, FE chỉ cần hiển thị
- API này hữu ích để hiển thị dropdown "Chọn Group" kèm roles của user

---

## 📝 Tổng Kết Các Trường Tự Sinh

### Trường Tự Sinh Từ BaseEntity (có trong mọi entity):

| Trường | Type | Mô tả |
|--------|------|-------|
| `id` | number | Primary key, tự động tăng |
| `created_user_id` | number \| null | ID của user tạo record (tự động set = user hiện tại) |
| `updated_user_id` | number \| null | ID của user cập nhật record (tự động set = user hiện tại) |
| `created_at` | string (ISO datetime) | Thời gian tạo (tự động set) |
| `updated_at` | string (ISO datetime) | Thời gian cập nhật (tự động set khi update) |
| `deleted_at` | string \| null (ISO datetime) | Thời gian xóa soft delete (tự động set khi delete) |

### Trường Tự Sinh Riêng Cho Contexts:

| Trường | Type | Mô tả |
|--------|------|-------|
| `status` | string | Mặc định `active` khi tạo context |
| `code` | string | Tự động tạo từ `type` nếu không gửi |

### Trường Tự Sinh Riêng Cho Groups:

| Trường | Type | Mô tả |
|--------|------|-------|
| `status` | string | Mặc định `active` khi tạo group |
| `owner_id` | number \| null | Tự động set = user hiện tại khi tạo group |

---

## 🔑 Authentication & Headers

Tất cả các API đều yêu cầu:

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json (cho POST/PUT)
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Tất cả các trường có dấu ✅ "API tự sinh"** → FE KHÔNG cần gửi, chỉ cần hiển thị trong response
2. **Tất cả các trường có dấu ❌ "FE gửi"** → FE cần gửi trong request body hoặc query params
3. **Permissions:** Một số API yêu cầu permission cụ thể, FE nên check permission trước khi hiển thị button/action
4. **Soft Delete:** Xóa context/group là soft delete (set `deleted_at`), không xóa thật khỏi DB
5. **Owner Protection:** Không thể xóa owner khỏi group
6. **Flow tạo Context và Group:**
   - **Bước 1:** Tạo context trước qua `POST /api/admin/contexts`
   - **Bước 2:** Tạo group với `context_id` đã có qua `POST /api/admin/groups`
   - **Lưu ý:** `ref_id` trong context là optional, có thể để null vì đã có `context_id` trong group

---

## 📚 Ví Dụ Tích Hợp

### 1. Flow Tạo Context và Group

```javascript
// Bước 1: Tạo context trước
const createContext = async (contextData) => {
  const response = await api.post('/admin/contexts', {
    type: contextData.type,        // FE gửi
    name: contextData.name,        // FE gửi
    code: contextData.code,        // FE gửi (optional)
    status: contextData.status,    // FE gửi (optional, default: 'active')
    // ref_id: null hoặc không gửi (optional)
    // Các trường khác (id, created_at, ...) đều do API tự sinh
  });

  return response.data; // { id: 2, type: 'shop', name: 'Shop Context', ... }
};

// Bước 2: Tạo group với context_id
const createGroup = async (groupData, contextId) => {
  const response = await api.post('/admin/groups', {
    type: groupData.type,        // FE gửi
    code: groupData.code,        // FE gửi
    name: groupData.name,        // FE gửi
    context_id: contextId,      // FE gửi - ID của context đã tạo ở bước 1
    description: groupData.description,  // FE gửi (optional)
    metadata: groupData.metadata // FE gửi (optional)
    // Các trường khác (id, status, owner_id, created_at, ...) 
    // đều do API tự sinh, KHÔNG cần gửi
  });

  return response.data;
};
```

### 2. Setup Axios Interceptor

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Request interceptor: tự động thêm headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const contextId = localStorage.getItem('context_id');
  const groupId = localStorage.getItem('group_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (contextId) {
    config.headers['X-Context-Id'] = contextId;
  }

  if (groupId) {
    config.headers['X-Group-Id'] = groupId;
  }

  return config;
});
```

### 3. Lấy Danh Sách Contexts và Groups

```javascript
// Lấy danh sách contexts
const getContexts = async () => {
  const response = await api.get('/admin/contexts', {
    params: {
      page: 1,
      limit: 10,
      'filters[type]': 'shop',
      'filters[status]': 'active'
    }
  });
  
  return response.data.data; // Array of contexts
};

// Lấy danh sách groups theo context
const getGroupsByContext = async (contextId) => {
  const response = await api.get('/admin/groups', {
    params: {
      page: 1,
      limit: 10,
      'filters[context_id]': contextId
    }
  });
  
  return response.data.data; // Array of groups
};
```

### 4. Lấy Danh Sách Members

```javascript
const getGroupMembers = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  
  // Response có sẵn user info và roles, chỉ cần hiển thị
  return response.data.data; // Array of members with user and role info
};
```

---

**Kết thúc tài liệu**
