import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
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
  private configCache: any | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  private async getActiveConfig(): Promise<any> {
    if (this.configCache) {
      return this.configCache;
    }

    const config = await this.cacheService.getOrSet<any>(
      this.CACHE_KEY,
      async () => {
        const configData = await this.prisma.emailConfig.findFirst({
          orderBy: { id: 'asc' },
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

  /**
   * Gửi email đơn lẻ
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    const transporter = await this.getTransporter();
    const config = await this.getActiveConfig();

    await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
      replyTo: config.reply_to_email || config.from_email,
    });
  }

  /**
   * Gửi nhiều email cùng lúc (bulk)
   * @param options - Options chứa mảng emails và flag parallel
   */
  async sendBulkMail(options: BulkMailOptions): Promise<void> {
    const transporter = await this.getTransporter();
    const config = await this.getActiveConfig();
    const parallel = options.parallel !== false; // Mặc định true

    const sendPromises = options.emails.map((email) => {
      return transporter.sendMail({
        from: `"${config.from_name}" <${config.from_email}>`,
        to: Array.isArray(email.to) ? email.to.join(', ') : email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        cc: email.cc ? (Array.isArray(email.cc) ? email.cc.join(', ') : email.cc) : undefined,
        bcc: email.bcc ? (Array.isArray(email.bcc) ? email.bcc.join(', ') : email.bcc) : undefined,
        replyTo: config.reply_to_email || config.from_email,
      });
    });

    if (parallel) {
      // Gửi song song
      await Promise.all(sendPromises);
    } else {
      // Gửi tuần tự
      for (const promise of sendPromises) {
        await promise;
      }
    }
  }
}
