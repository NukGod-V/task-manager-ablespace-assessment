import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { GuestLoginResponseDto } from './dto/guest-login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly projectsService: ProjectsService,
  ) {}

  async guestLogin(): Promise<GuestLoginResponseDto> {
    const user = await this.usersService.createGuest();

    // Tasks now require a project, so a brand-new guest with zero projects
    // would hit a dead end on their very first click otherwise.
    await this.projectsService.create({ name: 'My First Project' }, user);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });

    return {
      accessToken,
      user: { id: user.id, username: user.username, authProvider: user.authProvider },
    };
  }
}