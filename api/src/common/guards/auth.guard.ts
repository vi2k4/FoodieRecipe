import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
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
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('Thiếu access token để xác thực');
    }

    const token = authorization.replace(/^Bearer\s+/i, '');
    if (!token) {
      throw new UnauthorizedException('Access token không hợp lệ');
    }

    let userIdStr: string;
    try {
      userIdStr = this.authService.verifyAccessToken(token);
    } catch (e) {
      throw new UnauthorizedException(
        e instanceof Error ? e.message : 'Access token không hợp lệ hoặc đã hết hạn',
      );
    }

    let userId: bigint;
    try {
      userId = BigInt(userIdStr);
    } catch {
      throw new UnauthorizedException('Access token không hợp lệ');
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
