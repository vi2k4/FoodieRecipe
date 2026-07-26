import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GenerateRecipeDto } from './dto/request/ai-generate-receipt.dto';
import { GeneratedRecipeDto } from './dto/request/generated-recipe.dto';

import { GenerateRecipeResponseDto } from './dto/response/ai-generate-receipt-response.dto';
import {
  AnalyzeImageResponseDto,
  SavedRecipeDto,
} from './dto/response/analyze-image-response.dto';
import { AIGenerationHistoryDto } from './dto/response/ai-generation-history-response.dto';

import { AIGenerationStatus } from './enums/ai-generation-status.enum';
import { RekognitionService } from 'src/common/aws/rekognition.service';
import { S3Service } from 'src/common/storage/s3.service';
import { IngredientService } from './services/ingredient.service';
import { BedrockService } from 'src/common/aws/bedrock.service';
import { PromptBuilderService } from './prompt/prompt-builder.service';
import { RecipePersistenceService } from './services/recipe_persistence.service';
import { PrismaService } from 'src/database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIGenerationService {
  constructor(
    private readonly rekognitionService: RekognitionService,
    private readonly s3Service: S3Service,
    private readonly ingredientService: IngredientService,
    private readonly bedrockService: BedrockService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly recipePersistence: RecipePersistenceService,
    private readonly prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private async saveHistory(data: {
    userId: number;
    prompt: string;
    imageUrl?: string;
    labels: string[];
    model: string;
    status: AIGenerationStatus;
    recipeId?: number;
  }) {
    return this.prisma.aIGenerationHistory.create({
      data: {
        userId: BigInt(data.userId),
        prompt: data.prompt,
        imageUrl: data.imageUrl ?? null,
        detectedLabels: data.labels,
        model: data.model,
        recipeId: data.recipeId ? BigInt(data.recipeId) : null,
        status: data.status as 'SUCCESS' | 'FAILED' | 'PENDING',
      },
    });
  }

  async generate(
    userId: number,
    dto: GenerateRecipeDto,
  ): Promise<GenerateRecipeResponseDto> {
    const prompt = this.promptBuilder.buildRecipePromptFromNames(dto.ingredients);

    const { recipe, historyId } = await this.generateAndPersistRecipe({
      userId,
      prompt,
      labels: dto.ingredients,
      imageUrl: dto.imageUrl,
    });

    return {
      ingredients: dto.ingredients,
      recipe,
      historyId,
    };
  }

  async analyzeImage(
    file: Express.Multer.File,
    userId = 1,
  ): Promise<AnalyzeImageResponseDto> {
    const upload = await this.s3Service.uploadImage(file, 'ai-images');
    const result = await this.rekognitionService.detectLabels(upload.key);

    const labels =
      result.Labels?.map((label) => ({
        name: label.Name ?? '',
        confidence: Number((label.Confidence ?? 0).toFixed(2)),
      })) ?? [];

    const ingredients = this.ingredientService.extractIngredients(
      result.Labels ?? [],
    );

    const prompt = this.promptBuilder.buildRecipePrompt(ingredients);

    const { recipe, historyId } = await this.generateAndPersistRecipe({
      userId,
      prompt,
      labels: labels.map((l) => l.name),
      imageUrl: upload.url,
    });

    return {
      labels,
      ingredients,
      recipe,
      historyId,
    };
  }

  private async generateAndPersistRecipe(params: {
    userId: number;
    prompt: string;
    labels: string[];
    imageUrl?: string;
  }): Promise<{ recipe: SavedRecipeDto; historyId: number }> {
    const model = this.configService.getOrThrow<string>('BEDROCK_MODEL_ID');

    try {
      const rawResponse = await this.bedrockService.generateRecipe(params.prompt);
      const generatedRecipe = this.parseBedrockRecipe(rawResponse);

      const savedRecipe = await this.recipePersistence.saveGeneratedRecipe(
        generatedRecipe,
        params.userId,
        params.imageUrl,
      );

      const history = await this.saveHistory({
        userId: params.userId,
        prompt: params.prompt,
        imageUrl: params.imageUrl,
        labels: params.labels,
        model,
        status: AIGenerationStatus.SUCCESS,
        recipeId: Number(savedRecipe.id),
      });

      return {
        recipe: {
          id: Number(savedRecipe.id),
          title: generatedRecipe.title,
          description: generatedRecipe.description,
          cookTime: generatedRecipe.cookTime,
          difficulty: generatedRecipe.difficulty,
          servings: generatedRecipe.servings,
          ingredients: generatedRecipe.ingredients,
          steps: generatedRecipe.steps,
          tips: generatedRecipe.tips,
          nutrition: generatedRecipe.nutrition,
          thumbnail: params.imageUrl,
        },
        historyId: Number(history.id),
      };
    } catch (error) {
      await this.saveHistory({
        userId: params.userId,
        prompt: params.prompt,
        imageUrl: params.imageUrl,
        labels: params.labels,
        model,
        status: AIGenerationStatus.FAILED,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Không thể tạo và lưu công thức từ AI',
      );
    }
  }

  private parseBedrockRecipe(raw: string): GeneratedRecipeDto {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new BadRequestException('Không thể phân tích phản hồi từ AI');
    }

    let parsed: GeneratedRecipeDto;

    try {
      parsed = JSON.parse(jsonMatch[0]) as GeneratedRecipeDto;
    } catch {
      throw new BadRequestException('Phản hồi AI không phải JSON hợp lệ');
    }

    if (
      !parsed.title ||
      !Array.isArray(parsed.ingredients) ||
      !parsed.ingredients.length ||
      !Array.isArray(parsed.steps) ||
      !parsed.steps.length
    ) {
      throw new BadRequestException('Dữ liệu công thức từ AI không đầy đủ');
    }

    return parsed;
  }
  async getHistory(userId: number): Promise<AIGenerationHistoryDto[]> {
    const histories = await this.prisma.aIGenerationHistory.findMany({
      where: {
        userId: BigInt(userId), // nếu userId trong Prisma là BigInt
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return histories.map((history) => ({
      id: Number(history.id),
      prompt: history.prompt ?? '',
      imageUrl: history.imageUrl ?? '',
      detectedLabels: (history.detectedLabels as string[]) ?? [],
      model: history.model ?? '',
      recipeId: Number(history.recipeId!),
      status: history.status as 'pending' | 'success' | 'failed',
      createdAt: history.createdAt,
      userId: Number(history.userId),
    }));
  }

  async getHistoryById(id: number): Promise<AIGenerationHistoryDto> {
    const history = await this.prisma.aIGenerationHistory.findUnique({
      where: {
        id,
      },
    });

    if (!history) {
      throw new NotFoundException(`AI Generation History ${id} not found`);
    }

    return {
      id: Number(history.id),
      prompt: history.prompt ?? '',
      imageUrl: history.imageUrl ?? '',
      detectedLabels: (history.detectedLabels as string[]) ?? [],
      model: history.model ?? '',
      recipeId: Number(history.recipeId!),
      status: history.status as 'pending' | 'success' | 'failed',
      createdAt: history.createdAt,
      userId: Number(history.userId),
    };
  }
}
