import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { UpdateEmailConfigDto } from '../dtos/update-email-config.dto';
import { PrismaService } from '@/core/database/prisma/prisma.service';

type EmailConfig = Prisma.EmailConfigGetPayload<{}>;

@Injectable()
export class EmailConfigService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Lấy cấu hình email (chỉ có 1 record duy nhất)
   * Nếu chưa có thì tạo mặc định
   * Không trả về password (hoặc trả về masked)
   */
  async getConfig(): Promise<Omit<EmailConfig, 'smtp_password'> & { smtp_password?: string }> {
    const prisma = this.prisma as any;
    let config = await prisma.emailConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    if (!config) {
      // Tạo config mặc định
      config = await prisma.emailConfig.create({
        data: {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_secure: true,
          smtp_username: '',
          smtp_password: '',
          from_email: '',
          from_name: '',
        },
      });
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
    const prisma = this.prisma as any;
    const existing = await prisma.emailConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    const updateData: any = { ...dto };

    // Nếu có password mới, hash nó
    if (dto.smtp_password) {
      updateData.smtp_password = await bcrypt.hash(dto.smtp_password, 10);
    } else if (existing) {
      // Nếu không gửi password, giữ nguyên password cũ
      delete (updateData as any).smtp_password;
    }

    if (!existing) {
      // Tạo mới với giá trị mặc định + dto
      const defaultPassword = dto.smtp_password ? updateData.smtp_password : await bcrypt.hash('', 10);
      const newConfig = await prisma.emailConfig.create({
        data: {
          smtp_host: dto.smtp_host || 'smtp.gmail.com',
          smtp_port: dto.smtp_port || 587,
          smtp_secure: dto.smtp_secure !== undefined ? dto.smtp_secure : true,
          smtp_username: dto.smtp_username || '',
          smtp_password: defaultPassword as string,
          from_email: dto.from_email || '',
          from_name: dto.from_name || '',
          reply_to_email: dto.reply_to_email ?? null,
          created_user_id: updatedBy ?? null,
          updated_user_id: updatedBy ?? null,
        },
      });

      const { smtp_password, ...rest } = newConfig;
      return {
        ...rest,
        smtp_password: '******',
      };
    }

    // Update record hiện có
    const updatedConfig = await prisma.emailConfig.update({
      where: { id: existing.id },
      data: {
        smtp_host: updateData.smtp_host ?? existing.smtp_host,
        smtp_port: updateData.smtp_port ?? existing.smtp_port,
        smtp_secure: updateData.smtp_secure ?? existing.smtp_secure,
        smtp_username: updateData.smtp_username ?? existing.smtp_username,
        smtp_password: (updateData as any).smtp_password ?? existing.smtp_password,
        from_email: updateData.from_email ?? existing.from_email,
        from_name: updateData.from_name ?? existing.from_name,
        reply_to_email: updateData.reply_to_email ?? existing.reply_to_email,
        updated_user_id: updatedBy ?? existing.updated_user_id,
      },
    });
    const { smtp_password, ...rest } = updatedConfig;
    return {
      ...rest,
      smtp_password: '******',
    };
  }
}
