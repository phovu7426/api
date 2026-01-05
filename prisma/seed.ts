import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Build DATABASE_URL from individual DB_* variables if DATABASE_URL is not set
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const username = process.env.DB_USERNAME || '';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_DATABASE || '';
  const charset = process.env.DB_CHARSET || 'utf8mb4';
  const timezone = process.env.DB_TIMEZONE || '+07:00';
  const ssl = process.env.DB_SSL === 'true';

  const encodedPassword = encodeURIComponent(password);
  const params = new URLSearchParams({
    charset,
    timezone,
  });
  if (ssl) {
    params.append('sslmode', 'require');
  }
  
  const url = `mysql://${username}${password ? ':' + encodedPassword : ''}@${host}:${port}/${database}?${params.toString()}`;
  return url;
}

// Get DATABASE_URL and set it in process.env (PrismaClient reads from process.env.DATABASE_URL)
const databaseUrl = process.env.DATABASE_URL || getDatabaseUrl();
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Please set DATABASE_URL or DB_* environment variables.');
}

// Set DATABASE_URL in process.env for PrismaClient
process.env.DATABASE_URL = databaseUrl;
console.log('DATABASE_URL:', databaseUrl.replace(/:[^:@]*@/, ':****@'));

// Clear require cache and import PrismaClient with adapter (like PrismaService does)
delete require.cache[require.resolve('@prisma/client')];
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// Parse DATABASE_URL to create connection config for adapter
const url = new URL(databaseUrl);
const connectionConfig = {
  host: url.hostname,
  port: parseInt(url.port || '3306', 10),
  user: url.username,
  password: url.password || '',
  database: url.pathname.slice(1), // Remove leading '/'
  connectionLimit: 10,
  connectTimeout: 30000, // 30 seconds
};

const adapterFactory = new PrismaMariaDb(connectionConfig);
const prisma = new PrismaClient({ adapter: adapterFactory } as any);

async function main() {
  console.log('🌱 Bắt đầu seed database...');

  // Seed Roles
  console.log('📝 Đang tạo roles...');
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      code: 'admin',
      name: 'Administrator',
      status: 'active',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: {
      code: 'user',
      name: 'User',
      status: 'active',
    },
  });

  console.log('✅ Đã tạo roles:', { adminRole, userRole });

  // Seed Permissions
  console.log('📝 Đang tạo permissions...');
  const permissions = [
    { code: 'user.create', name: 'Tạo người dùng', scope: 'context' },
    { code: 'user.read', name: 'Xem người dùng', scope: 'context' },
    { code: 'user.update', name: 'Cập nhật người dùng', scope: 'context' },
    { code: 'user.delete', name: 'Xóa người dùng', scope: 'context' },
    { code: 'post.create', name: 'Tạo bài viết', scope: 'context' },
    { code: 'post.read', name: 'Xem bài viết', scope: 'context' },
    { code: 'post.update', name: 'Cập nhật bài viết', scope: 'context' },
    { code: 'post.delete', name: 'Xóa bài viết', scope: 'context' },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    createdPermissions.push(permission);
  }
  console.log(`✅ Đã tạo ${createdPermissions.length} permissions`);

  // Gán permissions cho admin role
  console.log('📝 Đang gán permissions cho admin role...');
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: permission.id,
      },
    });
  }
  console.log('✅ Đã gán permissions cho admin role');

  // Seed Context (Global context)
  console.log('📝 Đang tạo contexts...');
  let globalContext = await prisma.context.findFirst({
    where: {
      type: 'global',
      ref_id: null,
    },
  });

  if (!globalContext) {
    globalContext = await prisma.context.create({
      data: {
        type: 'global',
        ref_id: null,
        name: 'Global Context',
        code: 'global',
        status: 'active',
      },
    });
  }
  console.log('✅ Đã tạo context:', globalContext);

  // Seed Groups
  console.log('📝 Đang tạo groups...');
  const adminGroup = await prisma.group.upsert({
    where: {
      type_code: {
        type: 'admin',
        code: 'administrators',
      },
    },
    update: {},
    create: {
      type: 'admin',
      code: 'administrators',
      name: 'Administrators',
      description: 'Nhóm quản trị viên',
      status: 'active',
      context_id: globalContext.id,
    },
  });
  console.log('✅ Đã tạo group:', adminGroup);

  // Seed Admin User
  console.log('📝 Đang tạo admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin@example.com' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        status: 'active',
        email_verified_at: new Date(),
        profile: {
          create: {
            name: 'Administrator',
          },
        },
      },
    });
  }
  console.log('✅ Đã tạo admin user:', { id: adminUser.id, email: adminUser.email });

  // Gán user vào group
  console.log('📝 Đang gán user vào group...');
  const existingUserGroup = await prisma.userGroup.findUnique({
    where: {
      user_id_group_id: {
        user_id: adminUser.id,
        group_id: adminGroup.id,
      },
    },
  });

  if (!existingUserGroup) {
    await prisma.userGroup.create({
      data: {
        user_id: adminUser.id,
        group_id: adminGroup.id,
      },
    });
  }

  // Gán role cho user trong group
  console.log('📝 Đang gán role cho user...');
  const existingRoleAssignment = await prisma.userRoleAssignment.findUnique({
    where: {
      user_id_role_id_group_id: {
        user_id: adminUser.id,
        role_id: adminRole.id,
        group_id: adminGroup.id,
      },
    },
  });

  if (!existingRoleAssignment) {
    await prisma.userRoleAssignment.create({
      data: {
        user_id: adminUser.id,
        role_id: adminRole.id,
        group_id: adminGroup.id,
      },
    });
  }
  console.log('✅ Đã gán role cho user');

  // Seed Menu
  console.log('📝 Đang tạo menus...');
  const dashboardMenu = await prisma.menu.upsert({
    where: { code: 'dashboard' },
    update: {},
    create: {
      code: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      api_path: '/api/dashboard',
      icon: 'dashboard',
      type: 'route',
      status: 'active',
      sort_order: 1,
      is_public: false,
      show_in_menu: true,
    },
  });

  const userManagementMenu = await prisma.menu.upsert({
    where: { code: 'user-management' },
    update: {},
    create: {
      code: 'user-management',
      name: 'Quản lý người dùng',
      path: '/users',
      api_path: '/api/users',
      icon: 'users',
      type: 'route',
      status: 'active',
      sort_order: 2,
      is_public: false,
      show_in_menu: true,
      required_permission_id: createdPermissions.find(p => p.code === 'user.read')?.id,
    },
  });

  console.log('✅ Đã tạo menus');

  // Seed Banner Locations
  console.log('📝 Đang tạo banner locations...');
  const homeBannerLocation = await prisma.bannerLocation.upsert({
    where: { code: 'home' },
    update: {},
    create: {
      code: 'home',
      name: 'Trang chủ',
      description: 'Banner hiển thị ở trang chủ',
      status: 'active',
    },
  });
  console.log('✅ Đã tạo banner locations');

  // Seed General Config
  console.log('📝 Đang tạo general config...');
  let generalConfig = await prisma.generalConfig.findFirst();

  if (!generalConfig) {
    generalConfig = await prisma.generalConfig.create({
      data: {
        site_name: 'My Website',
        site_description: 'Mô tả website',
        site_email: 'contact@example.com',
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi',
        currency: 'VND',
      },
    });
  }
  console.log('✅ Đã tạo general config');

  console.log('🎉 Seed database hoàn tất!');
  console.log('\n📋 Thông tin đăng nhập:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

