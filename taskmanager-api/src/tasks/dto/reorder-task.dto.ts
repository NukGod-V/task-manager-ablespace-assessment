import { IsNumber, IsEnum } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

// Dedicated DTO for the drag-and-drop endpoint (PATCH /tasks/:id/reorder)
// keeps that intent separate from a general field-edit PATCH.
export class ReorderTaskDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsNumber()
  position: number;
}