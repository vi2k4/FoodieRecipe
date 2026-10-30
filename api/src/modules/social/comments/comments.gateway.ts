import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type JoinRecipePayload = {
  recipeId: string;
};

@WebSocketGateway({
  namespace: 'comments',
  cors: {
    origin: process.env.FRONTEND_URL?.split(',').map((origin) => origin.trim()) || [
      'http://localhost:3000',
    ],
    credentials: true,
  },
})
export class CommentsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('joinRecipe')
  joinRecipe(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: JoinRecipePayload,
  ) {
    if (!payload?.recipeId) return;

    socket.join(this.getRecipeRoom(payload.recipeId));
    console.log(
      `[comments] socket ${socket.id} joined recipe:${payload.recipeId}`,
    );
  }

  emitCommentCreated(recipeId: string, comment: unknown) {
    this.emitToRecipe(recipeId, 'comment.created', comment);
  }

  emitCommentUpdated(recipeId: string, comment: unknown) {
    this.emitToRecipe(recipeId, 'comment.updated', comment);
  }

  emitCommentDeleted(recipeId: string, commentId: string) {
    this.emitToRecipe(recipeId, 'comment.deleted', { commentId });
  }

  private emitToRecipe(recipeId: string, event: string, payload: unknown) {
    this.server
      .to(this.getRecipeRoom(recipeId))
      .emit(event, this.serialize(payload));
  }

  private serialize(value: unknown): unknown {
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((item) => this.serialize(item));

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.serialize(item)]),
      );
    }

    return value;
  }

  private getRecipeRoom(recipeId: string) {
    return `recipe:${recipeId}`;
  }
}
