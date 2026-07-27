import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { AIGenerationService } from './ai.service';

import { GenerateRecipeDto } from './dto/request/ai-generate-receipt.dto';
// import { AnalyzeImageDto } from './dto/request/analyze-image.dto';

import { GenerateRecipeResponseDto } from './dto/response/ai-generate-receipt-response.dto';
// import { AnalyzeImageResponseDto } from './dto/response/analyze-image-response.dto';
import { AIGenerationHistoryDto } from './dto/response/ai-generation-history-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { S3Service } from '../../common/storage/s3.service';

@Controller('ai')
export class AIGenerationController {
  constructor(
    private readonly aiService: AIGenerationService,
    private readonly s3Service: S3Service,
  ) {}
  @Post('upload-test')
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.s3Service.uploadImage(file, 'test');
  }

  @Post('generate')
  async generate(
    @Body() dto: GenerateRecipeDto,
  ): Promise<GenerateRecipeResponseDto> {
    // TODO: Sau này userId sẽ lấy từ JWT
    return this.aiService.generate(1, dto);
  }

  @Post('analyze-image')
  @UseInterceptors(FileInterceptor('image'))
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    return await this.aiService.analyzeImage(file);
  }

  @Get('history')
  getHistory(): Promise<AIGenerationHistoryDto[]> {
    return this.aiService.getHistory(1);
  }

  @Get('history/:id')
  async getHistoryById(
    @Param('id') id: string,
  ): Promise<AIGenerationHistoryDto> {
    return this.aiService.getHistoryById(Number(id));
  }
}
