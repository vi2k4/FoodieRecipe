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
  IngredientDto,
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
import { localizeDetectedIngredients } from './services/ingredient-localization';

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
    userId: bigint;
    prompt: string;
    imageUrl?: string;
    labels: string[];
    model: string;
    status: AIGenerationStatus;
    recipeId?: number;
  }) {
    return this.prisma.aIGenerationHistory.create({
      data: {
        userId: data.userId,
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
    userId: bigint,
    dto: GenerateRecipeDto,
  ): Promise<GenerateRecipeResponseDto> {
    const prompt = this.promptBuilder.buildRecipePromptFromNames(
      dto.ingredients,
    );

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
    userId: bigint | null = null,
  ): Promise<AnalyzeImageResponseDto> {
    if (userId == null) {
      throw new BadRequestException('Thiếu userId để lưu lịch sử');
    }
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

    const { recipe, historyId, localizedIngredients } =
      await this.generateAndPersistRecipe({
        userId,
        prompt,
        labels: labels.map((l) => l.name),
        recognizedIngredients: ingredients,
        imageUrl: upload.url,
      });

    return {
      labels,
      ingredients: localizedIngredients,
      recipe,
      historyId,
    };
  }

  private async generateAndPersistRecipe(params: {
    userId: bigint;
    prompt: string;
    labels: string[];
    recognizedIngredients?: IngredientDto[];
    imageUrl?: string;
  }): Promise<{
    recipe: SavedRecipeDto;
    historyId: number;
    localizedIngredients: IngredientDto[];
  }> {
    const model = this.configService.getOrThrow<string>('BEDROCK_MODEL_ID');

    try {
      const rawResponse = await this.bedrockService.generateRecipe(
        params.prompt,
      );
      const generatedRecipe = this.parseBedrockRecipe(rawResponse);
      const localizedIngredients = localizeDetectedIngredients(
        params.recognizedIngredients ?? [],
        generatedRecipe.detectedIngredients,
      );

      const savedRecipe = await this.recipePersistence.saveGeneratedRecipe(
        generatedRecipe,
        Number(params.userId),
        params.imageUrl,
      );

      const resolvedThumbnail = await this.resolveImageUrl(params.imageUrl);

      const history = await this.saveHistory({
        userId: params.userId,
        prompt: params.prompt,
        imageUrl: params.imageUrl,
        labels: localizedIngredients.length
          ? localizedIngredients.map((ingredient) => ingredient.name)
          : params.labels,
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
          thumbnail: resolvedThumbnail ?? undefined,
        },
        historyId: Number(history.id),
        localizedIngredients,
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

    if (!Array.isArray(parsed.detectedIngredients)) {
      parsed.detectedIngredients = [];
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

  async getHistory(userId: bigint): Promise<AIGenerationHistoryDto[]> {
    const histories = await this.prisma.aIGenerationHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(histories.map((history) => this.toHistoryDto(history)));
  }

  async getHistoryById(
    id: bigint,
    userId: bigint,
  ): Promise<AIGenerationHistoryDto> {
    const history = await this.prisma.aIGenerationHistory.findFirst({
      where: { id, userId },
    });

    if (!history) {
      throw new NotFoundException(`AI Generation History ${id} not found`);
    }

    return this.toHistoryDto(history);
  }

  private getConfiguredS3Key(value?: string | null): string | null {
    if (!value) return null;

    const bucket = this.configService.get<string>('AWS_BUCKET_NAME');
    if (!bucket) return null;

    try {
      const url = new URL(value);
      if (url.hostname.startsWith(`${bucket}.s3.`)) {
        return decodeURIComponent(url.pathname.replace(/^\//, ''));
      }

      if (
        url.hostname.startsWith('s3.') &&
        url.pathname.startsWith(`/${bucket}/`)
      ) {
        return decodeURIComponent(url.pathname.slice(bucket.length + 2));
      }
    } catch {
      return null;
    }

    return null;
  }

  private async resolveImageUrl(value?: string | null) {
    const key = this.getConfiguredS3Key(value);
    return key ? this.s3Service.getPresignedUrl(key) : value;
  }

  private async toHistoryDto(history: {
    id: bigint;
    userId: bigint;
    recipeId: bigint | null;
    imageUrl: string | null;
    detectedLabels: unknown;
    prompt: string | null;
    model: string | null;
    status: string;
    createdAt: Date;
  }): Promise<AIGenerationHistoryDto> {
    return {
      id: Number(history.id),
      prompt: history.prompt ?? '',
      imageUrl: (await this.resolveImageUrl(history.imageUrl)) ?? '',
      detectedLabels: (history.detectedLabels as string[]) ?? [],
      model: history.model ?? '',
      recipeId: history.recipeId ? Number(history.recipeId) : undefined,
      status: history.status.toLowerCase() as
        'pending' | 'processing' | 'success' | 'failed',
      createdAt: history.createdAt,
      userId: Number(history.userId),
    };
  }
}
