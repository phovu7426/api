import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageStrategy } from '../strategies/local-storage.strategy';
import { S3StorageStrategy } from '../strategies/s3-storage.strategy';
import { UploadResult } from '../interfaces/upload-strategy.interface';

@Injectable()
export class UploadService {
  private strategy: LocalStorageStrategy | S3StorageStrategy;

  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageStrategy: LocalStorageStrategy,
    private readonly s3StorageStrategy: S3StorageStrategy,
  ) {
    // Chọn strategy dựa trên config
    const storageType = this.configService.get<string>('storage.type', 'local');
    this.strategy = storageType === 's3' ? this.s3StorageStrategy : this.localStorageStrategy;
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new Error('File is required');
    }

    return this.strategy.upload(file);
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new Error('Files are required');
    }

    return Promise.all(files.map(file => this.strategy.upload(file)));
  }
}

