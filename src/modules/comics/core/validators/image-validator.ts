import { BadRequestException } from '@nestjs/common';

/**
 * Validate image file
 */
export class ImageValidator {
  private static readonly ALLOWED_MIMETYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static validate(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate MIME type
    if (!this.ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.ALLOWED_MIMETYPES.join(', ')}`
      );
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      const maxSizeMB = (this.MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB`
      );
    }

    // Validate file extension
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!ext || !allowedExts.includes(ext)) {
      throw new BadRequestException(
        `File extension not allowed. Allowed extensions: ${allowedExts.join(', ')}`
      );
    }
  }

  static validateMultiple(files: Express.Multer.File[]): void {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    if (files.length > 100) {
      throw new BadRequestException('Maximum 100 files allowed');
    }

    files.forEach(file => this.validate(file));
  }
}



