import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StreamTag } from './stream-tags.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => StreamTag, (streamTag) => streamTag.tag)
  streamTags: StreamTag[];
}
