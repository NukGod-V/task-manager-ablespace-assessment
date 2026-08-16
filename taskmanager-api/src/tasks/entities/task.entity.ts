import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  DOING = 'doing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

export enum TaskPriority {
  NO_PRIORITY = 'no_priority',
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.BACKLOG })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.NO_PRIORITY })
  priority: TaskPriority;

  @Column({ type: 'float', default: 0 })
  position: number;

  // NEW — matches the frontend mock's dueDate field.
  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ type: 'simple-array', nullable: true })
  labels: string[] | null;

  // NEW — nullable + onDelete SET NULL: deleting a Project shouldn't
  // cascade-delete its Tasks, just orphan them back to no project.
  @ManyToOne(() => Project, (project) => project.tasks, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  project: Project | null;

  // owner = who created/holds the task (existing field, drives the
  // findAllForUser scoping in TasksService — unchanged).
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  owner: User;

  // NEW — assignee = who the task is assigned TO, distinct from owner.
  // Nullable since not every task has an assignee yet.
  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  assignee: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}