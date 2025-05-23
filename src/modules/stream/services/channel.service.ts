import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream } from '../entities/streams.entity';
import { StreamTag } from '../entities/stream-tags.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Tag } from '../entities/tags.entity';
import { Channel } from '../entities/channel.entity';
import { UpdateChannelDto } from '../dtos/update-channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Stream) private readonly streamRepo: Repository<Stream>,
    @InjectRepository(StreamTag)
    private readonly streamTagRepo: Repository<StreamTag>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
  ) {}

  async updateChannel(userId: string, dto: UpdateChannelDto): Promise<Channel> {
    let channel = await this.channelRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!channel) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      channel = this.channelRepo.create({ ...dto, user });
    } else {
      Object.assign(channel, dto);
    }

    return this.channelRepo.save(channel);
  }

  async createChannel(userId: string, dto: UpdateChannelDto): Promise<Channel> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existingChannel = await this.channelRepo.findOne({
      where: { user: { id: userId } },
    });
    if (existingChannel) return existingChannel;

    const channel = this.channelRepo.create({ ...dto, user });
    return this.channelRepo.save(channel);
  }
}
