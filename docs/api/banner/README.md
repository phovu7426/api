# Banner API Documentation

## Overview

Hệ thống Banner cho phép quản lý và hiển thị các banner/slide ở nhiều vị trí khác nhau trên website. Mỗi vị trí có thể chứa nhiều banner với thứ tự hiển thị tùy chỉnh.

## Features

- Quản lý vị trí banner (Banner Locations)
- Quản lý banner với nhiều thuộc tính năng
- Hỗ trợ hình ảnh desktop và mobile riêng biệt
- Hỗ trợ lịch trình hiển thị (start_date, end_date)
- Sắp xếp thứ tự hiển thị
- Lọc theo trạng thái và vị trí

## Banner Locations

Các vị trí banner được định nghĩa sẵn:

- `home_slider`: Slider trang chủ
- `product_page_banner`: Banner trang sản phẩm
- `product_detail_banner`: Banner chi tiết sản phẩm
- `about_us_banner`: Banner giới thiệu
- `contact_banner`: Banner liên hệ
- `blog_banner`: Banner blog
- `checkout_banner`: Banner thanh toán
- `sidebar_banner`: Banner sidebar

## API Endpoints

### Admin Banner Locations

#### GET `/api/admin/banner-locations`
Lấy danh sách vị trí banner

**Query Parameters:**
- `page` (number): Số trang (mặc định: 1)
- `limit` (number): Số lượng mỗi trang (mặc định: 10)
- `search` (string): Tìm kiếm theo tên
- `status` (string): Lọc theo trạng thái (active/inactive)

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": [
    {
      "id": 1,
      "code": "home_slider",
      "name": "Slider trang chủ",
      "description": "Slider hiển thị ở trang chủ",
      "status": "active",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 8,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "timestamp": "2023-01-01T00:00:00+07:00"
}
```

#### POST `/api/admin/banner-locations`
Tạo vị trí banner mới

**Request Body:**
```json
{
  "code": "new_location",
  "name": "Vị trí mới",
  "description": "Mô tả vị trí mới",
  "status": "active"
}
```

#### GET `/api/admin/banner-locations/:id`
Lấy thông tin chi tiết vị trí banner

#### PATCH `/api/admin/banner-locations/:id`
Cập nhật thông tin vị trí banner

#### DELETE `/api/admin/banner-locations/:id`
Xóa vị trí banner

#### PATCH `/api/admin/banner-locations/:id/status`
Thay đổi trạng thái vị trí banner

**Request Body:**
```json
{
  "status": "active"
}
```

#### GET `/api/admin/banner-locations/code/:code`
Lấy vị trí banner theo mã

### Admin Banners

#### GET `/api/admin/banners`
Lấy danh sách banner

**Query Parameters:**
- `page` (number): Số trang (mặc định: 1)
- `limit` (number): Số lượng mỗi trang (mặc định: 10)
- `search` (string): Tìm kiếm theo tiêu đề
- `status` (string): Lọc theo trạng thái (active/inactive)
- `location_id` (number): Lọc theo vị trí banner

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": [
    {
      "id": 1,
      "title": "Khuyến mãi đặc biệt",
      "subtitle": "Giảm giá đến 50%",
      "image": "/uploads/banners/home-slider-1.jpg",
      "mobile_image": "/uploads/banners/home-slider-1-mobile.jpg",
      "link": "/products?sale=true",
      "link_target": "_self",
      "description": "Khuyến mãi đặc biệt cho các sản phẩm nổi bật",
      "button_text": "Xem ngay",
      "button_color": "#ff6b6b",
      "text_color": "#ffffff",
      "location_id": 1,
      "sort_order": 1,
      "status": "active",
      "start_date": null,
      "end_date": null,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "location": {
        "id": 1,
        "code": "home_slider",
        "name": "Slider trang chủ",
        "status": "active"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 6,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "timestamp": "2023-01-01T00:00:00+07:00"
}
```

#### POST `/api/admin/banners`
Tạo banner mới

**Request Body:**
```json
{
  "title": "Banner mới",
  "subtitle": "Phụ đề banner",
  "image": "/uploads/banners/new-banner.jpg",
  "mobile_image": "/uploads/banners/new-banner-mobile.jpg",
  "link": "/products",
  "link_target": "_self",
  "description": "Mô tả chi tiết",
  "button_text": "Xem ngay",
  "button_color": "#ff6b6b",
  "text_color": "#ffffff",
  "location_id": 1,
  "sort_order": 1,
  "status": "active",
  "start_date": "2023-01-01T00:00:00.000Z",
  "end_date": "2023-12-31T23:59:59.000Z"
}
```

#### GET `/api/admin/banners/:id`
Lấy thông tin chi tiết banner

#### PATCH `/api/admin/banners/:id`
Cập nhật thông tin banner

#### DELETE `/api/admin/banners/:id`
Xóa banner

#### PATCH `/api/admin/banners/:id/status`
Thay đổi trạng thái banner

#### PATCH `/api/admin/banners/:id/sort-order`
Cập nhật thứ tự sắp xếp banner

#### GET `/api/admin/banners/location/:locationCode`
Lấy danh sách banner theo mã vị trí

### Public Banners

#### GET `/api/public/banners/location/:locationCode`
Lấy danh sách banner theo mã vị trí

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": [
    {
      "id": 1,
      "title": "Khuyến mãi đặc biệt",
      "subtitle": "Giảm giá đến 50%",
      "image": "/uploads/banners/home-slider-1.jpg",
      "mobile_image": "/uploads/banners/home-slider-1-mobile.jpg",
      "link": "/products?sale=true",
      "link_target": "_self",
      "description": "Khuyến mãi đặc biệt cho các sản phẩm nổi bật",
      "button_text": "Xem ngay",
      "button_color": "#ff6b6b",
      "text_color": "#ffffff",
      "sort_order": 1
    }
  ],
  "meta": {},
  "timestamp": "2023-01-01T00:00:00+07:00"
}
```

#### GET `/api/public/banners`
Lấy tất cả banner đang hoạt động

**Query Parameters:**
- `locationCode` (string, optional): Lọc theo mã vị trí

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "home_slider": [
      {
        "id": 1,
        "title": "Khuyến mãi đặc biệt",
        "subtitle": "Giảm giá đến 50%",
        "image": "/uploads/banners/home-slider-1.jpg",
        "mobile_image": "/uploads/banners/home-slider-1-mobile.jpg",
        "link": "/products?sale=true",
        "link_target": "_self",
        "description": "Khuyến mãi đặc biệt cho các sản phẩm nổi bật",
        "button_text": "Xem ngay",
        "button_color": "#ff6b6b",
        "text_color": "#ffffff",
        "sort_order": 1
      }
    ],
    "product_page_banner": [
      {
        "id": 4,
        "title": "Flash Sale",
        "subtitle": "Giảm giá sốc",
        "image": "/uploads/banners/product-page-1.jpg",
        "mobile_image": "/uploads/banners/product-page-1-mobile.jpg",
        "link": "/products?flash=true",
        "link_target": "_self",
        "description": "Flash sale hàng tuần với giá cực sốc",
        "button_text": "Săn sale",
        "button_color": "#e74c3c",
        "text_color": "#ffffff",
        "sort_order": 1
      }
    ]
  },
  "meta": {},
  "timestamp": "2023-01-01T00:00:00+07:00"
}
```

#### GET `/api/public/banners/:id`
Lấy thông tin chi tiết banner

## Data Models

### BannerLocation

```typescript
interface BannerLocation {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_user_id?: number;
  updated_user_id?: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

### Banner

```typescript
interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  mobile_image?: string;
  link?: string;
  link_target: '_self' | '_blank';
  description?: string;
  button_text?: string;
  button_color?: string;
  text_color?: string;
  location_id: number;
  sort_order: number;
  status: 'active' | 'inactive';
  start_date?: Date;
  end_date?: Date;
  created_user_id?: number;
  updated_user_id?: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  location?: BannerLocation;
}
```

## Usage Examples

### Frontend Integration

#### React Example

```jsx
import { useState, useEffect } from 'react';

function BannerSlider({ locationCode }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetch(`/api/public/banners/location/${locationCode}`)
      .then(res => res.json())
      .then(data => setBanners(data));
  }, [locationCode]);

  return (
    <div className="banner-slider">
      {banners.map(banner => (
        <div key={banner.id} className="banner-slide">
          <img 
            src={banner.image} 
            alt={banner.title}
            className="banner-image"
          />
          <div className="banner-content">
            <h2>{banner.title}</h2>
            {banner.subtitle && <p>{banner.subtitle}</p>}
            {banner.button_text && (
              <a 
                href={banner.link}
                target={banner.link_target}
                style={{ 
                  backgroundColor: banner.button_color,
                  color: banner.text_color 
                }}
              >
                {banner.button_text}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Usage
<BannerSlider locationCode="home_slider" />
```

#### Vue Example

```vue
<template>
  <div class="banner-slider">
    <div 
      v-for="banner in banners" 
      :key="banner.id" 
      class="banner-slide"
    >
      <img 
        :src="banner.image" 
        :alt="banner.title"
        class="banner-image"
      />
      <div class="banner-content">
        <h2>{{ banner.title }}</h2>
        <p v-if="banner.subtitle">{{ banner.subtitle }}</p>
        <a 
          v-if="banner.button_text"
          :href="banner.link"
          :target="banner.link_target"
          :style="{ 
            backgroundColor: banner.button_color,
            color: banner.text_color 
          }"
        >
          {{ banner.button_text }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  props: {
    locationCode: String
  },
  setup(props) {
    const banners = ref([]);

    onMounted(async () => {
      const response = await fetch(`/api/public/banners/location/${props.locationCode}`);
      banners.value = await response.json();
    });

    return { banners };
  }
};
</script>
```

## Notes

- Các banner chỉ hiển thị khi có trạng thái `active` và trong khoảng thời gian hợp lệ
- Hình ảnh mobile sẽ được ưu tiên trên các thiết bị di động
- Thứ tự sắp xếp càng nhỏ càng được hiển thị trước
- Khi `link_target` là `_blank`, link sẽ mở trong tab mới
- Các trường màu sắc hỗ trợ mã hex (#ff6b6b) hoặc tên màu (red)