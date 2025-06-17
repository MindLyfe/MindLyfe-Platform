import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

export enum TherapistStatus {
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum LicenseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
}

@Entity()
export class Therapist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  licenseNumber: string;

  @Column()
  licenseState: string;

  @Column({ type: 'enum', enum: LicenseStatus, default: LicenseStatus.ACTIVE })
  licenseStatus: LicenseStatus;

  @Column({ nullable: true })
  licenseExpiryDate?: Date;

  @Column()
  specialization: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'enum', enum: TherapistStatus, default: TherapistStatus.PENDING_VERIFICATION })
  status: TherapistStatus;

  @Column({ type: 'json', nullable: true })
  credentials?: {
    education: string[];
    certifications: string[];
    experience: string;
  };

  @Column({ type: 'json', nullable: true })
  availability?: {
    timezone: string;
    workingHours: {
      [key: string]: { start: string; end: string; };
    };
  };

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalSessions: number;

  @Column({ default: true })
  isAcceptingNewClients: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ nullable: true })
  verificationDocuments?: string; // JSON string of document URLs

  @Column({ nullable: true })
  verifiedAt?: Date;

  @Column({ nullable: true })
  verifiedBy?: string; // Admin user ID who verified

  @OneToMany('TherapySession', 'therapist')
  therapySessions: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get isVerified(): boolean {
    return this.status === TherapistStatus.VERIFIED;
  }

  get canAcceptSessions(): boolean {
    return this.isVerified && 
           this.isAcceptingNewClients && 
           this.licenseStatus === LicenseStatus.ACTIVE;
  }

  get fullName(): string {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
  }
}