import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @Req() req: AuthedRequest) {
    return this.tasksService.create(dto, req.user.userId);
  }

  // projectId is now required — a task list is always scoped to one project.
  @Get()
  findAll(@Query('projectId') projectId: string, @Req() req: AuthedRequest) {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }
    return this.tasksService.findAllForProject(projectId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: AuthedRequest) {
    return this.tasksService.update(id, dto, req.user.userId);
  }

  @Patch(':id/reorder')
  reorder(@Param('id') id: string, @Body() dto: ReorderTaskDto, @Req() req: AuthedRequest) {
    return this.tasksService.reorder(id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.tasksService.remove(id, req.user.userId);
  }
}