import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

// PartialType makes every field from CreateTaskDto optional while keeping
// its validation rules — exactly what a PATCH endpoint needs.
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}