import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, MaxLength, IsUUID, IsDateString,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  // Required now — tasks cannot exist without a project (per chat: "without
  // a project he can't add any task"). Was optional in the previous phase.
  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsString({ each: true })
  labels?: string[];
}