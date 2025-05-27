import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  UseGuards,
  Request,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateStreamDto } from '../dtos/create-stream.dto';
import { Stream } from '../entities/streams.entity';
import { StreamService } from '../services/stream.service';
@Controller('streams')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createStream(
    @Body() dto: CreateStreamDto,
    @Request() req: any,
  ): Promise<Stream> {
    const userId = req.user.id;
    console.log('userId', userId);
    return this.streamService.createStream(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getMyStreamStatus(@Req() req) {
    const userId = req.user.sub; // hoặc req.user.id tùy
    return this.streamService.getStatusByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateStreamStatus(
    @Param('id') streamId: string,
    @Body('status') status: 'live' | 'offline',
    @Request() req: any,
  ): Promise<Stream> {
    const userId = req.user.sub; // Extract userId from decoded JWT
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    return this.streamService.updateStreamStatus(streamId, userId, status);
  }

  @Get()
  getAllLiveStreams(): Promise<Stream[]> {
    return this.streamService.getAllLiveStreams();
  }
}
