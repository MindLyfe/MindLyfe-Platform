export interface JwtUser {
  id: string;
  email: string;
  role: string;
  roles?: string[];
  sub: string;
  iat: number;
  exp: number;
  token?: string; // Optional token field for auth header
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: string;
  roles?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export enum UserRole {
  USER = 'user',
  THERAPIST = 'therapist',
  MODERATOR = 'moderator', 
  ADMIN = 'admin',
} 