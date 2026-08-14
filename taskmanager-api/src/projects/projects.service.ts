import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create({
      name: dto.name,
      workspaceId: dto.workspaceId ?? null,
    });
    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    // No Workspace membership enforced yet, so this returns every Project
    // globally rather than scoped to the caller — matches the "make it
    // exist first" directive. Scope this once real workspaces exist.
    return this.projectRepository.find({ order: { createdAt: 'DESC' } });
  }
}