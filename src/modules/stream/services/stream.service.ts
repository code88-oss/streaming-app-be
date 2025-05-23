import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream } from '../entities/streams.entity';
import { StreamTag } from '../entities/stream-tags.entity';
import { CreateStreamDto } from '../dtos/create-stream.dto';
import { UpdateStreamDto } from '../dtos/update-stream.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { Tag } from '../entities/tags.entity';
import { Channel } from '../entities/channel.entity';
import { In } from 'typeorm';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Stream) private readonly streamRepo: Repository<Stream>,
    @InjectRepository(StreamTag)
    private readonly streamTagRepo: Repository<StreamTag>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
  ) {}

  // async createStream(userId: string, dto: CreateStreamDto): Promise<Stream> {
  //   const user = await this.userRepo.findOne({ where: { id: userId } });
  //   if (!user) throw new NotFoundException('User not found');

  //   const channel = await this.channelRepo.findOne({
  //     where: { user: { id: userId } },
  //   });
  //   if (!channel) throw new NotFoundException('Channel not found');

  //   const stream = this.streamRepo.create({
  //     ...dto,
  //     status: 'live',
  //     user,
  //     channel,
  //   });

  //   const savedStream = await this.streamRepo.save(stream);

  //   if (dto.tagIds?.length) {
  //     const tags = await this.tagRepo.find({
  //       where: { id: In(dto.tagIds) },
  //     });

  //     const streamTags = tags.map((tag) =>
  //       this.streamTagRepo.create({ stream: savedStream, tag }),
  //     );
  //     await this.streamTagRepo.save(streamTags);
  //   }

  //   return savedStream;
  // }

  async createStream(userId: string, dto: CreateStreamDto): Promise<Stream> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const stream = this.streamRepo.create({
      ...dto,
      status: 'live',
      user,
      channel: null,
    });

    const savedStream = await this.streamRepo.save(stream);

    if (dto.tagIds?.length) {
      const tags = await this.tagRepo.find({
        where: { id: In(dto.tagIds) },
      });

      const streamTags = tags.map((tag) =>
        this.streamTagRepo.create({ stream: savedStream, tag }),
      );
      await this.streamTagRepo.save(streamTags);
    }

    return savedStream;
  }

  async updateStream(
    id: string,
    userId: string,
    dto: UpdateStreamDto,
  ): Promise<Stream> {
    const stream = await this.streamRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!stream)
      throw new NotFoundException('Stream not found or unauthorized');

    if (dto.status === 'offline') {
      stream.endedAt = new Date();
    }

    Object.assign(stream, dto);
    return this.streamRepo.save(stream);
  }

  async getAllLiveStreams(): Promise<Stream[]> {
    return this.streamRepo.find({
      where: { status: 'live' },
      relations: [
        'user',
        'channel',
        'category',
        'streamTags',
        'streamTags.tag',
      ],
      order: { startedAt: 'DESC' },
    });
  }
}
