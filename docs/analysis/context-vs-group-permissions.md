# Phân Tích Phân Quyền: Context vs Group

## Tình Trạng Hiện Tại

### ✅ ĐÃ CÓ: Mỗi Context có danh sách Roles riêng

**Cấu trúc:**
- `RoleContext` table (junction table): `role_id`, `context_id`
- Role được gán vào Context (many-to-many)
- Mỗi Context có danh sách Roles riêng

**Ví dụ:**
```
Context (id=2, type='shop', ref_id=1)  ← Context của Shop Trung Tâm
    ↓
RoleContext (role_id=3, context_id=2)  ← Role "context_admin" trong Context này
RoleContext (role_id=4, context_id=2)  ← Role "manager" trong Context này
```

**Cách hoạt động:**
- System admin có thể gán Roles vào Contexts (qua RoleContext)
- Khi gán Role cho User trong Context, system validate Role phải có trong Context đó
- API `/api/admin/roles` filter roles theo Context hiện tại

### ❌ CHƯA CÓ: Mỗi Group có Roles riêng

**Vấn đề:**
- Không có `RoleGroup` entity
- Group không có quan hệ trực tiếp với Role
- Roles được gán vào Context của Group, không phải Group

**Cấu trúc hiện tại:**
```
Group (id=1, type='shop', name='Shop Trung Tâm')
    ↓ (1-1 relationship)
Context (id=2, type='shop', ref_id=1)  ← Context của Group này
    ↓ (many-to-many)
RoleContext (role_id=3, context_id=2)  ← Roles được gán vào Context, không phải Group
```

**Hệ quả:**
- Group không có roles riêng
- Roles được gán vào Context của Group
- Không thể có roles khác nhau cho cùng 1 Group trong các Contexts khác nhau

## So Sánh

| Yêu Cầu | Tình Trạng | Mô Tả |
|---------|-----------|-------|
| **Mỗi Context có Roles riêng** | ✅ Đã có | RoleContext table cho phép gán roles vào contexts |
| **Mỗi Group có Roles riêng** | ❌ Chưa có | Không có RoleGroup entity, roles chỉ gán vào Context |

## Giải Pháp Đề Xuất

### Nếu muốn Group có Roles riêng:

Cần thêm:
1. **RoleGroup entity** (junction table): `role_id`, `group_id`
2. Logic validate khi gán roles cho user trong group
3. API để quản lý roles của group

**Cấu trúc mới:**
```
Group (id=1)
    ↓ (many-to-many)
RoleGroup (role_id=5, group_id=1)  ← Roles riêng của Group
    ↓
Context (id=2, ref_id=1)  ← Context của Group
    ↓ (many-to-many)
RoleContext (role_id=3, context_id=2)  ← Roles của Context
```

**Lưu ý:**
- Nếu Group có roles riêng, cần quyết định:
  - Roles của Group và Context độc lập hay phụ thuộc?
  - Khi gán role cho user trong group, dùng roles của Group hay Context?
  - Logic phức tạp hơn: user có thể có role từ Group hoặc từ Context

### Nếu chỉ cần Context có Roles riêng (đã đủ):

Hiện tại đã đáp ứng:
- Context có roles riêng ✅
- Group có Context riêng ✅
- User được gán roles trong Context ✅

**Ví dụ sử dụng:**
- Shop "Trung Tâm" (Group id=1) có Context riêng (Context id=2, ref_id=1)
- Context này có các roles: "shop_admin", "shop_manager", "shop_staff"
- User được gán role "shop_admin" trong Context này
- User chỉ thấy các roles có trong Context này khi query

## Kết Luận

**Hiện tại hệ thống:**
- ✅ Mỗi Context có danh sách Roles riêng (qua RoleContext)
- ❌ Mỗi Group KHÔNG có Roles riêng (chỉ có roles qua Context của nó)

**Nếu cần Group có Roles riêng:**
- Cần thêm RoleGroup entity và logic tương ứng
- Cần quyết định mối quan hệ giữa Group roles và Context roles
- Phức tạp hơn nhưng linh hoạt hơn

