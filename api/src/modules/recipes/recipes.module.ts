import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { PrismaService } from '../../database/prisma.service';
import { S3Module } from '../../common/storage/s3.module';
import { NotificationsModule } from '../social/notifications/notifications.module';

@Module({
  imports: [S3Module, NotificationsModule],
  controllers: [RecipesController],
  providers: [RecipesService, PrismaService],
  exports: [RecipesService],
})
export class RecipesModule {}
