import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { TasksService } from '../tasks/tasks.service';
import type { Task } from '../tasks/entities/task.entity';
import type { User } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    private readonly tasksService: TasksService, // reused purely for its membership check
  ) {}

  async findAllForTask(taskId: string, userId: string): Promise<Comment[]> {
    await this.tasksService.findOne(taskId, userId); // throws if not authorized
    return this.commentRepository.find({
      where: { task: { id: taskId } },
      order: { createdAt: 'ASC' },
    });
  }

  async create(taskId: string, body: string, authorId: string): Promise<Comment> {
    await this.tasksService.findOne(taskId, authorId);
    const comment = this.commentRepository.create({
      task: { id: taskId } as Task,
      author: { id: authorId } as User,
      body,
    });
    const saved = await this.commentRepository.save(comment);
    // Same stub-hydration fix as Tasks/Projects — save() echoes back the
    // bare { id } we passed for author, not the real username.
    return this.commentRepository.findOne({ where: { id: saved.id } }) as Promise<Comment>;
  }
}
