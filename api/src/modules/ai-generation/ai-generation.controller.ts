import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AIGenerationService } from './ai.service';

import { GenerateRecipeDto } from './dto/request/ai-generate-receipt.dto';
import { AnalyzeImageDto } from './dto/request/analyze-image.dto';

import { GenerateRecipeResponseDto } from './dto/response/ai-generate-receipt-response.dto';
import { AnalyzeImageResponseDto } from './dto/response/analyze-image-response.dto';
import { AIGenerationHistoryDto } from './dto/response/ai-generation-history-response.dto';

@Controller('ai')
export class AIGenerationController {
  constructor(private readonly aiService: AIGenerationService) {}

  @Post('generate')
  generate(@Body() dto: GenerateRecipeDto): GenerateRecipeResponseDto {
    // TODO:
    // Sau này userId sẽ lấy từ JWT
    return this.aiService.generate(1, dto);
  }

  @Post('analyze-image')
  analyzeImage(@Body() dto: AnalyzeImageDto): AnalyzeImageResponseDto {
    return this.aiService.analyzeImage(dto);
  }

  @Get('history')
  getHistory(): AIGenerationHistoryDto[] {
    return this.aiService.getHistory(1);
  }

  @Get('history/:id')
  getHistoryById(@Param('id') id: string): AIGenerationHistoryDto {
    return this.aiService.getHistoryById(Number(id));
  }
}
