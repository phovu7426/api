import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { MenuType } from '@/shared/enums/menu-type.enum';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BaseEntity } from './base.entity';

@Entity('menus')
@Index(['code'], { unique: true })
@Index(['parent_id'])
@Index(['required_permission_id'])
@Index(['status', 'show_in_menu'])
@Index('idx_deleted_at', ['deleted_at'])
export class Menu extends BaseEntity {

  @Column({ type: 'varchar', length: 120, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  path?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'api_path' })
  api_path?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  icon?: string | null;

  @Column({ type: 'enum', enum: MenuType, default: MenuType.ROUTE })
  type: MenuType;

  @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
  status: BasicStatus;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'parent_id' })
  parent_id?: number | null;

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Menu | null;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children?: Menu[];

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sort_order: number;

  @Column({ type: 'boolean', default: false, name: 'is_public' })
  is_public: boolean;

  @Column({ type: 'boolean', default: true, name: 'show_in_menu' })
  show_in_menu: boolean;

  @Column({ type: 'bigint', unsigned: true, nullable: true, name: 'required_permission_id' })
  required_permission_id?: number | null;

  @ManyToOne(() => Permission, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'required_permission_id' })
  required_permission?: Permission | null;

  @OneToMany(() => MenuPermission, (menuPermission) => menuPermission.menu)
  menu_permissions?: MenuPermission[];
}

@Entity('menu_permissions')
@Index(['menu_id'])
@Index(['permission_id'])
export class MenuPermission {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, name: 'menu_id' })
  menu_id: number;

  @ManyToOne(() => Menu, (menu) => menu.menu_permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @Column({ type: 'bigint', unsigned: true, name: 'permission_id' })
  permission_id: number;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}

