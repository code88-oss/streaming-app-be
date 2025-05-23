import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { UpdateChannelDto } from '../dtos/update-channel.dto';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { ChannelService } from '../services/channel.service';

@Controller('channel')
export class StreamController {
  constructor(private readonly channelService: ChannelService) {}

  @Patch('channel/:userId')
  updateChannel(
    @Param('userId') userId: string,
    @Body() dto: UpdateChannelDto,
  ) {
    return this.channelService.updateChannel(userId, dto);
  }

  @Post('channel/:userId')
  createChannel(
    @Param('userId') userId: string,
    @Body() dto: CreateChannelDto,
  ) {
    return this.channelService.createChannel(userId, dto);
  }
}
