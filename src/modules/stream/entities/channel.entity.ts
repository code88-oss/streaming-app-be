import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Stream } from './streams.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('channel')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => User, (user) => user.channel)
  @JoinColumn({ name: 'id' })
  user: User;

  @OneToMany(() => Stream, (stream) => stream.channel)
  streams: Stream[];
}
