import { Module } from '@nestjs/common';
import { AIGenerationController } from './ai-generation.controller';
import { AIGenerationService } from './ai.service';
import { S3Module } from 'src/common/storage/s3.module';
import { AwsModule } from 'src/common/aws/aws.module';
import { IngredientService } from './services/ingredient.service';
import { PromptBuilderService } from './prompt/prompt-builder.service';
import { BedrockService } from 'src/common/aws/bedrock.service';
import { RecipePersistenceService } from './services/recipe_persistence.service';

@Module({
  imports: [AwsModule, S3Module],
  controllers: [AIGenerationController],
  providers: [
    AIGenerationService,
    IngredientService,
    PromptBuilderService,
    BedrockService,
    RecipePersistenceService,
  ],
  exports: [
    AIGenerationService,
    IngredientService,
    PromptBuilderService,
    BedrockService,
    RecipePersistenceService,
  ],
})
export class AIGenerationModule {}
