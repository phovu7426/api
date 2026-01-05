# posts

**Mục đích**: Bài viết

## Columns

```sql
id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name                    VARCHAR(255) NOT NULL
slug                    VARCHAR(255) NOT NULL UNIQUE
excerpt                 TEXT NULL
content                 LONGTEXT NOT NULL
image                   VARCHAR(255) NULL
cover_image             VARCHAR(255) NULL
primary_postcategory_id BIGINT UNSIGNED NULL
status                  ENUM('draft', 'scheduled', 'published', 'archived') DEFAULT 'draft'
is_featured             BOOLEAN DEFAULT FALSE
is_pinned               BOOLEAN DEFAULT FALSE
published_at            DATETIME NULL
view_count              BIGINT UNSIGNED DEFAULT 0
meta_title              VARCHAR(255) NULL
meta_description        TEXT NULL
canonical_url           VARCHAR(255) NULL
og_title                VARCHAR(255) NULL
og_description          TEXT NULL
og_image                VARCHAR(255) NULL
created_user_id         BIGINT UNSIGNED NULL
updated_user_id         BIGINT UNSIGNED NULL
created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at              DATETIME NULL
```

## Relations

- many-to-one → postcategory (primary category)
- many-to-many → postcategories (via post_postcategory)
- many-to-many → posttags (via post_posttag)

## Foreign Keys

- primary_postcategory_id → postcategory.id (SET NULL)

