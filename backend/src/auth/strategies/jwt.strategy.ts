import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: Role;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    if (!payload.sub || !payload.phone || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      id: payload.sub,
      phone: payload.phone,
      role: payload.role,
    };
  }
}
