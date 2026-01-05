# Database Schema - Cấu Trúc Bảng Chuẩn

Tài liệu mô tả chuẩn cấu trúc database của dự án.

## Quy Ước Chung

### Các Trường Bắt Buộc

Tất cả các bảng (trừ junction tables) phải có các trường sau:

```sql
-- Primary Key
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY

-- Audit Fields (Người dùng tạo/cập nhật)
created_user_id BIGINT UNSIGNED NULL
updated_user_id BIGINT UNSIGNED NULL

-- Timestamp Fields
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

-- Soft Delete (tùy chọn, dùng cho các bảng cần soft delete)
deleted_at DATETIME NULL
```

### Indexes Chuẩn

```sql
-- Index cho audit fields
INDEX idx_created_user_id (created_user_id)
INDEX idx_updated_user_id (updated_user_id)

-- Index cho timestamps
INDEX idx_created_at (created_at)
INDEX idx_updated_at (updated_at)
```

---

## Chi Tiết Các Bảng

- [users](./users.md)
- [profiles](./profiles.md)
- [roles](./roles.md)
- [permissions](./permissions.md)
- [postcategory](./postcategory.md)
- [posttag](./posttag.md)
- [posts](./posts.md)
- [Junction Tables](./junction-tables.md)

---

## Bảng So Sánh Cột Chung

| Bảng | id | created_user_id | updated_user_id | created_at | updated_at | deleted_at |
|------|----|------------------|-----------------|------------|------------|------------|
| users | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| profiles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| roles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| permissions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| postcategory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| posttag | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| posts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| user_roles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| user_permissions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| role_has_permissions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| post_postcategory | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| post_posttag | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Chú thích**:
- ✅ = Có trường này
- ❌ = Không có trường này
- Junction tables = Bảng many-to-many

---

## Quy Tắc Soft Delete

- **Có deleted_at**: 
  - users, profiles, roles, permissions (soft delete để backup/restore)
  - posts, postcategory, posttag (content có thể xóa để khôi phục sau)
- **Không có deleted_at**: 
  - junction tables (xóa tự động theo quan hệ)

---

## Foreign Key Constraints

### Cascade Rules

- **CASCADE**: Xóa user → xóa profile
- **SET NULL**: 
  - Xóa category → set null cho posts.primary_postcategory_id
  - Xóa parent role → set null cho child roles.parent_id
  - Xóa parent permission → set null cho child permissions.parent_id
- **CASCADE trên junction**: Xóa record chính → xóa entries trong junction tables

---

## Indexes Chiến Lược

### Primary Indexes

Mỗi bảng đều có:
- PRIMARY KEY on `id`

### Foreign Key Indexes

- INDEX on `parent_id` (self-referencing)
- INDEX on `created_user_id`
- INDEX on `updated_user_id`
- INDEX on `created_at`
- INDEX on `updated_at`

### Business Logic Indexes

- UNIQUE indexes trên code/slug/email
- INDEX trên status (filter thường dùng)
- INDEX trên các trường filter/search

---

## Best Practices

1. **Luôn dùng UNSIGNED BIGINT** cho ID để tăng range
2. **Timestamps**: dùng DATETIME (MySQL), không dùng TIMESTAMP
3. **Audit fields**: nullable vì có thể tạo data tự động (seed)
4. **Soft delete**: chỉ dùng cho content, không dùng cho system data
5. **Junction tables**: đơn giản nhất có thể, chỉ cần 2 foreign keys
6. **Indexes**: balance giữa query performance và write performance

---

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS-Description.ts`

Ví dụ:
- `1737000000000-CreateUsersTable.ts`
- `1737000000100-CreateProfilesTable.ts`
- `1737000001000-CreatePermissionsTable.ts`

---

## Seeding Order

Để tránh foreign key constraints, seed theo thứ tự:
1. Permissions (không phụ thuộc)
2. Roles (phụ thuộc permissions)
3. Users (phụ thuộc roles)
4. Post Categories (không phụ thuộc)
5. Post Tags (không phụ thuộc)
6. Posts (phụ thuộc categories, tags, users)

