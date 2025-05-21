import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Stream } from './streams.entity';
import { Tag } from './tags.entity';

@Entity('stream_tags')
export class StreamTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  streamId: string;

  @Column()
  tagId: string;

  @ManyToOne(() => Stream, (stream) => stream.streamTags)
  @JoinColumn({ name: 'streamId' })
  stream: Stream;

  @ManyToOne(() => Tag, (tag) => tag.streamTags)
  @JoinColumn({ name: 'tagId' })
  tag: Tag;
}
