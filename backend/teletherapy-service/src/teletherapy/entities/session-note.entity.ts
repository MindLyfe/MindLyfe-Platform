import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { TherapySession } from './therapy-session.entity';
// User entity is managed by auth-service

@Entity('session_notes')
export class SessionNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => TherapySession, session => session.id, { onDelete: 'CASCADE' })
  session: TherapySession;

  @Column()
  sessionId: string;

  // User relation replaced with user ID from auth service

  @Column({ nullable: true })
  authorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}