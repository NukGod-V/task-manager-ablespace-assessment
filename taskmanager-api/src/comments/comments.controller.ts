import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('taskId') taskId: string, @Req() req: AuthedRequest) {
    return this.commentsService.findAllForTask(taskId, req.user.userId);
  }

  @Post()
  create(@Param('taskId') taskId: string, @Body() dto: CreateCommentDto, @Req() req: AuthedRequest) {
    return this.commentsService.create(taskId, dto.body, req.user.userId);
  }
}