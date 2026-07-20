import { Module } from '@nestjs/common';
import { AIGenerationController } from './ai-generation.controller';
import { AIGenerationService } from './ai.service';

@Module({
  controllers: [AIGenerationController],
  providers: [AIGenerationService],
  exports: [AIGenerationService], // nếu module khác cần dùng
})
export class AIGenerationModule {}
