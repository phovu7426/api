import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import { IUploadStrategy, UploadResult } from '../interfaces/upload-strategy.interface';

@Injectable()
export class S3StorageStrategy implements IUploadStrategy {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const s3Config = this.configService.get('storage.s3');
    
    this.s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    });
    
    this.bucket = s3Config.bucket;
    this.baseUrl = s3Config.baseUrl || `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com`;
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    // Tạo tên file unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${ext}`;
    
    // Upload lên S3
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Cho phép public access
    });
    
    await this.s3Client.send(command);
    
    // Tạo URL để truy cập file (đảm bảo baseUrl không có trailing slash)
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const url = `${baseUrl}/${filename}`;
    
    return {
      path: filename, // Key trong S3
      url,
      filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

