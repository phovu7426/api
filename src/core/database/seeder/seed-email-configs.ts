import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { EmailConfig } from '@/shared/entities/email-config.entity';
import { User } from '@/shared/entities/user.entity';

@Injectable()
export class SeedEmailConfigs {
  private readonly logger = new Logger(SeedEmailConfigs.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding email configs...');

    const emailConfigRepository = this.dataSource.getRepository(EmailConfig);
    const userRepo = this.dataSource.getRepository(User);

    // Check if email config already exist
    const existing = await emailConfigRepository.findOne({
      where: {} as any,
      order: { id: 'ASC' },
    });

    if (existing) {
      this.logger.log('Email config already exists. Skipping seeding.');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Hash default password
    const defaultPassword = await bcrypt.hash('default_password', 10);

    const emailConfig = emailConfigRepository.create({
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_secure: true,
      smtp_username: 'your-email@gmail.com',
      smtp_password: defaultPassword,
      from_email: 'noreply@example.com',
      from_name: 'My Website',
      reply_to_email: 'contact@example.com',
      created_user_id: defaultUserId,
      updated_user_id: defaultUserId,
    });

    await emailConfigRepository.save(emailConfig);
    this.logger.log('Email config seeding completed.');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing email configs...');
    await this.dataSource.getRepository(EmailConfig).clear();
  }
}
