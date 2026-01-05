import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * BaseEntity cung cấp các fields audit chung cho tất cả entities
 * - id: Primary key
 * - created_user_id: User ID tạo record
 * - updated_user_id: User ID cập nhật record
 * - created_at: Thời gian tạo
 * - updated_at: Thời gian cập nhật
 * - deleted_at: Thời gian xóa soft delete
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  created_user_id?: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  updated_user_id?: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;
}

