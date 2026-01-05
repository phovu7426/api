# Kế Hoạch Thực Hiện Website Truyện Tranh (Comics/Manga Platform)

Tài liệu mô tả kế hoạch chi tiết để xây dựng hệ thống đọc truyện tranh.

---

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Phân Tích Yêu Cầu](#phân-tích-yêu-cầu)
3. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
4. [Kế Hoạch Triển Khai](#kế-hoạch-triển-khai)
5. [Chi Tiết Từng Phase](#chi-tiết-từng-phase)
6. [Công Nghệ & Tools](#công-nghệ--tools)
7. [Rủi Ro & Giải Pháp](#rủi-ro--giải-pháp)

---

## 🎯 Tổng Quan Dự Án

### Mục Tiêu

Xây dựng một nền tảng đọc truyện tranh (comics/manga) với các tính năng:

- Quản lý truyện tranh (comics/manga)
- Đọc truyện online với UX tốt
- Cá nhân hóa (lịch sử đọc, bookmark, follow)
- Đánh giá và bình luận
- Thống kê và phân tích
- Quản trị nội dung

### Đối Tượng Sử Dụng

- **Người đọc**: Xem truyện, follow, đánh giá, bình luận
- **Admin**: Quản lý nội dung, comic_categories, users, reviews
- **Moderator**: Kiểm duyệt comments, reviews
- **Uploader/Team**: Upload chapters, quản lý chapters

---

## 📊 Phân Tích Yêu Cầu

### Functional Requirements

#### 1. Quản Lý Truyện (Comics Management)

- ✅ CRUD comics (title, description, cover, author, status)
- ✅ Upload/update cover image
- ✅ Quản lý comic_categories (many-to-many)
- ✅ SEO-friendly URLs (slug)
- ✅ Status workflow (draft → published → completed/hidden)

#### 2. Quản Lý Chương (Chapters Management)

- ✅ CRUD chapters
- ✅ Upload nhiều ảnh cho 1 chapter (chapter_pages)
- ✅ Sắp xếp chapters theo chapter_index
- ✅ Hiển thị chapter_label (1, 1.5, Extra, ...)
- ✅ Assign team/uploader cho chapter
- ✅ Status (draft → published)

#### 3. Đọc Truyện (Reading)

- ✅ Hiển thị danh sách comics
- ✅ Chi tiết comic (info, comic_categories, chapters list)
- ✅ Reader với pagination (previous/next page)
- ✅ Fullscreen mode
- ✅ Keyboard navigation (arrow keys)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Image lazy loading & optimization
- ✅ Chapter navigation (previous/next chapter)

#### 4. Cá Nhân Hóa (Personalization)

- ✅ Lịch sử đọc (reading_histories)
- ✅ Bookmark pages
- ✅ Follow/unfollow comics
- ✅ Danh sách "Đang đọc", "Đã đọc", "Yêu thích"
- ✅ Thông báo khi có chapter mới

#### 5. Đánh Giá & Bình Luận (Reviews & Comments)

- ✅ Rating (1-5 stars) với comment
- ✅ Bình luận trên comic/chapter
- ✅ Reply comments (nested comments)
- ✅ Like comments (optional - cần thêm bảng)
- ✅ Moderation (hide/delete comments)

#### 6. Thống Kê (Statistics)

- ✅ View count (comic, chapter)
- ✅ Follow count
- ✅ Rating average
- ✅ Popular comics (trending)
- ✅ Analytics dashboard (admin)

#### 7. Tìm Kiếm & Lọc (Search & Filter)

- ✅ Search comics (title, author)
- ✅ Filter by comic_categories
- ✅ Filter by status (completed, ongoing)
- ✅ Sort (newest, most viewed, highest rated, most followed)
- ✅ Pagination

### Non-Functional Requirements

- **Performance**: 
  - Page load < 2s
  - Image optimization (WebP, lazy load, CDN)
  - Database indexes đầy đủ
  - Caching cho hot data (Redis)
  
- **Scalability**:
  - Support 10K+ comics
  - Support 100K+ concurrent users
  - Horizontal scaling (multiple servers)
  
- **Security**:
  - Authentication & Authorization
  - Rate limiting (prevent spam)
  - Image upload validation
  - SQL injection prevention
  - XSS prevention
  
- **Availability**:
  - 99.9% uptime
  - Backup & recovery
  - Error monitoring & logging

---

## 🏗️ Kiến Trúc Hệ Thống

### Tech Stack (NestJS Project)

- **Backend**: NestJS (TypeScript)
- **Database**: MySQL/MariaDB (TypeORM)
- **Cache**: Redis
- **File Storage**: Local/S3/MinIO
- **Queue**: BullMQ (Redis-based)
- **Frontend**: Next.js/React (tách riêng) hoặc SSR
- **Image Processing**: Sharp
- **CDN**: CloudFront/Cloudflare (optional)

### Module Structure

```
src/modules/comics/
├── admin/
│   ├── comics/
│   │   ├── comics.controller.ts
│   │   ├── comics.service.ts
│   │   └── dto/
│   ├── chapters/
│   │   ├── chapters.controller.ts
│   │   ├── chapters.service.ts
│   │   └── dto/
│   └── comic-categories/
│       ├── comic-categories.controller.ts
│       ├── comic-categories.service.ts
│       └── dto/
├── public/
│   ├── comics/
│   ├── chapters/
│   ├── reader/
│   └── search/
├── user/
│   ├── reading-history/
│   ├── bookmarks/
│   ├── follows/
│   └── reviews/
└── comics.module.ts
```

### Database Schema

Xem chi tiết: [docs/database_schema/comics.md](./database_schema/comics.md)

---

## 🚀 Kế Hoạch Triển Khai

### Phase 1: Foundation & Core (Weeks 1-3)

**Mục tiêu**: Setup database, entities, và các module cơ bản

#### 1.1 Database Setup

- [ ] Tạo migration files cho tất cả tables
- [ ] Setup entities (extend BaseEntity)
- [ ] Setup relations (TypeORM)
- [ ] Tạo indexes
- [ ] Seed data (comic_categories, sample comics)

#### 1.2 Core Entities

- [ ] Comic entity
- [ ] ComicStats entity
- [ ] Category entity
- [ ] ComicCategory junction entity
- [ ] Chapter entity
- [ ] ChapterPage entity

#### 1.3 Base Services

- [ ] ComicsService (CRUD cơ bản)
- [ ] ComicCategoriesService (CRUD)
- [ ] ChaptersService (CRUD)
- [ ] FileUploadService (images)

**Deliverables**: 
- Database schema hoàn chỉnh
- Entities & basic CRUD APIs
- File upload working

---

### Phase 2: Admin Panel - Comics Management (Weeks 4-5)

**Mục tiêu**: Admin có thể quản lý comics, comic_categories, chapters

#### 2.1 Admin - Comics

- [ ] GET /admin/comics (list, filter, search, pagination)
- [ ] GET /admin/comics/:id
- [ ] POST /admin/comics (create)
- [ ] PUT /admin/comics/:id (update)
- [ ] DELETE /admin/comics/:id (soft delete)
- [ ] POST /admin/comics/:id/cover (upload cover)
- [ ] POST /admin/comics/:id/comic-categories (assign comic_categories)

#### 2.2 Admin - Comic Categories

- [ ] GET /admin/comic-categories
- [ ] POST /admin/comic-categories
- [ ] PUT /admin/comic-categories/:id
- [ ] DELETE /admin/comic-categories/:id

#### 2.3 Admin - Chapters

- [ ] GET /admin/comics/:comicId/chapters
- [ ] GET /admin/chapters/:id
- [ ] POST /admin/comics/:comicId/chapters (create + upload pages)
- [ ] PUT /admin/chapters/:id
- [ ] DELETE /admin/chapters/:id
- [ ] POST /admin/chapters/:id/pages (upload/update pages)
- [ ] PUT /admin/chapters/:id/reorder (update chapter_index)

#### 2.4 File Upload

- [ ] Image upload (cover, pages)
- [ ] Image validation (format, size)
- [ ] Image optimization (resize, compress)
- [ ] Storage strategy (local/S3)

**Deliverables**: 
- Admin APIs hoàn chỉnh
- File upload working
- Basic admin UI (optional)

---

### Phase 3: Public APIs - Reading (Weeks 6-8)

**Mục tiêu**: User có thể xem danh sách, chi tiết, và đọc truyện

#### 3.1 Public - Comics

- [ ] GET /public/comics (list, filter, search, sort, pagination)
- [ ] GET /public/comics/:slug (detail)
- [ ] GET /public/comics/:slug/chapters (chapters list)
- [ ] GET /public/comics/trending
- [ ] GET /public/comics/popular
- [ ] GET /public/comics/newest

#### 3.2 Public - Reader

- [ ] GET /public/chapters/:id (chapter detail + pages)
- [ ] GET /public/chapters/:id/pages (pages list)
- [ ] GET /public/chapters/:id/next (next chapter)
- [ ] GET /public/chapters/:id/prev (previous chapter)
- [ ] POST /public/chapters/:id/view (track view - async)

#### 3.3 View Tracking

- [ ] Queue job để track views
- [ ] Aggregate views → comic_stats
- [ ] Prevent duplicate views (IP + user_id + time window)

#### 3.4 Caching

- [ ] Cache hot comics
- [ ] Cache comic_categories
- [ ] Cache chapter pages (Redis)
- [ ] Cache invalidation strategy

**Deliverables**: 
- Public APIs hoàn chỉnh
- Reader API
- View tracking working
- Caching implemented

---

### Phase 4: User Features - Personalization (Weeks 9-10)

**Mục tiêu**: User có thể follow, bookmark, xem lịch sử

#### 4.1 Reading History

- [ ] GET /user/reading-history
- [ ] POST /user/reading-history (update last read)
- [ ] DELETE /user/reading-history/:comicId
- [ ] Auto-update khi user đọc chapter

#### 4.2 Bookmarks

- [ ] GET /user/bookmarks
- [ ] POST /user/bookmarks (create bookmark)
- [ ] DELETE /user/bookmarks/:id
- [ ] GET /user/bookmarks/chapter/:chapterId

#### 4.3 Follows

- [ ] GET /user/follows (comics đang follow)
- [ ] POST /user/comics/:comicId/follow
- [ ] DELETE /user/comics/:comicId/follow
- [ ] GET /user/comics/:comicId/is-following

#### 4.4 User Dashboard

- [ ] GET /user/dashboard (reading history, follows, bookmarks)
- [ ] GET /user/library (my comics)

**Deliverables**: 
- User personalization APIs
- Auto-update reading history
- Follow/unfollow working

---

### Phase 5: Reviews & Comments (Weeks 11-12)

**Mục tiêu**: User có thể đánh giá và bình luận

#### 5.1 Reviews

- [ ] GET /public/comics/:comicId/reviews (list, pagination)
- [ ] GET /user/reviews (my reviews)
- [ ] POST /user/comics/:comicId/reviews (create/update)
- [ ] DELETE /user/reviews/:id
- [ ] Sync rating → comic_stats

#### 5.2 Comments

- [ ] GET /public/comics/:comicId/comments (tree structure)
- [ ] GET /public/chapters/:chapterId/comments
- [ ] POST /user/comments (create comment/reply)
- [ ] PUT /user/comments/:id
- [ ] DELETE /user/comments/:id
- [ ] GET /user/comments (my comments)

#### 5.3 Moderation

- [ ] POST /admin/comments/:id/hide
- [ ] POST /admin/comments/:id/show
- [ ] POST /admin/reviews/:id/hide
- [ ] GET /admin/comments/pending (moderation queue)

**Deliverables**: 
- Reviews & Comments APIs
- Nested comments working
- Moderation APIs
- Rating sync working

---

### Phase 6: Notifications & Stats (Weeks 13-14)

**Mục tiêu**: Thông báo và thống kê

#### 6.1 Notifications

- [ ] GET /user/notifications (list, pagination)
- [ ] PUT /user/notifications/:id/read
- [ ] PUT /user/notifications/read-all
- [ ] POST /user/notifications/settings
- [ ] Queue job: notify new chapter (cho followers)

#### 6.2 Statistics

- [ ] GET /public/comics/:comicId/stats
- [ ] GET /admin/analytics/dashboard
- [ ] GET /admin/analytics/comics (top comics)
- [ ] GET /admin/analytics/views (views over time)
- [ ] Aggregate jobs (daily/weekly)

#### 6.3 Search & Filter Enhancement

- [ ] Full-text search (Elasticsearch optional)
- [ ] Advanced filters (rating, view count, date range)
- [ ] Search suggestions/autocomplete

**Deliverables**: 
- Notifications system
- Analytics APIs
- Enhanced search

---

### Phase 7: Optimization & Polish (Weeks 15-16)

**Mục tiêu**: Tối ưu performance, security, UX

#### 7.1 Performance

- [ ] Image optimization (WebP, lazy load)
- [ ] CDN integration
- [ ] Database query optimization
- [ ] API response caching
- [ ] Pagination optimization

#### 7.2 Security

- [ ] Rate limiting (API endpoints)
- [ ] Image upload validation (file type, size, malware scan)
- [ ] SQL injection prevention (TypeORM already safe)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF protection

#### 7.3 Testing

- [ ] Unit tests (services)
- [ ] Integration tests (APIs)
- [ ] E2E tests (critical flows)
- [ ] Load testing

#### 7.4 Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Setup guide
- [ ] Deployment guide
- [ ] Admin guide

**Deliverables**: 
- Optimized system
- Security hardened
- Tests coverage > 70%
- Documentation complete

---

## 🛠️ Công Nghệ & Tools

### Backend Stack

- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: MySQL/MariaDB
- **Cache**: Redis
- **Queue**: BullMQ
- **Validation**: class-validator, class-transformer
- **File Upload**: multer, sharp
- **Testing**: Jest

### Development Tools

- **API Docs**: Swagger/OpenAPI
- **Code Quality**: ESLint, Prettier
- **Git**: Git hooks (husky)
- **Monitoring**: Winston (logging), Sentry (error tracking)

### Infrastructure (Optional)

- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **File Storage**: AWS S3 / MinIO
- **CDN**: CloudFront / Cloudflare
- **Monitoring**: Prometheus, Grafana

---

## ⚠️ Rủi Ro & Giải Pháp

### Rủi Ro 1: Performance với Large Images

**Vấn đề**: Upload và serve nhiều ảnh lớn có thể chậm

**Giải pháp**:
- Image optimization (resize, compress với Sharp)
- CDN cho static assets
- Lazy loading ở frontend
- Progressive image loading
- WebP format

### Rủi Ro 2: Database Performance

**Vấn đề**: Query chậm với nhiều data

**Giải pháp**:
- Indexes đầy đủ (đã thiết kế)
- Query optimization (select chỉ fields cần)
- Pagination đúng cách
- Caching (Redis)
- Read replicas (nếu cần)

### Rủi Ro 3: View Count Aggregation

**Vấn đề**: Update view_count đồng thời có thể lock table

**Giải pháp**:
- Tách `comic_stats` riêng (đã thiết kế)
- Queue job để aggregate async
- Batch update (mỗi 5-10 phút)
- Redis counter + flush to DB

### Rủi Ro 4: Storage Cost

**Vấn đề**: Lưu trữ nhiều ảnh tốn storage

**Giải pháp**:
- Image compression
- S3 với lifecycle policies (move to Glacier sau 90 ngày)
- Clean up old/unused images
- CDN caching

### Rủi Ro 5: Spam/Comments Abuse

**Vấn đề**: Spam comments, fake reviews

**Giải pháp**:
- Rate limiting
- CAPTCHA (optional)
- Moderation queue
- Auto-hide suspicious content
- User reputation system (future)

---

## 📈 Metrics & Success Criteria

### Performance Metrics

- API response time < 200ms (p95)
- Page load time < 2s
- Image load time < 1s (lazy load)
- Database query time < 100ms (p95)

### Business Metrics

- Daily active users
- Comics uploaded per day
- Chapters read per day
- Average reading time
- Follow rate
- Review rate

### Quality Metrics

- Test coverage > 70%
- Error rate < 0.1%
- Uptime > 99.9%
- Security vulnerabilities: 0 critical

---

## 📝 Next Steps (Future Enhancements)

### Phase 8+: Advanced Features

- [ ] Tags system (tách với comic_categories)
- [ ] Recommendation engine (AI-based)
- [ ] Reading lists/collections
- [ ] Social features (share, discuss)
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Reader preferences (theme, font size)
- [ ] Offline reading (PWA)
- [ ] Advanced analytics (user behavior)
- [ ] Monetization (premium chapters, ads)

---

## 📚 Tài Liệu Tham Khảo

- [Database Schema](./database_schema/comics.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [BullMQ Documentation](https://docs.bullmq.io/)

---

**Ngày tạo**: 2026-01-02  
**Phiên bản**: 1.0  
**Tác giả**: Development Team

