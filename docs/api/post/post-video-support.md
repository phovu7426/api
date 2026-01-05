# Hỗ trợ Video cho Bài viết

Module Post hiện đã hỗ trợ nhiều loại bài viết, bao gồm **Video**, **Text**, **Image**, và **Audio**.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Các loại bài viết](#các-loại-bài-viết)
- [API Endpoints](#api-endpoints)
- [Ví dụ sử dụng](#ví-dụ-sử-dụng)
- [Upload Video](#upload-video)
- [Lưu ý quan trọng](#lưu-ý-quan-trọng)

---

## 🎯 Tổng quan

Hệ thống hỗ trợ 4 loại bài viết:

- **TEXT** (`text`): Bài viết văn bản thông thường (mặc định)
- **VIDEO** (`video`): Bài viết dạng video
- **IMAGE** (`image`): Bài viết dạng hình ảnh (gallery)
- **AUDIO** (`audio`): Bài viết dạng âm thanh

Mỗi loại bài viết có thể có các trường media tương ứng:
- `video_url`: URL của video (cho loại VIDEO)
- `audio_url`: URL của audio (cho loại AUDIO)
- `image`: Hình ảnh đại diện (cho tất cả loại)
- `cover_image`: Hình ảnh bìa (cho tất cả loại)

---

## 📝 Các loại bài viết

### Lấy danh sách loại bài viết

```http
GET /api/enums/post_type
```

**Response:**
```json
[
  {
    "id": "text",
    "value": "text",
    "name": "Văn bản",
    "label": "Văn bản"
  },
  {
    "id": "video",
    "value": "video",
    "name": "Video",
    "label": "Video"
  },
  {
    "id": "image",
    "value": "image",
    "name": "Hình ảnh",
    "label": "Hình ảnh"
  },
  {
    "id": "audio",
    "value": "audio",
    "name": "Âm thanh",
    "label": "Âm thanh"
  }
]
```

---

## 🔌 API Endpoints

### Tạo bài viết video

```http
POST /api/admin/posts
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Video hướng dẫn sử dụng sản phẩm",
  "slug": "video-huong-dan-su-dung-san-pham",
  "excerpt": "Video hướng dẫn chi tiết cách sử dụng sản phẩm",
  "content": "<p>Mô tả chi tiết về video...</p>",
  "post_type": "video",
  "video_url": "https://example.com/videos/tutorial.mp4",
  "cover_image": "https://example.com/images/video-thumbnail.jpg",
  "status": "published",
  "primary_postcategory_id": 1,
  "tag_ids": [1, 2],
  "category_ids": [1]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Video hướng dẫn sử dụng sản phẩm",
  "slug": "video-huong-dan-su-dung-san-pham",
  "post_type": "video",
  "video_url": "https://example.com/videos/tutorial.mp4",
  "cover_image": "https://example.com/images/video-thumbnail.jpg",
  "status": "published",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Cập nhật bài viết video

```http
PUT /api/admin/posts/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "video_url": "https://example.com/videos/updated-tutorial.mp4",
  "post_type": "video"
}
```

### Tạo bài viết text (mặc định)

```json
{
  "name": "Bài viết thông thường",
  "content": "<p>Nội dung bài viết...</p>",
  "post_type": "text"  // Có thể bỏ qua vì mặc định là "text"
}
```

### Tạo bài viết audio

```json
{
  "name": "Podcast về công nghệ",
  "content": "<p>Mô tả podcast...</p>",
  "post_type": "audio",
  "audio_url": "https://example.com/audio/podcast.mp3"
}
```

---

## 📤 Upload Video

### Bước 1: Upload video file

Sử dụng module File Upload để upload video:

```http
POST /api/upload/file
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File video (mp4, webm, mov, etc.)

**Response:**
```json
{
  "path": "path/to/video.mp4",
  "url": "https://your-domain.com/uploads/1234567890-abc123.mp4",
  "filename": "1234567890-abc123.mp4",
  "size": 10485760,
  "mimetype": "video/mp4"
}
```

### Bước 2: Tạo bài viết với video URL

Sử dụng `url` từ response ở bước 1 để tạo bài viết:

```json
{
  "name": "Video mới",
  "post_type": "video",
  "video_url": "https://your-domain.com/uploads/1234567890-abc123.mp4",
  "content": "<p>Mô tả video...</p>"
}
```

---

## 💡 Ví dụ sử dụng

### Ví dụ 1: Tạo bài viết video từ YouTube

```json
{
  "name": "Video YouTube",
  "post_type": "video",
  "video_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "content": "<p>Video từ YouTube</p>"
}
```

### Ví dụ 2: Tạo bài viết video từ Vimeo

```json
{
  "name": "Video Vimeo",
  "post_type": "video",
  "video_url": "https://vimeo.com/VIDEO_ID",
  "content": "<p>Video từ Vimeo</p>"
}
```

### Ví dụ 3: Tạo bài viết video với video tự host

```json
{
  "name": "Video tự host",
  "post_type": "video",
  "video_url": "https://cdn.example.com/videos/my-video.mp4",
  "cover_image": "https://cdn.example.com/images/thumbnail.jpg",
  "content": "<p>Video được lưu trữ trên CDN</p>"
}
```

### Ví dụ 4: Lọc bài viết theo loại

```http
GET /api/admin/posts?filters[post_type]=video
```

**Response:** Danh sách tất cả bài viết video

---

## ⚠️ Lưu ý quan trọng

### 1. Validation

- Khi `post_type` là `video`, nên có `video_url` (không bắt buộc nhưng khuyến nghị)
- Khi `post_type` là `audio`, nên có `audio_url` (không bắt buộc nhưng khuyến nghị)
- `post_type` mặc định là `text` nếu không được chỉ định

### 2. Video URL

- Hỗ trợ các định dạng URL:
  - URL trực tiếp đến file video (`.mp4`, `.webm`, `.mov`, etc.)
  - URL YouTube (sẽ được embed)
  - URL Vimeo (sẽ được embed)
  - URL từ CDN hoặc storage service

### 3. Kích thước file

- Khi upload video qua `/api/upload/file`, kiểm tra giới hạn kích thước file trong config
- Mặc định: 10MB (có thể cấu hình trong `.env`)

### 4. Frontend Integration

Khi hiển thị bài viết video ở frontend:

```typescript
// Kiểm tra loại bài viết
if (post.post_type === 'video' && post.video_url) {
  // Hiển thị video player
  // Có thể sử dụng thư viện như react-player, video.js, etc.
}

// Ví dụ với react-player
import ReactPlayer from 'react-player';

{post.post_type === 'video' && (
  <ReactPlayer
    url={post.video_url}
    controls
    width="100%"
    height="auto"
  />
)}
```

### 5. Database Migration

Đảm bảo đã chạy migration để thêm các trường mới:

```bash
npm run migration:run
```

Migration: `1743000000000-AddPostTypeAndVideoSupport`

---

## 🔄 Migration

Nếu bạn đang nâng cấp từ phiên bản cũ, cần chạy migration:

```bash
npm run migration:run
```

Migration sẽ thêm:
- Cột `post_type` (enum: text, video, image, audio)
- Cột `video_url` (varchar 500)
- Cột `audio_url` (varchar 500)
- Index cho `post_type`

---

## 📚 Tài liệu liên quan

- [File Upload API](./file-upload.md)
- [Post API Documentation](./post-create-api-detail.md)
- [Post Frontend Integration](./post-fe-integration.md)

