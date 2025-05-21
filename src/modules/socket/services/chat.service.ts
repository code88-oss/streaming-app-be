import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessage(data: {
    senderId: number;
    roomId: string;
    content: string;
  }): Promise<Message> {
    console.log('data', data);
    const newMessage = this.messageRepository.create({
      senderId: data.senderId,
      roomId: data.roomId,
      content: data.content,
    });
    return this.messageRepository.save(newMessage);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { roomId },
      order: { createdAt: 'DESC' },
    });
  }
}
