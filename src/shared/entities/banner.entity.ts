import {
    Entity,
    Column,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BannerLocation } from './banner-location.entity';
import { BaseEntity } from './base.entity';

export enum BannerLinkTarget {
    SELF = '_self',
    BLANK = '_blank',
}

export const BannerLinkTargetLabels: Record<BannerLinkTarget, string> = {
    [BannerLinkTarget.SELF]: 'Cùng tab',
    [BannerLinkTarget.BLANK]: 'Tab mới',
};

@Entity('banners')
@Index('idx_banners_title', ['title'])
@Index('idx_banners_location_id', ['location_id'])
@Index('idx_banners_status', ['status'])
@Index('idx_banners_sort_order', ['sort_order'])
@Index('idx_banners_start_date', ['start_date'])
@Index('idx_banners_end_date', ['end_date'])
@Index('idx_banners_status_sort', ['status', 'sort_order'])
@Index('idx_banners_location_status', ['location_id', 'status'])
@Index('idx_banners_deleted_at', ['deleted_at'])
export class Banner extends BaseEntity {

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    subtitle?: string | null;

    @Column({ type: 'varchar', length: 500 })
    image: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    mobile_image?: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    link?: string | null;

    @Column({ type: 'enum', enum: BannerLinkTarget, default: BannerLinkTarget.SELF })
    link_target: BannerLinkTarget;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    button_text?: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    button_color?: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    text_color?: string | null;

    @Column({ type: 'bigint', unsigned: true, name: 'location_id' })
    location_id: number;

    @ManyToOne(() => BannerLocation, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'location_id' })
    location: BannerLocation;

    @Column({ type: 'int', default: 0, name: 'sort_order' })
    sort_order: number;

    @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
    status: BasicStatus;

    @Column({ type: 'datetime', nullable: true, name: 'start_date' })
    start_date?: Date | null;

    @Column({ type: 'datetime', nullable: true, name: 'end_date' })
    end_date?: Date | null;
}