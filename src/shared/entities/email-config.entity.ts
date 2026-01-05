import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('email_configs')
@Index('idx_email_configs_deleted_at', ['deleted_at'])
export class EmailConfig extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  smtp_host: string;

  @Column({ type: 'int', default: 587 })
  smtp_port: number;

  @Column({ type: 'boolean', default: true })
  smtp_secure: boolean;

  @Column({ type: 'varchar', length: 255 })
  smtp_username: string;

  @Column({ type: 'varchar', length: 500 })
  smtp_password: string;

  @Column({ type: 'varchar', length: 255 })
  from_email: string;

  @Column({ type: 'varchar', length: 255 })
  from_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reply_to_email?: string | null;
}
