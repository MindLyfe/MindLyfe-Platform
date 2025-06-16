import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has admin role
    const isAdmin = user.roles?.includes('admin') || user.role === 'admin' || user.isAdmin;

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
} 