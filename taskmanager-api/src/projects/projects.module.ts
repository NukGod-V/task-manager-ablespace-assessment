import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), TasksModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService], // AuthModule needs this to create a default project on guest signup
})
export class ProjectsModule {}