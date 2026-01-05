import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ContactStatus, ContactStatusLabels } from '@/shared/enums/contact-status.enum';

// Re-export for backward compatibility
export { ContactStatus, ContactStatusLabels };

@Entity('contacts')
@Index('idx_contacts_email', ['email'])
@Index('idx_contacts_status', ['status'])
@Index('idx_contacts_created_at', ['created_at'])
@Index('idx_contacts_deleted_at', ['deleted_at'])
@Index('idx_contacts_status_created', ['status', 'created_at'])
export class Contact extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject?: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.Pending })
  status: ContactStatus;

  @Column({ type: 'text', nullable: true })
  reply?: string | null;

  @Column({ type: 'datetime', nullable: true })
  replied_at?: Date | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  replied_by?: number | null;
}

