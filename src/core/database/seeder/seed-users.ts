import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { UserStatus } from '@/shared/enums/user-status.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedUsers {
  private readonly logger = new Logger(SeedUsers.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding users...');

    // Check xem các users cần thiết đã tồn tại chưa
    const systemAdminExists = await this.prisma.user.findFirst({
      where: { email: 'systemadmin@example.com', deleted_at: null },
    });
    const systemUserExists = await this.prisma.user.findFirst({
      where: { email: 'systemuser@example.com', deleted_at: null },
    });
    const shopAdminExists = await this.prisma.user.findFirst({
      where: { email: 'shopadmin@example.com', deleted_at: null },
    });
    const shopUserExists = await this.prisma.user.findFirst({
      where: { email: 'shopuser@example.com', deleted_at: null },
    });

    // Nếu tất cả users đã tồn tại thì skip (production-safe)
    if (systemAdminExists && systemUserExists && shopAdminExists && shopUserExists) {
      this.logger.log('All required users already exist, skip seeding (production-safe)');
      return;
    }

    // Get system context (id=1) và system group
    let systemContext = await this.prisma.context.findUnique({
      where: { id: BigInt(1) },
    });
    if (!systemContext || systemContext.deleted_at) {
      systemContext = await this.prisma.context.create({
        data: {
          type: 'system',
          ref_id: null,
          name: 'System',
          code: 'system',
          status: 'active',
        },
      });
    }

    // Get hoặc tạo system group nếu chưa có
    let systemGroup = await this.prisma.group.findFirst({
      where: { code: 'system', deleted_at: null },
    });
    if (!systemGroup) {
      // Tạo system group nếu chưa có
      systemGroup = await this.prisma.group.create({
        data: {
          type: 'system',
          code: 'system',
          name: 'System Group',
          status: 'active',
          context_id: systemContext.id,
          owner_id: BigInt(1), // Tạm thời, sẽ update sau khi có user
        },
      });
      this.logger.log('Created system group in seed-users');
    }

    // Get shop context và shop1 group
    const shopContext = await this.prisma.context.findFirst({
      where: { code: 'shop', deleted_at: null },
    });
    const shop1Group = shopContext ? await this.prisma.group.findFirst({
      where: { code: 'shop1', context_id: shopContext.id, deleted_at: null },
    }) : null;

    // Get roles
    const systemRole = await this.prisma.role.findFirst({
      where: { code: 'system', deleted_at: null },
    });
    const systemManagerRole = await this.prisma.role.findFirst({
      where: { code: 'system_manager', deleted_at: null },
    });
    const shopAdminRole = await this.prisma.role.findFirst({
      where: { code: 'shop_admin', deleted_at: null },
    });
    const shopManagerRole = await this.prisma.role.findFirst({
      where: { code: 'shop_manager', deleted_at: null },
    });

    // Seed users
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // ========== SYSTEM GROUP USERS ==========
    // 1. systemadmin: full quyền
    let savedSystemAdmin = systemAdminExists;
    if (!savedSystemAdmin) {
      savedSystemAdmin = await this.prisma.user.create({
        data: {
          username: 'systemadmin',
          email: 'systemadmin@example.com',
          password: hashedPassword,
          status: UserStatus.active,
          email_verified_at: new Date(),
        },
      });
    } else {
      // Update password nếu user đã tồn tại
      savedSystemAdmin = await this.prisma.user.update({
        where: { id: savedSystemAdmin.id },
        data: {
          password: hashedPassword,
          status: UserStatus.active,
        },
      });
      this.logger.log(`Updated existing systemadmin user password`);
    }

    // Update system group owner nếu cần
    if (systemGroup && Number(systemGroup.owner_id) !== Number(savedSystemAdmin.id)) {
      await this.prisma.group.update({
        where: { id: systemGroup.id },
        data: { owner_id: savedSystemAdmin.id },
      });
    }

    // Thêm vào system group và gán system role
    if (systemGroup && systemRole) {
      await this.assignUserToGroup(Number(savedSystemAdmin.id), Number(systemGroup.id), Number(systemRole.id));
      if (systemAdminExists) {
        this.logger.log(`✅ Updated systemadmin user (full quyền)`);
      } else {
        this.logger.log(`✅ Created systemadmin user (full quyền)`);
      }
    } else {
      this.logger.warn(`⚠️ Cannot assign systemadmin to group: systemGroup=${!!systemGroup}, systemRole=${!!systemRole}`);
    }

    // 2. systemuser: full quyền trừ phân quyền, vai trò, quyền, group
    let savedSystemUser = systemUserExists;
    if (!savedSystemUser) {
      savedSystemUser = await this.prisma.user.create({
        data: {
          username: 'systemuser',
          email: 'systemuser@example.com',
          password: hashedPassword,
          status: UserStatus.active,
          email_verified_at: new Date(),
        },
      });
      this.logger.log(`✅ Created systemuser user`);
    } else {
      savedSystemUser = await this.prisma.user.update({
        where: { id: savedSystemUser.id },
        data: {
          password: hashedPassword,
          status: UserStatus.active,
        },
      });
      this.logger.log(`✅ Updated existing systemuser password`);
    }

    // Gán system_manager role cho systemuser
    if (systemGroup && systemManagerRole) {
      await this.assignUserToGroup(Number(savedSystemUser.id), Number(systemGroup.id), Number(systemManagerRole.id));
      this.logger.log(`✅ Assigned systemuser to system group with system_manager role (full quyền trừ phân quyền, vai trò, quyền)`);
    }

    // ========== SHOP1 GROUP USERS ==========
    if (shop1Group && shopAdminRole) {
      // 1. shopadmin: shop admin full quyền của context (trừ vai trò, quyền, phân quyền, hệ thống, payment, shipping)
      let savedShopAdmin = shopAdminExists;
      if (!savedShopAdmin) {
        savedShopAdmin = await this.prisma.user.create({
          data: {
            username: 'shopadmin',
            email: 'shopadmin@example.com',
            password: hashedPassword,
            status: UserStatus.active,
            email_verified_at: new Date(),
          },
        });
        this.logger.log(`✅ Created shopadmin user (shop admin full quyền)`);
      } else {
        savedShopAdmin = await this.prisma.user.update({
          where: { id: savedShopAdmin.id },
          data: {
            password: hashedPassword,
            status: UserStatus.active,
          },
        });
        this.logger.log(`✅ Updated existing shopadmin password`);
      }
      
      await this.assignUserToGroup(Number(savedShopAdmin.id), Number(shop1Group.id), Number(shopAdminRole.id));
      this.logger.log(`✅ Assigned shopadmin to shop1 group with shop_admin role (có user.manage)`);

      // 2. shopuser: shop manager (giống shop_admin trừ user.manage)
      let savedShopUser = shopUserExists;
      if (!savedShopUser) {
        savedShopUser = await this.prisma.user.create({
          data: {
            username: 'shopuser',
            email: 'shopuser@example.com',
            password: hashedPassword,
            status: UserStatus.active,
            email_verified_at: new Date(),
          },
        });
        this.logger.log(`✅ Created shopuser user`);
      } else {
        savedShopUser = await this.prisma.user.update({
          where: { id: savedShopUser.id },
          data: {
            password: hashedPassword,
            status: UserStatus.active,
          },
        });
        this.logger.log(`✅ Updated existing shopuser password`);
      }

      if (shopManagerRole) {
        await this.assignUserToGroup(Number(savedShopUser.id), Number(shop1Group.id), Number(shopManagerRole.id));
        this.logger.log(`✅ Assigned shopuser to shop1 group with shop_manager role (trừ user.manage)`);
      }
    }

    this.logger.log(`✅ Users seeding completed`);
  }

  private async assignUserToGroup(
    userId: number,
    groupId: number,
    roleId: number,
  ): Promise<void> {
    // Thêm user vào group
    const existingUserGroup = await this.prisma.userGroup.findFirst({
      where: { 
        user_id: BigInt(userId), 
        group_id: BigInt(groupId) 
      },
    });

    if (!existingUserGroup) {
      await this.prisma.userGroup.create({
        data: {
          user_id: BigInt(userId),
          group_id: BigInt(groupId),
          joined_at: new Date(),
        },
      });
    }

    // Gán role cho user trong group
    const existingAssignment = await this.prisma.userRoleAssignment.findFirst({
      where: { 
        user_id: BigInt(userId), 
        role_id: BigInt(roleId), 
        group_id: BigInt(groupId) 
      },
    });

    if (!existingAssignment) {
      await this.prisma.userRoleAssignment.create({
        data: {
          user_id: BigInt(userId),
          role_id: BigInt(roleId),
          group_id: BigInt(groupId),
        },
      });
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing users...');
    await this.prisma.user.deleteMany({});
    this.logger.log('Users cleared');
  }
}
