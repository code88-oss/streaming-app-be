import { Injectable } from '@nestjs/common';
import { Message } from '../entities/message.entity';

@Injectable()
export class ChatRepository {
  private messages: Message[] = [];

  async save(message: Message): Promise<Message> {
    console.log('message', message);
    this.messages.push(message);
    return message;
  }

  async findByRoom(roomId: string): Promise<Message[]> {
    return this.messages.filter((msg) => msg.roomId === roomId);
  }
}
