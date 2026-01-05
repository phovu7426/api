import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { performance } from 'perf_hooks';
import { RequestContext } from '@/common/utils/request-context.util';
import { Auth } from '@/common/utils/auth.util';
import { DateUtil } from '@/core/utils/date.util';

import { LogContext } from '@/core/logger/interfaces/log-context.interface';

export interface LogWriteOptions {
  /** Absolute or relative file path. If provided, write to this exact file. */
  filePath?: string;
  /** Custom base name; final file becomes <base>.<YYYY-MM-DD>.log if filePath is not provided */
  fileBaseName?: string;
}

export class CheckpointTracker {
  private readonly startTimeMs: number;
  private readonly checkpoints: Record<string, number> = {};

  constructor() {
    this.startTimeMs = performance.now();
  }

  addCheckpoint(key: string): void {
    const now = performance.now();
    this.checkpoints[key] = Math.round(now - this.startTimeMs);
  }

  toLogDetails(): Record<string, number> {
    return { ...this.checkpoints };
  }
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logDirectory: string;
  private static _instance: CustomLoggerService | undefined;
  private readonly timezone: string;

  constructor(private readonly configService: ConfigService) {
    this.logDirectory = this.configService.get('LOG_DIR') || './logs';
    this.timezone = this.configService.get('app.timezone') || process.env.APP_TIMEZONE || 'Asia/Ho_Chi_Minh';
    this.ensureLogDirectory();
    // Expose singleton-like instance for static helpers
    CustomLoggerService._instance = this;
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  // Minimal API: build structured entry then write

  private buildLogEntry(level: LogLevel, message: any, context?: LogContext & { trace?: string }) {
    const environment = this.configService.get('app.environment') || this.configService.get('NODE_ENV') || process.env.NODE_ENV || 'development';
    const appName = this.configService.get('app.name') || 'NestJS App';
    const appVersion = this.configService.get('app.version') || '1.0.0';
    return {
      timestamp: DateUtil.formatTimestamp(),
      level: level.toUpperCase(),
      message,
      context: context?.context || 'Application',
      account: {
        userId: context?.userId,
        username: context?.username,
      },
      api: {
        method: context?.method,
        url: context?.url,
        requestId: context?.requestId,
      },
      device: {
        ip: context?.ip,
        userAgent: context?.userAgent,
      },
      server: {
        hostname: os.hostname(),
        pid: process.pid,
        environment,
        appName,
        appVersion,
      },
      trace: context?.trace,
      extra: context?.extra || {},
    };
  }

  private extractErrorInfo(message: any, trace?: string): { errorMessage?: string; stackTrace?: string } | undefined {
    if (message instanceof Error) {
      return {
        errorMessage: message.message,
        stackTrace: message.stack,
      };
    }
    if (trace) {
      return {
        errorMessage: typeof message === 'string' ? message : undefined,
        stackTrace: trace,
      };
    }
    return undefined;
  }

  private writeJsonToFiles(level: LogLevel, entry: any, options?: LogWriteOptions): void {
    const line = JSON.stringify(entry);
    const date = DateUtil.formatDate(undefined, 'Y-m-d'); // YYYY-MM-DD in configured timezone

    // Use per-day subdirectory: logs/YYYY-MM-DD/
    const dailyDir = path.join(this.logDirectory, date);
    if (!fs.existsSync(dailyDir)) {
      fs.mkdirSync(dailyDir, { recursive: true });
    }

    if (options?.filePath) {
      const dir = path.dirname(options.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(options.filePath, line + '\n', { encoding: 'utf8' });
      return;
    }

    const base = options?.fileBaseName;
    if (base) {
      const customPath = path.join(dailyDir, `${base}.log`);
      fs.appendFileSync(customPath, line + '\n', { encoding: 'utf8' });
    }

    const levelFilePath = path.join(dailyDir, `${level}.log`);
    fs.appendFileSync(levelFilePath, line + '\n', { encoding: 'utf8' });

    const appDailyPath = path.join(dailyDir, `app.log`);
    fs.appendFileSync(appDailyPath, line + '\n', { encoding: 'utf8' });
  }

  /**
   * Generic structured log with metadata and optional custom file path.
   */
  public write(level: LogLevel, message: any, context?: LogContext, options?: LogWriteOptions): void {
    const mergedContext = { ...this.getDefaultContext(), ...(context || {}) };
    const entry = this.buildLogEntry(level, message, mergedContext);
    this.writeJsonToFiles(level, entry, options);
  }

  /**
   * Create a new checkpoint tracker to record step timings.
   */
  public createTracker(): CheckpointTracker {
    return new CheckpointTracker();
  }

  log(message: any, context?: LogContext, options?: LogWriteOptions): void {
    const mergedContext = { ...this.getDefaultContext(), ...(context || {}) };
    const entry = this.buildLogEntry('log', message, mergedContext);
    this.writeJsonToFiles('log', entry, options);
  }

  error(message: any, trace?: string, context?: LogContext, options?: LogWriteOptions): void {
    const mergedContext = { ...this.getDefaultContext(), ...(context || {}), trace };
    const entry = this.buildLogEntry('error', message, mergedContext);
    const errInfo = this.extractErrorInfo(message, trace);
    if (errInfo) {
      entry.extra = { ...(entry.extra || {}), error: errInfo };
    }
    this.writeJsonToFiles('error', entry, options);
  }

  warn(message: any, context?: LogContext, options?: LogWriteOptions): void {
    const mergedContext = { ...this.getDefaultContext(), ...(context || {}) };
    const entry = this.buildLogEntry('warn', message, mergedContext);
    this.writeJsonToFiles('warn', entry, options);
  }

  private getDefaultContext(): LogContext {
    return {
      context: 'Application',
      userId: Auth.id(),
      requestId: RequestContext.get('requestId') as string,
      method: RequestContext.get('method') as string,
      url: RequestContext.get('url') as string,
      ip: RequestContext.get('ip') as string,
      userAgent: RequestContext.get('userAgent') as string,
    };
  }
}

// Static helper methods to allow logging without DI
export namespace CustomLoggerService {
  export function instance(): CustomLoggerService | undefined {
    return (CustomLoggerService as any)._instance as CustomLoggerService | undefined;
  }

  // Cực giản: chỉ extra và filePath; mặc định level = 'log', message từ extra.message hoặc 'LOG'
  export function write(extra?: Record<string, any>, filePath?: string): void {
    const level: LogLevel = 'log';
    const message = extra && typeof extra.message !== 'undefined' ? extra.message : 'LOG';
    const inst = instance();
    if (inst) return inst.write(level, message, extra ? { extra } : undefined, filePath ? { filePath } : undefined);
    // Fallback if instance not ready
    // Removed console.log for production
  }
}
