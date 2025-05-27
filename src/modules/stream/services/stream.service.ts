import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Stream } from '../entities/streams.entity';
import { StreamTag } from '../entities/stream-tags.entity';
import { Tag } from '../entities/tags.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { StreamGateway } from 'src/modules/stream/gateways/stream.gateway';
import { CreateStreamDto } from '../dtos/create-stream.dto';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Stream)
    private streamRepo: Repository<Stream>,
    @InjectRepository(StreamTag)
    private streamTagRepo: Repository<StreamTag>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private streamGateway: StreamGateway,
  ) {}

  async createStream(dto: CreateStreamDto, userId: string): Promise<Stream> {
    const existingLiveStream = await this.streamRepo.findOne({
      where: {
        user: { id: userId },
        status: 'live',
      },
    });

    if (existingLiveStream) {
      throw new BadRequestException('User already has an active stream.');
    }

    if (dto.tagIds?.length) {
      const existingTags = await this.tagRepo.find({
        where: { id: In(dto.tagIds) },
      });
      const existingTagIds = existingTags.map((tag) => tag.id);
      const invalidTagIds = dto.tagIds.filter(
        (id) => !existingTagIds.includes(id),
      );
      if (invalidTagIds.length) {
        throw new BadRequestException(
          `Invalid tag IDs: ${invalidTagIds.join(', ')}`,
        );
      }
    }

    // Fetch user

    console.log('userId', userId);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Create the stream
    const stream = this.streamRepo.create({
      ...dto,
      serverUrl: dto.streamUrl,
      user,
      startedAt: new Date(),
      status: 'live',
      thumbnailUrl:
        dto.thumbnailUrl || 'https://default-thumbnail.com/default.jpg',
    });

    const savedStream = await this.streamRepo.save(stream);

    // Handle tags if provided
    if (dto.tagIds?.length) {
      const tags = await this.tagRepo.find({
        where: { id: In(dto.tagIds) },
      });

      const streamTags = tags.map((tag) =>
        this.streamTagRepo.create({ stream: savedStream, tag }),
      );
      await this.streamTagRepo.save(streamTags);
    }

    console.log(
      `Notifying streamStatus for userId: ${userId}, streamId: ${savedStream.id}`,
    );

    // Notify via WebSocket
    this.streamGateway.notifyStreamStatus(
      userId,
      savedStream.id,
      'live',
      'Stream started successfully',
    );

    return savedStream;
  }

  async getStatusByUserId(userId: string) {
    const stream = await this.streamRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!stream) {
      return {
        streamId: null,
        status: 'offline',
        message: 'No active stream found',
      };
    }

    return {
      streamId: stream.id,
      status: stream.status,
      message: stream.status === 'live' ? null : 'Stream is not live',
    };
  }

  async updateStreamStatus(
    streamId: string,
    userId: string,
    status: 'live' | 'offline',
  ): Promise<Stream> {
    const stream = await this.streamRepo.findOne({
      where: { id: streamId, user: { id: userId } },
    });
    if (!stream) {
      throw new BadRequestException('Stream not found or unauthorized');
    }

    stream.status = status;
    if (status === 'offline') {
      stream.endedAt = new Date();
    }
    const updatedStream = await this.streamRepo.save(stream);

    // Notify via WebSocket
    this.streamGateway.notifyStreamStatus(
      userId,
      streamId,
      status,
      `Stream ${status === 'live' ? 'started' : 'stopped'}`,
    );

    return updatedStream;
  }

  async getAllLiveStreams(): Promise<Stream[]> {
    return this.streamRepo.find({
      where: { status: 'live' },
      relations: ['user', 'category', 'streamTags', 'streamTags.tag'],
      order: { startedAt: 'DESC' },
    });
  }
}
