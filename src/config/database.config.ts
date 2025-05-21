import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/user/entities/user.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { UserOAuthProvider } from '../modules/user/entities/user-oauth-provider.entity';
import * as dotenv from 'dotenv';
import { Message } from 'src/modules/socket/entities/message.entity';
import { Room } from 'src/modules/socket/entities/room.entity';
import { Category } from 'src/modules/stream/entities/categories.entity';
import { StreamTag } from 'src/modules/stream/entities/stream-tags.entity';
import { Stream } from 'src/modules/stream/entities/streams.entity';
import { Tag } from 'src/modules/stream/entities/tags.entity';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USERNAME',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`,
  );
}

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST as string,
  port: parseInt(process.env.DATABASE_PORT as string, 10),
  username: process.env.DATABASE_USERNAME as string,
  password: process.env.DATABASE_PASSWORD as string,
  database: process.env.DATABASE_NAME as string,
  entities: [
    User,
    RefreshToken,
    UserOAuthProvider,
    Message,
    Room,
    Category,
    StreamTag,
    Stream,
    Tag,
  ],
  schema: 'public',
  synchronize: true, // Chỉ dùng trong dev, tắt ở production
};
