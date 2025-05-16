import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { Message } from '../entities/message.entity';

@Controller('messages')
export class MessageController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMessages(@Query('roomId') roomId: string): Promise<Message[]> {
    return this.chatService.getMessages(roomId);
  }
}
