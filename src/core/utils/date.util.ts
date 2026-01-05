export class DateUtil {
  /**
   * Lấy timezone cấu hình từ env (đã được set từ app.config.ts)
   */
  private static configuredTimezone: string | undefined;

  static setTimezone(timezone: string | undefined) {
    if (timezone && timezone.trim().length > 0) {
      DateUtil.configuredTimezone = timezone;
    }
  }

  private static getTimezone(): string {
    return (
      DateUtil.configuredTimezone ||
      process.env.APP_TIMEZONE ||
      process.env.TZ ||
      'Asia/Ho_Chi_Minh'
    );
  }

  /**
   * Format date to ISO string in UTC
   */
  static toISOString(date: Date | string): string {
    return new Date(date).toISOString();
  }

  /**
   * Get current timestamp in milliseconds
   */
  static now(): number {
    return Date.now();
  }

  /**
   * Get current date as ISO string
   */
  static nowISOString(): string {
    // Giữ nguyên ISO UTC cho tương thích
    return new Date().toISOString();
  }

  /**
   * Format timestamp theo timezone cấu hình (YYYY-MM-DDTHH:mm:ss)
   */
  static formatTimestamp(date: Date = new Date()): string {
    const tz = this.getTimezone();
    const datePart = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
    const timePart = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
    return `${datePart}T${timePart}`;
  }

  /**
   * Format ngày theo pattern truyền vào và timezone cấu hình
   * Hỗ trợ các token: Y (yyyy), m (MM), d (DD), H (HH), i (mm), s (ss)
   * Ví dụ: formatDate(undefined, 'Ymd') -> 20251103
   */
  static formatDate(date: Date = new Date(), pattern = 'Y-m-d'): string {
    const tz = this.getTimezone();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const timeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(date);

    const map: Record<string, string> = {
      Y: parts.find(p => p.type === 'year')?.value || '0000',
      m: parts.find(p => p.type === 'month')?.value || '00',
      d: parts.find(p => p.type === 'day')?.value || '00',
      H: timeParts.find(p => p.type === 'hour')?.value || '00',
      i: timeParts.find(p => p.type === 'minute')?.value || '00',
      s: timeParts.find(p => p.type === 'second')?.value || '00',
    };

    return pattern.replace(/Y|m|d|H|i|s/g, (token) => map[token]);
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add hours to a date
   */
  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Add minutes to a date
   */
  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date | string): boolean {
    return new Date(date) < new Date();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date | string): boolean {
    return new Date(date) > new Date();
  }

  /**
   * Get difference in days between two dates
   */
  static diffInDays(date1: Date | string, date2: Date | string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get difference in hours between two dates
   */
  static diffInHours(date1: Date | string, date2: Date | string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Format date to readable string
   */
  static formatToReadable(date: Date | string, locale = 'en-US'): string {
    const tz = this.getTimezone();
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
    });
  }

  /**
   * Get start of day
   */
  static startOfDay(date: Date | string): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   */
  static endOfDay(date: Date | string): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Check if two dates are on the same day
   */
  static isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
