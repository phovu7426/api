-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `username` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `password` VARCHAR(191) NULL,
    `status` ENUM('active', 'pending', 'inactive') NOT NULL DEFAULT 'active',
    `email_verified_at` DATETIME(0) NULL,
    `phone_verified_at` DATETIME(0) NULL,
    `last_login_at` DATETIME(0) NULL,
    `remember_token` VARCHAR(100) NULL,

    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NULL,
    `image` VARCHAR(255) NULL,
    `birthday` DATE NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `address` TEXT NULL,
    `about` TEXT NULL,

    UNIQUE INDEX `profiles_user_id_key`(`user_id`),
    INDEX `UQ_profiles_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(150) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `parent_id` BIGINT UNSIGNED NULL,

    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `roles_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `code` VARCHAR(120) NOT NULL,
    `scope` VARCHAR(30) NOT NULL DEFAULT 'context',
    `name` VARCHAR(150) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `parent_id` BIGINT UNSIGNED NULL,

    INDEX `permissions_scope_idx`(`scope`),
    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `permissions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,

    INDEX `role_permissions_role_id_idx`(`role_id`),
    INDEX `role_permissions_permission_id_idx`(`permission_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `role_permissions_role_id_permission_id_key`(`role_id`, `permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_contexts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `context_id` BIGINT UNSIGNED NOT NULL,

    INDEX `role_contexts_role_id_idx`(`role_id`),
    INDEX `role_contexts_context_id_idx`(`context_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `role_contexts_role_id_context_id_key`(`role_id`, `context_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contexts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `type` VARCHAR(50) NOT NULL,
    `ref_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',

    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `contexts_type_ref_id_key`(`type`, `ref_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `type` VARCHAR(50) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `owner_id` BIGINT UNSIGNED NULL,
    `context_id` BIGINT UNSIGNED NOT NULL,
    `metadata` JSON NULL,

    INDEX `idx_deleted_at`(`deleted_at`),
    INDEX `IDX_groups_context_id`(`context_id`),
    UNIQUE INDEX `groups_type_code_key`(`type`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_groups` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `joined_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_groups_user_id_idx`(`user_id`),
    INDEX `user_groups_group_id_idx`(`group_id`),
    PRIMARY KEY (`user_id`, `group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role_assignments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_role_assignments_user_id_group_id_idx`(`user_id`, `group_id`),
    INDEX `user_role_assignments_group_id_idx`(`group_id`),
    INDEX `user_role_assignments_role_id_idx`(`role_id`),
    UNIQUE INDEX `user_role_assignments_user_id_role_id_group_id_key`(`user_id`, `role_id`, `group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postcategory` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `image` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(255) NULL,
    `og_image` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `idx_name`(`name`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_parent_id`(`parent_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_sort_order`(`sort_order`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_status_sort_order`(`status`, `sort_order`),
    INDEX `idx_parent_status`(`parent_id`, `status`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posttag` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(255) NULL,

    INDEX `idx_name`(`name`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_status`(`status`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_status_created_at`(`status`, `created_at`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_postcategory` (
    `post_id` BIGINT UNSIGNED NOT NULL,
    `postcategory_id` BIGINT UNSIGNED NOT NULL,

    INDEX `post_postcategory_post_id_idx`(`post_id`),
    INDEX `post_postcategory_postcategory_id_idx`(`postcategory_id`),
    PRIMARY KEY (`post_id`, `postcategory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_posttag` (
    `post_id` BIGINT UNSIGNED NOT NULL,
    `posttag_id` BIGINT UNSIGNED NOT NULL,

    INDEX `post_posttag_post_id_idx`(`post_id`),
    INDEX `post_posttag_posttag_id_idx`(`posttag_id`),
    PRIMARY KEY (`post_id`, `posttag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `image` VARCHAR(255) NULL,
    `cover_image` VARCHAR(255) NULL,
    `primary_postcategory_id` BIGINT UNSIGNED NULL,
    `status` ENUM('draft', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `post_type` ENUM('text', 'video', 'image', 'audio') NOT NULL DEFAULT 'text',
    `video_url` VARCHAR(500) NULL,
    `audio_url` VARCHAR(500) NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(0) NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(255) NULL,
    `og_title` VARCHAR(255) NULL,
    `og_description` TEXT NULL,
    `og_image` VARCHAR(255) NULL,
    `group_id` BIGINT UNSIGNED NULL,

    INDEX `idx_name`(`name`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_primary_postcategory_id`(`primary_postcategory_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_post_type`(`post_type`),
    INDEX `idx_is_featured`(`is_featured`),
    INDEX `idx_is_pinned`(`is_pinned`),
    INDEX `idx_published_at`(`published_at`),
    INDEX `idx_view_count`(`view_count`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_status_published_at`(`status`, `published_at`),
    INDEX `idx_is_featured_status`(`is_featured`, `status`),
    INDEX `idx_primary_category_status`(`primary_postcategory_id`, `status`),
    INDEX `idx_posts_group_id`(`group_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menus` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `code` VARCHAR(120) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `path` VARCHAR(255) NULL,
    `api_path` VARCHAR(255) NULL,
    `icon` VARCHAR(191) NULL,
    `type` ENUM('route', 'group', 'link') NOT NULL DEFAULT 'route',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `parent_id` BIGINT UNSIGNED NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `show_in_menu` BOOLEAN NOT NULL DEFAULT true,
    `required_permission_id` BIGINT UNSIGNED NULL,

    INDEX `menus_parent_id_idx`(`parent_id`),
    INDEX `menus_required_permission_id_idx`(`required_permission_id`),
    INDEX `menus_status_show_in_menu_idx`(`status`, `show_in_menu`),
    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `menus_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `menu_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,

    INDEX `menu_permissions_menu_id_idx`(`menu_id`),
    INDEX `menu_permissions_permission_id_idx`(`permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` ENUM('info', 'success', 'warning', 'error', 'order_status', 'payment_status', 'promotion') NOT NULL DEFAULT 'info',
    `data` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',

    INDEX `idx_notifications_user_id`(`user_id`),
    INDEX `idx_notifications_status`(`status`),
    INDEX `idx_notifications_type`(`type`),
    INDEX `idx_notifications_read`(`is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `subject` VARCHAR(255) NULL,
    `message` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'read', 'replied', 'closed') NOT NULL DEFAULT 'pending',
    `reply` TEXT NULL,
    `replied_at` DATETIME(0) NULL,
    `replied_by` BIGINT UNSIGNED NULL,

    INDEX `idx_contacts_email`(`email`),
    INDEX `idx_contacts_status`(`status`),
    INDEX `idx_contacts_created_at`(`created_at`),
    INDEX `idx_contacts_deleted_at`(`deleted_at`),
    INDEX `idx_contacts_status_created`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `general_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `site_name` VARCHAR(255) NOT NULL,
    `site_description` TEXT NULL,
    `site_logo` VARCHAR(500) NULL,
    `site_favicon` VARCHAR(500) NULL,
    `site_email` VARCHAR(255) NULL,
    `site_phone` VARCHAR(20) NULL,
    `site_address` TEXT NULL,
    `site_copyright` VARCHAR(255) NULL,
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    `locale` VARCHAR(10) NOT NULL DEFAULT 'vi',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `contact_channels` JSON NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_keywords` TEXT NULL,
    `og_title` VARCHAR(255) NULL,
    `og_description` TEXT NULL,
    `og_image` VARCHAR(500) NULL,
    `canonical_url` VARCHAR(500) NULL,
    `google_analytics_id` VARCHAR(50) NULL,
    `google_search_console` VARCHAR(255) NULL,
    `facebook_pixel_id` VARCHAR(50) NULL,
    `twitter_site` VARCHAR(50) NULL,

    INDEX `idx_general_configs_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `smtp_host` VARCHAR(255) NOT NULL,
    `smtp_port` INTEGER NOT NULL DEFAULT 587,
    `smtp_secure` BOOLEAN NOT NULL DEFAULT true,
    `smtp_username` VARCHAR(255) NOT NULL,
    `smtp_password` VARCHAR(500) NOT NULL,
    `from_email` VARCHAR(255) NOT NULL,
    `from_name` VARCHAR(255) NOT NULL,
    `reply_to_email` VARCHAR(255) NULL,

    INDEX `idx_email_configs_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banner_locations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',

    UNIQUE INDEX `banner_locations_code_key`(`code`),
    INDEX `idx_banner_locations_status`(`status`),
    INDEX `idx_banner_locations_deleted_at`(`deleted_at`),
    UNIQUE INDEX `idx_banner_locations_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banners` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `image` VARCHAR(500) NOT NULL,
    `mobile_image` VARCHAR(500) NULL,
    `link` VARCHAR(500) NULL,
    `link_target` ENUM('self', 'blank') NOT NULL DEFAULT 'self',
    `description` TEXT NULL,
    `button_text` VARCHAR(100) NULL,
    `button_color` VARCHAR(20) NULL,
    `text_color` VARCHAR(20) NULL,
    `location_id` BIGINT UNSIGNED NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `start_date` DATETIME(0) NULL,
    `end_date` DATETIME(0) NULL,

    INDEX `idx_banners_title`(`title`),
    INDEX `idx_banners_location_id`(`location_id`),
    INDEX `idx_banners_status`(`status`),
    INDEX `idx_banners_sort_order`(`sort_order`),
    INDEX `idx_banners_start_date`(`start_date`),
    INDEX `idx_banners_end_date`(`end_date`),
    INDEX `idx_banners_status_sort`(`status`, `sort_order`),
    INDEX `idx_banners_location_status`(`location_id`, `status`),
    INDEX `idx_banners_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `permissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_contexts` ADD CONSTRAINT `role_contexts_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_contexts` ADD CONSTRAINT `role_contexts_context_id_fkey` FOREIGN KEY (`context_id`) REFERENCES `contexts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_context_id_fkey` FOREIGN KEY (`context_id`) REFERENCES `contexts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_groups` ADD CONSTRAINT `user_groups_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_groups` ADD CONSTRAINT `user_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role_assignments` ADD CONSTRAINT `user_role_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role_assignments` ADD CONSTRAINT `user_role_assignments_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role_assignments` ADD CONSTRAINT `user_role_assignments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postcategory` ADD CONSTRAINT `postcategory_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `postcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_postcategory` ADD CONSTRAINT `post_postcategory_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_postcategory` ADD CONSTRAINT `post_postcategory_postcategory_id_fkey` FOREIGN KEY (`postcategory_id`) REFERENCES `postcategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_posttag` ADD CONSTRAINT `post_posttag_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_posttag` ADD CONSTRAINT `post_posttag_posttag_id_fkey` FOREIGN KEY (`posttag_id`) REFERENCES `posttag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_primary_postcategory_id_fkey` FOREIGN KEY (`primary_postcategory_id`) REFERENCES `postcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `menus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_required_permission_id_fkey` FOREIGN KEY (`required_permission_id`) REFERENCES `permissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_permissions` ADD CONSTRAINT `menu_permissions_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_permissions` ADD CONSTRAINT `menu_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_created_user_id_fkey` FOREIGN KEY (`created_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_updated_user_id_fkey` FOREIGN KEY (`updated_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `banners` ADD CONSTRAINT `banners_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `banner_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
