# users

**Mục đích**: Lưu thông tin người dùng

## Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
username                VARCHAR(50) NULL UNIQUE
email                   VARCHAR(255) NULL UNIQUE
phone                   VARCHAR(20) NULL UNIQUE
password                VARCHAR(255) NULL
status                  VARCHAR(255) DEFAULT 'active'
email_verified_at       DATETIME NULL
phone_verified_at       DATETIME NULL
last_login_at           DATETIME NULL
remember_token          VARCHAR(100) NULL
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

## Relations

- many-to-many → roles (via user_roles)
- many-to-many → permissions (via user_permissions) ⚠️ **Không được sử dụng** - phân quyền chỉ qua roles
- one-to-one → profiles

## Lưu ý

Có `deleted_at` để hỗ trợ soft delete

