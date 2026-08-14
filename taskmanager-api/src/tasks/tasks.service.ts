import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(dto: CreateTaskDto, owner: User): Promise<Task> {
    // project/assignee are set as bare { id } references rather than
    // fetched + validated first — keeps this fast for the prototype.
    // A NotFoundException guard for invalid projectId/assigneeId is the
    // natural hardening step once this isn't "make it exist first."
    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status,
      priority: dto.priority,
      position: dto.position ?? 0,
      dueDate: dto.dueDate ?? null,
      owner,
      project: dto.projectId ? ({ id: dto.projectId } as Project) : null,
      assignee: dto.assigneeId ? ({ id: dto.assigneeId } as User) : null,
    });
    return this.taskRepository.save(task);
  }

  async findAllForUser(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { owner: { id: userId } },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, owner: { id: userId } },
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    const { projectId, assigneeId, ...rest } = dto;

    Object.assign(task, rest);

    // Handled separately from Object.assign since these are relation
    // objects, not plain columns — assigning `undefined` would wrongly
    // wipe them on every PATCH that doesn't mention them.
    if (projectId !== undefined) {
      task.project = projectId ? ({ id: projectId } as Project) : null;
    }
    if (assigneeId !== undefined) {
      task.assignee = assigneeId ? ({ id: assigneeId } as User) : null;
    }

    return this.taskRepository.save(task);
  }

  async reorder(id: string, dto: ReorderTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    task.status = dto.status;
    task.position = dto.position;
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
  }
}