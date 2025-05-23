import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { CreateStreamDto } from '../dtos/create-stream.dto';
import { UpdateStreamDto } from '../dtos/update-stream.dto';
import { StreamService } from '../services/stream.service';

@Controller('streams')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post(':userId')
  createStream(@Param('userId') userId: string, @Body() dto: CreateStreamDto) {
    return this.streamService.createStream(userId, dto);
  }

  @Patch(':id/user/:userId')
  updateStream(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateStreamDto,
  ) {
    return this.streamService.updateStream(id, userId, dto);
  }

  @Get()
  getAllLiveStreams() {
    return this.streamService.getAllLiveStreams();
  }
}
