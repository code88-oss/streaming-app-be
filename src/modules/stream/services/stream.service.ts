import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Stream } from '../entities/streams.entity';
import { StreamTag } from '../entities/stream-tags.entity';
import { Tag } from '../entities/tags.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { CreateStreamDto } from '../dtos/create-stream.dto';
import { Room } from 'src/modules/socket/entities/room.entity';
import { UpdateStreamInfoDto } from '../dtos/update-stream-info.dto';
import { Category } from '../entities/categories.entity';

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
    @InjectRepository(Room)
    private roomRepo: Repository<Room>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
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

    const room = this.roomRepo.create({
      id: savedStream.id, // gán thủ công
      name: `${user.username}'s Room`, // hoặc để null
    });
    await this.roomRepo.save(room);

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

    return savedStream;
  }

  async getStatusByUserId(userId: string) {
    console.log('userId', userId);
    const stream = await this.streamRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!stream) {
      return {
        userId,
        streamId: null,
        status: 'offline',
        message: 'No active stream found',
      };
    }

    return {
      userId: userId,
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

    return updatedStream;
  }

  async getAllLiveStreams(): Promise<Stream[]> {
    return this.streamRepo.find({
      where: { status: 'live' },
      relations: ['user', 'category', 'streamTags', 'streamTags.tag'],
      order: { startedAt: 'DESC' },
    });
  }

  async updateStreamInfo(
    streamId: string,
    userId: string,
    dto: UpdateStreamInfoDto,
  ): Promise<Stream> {
    const stream = await this.streamRepo.findOne({
      where: { id: streamId, user: { id: userId } },
      relations: ['streamTags'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found or unauthorized');
    }

    // Cập nhật các trường cơ bản
    if (dto.title) stream.title = dto.title;
    if (dto.thumbnailUrl) stream.thumbnailUrl = dto.thumbnailUrl;
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) throw new BadRequestException('Invalid categoryId');
      stream.category = category;
    }

    // Update tagIds nếu có
    if (dto.tagIds) {
      const tags = await this.tagRepo.findBy({ id: In(dto.tagIds) });

      // Xoá streamTags cũ
      await this.streamTagRepo.delete({ stream: { id: streamId } });

      // Gán mới
      const newStreamTags = tags.map((tag) =>
        this.streamTagRepo.create({ stream, tag }),
      );
      await this.streamTagRepo.save(newStreamTags);
    }

    return this.streamRepo.save(stream);
  }

  async getStreamByUserId(userId: string): Promise<Stream> {
    const stream = await this.streamRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user', 'category', 'streamTags', 'streamTags.tag'],
    });

    if (!stream) {
      throw new NotFoundException(`Stream for user ${userId} not found`);
    }

    return stream;
  }

  async getStreamByStreamId(streamId: string): Promise<Stream> {
    const stream = await this.streamRepo.findOne({
      where: { id: streamId },
      relations: ['user', 'category', 'streamTags', 'streamTags.tag'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }
}
