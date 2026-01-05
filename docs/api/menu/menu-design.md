# Thiết kế chức năng Menu (admin)

## Mục tiêu
- FE nhận được danh sách menu đã được lọc theo quyền của user, kèm metadata để render (name, path, icon, children).
- Cho phép admin quản lý menu (CRUD) mà không phải sửa code FE.
- Tái sử dụng hệ thống RBAC hiện có (roles/permissions).

## Bảng dữ liệu đề xuất

### `menus`
```sql
id                  BIGINT UNSIGNED PK AI
code                VARCHAR(120) NOT NULL UNIQUE   -- slug/menu key
name                VARCHAR(150) NOT NULL
path                VARCHAR(255) NULL              -- route nội bộ
api_path            VARCHAR(255) NULL              -- API chính của menu (dùng gợi ý permission)
icon                VARCHAR(120) NULL              -- class/icon name, FE tự map emoji nếu muốn
type                ENUM('route','group','link') DEFAULT 'route'
status              ENUM('active','inactive') DEFAULT 'active'
parent_id           BIGINT UNSIGNED NULL           -- để build tree
sort_order          INT DEFAULT 0
is_public           TINYINT(1) DEFAULT 0           -- menu không cần đăng nhập
show_in_menu        TINYINT(1) DEFAULT 1           -- cho phép ẩn nhưng vẫn giữ route
required_permission_id BIGINT UNSIGNED NULL        -- FK -> permissions.id
created_user_id     BIGINT UNSIGNED NULL
updated_user_id     BIGINT UNSIGNED NULL
created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at          DATETIME NULL                  -- soft delete
```

Index gợi ý:
- `UNIQUE(code)`
- `INDEX(parent_id)`
- `INDEX(required_permission_id)`
- `INDEX(status, show_in_menu)`

### `menu_permissions` (tùy chọn)
Trong trường hợp một menu cần nhiều quyền (OR logic), tạo bảng phụ:
```sql
id                  BIGINT UNSIGNED PK AI
menu_id             BIGINT UNSIGNED NOT NULL       -- FK -> menus.id
permission_id       BIGINT UNSIGNED NOT NULL       -- FK -> permissions.id
```
Nếu chỉ cần 1 quyền chính, có thể bỏ bảng này và dùng `required_permission_id`.

## Mapping quyền
- FE chỉ ẩn/hiện menu; backend vẫn phải guard route/API như hiện tại.
- Mỗi menu nên gắn 1 permission code chính (ví dụ `product.manage`). Với menu nhiều hành động, có thể dùng permission cấp module (manage) để đơn giản.
- Nếu dùng `menu_permissions`, BE trả về `allowed` dựa trên tập quyền của user (`hasAny`).

## API đề xuất

### Cho admin cấu hình menu
- `GET /admin/menus` — list (có filter `status`, `parent_id`, `q`)
- `GET /admin/menus/:id` — chi tiết
- `POST /admin/menus` — tạo
- `PUT /admin/menus/:id` — cập nhật
- `DELETE /admin/menus/:id` — soft delete
- `GET /admin/menus/tree` — trả về tree đầy đủ (chưa filter theo quyền)

Payload tạo/cập nhật (suggest):
```json
{
  "code": "admin.products",
  "name": "Quản lý sản phẩm",
  "path": "/admin/products",
  "api_path": "api/admin/products",
  "icon": "ph-package",
  "type": "route",
  "status": "active",
  "parent_id": null,
  "sort_order": 10,
  "is_public": false,
  "show_in_menu": true,
  "required_permission_id": 15
}
```

### Cho FE sử dụng (admin portal)
- `GET /api/admin/user/menus` — trả tree menu đã lọc theo quyền hiện tại của admin.
  - Query options: `include_inactive=false`, `flatten=false`
  - Trả về chỉ các node `status=active`, `show_in_menu=1`, và user có quyền (hoặc `is_public=1`).

Response gợi ý:
```json
[
  {
    "code": "admin",
    "name": "Dashboard",
    "path": "/admin",
    "icon": "chart",
    "status": "active",
    "children": [],
    "allowed": true
  },
  {
    "code": "admin.products",
    "name": "Quản lý sản phẩm",
    "path": "/admin/products",
    "icon": "box",
    "status": "active",
    "children": [
      {
        "code": "admin.products.list",
        "name": "Sản phẩm",
        "path": "/admin/products",
        "allowed": true
      }
    ]
  }
]
```

## Luồng xử lý `/api/admin/user/menus`
1) Lấy danh sách permission codes của user (từ roles hiện có).  
2) Query `menus` status=active, show_in_menu=1.  
3) Nếu `is_public=1` => luôn giữ.  
4) Nếu có `menu_permissions` => giữ nếu user có bất kỳ permission trong danh sách.  
   Nếu chỉ có `required_permission_id` => giữ nếu user có permission đó.  
5) Build tree theo `parent_id`, sort theo `sort_order`.  
6) Trả về cho FE, không cần trả permission chi tiết.

## Seed gợi ý
- Map các menu hiện tại (đoạn FE cung cấp) vào bảng `menus` với `code` theo pattern `admin.<module>` và `required_permission` tương ứng:
  - `admin.dashboard` → `dashboard.read`
  - `admin.users` → `user.manage`
  - `admin.roles` → `role.manage`
  - `admin.permissions` → `permission.manage`
  - `admin.products` / `admin.product-variants` / `admin.product-categories` / `admin.product-attributes` / `admin.product-attribute-values` → `product.manage`
  - `admin.posts` / `admin.post-categories` / `admin.post-tags` → `post.manage`
  - `admin.orders` → `order.manage`
  - `admin.payment-methods` / `admin.shipping-methods` → `payment_method.manage` / `shipping_method.manage`
  - `admin.coupons` → `coupon.manage`
  - `admin.warehouses` / `admin.warehouses.inventory` / `admin.warehouses.transfers` → `warehouse.manage`
  - `admin.contacts` → `contact.manage`
  - `admin.system-configs` group → `system_config.manage`

## Lưu ý bảo mật & mở rộng
- FE chỉ dùng để hiển thị, mọi API vẫn cần guard bằng permission decorator/guard sẵn có.
- Nên cache ngắn hạn `/me/menus` (per session) và xóa khi logout hoặc khi cập nhật role/permission.
- Hỗ trợ `type=group` để tạo header không click.
- Có thể thêm `feature_flag` hoặc `env` field nếu cần ẩn menu theo môi trường/flag trong tương lai.

