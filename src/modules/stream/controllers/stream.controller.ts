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
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateStreamDto } from '../dtos/create-stream.dto';
import { Stream } from '../entities/streams.entity';
import { StreamService } from '../services/stream.service';
import { UpdateStreamInfoDto } from '../dtos/update-stream-info.dto';
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
    console.log('req.user:', req.user); // Log the entire req.user object
    const userId = req.user?.id; // Use optional chaining to avoid errors
    console.log('userId:', userId);
    if (!userId) {
      throw new UnauthorizedException('User ID not found in JWT payload');
    }
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

  @Get(':userId')
  getStreamById(@Param('userId') userId: string): Promise<Stream> {
    return this.streamService.getStreamByUserId(userId);
  }

  @Patch(':id/info')
  @UseGuards(JwtAuthGuard)
  async updateStreamInfo(
    @Param('id') streamId: string,
    @Body() dto: UpdateStreamInfoDto,
    @Request() req: any,
  ): Promise<Stream> {
    const userId = req.user.sub;
    return this.streamService.updateStreamInfo(streamId, userId, dto);
  }

  @Get('/by-id/:streamId')
  getStreamByStreamId(@Param('streamId') streamId: string): Promise<Stream> {
    return this.streamService.getStreamByStreamId(streamId);
  }
}
