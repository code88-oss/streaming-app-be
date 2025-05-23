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

  @Column()
  views: number;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp' })
  endedAt: Date;

  @ManyToOne(() => User, (user) => user.streams)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.streams)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Channel, (channel) => channel.streams)
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @OneToMany(() => StreamView, (view) => view.stream)
  streamViews: StreamView[];

  @OneToMany(() => StreamTag, (streamTag) => streamTag.stream)
  streamTags: StreamTag[];

  @Column()
  streamKey: string;

  @Column()
  serverUrl: string;
}
