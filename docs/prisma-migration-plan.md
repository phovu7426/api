## Kế hoạch chuyển từ TypeORM sang Prisma cho truyentranh-api

### 1. Hiện trạng sử dụng TypeORM trong project

- **Cấu hình & bootstrap DB**
  - `src/core/database/database.module.ts`: dùng `TypeOrmModule.forRootAsync` (NestJS + `@nestjs/typeorm`).
  - `tools/typeorm/data-source.ts`: khởi tạo `new DataSource({...})` cho CLI/migrations TypeORM.
  - `src/core/database/migrations/*.ts`: toàn bộ migrations implement `MigrationInterface`, dùng `QueryRunner`, `Table`, v.v.

- **Entity & schema**
  - Toàn bộ entity trong `src/shared/entities/*.entity.ts` dùng decorator TypeORM: `@Entity`, `@Column`, `@OneToMany`, `@ManyToOne`, `@Index`, v.v.
  - Có `BaseEntity` custom trong `src/shared/entities/base.entity.ts` được các entity kế thừa.

- **Service layer (business logic)**
  - `src/common/base/services/crud.service.ts`: base CRUD gần như chắc chắn dựa trên `Repository<Entity>` của TypeORM.
  - Khoảng 20 service đang dùng `CrudService<...>` và/hoặc `Repository`:
    - `src/modules/user-management/**/services/*.service.ts`
    - `src/modules/post/**/services/*.service.ts`
    - `src/modules/menu/**/services/*.service.ts`
    - `src/modules/notification/**/services/*.service.ts`
    - `src/modules/context/**/services/*.service.ts`
    - `src/modules/contact/**/services/*.service.ts`
    - `src/modules/comics/**/services/*.service.ts`
    - `src/modules/banner/**/services/*.service.ts`
    - `src/modules/system-config/**/services/*.service.ts`
    - `src/modules/rbac/services/rbac.service.ts`
  - Ví dụ: `src/modules/user-management/admin/user/services/user.service.ts`
    - Dùng `@InjectRepository(User)`, `Repository<User>`, `In()`, `this.repository.find(...)`, `this.repository.save(...)`, `manager.getRepository(...)`, v.v.

- **Modules (DI)**
  - Nhiều module import và dùng `TypeOrmModule.forFeature(...)`:
    - `src/modules/user-management/**.module.ts`
    - `src/modules/system-config/**.module.ts`
    - `src/modules/rbac/rbac.module.ts` (có `exports: [RbacService, RbacCacheService, TypeOrmModule]`)
    - `src/modules/post/**.module.ts`
    - Các module khác có entity TypeORM tương tự.

- **Seeder & CLI**
  - `src/core/database/seeder/*.ts`: `SeedRoles`, `SeedPermissions`, `SeedMenus`, `SeedComics`, `SeedChapters`, v.v. — nhiều khả năng dùng `Repository`/`DataSource` TypeORM.
  - `src/core/database/cli/*.ts`: `seed.ts`, `seed-posts.ts`, `create-database.ts` — bootstrap bằng `databaseProviders` hoặc `tools/typeorm/data-source.ts`.
  - `src/core/database/database.providers.ts`: cung cấp instance TypeORM cho seeder/CLI.

- **Config**
  - `src/core/core.module.ts` import `DatabaseModule` (chứa cấu hình TypeORM).
  - Biến môi trường `DB_*` (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, ...) dùng cho TypeORM; Prisma sẽ dùng `DATABASE_URL` (có thể build từ các biến này).

---

### 2. Chiến lược tổng thể: migrate dần (incremental), chạy song song TypeORM + Prisma

Để an toàn, nên **không migrate big-bang** mà làm theo các phase:

1. **Phase 1 – Setup Prisma tối thiểu**, không chạm vào logic business.
2. **Phase 2 – Map schema/entity sang `schema.prisma`**.
3. **Phase 3 – Thêm `PrismaModule` + `PrismaService` và chuẩn bị base CRUD mới.**
4. **Phase 4 – Refactor từng module/service từ TypeORM sang Prisma.**
5. **Phase 5 – Refactor seeder & CLI sang Prisma.**
6. **Phase 6 – Gỡ TypeORM hoàn toàn (dependencies, modules, migrations cũ).**

Nhờ vậy, hệ thống vẫn chạy được trong khi chuyển dần từng phần, giảm rủi ro.

---

### 3. Phase 1 – Setup Prisma

- **Bước 1: Cài dependency**
  - Thêm vào `package.json`:
    - Dev: `prisma`
    - Runtime: `@prisma/client`
  - Chạy:

```bash
npm install prisma @prisma/client --save-dev
npx prisma init
```

- **Bước 2: Thiết lập `datasource` & `generator` trong `prisma/schema.prisma`**
  - `datasource db`:
    - `provider = "mysql"` (hoặc `postgresql`... tùy theo `database.type` hiện tại).
    - `url = env("DATABASE_URL")`.
  - `generator client`:
    - `provider = "prisma-client-js"`.

- **Bước 3: Thiết lập `DATABASE_URL`**
  - Tận dụng các biến `DB_*` hiện tại (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`) để build `DATABASE_URL`, ví dụ:
    - `mysql://user:pass@host:port/dbname?schema=public`
  - Có thể:
    - Thêm trực tiếp `DATABASE_URL` vào `.env`, hoặc
    - Viết 1 script nhỏ xây dựng URL từ `DB_*` và export env khi chạy Prisma (nếu không muốn duplicate).

- **Bước 4: Introspect database (tùy chọn, nhưng rất nên làm)**
  - Nếu DB dev/staging đã có đầy đủ schema:

```bash
npx prisma db pull
```

  - Lệnh này sẽ sinh các `model` trong `prisma/schema.prisma` khớp với schema thực tế.

> Sau Phase 1: project vẫn chạy bằng TypeORM bình thường, nhưng đã có Prisma Client và schema sơ bộ.

---

### 4. Phase 2 – Map entity TypeORM sang Prisma schema

**Mục tiêu:** `prisma/schema.prisma` phản ánh **đúng** cấu trúc DB hiện tại (bảng, cột, quan hệ, index, unique, soft delete, ...).

- **Nguồn tham chiếu:**
  - `src/shared/entities/*.entity.ts` — nguồn chính:
    - Ví dụ: `user.entity.ts`, `profile.entity.ts`, `role.entity.ts`, `permission.entity.ts`, `post.entity.ts`, `comic.entity.ts`, `chapter.entity.ts`, `comic-category.entity.ts`, các bảng junction như `post-tag`, `post-category`, `user-role-assignment`, `user-group`, v.v.
  - Tài liệu schema: `docs/database_schema/*.md`:
    - `users.md`, `roles.md`, `posts.md`, `posttag.md`, `postcategory.md`, `profiles.md`, `comics.md`, `junction-tables.md`, v.v.

- **Cách map:**
  - Với **mỗi entity** trong `src/shared/entities`:
    - `@Entity('users')` → `model User @map("users")`.
    - `@Column({ type: 'varchar', length: 255, nullable: true, unique: true })` →
      - `email String? @db.VarChar(255) @unique`.
    - Kiểu dữ liệu:
      - `varchar` → `String` + `@db.VarChar(length)`.
      - `int` → `Int @db.Int`.
      - `bigint` → `BigInt @db.BigInt` hoặc `String @db.BigInt` (tùy chiến lược).
      - `datetime` → `DateTime @db.DateTime`.
      - Enum (ví dụ `UserStatus`) → `enum` trong Prisma (`enum UserStatus { ... }`) + `@default(Active)`.
    - Quan hệ:
      - `@OneToMany` / `@ManyToOne` / `@ManyToMany` / `@OneToOne` map sang `@relation(fields: [...], references: [...])`, có thể phải khai báo trường foreign key rõ ràng.
    - Index:
      - `@Index('idx_deleted_at', ['deleted_at'])` → `@@index([deleted_at], map: "idx_deleted_at")`.
    - Soft delete:
      - Trường `deleted_at` giữ nguyên, type `DateTime?`.

- **Kiểm tra & generate:**
  - Sau khi chỉnh tay `schema.prisma`:

```bash
npx prisma generate
```

  - Có thể dùng:

```bash
npx prisma migrate diff \
  --from-url "mysql://..." \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "mysql://..."
```

  - Để so sánh schema thực tế và schema Prisma (chỉ check, chưa apply).

---

### 5. Phase 3 – Tạo `PrismaModule` + `PrismaService` và base CRUD mới

- **Tạo `PrismaService`**
  - File gợi ý: `src/core/database/prisma/prisma.service.ts`.
  - Kế thừa từ `PrismaClient`:
    - Implement `OnModuleInit` → `await this.$connect();`
    - Implement `enableShutdownHooks(app)` nếu muốn app shutdown gọn.

- **Tạo `PrismaModule`**
  - File gợi ý: `src/core/database/prisma/prisma.module.ts`.
  - `@Global()` (để có thể inject `PrismaService` ở bất cứ đâu mà không cần import module nhiều lần), gồm:
    - `providers: [PrismaService]`
    - `exports: [PrismaService]`

- **Tích hợp vào `CoreModule`**
  - `CoreModule` (`src/core/core.module.ts`) hiện đang:
    - `imports: [ConfigModule.forRoot(...), DatabaseModule]`
  - Giai đoạn chuyển tiếp:
    - Giữ nguyên `DatabaseModule` (TypeORM) để hệ thống chạy bình thường.
    - Thêm `PrismaModule` vào imports (nếu không dùng `@Global`).

- **Chuẩn bị base CRUD cho Prisma**
  - `src/common/base/services/crud.service.ts` hiện dựa trên `Repository` của TypeORM.
  - Hai lựa chọn:
    1. **Tạo base mới**: `PrismaCrudService<TModelName, TWhere, TCreate, TUpdate>` dùng Prisma Client (`prisma.user`, `prisma.post`, ...).
       - Giữ `CrudService` cũ cho đến khi migrate xong.
    2. **Refactor `CrudService` để tách khỏi TypeORM**:
       - Trừu tượng hóa data access layer, inject adapter; phức tạp hơn, không khuyến khích nếu muốn chuyển nhanh.
  - Đề xuất: **tạo base mới riêng cho Prisma** để code dễ đọc, ít đụng đến code cũ.

---

### 6. Phase 4 – Refactor từng module/service sang Prisma

Nên đi từ module đơn giản → phức tạp, mỗi module refactor xong phải test kỹ.

#### 6.1. Thứ tự gợi ý các module

1. **SystemConfig, Menu, Banner, Contact**:
   - Entity ít, quan hệ đơn giản.
2. **Post (public & admin)**:
   - Có tag/category (N-N) nhưng logic CRUD vẫn khá chuẩn.
3. **Notification**.
4. **Comics module**:
   - Nhiều bảng: comic, chapter, chapter-page, category, review, comment, bookmark, follow, view, reading-history, stats...
   - Nhiều quan hệ và logic thống kê.
5. **UserManagement + RBAC + Context**:
   - Phức tạp nhất (user, profile, roles, permissions, groups, contexts, user-role-assignment, user-group, role-context,...).

#### 6.2. Sửa các `*.module.ts` để bỏ `TypeOrmModule.forFeature`

Ví dụ: `src/modules/user-management/admin/user/user.module.ts`

- **Hiện tại:**
  - Import:
    - `import { TypeOrmModule } from '@nestjs/typeorm';`
    - `import { User } from '@/shared/entities/user.entity';`
    - `import { Profile } from '@/shared/entities/profile.entity';`
  - Module:
    - `imports: [TypeOrmModule.forFeature([User, Profile])]`

- **Sau khi dùng Prisma:**
  - Xóa import `TypeOrmModule`.
  - Xóa `TypeOrmModule.forFeature([User, Profile])` khỏi `imports`.
  - Đảm bảo `PrismaModule` đã được khai báo global, hoặc import `PrismaModule` nếu cần.

Làm tương tự cho:

- `src/modules/user-management/user/user/user.module.ts`
- `src/modules/user-management/admin/role/role.module.ts`
- `src/modules/user-management/admin/permission/permission.module.ts`
- `src/modules/system-config/system-config.module.ts` và các sub-module.
- `src/modules/post/**.module.ts`
- `src/modules/menu/**.module.ts`
- `src/modules/notification/**.module.ts`
- `src/modules/context/**.module.ts`
- `src/modules/comics/**.module.ts`
- `src/modules/banner/**.module.ts`
- `src/modules/rbac/rbac.module.ts`:
  - Chú ý sửa `exports: [RbacService, RbacCacheService, TypeOrmModule]` → bỏ `TypeOrmModule`.

#### 6.3. Refactor service từ `Repository` sang Prisma Client

Ví dụ: `src/modules/user-management/admin/user/services/user.service.ts`

- **Hiện tại:**
  - Import:
    - `InjectRepository`, `Repository`, `In` từ TypeORM.
  - Constructor:
    - `constructor(@InjectRepository(User) protected readonly repository: Repository<User>, ...)`
  - Sử dụng:
    - `this.repository.find({ where, relations })`
    - `this.repository.save(entity)`
    - `this.repository.manager.getRepository(Profile)`
    - `this.repository.manager.getRepository('UserGroup')`
    - `In(userIds)`

- **Sau khi chuyển sang Prisma:**
  - Inject `PrismaService`:
    - `constructor(private readonly prisma: PrismaService, private readonly rbacService: RbacService) { ... }`
  - Thay thế các thao tác:
    - `this.repository.find({ where, relations })` →
      - `this.prisma.user.findMany({ where: ..., include: { profile: true, user_role_assignments: true } })`
    - `this.repository.findOne({ where: { id } })` →
      - `this.prisma.user.findUnique({ where: { id } })`
    - `this.repository.save(user)` →
      - `this.prisma.user.update({ where: { id }, data: {...} })`
      - Hoặc `create`/`upsert` tùy use-case.
    - `this.repository.manager.getRepository(Profile)` →
      - `this.prisma.profile` (tương ứng).
    - `this.repository.manager.getRepository('UserGroup')` →
      - `this.prisma.userGroup`.
    - `In(userIds)` →
      - `where: { id: { in: userIds } }`.

- **Với `CrudService` base:**
  - Nếu tạo `PrismaCrudService`, `UserService` sẽ:
    - `extends PrismaCrudService<Prisma.UserDelegate, Prisma.UserWhereInput, Prisma.UserCreateInput, Prisma.UserUpdateInput>` (hoặc cách generic tương tự).
  - Override lại các hook (`beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, `afterGetOne`, `afterGetList`) cho phù hợp với Prisma.

- **Những service cần refactor tương tự:**
  - Toàn bộ file khớp với grep `CrudService<`:
    - `src/modules/user-management/**/services/*.service.ts`
    - `src/modules/system-config/**/services/*.service.ts`
    - `src/modules/post/**/services/*.service.ts`
    - `src/modules/notification/**/services/*.service.ts`
    - `src/modules/menu/**/services/*.service.ts`
    - `src/modules/context/**/services/*.service.ts`
    - `src/modules/contact/**/services/*.service.ts`
    - `src/modules/comics/**/services/*.service.ts`
    - `src/modules/banner/**/services/*.service.ts`
  - Cộng thêm các service khác có import `InjectRepository` / `Repository` / `In`.

#### 6.4. Xử lý các query phức tạp

- Cần tìm và kiểm tra:
  - Các chỗ dùng `createQueryBuilder`, `QueryRunner`, `queryRunner.query(...)`, subquery, join phức tạp.
- Với Prisma:
  - Thử map sang `findMany`/`aggregate` với `include`, `select`, `orderBy`, `groupBy` nếu được.
  - Nếu bắt buộc phải dùng SQL thô (rất phức tạp hoặc phụ thuộc DB-specific features):
    - Dùng `prisma.$queryRaw` / `prisma.$executeRaw`.

---

### 7. Phase 5 – Seeder & CLI

- **Seeder (`src/core/database/seeder/*.ts`)**
  - Hiện tại:
    - Inject `DataSource` / `Repository` TypeORM (thông qua `databaseProviders`).
  - Sau khi dùng Prisma:
    - Inject `PrismaService` vào các class seeder: `SeedPermissions`, `SeedRoles`, `SeedUsers`, `SeedPostCategories`, `SeedPostTags`, `SeedPosts`, `SeedMenus`, `SeedBannerLocations`, `SeedBanners`, `SeedContacts`, `SeedGeneralConfigs`, `SeedEmailConfigs`, `SeedGroups`, `SeedComicCategories`, `SeedComics`, `SeedChapters`, v.v.
    - Dùng API Prisma:
      - `prisma.role.createMany(...)`
      - `prisma.permission.upsert(...)`
      - `prisma.menu.createMany(...)`
      - v.v.

- **CLI (`src/core/database/cli/*.ts`)**
  - Hiện dùng TypeORM/`databaseProviders` để:
    - Tạo DB.
    - Chạy seeder.
  - Sau khi migrate:
    - Tạo bootstrap Prisma riêng:
      - Ví dụ `src/core/database/prisma/bootstrap-prisma.ts` khởi tạo `PrismaService` (hoặc một instance `PrismaClient` thuần).
    - CLI sẽ:
      - Khởi tạo Prisma.
      - Gọi các seeder đã refactor.

- **Migrations**
  - TypeORM migrations: `src/core/database/migrations/*.ts` + tool `tools/typeorm/data-source.ts`, `tools/check-migration.ts`.
  - Sau khi chuyển hẳn sang Prisma:
    - Ngừng dùng TypeORM cho migrations mới.
    - Dùng Prisma:

```bash
npx prisma migrate dev   # dev
npx prisma migrate deploy # production
```

  - Bảng migrations cũ (`migrations`) có thể:
    - Để nguyên như lịch sử.
    - Prisma sẽ dùng bảng riêng `_prisma_migrations`.

---

### 8. Phase 6 – Gỡ TypeORM hoàn toàn

Sau khi:

- Tất cả service đã dùng Prisma Client (không còn `Repository`, `InjectRepository`).
- Không còn module nào dùng `TypeOrmModule`.
- Seeder & CLI đã dùng Prisma.

Thực hiện:

- **Gỡ dependency:**
  - Xóa khỏi `package.json`:
    - `typeorm`
    - `@nestjs/typeorm`
    - Các plugin liên quan nếu có.

- **Xóa / refactor file TypeORM:**
  - `src/core/database/database.module.ts`:
    - Hoặc refactor module này để chỉ wrap `PrismaModule`.
    - Hoặc xóa `DatabaseModule` nếu không còn cần (dùng trực tiếp `PrismaModule`).
  - `src/core/database/migrations/*.ts`:
    - Di chuyển sang thư mục archive, hoặc giữ nguyên nếu muốn.
  - `src/core/database/subscribers/*` (nếu đang dùng).
  - `tools/typeorm/*`, `tools/check-migration.ts`.
  - `src/shared/entities/*.entity.ts`:
    - Nếu đã hoàn toàn dùng Prisma types (`Prisma.User`, `Prisma.Post`, ...):
      - Có thể:
        - Giữ lại các class entity như domain model/DTO (bỏ decorator TypeORM).
        - Hoặc xóa hẳn và dùng interface/DTO riêng cho layer API.

- **Dọn config:**
  - Các biến DB chung (`DB_HOST`, `DB_PORT`, ...) vẫn dùng được nếu dùng để build `DATABASE_URL`.
  - Có thể bỏ các biến chỉ phục vụ TypeORM (nếu không còn dùng trong logic khác), như:
    - `DB_SYNCHRONIZE`
    - `DB_LOGGING`
    - `DB_SSL` (nếu URL Prisma đã chứa thông tin SSL).
    - `DB_CONNECTION_LIMIT` (nếu không còn ý nghĩa với Prisma).

---

### 9. Ước lượng thời gian cho migrate

Với quy mô hiện tại:

- Khoảng **30+ entity** trong `src/shared/entities`.
- Nhiều module domain: `auth`, `user-management`, `rbac`, `context`, `post`, `comics`, `menu`, `banner`, `notification`, `system-config`, v.v.
- Hệ thống RBAC, context, group khá phức tạp.

Ước lượng cho 1 dev full-time:

- **Phase 1–3 (setup Prisma, map schema, thêm PrismaModule/Service):** ~1–2 ngày.
- **Phase 4 (refactor service + module)**:
  - Các module đơn giản (system-config, menu, banner, contact, notification, basic post): 2–3 ngày.
  - Comics module (nhiều bảng & quan hệ): 2–4 ngày.
  - User-management + RBAC + Context: 3–5 ngày.
- **Phase 5 (seeder + CLI):** 1–2 ngày.
- **Phase 6 (dọn TypeORM, test full, fix bug lặt vặt):** 1–2 ngày.

Tổng thể: **khoảng 1.5–3 tuần** làm việc tập trung để migrate sạch sẽ và test đầy đủ.

---

### 10. Gợi ý bước tiếp theo

- Tạo `prisma/schema.prisma` chuẩn từ DB hiện tại (Phase 1–2).
- Tạo `PrismaService` + `PrismaModule` (Phase 3).
- Chọn 1 module nhỏ (ví dụ: `system-config` hoặc `menu`) làm **POC**:
  - Bỏ `TypeOrmModule.forFeature`.
  - Chuyển service sang dùng Prisma.
  - Chạy test/manual test để xác nhận pattern.
- Sau khi POC ổn, áp dụng cùng pattern cho các module còn lại theo thứ tự ưu tiên.


