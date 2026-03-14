import { Controller, Post, Body, Get, Put, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service.js';
import {
  LoginDto,
  RegisterAdminDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto.js';

interface AuthRequest extends Request {
  user: { id: string; employee_id: string; role: string; name: string };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email/employee_id and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register-admin')
  @ApiOperation({ summary: 'Register a new admin account' })
  registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Admin changes any employee password using admin refresh token' })
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: AuthRequest) {
    return this.authService.getProfile(req.user.id);
  }
}
