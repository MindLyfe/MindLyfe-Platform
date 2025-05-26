import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  THERAPIST = 'therapist',
  ORGANIZATION_ADMIN = 'organization_admin',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum UserType {
  INDIVIDUAL = 'individual',
  ORGANIZATION_MEMBER = 'organization_member',
  MINOR = 'minor',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserType, default: UserType.INDIVIDUAL })
  userType: UserType;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  verificationToken?: string;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Column({ nullable: true })
  lastLogin?: Date;

  // Organization relationship
  @Column({ nullable: true })
  organizationId?: string;

  @ManyToOne('Organization', 'users')
  @JoinColumn({ name: 'organizationId' })
  organization?: any;

  // Age verification for minors
  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ default: false })
  isMinor: boolean;

  @Column({ nullable: true })
  guardianEmail?: string;

  @Column({ nullable: true })
  guardianPhone?: string;

  // Subscription and session relationships
  @OneToMany('Subscription', 'user')
  subscriptions: any[];

  @OneToMany('TherapySession', 'user')
  therapySessions: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    // Only hash the password if it was modified and isn't already hashed
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  checkMinorStatus(): void {
    if (this.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      this.isMinor = age < 18;
      if (this.isMinor) {
        this.userType = UserType.MINOR;
      }
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Helper methods
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isOrganizationMember(): boolean {
    return this.userType === UserType.ORGANIZATION_MEMBER && !!this.organizationId;
  }

  get canAccessTherapy(): boolean {
    // Users can access therapy if they have active subscriptions or are organization members
    return this.status === UserStatus.ACTIVE && (
      this.isOrganizationMember || 
      this.subscriptions?.some(sub => sub.status === 'active' && !sub.isExpired)
    );
  }
}

// Import these here to avoid circular dependency issues
import { Organization } from './organization.entity';
import { Subscription } from './subscription.entity';
import { TherapySession } from './therapy-session.entity'; 