import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPostsAroundDto {
  @IsBoolean()
  @Transform(({obj, key}) => {
    return obj[key] === 'true' ? true : obj[key] === 'false' ? false : obj[key];
  })
  onlyWithLocation: boolean;
}