import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '@/shared/entities/user.entity';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { Context } from '@/shared/entities/context.entity';
import { Group } from '@/shared/entities/group.entity';
import { UserGroup } from '@/shared/entities/user-group.entity';
import { UserRoleAssignment } from '@/shared/entities/user-role-assignment.entity';
import { UserStatus } from '@/shared/enums/user-status.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedUsers {
  private readonly logger = new Logger(SeedUsers.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding users...');

    const userRepo = this.dataSource.getRepository(User);
    const roleRepo = this.dataSource.getRepository(Role);
    const contextRepo = this.dataSource.getRepository(Context);
    const groupRepo = this.dataSource.getRepository(Group);
    const userGroupRepo = this.dataSource.getRepository(UserGroup);
    const userRoleAssignmentRepo = this.dataSource.getRepository(UserRoleAssignment);
    const permRepo = this.dataSource.getRepository(Permission);

    // Check xem các users cần thiết đã tồn tại chưa
    const systemAdminExists = await userRepo.findOne({ where: { email: 'systemadmin@example.com' } as any });
    const systemUserExists = await userRepo.findOne({ where: { email: 'systemuser@example.com' } as any });
    const shopAdminExists = await userRepo.findOne({ where: { email: 'shopadmin@example.com' } as any });
    const shopUserExists = await userRepo.findOne({ where: { email: 'shopuser@example.com' } as any });
    const comicAdminExists = await userRepo.findOne({ where: { email: 'comicadmin@example.com' } as any });
    const comicUserExists = await userRepo.findOne({ where: { email: 'comicuser@example.com' } as any });

    // Nếu tất cả users đã tồn tại thì skip (production-safe)
    if (systemAdminExists && systemUserExists && shopAdminExists && shopUserExists && comicAdminExists && comicUserExists) {
      this.logger.log('All required users already exist, skip seeding (production-safe)');
      return;
    }

    // Get system context (id=1) và system group
    let systemContext = await contextRepo.findOne({ where: { id: 1 } });
    if (!systemContext) {
      systemContext = contextRepo.create({
        id: 1,
        type: 'system',
        ref_id: null,
        name: 'System',
        code: 'system',
        status: 'active',
      });
      systemContext = await contextRepo.save(systemContext);
    }

    // Get hoặc tạo system group nếu chưa có
    let systemGroup = await groupRepo.findOne({ where: { code: 'system' } });
    if (!systemGroup) {
      // Tạo system group nếu chưa có
      systemGroup = groupRepo.create({
        type: 'system',
        code: 'system',
        name: 'System Group',
        status: 'active',
        context_id: systemContext.id,
        owner_id: 1, // Tạm thời, sẽ update sau khi có user
      });
      systemGroup = await groupRepo.save(systemGroup);
      this.logger.log('Created system group in seed-users');
    }

    // Get shop context và shop1 group
    const shopContext = await contextRepo.findOne({ where: { code: 'shop' } });
    const shop1Group = shopContext ? await groupRepo.findOne({ where: { code: 'shop1', context_id: shopContext.id } }) : null;

    // Get comic context và first comic group
    const comicContext = await contextRepo.findOne({ where: { code: 'comic' } });
    const comic1Group = comicContext ? await groupRepo.findOne({ where: { code: 'truyen1', context_id: comicContext.id } }) : null;

    // Get roles
    const systemRole = await roleRepo.findOne({ where: { code: 'system' } as any });
    const systemManagerRole = await roleRepo.findOne({ where: { code: 'system_manager' } as any });
    const shopAdminRole = await roleRepo.findOne({ where: { code: 'shop_admin' } as any });
    const shopManagerRole = await roleRepo.findOne({ where: { code: 'shop_manager' } as any });
    const comicAdminRole = await roleRepo.findOne({ where: { code: 'comic_admin' } as any });
    const comicManagerRole = await roleRepo.findOne({ where: { code: 'comic_manager' } as any });

    // Get all permissions (cần để tạo custom roles)
    const allPermissions = await permRepo.find({ where: { status: 'active' } as any });

    // Seed users
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // ========== SYSTEM GROUP USERS ==========
    // 1. systemadmin: full quyền
    let savedSystemAdmin = systemAdminExists;
    if (!savedSystemAdmin) {
      const systemAdminUser = userRepo.create({
        username: 'systemadmin',
        email: 'systemadmin@example.com',
        password: hashedPassword,
        status: UserStatus.Active,
        email_verified_at: new Date(),
      });
      savedSystemAdmin = await userRepo.save(systemAdminUser);
    } else {
      // Update password nếu user đã tồn tại
      savedSystemAdmin.password = hashedPassword;
      savedSystemAdmin.status = UserStatus.Active;
      await userRepo.save(savedSystemAdmin);
      this.logger.log(`Updated existing systemadmin user password`);
    }

    // Update system group owner nếu cần
    if (systemGroup && systemGroup.owner_id !== savedSystemAdmin.id) {
      systemGroup.owner_id = savedSystemAdmin.id;
      await groupRepo.save(systemGroup);
    }

    // Thêm vào system group và gán system role
    if (systemGroup && systemRole) {
      await this.assignUserToGroup(savedSystemAdmin.id, systemGroup.id, systemRole.id, userGroupRepo, userRoleAssignmentRepo);
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
      const systemUser = userRepo.create({
        username: 'systemuser',
        email: 'systemuser@example.com',
        password: hashedPassword,
        status: UserStatus.Active,
        email_verified_at: new Date(),
      });
      savedSystemUser = await userRepo.save(systemUser);
      this.logger.log(`✅ Created systemuser user`);
    } else {
      savedSystemUser.password = hashedPassword;
      savedSystemUser.status = UserStatus.Active;
      await userRepo.save(savedSystemUser);
      this.logger.log(`✅ Updated existing systemuser password`);
    }

    // Gán system_manager role cho systemuser
    if (systemGroup && systemManagerRole) {
      await this.assignUserToGroup(savedSystemUser.id, systemGroup.id, systemManagerRole.id, userGroupRepo, userRoleAssignmentRepo);
      this.logger.log(`✅ Assigned systemuser to system group with system_manager role (full quyền trừ phân quyền, vai trò, quyền)`);
    }

    // ========== SHOP1 GROUP USERS ==========
    if (shop1Group && shopAdminRole) {
      // 1. shopadmin: shop admin full quyền của context (trừ vai trò, quyền, phân quyền, hệ thống, payment, shipping)
      let savedShopAdmin = shopAdminExists;
      if (!savedShopAdmin) {
        const shopAdminUser = userRepo.create({
          username: 'shopadmin',
          email: 'shopadmin@example.com',
          password: hashedPassword,
          status: UserStatus.Active,
          email_verified_at: new Date(),
        });
        savedShopAdmin = await userRepo.save(shopAdminUser);
        this.logger.log(`✅ Created shopadmin user (shop admin full quyền)`);
      } else {
        savedShopAdmin.password = hashedPassword;
        savedShopAdmin.status = UserStatus.Active;
        await userRepo.save(savedShopAdmin);
        this.logger.log(`✅ Updated existing shopadmin password`);
      }
      
      await this.assignUserToGroup(savedShopAdmin.id, shop1Group.id, shopAdminRole.id, userGroupRepo, userRoleAssignmentRepo);
      this.logger.log(`✅ Assigned shopadmin to shop1 group with shop_admin role (có user.manage)`);

      // 2. shopuser: shop manager (giống shop_admin trừ user.manage)
      let savedShopUser = shopUserExists;
      if (!savedShopUser) {
        const shopUser = userRepo.create({
          username: 'shopuser',
          email: 'shopuser@example.com',
          password: hashedPassword,
          status: UserStatus.Active,
          email_verified_at: new Date(),
        });
        savedShopUser = await userRepo.save(shopUser);
        this.logger.log(`✅ Created shopuser user`);
      } else {
        savedShopUser.password = hashedPassword;
        savedShopUser.status = UserStatus.Active;
        await userRepo.save(savedShopUser);
        this.logger.log(`✅ Updated existing shopuser password`);
      }

      if (shopManagerRole) {
        await this.assignUserToGroup(savedShopUser.id, shop1Group.id, shopManagerRole.id, userGroupRepo, userRoleAssignmentRepo);
        this.logger.log(`✅ Assigned shopuser to shop1 group with shop_manager role (trừ user.manage)`);
      }
    }

    // ========== COMIC CONTEXT USERS (tương tự shop) ==========
    if (comic1Group && comicAdminRole) {
      // 1. comicadmin: comic admin full quyền của context (trừ vai trò, quyền, phân quyền, hệ thống, payment, shipping)
      let savedComicAdmin = comicAdminExists;
      if (!savedComicAdmin) {
        const comicAdminUser = userRepo.create({
          username: 'comicadmin',
          email: 'comicadmin@example.com',
          password: hashedPassword,
          status: UserStatus.Active,
          email_verified_at: new Date(),
        });
        savedComicAdmin = await userRepo.save(comicAdminUser);
        this.logger.log(`✅ Created comicadmin user (comic admin full quyền)`);
      } else {
        savedComicAdmin.password = hashedPassword;
        savedComicAdmin.status = UserStatus.Active;
        await userRepo.save(savedComicAdmin);
        this.logger.log(`✅ Updated existing comicadmin password`);
      }
      
      await this.assignUserToGroup(savedComicAdmin.id, comic1Group.id, comicAdminRole.id, userGroupRepo, userRoleAssignmentRepo);
      this.logger.log(`✅ Assigned comicadmin to truyện1 group with comic_admin role (có user.manage)`);

      // 2. comicuser: comic manager (giống comic_admin trừ user.manage)
      let savedComicUser = comicUserExists;
      if (!savedComicUser) {
        const comicUser = userRepo.create({
          username: 'comicuser',
          email: 'comicuser@example.com',
          password: hashedPassword,
          status: UserStatus.Active,
          email_verified_at: new Date(),
        });
        savedComicUser = await userRepo.save(comicUser);
        this.logger.log(`✅ Created comicuser user`);
      } else {
        savedComicUser.password = hashedPassword;
        savedComicUser.status = UserStatus.Active;
        await userRepo.save(savedComicUser);
        this.logger.log(`✅ Updated existing comicuser password`);
      }

      if (comicManagerRole) {
        await this.assignUserToGroup(savedComicUser.id, comic1Group.id, comicManagerRole.id, userGroupRepo, userRoleAssignmentRepo);
        this.logger.log(`✅ Assigned comicuser to truyện1 group with comic_manager role (trừ user.manage)`);
      }
    }

    this.logger.log(`✅ Users seeding completed`);
  }

  private async assignUserToGroup(
    userId: number,
    groupId: number,
    roleId: number,
    userGroupRepo: any,
    userRoleAssignmentRepo: any,
  ): Promise<void> {
    // Thêm user vào group
        const existingUserGroup = await userGroupRepo.findOne({
      where: { user_id: userId, group_id: groupId },
        });

        if (!existingUserGroup) {
          await userGroupRepo.save({
        user_id: userId,
        group_id: groupId,
            joined_at: new Date(),
          });
        }

        // Gán role cho user trong group
        const existingAssignment = await userRoleAssignmentRepo.findOne({
      where: { user_id: userId, role_id: roleId, group_id: groupId },
        });

        if (!existingAssignment) {
          await userRoleAssignmentRepo.save({
        user_id: userId,
        role_id: roleId,
        group_id: groupId,
      });
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing users...');
    const userRepo = this.dataSource.getRepository(User);
    await userRepo.clear();
    this.logger.log('Users cleared');
  }
}
