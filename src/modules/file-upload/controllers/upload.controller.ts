import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { UploadService } from '../services/upload.service';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { UploadResponseDto } from '../dtos/upload-response.dto';

@Controller('upload')
export class UploadController {
  private readonly maxFileSize: number;

  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize = this.configService.get<number>('storage.maxFileSize', 10485760); // Default 10MB
  }

  @LogRequest()
  @Permission('public')
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 104857600, // 100MB - Multer sẽ reject nếu vượt quá, nhưng chúng ta sẽ validate lại với config
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Kiểm tra file size (double check)
    if (file.size > this.maxFileSize) {
      const maxSizeMB = (this.maxFileSize / 1024 / 1024).toFixed(2);
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
      );
    }

    return this.uploadService.uploadFile(file);
  }

  @LogRequest()
  @Permission('public')
  @Post('files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 104857600, // 100MB - Multer sẽ reject nếu vượt quá, nhưng chúng ta sẽ validate lại với config
      },
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    // Kiểm tra file size cho từng file (double check)
    const maxSizeMB = (this.maxFileSize / 1024 / 1024).toFixed(2);
    for (const file of files) {
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum allowed size of ${maxSizeMB}MB`,
        );
      }
    }

    return this.uploadService.uploadFiles(files);
  }
}

