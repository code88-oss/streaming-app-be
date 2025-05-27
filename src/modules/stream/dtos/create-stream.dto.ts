import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateStreamDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @IsString()
  streamUrl: string;

  @IsString()
  streamKey: string;
}
