import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Injectable()
export class AdminGuard extends AuthGuard {
  private readonly logger = new Logger(AdminGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if user is authenticated
    const isAuthenticated = await super.canActivate(context);
    
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user has admin or support role
    const allowedRoles = ['admin', 'support'];
    
    if (!user.role || !allowedRoles.includes(user.role.toLowerCase())) {
      this.logger.warn(`User ${user.id} with role ${user.role} attempted to access admin endpoint`);
      throw new ForbiddenException('Insufficient permissions. Only admin and support users can manage resources.');
    }

    return true;
  }
} 