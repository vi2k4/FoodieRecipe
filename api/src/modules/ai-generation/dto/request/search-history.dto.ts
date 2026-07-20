// request/search-history.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class SearchHistoryDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}
