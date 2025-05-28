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
    const newMessage = this.messageRepository.create({
      senderId: data.senderId,
      roomId: data.roomId,
      content: data.content,
    });

    const saved = await this.messageRepository.save(newMessage);

    const messageWithSender = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });

    if (!messageWithSender) {
      throw new Error('Message not found after saving');
    }

    return messageWithSender;
  }

  async getMessages(roomId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { roomId },
      order: { createdAt: 'DESC' },
      relations: ['sender'], // 👈 Nếu muốn lấy tên người gửi khi load tin nhắn cũ
    });
  }
}
