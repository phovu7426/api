# posttag

**Mục đích**: Thẻ bài viết

## Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name                    VARCHAR(255) NOT NULL
slug                    VARCHAR(255) NOT NULL UNIQUE
description             TEXT NULL
status                  ENUM('active', 'inactive') DEFAULT 'active'
meta_title              VARCHAR(255) NULL
meta_description        TEXT NULL
canonical_url           VARCHAR(255) NULL
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

## Relations

- many-to-many → posts (via post_posttag)

