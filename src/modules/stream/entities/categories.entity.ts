import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Stream } from './streams.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Stream, (stream) => stream.category)
  streams: Stream[];
}
