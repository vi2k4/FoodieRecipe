import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
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
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(AuthGuard)
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
    @CurrentUser() user: { id: bigint },
    @Body() dto: GenerateRecipeDto,
  ): Promise<GenerateRecipeResponseDto> {
    return this.aiService.generate(user.id, dto);
  }

  @Post('analyze-image')
  @UseInterceptors(FileInterceptor('image'))
  async analyzeImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: bigint },
  ) {
    return this.aiService.analyzeImage(file, user.id);
  }

  @Get('history')
  getHistory(
    @CurrentUser() user: { id: bigint },
  ): Promise<AIGenerationHistoryDto[]> {
    return this.aiService.getHistory(user.id);
  }

  @Get('history/:id')
  async getHistoryById(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint },
  ): Promise<AIGenerationHistoryDto> {
    return this.aiService.getHistoryById(BigInt(id), user.id);
  }
}
