# permissions

**Mục đích**: Quyền hạn trong hệ thống

## Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
code                    VARCHAR(120) NOT NULL UNIQUE
name                    VARCHAR(150) NULL
status                  VARCHAR(30) DEFAULT 'active'
parent_id               BIGINT UNSIGNED NULL
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

## Relations

- many-to-one → permissions (self-referencing, parent-child)
- many-to-many → roles (via role_has_permissions)
- many-to-many → users (via user_permissions) ⚠️ **Không được sử dụng** - phân quyền chỉ qua roles

## Foreign Keys

- parent_id → permissions.id (SET NULL)

## Lưu ý

Có `deleted_at` để hỗ trợ soft delete

