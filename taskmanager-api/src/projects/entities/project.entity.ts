import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Plain column rather than a Workspace relation — no Workspace entity
  // exists yet in this schema (figma-extraction §4.1 defines one, but it
  // hasn't been built). Kept as a bare uuid so Project → Workspace can be
  // wired up later without another breaking migration.
  @Column({ type: 'uuid', nullable: true })
  workspaceId: string | null;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  // "Share Projects with specific users" — many-to-many membership via a
  // join table. No membership-management endpoints yet (add/remove member),
  // just the schema-level support requested.
  @ManyToMany(() => User)
  @JoinTable({
    name: 'project_members',
    joinColumn: { name: 'projectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}