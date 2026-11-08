import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryRecipeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: number | string;

  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: string;

  @IsOptional()
  @IsIn(['true', 'false', true, false])
  isPublic?: boolean | string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minCalories?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxCalories?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minCookTime?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxCookTime?: number;

  @IsOptional()
  @IsIn(['newest', 'oldest', 'popular', 'liked', 'rated', 'hot'])
  sortBy?: string;
}
