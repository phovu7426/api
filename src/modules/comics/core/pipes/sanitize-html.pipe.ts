import { PipeTransform, Injectable } from '@nestjs/common';

/**
 * Sanitize HTML input để prevent XSS attacks
 * Basic sanitization - remove script tags và dangerous HTML
 */
@Injectable()
export class SanitizeHtmlPipe implements PipeTransform {
  private sanitizeString(str: string): string {
    // Remove script tags và event handlers
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '');
  }

  transform(value: any) {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }
    
    if (typeof value === 'object' && value !== null) {
      const sanitized = { ...value };
      for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
          sanitized[key] = this.sanitizeString(sanitized[key]);
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
          sanitized[key] = this.transform(sanitized[key]);
        }
      }
      return sanitized;
    }
    
    return value;
  }
}

