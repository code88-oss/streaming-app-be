import { Controller, Get } from '@nestjs/common';
import { TagService } from '../services/tags.service';
import { Tag } from '../entities/tags.entity';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  findAll(): Promise<Tag[]> {
    return this.tagService.findAll();
  }
}
