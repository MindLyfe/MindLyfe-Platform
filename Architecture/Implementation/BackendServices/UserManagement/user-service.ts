/**
 * MindLyf User Management Service
 * 
 * This service handles user authentication, profile management, and authorization
 * for the MindLyf platform. It implements secure user operations following
 * PDPO and GDPR compliance requirements.
 */

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Logger } from '../common/logging';
import { MetricsClient } from '../common/metrics';
import { EventPublisher } from '../common/events';
import { DatabaseClient } from '../common/database';
import { ConfigService } from '../common/config';

// Configuration constants
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * User data models
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: UserRole[];
  organizationId?: string;
  consentPreferences: ConsentPreferences;
  metadata: Record<string, any>;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export interface ConsentPreferences {
  marketingEmails: boolean;
  dataSharing: boolean;
  researchParticipation: boolean;
  thirdPartyIntegrations: boolean;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: 'school' | 'clinic' | 'enterprise';
  adminUserId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  subscriptionTier: string;
  metadata: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

/**
 * User Management Service class
 */
export class UserService {
  private logger: Logger;
  private metrics: MetricsClient;
  private eventPublisher: EventPublisher;
  private db: DatabaseClient;
  private config: ConfigService;

  constructor(
    logger: Logger,
    metrics: MetricsClient,
    eventPublisher: EventPublisher,
    db: DatabaseClient,
    config: ConfigService
  ) {
    this.logger = logger.createChildLogger('user-service');
    this.metrics = metrics;
    this.eventPublisher = eventPublisher;
    this.db = db;
    this.config = config;
  }

  /**
   * User registration
   */
  async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    consentPreferences: ConsentPreferences;
    organizationId?: string;
  }): Promise<{ user: Omit<User, 'passwordHash'>, token: string }> {
    this.logger.info('Registering new user', { email: userData.email });
    
    // Validate email format
    if (!this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    if (!this.isStrongPassword(userData.password)) {
      throw new Error('Password does not meet security requirements');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Create user object
    const user: User = {
      id: uuidv4(),
      email: userData.email.toLowerCase(),
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      dateOfBirth: userData.dateOfBirth,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isEmailVerified: false,
      roles: [{ id: uuidv4(), name: 'user', permissions: [{ resource: 'profile', action: 'read' }, { resource: 'profile', action: 'update' }] }],
      organizationId: userData.organizationId,
      consentPreferences: {
        ...userData.consentPreferences,
        updatedAt: new Date()
      },
      metadata: {}
    };

    // Save user to database
    await this.db.users.insertOne(user);

    // Generate verification token and send email
    await this.sendVerificationEmail(user);

    // Generate auth token
    const token = this.generateToken(user);

    // Publish user.created event
    await this.eventPublisher.publish('user.created', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      timestamp: new Date().toISOString()
    });

    // Track metrics
    this.metrics.increment('user.registration.success');

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * User authentication
   */
  async loginUser(email: string, password: string, ipAddress: string, userAgent: string): Promise<{ token: string, refreshToken: string, user: Omit<User, 'passwordHash'> }> {
    this.logger.info('User login attempt', { email });
    
    // Find user by email
    const user = await this.getUserByEmail(email);
    if (!user) {
      this.metrics.increment('user.login.failed');
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      this.metrics.increment('user.login.inactive_account');
      throw new Error('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.metrics.increment('user.login.failed');
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Create session
    const session: UserSession = {
      id: uuidv4(),
      userId: user.id,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      createdAt: new Date(),
      ipAddress,
      userAgent,
      isActive: true
    };

    // Save session
    await this.db.sessions.insertOne(session);

    // Update last login timestamp
    await this.db.users.updateOne(
      { id: user.id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    );

    // Publish user.login event
    await this.eventPublisher.publish('user.login', {
      userId: user.id,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent
    });

    // Track metrics
    this.metrics.increment('user.login.success');

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { token, refreshToken, user: userWithoutPassword };
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string, refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.config.get('JWT_REFRESH_SECRET')) as { userId: string };
      
      // Find active session with this refresh token
      const session = await this.db.sessions.findOne({
        refreshToken,
        isActive: true
      });

      if (!session) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await this.getUserById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update session
      await this.db.sessions.updateOne(
        { id: session.id },
        {
          $set: {
            token: newToken,
            refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
            updatedAt: new Date()
          }
        }
      );

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.logger.error('Token refresh failed', { error: error.message });
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * User logout
   */
  async logoutUser(token: string): Promise<void> {
    // Invalidate session
    await this.db.sessions.updateOne(
      { token },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    this.metrics.increment('user.logout');
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.db.users.findOne({ id });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.db.users.findOne({ email: email.toLowerCase() });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    metadata?: Record<string, any>;
  }): Promise<Omit<User, 'passwordHash'>> {
    // Get current user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    // Save to database
    await this.db.users.updateOne(
      { id: userId },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    // Publish user.updated event
    await this.eventPublisher.publish('user.updated', {
      userId,
      updates: Object.keys(updates),
      timestamp: new Date().toISOString()
    });

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Update user consent preferences
   */
  async updateConsentPreferences(userId: string, preferences: Partial<ConsentPreferences>): Promise<ConsentPreferences> {
    // Get current user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update preferences
    const updatedPreferences = {
      ...user.consentPreferences,
      ...preferences,
      updatedAt: new Date()
    };

    // Save to database
    await this.db.users.updateOne(
      { id: userId },
      { $set: { consentPreferences: updatedPreferences, updatedAt: new Date() } }
    );

    // Publish consent.updated event
    await this.eventPublisher.publish('user.consent.updated', {
      userId,
      preferences: updatedPreferences,
      timestamp: new Date().toISOString()
    });

    return updatedPreferences;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      this.metrics.increment('user.password_change.failed');
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    if (!this.isStrongPassword(newPassword)) {
      throw new Error('New password does not meet security requirements');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await this.db.users.updateOne(
      { id: userId },
      { $set: { passwordHash, updatedAt: new Date() } }
    );

    // Invalidate all sessions except current one
    // This is a security measure to ensure all other devices need to re-login
    await this.db.sessions.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false } }
    );

    // Publish password.changed event (for security notifications)
    await this.eventPublisher.publish('user.password.changed', {
      userId,
      timestamp: new Date().toISOString()
    });

    this.metrics.increment('user.password_change.success');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // We don't reveal if the email exists for security reasons
      // but we still log it internally
      this.logger.info('Password reset requested for non-existent email', { email });
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await this.db.users.updateOne(
      { id: user.id },
      { $set: { resetToken, resetTokenExpiry, updatedAt: new Date() } }
    );

    // Send password reset email
    // This would integrate with the Notification Service
    await this.sendPasswordResetEmail(user, resetToken);

    this.metrics.increment('user.password_reset.requested');
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    // Find user with this reset token
    const user = await this.db.users.findOne({
      resetToken,
      resetTokenExpiry: { $gt: new Date() } // Token must not be expired
    });

    if (!user) {
      this.metrics.increment('user.password_reset.invalid_token');
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password strength
    if (!this.isStrongPassword(newPassword)) {
      throw new Error('New password does not meet security requirements');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and clear reset token
    await this.db.users.updateOne(
      { id: user.id },
      { 
        $set: { 
          passwordHash, 
          updatedAt: new Date() 
        },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    // Invalidate all sessions
    await this.db.sessions.updateMany(
      { userId: user.id },
      { $set: { isActive: false } }
    );

    // Publish password.reset event (for security notifications)
    await this.eventPublisher.publish('user.password.reset', {
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    this.metrics.increment('user.password_reset.success');
  }

  /**
   * Verify user email
   */
  async verifyEmail(verificationToken: string): Promise<void> {
    // Find user with this verification token
    const user = await this.db.users.findOne({
      verificationToken,
      verificationTokenExpiry: { $gt: new Date() } // Token must not be expired
    });

    if (!user) {
      this.metrics.increment('user.email_verification.invalid_token');
      throw new Error('Invalid or expired verification token');
    }

    // Update user
    await this.db.users.updateOne(
      { id: user.id },
      { 
        $set: { 
          isEmailVerified: true, 
          updatedAt: new Date() 
        },
        $unset: { verificationToken: "", verificationTokenExpiry: "" }
      }
    );

    // Publish email.verified event
    await this.eventPublisher.publish('user.email.verified', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    this.metrics.increment('user.email_verification.success');
  }

  /**
   * Create organization
   */
  async createOrganization(adminUserId: string, orgData: {
    name: string;
    type: 'school' | 'clinic' | 'enterprise';
    metadata?: Record<string, any>;
  }): Promise<Organization> {
    // Verify admin user exists
    const adminUser = await this.getUserById(adminUserId);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Create organization
    const organization: Organization = {
      id: uuidv4(),
      name: orgData.name,
      type: orgData.type,
      adminUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      subscriptionTier: 'basic',
      metadata: orgData.metadata || {}
    };

    // Save to database
    await this.db.organizations.insertOne(organization);

    // Update admin user with organization ID and admin role
    await this.db.users.updateOne(
      { id: adminUserId },
      { 
        $set: { 
          organizationId: organization.id,
          roles: [...adminUser.roles, { 
            id: uuidv4(), 
            name: 'org_admin', 
            permissions: [
              { resource: 'organization', action: 'read' },
              { resource: 'organization', action: 'update' },
              { resource: 'organization_members', action: 'create' },
              { resource: 'organization_members', action: 'read' },
              { resource: 'organization_members', action: 'update' },
              { resource: 'organization_members', action: 'delete' }
            ] 
          }],
          updatedAt: new Date()
        }
      }
    );

    // Publish organization.created event
    await this.eventPublisher.publish('organization.created', {
      organizationId: organization.id,
      adminUserId,
      name: organization.name,
      type: organization.type,
      timestamp: new Date().toISOString()
    });

    return organization;
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(organizationId: string, userId: string, role: 'member' | 'admin'): Promise<void> {
    // Verify organization exists
    const organization = await this.db.organizations.findOne({ id: organizationId });
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Verify user exists
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Define role permissions
    const rolePermissions = role === 'admin' ? [
      { resource: 'organization', action: 'read' },
      { resource: 'organization', action: 'update' },
      { resource: 'organization_members', action: 'create' },
      { resource: 'organization_members', action: 'read' },
      { resource: 'organization_members', action: 'update' },
      { resource: 'organization_members', action: 'delete' }
    ] : [
      { resource: 'organization', action: 'read' }
    ];

    // Update user with organization ID and role
    await this.db.users.updateOne(
      { id: userId },
      { 
        $set: { 
          organizationId,
          roles: [...user.roles.filter(r => r.name !== 'org_admin' && r.name !== 'org_member'), { 
            id: uuidv4(), 
            name: role === 'admin' ? 'org_admin' : 'org_member', 
            permissions: rolePermissions
          }],
          updatedAt: new Date()
        }
      }
    );

    // Publish organization.member.added event
    await this.eventPublisher.publish('organization.member.added', {
      organizationId,
      userId,
      role,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    // Verify organization exists
    const organization = await this.db.organizations.findOne({ id: organizationId });
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Verify user exists and belongs to this organization
    const user = await this.getUserById(userId);
    if (!user || user.organizationId !== organizationId) {
      throw new Error('User not found in this organization');
    }

    // Cannot remove the admin user
    if (organization.adminUserId === userId) {
      throw new Error('Cannot remove the organization admin');
    }

    // Update user to remove organization ID and roles
    await this.db.users.updateOne(
      { id: userId },
      { 
        $set: { 
          roles: user.roles.filter(r => r.name !== 'org_admin' && r.name !== 'org_member'),
          updatedAt: new Date()
        },
        $unset: { organizationId: "" }
      }
    );

    // Publish organization.member.removed event
    await this.eventPublisher.publish('organization.member.removed', {
      organizationId,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string): Promise<Array<Omit<User, 'passwordHash'>>> {
    // Verify organization exists
    const organization = await this.db.organizations.findOne({ id: organizationId });
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get all users in this organization
    const users = await this.db.users.find({ organizationId }).toArray();

    // Return users without password hashes
    return users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Helper: Generate JWT token
   */
  private generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        roles: user.roles.map(r => r.name),
        organizationId: user.organizationId
      },
      this.config.get('JWT_SECRET'),
      { expiresIn: TOKEN_EXPIRY }
    );
  }

  /**
   * Helper: Generate refresh token
   */
  private generateRefreshToken(user: User): string {
    return jwt.sign(
      { userId: user.id },
      this.config.get('JWT_REFRESH_SECRET'),
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }

  /**
   * Helper: Send verification email
   */
  private async sendVerificationEmail(user: User): Promise<void> {
    // Generate verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 86400000); // 24 hours from now

    // Save verification token
    await this.db.users.updateOne(
      { id: user.id },
      { $set: { verificationToken, verificationTokenExpiry, updatedAt: new Date() } }
    );

    // This would integrate with the Notification Service
    // For now, we'll just log it
    this.logger.info('Verification email would be sent', {
      to: user.email,
      verificationToken,
      userId: user.id
    });
  }

  /**
   * Helper: Send password reset email
   */
  private async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    // This would integrate with the Notification Service
    // For now, we'll just log it
    this.logger.info('Password reset email would be sent', {
      to: user.email,
      resetToken,
      userId: user.id
    });
  }

  /**
   * Helper: Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Helper: Validate password strength
   */
  private isStrongPassword(password: string): boolean {
    // Password must be at least 8 characters long and contain at least one uppercase letter,
    // one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}

/**
 * API endpoints for User Management
 * 
 * These would be implemented in a separate file that uses the UserService
 */

/*
API Endpoints:

Authentication:
- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - User login
- POST /api/v1/auth/refresh - Refresh token
- POST /api/v1/auth/logout - User logout
- POST /api/v1/auth/verify-email - Verify email
- POST /api/v1/auth/forgot-password - Request password reset
- POST /api/v1/auth/reset-password - Reset password with token

User Management:
- GET /api/v1/users/me - Get current user profile
- PUT /api/v1/users/me - Update current user profile
- PUT /api/v1/users/me/password - Change password
- PUT /api/v1/users/me/consent - Update consent preferences

Organization Management:
- POST /api/v1/organizations - Create organization
- GET /api/v1/organizations/{id} - Get organization details
- PUT /api/v1/organizations/{id} - Update organization
- GET /api/v1/organizations/{id}/members - Get organization members
- POST /api/v1/organizations/{id}/members - Add user to organization
- DELETE /api/v1/organizations/{id}/members/{userId} - Remove user from organization
*/