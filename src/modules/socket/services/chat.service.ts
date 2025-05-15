import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../repositories/chat.repository';
import { Message } from '../entities/message.entity';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}
  async saveMessage({
    senderId,
    roomId,
    content,
  }: {
    senderId: string;
    roomId: string;
    content: string;
  }): Promise<Message> {
    const message = new Message({
      roomId,
      senderId,
      content,
      timestamp: new Date(),
    });
    return this.chatRepository.save(message);
  }
}
