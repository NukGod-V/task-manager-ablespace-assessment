import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.BACKLOG,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.NO_PRIORITY,
  })
  priority: TaskPriority;

  // Float rather than int so a card can be inserted between two existing
  // positions (e.g. 1.5 between 1 and 2) without re-indexing the whole column
  // on every drag-and-drop reorder — standard Kanban ordering pattern.
  @Column({ type: 'float', default: 0 })
  position: number;

  // Owner of the task — kept as a direct relation for now; a separate
  // TaskAssignee join table (per the figma spec, for multi-assignee support)
  // is a later-phase addition once Projects/Teams exist.
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}