import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, MaxLength, IsUUID, IsDateString, IsArray,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional() @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional() @IsNumber()
  position?: number;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsUUID()
  projectId: string;

  // CHANGED — was assigneeId?: string
  @IsOptional() @IsUUID('4', { each: true })
  assigneeIds?: string[];

  @IsOptional() @IsString({ each: true })
  labels?: string[];

  // Light validation only (array shape, not per-field) — acceptable for a
  // per-task JSON blob that only this task's owner/members ever write to.
  @IsOptional() @IsArray()
  resources?: { id: string; name: string; url: string }[];

  @IsOptional() @IsArray()
  subtasks?: { id: string; title: string; done: boolean; priority: TaskPriority; assigneeId: string | null; dueDate: string | null }[];
}