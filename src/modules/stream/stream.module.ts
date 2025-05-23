import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/categories.entity';
import { Stream } from './entities/streams.entity';
import { Tag } from './entities/tags.entity';
import { StreamTag } from './entities/stream-tags.entity';
import { StreamController } from './controllers/stream.controller';
import { StreamService } from './services/stream.service';
import { Channel } from './entities/channel.entity';
import { StreamView } from './entities/stream-views.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Stream,
      Tag,
      StreamTag,
      Channel,
      StreamService,
      StreamView,
      User,
    ]),
  ],
  controllers: [StreamController],
  providers: [StreamService],
})
export class StreamModule {}
