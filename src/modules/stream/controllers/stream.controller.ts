import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { StreamService } from '../services/stream.service';
import { CreateStreamDto } from '../dtos/create-stream.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateStreamDto } from '../dtos/update-stream.dto';

interface AuthRequest extends Request {
  user: { id: string }; // hoặc id: number nếu là number
}

@Controller('streams')
export class StreamController {
  constructor(private streamService: StreamService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createStream(@Body() dto: CreateStreamDto, @Req() req: any) {
    const userId = req.user.id;
    return this.streamService.createStream(userId, dto);
  }

  @Get('lists')
  async getAllStreams() {
    return this.streamService.getAllStreams();
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  updateStream(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: UpdateStreamDto,
  ) {
    const userId = req.user.id;
    return this.streamService.updateStream(id, userId, dto);
  }
}
