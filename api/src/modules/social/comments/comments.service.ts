import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
        throw new NotFoundException(
          `Parent comment with ID ${parentCommentId} not found`,
        );
      }
      if (parentComment.recipeId !== recipeId) {
        throw new ForbiddenException(
          'Parent comment does not belong to this recipe',
        );
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

  async getCommentsTree(recipeId: bigint, page = 1, limit = 10) {
    // 1. Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // 2. Count total comments for this recipe (including child/reply comments)
    const totalComments = await this.prisma.comment.count({
      where: { recipeId, deletedAt: null },
    });

    // Count root comments (comments without parent) for page calculations
    const totalRoots = await this.prisma.comment.count({
      where: { recipeId, parentCommentId: null, deletedAt: null },
    });

    const totalPages = Math.ceil(totalRoots / limit) || 1;

    // 3. Fetch root comments for current page
    const rootComments = await this.prisma.comment.findMany({
      where: { recipeId, parentCommentId: null, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 4. Fetch ALL non-root comments for this recipe
    const childComments = await this.prisma.comment.findMany({
      where: {
        recipeId,
        parentCommentId: { not: null },
        deletedAt: null,
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
      orderBy: { createdAt: 'asc' },
    });

    // 5. Build 3-level tree structure (Level 4+ flatten into Level 3)
    const commentMap = new Map<bigint, any>();
    for (const child of childComments) {
      commentMap.set(child.id, { ...child, replies: [] });
    }

    // Helper to collect all descendants recursively
    const collectAllDescendants = (nodeId: bigint): any[] => {
      const descendants: any[] = [];
      for (const childNode of commentMap.values()) {
        if (childNode.parentCommentId === nodeId) {
          descendants.push({ ...childNode, replies: [] });
          descendants.push(...collectAllDescendants(childNode.id));
        }
      }
      return descendants;
    };

    const data = rootComments.map((root) => {
      // Level 1
      const level1Node = { ...root, replies: [] as any[] };

      // Level 2 (children of root)
      for (const childNode of commentMap.values()) {
        if (childNode.parentCommentId === root.id) {
          const level2Node = { ...childNode, replies: [] as any[] };

          // Level 3 (grandchildren of root)
          for (const grandChildNode of commentMap.values()) {
            if (grandChildNode.parentCommentId === childNode.id) {
              const level3Node = { ...grandChildNode, replies: [] as any[] };

              // Level 4 and deeper are flattened into Level 3's replies
              const deeperDescendants = collectAllDescendants(grandChildNode.id);
              level3Node.replies = deeperDescendants;

              level2Node.replies.push(level3Node);
            }
          }

          level1Node.replies.push(level2Node);
        }
      }
      return level1Node;
    });

    return {
      data,
      meta: {
        total: totalComments,
        totalRoots,
        page,
        limit,
        totalPages,
      },
    };
  }

  async updateComment(
    userId: bigint,
    commentId: bigint,
    updateCommentDto: UpdateCommentDto,
  ) {
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
      throw new ForbiddenException(
        'You do not have permission to edit this comment',
      );
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
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    // 3. Soft delete comment
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Comment deleted successfully' };
  }
}
