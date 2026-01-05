import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { EmailConfig } from '@/shared/entities/email-config.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { UpdateEmailConfigDto } from '../dtos/update-email-config.dto';

@Injectable()
export class EmailConfigService extends CrudService<EmailConfig> {
  constructor(
    @InjectRepository(EmailConfig)
    protected readonly emailConfigRepository: Repository<EmailConfig>,
  ) {
    super(emailConfigRepository);
  }

  /**
   * Lấy cấu hình email (chỉ có 1 record duy nhất)
   * Nếu chưa có thì tạo mặc định
   * Không trả về password (hoặc trả về masked)
   */
  async getConfig(): Promise<Omit<EmailConfig, 'smtp_password'> & { smtp_password?: string }> {
    let config = await this.emailConfigRepository.findOne({
      where: {} as any,
      order: { id: 'ASC' },
    });

    if (!config) {
      // Tạo config mặc định
      const created = await this.create({
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: true,
        smtp_username: '',
        smtp_password: '',
        from_email: '',
        from_name: '',
      } as DeepPartial<EmailConfig>);
      config = created as EmailConfig;
    }

    // Trả về config nhưng mask password
    const { smtp_password, ...rest } = config;
    return {
      ...rest,
      smtp_password: smtp_password ? '******' : undefined,
    };
  }

  /**
   * Cập nhật cấu hình email
   * Nếu chưa có thì tạo mới, nếu có thì update
   * Password sẽ được hash trước khi lưu
   * Nếu không gửi password thì giữ nguyên password cũ
   */
  async updateConfig(dto: UpdateEmailConfigDto, updatedBy?: number): Promise<Omit<EmailConfig, 'smtp_password'> & { smtp_password?: string }> {
    const existing = await this.emailConfigRepository.findOne({
      where: {} as any,
      order: { id: 'ASC' },
    });

    const updateData: DeepPartial<EmailConfig> = { ...dto };

    // Nếu có password mới, hash nó
    if (dto.smtp_password) {
      updateData.smtp_password = await bcrypt.hash(dto.smtp_password, 10);
    } else if (existing) {
      // Nếu không gửi password, giữ nguyên password cũ
      delete (updateData as any).smtp_password;
    }

    if (!existing) {
      // Tạo mới với giá trị mặc định + dto
      // Nếu không có password trong dto, tạo password mặc định (rỗng, sẽ được hash)
      const defaultPassword = dto.smtp_password ? updateData.smtp_password : await bcrypt.hash('', 10);
      const created = await this.create({
        smtp_host: dto.smtp_host || 'smtp.gmail.com',
        smtp_port: dto.smtp_port || 587,
        smtp_secure: dto.smtp_secure !== undefined ? dto.smtp_secure : true,
        smtp_username: dto.smtp_username || '',
        smtp_password: defaultPassword,
        from_email: dto.from_email || '',
        from_name: dto.from_name || '',
        reply_to_email: dto.reply_to_email,
      } as DeepPartial<EmailConfig>, updatedBy);
      const newConfig = created as EmailConfig;

      const { smtp_password, ...rest } = newConfig;
      return {
        ...rest,
        smtp_password: '******',
      };
    }

    // Update record hiện có
    const updated = await this.update(existing.id, updateData, updatedBy);
    const updatedConfig = updated as EmailConfig;
    const { smtp_password, ...rest } = updatedConfig;
    return {
      ...rest,
      smtp_password: '******',
    };
  }
}
