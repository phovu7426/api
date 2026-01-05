export enum BasicStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export const BasicStatusLabels: Record<BasicStatus, string> = {
  [BasicStatus.Active]: 'Hoạt động',
  [BasicStatus.Inactive]: 'Ngừng hoạt động',
};



