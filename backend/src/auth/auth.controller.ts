import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('api/v1/auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@CurrentUser() user: JwtPayload) {
    return this.authService.refresh(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    return { user };
  }
}
