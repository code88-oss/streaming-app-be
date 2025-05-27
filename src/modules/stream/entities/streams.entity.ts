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
import { Channel } from './channel.entity';
import { StreamView } from './stream-views.entity';

@Entity('streams')
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  thumbnailUrl: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  views: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @ManyToOne(() => User, (user) => user.streams)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.streams)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Channel, { nullable: true, onDelete: 'SET NULL' })
  channel: Channel | null;

  @OneToMany(() => StreamView, (view) => view.stream)
  streamViews: StreamView[];

  @OneToMany(() => StreamTag, (streamTag) => streamTag.stream)
  streamTags: StreamTag[];

  @Column()
  streamKey: string;

  @Column()
  serverUrl: string;
}
