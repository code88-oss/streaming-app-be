import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream } from '../entities/streams.entity';
import { StreamTag } from '../entities/stream-tags.entity';
import { CreateStreamDto } from '../dtos/create-stream.dto';
import { UpdateStreamDto } from '../dtos/update-stream.dto';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Stream) private streamRepo: Repository<Stream>,
    @InjectRepository(StreamTag) private streamTagRepo: Repository<StreamTag>,
  ) {}

  async createStream(userId: number, dto: CreateStreamDto): Promise<Stream> {
    const stream = this.streamRepo.create({
      ...dto,
      userId,
      status: 'live',
    });

    console.log('userId', userId);

    const savedStream = await this.streamRepo.save(stream);

    if (dto.tagIds?.length) {
      const streamTags = dto.tagIds.map((tagId) =>
        this.streamTagRepo.create({ streamId: savedStream.id, tagId }),
      );
      await this.streamTagRepo.save(streamTags);
    }

    return savedStream;
  }

  async getAllStreams(): Promise<Stream[]> {
    return this.streamRepo.find({
      where: { status: 'live' },
      relations: ['user', 'category', 'streamTags', 'streamTags.tag'],
    });
  }

  async updateStream(id: string, userId: string, dto: UpdateStreamDto) {
    const stream = await this.streamRepo.findOne({
      where: { id, userId: Number(userId) },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found or unauthorized');
    }

    if (dto.status === 'offline') {
      stream.endedAt = new Date();
    }

    const updated = Object.assign(stream, dto);
    return await this.streamRepo.save(updated);
  }
}
