import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto, creator: User): Promise<Project> {
    const memberIds = new Set(dto.memberIds ?? []);
    memberIds.add(creator.id); // creator is always a member

    const project = this.projectRepository.create({
      name: dto.name,
      workspaceId: dto.workspaceId ?? null,
      lead: creator,
      members: Array.from(memberIds).map((id) => ({ id }) as User),
    });
    return this.projectRepository.save(project);
  }

  // Only projects the user leads or is a member of — matches the
  // "person 1 assigned to project 1" scoping from the chat.
  async findAllForUser(userId: string): Promise<Project[]> {
    // Two-step lookup: filtering directly on a joined collection would
    // clip the `members` array in the hydrated result to only the matched
    // row (a known TypeORM gotcha with leftJoinAndSelect + WHERE on the
    // joined side) — so find matching IDs first, then re-fetch full entities.
    const rows = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.lead', 'lead')
      .leftJoin('project.members', 'member')
      .where('lead.id = :userId', { userId })
      .orWhere('member.id = :userId', { userId })
      .select('project.id')
      .distinct(true)
      .getRawMany();

    const ids = rows.map((r) => r.project_id);
    if (ids.length === 0) return [];

    return this.projectRepository.find({
      where: { id: In(ids) },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    this.assertMember(project, userId);
    return project;
  }

  async addMember(projectId: string, memberId: string, requesterId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    this.assertLead(project, requesterId);
    if (!project.members.some((m) => m.id === memberId)) {
      project.members.push({ id: memberId } as User);
      await this.projectRepository.save(project);
    }
    return this.projectRepository.findOne({ where: { id: projectId } }) as Promise<Project>;
  }

  async removeMember(projectId: string, memberId: string, requesterId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    this.assertLead(project, requesterId);
    project.members = project.members.filter((m) => m.id !== memberId);
    await this.projectRepository.save(project);
    return this.projectRepository.findOne({ where: { id: projectId } }) as Promise<Project>;
  }

  private assertMember(project: Project, userId: string) {
    const isMember = project.lead?.id === userId || project.members.some((m) => m.id === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this project');
  }

  private assertLead(project: Project, userId: string) {
    if (project.lead?.id !== userId) {
      throw new ForbiddenException('Only the project lead can manage members');
    }
  }
}