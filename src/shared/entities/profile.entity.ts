import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Gender } from '@/shared/enums/gender.enum';
import { BaseEntity } from './base.entity';

@Entity('profiles')
export class Profile extends BaseEntity {

    @Column({ name: 'user_id', unique: true })
    @Index('UQ_profiles_user_id', { unique: true })
    userId: number;

    @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 255, nullable: true, type: 'varchar' })
    name?: string | null;

    @Column({ length: 255, nullable: true, type: 'varchar' })
    image?: string | null;

    @Column({ type: 'date', nullable: true })
    birthday?: Date | null;

    @Column({ length: 50, nullable: true, type: 'varchar' })
    gender?: Gender | null;

    @Column({ type: 'text', nullable: true })
    address?: string | null;

    @Column({ type: 'text', nullable: true })
    about?: string | null;
}