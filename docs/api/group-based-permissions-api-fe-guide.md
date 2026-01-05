# Group-Based Permissions - API Guide cho Frontend

Tài liệu chi tiết về các API cần sử dụng, khi nào dùng, và API nào bỏ đi.

**⚠️ QUAN TRỌNG:** Hệ thống đã chuyển từ **Context-based** sang **Group-based permissions**.

---

## 📋 Mục lục

1. [Tổng quan thay đổi](#tổng-quan-thay-đổi)
2. [Flow sử dụng API](#flow-sử-dụng-api)
3. [Danh sách API - Khi nào dùng gì](#danh-sách-api)
4. [API cần BỎ ĐI (không dùng nữa)](#api-cần-bỏ-đi)
5. [API cần BỔ SUNG (backend cần implement)](#api-cần-bổ-sung)
6. [Breaking Changes - Response Structure](#breaking-changes)

---

## 🎯 Tổng quan thay đổi {#tổng-quan-thay-đổi}

### 🔍 Hiểu rõ Context vs Group

**Context (Ngữ cảnh - Phạm vi lớn):**
- Là **cấu trúc cha** để tổ chức các groups
- Ví dụ: "System", "Shop Trung Tâm", "Shop Quận 1"
- **KHÔNG PHẢI** scope thực thi quyền (chỉ để tổ chức)
- Một context có thể có **nhiều groups**

**Group (Nhóm - Scope thực thi quyền):**
- Là **scope duy nhất** để gán và kiểm tra quyền
- User có roles **trong group**, không phải trong context
- Ví dụ: "SYSTEM_ADMIN", "shop-001", "shop-manager-group"
- Mỗi group thuộc về **một context** (context_id)

**Mối quan hệ:**
```
Context (System)
  └── Group (SYSTEM_ADMIN) ← User có role "system_admin" ở đây

Context (Shop Trung Tâm)
  ├── Group (shop-001) ← User có role "admin" ở đây
  └── Group (shop-001-managers) ← User có role "manager" ở đây
```

**Cấu trúc Roles trong 1 Group:**

**Quan trọng:** Trong 1 group có **nhiều vai trò (roles)** để phân cho các tài khoản khác nhau.

**Ví dụ: Group "shop-001" (Shop Trung Tâm)**

```
Group: shop-001
├── Roles trong group:
│   ├── "admin" (Administrator) - Quản lý toàn bộ shop
│   ├── "manager" (Manager) - Quản lý hàng hóa, đơn hàng
│   ├── "staff" (Staff) - Nhân viên bán hàng
│   └── "viewer" (Viewer) - Chỉ xem
│
└── Users và roles của họ:
    ├── User A → có role "admin"
    ├── User B → có roles ["manager", "staff"]
    ├── User C → có role "staff"
    └── User D → có role "viewer"
```

**Cấu trúc dữ liệu:**

Bảng `user_role_assignments` lưu: `(user_id, role_id, group_id)`

```sql
-- Ví dụ: Group "shop-001" (group_id=5)

-- User A (user_id=1) có role admin (role_id=3) trong group 5
INSERT INTO user_role_assignments (user_id, role_id, group_id) 
VALUES (1, 3, 5);

-- User B (user_id=2) có roles manager (role_id=4) và staff (role_id=5) trong group 5
INSERT INTO user_role_assignments (user_id, role_id, group_id) 
VALUES (2, 4, 5), (2, 5, 5);

-- User C (user_id=3) có role staff (role_id=5) trong group 5
INSERT INTO user_role_assignments (user_id, role_id, group_id) 
VALUES (3, 5, 5);
```

**Điểm quan trọng:**
1. ✅ **1 Group có nhiều Roles** (admin, manager, staff, viewer...)
2. ✅ **1 User có thể có nhiều Roles trong cùng 1 Group** (User B có cả manager và staff)
3. ✅ **Nhiều Users có thể có cùng 1 Role** (User B và User C đều có role staff)
4. ✅ **Roles chỉ có hiệu lực trong Group đó** (role admin trong group A ≠ role admin trong group B)

**System Admin là gì?**
- System Admin = User có role trong **SYSTEM_ADMIN group**
- SYSTEM_ADMIN group thuộc về **System context** (context_id=1)
- **KHÔNG có ngoại lệ** - System Admin cũng chỉ là user trong một group

---

### Trước đây (Context-based - ĐÃ BỎ)

❌ **KHÔNG DÙNG NỮA:**
- User có roles trực tiếp trong Context
- Header: `X-Context-Id` (vẫn hoạt động nhưng không khuyến nghị)
- Query: `?context_id=1` (vẫn hoạt động nhưng không khuyến nghị)
- Response: `user_context_roles` array

### Hiện tại (Group-based - DÙNG CÁI NÀY)

✅ **DÙNG CÁI NÀY:**
- User là member của Groups, có roles trong mỗi Group
- Header: `X-Group-Id` (ưu tiên)
- Query: `?group_id=1` (ưu tiên)
- Response: `user_role_assignments` array

---

## 👥 System Admin vs Context Admin vs Group Admin

**Quan trọng:** Trong hệ thống mới, **KHÔNG có khái niệm "System Admin" hay "Context Admin" riêng biệt**. Tất cả đều là **"User trong Group"** với roles khác nhau.

### System Admin (Quản trị hệ thống)

**Thực chất:**
- User là member của **SYSTEM_ADMIN group**
- SYSTEM_ADMIN group thuộc về **System context** (context_id=1)
- Có role "system_admin" trong SYSTEM_ADMIN group

**Quyền hạn:**
- Tạo/sửa/xóa groups (tất cả contexts)
- Quản lý tất cả users và roles
- Truy cập system-level settings

**Flow:**
```
1. Chọn context: "System" (context_id=1)
2. Backend auto-resolve: group_id = SYSTEM_ADMIN (id=1)
3. Gửi X-Group-Id: 1 trong mọi request
4. Check permissions trong SYSTEM_ADMIN group
```

---

### Context Admin (Quản trị context)

**Thực chất:**
- User có role "admin" trong một **group của context**
- Ví dụ: User có role "admin" trong group "shop-001" (context Shop Trung Tâm)

**Quyền hạn:**
- Quản lý users và roles **trong group của họ**
- Quản lý members của group
- Không thể tạo/sửa/xóa groups khác (trừ khi là system admin)

**Flow:**
```
1. Chọn context: "Shop Trung Tâm" (context_id=2)
2. Query groups: GET /api/admin/groups?filters[context_id]=2
3. Chọn group: "shop-001" (group_id=5)
4. Gửi X-Group-Id: 5 trong mọi request
5. Check permissions trong group 5
```

---

### Group Admin (Quản trị group)

**Thực chất:**
- **Giống Context Admin** - chỉ là tên gọi khác
- User có role "admin" trong một group cụ thể

**Lưu ý:** 
- Không có khác biệt với Context Admin
- Cả hai đều là user có admin role trong một group

---

## 🔄 Flow sử dụng API {#flow-sử-dụng-api}

### 📖 Flow chuyển đổi Context/Group chi tiết

**Câu hỏi: Làm sao user chuyển đổi giữa System Admin, Context Admin, Group Admin?**

**Trả lời:**
- **Không có khái niệm "System Admin" hay "Context Admin" riêng biệt**
- Tất cả đều là **"User trong Group"** với roles khác nhau
- Flow: **Context → Group → Permissions**

#### Flow 1: User đăng nhập và vào trang admin

**Bước 1: Lấy danh sách Contexts (phạm vi lớn)**
```
GET /api/user/contexts
→ Trả về: ["System", "Shop Trung Tâm", "Shop Quận 1"]
→ Đây là các contexts mà user có thể truy cập (có group membership trong đó)
```

**Bước 2: User chọn Context**
```
POST /api/user/contexts/switch
Body: { context_id: 2 }  // Chọn "Shop Trung Tâm"
→ Lưu context_id vào localStorage
```

**Bước 3: Kiểm tra Context có bao nhiêu Groups**
```
Option A: Nếu context có 1 group duy nhất
  → Backend tự động resolve group_id (trong ContextInterceptor)
  → Không cần user chọn

Option B: Nếu context có nhiều groups
  → FE cần query: GET /api/admin/groups?filters[context_id]=2
  → Hiển thị dropdown cho user chọn group
  → User chọn group → Lưu group_id vào localStorage
```

**Bước 4: Từ bây giờ, gửi X-Group-Id trong mọi request**
```
Tất cả các API admin đều cần X-Group-Id header
→ Permissions được check dựa trên group_id, không phải context_id
```

---

#### Flow 2: System Admin (User trong SYSTEM_ADMIN group)

**Case: User là System Admin**
```
1. GET /api/user/contexts
   → Response: [{ id: "1", type: "system", name: "System" }]

2. POST /api/user/contexts/switch
   → Body: { context_id: 1 }  // Chọn System context
   → Backend auto-resolve: group_id = SYSTEM_ADMIN group id

3. Lưu group_id vào localStorage
   → localStorage.setItem('groupId', 1)  // Giả sử SYSTEM_ADMIN có id=1

4. Gửi X-Group-Id: 1 trong mọi request
   → Check permissions trong SYSTEM_ADMIN group
   → Có quyền system-level (tạo groups, quản lý tất cả...)
```

**Quan trọng:** System Admin cũng chỉ là user trong một group (SYSTEM_ADMIN), không có logic đặc biệt.

---

#### Flow 3: Context Admin (User có admin role trong một group của context)

**Case: User là admin của Shop Trung Tâm**
```
1. GET /api/user/contexts
   → Response: [{ id: "2", type: "shop", name: "Shop Trung Tâm" }]

2. POST /api/user/contexts/switch
   → Body: { context_id: 2 }

3. GET /api/admin/groups?filters[context_id]=2
   → Response: [{ id: 5, name: "shop-001", context_id: 2 }]
   → Context này chỉ có 1 group → Backend auto-resolve group_id=5

4. Lưu group_id=5 vào localStorage

5. Gửi X-Group-Id: 5 trong mọi request
   → Check permissions trong group 5
   → Có quyền quản lý users, roles trong group này
```

---

#### Flow 4: User có nhiều groups trong cùng context

**Case: User là member của 2 groups trong Shop Trung Tâm**
```
1. GET /api/user/contexts
   → Response: [{ id: "2", type: "shop", name: "Shop Trung Tâm" }]

2. POST /api/user/contexts/switch
   → Body: { context_id: 2 }

3. GET /api/admin/groups?filters[context_id]=2
   → Response: [
       { id: 5, name: "shop-001", context_id: 2 },
       { id: 6, name: "shop-managers", context_id: 2 }
     ]
   
4. Hiển thị dropdown: "Chọn Group"
   - Shop 001 (Admin)
   - Shop Managers (Manager)
   
5. User chọn "Shop 001" → Lưu group_id=5

6. Gửi X-Group-Id: 5 trong mọi request
   → Permissions sẽ check trong group 5
   → Nếu user switch sang group 6 → Permissions khác nhau
```

---

### Scenario 1: User đăng nhập và chọn Group/Context (Chi tiết)

```
1. User đăng nhập → nhận JWT token
2. Gọi GET /api/user/contexts → Lấy danh sách contexts user có thể truy cập
3. User chọn context → Gọi POST /api/user/contexts/switch với context_id
4. Lưu context_id vào localStorage
5. Kiểm tra: Context có bao nhiêu groups?
   - Nếu 1 group → Backend auto-resolve group_id
   - Nếu nhiều groups → Gọi GET /api/admin/groups?filters[context_id]=2 để lấy groups
6. User chọn group (nếu có nhiều) → Lưu group_id vào localStorage
7. Từ bây giờ, gửi X-Group-Id header trong mọi request
```

### Scenario 2: Hiển thị danh sách Users trong Group

```
1. Có group_id từ localStorage (hoặc từ dropdown user chọn)
2. Gọi GET /api/admin/users?page=1&limit=10 với header X-Group-Id: 5
3. Parse response.user_role_assignments (KHÔNG DÙNG user_context_roles nữa)
4. Hiển thị users và roles của họ trong group
```

### Scenario 3: Gán Roles cho User trong Group

```
1. Có group_id từ localStorage
2. Gọi PUT /api/admin/users/:id/roles với:
   - Header: X-Group-Id: 5 (BẮT BUỘC)
   - Body: { role_ids: [3, 4, 5] }
3. Backend sẽ sync roles cho user trong group đó
```

### Scenario 4: Quản lý Members trong Group

```
1. Lấy danh sách members: GET /api/groups/:id/members
2. Thêm member: POST /api/groups/:id/members với { user_id, role_ids }
3. Xóa member: DELETE /api/groups/:id/members/:user_id
4. Gán roles cho member: PUT /api/groups/:id/members/:memberId/roles
```

---

## 📡 Danh sách API - Khi nào dùng gì {#danh-sách-api}

### 1. Lấy danh sách Contexts/Groups user có thể truy cập

#### ✅ **API 1: `GET /api/user/contexts`** - GIỮ LẠI, VẪN DÙNG

**⚠️ QUAN TRỌNG:** API này trả về **CONTEXTS** (không phải groups)!

**Khi nào dùng:**
- ✅ **Bước đầu tiên** sau khi user đăng nhập
- Hiển thị dropdown "Chọn Context" ở góc trên màn hình
- User chọn context (ví dụ: "System", "Shop Trung Tâm")
- **Sau đó** mới query groups trong context đó

**Request:**
```http
GET /api/user/contexts
Authorization: Bearer {token}
```

**Response:**
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

**Lưu ý:** 
- ✅ API này vẫn hoạt động bình thường
- Backend đã cập nhật logic (query từ `user_groups` thay vì `user_context_roles`)
- Response structure không thay đổi
- **Đây là bước 1:** Context → Group → Permissions
- Sau khi có context, cần query groups trong context đó (xem API 2)

---

#### ✅ **API 2: `GET /api/admin/groups`** - GIỮ LẠI, VẪN DÙNG

**⚠️ QUAN TRỌNG:** API này trả về **GROUPS** (scope thực thi quyền)!

**Khi nào dùng:**
- ✅ **Bước thứ hai** sau khi user chọn context
- Khi context có **nhiều groups** → cần hiển thị dropdown cho user chọn
- Khi cần lấy groups trong một context cụ thể
- **Đây là bước quyết định:** User sẽ làm việc với group nào?

**Request:**
```http
GET /api/admin/groups?page=1&limit=10&filters[context_id]=2
Authorization: Bearer {token}
```

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
      "context_id": 2,
      "status": "active"
    },
    {
      "id": 6,
      "type": "shop",
      "code": "shop-managers",
      "name": "Shop Managers Group",
      "context_id": 2,
      "status": "active"
    }
  ],
  "meta": {...}
}
```

**Use cases:**
- **Sau khi user chọn context** → Query groups trong context đó
- **Nếu context có nhiều groups** → Hiển thị dropdown "Chọn Group"
- **Nếu context chỉ có 1 group** → Backend tự động resolve (không cần hiển thị dropdown)
- User chọn group → Lưu `group_id` vào localStorage → Gửi `X-Group-Id` trong mọi request

**Flow:**
```
1. User chọn context (từ API 1)
2. Query groups trong context: GET /api/admin/groups?filters[context_id]=2
3. Nếu có 1 group → Auto-select, lưu group_id
4. Nếu có nhiều groups → Hiển thị dropdown, user chọn, lưu group_id
5. Từ bây giờ, mọi request đều gửi X-Group-Id header
```

---

#### 🆕 **API 3: `GET /api/contexts/my-groups`** - CẦN BỔ SUNG (BACKEND)

**Khi nào dùng:**
- Khi cần lấy danh sách groups mà user hiện tại là member (tương tự như `/api/user/contexts` nhưng trả về groups thay vì contexts)
- Khi cần hiển thị dropdown groups kèm roles của user trong mỗi group

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

**⚠️ Status:** API này CHƯA CÓ trong backend, cần implement. Tạm thời FE có thể:
- Dùng `GET /api/admin/groups` và filter client-side
- Hoặc query từ `GET /api/user/contexts` + `GET /api/admin/groups` kết hợp

---

### 2. Switch Context/Group

#### ✅ **API 4: `POST /api/user/contexts/switch`** - GIỮ LẠI, NÊN CẬP NHẬT

**Khi nào dùng:**
- ✅ **Khi user chọn context từ dropdown** (sau khi gọi `GET /api/user/contexts`)
- Đây là bước switch context, **chưa switch group**
- Sau khi switch, cần query groups trong context đó (xem API 2)

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
  "context_id": 2,
  "group_id": 5  // Nếu đã biết group_id, gửi luôn
}
```

**Response:**
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

**⚠️ Lưu ý quan trọng:**
- API này chỉ switch **context**, chưa switch **group**
- Sau khi switch context, **FE cần:**
  1. Query groups: `GET /api/admin/groups?filters[context_id]=2`
  2. Nếu có nhiều groups → Hiển thị dropdown cho user chọn
  3. Nếu có 1 group → Backend tự động resolve (xem ContextInterceptor)
  4. Lưu `group_id` vào localStorage
  5. Gửi `X-Group-Id` header trong mọi request tiếp theo

**Flow đầy đủ:**
```
1. GET /api/user/contexts → Chọn context
2. POST /api/user/contexts/switch → Switch context
3. GET /api/admin/groups?filters[context_id]=2 → Lấy groups
4. User chọn group (hoặc auto-select nếu 1 group)
5. Lưu group_id → Gửi X-Group-Id trong mọi request
```

---

### 3. Lấy danh sách Users

#### ✅ **API 5: `GET /api/admin/users`** - GIỮ LẠI, NHƯNG RESPONSE ĐÃ THAY ĐỔI

**Khi nào dùng:**
- Khi cần hiển thị danh sách users trong group hiện tại
- Khi quản lý users và roles của họ

**Request:**
```http
GET /api/admin/users?page=1&limit=10
X-Group-Id: 5
Authorization: Bearer {token}
```

**⚠️ QUAN TRỌNG:**
- **Bắt buộc** gửi `X-Group-Id` header hoặc `?group_id=5` query param
- Nếu không có → API sẽ filter users của tất cả groups (có thể không đúng ý muốn)

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

**Response (MỚI - DÙNG CÁI NÀY):**
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
      "user_role_assignments": [  // ✅ DÙNG CÁI NÀY
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

**Breaking Change:**
- ❌ `user_context_roles` → ✅ `user_role_assignments`
- Mỗi assignment có `group_id` thay vì `context_id`

**Action cho FE:**
```javascript
// CŨ (KHÔNG DÙNG NỮA)
const roles = user.user_context_roles.map(ucr => ucr.role);

// MỚI (DÙNG CÁI NÀY)
const roles = user.user_role_assignments
  .filter(ura => ura.group_id === currentGroupId)
  .map(ura => ura.role);
```

---

### 4. Gán Roles cho User

#### ✅ **API 6: `PUT /api/admin/users/:id/roles`** - GIỮ LẠI, NHƯNG YÊU CẦU MỚI

**Khi nào dùng:**
- Khi admin gán/chỉnh sửa roles cho user trong group hiện tại
- Khi sync roles của user (xóa roles cũ, gán roles mới)

**Request:**
```http
PUT /api/admin/users/:id/roles
X-Group-Id: 5
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4, 5]
}
```

**⚠️ BẮT BUỘC:**
- Phải gửi `X-Group-Id` header hoặc `?group_id=5` query param
- Nếu không có → Lỗi 400: "Group ID is required"

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
- API này sẽ xóa tất cả roles cũ của user trong group, rồi gán roles mới
- Nếu muốn thêm/xóa từng role → dùng API quản lý members (xem phần 5)

---

### 5. Quản lý Members trong Group

#### ✅ **API 7: `GET /api/groups/:id/members`** - GIỮ LẠI, VẪN DÙNG

**Khi nào dùng:**
- Khi cần xem danh sách members của một group cụ thể
- Khi quản lý members và roles của họ trong group

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

#### ✅ **API 8: `POST /api/groups/:id/members`** - GIỮ LẠI, VẪN DÙNG

**Khi nào dùng:**
- Khi thêm user mới vào group
- Khi cần gán roles cho user ngay khi thêm vào group

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

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Member added successfully"
  }
}
```

---

#### ✅ **API 9: `PUT /api/groups/:id/members/:memberId/roles`** - GIỮ LẠI, VẪN DÙNG

**Khi nào dùng:**
- Khi cần cập nhật/chỉnh sửa roles của member trong group
- Khi muốn thay đổi roles mà không xóa member khỏi group

**Request:**
```http
PUT /api/groups/5/members/15/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Roles assigned successfully"
  }
}
```

---

#### ✅ **API 10: `DELETE /api/groups/:id/members/:memberId`** - GIỮ LẠI, VẪN DÙNG

**Khi nào dùng:**
- Khi cần xóa user khỏi group
- Khi remove member và tất cả roles của họ trong group

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

### 6. Quản lý Groups (System Admin)

#### ✅ **API 11-16: Các API quản lý Groups** - GIỮ LẠI, VẪN DÙNG

Tất cả các API này vẫn hoạt động bình thường, không thay đổi:

- `POST /api/admin/groups` - Tạo group mới
- `GET /api/admin/groups` - Lấy danh sách groups
- `GET /api/admin/groups/:id` - Lấy group theo ID
- `PUT /api/admin/groups/:id` - Cập nhật group
- `DELETE /api/admin/groups/:id` - Xóa group
- `GET /api/admin/groups/type/:type` - Lấy groups theo type

**Lưu ý:** Chỉ system admin mới có thể tạo/sửa/xóa groups.

---

## 🗑️ API cần BỎ ĐI (không dùng nữa) {#api-cần-bỏ-đi}

### ❌ Tất cả API liên quan đến `user_context_roles`

**Status:** ĐÃ BỎ HOÀN TOÀN, KHÔNG TỒN TẠI TRONG BACKEND

**Các endpoint đã bỏ:**
- ❌ `GET /api/admin/users/:id/context-roles` (không có)
- ❌ `POST /api/admin/users/:id/context-roles` (không có)
- ❌ `PUT /api/admin/users/:id/context-roles` (không có)
- ❌ `DELETE /api/admin/users/:id/context-roles` (không có)

**Thay thế:**
- ✅ Dùng `PUT /api/admin/users/:id/roles` với `X-Group-Id` header
- ✅ Hoặc dùng `PUT /api/groups/:id/members/:memberId/roles`

---

### ❌ Response field `user_context_roles`

**Status:** KHÔNG CÒN TRONG RESPONSE

**Trước đây:**
```javascript
// ❌ KHÔNG DÙNG NỮA
const roles = user.user_context_roles;
```

**Hiện tại:**
```javascript
// ✅ DÙNG CÁI NÀY
const roles = user.user_role_assignments;
```

---

## 🆕 API cần BỔ SUNG (backend cần implement) {#api-cần-bổ-sung}

### 1. `GET /api/contexts/my-groups` - Lấy groups của user hiện tại

**Mô tả:** Lấy danh sách groups mà user hiện tại là member, kèm theo roles trong mỗi group.

**Use case:**
- Hiển thị dropdown để user chọn group
- Hiển thị danh sách groups user có thể truy cập
- Kiểm tra roles của user trong từng group

**Request:**
```http
GET /api/contexts/my-groups
Authorization: Bearer {token}
```

**Response mong muốn:**
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

**Workaround hiện tại (nếu chưa có API):**
```javascript
// FE có thể tự query
async function getMyGroups() {
  // 1. Lấy contexts
  const contexts = await fetch('/api/user/contexts', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  // 2. Lấy groups cho mỗi context
  const groupsPromises = contexts.map(ctx => 
    fetch(`/api/admin/groups?filters[context_id]=${ctx.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
  );
  
  const allGroups = await Promise.all(groupsPromises);
  // Filter groups mà user là member (cần check từ response)
  return allGroups.flat().filter(/* logic filter */);
}
```

---

## 🔧 Headers & Query Parameters - Khi nào dùng gì

### Headers

#### ✅ `X-Group-Id` - ƯU TIÊN CAO NHẤT

**Khi nào dùng:**
- Khi đã có `group_id` từ localStorage hoặc user chọn
- Khi cần chính xác group (không muốn auto-resolve)
- **Bắt buộc** cho `PUT /api/admin/users/:id/roles`

**Example:**
```http
GET /api/admin/users
X-Group-Id: 5
Authorization: Bearer {token}
```

---

#### ⚠️ `X-Context-Id` - VẪN HOẠT ĐỘNG NHƯNG KHÔNG KHUYẾN NGHỊ

**Khi nào dùng:**
- Khi chỉ có `context_id` (chưa có `group_id`)
- Khi context chỉ có 1 group (backend sẽ auto-resolve)
- **Không dùng** nếu context có nhiều groups (sẽ lỗi 400)

**Example:**
```http
GET /api/admin/users
X-Context-Id: 2
Authorization: Bearer {token}
```

**Lưu ý:**
- Nếu context có nhiều groups → Backend trả về lỗi 400: "Multiple groups found in context. Please specify group_id"
- Khuyến nghị: Luôn cố gắng dùng `X-Group-Id` thay vì `X-Context-Id`

---

### Query Parameters

#### ✅ `group_id` - ƯU TIÊN

**Khi nào dùng:**
- Khi không thể dùng header (ví dụ: trong URL share)
- Alternative cho `X-Group-Id` header

**Example:**
```http
GET /api/admin/users?group_id=5
Authorization: Bearer {token}
```

---

#### ⚠️ `context_id` - VẪN HOẠT ĐỘNG NHƯNG KHÔNG KHUYẾN NGHỊ

**Khi nào dùng:**
- Tương tự `X-Context-Id` header
- Alternative cho header

**Example:**
```http
GET /api/admin/users?context_id=2
Authorization: Bearer {token}
```

---

### Thứ tự ưu tiên

Backend sẽ check theo thứ tự:
1. `X-Group-Id` header (ưu tiên cao nhất)
2. `group_id` query parameter
3. `X-Context-Id` header (auto-resolve)
4. `context_id` query parameter (auto-resolve)

---

## 🔄 Breaking Changes - Response Structure {#breaking-changes}

### 1. `GET /api/admin/users` - Response thay đổi

**Trước đây:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "user_context_roles": [
        {
          "context_id": 2,
          "role_id": 3,
          "role": {...}
        }
      ]
    }
  ]
}
```

**Hiện tại:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "user_role_assignments": [
        {
          "id": 10,
          "role_id": 3,
          "group_id": 5,  // ✅ Thay đổi: context_id → group_id
          "role": {...}
        }
      ]
    }
  ]
}
```

**Action cho FE:**
```javascript
// CŨ (KHÔNG DÙNG NỮA)
function getUserRoles(user, contextId) {
  return user.user_context_roles
    .filter(ucr => ucr.context_id === contextId)
    .map(ucr => ucr.role);
}

// MỚI (DÙNG CÁI NÀY)
function getUserRoles(user, groupId) {
  return user.user_role_assignments
    .filter(ura => ura.group_id === groupId)
    .map(ura => ura.role);
}
```

---

### 2. `PUT /api/admin/users/:id/roles` - Bắt buộc `X-Group-Id`

**Trước đây:**
```http
PUT /api/admin/users/:id/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4, 5]
}
```

**Hiện tại:**
```http
PUT /api/admin/users/:id/roles
X-Group-Id: 5  // ✅ BẮT BUỘC
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4, 5]
}
```

**Nếu không có `X-Group-Id`:**
- Lỗi 400: "Group ID is required. Please specify X-Group-Id header or group_id query parameter"

---

## ✅ Checklist Migration cho FE

### Phase 1: Cập nhật Headers

- [ ] Thay `X-Context-Id` bằng `X-Group-Id` trong các request cần thiết
- [ ] Đảm bảo luôn gửi `X-Group-Id` khi gọi `PUT /api/admin/users/:id/roles`
- [ ] Cập nhật logic lưu/load: lưu cả `group_id` và `context_id` vào localStorage

### Phase 2: Cập nhật Response Parsing

- [ ] Tìm tất cả chỗ dùng `user_context_roles` → thay bằng `user_role_assignments`
- [ ] Cập nhật logic filter: dùng `group_id` thay vì `context_id`
- [ ] Cập nhật UI hiển thị roles: parse từ `user_role_assignments[].role`

### Phase 3: Cập nhật APIs

- [ ] `POST /api/user/contexts/switch`: Thêm hỗ trợ gửi `group_id` (optional)
- [ ] `PUT /api/admin/users/:id/roles`: Đảm bảo luôn gửi `X-Group-Id`
- [ ] `GET /api/admin/users`: Cập nhật parse response với `user_role_assignments`

### Phase 4: Testing

- [ ] Test switch context/group
- [ ] Test lấy danh sách users với `X-Group-Id`
- [ ] Test gán roles với `X-Group-Id`
- [ ] Test backward compatibility với `X-Context-Id` (nếu vẫn dùng)

---

## 📊 Summary Table

| API Endpoint | Status | Khi nào dùng | Action Required |
|--------------|--------|--------------|-----------------|
| `GET /api/user/contexts` | ✅ Giữ | User đăng nhập, cần dropdown contexts | Không cần thay đổi |
| `POST /api/user/contexts/switch` | ✅ Giữ | User chọn context | Có thể thêm `group_id` (optional) |
| `GET /api/admin/groups` | ✅ Giữ | Lấy danh sách groups, tìm group_id từ context_id | Không cần thay đổi |
| `GET /api/admin/users` | ✅ Giữ | Hiển thị users trong group | **Parse `user_role_assignments` thay vì `user_context_roles`** |
| `PUT /api/admin/users/:id/roles` | ✅ Giữ | Gán roles cho user | **Bắt buộc gửi `X-Group-Id`** |
| `GET /api/groups/:id/members` | ✅ Giữ | Xem members của group | Không cần thay đổi |
| `POST /api/groups/:id/members` | ✅ Giữ | Thêm member vào group | Không cần thay đổi |
| `PUT /api/groups/:id/members/:id/roles` | ✅ Giữ | Cập nhật roles của member | Không cần thay đổi |
| `DELETE /api/groups/:id/members/:id` | ✅ Giữ | Xóa member khỏi group | Không cần thay đổi |
| `GET /api/contexts/my-groups` | 🆕 Mới | Lấy groups của user (hiển thị dropdown) | **Backend cần implement** |

---

## ❓ FAQ - Câu hỏi thường gặp

### Q1: `GET /api/user/contexts` trả về contexts hay groups?

**A:** Trả về **CONTEXTS** (không phải groups).

- Context là phạm vi lớn (System, Shop Trung Tâm, Shop Quận 1...)
- Group là phạm vi nhỏ trong context (SYSTEM_ADMIN, shop-001, shop-managers...)
- Flow: **Context → Group → Permissions**

**Ví dụ:**
```json
// Response từ GET /api/user/contexts
[
  { "id": "1", "type": "system", "name": "System" },  // Context, không phải group
  { "id": "2", "type": "shop", "name": "Shop Trung Tâm" }  // Context, không phải group
]
```

Sau đó cần query groups trong context:
```javascript
// Bước 1: Lấy contexts
const contexts = await fetch('/api/user/contexts').then(r => r.json());

// Bước 2: Lấy groups trong context
const groups = await fetch(`/api/admin/groups?filters[context_id]=2`).then(r => r.json());
// Response: [{ id: 5, name: "shop-001", context_id: 2 }]  // Đây mới là groups
```

---

### Q2: Khi user vào trang admin (System Admin hay Context Admin), làm sao để chuyển đổi?

**A:** Không có khái niệm "System Admin" hay "Context Admin" riêng biệt. Tất cả đều là **"User trong Group"**.

**Flow chuyển đổi:**

#### Case 1: System Admin (User trong SYSTEM_ADMIN group)

```
1. User đăng nhập
2. Gọi GET /api/user/contexts
   → Response: [{ id: "1", name: "System" }]
3. User chọn "System" context
4. Gọi POST /api/user/contexts/switch với { context_id: 1 }
5. Backend auto-resolve: group_id = SYSTEM_ADMIN (vì context chỉ có 1 group)
6. Lưu group_id vào localStorage
7. Từ bây giờ, gửi X-Group-Id trong mọi request
   → Check permissions trong SYSTEM_ADMIN group
```

#### Case 2: Context Admin (User có admin role trong group của Shop)

```
1. User đăng nhập
2. Gọi GET /api/user/contexts
   → Response: [{ id: "2", name: "Shop Trung Tâm" }]
3. User chọn "Shop Trung Tâm" context
4. Gọi POST /api/user/contexts/switch với { context_id: 2 }
5. Gọi GET /api/admin/groups?filters[context_id]=2
   → Response: [{ id: 5, name: "shop-001" }]
6. User chọn group (hoặc auto-select nếu 1 group)
7. Lưu group_id=5 vào localStorage
8. Từ bây giờ, gửi X-Group-Id: 5 trong mọi request
   → Check permissions trong group 5
```

#### Case 3: User có nhiều groups trong cùng context

```
1. User đăng nhập
2. Gọi GET /api/user/contexts
   → Response: [{ id: "2", name: "Shop Trung Tâm" }]
3. User chọn "Shop Trung Tâm" context
4. Gọi GET /api/admin/groups?filters[context_id]=2
   → Response: [
       { id: 5, name: "shop-001" },
       { id: 6, name: "shop-managers" }
     ]
5. Hiển thị dropdown: "Chọn Group"
   - Shop 001 (Admin)
   - Shop Managers (Manager)
6. User chọn group → Lưu group_id
7. Gửi X-Group-Id trong mọi request
   → Permissions khác nhau tùy group được chọn
```

---

### Q3: Khi nào dùng context_id, khi nào dùng group_id?

**A:**

| Mục đích | Dùng gì | Khi nào |
|----------|---------|---------|
| **Hiển thị dropdown đầu tiên** | `GET /api/user/contexts` → Trả về **contexts** | Sau khi user đăng nhập |
| **Switch context (phạm vi lớn)** | `POST /api/user/contexts/switch` với `context_id` | User chọn context từ dropdown |
| **Lấy groups trong context** | `GET /api/admin/groups?filters[context_id]=2` | Sau khi switch context |
| **Switch group (scope quyền)** | Lưu `group_id` vào localStorage | User chọn group từ dropdown |
| **Gửi trong mọi request** | `X-Group-Id` header (ƯU TIÊN) | Từ sau khi chọn group |
| **Auto-resolve** | `X-Context-Id` header (backward compatibility) | Nếu context chỉ có 1 group |

**Tóm tắt:**
- **Context** = Phạm vi lớn, tổ chức groups (dùng để chọn ban đầu)
- **Group** = Scope thực thi quyền (dùng trong mọi request sau khi chọn)

---

### Q4: Nếu tôi muốn hiển thị dropdown groups ngay từ đầu, không cần chọn context trước?

**A:** Có thể, nhưng cần API `GET /api/contexts/my-groups` (chưa có, cần backend implement).

**Workaround hiện tại:**
```javascript
async function getMyGroups() {
  // 1. Lấy contexts
  const contexts = await fetch('/api/user/contexts').then(r => r.json());
  
  // 2. Lấy groups cho mỗi context
  const groupsPromises = contexts.map(ctx => 
    fetch(`/api/admin/groups?filters[context_id]=${ctx.id}`).then(r => r.json())
  );
  
  const allGroups = await Promise.all(groupsPromises);
  return allGroups.flat();
}
```

**Sau đó hiển thị:**
```
Dropdown: "Chọn Group"
- System Administrators (System context)
- Shop 001 (Shop Trung Tâm context)
- Shop Managers (Shop Trung Tâm context)
```

---

### Q5: Trong 1 group có nhiều vai trò để phân cho các tài khoản khác nhau đúng không?

**A:** **Đúng hoàn toàn!**

**Cấu trúc:**
- **1 Group** có **nhiều Roles** (admin, manager, staff, viewer...)
- **Mỗi User** có thể có **nhiều Roles** trong cùng 1 Group
- **Nhiều Users** có thể có **cùng 1 Role** trong Group đó

**Ví dụ thực tế:**

Group: "shop-001" (Shop Trung Tâm)

**Roles trong group:**
- `admin` - Quản lý toàn bộ
- `manager` - Quản lý hàng hóa, đơn hàng
- `staff` - Nhân viên bán hàng
- `viewer` - Chỉ xem

**Users và roles:**
- User A → có role `admin`
- User B → có roles `manager` và `staff`
- User C → có role `staff`
- User D → có role `viewer`

**Cách gán roles:**

```javascript
// Gán role admin cho User A trong group 5
PUT /api/admin/users/1/roles
X-Group-Id: 5
Body: { role_ids: [3] }  // role_id=3 là admin

// Gán nhiều roles cho User B trong group 5
PUT /api/admin/users/2/roles
X-Group-Id: 5
Body: { role_ids: [4, 5] }  // role_id=4 là manager, role_id=5 là staff
```

**Lưu ý:**
- Mỗi role có các **permissions** riêng (user.create, order.delete...)
- User có nhiều roles → có **tất cả permissions** của các roles đó (OR logic)
- Roles chỉ có hiệu lực **trong Group đó** (admin trong group A ≠ admin trong group B)

---

### Q6: Tại sao không bỏ context_id, chỉ dùng group_id?

**A:** Context có mục đích:
1. **Tổ chức:** Nhóm các groups lại (ví dụ: Tất cả groups của Shop Trung Tâm)
2. **Validate:** Kiểm tra role có được phép trong context không (role_contexts)
3. **Backward compatibility:** Vẫn hỗ trợ `X-Context-Id` header (auto-resolve group)

**Nhưng quan trọng:**
- ✅ **Group** là scope duy nhất để check permissions
- ⚠️ **Context** chỉ để tổ chức và validate, không check permissions trực tiếp

---

**Last Updated:** 2025-01-15  
**API Version:** v2.0.0 (Group-Based Permissions)


