import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { GenerateRecipeDto } from './dto/request/ai-generate-receipt.dto';
import { AnalyzeImageDto } from './dto/request/analyze-image.dto';

import { GenerateRecipeResponseDto } from './dto/response/ai-generate-receipt-response.dto';
import { AnalyzeImageResponseDto } from './dto/response/analyze-image-response.dto';
import { AIGenerationHistoryDto } from './dto/response/ai-generation-history-response.dto';

import { AIGenerationStatus } from './enums/ai-generation-status.enum';

@Injectable()
export class AIGenerationService {
  generate(userId: number, dto: GenerateRecipeDto): GenerateRecipeResponseDto {
    console.log(userId);
    console.log(dto);

    return {
      jobId: randomUUID(),
      status: AIGenerationStatus.PENDING,
      message: 'AI generation request accepted.',
    };
  }

  analyzeImage(dto: AnalyzeImageDto): AnalyzeImageResponseDto {
    console.log(dto);

    return {
      labels: [
        {
          name: 'Chicken',
          confidence: 99.8,
        },
        {
          name: 'Onion',
          confidence: 98.4,
        },
      ],
    };
  }

  getHistory(userId: number): AIGenerationHistoryDto[] {
    console.log(userId);

    return [];
  }

  getHistoryById(id: number): AIGenerationHistoryDto {
    console.log(id);

    return {
      id: 1,
      //   jobId: randomUUID(),
      prompt: 'Generate chicken soup',
      imageUrl: 'https://image.com/chicken.jpg',
      detectedLabels: ['Chicken', 'Onion'],
      model: 'Claude 3.5 Sonnet',
      recipeId: 1,
      status: AIGenerationStatus.SUCCESS,
      createdAt: new Date(),
      userId: 1,
    };
  }
}
