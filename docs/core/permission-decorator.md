# Sử dụng @Permission Decorator

Decorator `@Permission()` được sử dụng để kiểm tra quyền của user một cách đơn giản và trực quan.

## Import

```typescript
import { Permission } from '../../common/decorators/rbac.decorators';
```

## Cách sử dụng

### 1. Kiểm tra một permission

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { Permission } from '../../common/decorators/rbac.decorators';

@Controller('posts')
export class PostController {
  @Permission('post.create')
  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    // Chỉ user có permission 'post.create' mới có thể truy cập
    return this.postService.create(dto);
  }
}
```

### 2. Kiểm tra nhiều permissions (OR logic)

Khi truyền nhiều permissions, user chỉ cần có **MỘT trong số** các permissions đó:

```typescript
@Permission('post.update', 'post.delete')
@Put(':id')
async updateOrDelete(@Param('id') id: number, @Body() dto: any) {
  // User có permission 'post.update' HOẶC 'post.delete' đều có thể truy cập
  return this.postService.update(id, dto);
}
```

### 3. Kết hợp với các decorator khác

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { Permission, Public } from '../../common/decorators/rbac.decorators';

@Controller('posts')
export class PostController {
  // Route public - explicit (có thể dùng @Public() hoặc @Permission('public'))
  @Permission('public')
  @Get('public')
  async getPublicPosts() {
    return this.postService.getPublicPosts();
  }

  // Route mặc định là protected (yêu cầu xác thực)
  @Get()
  async getAll() {
    return this.postService.findAll();
  }

  // Route cần permission cụ thể
  @Permission('post.create')
  @Post()
  async create(@Body() dto: CreatePostDto) {
    return this.postService.create(dto);
  }

  @Permission('post.update')
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, dto);
  }

  @Permission('post.delete')
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.postService.delete(id);
  }
}
```

### 4. Sử dụng ở Controller level

Bạn có thể đặt `@Permission()` ở controller level để áp dụng cho tất cả các routes:

```typescript
@Permission('admin') // Tất cả routes trong controller này đều cần permission 'admin'
@Controller('admin/users')
export class AdminUserController {
  @Get()
  async list() {
    // Cần permission 'admin'
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    // Cần permission 'admin'
  }
}
```

### 5. Override ở route level

Route-level decorator sẽ override controller-level decorator:

```typescript
@Permission('admin')
@Controller('admin/users')
export class AdminUserController {
  @Get()
  async list() {
    // Cần permission 'admin'
  }

  @Permission('user.read') // Override - route này chỉ cần 'user.read'
  @Get('public')
  async getPublic() {
    // Chỉ cần permission 'user.read'
  }
}
```

## Cách hoạt động

1. **Guard tự động chạy**: `RbacGuard` đã được register global, tự động check cho mọi route
2. **Mặc định route là protected**: Route không có `@Permission()` → yêu cầu authentication (JWT hợp lệ)
3. **Public route**: Chỉ khi có `@Permission('public')` → authentication optional (nếu có token thì validate và gắn user; nếu lỗi token thì vẫn cho qua)
4. **Kiểm tra permission**:
   - Lấy `userId` từ `req.user`
   - Gọi `RbacService.userHasPermissions(userId, requiredPermissions)`
   - Chỉ kiểm tra permissions có `status = 'active'` từ roles có `status = 'active'` của user
   - Nếu không có quyền → throw `ForbiddenException` với `ResponseUtil` format

## Public Routes

Explicit public route:

```typescript
// Explicit public route
@Permission('public')
@Get('public-posts')
async getPublicPosts() {
  return this.postService.getPublicPosts();
}

// Hoặc dùng @Public() (backward compatibility)
@Public()
@Get('old-public')
async getOldPublic() {
  return this.postService.getOldPublic();
}
```

**Lưu ý:** Public route vẫn validate token nếu có, nhưng không bắt buộc. Nếu token lỗi, request vẫn được chấp nhận như unauthenticated.

## Error Responses

Tất cả errors đều trả về format `ResponseUtil`:

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required",
  "code": "UNAUTHORIZED",
  "httpStatus": 401,
  "data": null,
  "errors": null,
  "timestamp": "2024-01-01T12:00:00+07:00"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Required permissions: post.create",
  "code": "FORBIDDEN",
  "httpStatus": 403,
  "data": null,
  "errors": null,
  "timestamp": "2024-01-01T12:00:00+07:00"
}
```

## Decorators có sẵn

Tất cả decorators đều được export từ `src/common/decorators/rbac.decorators.ts`:

```typescript
import { Permission, Public, Optional, RolesRequired } from '../../common/decorators/rbac.decorators';
```

### @Permission()

Decorator chính để kiểm tra permissions:

```typescript
@Permission('post.create')  // Kiểm tra một permission
@Permission('post.update', 'post.delete')  // Kiểm tra nhiều permissions (OR)
@Permission('public')  // Explicit public route
```

### @Public() (deprecated)

Backward compatibility - tương đương với `@Permission('public')`:

```typescript
@Public()  // Tương đương @Permission('public')
```

### @Optional()

Cho phép cả authenticated và unauthenticated access:

```typescript
@Optional()  // Vẫn validate token nếu có, nhưng không bắt buộc
```

### @RolesRequired()

Kiểm tra roles thay vì permissions:

```typescript
@RolesRequired('admin', 'moderator')  // User phải có một trong các roles
```

## Guards

### JwtAuthGuard (Global)

- **Chức năng**: Validate JWT token, check token blacklist
- **Tự động chạy**: Cho tất cả routes
- **Logic**:
  - Check token blacklist trước khi validate
  - Validate JWT token
  - Route có `@Permission('public')` → optional authentication (validate nếu có token; lỗi token vẫn cho qua)
  - Route khác (mặc định) → bắt buộc authentication
  - Set `req.user` nếu token hợp lệ

### RbacGuard (Global)

- **Chức năng**: Kiểm tra roles và permissions
- **Tự động chạy**: Cho tất cả routes
- **Logic**:
  - Route có `@Permission('public')` → Allow (bỏ qua kiểm tra quyền)
  - Route có `@Permission()` khác → Check quyền với `RbacService`
  - Nếu không có `@Permission()` → Không check quyền (nhưng route vẫn protected bởi JwtAuthGuard)
  - Route có `@RolesRequired()` → Check roles với `RbacService`

## Lưu ý quan trọng

1. **Permission phải tồn tại trong DB** với `status = 'active'`
2. **User phải có role** và role đó phải có permission với `status = 'active'`
3. **Nếu role hoặc permission bị inactive** → user mất quyền ngay lập tức
4. **KHÔNG có direct permissions** - tất cả đều phải qua roles
5. **Route mặc định là protected** - chỉ public khi có `@Permission('public')`
6. **Token blacklist** được check tự động bởi `JwtAuthGuard`

## Ví dụ thực tế

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { Permission } from '../../common/decorators/rbac.decorators';

@Controller('admin/posts')
export class PostController {
  // List posts - cần quyền đọc
  @Permission('post.read')
  @Get()
  async getList() {
    return this.postService.findAll();
  }

  // Get one post - cần quyền đọc
  @Permission('post.read')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  // Create post - cần quyền tạo
  @Permission('post.create')
  @Post()
  async create(@Body() dto: CreatePostDto) {
    return this.postService.create(dto);
  }

  // Update post - cần quyền cập nhật
  @Permission('post.update')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto
  ) {
    return this.postService.update(id, dto);
  }

  // Delete post - cần quyền xóa
  @Permission('post.delete')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.postService.delete(id);
  }

  // Publish post - có thể cần quyền update hoặc publish
  @Permission('post.update', 'post.publish')
  @Post(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number) {
    return this.postService.publish(id);
  }
}
```

