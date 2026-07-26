import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateRecipeDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ingredients!: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
