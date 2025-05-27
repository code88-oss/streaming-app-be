import { Controller, Get } from '@nestjs/common';
import { CategoryService } from '../services/categories.service';
import { Category } from '../entities/categories.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }
}
