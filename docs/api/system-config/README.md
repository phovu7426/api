# System Configuration API

API quản lý cấu hình hệ thống (System Configuration) bao gồm cấu hình chung và cấu hình email.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: 
  - Admin API: JWT Bearer Token (bắt buộc)
  - Public API: Không cần authentication
- Headers: `Content-Type: application/json`

---

## Mục lục

1. [Cấu hình chung (General Config)](#1-cấu-hình-chung-general-config)
   - [1.1. Admin - Lấy cấu hình chung](#11-admin---lấy-cấu-hình-chung)
   - [1.2. Admin - Cập nhật cấu hình chung](#12-admin---cập-nhật-cấu-hình-chung)
   - [1.3. Public - Lấy cấu hình chung (có cache)](#13-public---lấy-cấu-hình-chung-có-cache)
2. [Cấu hình Email](#2-cấu-hình-email)
   - [2.1. Admin - Lấy cấu hình email](#21-admin---lấy-cấu-hình-email)
   - [2.2. Admin - Cập nhật cấu hình email](#22-admin---cập-nhật-cấu-hình-email)

---

## 1. Cấu hình chung (General Config)

### 1.1. Admin - Lấy cấu hình chung

Lấy thông tin cấu hình chung của hệ thống (dành cho admin).

#### Request

```bash
curl -X GET "http://localhost:3000/api/admin/system-config/general" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

#### Response

**Status Code:** `200 OK`

```json
{
  "id": 1,
  "site_name": "Shop Online - Mua Sắm Trực Tuyến",
  "site_description": "Shop Online - Cửa hàng mua sắm trực tuyến uy tín, đa dạng sản phẩm, giá tốt, giao hàng nhanh.",
  "site_logo": "https://example.com/logo.png",
  "site_favicon": "https://example.com/favicon.ico",
  "site_email": "contact@shoponline.com",
  "site_phone": "19001234",
  "site_address": "123 Đường ABC, Quận XYZ, TP.HCM",
  "site_copyright": "© 2024 Shop Online. All rights reserved.",
  "timezone": "Asia/Ho_Chi_Minh",
  "locale": "vi",
  "currency": "VND",
  "contact_channels": [
    {
      "type": "hotline",
      "value": "19001234",
      "label": "Hotline Tư Vấn",
      "icon": "/icons/phone.png",
      "url_template": "tel:{value}",
      "enabled": true,
      "sort_order": 1
    },
    {
      "type": "zalo",
      "value": "0123456789",
      "label": "Chat Zalo",
      "icon": "/icons/zalo.png",
      "url_template": "https://zalo.me/{value}",
      "enabled": true,
      "sort_order": 2
    }
  ],
  "meta_title": "Shop Online - Mua Sắm Trực Tuyến | Giá Tốt, Giao Hàng Nhanh",
  "meta_keywords": "mua sắm online, shop online, bán hàng trực tuyến, thương mại điện tử",
  "og_title": "Shop Online - Mua Sắm Trực Tuyến | Giá Tốt, Giao Hàng Nhanh",
  "og_description": "Shop Online - Cửa hàng mua sắm trực tuyến uy tín với hàng ngàn sản phẩm đa dạng.",
  "og_image": "https://example.com/og-image.jpg",
  "canonical_url": "https://shoponline.com",
  "google_analytics_id": "G-XXXXXXXXXX",
  "google_search_console": "abc123xyz...",
  "facebook_pixel_id": "1234567890123456",
  "twitter_site": "shoponline",
  "created_user_id": 1,
  "updated_user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "deleted_at": null
}
```

#### Response Fields - Chi tiết từng trường

##### A. Thông tin cơ bản (Hiển thị trên UI)

| Field | Type | Required | Mô tả | Gán vào đâu | Ghi chú |
|-------|------|----------|-------|-------------|---------|
| `site_name` | string | ✅ | Tên website | `<title>`, Header, Footer | Hiển thị ở header/footer |
| `site_description` | string \| null | ❌ | Mô tả website | `<meta name="description">` | Dùng cho SEO meta description |
| `site_logo` | string \| null | ❌ | URL logo website | `<img src="">` trong Header | Hiển thị ở header |
| `site_favicon` | string \| null | ❌ | URL favicon | `<link rel="icon">` | Dùng cho browser tab icon |
| `site_email` | string \| null | ❌ | Email liên hệ | Footer, Contact page | Hiển thị ở footer/contact |
| `site_phone` | string \| null | ❌ | Số điện thoại | Footer, Contact page | Hiển thị ở footer/contact |
| `site_address` | string \| null | ❌ | Địa chỉ | Footer, Contact page | Hiển thị ở footer |
| `site_copyright` | string \| null | ❌ | Copyright text | Footer | Hiển thị ở footer |

##### B. Cấu hình hệ thống (Có thể cần hiển thị)

| Field | Type | Required | Mô tả | Gán vào đâu | Ghi chú |
|-------|------|----------|-------|-------------|---------|
| `timezone` | string | ✅ | Múi giờ | Backend xử lý | Mặc định: `Asia/Ho_Chi_Minh` |
| `locale` | string | ✅ | Ngôn ngữ | Backend xử lý | Mặc định: `vi` |
| `currency` | string | ✅ | Đơn vị tiền tệ | Hiển thị giá sản phẩm | Mặc định: `VND` |

##### C. Kênh liên hệ (Hiển thị trên UI)

| Field | Type | Required | Mô tả | Gán vào đâu | Ghi chú |
|-------|------|----------|-------|-------------|---------|
| `contact_channels` | array \| null | ❌ | Danh sách kênh liên hệ | Footer, Sidebar, Floating button | Xem chi tiết bên dưới |

**Contact Channels Structure:**

| Field | Type | Required | Mô tả | Ví dụ |
|-------|------|----------|-------|-------|
| `type` | string | ✅ | Loại kênh liên hệ | `"zalo"`, `"messenger"`, `"hotline"`, `"telegram"`, `"whatsapp"` |
| `value` | string | ✅ | Giá trị (số điện thoại, username, ID...) | `"0123456789"`, `"123456789"` |
| `label` | string | ❌ | Tên hiển thị (nếu không có sẽ dùng type) | `"Chat Zalo"`, `"Hotline"` |
| `icon` | string | ❌ | URL icon/ảnh | `"/icons/zalo.png"`, `"https://example.com/icon.png"` |
| `url_template` | string | ❌ | Template URL, `{value}` sẽ được thay bằng `value` | `"https://zalo.me/{value}"`, `"tel:{value}"` |
| `enabled` | boolean | ✅ | Bật/tắt hiển thị | `true`, `false` |
| `sort_order` | number | ❌ | Thứ tự hiển thị (số nhỏ hơn sẽ hiển thị trước) | `1`, `2`, `3` |

##### D. SEO Meta Tags (Gán vào `<head>`)

| Field | Type | Required | Mô tả | Gán vào đâu | HTML Tag |
|-------|------|----------|-------|-------------|----------|
| `meta_title` | string \| null | ❌ | SEO title cho trang chủ | `<title>` | `<title>{meta_title}</title>` |
| `meta_keywords` | string \| null | ❌ | SEO keywords | `<meta name="keywords">` | `<meta name="keywords" content="{meta_keywords}">` |
| `og_title` | string \| null | ❌ | Open Graph title | `<meta property="og:title">` | `<meta property="og:title" content="{og_title}">` |
| `og_description` | string \| null | ❌ | Open Graph description | `<meta property="og:description">` | `<meta property="og:description" content="{og_description}">` |
| `og_image` | string \| null | ❌ | Open Graph image | `<meta property="og:image">` | `<meta property="og:image" content="{og_image}">` |
| `canonical_url` | string \| null | ❌ | Canonical URL | `<link rel="canonical">` | `<link rel="canonical" href="{canonical_url}">` |

##### E. Tracking & Analytics Scripts (Gán vào `<head>` hoặc trước `</body>`)

| Field | Type | Required | Mô tả | Gán vào đâu | Cách sử dụng |
|-------|------|----------|-------|-------------|-------------|
| `google_analytics_id` | string \| null | ❌ | Google Analytics ID (GA4) | `<head>` | Load Google Analytics script |
| `google_search_console` | string \| null | ❌ | Google Search Console verification code | `<head>` | `<meta name="google-site-verification" content="{google_search_console}">` |
| `facebook_pixel_id` | string \| null | ❌ | Facebook Pixel ID | `<head>` | Load Facebook Pixel script |
| `twitter_site` | string \| null | ❌ | Twitter site handle | `<head>` | `<meta name="twitter:site" content="@{twitter_site}">` |

##### F. Trường API tự sinh (KHÔNG cần hiển thị trong UI)

| Field | Type | Mô tả | Ghi chú |
|-------|------|-------|---------|
| `id` | number | ID của config | Tự sinh từ database |
| `created_user_id` | number \| null | User ID tạo | Tự sinh từ API (lấy từ JWT token) |
| `updated_user_id` | number \| null | User ID cập nhật | Tự sinh từ API (lấy từ JWT token) |
| `created_at` | string (ISO 8601) | Thời gian tạo | Tự sinh từ database |
| `updated_at` | string (ISO 8601) | Thời gian cập nhật | Tự sinh từ database |
| `deleted_at` | string \| null | Thời gian xóa | Tự sinh từ database (soft delete) |

---

### 1.2. Admin - Cập nhật cấu hình chung

Cập nhật thông tin cấu hình chung của hệ thống.

#### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/system-config/general" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_name": "Shop Online - Mua Sắm Trực Tuyến",
    "site_description": "Mô tả website mới",
    "site_logo": "https://example.com/logo.png",
    "site_favicon": "https://example.com/favicon.ico",
    "site_email": "contact@shoponline.com",
    "site_phone": "19001234",
    "site_address": "123 Đường ABC, Quận XYZ, TP.HCM",
    "site_copyright": "© 2024 Shop Online. All rights reserved.",
    "timezone": "Asia/Ho_Chi_Minh",
    "locale": "vi",
    "currency": "VND",
    "meta_title": "Shop Online - Mua Sắm Trực Tuyến | Giá Tốt, Giao Hàng Nhanh",
    "meta_keywords": "mua sắm online, shop online, bán hàng trực tuyến",
    "og_title": "Shop Online - Mua Sắm Trực Tuyến",
    "og_description": "Mô tả Open Graph",
    "og_image": "https://example.com/og-image.jpg",
    "canonical_url": "https://shoponline.com",
    "google_analytics_id": "G-XXXXXXXXXX",
    "google_search_console": "abc123xyz...",
    "facebook_pixel_id": "1234567890123456",
    "twitter_site": "shoponline",
    "contact_channels": [
      {
        "type": "hotline",
        "value": "19001234",
        "label": "Hotline Tư Vấn",
        "icon": "/icons/phone.png",
        "url_template": "tel:{value}",
        "enabled": true,
        "sort_order": 1
      }
    ]
  }'
```

#### Request Body

Tất cả các trường đều là **optional** (không bắt buộc). Chỉ gửi các trường cần cập nhật.

```json
{
  "site_name": "string (max 255 chars)",
  "site_description": "string (text, không giới hạn)",
  "site_logo": "string (max 500 chars, URL)",
  "site_favicon": "string (max 500 chars, URL)",
  "site_email": "string (max 255 chars, email format)",
  "site_phone": "string (max 20 chars)",
  "site_address": "string (text, không giới hạn)",
  "site_copyright": "string (max 255 chars)",
  "timezone": "string (max 50 chars)",
  "locale": "string (max 10 chars)",
  "currency": "string (max 10 chars)",
  "meta_title": "string (max 255 chars)",
  "meta_keywords": "string (text, không giới hạn)",
  "og_title": "string (max 255 chars)",
  "og_description": "string (text, không giới hạn)",
  "og_image": "string (max 500 chars, URL)",
  "canonical_url": "string (max 500 chars, URL)",
  "google_analytics_id": "string (max 50 chars)",
  "google_search_console": "string (max 255 chars)",
  "facebook_pixel_id": "string (max 50 chars)",
  "twitter_site": "string (max 50 chars, không có @)",
  "contact_channels": "array of objects (optional)"
}
```

#### Validation Rules

| Field | Rules |
|-------|-------|
| `site_name` | String, max 255 characters |
| `site_description` | String, không giới hạn |
| `site_logo` | String, max 500 characters, nên là URL hợp lệ |
| `site_favicon` | String, max 500 characters, nên là URL hợp lệ |
| `site_email` | Email format, max 255 characters |
| `site_phone` | String, max 20 characters |
| `site_address` | String, không giới hạn |
| `site_copyright` | String, max 255 characters |
| `timezone` | String, max 50 characters (ví dụ: `Asia/Ho_Chi_Minh`, `UTC`) |
| `locale` | String, max 10 characters (ví dụ: `vi`, `en`, `ja`) |
| `currency` | String, max 10 characters (ví dụ: `VND`, `USD`, `EUR`) |
| `meta_title` | String, max 255 characters |
| `meta_keywords` | String, không giới hạn |
| `og_title` | String, max 255 characters |
| `og_description` | String, không giới hạn |
| `og_image` | String, max 500 characters, nên là URL hợp lệ |
| `canonical_url` | String, max 500 characters, nên là URL hợp lệ |
| `google_analytics_id` | String, max 50 characters (ví dụ: `G-XXXXXXXXXX`) |
| `google_search_console` | String, max 255 characters |
| `facebook_pixel_id` | String, max 50 characters (ví dụ: `1234567890123456`) |
| `twitter_site` | String, max 50 characters, không có dấu @ (ví dụ: `shoponline` thay vì `@shoponline`) |
| `contact_channels` | Array of objects, optional. Mỗi object phải có `type`, `value`, `enabled` (required), và các trường khác optional. |

#### Response

**Status Code:** `200 OK`

Response giống như [1.1. Admin - Lấy cấu hình chung](#11-admin---lấy-cấu-hình-chung)

**Lưu ý:**
- Sau khi cập nhật thành công, cache của Public API sẽ tự động bị xóa.
- Lần request tiếp theo từ Public API sẽ lấy dữ liệu mới.

---

### 1.3. Public - Lấy cấu hình chung (có cache)

Lấy thông tin cấu hình chung của hệ thống (dành cho public, có cache 1 giờ).

**⚠️ Lưu ý:** API này có cache 1 giờ, nên dùng cho frontend public để tối ưu hiệu năng.

#### Request

```bash
curl -X GET "http://localhost:3000/api/public/system-config/general" \
  -H "Content-Type: application/json"
```

**Không cần authentication token.**

#### Response

**Status Code:** `200 OK`

Response giống như [1.1. Admin - Lấy cấu hình chung](#11-admin---lấy-cấu-hình-chung)

#### Cache Behavior

- **Cache TTL:** 1 giờ (3600 giây)
- **Cache Key:** `public:general-config`
- **Cache Invalidation:** Tự động xóa khi admin cập nhật config
- **Fallback:** Nếu chưa có config trong DB, trả về config mặc định

**Lưu ý cho Frontend:**
- API này được cache, nên có thể gọi thường xuyên mà không lo về performance.
- Dữ liệu có thể không cập nhật ngay lập tức sau khi admin thay đổi (tối đa 1 giờ).
- Nếu cần dữ liệu real-time, có thể dùng Admin API (nhưng cần authentication).

---

## 2. Cấu hình Email

### 2.1. Admin - Lấy cấu hình email

Lấy thông tin cấu hình email SMTP của hệ thống.

#### Request

```bash
curl -X GET "http://localhost:3000/api/admin/system-config/email" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

#### Response

**Status Code:** `200 OK`

```json
{
  "id": 1,
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_secure": true,
  "smtp_username": "your-email@gmail.com",
  "smtp_password": "******",
  "from_email": "noreply@example.com",
  "from_name": "My Website",
  "reply_to_email": "contact@example.com",
  "created_user_id": 1,
  "updated_user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "deleted_at": null
}
```

#### Response Fields

| Field | Type | Required | Mô tả | Hiển thị UI | Ghi chú |
|-------|------|----------|-------|-------------|---------|
| `id` | number | ✅ | ID của config | ❌ Không cần | Tự sinh từ API |
| `smtp_host` | string | ✅ | SMTP server host | ✅ **Cần hiển thị** | Ví dụ: `smtp.gmail.com` |
| `smtp_port` | number | ✅ | SMTP port | ✅ **Cần hiển thị** | Mặc định: `587` |
| `smtp_secure` | boolean | ✅ | SSL/TLS | ✅ **Cần hiển thị** | `true` = SSL/TLS, `false` = không |
| `smtp_username` | string | ✅ | SMTP username | ✅ **Cần hiển thị** | Email hoặc username |
| `smtp_password` | string | ✅ | SMTP password | ✅ **Cần hiển thị** | Luôn trả về `******` (masked) |
| `from_email` | string | ✅ | Email gửi đi | ✅ **Cần hiển thị** | Email sẽ hiển thị là người gửi |
| `from_name` | string | ✅ | Tên người gửi | ✅ **Cần hiển thị** | Tên hiển thị trong email |
| `reply_to_email` | string \| null | ❌ | Email reply to | ✅ **Cần hiển thị** | Email nhận reply |
| `created_user_id` | number \| null | ❌ | User ID tạo | ❌ Không cần | Tự sinh từ API |
| `updated_user_id` | number \| null | ❌ | User ID cập nhật | ❌ Không cần | Tự sinh từ API |
| `created_at` | string (ISO 8601) | ✅ | Thời gian tạo | ❌ Không cần | Tự sinh từ API |
| `updated_at` | string (ISO 8601) | ✅ | Thời gian cập nhật | ❌ Không cần | Tự sinh từ API |
| `deleted_at` | string \| null | ❌ | Thời gian xóa | ❌ Không cần | Tự sinh từ API |

**Lưu ý cho Frontend:**
- Trường `smtp_password` luôn trả về `******` (masked) để bảo mật.
- Khi update, nếu không gửi `smtp_password` hoặc gửi rỗng, password cũ sẽ được giữ nguyên.
- Các trường `id`, `created_user_id`, `updated_user_id`, `created_at`, `updated_at`, `deleted_at` là các trường audit, không cần hiển thị trong form.

---

### 2.2. Admin - Cập nhật cấu hình email

Cập nhật thông tin cấu hình email SMTP của hệ thống.

#### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/system-config/email" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_secure": true,
    "smtp_username": "your-email@gmail.com",
    "smtp_password": "your-password",
    "from_email": "noreply@example.com",
    "from_name": "My Website",
    "reply_to_email": "contact@example.com"
  }'
```

#### Request Body

Tất cả các trường đều là **optional** (không bắt buộc). Chỉ gửi các trường cần cập nhật.

```json
{
  "smtp_host": "string (max 255 chars)",
  "smtp_port": "number (1-65535)",
  "smtp_secure": "boolean (true/false)",
  "smtp_username": "string (max 255 chars)",
  "smtp_password": "string (min 6, max 500 chars, chỉ gửi khi muốn đổi password)",
  "from_email": "string (max 255 chars, email format)",
  "from_name": "string (max 255 chars)",
  "reply_to_email": "string (max 255 chars, email format, optional)"
}
```

#### Validation Rules

| Field | Rules |
|-------|-------|
| `smtp_host` | String, max 255 characters, required nếu tạo mới |
| `smtp_port` | Number, từ 1 đến 65535, mặc định: `587` |
| `smtp_secure` | Boolean, `true` = SSL/TLS, `false` = không, mặc định: `true` |
| `smtp_username` | String, max 255 characters, required nếu tạo mới |
| `smtp_password` | String, min 6 characters, max 500 characters. **Chỉ gửi khi muốn đổi password mới.** Nếu không gửi, password cũ sẽ được giữ nguyên. |
| `from_email` | Email format, max 255 characters, required nếu tạo mới |
| `from_name` | String, max 255 characters, required nếu tạo mới |
| `reply_to_email` | Email format, max 255 characters, optional |

#### Response

**Status Code:** `200 OK`

Response giống như [2.1. Admin - Lấy cấu hình email](#21-admin---lấy-cấu-hình-email)

**Lưu ý:**
- Password sẽ được hash (bcrypt) trước khi lưu vào database.
- Nếu không gửi `smtp_password` trong request, password hiện tại sẽ được giữ nguyên.
- Nếu gửi `smtp_password` rỗng hoặc không hợp lệ (dưới 6 ký tự), sẽ báo lỗi validation.

---

## Hướng dẫn sử dụng trong Frontend

### 1. Lấy cấu hình từ API

```typescript
// Sử dụng Public API (có cache, không cần auth)
async function getGeneralConfig() {
  const response = await fetch('http://localhost:3000/api/public/system-config/general');
  const config = await response.json();
  return config;
}
```

### 2. Gán vào HTML - Thông tin cơ bản

```html
<!-- Trong <head> -->
<title>{config.meta_title || config.site_name}</title>
<meta name="description" content="{config.site_description || ''}" />
<link rel="icon" href="{config.site_favicon || '/default-favicon.ico'}" />

<!-- Trong Header -->
<img src="{config.site_logo}" alt="{config.site_name}" />
<h1>{config.site_name}</h1>

<!-- Trong Footer -->
<p>{config.site_address}</p>
<p>Email: {config.site_email}</p>
<p>Phone: {config.site_phone}</p>
<p>{config.site_copyright}</p>
```

### 3. Gán vào HTML - SEO Meta Tags

```html
<!-- Trong <head> -->
<title>{config.meta_title || config.site_name}</title>
<meta name="description" content="{config.site_description || ''}" />
{config.meta_keywords && (
  <meta name="keywords" content="{config.meta_keywords}" />
)}
{config.canonical_url && (
  <link rel="canonical" href="{config.canonical_url}" />
)}

<!-- Open Graph Tags -->
<meta property="og:type" content="website" />
<meta property="og:title" content="{config.og_title || config.meta_title || config.site_name}" />
<meta property="og:description" content="{config.og_description || config.site_description || ''}" />
{config.og_image && (
  <meta property="og:image" content="{config.og_image}" />
)}
{config.canonical_url && (
  <meta property="og:url" content="{config.canonical_url}" />
)}
```

### 4. Gán vào HTML - Tracking Scripts

```html
<!-- Google Analytics (GA4) -->
{config.google_analytics_id && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`}></script>
    <script dangerouslySetInnerHTML={{
      __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.google_analytics_id}');
      `
    }} />
  </>
)}

<!-- Google Search Console -->
{config.google_search_console && (
  <meta name="google-site-verification" content={config.google_search_console} />
)}

<!-- Facebook Pixel -->
{config.facebook_pixel_id && (
  <script dangerouslySetInnerHTML={{
    __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${config.facebook_pixel_id}');
      fbq('track', 'PageView');
    `
  }} />
)}

<!-- Twitter Card -->
{config.twitter_site && (
  <>
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content={`@${config.twitter_site}`} />
    <meta name="twitter:creator" content={`@${config.twitter_site}`} />
  </>
)}
```

### 5. Hiển thị Contact Channels

```typescript
function ContactChannels({ channels }: { channels: ContactChannel[] }) {
  // Lọc chỉ các channel enabled và sắp xếp
  const enabledChannels = channels
    .filter(ch => ch.enabled)
    .sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));

  const handleClick = (channel: ContactChannel) => {
    let url: string;
    
    if (channel.url_template) {
      // Thay {value} bằng value thực tế
      url = channel.url_template.replace('{value}', channel.value);
    } else {
      // Fallback URL theo type
      const urlMap: Record<string, string> = {
        'hotline': `tel:${channel.value}`,
        'zalo': `https://zalo.me/${channel.value}`,
        'messenger': `https://m.me/${channel.value}`,
        'telegram': `https://t.me/${channel.value}`,
        'whatsapp': `https://wa.me/${channel.value}`,
      };
      url = urlMap[channel.type] || '#';
    }
    
    window.open(url, '_blank');
  };

  return (
    <div className="contact-channels">
      {enabledChannels.map((channel, index) => (
        <button
          key={index}
          onClick={() => handleClick(channel)}
          title={channel.label || channel.type}
        >
          {channel.icon && (
            <img src={channel.icon} alt={channel.label || channel.type} />
          )}
          <span>{channel.label || channel.type}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## Tóm tắt các trường cần hiển thị trong UI

### General Config Form (Admin)

**Các trường cần hiển thị:**
- ✅ `site_name` - Input text
- ✅ `site_description` - Textarea
- ✅ `site_logo` - Input text (URL) hoặc file upload
- ✅ `site_favicon` - Input text (URL) hoặc file upload
- ✅ `site_email` - Input email
- ✅ `site_phone` - Input text
- ✅ `site_address` - Textarea
- ✅ `site_copyright` - Input text
- ✅ `meta_title` - Input text (SEO section)
- ✅ `meta_keywords` - Textarea (SEO section)
- ✅ `og_title` - Input text (SEO section)
- ✅ `og_description` - Textarea (SEO section)
- ✅ `og_image` - Input text (URL) hoặc file upload (SEO section)
- ✅ `canonical_url` - Input text (URL) (SEO section)
- ✅ `google_analytics_id` - Input text (Tracking section)
- ✅ `google_search_console` - Input text (Tracking section)
- ✅ `facebook_pixel_id` - Input text (Tracking section)
- ✅ `twitter_site` - Input text (Tracking section)
- ✅ `contact_channels` - Dynamic form/list
- ⚠️ `timezone` - Select dropdown (nếu có chức năng đa múi giờ)
- ⚠️ `locale` - Select dropdown (nếu có chức năng đa ngôn ngữ)
- ⚠️ `currency` - Select dropdown (nếu có chức năng đa tiền tệ)

**Các trường KHÔNG cần hiển thị (API tự sinh):**
- ❌ `id`
- ❌ `created_user_id`
- ❌ `updated_user_id`
- ❌ `created_at`
- ❌ `updated_at`
- ❌ `deleted_at`

---

## Error Responses

### 400 Bad Request

Khi validation fail:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "property": "site_email",
      "constraints": {
        "isEmail": "site_email must be an email"
      }
    }
  ]
}
```

### 401 Unauthorized

Khi thiếu hoặc token không hợp lệ (chỉ áp dụng cho Admin API):

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

Khi có lỗi server:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Lưu ý quan trọng

1. **Cache:** Public API có cache 1 giờ, nên dữ liệu có thể không cập nhật ngay sau khi admin thay đổi.
2. **Password:** Trường `smtp_password` luôn trả về `******` khi get. Chỉ gửi password mới khi muốn đổi.
3. **Validation:** Tất cả các trường đều có validation, cần kiểm tra kỹ trước khi gửi request.
4. **Optional Fields:** Tất cả các trường trong request body đều là optional, chỉ gửi các trường cần cập nhật.
5. **Contact Channels:** 
   - Khi gửi `contact_channels`, toàn bộ mảng sẽ được thay thế (không merge). 
   - Nếu muốn xóa tất cả channels, gửi `"contact_channels": []` hoặc `"contact_channels": null`.
   - Chỉ các channel có `enabled: true` mới được hiển thị trên frontend.
   - Frontend nên sắp xếp theo `sort_order` (số nhỏ hơn hiển thị trước).
6. **SEO Fields:**
   - Tất cả các trường SEO đều optional, có thể để null.
   - Nếu không có `meta_title`, dùng `site_name` làm fallback.
   - Nếu không có `og_title`, dùng `meta_title` hoặc `site_name` làm fallback.
   - Nếu không có `og_description`, dùng `site_description` làm fallback.
7. **Tracking Scripts:**
   - Tất cả các trường tracking đều optional.
   - Chỉ load script khi có giá trị (không null).
   - `twitter_site` không cần dấu @ khi lưu (ví dụ: `shoponline` thay vì `@shoponline`).
