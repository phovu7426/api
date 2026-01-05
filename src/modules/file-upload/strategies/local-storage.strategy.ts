import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { IUploadStrategy, UploadResult } from '../interfaces/upload-strategy.interface';

@Injectable()
export class LocalStorageStrategy implements IUploadStrategy {
  private readonly destination: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const storageConfig = this.configService.get('storage.local');
    this.destination = storageConfig.destination;
    this.baseUrl = storageConfig.baseUrl;
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(this.destination)) {
      fs.mkdirSync(this.destination, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    // Tạo tên file unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${ext}`;
    
    // Đường dẫn đầy đủ để lưu file
    const filePath = path.join(this.destination, filename);
    
    // Lưu file
    fs.writeFileSync(filePath, file.buffer);
    
    // Tạo URL để truy cập file (đảm bảo baseUrl không có trailing slash)
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const url = `${baseUrl}/${filename}`;
    
    return {
      path: filePath,
      url,
      filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

