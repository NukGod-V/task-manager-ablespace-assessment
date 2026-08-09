import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestLoginResponseDto } from './dto/guest-login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Matches figma-extraction spec: POST /auth/guest
  @Post('guest')
  async guestLogin(): Promise<GuestLoginResponseDto> {
    return this.authService.guestLogin();
  }
}