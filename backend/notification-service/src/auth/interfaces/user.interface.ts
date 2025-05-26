export interface JwtUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  token?: string;
  roles?: string[];
}

export interface AuthResponse {
  user: JwtUser;
  message?: string;
} 