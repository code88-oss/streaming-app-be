import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateStreamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsIn(['live', 'offline'])
  status?: string;

  @IsOptional()
  @IsArray()
  tagIds?: number[];
}
