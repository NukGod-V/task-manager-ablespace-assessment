import type { User } from '../users/entities/user.entity'; //confused here -------------------------------------------------
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { TasksService } from '../tasks/tasks.service';

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: AuthedRequest) {
    return this.projectsService.create(dto, { id: req.user.userId } as User);
  }

  @Get()
  findAll(@Req() req: AuthedRequest) {
    return this.projectsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.projectsService.findOneForUser(id, req.user.userId);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto, @Req() req: AuthedRequest) {
    return this.projectsService.addMember(id, dto.userId, req.user.userId);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: AuthedRequest,
  ) {
    return this.projectsService.removeMember(id, userId, req.user.userId);
  }

  // Matches figma-extraction §4.2: GET /projects/:id/tasks
  @Get(':id/tasks')
  async getTasks(@Param('id') id: string, @Req() req: AuthedRequest) {
    await this.projectsService.findOneForUser(id, req.user.userId); // membership check
    return this.tasksService.findAllForProject(id, req.user.userId);
  }
}