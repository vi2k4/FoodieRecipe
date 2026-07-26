import { Module } from '@nestjs/common';
import { CommentsModule } from './comments/comments.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LikesModule } from './likes/likes.module';
import { RatingsModule } from './ratings/ratings.module';
import { FollowsModule } from './follows/follows.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    CommentsModule,
    FavoritesModule,
    LikesModule,
    RatingsModule,
    FollowsModule,
    NotificationsModule,
  ],
  exports: [
    CommentsModule,
    FavoritesModule,
    LikesModule,
    RatingsModule,
    FollowsModule,
    NotificationsModule,
  ],
})
export class SocialModule {}
