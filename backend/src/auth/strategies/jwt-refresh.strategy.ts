import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Role } from '../../common/enums/role.enum';

export interface JwtRefreshPayload {
  sub: string;
  phone: string;
  role: Role;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload): Promise<JwtRefreshPayload> {
    if (!payload.sub || !payload.phone || !payload.role || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return payload;
  }
}
