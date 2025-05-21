import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';
import { ChatRepository } from './repositories/chat.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageController } from './controllers/socket.controllers';
import { Room } from './entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Room])],
  providers: [ChatGateway, ChatService, ChatRepository],
  controllers: [MessageController],
})
export class ChatModule {}
