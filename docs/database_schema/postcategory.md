# postcategory

**Mục đích**: Danh mục bài viết

## Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name                    VARCHAR(255) NOT NULL
slug                    VARCHAR(255) NOT NULL UNIQUE
description             TEXT NULL
parent_id               BIGINT UNSIGNED NULL
image                   VARCHAR(255) NULL
status                  ENUM('active', 'inactive') DEFAULT 'active'
meta_title              VARCHAR(255) NULL
meta_description        TEXT NULL
canonical_url           VARCHAR(255) NULL
og_image                VARCHAR(255) NULL
sort_order              INT DEFAULT 0
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

## Relations

- many-to-one → postcategory (self-referencing, parent-child)
- many-to-many → posts (via post_postcategory)

## Foreign Keys

- parent_id → postcategory.id (SET NULL)

