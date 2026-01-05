# Junction Tables (Many-to-Many)

## user_roles

```sql
user_id                 BIGINT UNSIGNED NOT NULL
role_id                 BIGINT UNSIGNED NOT NULL
PRIMARY KEY (user_id, role_id)
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
```

## user_permissions

```sql
user_id                 BIGINT UNSIGNED NOT NULL
permission_id           BIGINT UNSIGNED NOT NULL
PRIMARY KEY (user_id, permission_id)
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
```

**⚠️ Lưu ý:** Table này vẫn tồn tại trong database nhưng **KHÔNG được sử dụng trong logic phân quyền**. Hệ thống chỉ phân quyền qua roles (bảng `user_roles`). Permissions được kế thừa từ roles của user.

## role_has_permissions

```sql
role_id                 BIGINT UNSIGNED NOT NULL
permission_id           BIGINT UNSIGNED NOT NULL
PRIMARY KEY (role_id, permission_id)
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
```

## post_postcategory

```sql
post_id                 BIGINT UNSIGNED NOT NULL
postcategory_id         BIGINT UNSIGNED NOT NULL
PRIMARY KEY (post_id, postcategory_id)
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
FOREIGN KEY (postcategory_id) REFERENCES postcategory(id) ON DELETE CASCADE
```

## post_posttag

```sql
post_id                 BIGINT UNSIGNED NOT NULL
posttag_id              BIGINT UNSIGNED NOT NULL
PRIMARY KEY (post_id, posttag_id)
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
FOREIGN KEY (posttag_id) REFERENCES posttag(id) ON DELETE CASCADE
```

## Lưu ý

Junction tables KHÔNG có audit fields (created_user_id, updated_user_id, created_at, updated_at, deleted_at)

