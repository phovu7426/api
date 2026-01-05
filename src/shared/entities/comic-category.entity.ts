import {
  Entity,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('comic_categories')
@Index('idx_slug', ['slug'])
@Index('idx_name', ['name'])
@Index('idx_created_at', ['created_at'])
@Index('idx_created_user_id', ['created_user_id'])
@Index('idx_updated_user_id', ['updated_user_id'])
@Index('idx_deleted_at', ['deleted_at'])
export class ComicCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToMany('Comic', 'categories')
  comics?: any[];
}

