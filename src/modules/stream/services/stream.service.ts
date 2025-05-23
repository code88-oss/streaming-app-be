import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream } from '../entities/streams.entity';
import { StreamTag } from '../entities/stream-tags.entity';
import { CreateStreamDto } from '../dtos/create-stream.dto';
import { UpdateStreamDto } from '../dtos/update-stream.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { Tag } from '../entities/tags.entity';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Stream) private readonly streamRepo: Repository<Stream>,
    @InjectRepository(StreamTag)
    private readonly streamTagRepo: Repository<StreamTag>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
  ) {}

  async createStream(userId: string, dto: CreateStreamDto): Promise<Stream> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const stream = this.streamRepo.create({
      ...dto,
      status: 'live',
      user,
    });

    const savedStream = await this.streamRepo.save(stream);

    if (dto.tagIds?.length) {
      const tags = await this.tagRepo.findByIds(dto.tagIds);
      const streamTags = tags.map((tag) =>
        this.streamTagRepo.create({
          stream: savedStream,
          tag,
        }),
      );
      await this.streamTagRepo.save(streamTags);
    }

    return savedStream;
  }

  async getAllStreams(): Promise<Stream[]> {
    return this.streamRepo.find({
      where: { status: 'live' },
      relations: [
        'user',
        'category',
        'channel',
        'streamTags',
        'streamTags.tag',
      ],
    });
  }

  async updateStream(
    id: string,
    userId: string,
    dto: UpdateStreamDto,
  ): Promise<Stream> {
    const stream = await this.streamRepo.findOne({
      where: {
        id,
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found or unauthorized');
    }

    if (dto.status === 'offline') {
      stream.endedAt = new Date();
    }

    Object.assign(stream, dto);
    return this.streamRepo.save(stream);
  }
}
