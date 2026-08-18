import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('me')
  updateMe(@Body() dto: UpdateProfileDto, @Req() req: AuthedRequest) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }
}