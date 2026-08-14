import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';

// Minimal for now — just enough to register Project with TypeORM so
// autoLoadEntities picks it up and Task's relation to it resolves.
// CRUD endpoints for Projects are a separate, later task.
@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  exports: [TypeOrmModule],
})
export class ProjectsModule {}