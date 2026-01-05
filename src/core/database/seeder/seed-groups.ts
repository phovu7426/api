import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedGroups {
  private readonly logger = new Logger(SeedGroups.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding groups and contexts...');

    // Get system context (id=1)
    let systemContext = await this.prisma.context.findUnique({
      where: { id: BigInt(1) },
    });
    if (!systemContext || systemContext.deleted_at) {
      // Create system context if not exists
      systemContext = await this.prisma.context.create({
        data: {
          type: 'system',
          ref_id: null,
          name: 'System',
          code: 'system',
          status: 'active',
        },
      });
      this.logger.log('Created system context');
    }

    // Get admin user để làm owner
    const adminUser = await this.prisma.user.findFirst({
      where: { username: 'systemadmin', deleted_at: null },
    });
    const defaultOwnerId = adminUser ? adminUser.id : BigInt(1);

    // ========== 1. SYSTEM CONTEXT - 1 GROUP: system ==========
    // Tìm group với code 'system' trước (ưu tiên)
    let systemGroup = await this.prisma.group.findFirst({
      where: { code: 'system', deleted_at: null },
    });
    
    if (systemGroup) {
      // Đã có group với code 'system', update owner và context nếu cần
      let needUpdate = false;
      const updateData: any = {};
      if (Number(systemGroup.owner_id) !== Number(defaultOwnerId)) {
        updateData.owner_id = defaultOwnerId;
        needUpdate = true;
      }
      if (Number(systemGroup.context_id) !== Number(systemContext.id)) {
        updateData.context_id = systemContext.id;
        needUpdate = true;
      }
      if (needUpdate) {
        systemGroup = await this.prisma.group.update({
          where: { id: systemGroup.id },
          data: updateData,
        });
      }
      this.logger.log(`✅ Found existing system group: ${systemGroup.name} (code: ${systemGroup.code})`);
    } else {
      // Không có group với code 'system', tìm group khác trong system context
      const existingSystemGroups = await this.prisma.group.findMany({
        where: {
          context_id: systemContext.id,
          type: 'system',
          deleted_at: null,
        },
      });
      
      if (existingSystemGroups.length > 0) {
        // Có group khác trong system context, update code của group đầu tiên thành 'system'
        systemGroup = existingSystemGroups[0];
        // Tạm thời đổi code của group cũ để tránh conflict
        const oldCode = systemGroup.code;
        systemGroup = await this.prisma.group.update({
          where: { id: systemGroup.id },
          data: { code: `system_old_${Date.now()}` },
        });
        
        // Xóa các groups còn lại (trừ group đầu tiên)
        if (existingSystemGroups.length > 1) {
          for (let i = 1; i < existingSystemGroups.length; i++) {
            await this.prisma.group.delete({
              where: { id: existingSystemGroups[i].id },
            });
            this.logger.log(`🗑️ Removed duplicate system group: ${existingSystemGroups[i].code}`);
          }
        }
        
        // Update code về 'system'
        systemGroup = await this.prisma.group.update({
          where: { id: systemGroup.id },
          data: {
            code: 'system',
            owner_id: defaultOwnerId,
          },
        });
        this.logger.log(`✅ Updated system group code from '${oldCode}' to 'system'`);
      } else {
        // Không có group nào trong system context, tạo mới
        systemGroup = await this.prisma.group.create({
          data: {
            type: 'system',
            code: 'system',
            name: 'System Group',
            status: 'active',
            context_id: systemContext.id,
            owner_id: defaultOwnerId,
          },
        });
        this.logger.log(`✅ Created system group: ${systemGroup.name} (code: ${systemGroup.code})`);
      }
    }

    // ========== 2. SHOP CONTEXT - 3 GROUPS: shop1, shop2, shop3 ==========
    let shopContext = await this.prisma.context.findFirst({
      where: { code: 'shop', deleted_at: null },
    });
    if (!shopContext) {
      shopContext = await this.prisma.context.create({
        data: {
          type: 'shop',
          ref_id: null,
          name: 'Shop Context',
          code: 'shop',
          status: 'active',
        },
      });
      this.logger.log(`✅ Created shop context: ${shopContext.name}`);
    } else {
      this.logger.log(`✅ Found existing shop context: ${shopContext.name}`);
    }

    const shopGroups = [
      { code: 'shop1', name: 'Shop 1' },
      { code: 'shop2', name: 'Shop 2' },
      { code: 'shop3', name: 'Shop 3' },
    ];

    const createdShopGroups: any[] = [];
    for (const shopData of shopGroups) {
      let shopGroup = await this.prisma.group.findFirst({
        where: { code: shopData.code, context_id: shopContext.id, deleted_at: null },
      });
      if (!shopGroup) {
        shopGroup = await this.prisma.group.create({
          data: {
            type: 'shop',
            code: shopData.code,
            name: shopData.name,
            status: 'active',
            context_id: shopContext.id,
            owner_id: defaultOwnerId,
          },
        });
        this.logger.log(`✅ Created shop group: ${shopGroup.name} (code: ${shopGroup.code})`);
      } else {
        this.logger.log(`✅ Found existing shop group: ${shopGroup.name} (code: ${shopGroup.code})`);
      }
      createdShopGroups.push(shopGroup);
    }

    // Update shop context ref_id to first shop group
    if (!shopContext.ref_id || Number(shopContext.ref_id) !== Number(createdShopGroups[0].id)) {
      await this.prisma.context.update({
        where: { id: shopContext.id },
        data: { ref_id: createdShopGroups[0].id },
      });
    }

    this.logger.log(`✅ Groups seeding completed!`);
    this.logger.log(`   📊 Statistics:`);
    this.logger.log(`   - System context: 1 group`);
    this.logger.log(`   - Shop context: ${createdShopGroups.length} groups`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing groups...');

    // Xóa contexts trước (vì có foreign key)
    await this.prisma.context.deleteMany({
      where: {
        type: { not: 'system' },
      },
    });

    await this.prisma.group.deleteMany({});
    this.logger.log('Groups cleared');
  }
}
