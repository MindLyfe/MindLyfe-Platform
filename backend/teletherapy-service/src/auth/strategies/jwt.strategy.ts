import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthClientService } from '../../teletherapy/services/auth-client.service';
import { JwtUser } from '../interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authClientService: AuthClientService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    try {
      // Validate the user exists and is active via auth service
      const user = await this.authClientService.validateUser(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Return user information for the request context
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        sub: payload.sub,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 