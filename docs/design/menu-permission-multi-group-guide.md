# Hướng Dẫn Phân Quyền Menu Cho Nhiều Group

## 🎯 Vấn Đề

Menu "Tài khoản" chỉ có **1 bản ghi duy nhất**, nhưng cần hiển thị cho user trong nhiều group khác nhau:
- System group
- Shop1, Shop2, Shop3, Shop4
- Truyện 1, Truyện 2, Truyện 3, Truyện 4

**Làm sao để user chỉ thấy menu khi họ có quyền trong group hiện tại?**

---

## ✅ Giải Pháp: Permission-Based Menu Filtering

### **Nguyên Tắc:**

1. **Menu là duy nhất** - Không tạo nhiều bản ghi cho các group
2. **Permission check theo group** - Menu hiển thị dựa vào permission user có trong **group hiện tại**
3. **Role assignment theo group** - User có role khác nhau trong các group khác nhau

### **Luồng Hoạt Động:**

```
1. User chọn group hiện tại (system, shop1, shop2, ...)
   ↓
2. System lấy groupId từ RequestContext
   ↓
3. Query tất cả menu (không filter theo group)
   ↓
4. Với mỗi menu, check: User có permission của menu trong group hiện tại không?
   ↓
5. Menu hiển thị nếu: user có permission đó trong group hiện tại
```

---

## 📊 Ví Dụ Cụ Thể

### **Scenario: Menu "Tài khoản"**

```typescript
// Menu chỉ có 1 bản ghi
{
  code: 'users',
  name: 'Tài khoản',
  path: '/admin/users',
  permission_code: 'user.manage', // ✅ Permission duy nhất
}
```

### **User A trong các group:**

| Group | Role | Permissions | Menu "Tài khoản" hiển thị? |
|-------|------|-------------|----------------------------|
| **system** | system_admin | `user.manage`, `role.manage`, ... | ✅ **CÓ** (có `user.manage`) |
| **shop1** | context_admin | `user.manage`, `product.manage`, ... | ✅ **CÓ** (có `user.manage`) |
| **shop2** | editor | `product.read`, `post.read` | ❌ **KHÔNG** (không có `user.manage`) |
| **truyện1** | author | `post.create`, `post.read` | ❌ **KHÔNG** (không có `user.manage`) |

### **Kết Quả:**

- Khi user A chọn group **system** → Thấy menu "Tài khoản" ✅
- Khi user A chọn group **shop1** → Thấy menu "Tài khoản" ✅
- Khi user A chọn group **shop2** → **KHÔNG** thấy menu "Tài khoản" ❌
- Khi user A chọn group **truyện1** → **KHÔNG** thấy menu "Tài khoản" ❌

---

## 🔑 Cách Phân Quyền

### **Option 1: Dùng Cùng Permission (Khuyến Nghị)**

**Ưu điểm:** Đơn giản, dễ quản lý

```typescript
// Menu
{
  code: 'users',
  permission_code: 'user.manage', // ✅ Cùng permission cho tất cả group
}

// Permission
{
  code: 'user.manage',
  scope: 'context', // ✅ Context scope (dùng cho cả system và context groups)
}
```

**Cách gán quyền:**
- System group: Role `system_admin` có permission `user.manage`
- Shop1 group: Role `context_admin` có permission `user.manage`
- Shop2 group: Role `editor` **KHÔNG** có permission `user.manage`

### **Option 2: Phân Biệt System vs Context Permission**

**Ưu điểm:** Rõ ràng phân biệt system và context

```typescript
// Menu
{
  code: 'users',
  permission_code: 'user.manage', // ✅ Dùng context permission
}

// Permissions
{
  code: 'system.user.manage', // System-level
  scope: 'system',
},
{
  code: 'user.manage', // Context-level
  scope: 'context',
}
```

**Cách gán quyền:**
- System group: Role `system_admin` có permission `system.user.manage`
- Shop1 group: Role `context_admin` có permission `user.manage`
- Menu check: User có **BẤT KỲ** permission nào (`system.user.manage` HOẶC `user.manage`)

**⚠️ Lưu ý:** Cần sửa logic menu để check nhiều permission (không khuyến nghị)

---

## 💡 Best Practice: Dùng Cùng Permission (Option 1)

### **1. Permission Scope**

```typescript
// ✅ TỐT: Dùng context scope cho permission dùng chung
{
  code: 'user.manage',
  scope: 'context', // ✅ Dùng cho cả system và context groups
}

// ❌ KHÔNG TỐT: Tạo 2 permission riêng
{
  code: 'system.user.manage', // System
  scope: 'system',
}
{
  code: 'user.manage', // Context
  scope: 'context',
}
```

### **2. Role Assignment**

```typescript
// System Admin Role (trong system group)
{
  code: 'system_admin',
  permissions: [
    'user.manage',      // ✅ Quản lý user
    'role.manage',      // ✅ Quản lý role
    'system.config.manage', // ✅ Cấu hình system
    // ...
  ]
}

// Context Admin Role (trong shop1, shop2, ...)
{
  code: 'context_admin',
  permissions: [
    'user.manage',      // ✅ Quản lý user trong context
    'product.manage',   // ✅ Quản lý sản phẩm
    'order.manage',    // ✅ Quản lý đơn hàng
    // ...
  ]
}

// Editor Role (trong shop2, ...)
{
  code: 'editor',
  permissions: [
    'product.read',     // ✅ Chỉ đọc
    'post.read',        // ✅ Chỉ đọc
    // ❌ KHÔNG có user.manage
  ]
}
```

### **3. User Role Assignment**

```typescript
// User A
{
  user_id: 1,
  role_id: system_admin.id,
  group_id: system.id, // ✅ Có user.manage trong system group
}

{
  user_id: 1,
  role_id: context_admin.id,
  group_id: shop1.id, // ✅ Có user.manage trong shop1 group
}

{
  user_id: 1,
  role_id: editor.id,
  group_id: shop2.id, // ❌ KHÔNG có user.manage trong shop2 group
}
```

---

## 🔍 Logic Check Permission

### **Code Flow:**

```typescript
// 1. User chọn group hiện tại
const groupId = RequestContext.get<number>('groupId'); // shop1, shop2, system, ...

// 2. Lấy tất cả menu
const menus = await menuRepo.find();

// 3. Với mỗi menu, check permission trong group hiện tại
for (const menu of menus) {
  const hasPermission = await rbacService.userHasPermissionsInGroup(
    userId,
    groupId, // ✅ Group hiện tại
    [menu.required_permission.code] // ✅ Permission của menu
  );
  
  if (hasPermission) {
    // ✅ Menu hiển thị
  } else {
    // ❌ Menu ẩn
  }
}
```

### **userHasPermissionsInGroup Logic:**

```typescript
async userHasPermissionsInGroup(userId, groupId, requiredPerms) {
  // 1. Check user thuộc group
  const userInGroup = await userGroupRepo.findOne({
    where: { user_id: userId, group_id: groupId }
  });
  if (!userInGroup) return false;
  
  // 2. Lấy roles của user trong group
  const userRoles = await userRoleAssignmentRepo.find({
    where: { user_id: userId, group_id: groupId }
  });
  
  // 3. Lấy permissions từ roles
  const userPerms = new Set();
  for (const userRole of userRoles) {
    const role = await roleRepo.findOne({
      where: { id: userRole.role_id },
      relations: ['permissions']
    });
    role.permissions.forEach(perm => userPerms.add(perm.code));
  }
  
  // 4. Check user có permission cần thiết không
  return requiredPerms.some(perm => userPerms.has(perm));
}
```

---

## 📋 Checklist Khi Setup

### **1. Permission Setup**

- [ ] Permission có scope phù hợp (`context` cho permission dùng chung)
- [ ] Permission code nhất quán (không tạo duplicate)
- [ ] Permission có parent-child relationship đúng

### **2. Role Setup**

- [ ] System roles có permissions phù hợp
- [ ] Context roles có permissions phù hợp
- [ ] Role không có permission không cần thiết

### **3. User Assignment**

- [ ] User được gán role trong các group phù hợp
- [ ] User có quyền đúng trong từng group
- [ ] Test user thấy menu đúng khi chọn group khác nhau

### **4. Menu Setup**

- [ ] Menu chỉ có 1 bản ghi duy nhất
- [ ] Menu có permission phù hợp
- [ ] Menu không phân biệt group/context

---

## 🎯 Ví Dụ Hoàn Chỉnh

### **Setup:**

```typescript
// 1. Permission
{
  code: 'user.manage',
  scope: 'context', // ✅ Dùng cho cả system và context
}

// 2. Roles
const systemAdmin = {
  code: 'system_admin',
  permissions: ['user.manage', 'role.manage', ...]
};

const contextAdmin = {
  code: 'context_admin',
  permissions: ['user.manage', 'product.manage', ...]
};

const editor = {
  code: 'editor',
  permissions: ['product.read', 'post.read'] // ❌ Không có user.manage
};

// 3. Menu
{
  code: 'users',
  name: 'Tài khoản',
  permission_code: 'user.manage', // ✅ Cùng permission
}

// 4. User Assignment
User A:
  - system group: system_admin role → Có user.manage ✅
  - shop1 group: context_admin role → Có user.manage ✅
  - shop2 group: editor role → KHÔNG có user.manage ❌
```

### **Kết Quả:**

- User A chọn **system** group → Thấy menu "Tài khoản" ✅
- User A chọn **shop1** group → Thấy menu "Tài khoản" ✅
- User A chọn **shop2** group → **KHÔNG** thấy menu "Tài khoản" ❌

---

## 🚨 Lưu Ý Quan Trọng

1. **Menu không phân biệt group** - Chỉ có 1 bản ghi duy nhất
2. **Permission check theo group hiện tại** - Menu hiển thị dựa vào permission trong group đang active
3. **Role assignment theo group** - User có role khác nhau trong các group khác nhau
4. **Dùng cùng permission** - Khuyến nghị dùng `user.manage` cho cả system và context (scope: `context`)
5. **Test kỹ** - Test user thấy menu đúng khi chọn group khác nhau

---

## 📚 Tài Liệu Tham Khảo

- `src/modules/menu/admin/menu/services/menu.service.ts` - Logic lấy menu
- `src/modules/rbac/services/rbac.service.ts` - Logic check permission
- `src/core/database/seeder/seed-roles.ts` - Setup roles
- `src/core/database/seeder/seed-permissions.ts` - Setup permissions

