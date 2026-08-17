import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
  ) {}

  private async assertProjectMember(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    const isMember = project.lead?.id === userId || project.members.some((m) => m.id === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this project');
    return project;
  }

  private async refetch(id: string): Promise<Task> {
    return this.taskRepository.findOne({ where: { id } }) as Promise<Task>;
  }

  async create(dto: CreateTaskDto, ownerId: string): Promise<Task> {
    const project = await this.assertProjectMember(dto.projectId, ownerId);
    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status,
      priority: dto.priority,
      position: dto.position ?? 0,
      dueDate: dto.dueDate ?? null,
      labels: dto.labels ?? [],
      resources: dto.resources ?? [],
      subtasks: dto.subtasks ?? [],
      owner: { id: ownerId } as User,
      project,
      assignees: (dto.assigneeIds ?? []).map((id) => ({ id }) as User),
    });
    const saved = await this.taskRepository.save(task);
    return this.refetch(saved.id);
  }

  async findAllForProject(projectId: string, userId: string): Promise<Task[]> {
    await this.assertProjectMember(projectId, userId);
    return this.taskRepository.find({ where: { project: { id: projectId } }, order: { position: 'ASC' } });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    if (task.project) await this.assertProjectMember(task.project.id, userId);
    else if (task.owner.id !== userId) throw new ForbiddenException();
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    const { projectId, assigneeIds, ...rest } = dto;
    Object.assign(task, rest); // covers labels, resources, subtasks — plain columns, no stub issue
    if (projectId !== undefined) {
      task.project = projectId ? await this.assertProjectMember(projectId, userId) : null;
    }
    if (assigneeIds !== undefined) {
      task.assignees = assigneeIds.map((aid) => ({ id: aid }) as User);
    }
    const saved = await this.taskRepository.save(task);
    return this.refetch(saved.id);
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