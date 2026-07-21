import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class RatingDto {
  @ApiProperty({
    description: 'Số sao đánh giá từ 1 đến 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'Điểm đánh giá phải là số nguyên' })
  @Min(1, { message: 'Điểm đánh giá tối thiểu là 1' })
  @Max(5, { message: 'Điểm đánh giá tối đa là 5' })
  rating: number;
}
