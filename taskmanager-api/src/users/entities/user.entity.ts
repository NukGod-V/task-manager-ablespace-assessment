import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AuthProvider { GUEST = 'guest', GOOGLE = 'google' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.GUEST })
  authProvider: AuthProvider;

  @Column({ type: 'varchar', nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  // FIXED: Explicitly added type: 'varchar' to prevent TypeORM reflection crash
  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}