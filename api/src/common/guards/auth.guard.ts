import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userIdHeader = request.headers['x-user-id'];

    if (!userIdHeader) {
      throw new UnauthorizedException('Thiếu header x-user-id để xác thực');
    }

    let userId: bigint;
    try {
      userId = BigInt(userIdHeader);
    } catch {
      throw new UnauthorizedException('x-user-id không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc đã bị xóa');
    }

    if (user.isLocked) {
      throw new UnauthorizedException('Tài khoản này đã bị khóa');
    }

    request.user = user;
    return true;
  }
}
