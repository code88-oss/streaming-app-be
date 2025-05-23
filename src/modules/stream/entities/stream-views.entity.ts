import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Stream } from './streams.entity';

@Entity('stream_views')
export class StreamView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  streamId: string;

  @Column()
  viewedAt: Date;

  @ManyToOne(() => Stream, (stream) => stream.views)
  @JoinColumn({ name: 'streamId' })
  stream: Stream;
}
