import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPostsAroundDto {
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true ? true : false)
  onlyWithLocation: boolean;
}