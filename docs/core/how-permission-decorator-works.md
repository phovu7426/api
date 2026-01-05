# Cách @Permission Decorator Hoạt Động

Giải thích chi tiết cách decorator `@Permission()` tự động kiểm tra quyền mà không cần gọi hàm nào.

## Tóm tắt ngắn gọn

1. **Decorator** = Gắn metadata (thông tin) vào method/class
2. **Guard** = Chạy TRƯỚC khi method được gọi, đọc metadata và kiểm tra
3. **NestJS tự động** kết nối decorator và guard

---

## 1. Decorator là gì?

### Decorator trong TypeScript/NestJS

Decorator là một hàm đặc biệt được đặt TRƯỚC class, method, property...

```typescript
// Khi bạn viết:
@Permission('post.create')
@Post()
createPost() { ... }

// Tương đương với việc gọi:
Permission('post.create')(Post()(createPost))
```

### Decorator @Permission thực sự làm gì?

```typescript
// File: src/common/decorators/rbac.decorators.ts
export const Permission = (...permissions: string[]) => 
  SetMetadata(PERMS_REQUIRED_KEY, permissions);
```

**Phân tích:**

1. `Permission('post.create')` là một hàm nhận vào mảng permissions
2. Hàm này TRẢ VỀ kết quả của `SetMetadata(...)`
3. `SetMetadata()` là hàm của NestJS để **GẮN metadata vào method**

**Metadata là gì?** = Dữ liệu/phân loại gắn vào method/class để các phần khác (như Guard) đọc được

```typescript
// Giống như bạn dán một sticker với nội dung "Cần permission: post.create" 
// lên method createPost()
```

---

## 2. SetMetadata hoạt động như thế nào?

### SetMetadata trong NestJS

```typescript
SetMetadata('KEY', 'VALUE')
```

**SetMetadata làm 2 việc:**
1. Tạo một "nhãn" (key) để đánh dấu: `'perms_required'`
2. Lưu giá trị (value) vào metadata: `['post.create']`

**Ví dụ cụ thể:**

```typescript
@Permission('post.create')
@Post()
createPost() { ... }
```

Sau khi NestJS xử lý decorator, metadata sẽ là:
```javascript
{
  'perms_required': ['post.create']  // Key là PERMS_REQUIRED_KEY, Value là array permissions
}
```

Metadata này được **lưu vào method `createPost`** như một thuộc tính ẩn.

---

## 3. Guard là gì và tại sao nó chạy tự động?

### Guard trong NestJS

Guard là một class thực hiện interface `CanActivate`, chạy **TRƯỚC** khi method được gọi.

### Guard được register GLOBAL

```typescript
// File: src/app.module.ts
{
  provide: APP_GUARD,
  useClass: RbacGuard,  // Guard này được chạy cho TẤT CẢ routes
}
```

**Vì sao chạy tự động?**
- `APP_GUARD` là token đặc biệt của NestJS
- Khi bạn register với `APP_GUARD`, NestJS tự động chạy guard này cho **mọi request**
- Guard chạy TRƯỚC khi controller method được gọi

---

## 4. Guard đọc Metadata như thế nào?

### Reflector - Công cụ đọc metadata

```typescript
// File: src/common/guards/rbac.guard.ts
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,  // Inject Reflector để đọc metadata
    private rbac: RbacService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Đọc metadata từ method handler
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(
      PERMS_REQUIRED_KEY,  // Tìm metadata có key = 'perms_required'
      [
        context.getHandler(),  // Đọc từ method (ví dụ: createPost)
        context.getClass(),    // Hoặc từ class (nếu decorator ở class level)
      ]
    ) || [];
    
    // Nếu không có metadata → không có @Permission → cho phép truy cập
    if (requiredPerms.length === 0) return true;
    
    // Nếu có metadata → kiểm tra quyền
    // ...
  }
}
```

**Giải thích từng bước:**

1. **`context.getHandler()`** → Lấy method đang được gọi (ví dụ: `createPost`)
2. **`this.reflector.getAllAndOverride(...)`** → Đọc metadata từ method đó
3. **`PERMS_REQUIRED_KEY`** → Tìm metadata có key = `'perms_required'`
4. **Kết quả:** Nếu có `@Permission('post.create')` → trả về `['post.create']`, nếu không → `[]`

---

## 5. Luồng hoạt động tổng thể

### Khi user gọi API

```
1. User gửi request: POST /admin/posts
   ↓
2. NestJS routing → Tìm controller và method tương ứng
   ↓
3. Chạy JwtAuthGuard (đã register global)
   - Kiểm tra token blacklist trước (nếu token bị blacklist → từ chối)
   - Kiểm tra JWT token
   - Nếu hợp lệ → Gắn user vào req.user
   - Xử lý public/optional routes (mặc định route không có @Permission() là public)
   ↓
4. Chạy RbacGuard (đã register global)
   ↓
   a) Reflector đọc metadata từ method createPost()
      - Tìm metadata có key = 'perms_required'
      - Tìm thấy: ['post.create']
   ↓
   b) Kiểm tra user có permission không
      - Lấy userId từ req.user
      - Gọi RbacService.userHasPermissions(userId, ['post.create'])
      - Query DB: Lấy roles của user → Lấy permissions từ roles
      - Kiểm tra có 'post.create' trong list permissions không
   ↓
   c) Nếu có quyền → return true → Cho phép tiếp tục
      Nếu không có → throw ForbiddenException → Dừng, trả về 403
   ↓
5. Nếu guard cho phép → Chạy method createPost()
```

---

## 6. Ví dụ minh họa cụ thể

### Controller

```typescript
@Controller('admin/posts')
export class PostController {
  @Permission('post.create')  // ← Bước 1: Gắn metadata
  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    return this.postService.create(dto);
  }
}
```

### Khi compile, NestJS xử lý như sau:

```typescript
// Bước 1: Xử lý decorator @Permission('post.create')
SetMetadata('perms_required', ['post.create'])(createPost)

// Kết quả: Method createPost có metadata:
createPost.__metadata__ = {
  'perms_required': ['post.create']
}
```

### Khi request đến:

```typescript
// Guard chạy
async canActivate(context: ExecutionContext) {
  // Bước 2: Đọc metadata
  const method = context.getHandler(); // Lấy method createPost
  const metadata = this.reflector.get('perms_required', method);
  // metadata = ['post.create']
  
  // Bước 3: Kiểm tra quyền
  const userId = req.user.id;
  const hasPermission = await this.rbac.userHasPermissions(
    userId, 
    ['post.create']
  );
  
  // Bước 4: Quyết định
  if (!hasPermission) {
    throw new ForbiddenException('Access denied...');
  }
  
  return true; // Cho phép tiếp tục
}
```

---

## 7. Tại sao không cần gọi hàm?

### So sánh với cách thông thường

**Cách thủ công (KHÔNG dùng decorator):**
```typescript
@Post()
async createPost(@Body() dto: CreatePostDto, @Req() req: any) {
  // Phải tự gọi hàm check
  const hasPermission = await this.rbac.userHasPermissions(
    req.user.id, 
    ['post.create']
  );
  
  if (!hasPermission) {
    throw new ForbiddenException('Access denied');
  }
  
  // Logic chính
  return this.postService.create(dto);
}
```

**Cách dùng decorator (AUTOMATIC):**
```typescript
@Permission('post.create')  // ← Chỉ cần viết 1 dòng
@Post()
async createPost(@Body() dto: CreatePostDto) {
  // Logic chính, không cần check quyền
  return this.postService.create(dto);
}
// Guard tự động chạy TRƯỚC method này
```

---

## 8. Điểm quan trọng

### Metadata được lưu ở đâu?

Metadata được lưu trong **Reflect metadata** của JavaScript/TypeScript, không phải trong code thường.

### Tại sao cần Reflector?

- Reflector là wrapper của NestJS để đọc metadata một cách dễ dàng
- Có thể đọc từ method (handler) hoặc class
- Có thể override (class-level decorator bị route-level decorator ghi đè)

### Tại sao guard phải là global?

- Nếu không global, bạn phải gắn `@UseGuards(RbacGuard)` ở mỗi controller
- Global guard tự động chạy cho mọi route, chỉ cần dùng decorator

---

## Tóm tắt

1. **`@Permission('post.create')`** → Gắn metadata `['post.create']` vào method
2. **`RbacGuard`** (global) → Tự động chạy cho mọi request
3. **`Reflector`** → Đọc metadata từ method đang được gọi
4. **Nếu không có metadata** → Route mặc định là public (cho phép truy cập)
5. **Nếu có metadata** → Kiểm tra quyền với `RbacService`
6. **Nếu có quyền** → Cho phép, **Nếu không** → Throw error

**Lưu ý quan trọng:**
- Route không có `@Permission()` → **Mặc định là public** (không cần khai báo `@Public()`)
- Route có `@Permission('public')` → Explicit public route
- `JwtAuthGuard` tự động check token blacklist trước khi validate JWT

**Kết luận:** Decorator chỉ là cách "đánh dấu", Guard mới là phần "thực thi". NestJS tự động kết nối 2 phần này thông qua Reflect Metadata.

