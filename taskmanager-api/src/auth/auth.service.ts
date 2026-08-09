import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { GuestLoginResponseDto } from './dto/guest-login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async guestLogin(): Promise<GuestLoginResponseDto> {
    const user = await this.usersService.createGuest();

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        authProvider: user.authProvider,
      },
    };
  }
}