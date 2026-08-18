import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { GuestLoginResponseDto } from './dto/guest-login-response.dto';

interface GoogleProfile { email: string; fullName: string; avatarUrl: string | null; }

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly projectsService: ProjectsService,
  ) {}

  async guestLogin(): Promise<GuestLoginResponseDto> {
    const user = await this.usersService.createGuest();
    await this.projectsService.create({ name: 'My First Project' }, user);
    return this.issueTokenFor(user.id, user.username, user.authProvider);
  }

  async googleLogin(profile: GoogleProfile): Promise<GuestLoginResponseDto> {
    let user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      user = await this.usersService.createGoogleUser(profile);
      await this.projectsService.create({ name: 'My First Project' }, user);
    }
    return this.issueTokenFor(user.id, user.username, user.authProvider);
  }

  private async issueTokenFor(userId: string, username: string, authProvider: string): Promise<GuestLoginResponseDto> {
    const accessToken = await this.jwtService.signAsync({ sub: userId, username });
    return { accessToken, user: { id: userId, username, authProvider } };
  }
}