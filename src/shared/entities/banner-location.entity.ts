import {
    Entity,
    Column,
    Index,
    OneToMany,
} from 'typeorm';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { Banner } from './banner.entity';
import { BaseEntity } from './base.entity';

@Entity('banner_locations')
@Index('idx_banner_locations_code', ['code'], { unique: true })
@Index('idx_banner_locations_status', ['status'])
@Index('idx_banner_locations_deleted_at', ['deleted_at'])
export class BannerLocation extends BaseEntity {

    @Column({ type: 'varchar', length: 100, unique: true })
    code: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
    status: BasicStatus;

    // Relations
    @OneToMany('Banner', 'location')
    banners?: Banner[];
}