import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommentsGateway } from './comments.gateway';

@Module({
  imports: [NotificationsModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsGateway],
})
export class CommentsModule {}
