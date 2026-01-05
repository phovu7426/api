import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Chapter } from './chapter.entity';

/**
 * ChapterPage Entity
 * Trang ảnh của chương truyện
 */
@Entity('chapter_pages')
@Index('idx_chapter_id', ['chapter_id'])
@Index('idx_chapter_page', ['chapter_id', 'page_number'])
@Unique('idx_chapter_page_unique', ['chapter_id', 'page_number'])
export class ChapterPage {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  chapter_id: number;

  @Column({ type: 'int' })
  page_number: number;

  @Column({ type: 'varchar', length: 500 })
  image_url: string;

  @Column({ type: 'int', nullable: true })
  width?: number | null;

  @Column({ type: 'int', nullable: true })
  height?: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  file_size?: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter?: Chapter;
}



