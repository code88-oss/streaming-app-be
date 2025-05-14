import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../repositories/chat.repository';
import { Message } from '../entities/message.entity';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}
  async saveMessage(
    senderId: string, // Tham số đầu tiên
    roomId: string, // Tham số thứ hai
    content: string, // Tham số thứ ba
  ): Promise<Message> {
    const message = new Message({
      roomId: roomId,
      senderId: senderId,
      content: content,
      timestamp: new Date(),
    });
    return this.chatRepository.save(message);
  }
}
