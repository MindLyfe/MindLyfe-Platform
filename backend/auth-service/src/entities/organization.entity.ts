import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: OrganizationStatus.ACTIVE })
  status: OrganizationStatus;

  @Column({ type: 'int', default: 0 })
  maxUsers: number;

  @Column({ type: 'int', default: 0 })
  currentUsers: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 680000 })
  pricePerUser: number;

  @Column({ type: 'int', default: 8 })
  sessionsPerUser: number;

  @Column({ type: 'date', nullable: true })
  subscriptionStartDate?: Date;

  @Column({ type: 'date', nullable: true })
  subscriptionEndDate?: Date;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 