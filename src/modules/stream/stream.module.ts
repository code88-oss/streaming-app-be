import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/categories.entity';
import { Stream } from './entities/streams.entity';
import { Tag } from './entities/tags.entity';
import { StreamTag } from './entities/stream-tags.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Stream, Tag, StreamTag])],
})
export class StreamModule {}
