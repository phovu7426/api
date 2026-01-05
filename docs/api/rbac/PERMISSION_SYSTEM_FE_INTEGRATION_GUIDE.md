# Hướng Dẫn Tích Hợp Hệ Thống Phân Quyền cho Frontend

Tài liệu này hướng dẫn Frontend tích hợp với hệ thống phân quyền Group-based của Backend.

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Khái Niệm Cơ Bản](#khái-niệm-cơ-bản)
3. [Flow Tích Hợp](#flow-tích-hợp)
4. [Authentication & Headers](#authentication--headers)
5. [Các API Cần Sử Dụng](#các-api-cần-sử-dụng)
6. [Ví Dụ Code](#ví-dụ-code)
7. [Xử Lý Lỗi](#xử-lý-lỗi)
8. [Best Practices](#best-practices)

---

## 🎯 Tổng Quan

Hệ thống phân quyền sử dụng mô hình **Group-based permissions**:

- **User** → là member của các **Groups**
- Mỗi **Group** → User có các **Roles** khác nhau
- **Roles** → có các **Permissions** (quyền)
- Backend tự động kiểm tra permissions dựa trên **Group ID** được gửi trong header

**Quan trọng:** Frontend **KHÔNG CẦN** kiểm tra permissions. Chỉ cần:
1. Lấy danh sách groups của user
2. Gửi `X-Group-Id` header khi gọi API
3. Backend tự động kiểm tra và trả về lỗi nếu không có quyền

---

## 📖 Khái Niệm Cơ Bản

### Context vs Group

**Context (Ngữ cảnh - Phạm vi lớn):**
- Là cấu trúc cha để tổ chức các groups
- Ví dụ: "System", "Shop Trung Tâm", "Shop Quận 1"
- **KHÔNG PHẢI** scope thực thi quyền (chỉ để tổ chức)

**Group (Nhóm - Scope thực thi quyền):**
- Là **scope duy nhất** để gán và kiểm tra quyền
- User có roles **trong group**, không phải trong context
- Ví dụ: "SYSTEM_ADMIN", "shop-001", "shop-manager-group"
- Mỗi group thuộc về **một context** (context_id)

**Mối quan hệ:**
```
Context (Shop Trung Tâm)
  ├── Group (shop-001) ← User có role "admin" ở đây
  └── Group (shop-001-managers) ← User có role "manager" ở đây
```

### System Admin

- System Admin = User có role trong **SYSTEM_ADMIN group**
- SYSTEM_ADMIN group thuộc về **System context** (context_id=1)
- System Admin có quyền truy cập toàn bộ hệ thống

---

## 🔄 Flow Tích Hợp

### Bước 1: User Đăng Nhập

```javascript
// POST /api/auth/login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
// Lưu token
localStorage.setItem('auth_token', data.token);
```

### Bước 2: Lấy Danh Sách Groups của User

```javascript
// GET /api/user/groups
const myGroupsResponse = await fetch('/api/user/groups', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const myGroups = await myGroupsResponse.json();
// myGroups = [
//   {
//     id: 5,
//     code: "shop-001",
//     name: "Shop Trung Tâm",
//     type: "shop",
//     context_id: 2,
//     joined_at: "2024-01-15T11:00:00.000Z",
//     roles: [
//       { id: 3, code: "admin", name: "Administrator" }
//     ]
//   },
//   {
//     id: 6,
//     code: "shop-002",
//     name: "Shop Quận 1",
//     type: "shop",
//     context_id: 3,
//     joined_at: "2024-01-15T12:00:00.000Z",
//     roles: [
//       { id: 4, code: "manager", name: "Manager" }
//     ]
//   }
// ]
```

**Lưu ý:** 
- API này chỉ trả về groups mà user là member
- Đã kèm roles của user trong mỗi group
- Response có `context_id` nếu cần hiển thị (nhưng không bắt buộc)

### Bước 3: User Chọn Group (hoặc Auto-select)

```javascript
let selectedGroupId = null;

if (myGroups.length === 1) {
  // Nếu chỉ có 1 group → Auto-select
  selectedGroupId = myGroups[0].id;
} else if (myGroups.length > 1) {
  // Nếu có nhiều groups → Hiển thị dropdown cho user chọn - nhưng mặc định chọn cái đầu tiên
  // User chọn group → set selectedGroupId
  selectedGroupId = userSelectedGroupId; // từ dropdown
}

// Lưu vào localStorage
localStorage.setItem('selected_group_id', selectedGroupId);
```

### Bước 4: Gửi X-Group-Id Header trong Mọi Request

```javascript
// Từ bây giờ, mọi API call đều phải gửi X-Group-Id header
const response = await fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Group-Id': selectedGroupId // ← Quan trọng!
  }
});
```

---

## 🔐 Authentication & Headers

### Headers Bắt Buộc

Tất cả API calls (trừ login/register) đều cần:

```javascript
{
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json',
  'X-Group-Id': '<group_id>' // ← Quan trọng cho permissions
}
```

### X-Group-Id Header

**Khi nào bắt buộc:**
- ✅ Mọi API calls sau khi user chọn group
- ✅ Đặc biệt bắt buộc cho `PUT /api/admin/users/:id/roles`

**Khi nào có thể bỏ qua:**
- ❌ Login/Register (public endpoints)
- ⚠️ System context (có thể null, nhưng nên gửi để rõ ràng)

**Cách gửi:**
```javascript
// Option 1: Header
headers: {
  'X-Group-Id': '5'
}

// Option 2: Query parameter (fallback)
'/api/admin/users?group_id=5'
```

**Lưu ý:** Backend ưu tiên header hơn query parameter.

---

## 📡 Các API Cần Sử Dụng

### 1. Lấy Contexts của User

**Endpoint:** `GET /api/user/contexts`

**Headers:**
```
Authorization: Bearer <token>
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

**Khi nào dùng:**
- ✅ Bước đầu tiên sau khi login
- ✅ Hiển thị dropdown "Chọn Context" ở header

---

### 2. Lấy Groups của User

**Endpoint:** `GET /api/user/groups`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
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
```

**Khi nào dùng:**
- ✅ Bước đầu tiên sau khi login
- ✅ Hiển thị dropdown "Chọn Group" kèm roles
- ✅ Kiểm tra roles của user trong từng group

**Lưu ý:** API này đã đủ thông tin, không cần lấy contexts riêng.

---

### 2. Lấy Danh Sách Groups (Admin API) - Tùy chọn

**Endpoint:** `GET /api/admin/groups`

**Headers:**
```
Authorization: Bearer <token>
X-Group-Id: <group_id> (optional)
```

**Query Parameters:**
- `filters[context_id]`: Lọc groups theo context
- `filters[type]`: Lọc theo type (shop, team, ...)
- `page`, `limit`: Phân trang

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
      "status": "active",
      ...
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

**Khi nào dùng:**
- ✅ Khi cần lấy tất cả groups trong một context (admin view)
- ✅ Khác với `/api/user/groups` - API này trả về TẤT CẢ groups, không chỉ groups của user

---

## 💻 Ví Dụ Code

### Setup Axios Interceptor

```javascript
import axios from 'axios';

// Tạo axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Request interceptor: tự động thêm headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  const groupId = localStorage.getItem('selected_group_id');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (groupId) {
    config.headers['X-Group-Id'] = groupId;
  }
  
  return config;
});

// Response interceptor: xử lý errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn → logout
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Không có quyền → hiển thị thông báo
      console.error('Access denied:', error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Hàm Helper: Lấy và Lưu Context/Group

```javascript
// utils/auth.js

/**
 * Lấy groups của user, lưu vào localStorage và auto-select nếu cần
 */
export async function initializeUserGroups(token) {
  try {
    // Lấy groups của user
    const groupsRes = await fetch('/api/user/groups', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const myGroups = await groupsRes.json();
    
    // Lưu groups
    localStorage.setItem('user_groups', JSON.stringify(myGroups));
    
    // Auto-select group nếu chỉ có 1
    if (myGroups.length === 1) {
      localStorage.setItem('selected_group_id', myGroups[0].id);
    } else if (myGroups.length > 1) {
      // Có nhiều groups → có thể chọn group đầu tiên làm default
      // hoặc để user chọn (không auto-select)
      const savedGroupId = localStorage.getItem('selected_group_id');
      if (savedGroupId && myGroups.some(g => g.id?.toString() === savedGroupId)) {
        // Giữ group đã chọn trước đó nếu vẫn còn trong danh sách
        localStorage.setItem('selected_group_id', savedGroupId);
      } else {
        // Chọn group đầu tiên làm default
        localStorage.setItem('selected_group_id', myGroups[0].id);
      }
    }
    
    return myGroups;
  } catch (error) {
    console.error('Failed to initialize user groups:', error);
    throw error;
  }
}

/**
 * Lấy group đã chọn
 */
export function getSelectedGroup() {
  const groupId = localStorage.getItem('selected_group_id');
  const groups = JSON.parse(localStorage.getItem('user_groups') || '[]');
  
  const group = groups.find(g => g.id?.toString() === groupId);
  
  return group;
}
```

### Component: Context/Group Selector

```jsx
// components/GroupSelector.jsx
import { useState, useEffect } from 'react';
import { initializeUserGroups, getSelectedGroup } from '../utils/auth';

function GroupSelector() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      initializeUserGroups(token).then((groups) => {
        setGroups(groups);
        
        // Lấy group đã chọn
        const group = getSelectedGroup();
        setSelectedGroup(group);
      });
    }
  }, []);
  
  const handleGroupChange = (groupId) => {
    localStorage.setItem('selected_group_id', groupId);
    setSelectedGroup(groups.find(g => g.id === groupId));
    
    // Reload page để apply group mới
    window.location.reload();
  };
  
  // Nếu chỉ có 1 group → hiển thị thông tin, không cần dropdown
  if (groups.length === 1) {
    const group = groups[0];
    return (
      <div className="group-selector">
        <span>
          {group.name}
          {group.roles.length > 0 && (
            <span className="roles"> ({group.roles.map(r => r.name).join(', ')})</span>
          )}
        </span>
      </div>
    );
  }
  
  // Nếu có nhiều groups → hiển thị dropdown
  return (
    <div className="group-selector">
      <select
        value={selectedGroup?.id || ''}
        onChange={(e) => handleGroupChange(e.target.value)}
      >
        {groups.map(group => (
          <option key={group.id} value={group.id}>
            {group.name}
            {group.roles.length > 0 && (
              <span> ({group.roles.map(r => r.name).join(', ')})</span>
            )}
          </option>
        ))}
      </select>
    </div>
  );
}

export default GroupSelector;
```

### Sử Dụng API với Group ID

```javascript
// services/userService.js
import api from '../utils/axios';

// Lấy danh sách users
export async function getUsers(page = 1, limit = 10) {
  // X-Group-Id đã được tự động thêm bởi interceptor
  const response = await api.get('/admin/users', {
    params: { page, limit }
  });
  return response.data;
}

// Gán roles cho user
export async function assignRolesToUser(userId, roleIds) {
  // X-Group-Id BẮT BUỘC cho API này
  const response = await api.put(`/admin/users/${userId}/roles`, {
    role_ids: roleIds
  });
  return response.data;
}
```

---

## ⚠️ Xử Lý Lỗi

### Error Codes

| Status Code | Mô Tả | Cách Xử Lý |
|-------------|-------|------------|
| **401** | Unauthorized - Token không hợp lệ | → Logout user, redirect về login |
| **403** | Forbidden - Không có quyền | → Hiển thị thông báo "Bạn không có quyền truy cập" |
| **400** | Bad Request - Request không hợp lệ | → Hiển thị lỗi validation |
| **404** | Not Found | → Hiển thị "Không tìm thấy" |

### Xử Lý 403 Forbidden

```javascript
// Khi gọi API và nhận 403
try {
  const response = await api.get('/admin/users');
  // ...
} catch (error) {
  if (error.response?.status === 403) {
    const message = error.response.data.message || 'Bạn không có quyền truy cập';
    
    // Option 1: Hiển thị toast notification
    toast.error(message);
    
    // Option 2: Hide/disable UI elements
    // Không cần làm gì - button đã bị disable
    
    // Option 3: Redirect về trang chủ
    // router.push('/');
  }
}
```

### Xử Lý Missing Group ID

```javascript
// Kiểm tra group ID trước khi gọi API
function callAPI(endpoint) {
  const groupId = localStorage.getItem('selected_group_id');
  
  if (!groupId) {
    // Chưa chọn group → yêu cầu user chọn
    alert('Vui lòng chọn Context/Group trước khi tiếp tục');
    return;
  }
  
  return api.get(endpoint);
}
```

---

## ✅ Best Practices

### 1. Lưu Groups vào LocalStorage

```javascript
// Sau khi login
localStorage.setItem('auth_token', token);
await initializeUserGroups(token);

// Khi user chọn group
localStorage.setItem('selected_group_id', groupId);
```

### 2. Sử Dụng Axios Interceptor

Tự động thêm headers cho mọi request:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  const groupId = localStorage.getItem('selected_group_id');
  
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (groupId) config.headers['X-Group-Id'] = groupId;
  
  return config;
});
```

### 3. Reload Page Khi Đổi Group

Khi user chọn group mới, nên reload page để:
- Apply group ID mới cho tất cả API calls
- Reload data theo group mới
- Đảm bảo consistency

```javascript
const handleGroupChange = (groupId) => {
  localStorage.setItem('selected_group_id', groupId);
  window.location.reload(); // ← Reload page
};
```

### 4. Kiểm Tra Group ID Trước Khi Gọi API Quan Trọng

```javascript
// Đặc biệt cho API gán roles
async function assignRoles(userId, roleIds) {
  const groupId = localStorage.getItem('selected_group_id');
  
  if (!groupId) {
    throw new Error('Group ID is required');
  }
  
  return api.put(`/admin/users/${userId}/roles`, {
    role_ids: roleIds
  });
}
```

### 5. Hiển Thị Group Selector Ở Header

Đặt group selector ở header để user dễ dàng chuyển đổi:

```
┌─────────────────────────────────────────┐
│ Logo  │ Group: [Shop Trung Tâm (admin) ▼] │
└─────────────────────────────────────────┘
```

Nếu có nhiều groups, hiển thị dropdown. Nếu chỉ có 1 group, chỉ hiển thị tên group.

### 6. Cache Groups và Roles

Không cần gọi API `/api/user/groups` mỗi lần. Cache trong localStorage và chỉ refresh khi:
- User login lại
- User đổi group
- Explicit refresh (button refresh)

---

## 📝 Checklist Tích Hợp

- [ ] Setup axios interceptor để tự động thêm `Authorization` và `X-Group-Id` headers
- [ ] Implement hàm `initializeUserGroups()` để lấy groups sau khi login
- [ ] Tạo component Group selector
- [ ] Lưu `selected_group_id` vào localStorage
- [ ] Auto-select group nếu chỉ có 1 option
- [ ] Reload page khi user đổi group
- [ ] Xử lý errors (401, 403, 404)
- [ ] Hiển thị group selector ở header
- [ ] Test với nhiều groups
- [ ] Test với user chỉ có 1 group (auto-select)

---

## 🔗 Tài Liệu Liên Quan

- [Group-Based Permissions API Guide](./group-based-permissions-api-fe-guide.md)
- [Roles & Permissions API](./API_INTEGRATION_GUIDE_FE.md)
- [Context & Groups API](../context/README.md)

---

## ❓ FAQ

### Q: Tôi có cần kiểm tra permissions ở Frontend không?

**A:** Không. Backend tự động kiểm tra permissions. Frontend chỉ cần:
1. Gửi `X-Group-Id` header
2. Xử lý lỗi 403 nếu không có quyền
3. Ẩn/hiện UI elements dựa trên response (tùy chọn)

### Q: Khi nào cần gửi X-Group-Id?

**A:** Mọi API calls sau khi user chọn group. Đặc biệt bắt buộc cho:
- `PUT /api/admin/users/:id/roles`
- Các API admin khác

### Q: Nếu user chưa chọn group thì sao?

**A:** 
- Nếu context chỉ có 1 group → Auto-select
- Nếu có nhiều groups → Yêu cầu user chọn
- Nếu không chọn → Một số API sẽ fail (đặc biệt là API gán roles)

### Q: System Admin thì group ID là gì?

**A:** System Admin vẫn có group ID (SYSTEM_ADMIN group). Gửi group ID như bình thường.

### Q: Tôi có cần lấy contexts trước không?

**A:** Không. Chỉ cần gọi `GET /api/user/groups` là đủ. Response đã có `context_id` nếu cần hiển thị, nhưng không bắt buộc. User chỉ cần chọn group để làm việc.

---

**Cần hỗ trợ thêm?** Vui lòng liên hệ Backend team.

