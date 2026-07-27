import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../../generated/prisma/client';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createComment(
    userId: bigint,
    recipeId: bigint,
    createCommentDto: CreateCommentDto,
    parentCommentId?: bigint,
  ) {
    const { content } = createCommentDto;

    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. If parent comment is provided, check if it exists and belongs to the same recipe
    if (parentCommentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentCommentId, deletedAt: null },
      });
      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${parentCommentId} not found`);
      }
      if (parentComment.recipeId !== recipeId) {
        throw new ForbiddenException('Parent comment does not belong to this recipe');
      }
    }

    // 3. Create comment
    const newComment = await this.prisma.comment.create({
      data: {
        userId,
        recipeId,
        content,
        parentCommentId: parentCommentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 4. Create Notification
    let targetUserId = recipe.userId;
    let title = 'Bình luận mới';
    let msgContent = `${newComment.user.username} đã bình luận về công thức "${recipe.title}" của bạn.`;

    if (parentCommentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentCommentId },
      });
      if (parentComment && parentComment.userId !== userId) {
        targetUserId = parentComment.userId;
        title = 'Trả lời bình luận';
        msgContent = `${newComment.user.username} đã trả lời bình luận của bạn trong công thức "${recipe.title}".`;
      }
    }

    if (targetUserId !== userId) {
      await this.notificationsService.createNotification({
        userId: targetUserId,
        title,
        content: msgContent,
        type: NotificationType.COMMENT,
        referenceId: recipe.id,
      });
    }

    return newComment;
  }

  async getCommentsTree(recipeId: bigint) {
    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Fetch all comments for the recipe (excluding soft deleted ones)
    const comments = await this.prisma.comment.findMany({
      where: { recipeId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 3. Structure into tree in-memory
    const commentMap = new Map<bigint, any>();
    const roots: any[] = [];

    for (const comment of comments) {
      const commentNode = { ...comment, replies: [] };
      commentMap.set(comment.id, commentNode);
    }

    for (const commentNode of commentMap.values()) {
      if (commentNode.parentCommentId) {
        const parentNode = commentMap.get(commentNode.parentCommentId);
        if (parentNode) {
          parentNode.replies.push(commentNode);
        } else {
          // If parent comment was soft-deleted, we still place it at root
          roots.push(commentNode);
        }
      } else {
        roots.push(commentNode);
      }
    }

    return roots;
  }

  async updateComment(userId: bigint, commentId: bigint, updateCommentDto: UpdateCommentDto) {
    const { content } = updateCommentDto;

    // 1. Find comment
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // 2. Check if owner
    if (comment.userId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this comment');
    }

    // 3. Update comment
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteComment(userId: bigint, commentId: bigint) {
    // 1. Find comment
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // 2. Check ownership or admin role (can check user object if role is stored)
    // For now, check ownership
    if (comment.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    // 3. Soft delete comment
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Comment deleted successfully' };
  }
}
