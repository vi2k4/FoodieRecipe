import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { LikesModule } from './modules/likes/likes.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { FollowsModule } from './modules/follows/follows.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
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
    CommentsModule,
    FavoritesModule,
    LikesModule,
    RatingsModule,
    FollowsModule,
    NotificationsModule,
    ReportsModule,
    SearchHistoryModule,
    AIGenerationModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
