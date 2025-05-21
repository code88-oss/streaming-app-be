import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from './categories.entity';
import { StreamTag } from './stream-tags.entity';

@Entity('streams')
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  categoryId: string;

  @Column()
  status: string;

  @Column()
  streamKey: string;

  @Column()
  serverUrl: string;

  @CreateDateColumn()
  startedAt: Date;

  @CreateDateColumn()
  endedAt: Date;

  @ManyToOne(() => User, (user) => user.streams)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.streams)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => StreamTag, (streamTag) => streamTag.stream)
  streamTags: StreamTag[];
}
