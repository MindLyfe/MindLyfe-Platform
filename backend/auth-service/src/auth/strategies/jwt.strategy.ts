import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', 'mindlyf-dev-secret'),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any) {
    try {
      // Check if token is revoked
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      if (await this.authService.isTokenRevoked(token)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const user = await this.authService.validateUserById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }
      
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 