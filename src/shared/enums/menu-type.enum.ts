/**
 * Menu Type Enum
 * 
 * Định nghĩa các loại menu trong hệ thống
 */
export enum MenuType {
  /** Menu route nội bộ */
  ROUTE = 'route',
  
  /** Menu group (header không click được) */
  GROUP = 'group',
  
  /** Menu link ngoài */
  LINK = 'link',
}

/**
 * Labels cho MenuType
 */
export const MenuTypeLabels: Record<MenuType, string> = {
  [MenuType.ROUTE]: 'Route',
  [MenuType.GROUP]: 'Group',
  [MenuType.LINK]: 'Link',
};

