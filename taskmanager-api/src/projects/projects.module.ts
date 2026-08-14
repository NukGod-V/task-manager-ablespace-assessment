import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AuthModule } from '../auth/auth.module'; // provides JwtAuthGuard's dependencies

@Module({
  imports: [TypeOrmModule.forFeature([Project]), AuthModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [TypeOrmModule],
})
export class ProjectsModule {}