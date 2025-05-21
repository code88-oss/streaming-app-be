import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { databaseConfig } from './config/database.config';
import { ChatModule } from './modules/socket/socket.module';
import { StreamModule } from './modules/stream/stream.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    ChatModule,
    StreamModule,
  ],
})
export class AppModule {}
