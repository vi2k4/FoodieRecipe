import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSearchHistoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  keyword!: string;
}
