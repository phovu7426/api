import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EmailConfig } from '@/shared/entities/email-config.entity';
import { CacheService } from '@/common/services/cache.service';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface BulkMailItem {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface BulkMailOptions {
  emails: Array<BulkMailItem>;
  parallel?: boolean; // Gửi song song hay tuần tự, mặc định true
}

@Injectable()
export class MailService {
  private readonly CACHE_KEY = 'mail:active-config';
  private readonly CACHE_TTL = 600; // 10 minutes
  private transporterCache: Transporter | null = null;
  private configCache: EmailConfig | null = null;

  constructor(
    @InjectRepository(EmailConfig)
    private readonly emailConfigRepository: Repository<EmailConfig>,
    private readonly cacheService: CacheService,
  ) {}

  private async getActiveConfig(): Promise<EmailConfig> {
    if (this.configCache) {
      return this.configCache;
    }

    const config = await this.cacheService.getOrSet<EmailConfig>(
      this.CACHE_KEY,
      async () => {
        const configData = await this.emailConfigRepository.findOne({
          where: {} as any,
          order: { id: 'ASC' },
        });

        if (!configData) {
          throw new InternalServerErrorException('Email configuration not found. Please configure email in system config.');
        }

        return configData;
      },
      this.CACHE_TTL,
    );

    this.configCache = config;
    return config;
  }

  private async getTransporter(): Promise<Transporter> {
    if (this.transporterCache) {
      return this.transporterCache;
    }

    const config = await this.getActiveConfig();

    // Sử dụng connection pooling để tối ưu hiệu năng khi gửi nhiều email
    this.transporterCache = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure,
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password,
      },
      pool: true, // Bật connection pooling để tái sử dụng kết nối
    });

    return this.transporterCache;
  }

  /**
   * Xóa cache của config và transporter
   * Gọi method này khi config email bị thay đổi
   */
  async clearConfigCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEY);
    this.configCache = null;
    this.transporterCache = null;
  }

  async send(options: SendMailOptions): Promise<void> {
    if (!options.html && !options.text) {
      throw new InternalServerErrorException('Either html or text content must be provided when sending email.');
    }

    const config = await this.getActiveConfig();
    const transporter = await this.getTransporter();

    await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: config.reply_to_email || undefined,
    });
  }

  /**
   * Gửi nhiều email cùng lúc
   * - Gửi ngầm (background): dùng parallel=true để gửi số lượng lớn
   * - Gửi trực tiếp (synchronous): số lượng ít, có thể dùng parallel=false để gửi tuần tự
   * @param options - Bulk mail options với danh sách emails và chế độ gửi
   * @returns Promise với kết quả gửi email (success count, failed count, errors)
   */
  async sendBulk(options: BulkMailOptions): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; email: string; error: string }>;
  }> {
    if (!options.emails || options.emails.length === 0) {
      throw new InternalServerErrorException('Email list cannot be empty.');
    }

    // Validate tất cả emails trước
    for (let i = 0; i < options.emails.length; i++) {
      const email = options.emails[i];
      if (!email.html && !email.text) {
        throw new InternalServerErrorException(`Email at index ${i} must have either html or text content.`);
      }
    }

    const config = await this.getActiveConfig();
    const transporter = await this.getTransporter();
    const parallel = options.parallel !== false; // Mặc định là true

    const errors: Array<{ index: number; email: string; error: string }> = [];
    let success = 0;
    let failed = 0;

    const sendEmail = async (
      emailOptions: BulkMailItem,
      index: number,
    ): Promise<void> => {
      try {
        await transporter.sendMail({
          from: `"${config.from_name}" <${config.from_email}>`,
          to: emailOptions.to,
          subject: emailOptions.subject,
          html: emailOptions.html,
          text: emailOptions.text,
          cc: emailOptions.cc,
          bcc: emailOptions.bcc,
          replyTo: config.reply_to_email || undefined,
        });

        success++;
      } catch (error) {
        failed++;
        const toStr = Array.isArray(emailOptions.to)
          ? emailOptions.to.join(', ')
          : emailOptions.to;
        errors.push({
          index,
          email: toStr,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    if (parallel) {
      // Gửi song song tất cả cùng lúc (dùng cho gửi ngầm số lượng lớn)
      await Promise.allSettled(
        options.emails.map((email, index) => sendEmail(email, index)),
      );
    } else {
      // Gửi tuần tự (dùng cho gửi trực tiếp số lượng ít)
      for (let i = 0; i < options.emails.length; i++) {
        await sendEmail(options.emails[i], i);
      }
    }

    return { success, failed, errors };
  }
}

