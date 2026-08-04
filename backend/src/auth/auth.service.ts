import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      phone: dto.phone,
      password: dto.password,
      name: dto.name,
      role: Role.OWNER,
    });

    return {
      access_token: this.generateAccessToken(user),
      refresh_token: this.generateRefreshToken(user, false),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByPhone(dto.phone);

    if (!user) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    return {
      access_token: this.generateAccessToken(user),
      refresh_token: this.generateRefreshToken(user, dto.rememberMe),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(payload: any) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      access_token: this.generateAccessToken(user),
      refresh_token: this.generateRefreshToken(user),
    };
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  private generateAccessToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        phone: user.phone,
        role: user.role,
      },
      {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '15m',
      },
    );
  }

  private generateRefreshToken(user: User, rememberMe?: boolean): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        phone: user.phone,
        role: user.role,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        expiresIn: rememberMe ? '30d' : '7d',
      },
    );
  }
}
