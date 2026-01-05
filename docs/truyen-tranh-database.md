# Phân Tích Database - Hệ Thống Đọc Truyện Tranh

## Các Bảng Cần Thiết

### 1. Bảng `partners` (Đối tác/Nhóm dịch)
**Mục đích**: Quản lý đối tác, nhóm dịch, người upload truyện

**Các trường**:
- `id` - ID đối tác
- `user_id` - ID user liên kết (BIGINT, FK → users.id, unique) - User này là chủ nhóm
- `name` - Tên nhóm/đối tác (VARCHAR 255)
- `slug` - URL slug (VARCHAR 255, unique)
- `logo` - Logo nhóm (VARCHAR 500, nullable)
- `description` - Mô tả nhóm (TEXT, nullable)
- `contact_email` - Email liên hệ (VARCHAR 255, nullable)
- `contact_phone` - SĐT liên hệ (VARCHAR 20, nullable)
- `website` - Website (VARCHAR 500, nullable)
- `status` - Trạng thái: active, inactive, suspended (ENUM, default 'active')
- `comic_count` - Số truyện đã upload (INT, default 0)
- `approval_required` - Cần duyệt trước khi publish (BOOLEAN, default true)
- `created_at`, `updated_at`, `deleted_at`

**Quan hệ**:
- Một partner có một user chủ (One-to-One → users)
- Một partner có nhiều truyện (One-to-Many → comics)
- Một partner có nhiều thành viên (One-to-Many → partner_members)

**Ghi chú quan trọng**:
- **Partner owner**: `partners.user_id` tự động là owner của partner
- **Có 2 cách xử lý**:
  1. **Tự động tạo record trong partner_members** khi tạo partner (recommended)
     - Tạo record với `role = 'owner'`, `status = 'active'`
  2. **Kiểm tra trong code**: Nếu không tìm thấy trong partner_members → Kiểm tra `partners.user_id = userId`
- **Recommend**: Dùng cách 1 (tự động tạo) để đồng nhất, dễ query

---

### 2. Bảng `partner_members` (Thành viên nhóm)
**Mục đích**: Quản lý thành viên và quyền hạn trong từng nhóm dịch

**Các trường**:
- `id` - ID record
- `partner_id` - ID nhóm (BIGINT, FK → partners.id)
- `user_id` - ID thành viên (BIGINT, FK → users.id)
- `permissions` - Quyền hạn trong nhóm này (JSON array) - ví dụ: `["comic:edit", "comic:upload-chapter"]`
  - Nếu `NULL` hoặc `[]` → chỉ là member, không có quyền gì
  - Owner tự động có tất cả quyền (không cần lưu)
- `joined_at` - Thời gian tham gia (DATETIME)
- `status` - Trạng thái: active, inactive (ENUM, default 'active')
- `created_at`, `updated_at`

**Quan hệ**:
- Một record thuộc một partner (Many-to-One → partners)
- Một record thuộc một user (Many-to-One → users)

**Index**: (partner_id, user_id) unique

**📌 Phân quyền theo context (đơn giản):**

**Vấn đề:** User có thể là member của nhiều nhóm với quyền khác nhau
- User A trong Group X: có quyền `edit`, `delete`
- User A trong Group Y: chỉ có quyền `upload-chapter`

**Giải pháp đơn giản:**
1. **Lưu permissions theo partner** trong `partner_members.permissions` (JSON array)
2. **Owner tự động có tất cả quyền** (không cần lưu, check `partners.user_id`)
3. **Kiểm tra quyền trong code**:

```typescript
// Helper: Kiểm tra quyền trong partner
async function hasPartnerPermission(
  userId: number, 
  partnerId: number, 
  permission: string
): Promise<boolean> {
  // 1. Owner tự động có tất cả quyền
  const partner = await getPartner(partnerId);
  if (partner.user_id === userId) return true;
  
  // 2. Kiểm tra permissions trong partner_members
  const membership = await getPartnerMember(userId, partnerId);
  if (!membership || membership.status !== 'active') return false;
  
  const permissions = membership.permissions || [];
  return permissions.includes(permission);
}

// Kiểm tra quyền sửa truyện
async function canEditComic(userId: number, comicId: number): Promise<boolean> {
  // 1. Admin global → Full access
  const isAdmin = await rbacService.userHasRoles(userId, ['admin']);
  if (isAdmin) return true;
  
  // 2. Kiểm tra truyện
  const comic = await getComic(comicId);
  if (!comic || comic.deleted_at) return false;
  
  // 3. Truyện của admin (owner_id = NULL) → chỉ admin mới edit được
  if (!comic.owner_id) return false;
  
  // 4. Kiểm tra partner status
  const partner = await getPartner(comic.owner_id);
  if (!partner || partner.status !== 'active' || partner.deleted_at) return false;
  
  // 5. Kiểm tra quyền trong partner này
  return await hasPartnerPermission(userId, comic.owner_id, 'comic:edit');
}

// Kiểm tra quyền upload chương
async function canUploadChapter(userId: number, comicId: number): Promise<boolean> {
  // 1. Admin global
  const isAdmin = await rbacService.userHasRoles(userId, ['admin']);
  if (isAdmin) return true;
  
  // 2. Kiểm tra truyện và partner
  const comic = await getComic(comicId);
  if (!comic || !comic.owner_id || comic.deleted_at) return false;
  
  const partner = await getPartner(comic.owner_id);
  if (!partner || partner.status !== 'active' || partner.deleted_at) return false;
  
  // 3. Kiểm tra quyền trong partner này
  return await hasPartnerPermission(userId, comic.owner_id, 'comic:upload-chapter');
}
```

**Permissions có sẵn (dùng trong JSON array):**
- `comic:create` - Tạo truyện mới
- `comic:edit` - Sửa thông tin truyện
- `comic:delete` - Xóa truyện
- `comic:upload-chapter` - Upload chương mới
- `comic:edit-chapter` - Sửa chương
- `comic:delete-chapter` - Xóa chương
- `comic:manage-members` - Quản lý thành viên nhóm
- `comic:view-stats` - Xem thống kê

**Lợi ích:**
- ✅ Đơn giản: Chỉ cần JSON array, không phức tạp
- ✅ Context-based: Quyền khác nhau trong từng nhóm
- ✅ Linh hoạt: Dễ thêm/bớt permissions
- ✅ Không phá vỡ RBAC: Vẫn dùng RBAC cho admin global

---

## 📌 Xử Lý Menu Theo Context (Partner)

**Vấn đề:** Các thành viên trong partner có menu khác nhau
- Owner: Thấy menu "Quản lý thành viên", "Quản lý truyện", "Thống kê", "Upload chương"
- Member có quyền edit: Thấy menu "Upload chương", "Sửa truyện"
- Member chỉ upload: Chỉ thấy menu "Upload chương"

**Giải pháp:**

### 1. Menu có thể có context:
- **Global menu**: Dùng global RBAC permissions (như hiện tại)
- **Partner menu**: Dùng partner permissions (context-based)

### 2. Cập nhật bảng `menus`:
**Thêm trường** (hoặc dùng trường có sẵn):
- `context_type` - Loại context: `global`, `partner` (ENUM, default 'global')
  - `global` - Menu dùng global RBAC (admin, user thường)
  - `partner` - Menu dùng partner permissions (members trong nhóm)

**Hoặc đơn giản hơn:** 
- Dùng naming convention: Menu code có prefix `partner.` → tự động là partner menu
- Ví dụ: `partner.comics`, `partner.members`, `partner.stats`

### 3. Logic Get Menu (cập nhật `getUserMenus`):

```typescript
async getUserMenus(
  userId: number,
  options?: { 
    include_inactive?: boolean; 
    flatten?: boolean; 
    partner_id?: number; // Thêm param partner_id
  }
): Promise<MenuTreeItem[]> {
  
  // 1. Lấy global permissions (như hiện tại)
  const globalPermissions = await rbacService.getUserPermissions(userId);
  
  // 2. Lấy partner permissions nếu có partner_id
  let partnerPermissions = new Set<string>();
  if (options?.partner_id) {
    const partner = await getPartner(options.partner_id);
    
    // Owner có tất cả quyền
    if (partner.user_id === userId) {
      partnerPermissions = new Set([
        'comic:create', 'comic:edit', 'comic:delete',
        'comic:upload-chapter', 'comic:edit-chapter', 'comic:delete-chapter',
        'comic:manage-members', 'comic:view-stats'
      ]);
    } else {
      // Lấy permissions từ partner_members
      const membership = await getPartnerMember(userId, options.partner_id);
      if (membership && membership.status === 'active') {
        partnerPermissions = new Set(membership.permissions || []);
      }
    }
  }
  
  // 3. Lấy tất cả menus
  const menus = await this.repository.find({
    where: { status: 'active', show_in_menu: true },
    relations: ['required_permission', 'menu_permissions', 'menu_permissions.permission']
  });
  
  // 4. Filter menus
  const filteredMenus = menus.filter(menu => {
    // Menu công khai
    if (menu.is_public) return true;
    
    // Kiểm tra context type
    const isPartnerMenu = menu.code?.startsWith('partner.') || menu.context_type === 'partner';
    
    if (isPartnerMenu) {
      // Partner menu: Check partner permissions
      if (!options?.partner_id) return false; // Không có partner context → ẩn menu
      
      const permissionsToCheck = partnerPermissions;
      if (menu.required_permission?.code && permissionsToCheck.has(menu.required_permission.code)) {
        return true;
      }
      if (menu.menu_permissions?.some(mp => mp.permission?.code && permissionsToCheck.has(mp.permission.code))) {
        return true;
      }
    } else {
      // Global menu: Check global permissions (như hiện tại)
      if (menu.required_permission?.code && globalPermissions.has(menu.required_permission.code)) {
        return true;
      }
      if (menu.menu_permissions?.some(mp => mp.permission?.code && globalPermissions.has(mp.permission.code))) {
        return true;
      }
      if (!menu.required_permission_id && (!menu.menu_permissions || menu.menu_permissions.length === 0)) {
        return true;
      }
    }
    
    return false;
  });
  
  // 5. Build tree
  const tree = this.buildTree(filteredMenus);
  return options?.flatten ? this.flattenTree(tree) : tree;
}
```

### 4. API Get Menu:

```typescript
// Controller
@Get('menus')
async getUserMenus(
  @Query('partner_id') partnerId?: number,
  @Query('flatten') flatten?: string,
) {
  const userId = this.auth.id();
  
  return this.menuService.getUserMenus(userId, {
    partner_id: partnerId ? Number(partnerId) : undefined,
    flatten: flatten === 'true',
  });
}
```

**Sử dụng:**
```bash
# Menu global (admin, user thường)
GET /api/admin/user/menus

# Menu theo partner context
GET /api/admin/user/menus?partner_id=123
```

### 5. Ví dụ Menu Setup:

**Global Menu (Admin):**
```json
{
  "code": "admin.dashboard",
  "name": "Dashboard",
  "required_permission": "admin:dashboard",
  "context_type": "global"
}
```

**Partner Menu:**
```json
{
  "code": "partner.comics",
  "name": "Quản lý truyện",
  "required_permission": "comic:edit",
  "context_type": "partner"
},
{
  "code": "partner.upload",
  "name": "Upload chương",
  "required_permission": "comic:upload-chapter",
  "context_type": "partner"
},
{
  "code": "partner.members",
  "name": "Quản lý thành viên",
  "required_permission": "comic:manage-members",
  "context_type": "partner"
}
```

**Kết quả:**
- Owner (partner_id=1): Thấy tất cả partner menu
- Member có quyền `["comic:edit", "comic:upload-chapter"]`: Chỉ thấy "Quản lý truyện" và "Upload chương"
- Member chỉ có `["comic:upload-chapter"]`: Chỉ thấy "Upload chương"

---

### 3. Bảng `comics` (Truyện tranh)
**Mục đích**: Lưu thông tin truyện tranh

**Các trường**:
- `id` - ID truyện
- `name` - Tên truyện (VARCHAR 255)
- `slug` - URL slug (VARCHAR 255, unique)
- `description` - Mô tả truyện (TEXT)
- `cover_image` - Ảnh bìa (VARCHAR 500)
- `author_id` - ID tác giả (BIGINT, FK → authors.id, nullable)
- `owner_id` - ID đối tác sở hữu (BIGINT, FK → partners.id, nullable) - NULL nếu admin upload
- `status` - Trạng thái truyện: ongoing, completed, hiatus (ENUM)
- `view_count` - Số lượt xem (INT, default 0)
- `like_count` - Số lượt thích (INT, default 0)
- `follow_count` - Số lượt theo dõi (INT, default 0)
- `rating` - Đánh giá trung bình (DECIMAL 3,2, nullable)
- `rating_count` - Số lượt đánh giá (INT, default 0)
- `is_featured` - Nổi bật (BOOLEAN, default false)
- `approval_status` - Trạng thái duyệt: pending, approved, rejected (ENUM, default 'pending')
- `approved_by` - ID admin duyệt (BIGINT, FK → users.id, nullable)
- `approved_at` - Thời gian duyệt (DATETIME, nullable)
- `rejection_reason` - Lý do từ chối (TEXT, nullable)
- `admin_notes` - Ghi chú nội bộ admin (TEXT, nullable)
- `created_at`, `updated_at`, `deleted_at`

**Quan hệ**:
- Một truyện thuộc một partner (Many-to-One → partners) - NULL nếu admin upload
- Một truyện thuộc một tác giả (Many-to-One → authors)
- Một truyện có nhiều chương (One-to-Many → chapters)
- Một truyện có nhiều thể loại (Many-to-Many → genres)
- Một truyện có nhiều tag (Many-to-Many → comic_tags)

---

### 4. Bảng `genres` (Thể loại)
**Mục đích**: Thể loại truyện tranh (Hành động, Tình cảm, Hài hước...)

**Các trường**:
- `id` - ID thể loại
- `name` - Tên thể loại (VARCHAR 255)
- `slug` - URL slug (VARCHAR 255, unique)
- `description` - Mô tả (TEXT, nullable)
- `icon` - Icon thể loại (VARCHAR 255, nullable)
- `status` - Trạng thái: active, inactive (ENUM)
- `sort_order` - Thứ tự hiển thị (INT)
- `created_at`, `updated_at`, `deleted_at`

**Quan hệ**:
- Một thể loại có nhiều truyện (Many-to-Many → comics)

---

### 5. Bảng `comic_genres` (Bảng trung gian)
**Mục đích**: Liên kết truyện và thể loại

**Các trường**:
- `comic_id` - ID truyện (BIGINT)
- `genre_id` - ID thể loại (BIGINT)
- Unique constraint: (comic_id, genre_id)

---

### 6. Bảng `chapters` (Chương)
**Mục đích**: Lưu thông tin chương truyện

**Các trường**:
- `id` - ID chương
- `comic_id` - ID truyện (BIGINT, FK → comics.id)
- `chapter_number` - Số chương (DECIMAL 10,2) - hỗ trợ 1.5, 2.5...
- `name` - Tên chương (VARCHAR 255, nullable)
- `slug` - URL slug (VARCHAR 255, unique)
- `view_count` - Số lượt xem (INT, default 0)
- `page_count` - Số trang (INT, default 0)
- `is_free` - Miễn phí hay không (BOOLEAN, default true)
- `published_at` - Thời gian đăng (DATETIME, nullable)
- `approval_status` - Trạng thái duyệt: pending, approved, rejected (ENUM, default 'pending')
- `approved_by` - ID admin duyệt (BIGINT, FK → users.id, nullable)
- `approved_at` - Thời gian duyệt (DATETIME, nullable)
- `rejection_reason` - Lý do từ chối (TEXT, nullable)
- `uploaded_by` - ID người upload (BIGINT, FK → users.id) - có thể là admin hoặc partner member
- `created_at`, `updated_at`, `deleted_at`

**Quan hệ**:
- Một chương thuộc một truyện (Many-to-One → comics)
- Một chương có nhiều trang (One-to-Many → pages)
- Một chương được upload bởi một user (Many-to-One → users)

---

### 7. Bảng `pages` (Trang)
**Mục đích**: Lưu ảnh từng trang truyện

**Các trường**:
- `id` - ID trang
- `chapter_id` - ID chương (BIGINT, FK → chapters.id)
- `page_number` - Số trang (INT) - 1, 2, 3...
- `image_url` - URL ảnh trang (VARCHAR 500)
- `width` - Chiều rộng ảnh (INT, nullable)
- `height` - Chiều cao ảnh (INT, nullable)
- `file_size` - Kích thước file (BIGINT, nullable) - bytes
- `sort_order` - Thứ tự hiển thị (INT)
- `created_at`, `updated_at`

**Quan hệ**:
- Một trang thuộc một chương (Many-to-One → chapters)

**Index**: (chapter_id, page_number) unique

---

### 8. Bảng `reading_history` (Lịch sử đọc)
**Mục đích**: Theo dõi lịch sử đọc của user

**Các trường**:
- `id` - ID record
- `user_id` - ID người dùng (BIGINT, FK → users.id)
- `comic_id` - ID truyện (BIGINT, FK → comics.id)
- `chapter_id` - ID chương đang đọc (BIGINT, FK → chapters.id, nullable)
- `last_page_number` - Trang cuối đã đọc (INT, nullable)
- `read_percentage` - Phần trăm đã đọc (DECIMAL 5,2, nullable)
- `last_read_at` - Lần đọc cuối (DATETIME)
- `created_at`, `updated_at`

**Quan hệ**:
- Một record thuộc một user (Many-to-One → users)
- Một record thuộc một truyện (Many-to-One → comics)
- Một record thuộc một chương (Many-to-One → chapters)

**Index**: 
- (user_id, comic_id) unique - Mỗi user chỉ có 1 record cho mỗi truyện
- (user_id, last_read_at) - Tìm truyện đọc gần đây

---

### 9. Bảng `favorites` (Yêu thích)
**Mục đích**: Truyện yêu thích của user

**Các trường**:
- `id` - ID record
- `user_id` - ID người dùng (BIGINT, FK → users.id)
- `comic_id` - ID truyện (BIGINT, FK → comics.id)
- `created_at` - Thời gian thêm vào yêu thích

**Quan hệ**:
- Một record thuộc một user (Many-to-One → users)
- Một record thuộc một truyện (Many-to-One → comics)

**Index**: (user_id, comic_id) unique

---

### 10. Bảng `comic_comments` (Bình luận)
**Mục đích**: Bình luận truyện và chương

**Các trường**:
- `id` - ID bình luận
- `user_id` - ID người dùng (BIGINT, FK → users.id)
- `comic_id` - ID truyện (BIGINT, FK → comics.id, nullable)
- `chapter_id` - ID chương (BIGINT, FK → chapters.id, nullable)
- `parent_id` - ID bình luận cha (BIGINT, nullable) - để reply
- `content` - Nội dung bình luận (TEXT)
- `like_count` - Số lượt thích (INT, default 0)
- `status` - Trạng thái: approved, pending, rejected (ENUM)
- `created_at`, `updated_at`, `deleted_at`

**Quan hệ**:
- Một bình luận thuộc một user (Many-to-One → users)
- Một bình luận thuộc một truyện hoặc chương (Many-to-One → comics/chapters)
- Bình luận có thể có bình luận con (One-to-Many → parent_id)

---

### 11. Bảng `authors` (Tác giả/Nhóm dịch)
**Mục đích**: Thông tin tác giả, họa sĩ, nhóm dịch

**Các trường**:
- `id` - ID tác giả
- `name` - Tên (VARCHAR 255)
- `slug` - URL slug (VARCHAR 255, unique)
- `avatar` - Ảnh đại diện (VARCHAR 500, nullable)
- `bio` - Tiểu sử (TEXT, nullable)
- `type` - Loại: author, artist, translator, group (ENUM)
- `status` - Trạng thái: active, inactive (ENUM)
- `created_at`, `updated_at`, `deleted_at`

**Quan hệ**:
- Một tác giả có nhiều truyện (One-to-Many → comics.author_id)

---

### 12. Bảng `comic_ratings` (Đánh giá chi tiết)
**Mục đích**: Lưu đánh giá từng người dùng cho truyện

**Các trường**:
- `id` - ID đánh giá
- `user_id` - ID người dùng (BIGINT, FK → users.id)
- `comic_id` - ID truyện (BIGINT, FK → comics.id)
- `rating` - Số sao: 1-5 (TINYINT)
- `review` - Nhận xét chi tiết (TEXT, nullable)
- `created_at`, `updated_at`

**Quan hệ**:
- Một đánh giá thuộc một user (Many-to-One → users)
- Một đánh giá thuộc một truyện (Many-to-One → comics)

**Index**: (user_id, comic_id) unique - Mỗi user chỉ đánh giá 1 lần mỗi truyện

---

### 13. Bảng `comic_follows` (Theo dõi)
**Mục đích**: User theo dõi truyện để nhận thông báo chương mới

**Các trường**:
- `id` - ID record
- `user_id` - ID người dùng (BIGINT, FK → users.id)
- `comic_id` - ID truyện (BIGINT, FK → comics.id)
- `created_at` - Thời gian bắt đầu theo dõi

**Quan hệ**:
- Một record thuộc một user (Many-to-One → users)
- Một record thuộc một truyện (Many-to-One → comics)

**Index**: (user_id, comic_id) unique

---

### 14. Bảng `comic_tags` (Thẻ tag)
**Mục đích**: Thẻ tag cho truyện (ví dụ: #isekai, #romance, #action...)

**Các trường**:
- `id` - ID tag
- `name` - Tên tag (VARCHAR 100)
- `slug` - URL slug (VARCHAR 100, unique)
- `usage_count` - Số lần sử dụng (INT, default 0)
- `created_at`, `updated_at`, `deleted_at`

**Quan hệ**:
- Một tag có nhiều truyện (Many-to-Many → comics)

---

### 15. Bảng `comic_tag_pivot` (Bảng trung gian)
**Mục đích**: Liên kết truyện và tag

**Các trường**:
- `comic_id` - ID truyện (BIGINT)
- `tag_id` - ID tag (BIGINT)
- Unique constraint: (comic_id, tag_id)

---

### 16. Bảng `reports` (Báo cáo)
**Mục đích**: User báo cáo nội dung vi phạm

**Các trường**:
- `id` - ID báo cáo
- `user_id` - ID người báo cáo (BIGINT, FK → users.id, nullable) - có thể ẩn danh
- `comic_id` - ID truyện (BIGINT, FK → comics.id, nullable)
- `chapter_id` - ID chương (BIGINT, FK → chapters.id, nullable)
- `comment_id` - ID bình luận (BIGINT, FK → comic_comments.id, nullable)
- `type` - Loại báo cáo: spam, inappropriate, copyright, other (ENUM)
- `reason` - Lý do báo cáo (TEXT)
- `status` - Trạng thái: pending, reviewed, resolved, rejected (ENUM)
- `admin_notes` - Ghi chú của admin (TEXT, nullable)
- `resolved_by` - ID admin xử lý (BIGINT, nullable)
- `resolved_at` - Thời gian xử lý (DATETIME, nullable)
- `created_at`, `updated_at`

**Quan hệ**:
- Một báo cáo thuộc một user (Many-to-One → users)
- Một báo cáo liên quan đến truyện/chương/bình luận (Many-to-One → comics/chapters/comic_comments)

---

### 17. Bảng `comic_uploads` (Quản lý upload)
**Mục đích**: Theo dõi tiến trình upload chương/trang (Admin và Partner)

**Các trường**:
- `id` - ID upload
- `comic_id` - ID truyện (BIGINT, FK → comics.id)
- `chapter_id` - ID chương (BIGINT, FK → chapters.id, nullable) - nếu đang upload chương mới
- `upload_type` - Loại: chapter, pages (ENUM)
- `status` - Trạng thái: pending, processing, completed, failed (ENUM)
- `progress` - Tiến độ % (INT, default 0)
- `total_files` - Tổng số file (INT, default 0)
- `uploaded_files` - Số file đã upload (INT, default 0)
- `error_message` - Thông báo lỗi (TEXT, nullable)
- `created_by` - ID người upload (BIGINT, FK → users.id) - có thể là admin hoặc partner member
- `partner_id` - ID đối tác (BIGINT, FK → partners.id, nullable) - NULL nếu admin upload
- `created_at`, `updated_at`

**Quan hệ**:
- Một upload thuộc một truyện/chương (Many-to-One → comics/chapters)
- Một upload được tạo bởi một user (Many-to-One → users)
- Một upload thuộc một partner (Many-to-One → partners, nullable)

---

### 18. Bảng `activity_logs` (Nhật ký hoạt động)
**Mục đích**: Ghi log các thao tác của admin và partner

**Các trường**:
- `id` - ID log
- `user_id` - ID người thực hiện (BIGINT, FK → users.id)
- `partner_id` - ID đối tác (BIGINT, FK → partners.id, nullable) - NULL nếu admin
- `user_role` - Vai trò: admin, partner_owner, partner_member (VARCHAR 20)
- `action` - Hành động: create, update, delete, approve, reject, upload (VARCHAR 50)
- `model_type` - Loại model: Comic, Chapter, Comment, Report... (VARCHAR 50)
- `model_id` - ID record (BIGINT)
- `description` - Mô tả hành động (TEXT, nullable)
- `ip_address` - IP address (VARCHAR 45, nullable)
- `user_agent` - User agent (TEXT, nullable)
- `created_at` - Thời gian thực hiện

**Index**: (user_id, created_at), (partner_id, created_at), (model_type, model_id)

---

## Quan Hệ Giữa Các Bảng

```
users
  ├── partners (user_id) - Chủ nhóm đối tác
  ├── partner_members (user_id) - Thành viên nhóm
  ├── reading_history (user_id)
  ├── favorites (user_id)
  ├── comic_comments (user_id)
  ├── comic_ratings (user_id)
  ├── comic_follows (user_id)
  ├── reports (user_id)
  ├── chapters (uploaded_by) - Upload chương
  ├── comic_uploads (created_by) - Upload batch
  ├── activity_logs (user_id)
  └── comics (approved_by) - Admin duyệt

partners
  ├── user_id → users (chủ nhóm)
  ├── comics (owner_id) - Truyện sở hữu
  ├── partner_members (partner_id) - Thành viên
  └── comic_uploads (partner_id) - Upload của partner

comics
  ├── owner_id → partners (đối tác sở hữu, NULL nếu admin)
  ├── author_id → authors
  ├── approved_by → users (admin duyệt)
  ├── chapters (comic_id)
  ├── comic_genres (comic_id)
  ├── comic_tag_pivot (comic_id)
  ├── reading_history (comic_id)
  ├── favorites (comic_id)
  ├── comic_comments (comic_id)
  ├── comic_ratings (comic_id)
  ├── comic_follows (comic_id)
  ├── reports (comic_id)
  └── comic_uploads (comic_id)

chapters
  ├── comic_id → comics
  ├── uploaded_by → users (người upload)
  ├── approved_by → users (admin duyệt)
  ├── pages (chapter_id)
  ├── reading_history (chapter_id)
  ├── comic_comments (chapter_id)
  ├── reports (chapter_id)
  └── comic_uploads (chapter_id)

genres
  └── comic_genres (genre_id)

comic_tags
  └── comic_tag_pivot (tag_id)
```

---

## Tóm Tắt

**Tổng cộng: 20 bảng**

### Bảng đối tác (Partner):
1. `partners` - Đối tác/Nhóm dịch
2. `partner_members` - Thành viên nhóm dịch

### Bảng nội dung:
3. `comics` - Truyện tranh
4. `genres` - Thể loại
5. `comic_genres` - Liên kết truyện-thể loại
6. `comic_tags` - Thẻ tag
7. `comic_tag_pivot` - Liên kết truyện-tag
8. `chapters` - Chương
9. `pages` - Trang ảnh
10. `authors` - Tác giả

### Bảng người dùng:
11. `reading_history` - Lịch sử đọc
12. `favorites` - Yêu thích
13. `comic_follows` - Theo dõi truyện
14. `comic_comments` - Bình luận
15. `comic_ratings` - Đánh giá chi tiết
16. `reports` - Báo cáo nội dung

### Bảng quản lý:
17. `comic_uploads` - Quản lý upload (Admin & Partner)
18. `activity_logs` - Nhật ký hoạt động

### Bảng hệ thống (có sẵn):
19. `users` - Người dùng (đã có sẵn)
   - **Cần có**: Role để phân biệt admin, partner_owner, partner_member, user
   - **Có thể dùng**: Bảng `roles` và `user_roles` đã có sẵn trong hệ thống
20. `notifications` - Thông báo (đã có sẵn)

---

## Phân Quyền & Vai Trò

### 1. Admin (Quản trị viên)
**Quyền hạn:**
- ✅ Quản lý tất cả truyện, chương, trang
- ✅ Upload truyện/chương (không cần duyệt)
- ✅ Duyệt/từ chối truyện/chương của partner
- ✅ Quản lý đối tác (tạo, sửa, khóa tài khoản)
- ✅ Quản lý thể loại, tag, tác giả
- ✅ Xử lý báo cáo, duyệt bình luận
- ✅ Xem thống kê toàn hệ thống
- ✅ Quản lý users

### 2. Partner Owner (Chủ nhóm dịch)
**Quyền hạn:**
- ✅ Quản lý nhóm (thêm/xóa thành viên, phân quyền)
- ✅ Upload truyện/chương (có thể cần duyệt tùy cấu hình)
- ✅ Chỉnh sửa/xóa truyện/chương của nhóm mình
- ✅ Xem thống kê truyện của nhóm
- ✅ Quản lý trang cá nhân nhóm

### 3. Partner Member (Thành viên nhóm)
**Quyền hạn:**
- ✅ Upload chương/trang cho truyện của nhóm (tùy quyền)
- ✅ Chỉnh sửa truyện/chương (nếu được phân quyền)
- ✅ Xem thống kê truyện của nhóm

### 4. User (Người đọc)
**Quyền hạn:**
- ✅ Xem, đọc truyện
- ✅ Đánh giá, bình luận, yêu thích, theo dõi
- ✅ Báo cáo nội dung vi phạm

---

## Workflow Upload & Duyệt Nội Dung

### Workflow của Partner:
```
1. Partner upload truyện/chương
   → approval_status = 'pending'
   → uploaded_by = partner_member.user_id
   → owner_id = partner.id

2. Admin review
   → Nếu OK: approval_status = 'approved', approved_by = admin.id, published_at = now()
   → Nếu không OK: approval_status = 'rejected', rejection_reason = '...'

3. Chỉ truyện/chương approved mới hiển thị công khai
```

### Workflow của Admin:
```
1. Admin upload truyện/chương
   → approval_status = 'approved' (tự động)
   → owner_id = NULL (admin sở hữu)
   → uploaded_by = admin.id
   → published_at = now()
```

### Quy tắc Phân Quyền:

#### Quy tắc cơ bản:
- **Admin global**: Quản lý tất cả, không cần kiểm tra owner_id
- **Partner chỉ quản lý được truyện của mình** (`comics.owner_id = partner.id`)
- **Truyện admin upload**: `owner_id = NULL`, chỉ admin mới quản lý được
- **Partner member**: Chỉ upload/sửa được truyện của partner mình (dựa vào role)

#### Logic kiểm tra quyền (Context-based permissions):

```typescript
// Helper: Kiểm tra quyền trong partner (context-based)
async function hasPartnerPermission(
  userId: number, 
  partnerId: number, 
  permission: string
): Promise<boolean> {
  // 1. Owner tự động có tất cả quyền
  const partner = await getPartner(partnerId);
  if (partner.user_id === userId) return true;
  
  // 2. Kiểm tra permissions trong partner_members
  const membership = await getPartnerMember(userId, partnerId);
  if (!membership || membership.status !== 'active') return false;
  
  const permissions = membership.permissions || [];
  return permissions.includes(permission);
}

// Kiểm tra quyền sửa truyện
async function canEditComic(userId: number, comicId: number): Promise<boolean> {
  // 1. Admin global → Full access
  const isAdmin = await rbacService.userHasRoles(userId, ['admin']);
  if (isAdmin) return true;
  
  // 2. Kiểm tra truyện
  const comic = await getComic(comicId);
  if (!comic || comic.deleted_at) return false;
  
  // 3. Truyện của admin (owner_id = NULL) → chỉ admin mới edit được
  if (!comic.owner_id) return false;
  
  // 4. Kiểm tra partner status
  const partner = await getPartner(comic.owner_id);
  if (!partner || partner.status !== 'active' || partner.deleted_at) return false;
  
  // 5. Kiểm tra quyền trong partner này
  return await hasPartnerPermission(userId, comic.owner_id, 'comic:edit');
}

// Kiểm tra quyền upload chương
async function canUploadChapter(userId: number, comicId: number): Promise<boolean> {
  // 1. Admin global
  const isAdmin = await rbacService.userHasRoles(userId, ['admin']);
  if (isAdmin) return true;
  
  // 2. Kiểm tra truyện và partner
  const comic = await getComic(comicId);
  if (!comic || !comic.owner_id || comic.deleted_at) return false;
  
  const partner = await getPartner(comic.owner_id);
  if (!partner || partner.status !== 'active' || partner.deleted_at) return false;
  
  // 3. Kiểm tra quyền trong partner này
  return await hasPartnerPermission(userId, comic.owner_id, 'comic:upload-chapter');
}
```

**Ví dụ:**
```typescript
// User A là member của 2 nhóm:
// - Group X: permissions = ["comic:edit", "comic:delete", "comic:upload-chapter"]
// - Group Y: permissions = ["comic:upload-chapter"] (chỉ upload)

// User A edit truyện của Group X → ✅ (có quyền trong Group X)
// User A edit truyện của Group Y → ❌ (không có quyền trong Group Y)
// User A upload chương cho cả 2 nhóm → ✅ (có quyền trong cả 2 nhóm)
```

#### Edge Cases đơn giản:

1. **Partner Owner**:
   - Tự động coi là member (kiểm tra `partners.user_id = userId`)
   - Không cần tạo record trong `partner_members` (tùy chọn)

2. **Partner status**:
   - Kiểm tra `partners.status = 'active'` và `partners.deleted_at IS NULL`

3. **Soft delete**:
   - Kiểm tra `comics.deleted_at IS NULL`

4. **Approval workflow**:
   - Logic approval giữ nguyên, không ảnh hưởng phân quyền

#### Matrix phân quyền (dựa trên RBAC permissions):

**Permissions cần tạo trong RBAC:**
- `comic:create` - Tạo truyện
- `comic:edit` - Sửa truyện
- `comic:delete` - Xóa truyện
- `comic:upload-chapter` - Upload chương
- `comic:edit-chapter` - Sửa chương
- `comic:delete-chapter` - Xóa chương
- `comic:approve` - Duyệt truyện/chương (chỉ admin)
- `comic:manage-members` - Quản lý thành viên partner
- `comic:view-stats` - Xem thống kê

**Cách gán quyền:**
- **Admin role**: Có tất cả permissions
- **Partner users**: Gán permissions phù hợp qua roles (ví dụ: `partner_editor` role có `comic:edit`, `comic:upload-chapter`)
- **Ownership check**: Trong code, sau khi check RBAC → check ownership

| Hành động | Permission cần | Ownership check |
|-----------|---------------|-----------------|
| Tạo truyện | `comic:create` | Không cần (tự động set owner_id) |
| Sửa truyện | `comic:edit` | ✅ (chỉ được sửa truyện của partner mình) |
| Upload chương | `comic:upload-chapter` | ✅ (chỉ được upload cho truyện của partner mình) |
| Duyệt truyện | `comic:approve` | Không cần (chỉ admin) |

---

## Chức Năng Theo Vai Trò

### Chức Năng Người Dùng (User)

### Xem & Đọc:
- ✅ Xem danh sách truyện, tìm kiếm theo thể loại, tag
- ✅ Xem chi tiết truyện (thông tin, tác giả, thể loại, đánh giá)
- ✅ Đọc truyện theo chương và trang
- ✅ Tự động lưu vị trí đọc

### Tương tác:
- ✅ Đánh giá truyện (1-5 sao) và viết review
- ✅ Yêu thích truyện
- ✅ Theo dõi truyện (nhận thông báo chương mới)
- ✅ Bình luận truyện/chương, reply bình luận
- ✅ Thích bình luận
- ✅ Báo cáo nội dung vi phạm

### Quản lý cá nhân:
- ✅ Xem lịch sử đọc
- ✅ Tiếp tục đọc từ vị trí đã lưu
- ✅ Quản lý truyện yêu thích
- ✅ Quản lý truyện đang theo dõi

---

### Chức Năng Đối Tác (Partner)

#### Partner Owner:
- ✅ Tạo và quản lý nhóm dịch
- ✅ Mời/thêm thành viên vào nhóm
- ✅ Phân quyền cho thành viên (upload, edit, delete)
- ✅ Upload truyện mới (cần admin duyệt nếu `approval_required = true`)
- ✅ Upload chương/trang cho truyện của nhóm
- ✅ Chỉnh sửa thông tin truyện/chương của nhóm
- ✅ Xóa truyện/chương của nhóm (cần quyền)
- ✅ Xem thống kê truyện của nhóm (lượt xem, đánh giá)
- ✅ Quản lý trang cá nhân nhóm (logo, mô tả, thông tin liên hệ)

#### Partner Member:
- ✅ Upload chương/trang (nếu có quyền)
- ✅ Chỉnh sửa truyện/chương (nếu có quyền)
- ✅ Xem thống kê truyện của nhóm
- ✅ Xem lịch sử upload của mình

#### Workflow Upload của Partner:
1. Partner upload truyện/chương → `approval_status = 'pending'`
2. Admin xem và duyệt → `approval_status = 'approved'`, `published_at` được set
3. Nếu từ chối → `approval_status = 'rejected'`, ghi `rejection_reason`
4. Truyện/chương chỉ hiển thị khi `approval_status = 'approved'`

---

### Chức Năng Admin (Quản Trị)

#### Quản lý nội dung:
- ✅ CRUD truyện (tạo, sửa, xóa, ẩn) - không cần duyệt
- ✅ CRUD chương (tạo, sửa, xóa, sắp xếp) - không cần duyệt
- ✅ CRUD trang (upload nhiều ảnh, xóa, sắp xếp)
- ✅ Quản lý thể loại, tag, tác giả
- ✅ **Duyệt truyện/chương của partner** (approve, reject, yêu cầu chỉnh sửa)
- ✅ Upload batch nhiều trang cùng lúc (có progress tracking)
- ✅ Quản lý chất lượng ảnh (width, height, file size)
- ✅ Set truyện nổi bật (`is_featured`)

#### Quản lý đối tác:
- ✅ Tạo/từ chối tài khoản đối tác
- ✅ Duyệt/khóa tài khoản đối tác (`status: active, inactive, suspended`)
- ✅ Cấu hình yêu cầu duyệt (`approval_required`)
- ✅ Xem danh sách đối tác và số truyện của từng đối tác
- ✅ Quản lý thành viên trong nhóm đối tác

#### Quản lý người dùng & nội dung:
- ✅ Duyệt bình luận (approve, reject, xóa)
- ✅ Xử lý báo cáo (review, resolve, reject)
- ✅ Quản lý đánh giá (xem, xóa nếu spam)
- ✅ Khóa/xóa tài khoản vi phạm
- ✅ Xem nhật ký hoạt động của tất cả (admin + partner)

#### Thống kê & Báo cáo:
- ✅ Thống kê toàn hệ thống (lượt xem, người dùng, truyện)
- ✅ Thống kê theo đối tác (truyện, lượt xem, đánh giá)
- ✅ Thống kê truyện phổ biến (theo view, like, follow)
- ✅ Thống kê đánh giá (rating trung bình, số lượng review)
- ✅ Thống kê upload (tiến độ, số lượng, theo đối tác)
- ✅ Xuất báo cáo Excel/PDF

#### Hệ thống:
- ✅ Gửi thông báo chương mới cho người theo dõi
- ✅ Quản lý file storage (ảnh bìa, ảnh trang)
- ✅ Backup & Restore database
- ✅ Cấu hình hệ thống (thông báo, email...)
