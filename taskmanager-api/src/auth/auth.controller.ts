import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { UsersService } from '../users/users.service';
import { GuestLoginResponseDto } from './dto/guest-login-response.dto';

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}
interface GoogleRequest extends Request {
  user: { email: string; fullName: string; avatarUrl: string | null };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Post('guest')
  async guestLogin(): Promise<GuestLoginResponseDto> {
    return this.authService.guestLogin();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: AuthedRequest) {
    return this.usersService.findById(req.user.userId);
  }

  // Redirects the browser to Google's consent screen — Passport handles
  // this entirely; the handler body is intentionally empty.
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  // Google redirects back here after consent. We issue our own JWT and
  // hand it to the frontend via a query param — the frontend's
  // /auth/callback page picks it up and completes the session.
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    const { accessToken } = await this.authService.googleLogin(req.user);
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }
}
