export interface JwtUser {
  id: string;
  email: string;
  role: string;
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
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export enum UserRole {
  CLIENT = 'client',
  THERAPIST = 'therapist', 
  ADMIN = 'admin',
  SUPPORT = 'support'
} 