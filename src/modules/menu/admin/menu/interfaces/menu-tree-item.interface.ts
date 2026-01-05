export interface MenuTreeItem {
  id: number;
  code: string;
  name: string;
  path?: string | null;
  icon?: string | null;
  type: string;
  status: string;
  children?: MenuTreeItem[];
  allowed?: boolean;
}

