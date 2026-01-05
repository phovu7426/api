/**
 * Utility functions for handling file paths
 */

/**
 * Thêm domain vào đường dẫn file nếu chưa có
 * @param path - Đường dẫn file (ví dụ: /uploads/banners/home-slider-3.jpg)
 * @param baseUrl - Base URL của project (ví dụ: https://example.com)
 * @returns URL đầy đủ hoặc path gốc nếu không cần thêm domain
 */
export function addDomainToPath(path: string | null | undefined, baseUrl: string): string | null | undefined {
  if (!path || !baseUrl) {
    return path;
  }

  // Nếu path đã là URL đầy đủ (bắt đầu bằng http:// hoặc https://), trả về nguyên bản
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Nếu path bắt đầu bằng /uploads hoặc /storage, thêm domain vào
  if (path.startsWith('/uploads') || path.startsWith('/storage')) {
    // Đảm bảo baseUrl không có trailing slash
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Đảm bảo path bắt đầu bằng /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBaseUrl}${cleanPath}`;
  }

  // Trả về path gốc nếu không phải đường dẫn file upload
  return path;
}

/**
 * Transform object recursively để thêm domain vào tất cả các file paths
 * @param obj - Object hoặc array cần transform
 * @param baseUrl - Base URL của project
 * @param pathFields - Danh sách các field names có thể chứa file paths (mặc định: ['image', 'mobile_image', 'avatar', 'photo', 'url', 'path'])
 * @returns Object đã được transform
 */
export function transformFilePaths(
  obj: any,
  baseUrl: string,
  pathFields: string[] = ['image', 'mobile_image', 'avatar', 'photo', 'url', 'path', 'thumbnail', 'cover', 'logo', 'icon']
): any {
  if (!obj || !baseUrl) {
    return obj;
  }

  // Nếu là string, kiểm tra xem có phải là path không
  if (typeof obj === 'string') {
    // Nếu string bắt đầu bằng /uploads hoặc /storage, thêm domain
    if (obj.startsWith('/uploads') || obj.startsWith('/storage')) {
      return addDomainToPath(obj, baseUrl);
    }
    return obj;
  }

  // Nếu là array, transform từng phần tử
  if (Array.isArray(obj)) {
    return obj.map(item => transformFilePaths(item, baseUrl, pathFields));
  }

  // Nếu là object, transform từng property
  if (typeof obj === 'object' && obj !== null) {
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Nếu key nằm trong danh sách pathFields hoặc value là string bắt đầu bằng /uploads
      if (
        pathFields.includes(key) ||
        (typeof value === 'string' && (value.startsWith('/uploads') || value.startsWith('/storage')))
      ) {
        transformed[key] = addDomainToPath(value as string, baseUrl);
      } else {
        // Recursively transform nested objects/arrays
        transformed[key] = transformFilePaths(value, baseUrl, pathFields);
      }
    }
    
    return transformed;
  }

  // Trả về giá trị gốc cho các kiểu dữ liệu khác
  return obj;
}

