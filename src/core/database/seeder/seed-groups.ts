import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Group } from '@/shared/entities/group.entity';
import { Context } from '@/shared/entities/context.entity';
import { User } from '@/shared/entities/user.entity';

@Injectable()
export class SeedGroups {
  private readonly logger = new Logger(SeedGroups.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding groups and contexts...');

    const groupRepo = this.dataSource.getRepository(Group);
    const contextRepo = this.dataSource.getRepository(Context);

    // Get system context (id=1)
    let systemContext = await contextRepo.findOne({ where: { id: 1 } });
    if (!systemContext) {
      // Create system context if not exists
      systemContext = contextRepo.create({
        id: 1,
        type: 'system',
        ref_id: null,
        name: 'System',
        code: 'system',
        status: 'active',
      });
      systemContext = await contextRepo.save(systemContext);
      this.logger.log('Created system context');
    }

    // Get admin user để làm owner
    const adminUser = await this.dataSource.getRepository(User).findOne({
      where: { username: 'systemadmin' } as any,
    });
    const defaultOwnerId = adminUser?.id || 1;

    // ========== 1. SYSTEM CONTEXT - 1 GROUP: system ==========
    // Tìm group với code 'system' trước (ưu tiên)
    let systemGroup = await groupRepo.findOne({ 
      where: { code: 'system' } 
    });
    
    if (systemGroup) {
      // Đã có group với code 'system', update owner và context nếu cần
      let needUpdate = false;
      if (systemGroup.owner_id !== defaultOwnerId) {
        systemGroup.owner_id = defaultOwnerId;
        needUpdate = true;
      }
      if (systemGroup.context_id !== systemContext.id) {
        systemGroup.context_id = systemContext.id;
        needUpdate = true;
      }
      if (needUpdate) {
        systemGroup = await groupRepo.save(systemGroup);
      }
      this.logger.log(`✅ Found existing system group: ${systemGroup.name} (code: ${systemGroup.code})`);
    } else {
      // Không có group với code 'system', tìm group khác trong system context
      const existingSystemGroups = await groupRepo.find({ 
        where: { 
          context_id: systemContext.id,
          type: 'system'
        } 
      });
      
      if (existingSystemGroups.length > 0) {
        // Có group khác trong system context, update code của group đầu tiên thành 'system'
        systemGroup = existingSystemGroups[0];
        // Tạm thời đổi code của group cũ để tránh conflict
        const oldCode = systemGroup.code;
        systemGroup.code = `system_old_${Date.now()}`;
        await groupRepo.save(systemGroup);
        
        // Xóa các groups còn lại (trừ group đầu tiên)
        if (existingSystemGroups.length > 1) {
          for (let i = 1; i < existingSystemGroups.length; i++) {
            await groupRepo.remove(existingSystemGroups[i]);
            this.logger.log(`🗑️ Removed duplicate system group: ${existingSystemGroups[i].code}`);
          }
        }
        
        // Update code về 'system'
        systemGroup.code = 'system';
        systemGroup.owner_id = defaultOwnerId;
        systemGroup = await groupRepo.save(systemGroup);
        this.logger.log(`✅ Updated system group code from '${oldCode}' to 'system'`);
      } else {
        // Không có group nào trong system context, tạo mới
        systemGroup = groupRepo.create({
          type: 'system',
          code: 'system',
          name: 'System Group',
        status: 'active',
          context_id: systemContext.id,
        owner_id: defaultOwnerId,
        });
        systemGroup = await groupRepo.save(systemGroup);
        this.logger.log(`✅ Created system group: ${systemGroup.name} (code: ${systemGroup.code})`);
      }
    }

    // ========== 2. SHOP CONTEXT - 3 GROUPS: shop1, shop2, shop3 ==========
    let shopContext = await contextRepo.findOne({ where: { code: 'shop' } });
    if (!shopContext) {
      shopContext = contextRepo.create({
        type: 'shop',
        ref_id: null,
        name: 'Shop Context',
        code: 'shop',
        status: 'active',
      });
      shopContext = await contextRepo.save(shopContext);
      this.logger.log(`✅ Created shop context: ${shopContext.name}`);
    } else {
      this.logger.log(`✅ Found existing shop context: ${shopContext.name}`);
    }

    const shopGroups = [
      { code: 'shop1', name: 'Shop 1' },
      { code: 'shop2', name: 'Shop 2' },
      { code: 'shop3', name: 'Shop 3' },
    ];

    const createdShopGroups: Group[] = [];
    for (const shopData of shopGroups) {
      let shopGroup = await groupRepo.findOne({ 
        where: { code: shopData.code, context_id: shopContext.id } 
      });
      if (!shopGroup) {
        shopGroup = groupRepo.create({
          type: 'shop',
          code: shopData.code,
          name: shopData.name,
          status: 'active',
          context_id: shopContext.id,
          owner_id: defaultOwnerId,
        });
        shopGroup = await groupRepo.save(shopGroup);
        this.logger.log(`✅ Created shop group: ${shopGroup.name} (code: ${shopGroup.code})`);
      } else {
        this.logger.log(`✅ Found existing shop group: ${shopGroup.name} (code: ${shopGroup.code})`);
      }
      createdShopGroups.push(shopGroup);
    }

    // Update shop context ref_id to first shop group
    if (shopContext.ref_id !== createdShopGroups[0].id) {
      shopContext.ref_id = createdShopGroups[0].id;
      await contextRepo.save(shopContext);
    }

    // ========== 3. COMIC CONTEXT - 4 GROUPS: truyện 1, truyện 2, truyện 3, truyện 4 ==========
    let comicContext = await contextRepo.findOne({ where: { code: 'comic' } });
    if (!comicContext) {
      comicContext = contextRepo.create({
        type: 'comic',
        ref_id: null,
        name: 'Comic Context',
        code: 'comic',
        status: 'active',
      });
      comicContext = await contextRepo.save(comicContext);
      this.logger.log(`✅ Created comic context: ${comicContext.name}`);
    } else {
      this.logger.log(`✅ Found existing comic context: ${comicContext.name}`);
    }

    const comicGroups = [
      { code: 'truyen1', name: 'Truyện 1' },
      { code: 'truyen2', name: 'Truyện 2' },
      { code: 'truyen3', name: 'Truyện 3' },
      { code: 'truyen4', name: 'Truyện 4' },
    ];

    const createdComicGroups: Group[] = [];
    for (const comicData of comicGroups) {
      let comicGroup = await groupRepo.findOne({ 
        where: { code: comicData.code, context_id: comicContext.id } 
      });
      if (!comicGroup) {
        comicGroup = groupRepo.create({
          type: 'comic',
          code: comicData.code,
          name: comicData.name,
          status: 'active',
          context_id: comicContext.id,
          owner_id: defaultOwnerId,
        });
        comicGroup = await groupRepo.save(comicGroup);
        this.logger.log(`✅ Created comic group: ${comicGroup.name} (code: ${comicGroup.code})`);
      } else {
        this.logger.log(`✅ Found existing comic group: ${comicGroup.name} (code: ${comicGroup.code})`);
      }
      createdComicGroups.push(comicGroup);
    }

    // Update comic context ref_id to first comic group
    if (comicContext.ref_id !== createdComicGroups[0].id) {
      comicContext.ref_id = createdComicGroups[0].id;
      await contextRepo.save(comicContext);
    }

    this.logger.log(`✅ Groups seeding completed!`);
    this.logger.log(`   📊 Statistics:`);
    this.logger.log(`   - System context: 1 group`);
    this.logger.log(`   - Shop context: ${createdShopGroups.length} groups`);
    this.logger.log(`   - Comic context: ${createdComicGroups.length} groups`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing groups...');
    const groupRepo = this.dataSource.getRepository(Group);
    const contextRepo = this.dataSource.getRepository(Context);

    // Xóa contexts trước (vì có foreign key)
    await contextRepo
      .createQueryBuilder()
      .delete()
      .where('type != :type', { type: 'system' })
      .execute();

    await groupRepo.clear();
    this.logger.log('Groups cleared');
  }
}
