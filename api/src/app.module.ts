import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { SocialModule } from './modules/social/social.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SearchHistoryModule } from './modules/search-history/search-history.module';
import { AIGenerationModule } from './modules/ai-generation/ai-generation.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RecipesModule,
    CategoriesModule,
    TagsModule,
    SocialModule,
    ReportsModule,
    SearchHistoryModule,
    AIGenerationModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
