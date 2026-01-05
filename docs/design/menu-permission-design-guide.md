# Hướng Dẫn Thiết Kế Menu & Permission

## 📋 Nguyên Tắc Cơ Bản

### 1. **1 Menu = 1 Permission**
- Mỗi menu chỉ có **1 permission duy nhất** (dùng `required_permission_id`)
- Không dùng `menu_permissions` (nhiều permission) nữa
- Menu hiển thị khi user có permission đó trong group hiện tại

### 2. **Menu Không Phân Biệt Context**
- Menu là **duy nhất**, không tạo nhiều bản ghi cho các context khác nhau
- User lấy menu dựa vào **permission trong group**, không phụ thuộc vào context prefix

### 3. **Permission Có Hierarchy**
- Permission có parent-child relationship
- Menu nên dùng permission **parent** (manage level) thay vì child (create, read, update, delete)

---

## 🎯 Cách Chia Menu Theo Module

### **Cấu Trúc Menu Nên Có:**

```
📁 GROUP (Menu cha - không có route)
  └── 📄 ROUTE (Menu con - có route thực tế)
```

### **Ví Dụ Tốt:**

```typescript
// ✅ TỐT: GROUP cha + ROUTE con
{
  code: 'rbac-management',        // GROUP
  name: 'Phân quyền',
  type: MenuType.GROUP,
  permission_code: 'role.manage',  // Permission cha
  children: [
    {
      code: 'roles',               // ROUTE
      name: 'Vai trò',
      type: MenuType.ROUTE,
      path: '/admin/roles',
      permission_code: 'role.manage', // Cùng permission với parent
    },
    {
      code: 'permissions',
      name: 'Quyền',
      type: MenuType.ROUTE,
      path: '/admin/permissions',
      permission_code: 'permission.manage', // Permission riêng
    }
  ]
}
```

### **Ví Dụ Không Tốt:**

```typescript
// ❌ KHÔNG TỐT: Tất cả đều là ROUTE, không có nhóm
{
  code: 'roles',
  name: 'Vai trò',
  type: MenuType.ROUTE,
  permission_code: 'role.manage',
},
{
  code: 'permissions',
  name: 'Quyền',
  type: MenuType.ROUTE,
  permission_code: 'permission.manage',
}
// → Menu rời rạc, khó quản lý
```

---

## 🔑 Cách Chọn Permission Cho Menu

### **Quy Tắc:**

1. **Menu GROUP (cha):** Dùng permission **parent** (manage level)
   ```typescript
   permission_code: 'user.manage'      // ✅ Tốt
   permission_code: 'user.read'        // ❌ Không tốt
   ```

2. **Menu ROUTE (con):** 
   - Nếu cùng module với parent → dùng **cùng permission** với parent
   - Nếu khác module → dùng permission **riêng** của module đó

3. **Ưu tiên permission có scope phù hợp:**
   - Menu system → dùng `system.*` permissions
   - Menu context → dùng context permissions (không có `system.` prefix)

### **Ví Dụ:**

```typescript
// ✅ TỐT: Permission phù hợp
{
  code: 'config-management',
  name: 'Cấu hình hệ thống',
  type: MenuType.GROUP,
  permission_code: 'system.config.manage', // System scope
},
{
  code: 'users',
  name: 'Tài khoản',
  type: MenuType.ROUTE,
  permission_code: 'user.manage', // Context scope
}

// ❌ KHÔNG TỐT: Permission không phù hợp
{
  code: 'config-management',
  name: 'Cấu hình hệ thống',
  type: MenuType.GROUP,
  permission_code: 'system_config.read', // Dùng read thay vì manage
}
```

---

## 📊 Cấu Trúc Menu Đề Xuất

### **1. Hệ Thống & Quản Trị (System Level)**

```
📁 Quản lý tài khoản (user.manage)
  └── 📄 Tài khoản (/admin/users)

📁 Phân quyền (role.manage)
  ├── 📄 Vai trò (/admin/roles)
  ├── 📄 Quyền (/admin/permissions)
  ├── 📄 Nhóm (/admin/groups)
  └── 📄 Context (/admin/contexts) [system.group.manage]

📁 Cấu hình hệ thống (system.config.manage)
  ├── 📄 Cấu hình chung (/admin/system-config/general)
  └── 📄 Cấu hình Email (/admin/system-config/email)

📁 E-commerce (system.payment_method.manage)
  ├── 📄 Phương thức thanh toán (/admin/payment-methods)
  └── 📄 Phương thức vận chuyển (/admin/shipping-methods)

📁 Nội dung (system.banner.manage)
  ├── 📄 Banner (/admin/banners)
  └── 📄 Vị trí Banner (/admin/banner-locations)
```

### **2. Nghiệp Vụ (Context Level)**

```
📄 Quản lý sản phẩm (product.manage)
📄 Đơn hàng (order.manage)
📄 Khuyến mãi (coupon.manage)
📄 Kho hàng (warehouse.manage)
📄 Liên hệ (contact.manage)
```

---

## 🎨 Best Practices

### **1. Đặt Tên Menu**

```typescript
// ✅ TỐT: Rõ ràng, ngắn gọn
code: 'account-management'
code: 'rbac-management'
code: 'ecommerce-management'

// ❌ KHÔNG TỐT: Dài dòng, khó hiểu
code: 'quan-ly-tai-khoan-nguoi-dung'
code: 'system-account-management-group'
```

### **2. Sort Order**

```typescript
// ✅ TỐT: Nhóm theo 10, 20, 30...
sort_order: 10  // Quản lý tài khoản
sort_order: 20  // Phân quyền
sort_order: 30  // Cấu hình hệ thống
sort_order: 40  // E-commerce
sort_order: 50  // Nội dung

// Menu con: 10, 20, 30...
sort_order: 10  // Vai trò
sort_order: 20  // Quyền
sort_order: 30  // Nhóm
```

### **3. Icon**

```typescript
// ✅ TỐT: Icon phù hợp với chức năng
icon: '👥'  // Quản lý tài khoản
icon: '🔐'  // Phân quyền
icon: '⚙️'  // Cấu hình
icon: '🛒'  // E-commerce
icon: '📦'  // Sản phẩm/Kho hàng
```

### **4. Path & API Path**

```typescript
// ✅ TỐT: Nhất quán
path: '/admin/users'
api_path: 'api/admin/users'

path: '/admin/roles'
api_path: 'api/admin/roles'
```

---

## 🔍 Checklist Khi Tạo Menu Mới

- [ ] Menu có **1 permission duy nhất**?
- [ ] Permission là **parent level** (manage) chứ không phải child (read, create)?
- [ ] Menu **không trùng lặp** với menu khác?
- [ ] Menu có **parent-child relationship** hợp lý?
- [ ] Permission code **tồn tại** trong seed-permissions?
- [ ] Sort order **nhất quán** (10, 20, 30...)?
- [ ] Icon **phù hợp** với chức năng?
- [ ] Path và API path **nhất quán**?

---

## 📝 Ví Dụ Hoàn Chỉnh

```typescript
const menuData = [
  // ========== QUẢN LÝ TÀI KHOẢN ==========
  {
    code: 'account-management',
    name: 'Quản lý tài khoản',
    path: '/admin/users',
    api_path: 'api/admin/users',
    icon: '👥',
    type: MenuType.GROUP,
    status: BasicStatus.Active,
    parent_id: null,
    sort_order: 10,
    is_public: false,
    show_in_menu: true,
    permission_code: 'user.manage', // ✅ Parent permission
  },
  {
    code: 'users',
    name: 'Tài khoản',
    path: '/admin/users',
    api_path: 'api/admin/users',
    icon: '👤',
    type: MenuType.ROUTE,
    status: BasicStatus.Active,
    parent_code: 'account-management',
    sort_order: 10,
    is_public: false,
    show_in_menu: true,
    permission_code: 'user.manage', // ✅ Cùng permission với parent
  },
  
  // ========== PHÂN QUYỀN ==========
  {
    code: 'rbac-management',
    name: 'Phân quyền',
    path: '/admin/roles',
    api_path: 'api/admin/roles',
    icon: '🔐',
    type: MenuType.GROUP,
    status: BasicStatus.Active,
    parent_id: null,
    sort_order: 20,
    is_public: false,
    show_in_menu: true,
    permission_code: 'role.manage', // ✅ Parent permission
  },
  {
    code: 'roles',
    name: 'Vai trò',
    path: '/admin/roles',
    api_path: 'api/admin/roles',
    icon: '👔',
    type: MenuType.ROUTE,
    status: BasicStatus.Active,
    parent_code: 'rbac-management',
    sort_order: 10,
    is_public: false,
    show_in_menu: true,
    permission_code: 'role.manage', // ✅ Cùng permission
  },
  {
    code: 'permissions',
    name: 'Quyền',
    path: '/admin/permissions',
    api_path: 'api/admin/permissions',
    icon: '🔑',
    type: MenuType.ROUTE,
    status: BasicStatus.Active,
    parent_code: 'rbac-management',
    sort_order: 20,
    is_public: false,
    show_in_menu: true,
    permission_code: 'permission.manage', // ✅ Permission riêng
  },
];
```

---

## 🚨 Lưu Ý Quan Trọng

1. **Không tạo menu trùng lặp** cho các context khác nhau
2. **Luôn dùng permission parent** (manage level) cho menu
3. **Kiểm tra permission tồn tại** trước khi tạo menu
4. **Nhất quán trong naming convention** (code, path, api_path)
5. **Test menu hiển thị đúng** với user có permission trong group

---

## 📚 Tài Liệu Tham Khảo

- `src/core/database/seeder/seed-menus.ts` - Seeder menu
- `src/core/database/seeder/seed-permissions.ts` - Seeder permission
- `src/modules/menu/admin/menu/services/menu.service.ts` - Logic lấy menu

