import { IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  bio: string;

  //   @IsString()
  //   bannerImageUrl: string;

  @IsString()
  avatarChannelUrl: string;
}
