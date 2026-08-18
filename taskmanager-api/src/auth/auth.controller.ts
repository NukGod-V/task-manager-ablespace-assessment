import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { GuestLoginResponseDto } from './dto/guest-login-response.dto';

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('guest')
  async guestLogin(): Promise<GuestLoginResponseDto> {
    return this.authService.guestLogin();
  }

  // NEW — lets the frontend refresh full profile data (fullName, title)
  // after Settings edits, or on first load of that page.
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: AuthedRequest) {
    return this.usersService.findById(req.user.userId);
  }
}