export interface JwtUser {
  id: string;
  email: string;
  roles: string[];
  // Add any other user properties you need from the JWT payload
}