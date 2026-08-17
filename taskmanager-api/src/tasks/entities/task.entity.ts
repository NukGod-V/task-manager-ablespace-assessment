import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

export enum TaskStatus { BACKLOG = 'backlog', TODO = 'todo', DOING = 'doing', COMPLETED = 'completed', ON_HOLD = 'on_hold' }
export enum TaskPriority { NO_PRIORITY = 'no_priority', URGENT = 'urgent', HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }

export interface TaskResource { id: string; name: string; url: string; }
export interface TaskSubtask { id: string; title: string; done: boolean; priority: TaskPriority; assigneeId: string | null; dueDate: string | null; }

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

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ type: 'simple-array', nullable: true })
  labels: string[] | null;

  // NEW — real persistence, not session state. JSON columns rather than
  // separate tables: no cross-task querying, but real data safety, and
  // ships today. Upgrade path to full Resource/Subtask entities exists
  // later without touching anything else in the app.
  @Column({ type: 'simple-json', nullable: true })
  resources: TaskResource[] | null;

  @Column({ type: 'simple-json', nullable: true })
  subtasks: TaskSubtask[] | null;

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true, eager: true, onDelete: 'SET NULL' })
  project: Project | null;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  owner: User;

  // CHANGED — was a single ManyToOne `assignee`. Now a real many-to-many,
  // same pattern as Project.members, so a task can have multiple assignees.
  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'task_assignees',
    joinColumn: { name: 'taskId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  assignees: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}