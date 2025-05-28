import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('rooms')
export class Room {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
