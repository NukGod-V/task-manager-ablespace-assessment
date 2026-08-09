import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(dto: CreateTaskDto, owner: User): Promise<Task> {
    const task = this.taskRepository.create({ ...dto, owner });
    return this.taskRepository.save(task);
  }

  async findAllForUser(userId: string): Promise<Task[]> {
    // Scoped to the requesting user so one guest can never see another's tasks.
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
    Object.assign(task, dto);
    return this.taskRepository.save(task);
  }

  // Separate from update() to keep drag-and-drop's intent explicit and
  // cheap — it only ever touches status + position, matching the
  // PATCH /tasks/:id/reorder endpoint in the spec.
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