import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { UserOAuthProvider } from './user-oauth-provider.entity';
import { Message } from 'src/modules/socket/entities/message.entity';
import { Stream } from 'src/modules/stream/entities/streams.entity';
import { Channel } from 'src/modules/stream/entities/channel.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Channel, (channel) => channel.user)
  channel: Channel;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => UserOAuthProvider, (oauthProvider) => oauthProvider.user)
  oauthProviders: UserOAuthProvider[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Stream, (stream) => stream.user)
  streams: Stream[];
}
