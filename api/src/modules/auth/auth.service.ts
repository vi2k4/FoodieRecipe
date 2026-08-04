/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { resolve4, resolve6, resolveMx } from 'node:dns/promises';
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from './email.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { S3Service } from '../../common/storage/s3.service';
import { ChangePasswordDto } from './dto/change-password.dto';

type SafeUser = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  isVerified: boolean;
};

@Injectable()
export class AuthService {
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'development-only-secret';
  private readonly accessTokenTtlSeconds = 60 * 60 * 24 * 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly s3Service: S3Service,
  ) {}

  async register(dto: RegisterDto) {
    const username = dto.username?.trim();
    const email = dto.email?.trim().toLowerCase();
    this.validatePassword(dto.password);

    if (!username || username.length < 3) {
      throw new ConflictException('Username phải có ít nhất 3 ký tự');
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new ConflictException('Email không hợp lệ');
    }

    await this.validateEmailDomain(email);

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const otp = this.createOtp();
    await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          username,
          email,
          passwordHash: this.hashPassword(dto.password),
        },
      });
      await transaction.oTPVerification.create({
        data: {
          userId: user.id,
          otpCode: this.hashOtp(otp, 'register'),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
    });
    await this.emailService.sendOtp(email, otp, 'register');

    return {
      pendingVerification: true,
      email,
      message: 'Tài khoản đã được tạo. Vui lòng xác minh email bằng mã OTP.',
      ...(process.env.NODE_ENV !== 'production' ? { developmentOtp: otp } : {}),
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email?.trim().toLowerCase();
    const user = email ? await this.usersService.findByEmail(email) : null;

    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Email chưa được xác minh. Vui lòng xác minh bằng mã OTP trước.',
      );
    }

    return this.createSession(user);
  }

  async loginWithGoogle(credential: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new UnauthorizedException('Google OAuth chưa được cấu hình');
    }

    const tokenResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!tokenResponse.ok) {
      throw new UnauthorizedException('Google token không hợp lệ');
    }

    const profile = (await tokenResponse.json()) as {
      aud?: string;
      iss?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
    };
    const isVerifiedEmail =
      profile.email_verified === true || profile.email_verified === 'true';

    if (
      profile.aud !== clientId ||
      !['accounts.google.com', 'https://accounts.google.com'].includes(profile.iss ?? '') ||
      !profile.sub ||
      !profile.email ||
      !isVerifiedEmail
    ) {
      throw new UnauthorizedException('Thông tin tài khoản Google không hợp lệ');
    }

    const email = profile.email.trim().toLowerCase();
    let user = await this.usersService.findByEmail(email);

    if (user) {
      if (user.isLocked) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          ...(profile.picture && !user.avatarUrl ? { avatarUrl: profile.picture } : {}),
        },
      });
    } else {
      const usernameBase = (profile.name || email.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '')
        .slice(0, 35) || 'googleuser';
      const username = `${usernameBase}_${profile.sub.slice(-8)}`.slice(0, 50);

      user = await this.prisma.user.create({
        data: {
          username,
          email,
          passwordHash: this.hashPassword(randomBytes(32).toString('hex')),
          avatarUrl: profile.picture || null,
          isVerified: true,
        },
      });
    }

    return this.createSession(user);
  }

  async refreshSession(refreshToken: string) {
    const current = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!current || current.revoked || current.expiresAt <= new Date()) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    await this.prisma.refreshToken.update({
      where: { id: current.id },
      data: { revoked: true },
    });
    return this.createSession(current.user);
  }

  async forgotPassword(emailInput: string) {
    const email = emailInput?.trim().toLowerCase();
    const user = email ? await this.usersService.findByEmail(email) : null;

    // Không tiết lộ email có tồn tại hay không trong môi trường production.
    if (!user) {
      return { message: 'Nếu email tồn tại, mã OTP đã được gửi.' };
    }

    const otp = this.createOtp();
    await this.prisma.oTPVerification.create({
      data: {
        userId: user.id,
        otpCode: this.hashOtp(otp, 'reset'),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    await this.emailService.sendOtp(email, otp, 'reset');

    return {
      message: 'Mã OTP đã được tạo và có hiệu lực trong 10 phút.',
      ...(process.env.NODE_ENV !== 'production' ? { developmentOtp: otp } : {}),
    };
  }

  async resendVerification(emailInput: string) {
    const email = emailInput?.trim().toLowerCase();
    const user = email ? await this.usersService.findByEmail(email) : null;
    if (!user || user.isVerified) {
      return {
        message: 'Nếu tài khoản chưa xác minh, mã OTP mới đã được gửi.',
      };
    }

    const otp = this.createOtp();
    await this.prisma.oTPVerification.create({
      data: {
        userId: user.id,
        otpCode: this.hashOtp(otp, 'register'),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    await this.emailService.sendOtp(email, otp, 'register');

    return {
      message: 'Mã OTP xác minh mới đã được gửi.',
      ...(process.env.NODE_ENV !== 'production' ? { developmentOtp: otp } : {}),
    };
  }

  async verifyOtp(
    emailInput: string,
    otp: string,
    purpose: 'register' | 'reset' = 'register',
  ) {
    const user = await this.findUser(emailInput);
    const verification = await this.prisma.oTPVerification.findFirst({
      where: {
        userId: user.id,
        otpCode: this.hashOtp(otp, purpose),
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new UnauthorizedException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    if (purpose === 'register') {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
        }),
        this.prisma.oTPVerification.update({
          where: { id: verification.id },
          data: { isUsed: true },
        }),
      ]);
    }

    return { valid: true, message: 'Email đã được xác minh thành công' };
  }

  async resetPassword(emailInput: string, otp: string, newPassword: string) {
    this.validatePassword(newPassword);
    const user = await this.findUser(emailInput);
    const verification = await this.prisma.oTPVerification.findFirst({
      where: {
        userId: user.id,
        otpCode: this.hashOtp(otp, 'reset'),
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new UnauthorizedException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: this.hashPassword(newPassword) },
      }),
      this.prisma.oTPVerification.update({
        where: { id: verification.id },
        data: { isUsed: true },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data: { revoked: true },
      }),
    ]);

    return { message: 'Mật khẩu đã được thay đổi thành công' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            recipes: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');
    return this.toSafeUser(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    avatar?: Express.Multer.File,
  ) {
    const username = dto.username?.trim();
    if (
      username !== undefined &&
      (username.length < 3 || username.length > 50)
    ) {
      throw new ConflictException('Tên người dùng phải có từ 3 đến 50 ký tự');
    }

    if (
      dto.avatarUrl &&
      !/^https?:\/\//i.test(dto.avatarUrl) &&
      !/^data:image\/(jpeg|png|webp|gif);base64,/i.test(dto.avatarUrl)
    ) {
      throw new ConflictException('Ảnh đại diện không hợp lệ');
    }
    if (
      dto.avatarUrl?.startsWith('data:') &&
      dto.avatarUrl.length > 2_800_000
    ) {
      throw new ConflictException('Ảnh đại diện không được lớn hơn 2MB');
    }

    if (avatar) {
      if (!avatar.mimetype.startsWith('image/')) {
        throw new ConflictException('Invalid avatar image');
      }
      if (avatar.size > 2 * 1024 * 1024) {
        throw new ConflictException('Avatar must not exceed 2MB');
      }
    }

    const uploadedAvatarUrl = avatar
      ? (await this.s3Service.uploadImage(avatar, `avatars/${userId}`)).url
      : undefined;

    const user = await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        ...(username !== undefined ? { username } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio?.trim() || null } : {}),
        ...(uploadedAvatarUrl !== undefined
          ? { avatarUrl: uploadedAvatarUrl }
          : dto.avatarUrl !== undefined
            ? { avatarUrl: dto.avatarUrl?.trim() || null }
            : {}),
      },
    });
    return this.toSafeUser(user);
  }

  verifyAccessToken(token: string) {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature)
      throw new UnauthorizedException('Access token không hợp lệ');

    const expected = createHmac('sha256', this.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      throw new UnauthorizedException('Access token không hợp lệ');
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(payload, 'base64url').toString(),
      ) as { sub?: string; exp?: number };
      if (!decoded.sub || !decoded.exp || decoded.exp < Date.now() / 1000)
        throw new Error();
      return decoded.sub;
    } catch {
      throw new UnauthorizedException(
        'Access token đã hết hạn hoặc không hợp lệ',
      );
    }
  }

  private async createSession(user: any) {
    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: this.toSafeUser(user),
      accessToken: this.signToken({
        sub: user.id.toString(),
        email: user.email,
        role: user.role,
      }),
      refreshToken,
    };
  }

  private async findUser(emailInput: string) {
    const user = await this.usersService.findByEmail(
      emailInput?.trim().toLowerCase(),
    );
    if (!user) throw new UnauthorizedException('Email không tồn tại');
    return user;
  }

  private toSafeUser(user: any): SafeUser {
    return {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      _count: user._count
        ? {
            followers: user._count.followers ?? 0,
            following: user._count.following ?? 0,
            recipes: user._count.recipes ?? 0,
          }
        : undefined,
    } as any;
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [, salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return (
      expected.length === derived.length && timingSafeEqual(expected, derived)
    );
  }

  private hashOtp(otp: string, purpose: 'register' | 'reset') {
    return createHmac('sha256', this.jwtSecret)
      .update(`${purpose}:${otp}`)
      .digest('hex');
  }

  private createOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private async validateEmailDomain(email: string) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) throw new ConflictException('Tên miền email không hợp lệ');
    const suggestions: Record<string, string> = {
      'gamil.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlook.co': 'outlook.com',
    };

    if (domain && suggestions[domain]) {
      throw new ConflictException(
        `Tên miền có thể bị gõ sai. Bạn có muốn dùng ${suggestions[domain]} không?`,
      );
    }

    try {
      const records = await resolveMx(domain);
      if (records.length > 0) return;
    } catch (error: any) {
      if (error?.code === 'ENOTFOUND') {
        throw new ConflictException(
          `Tên miền email "${domain}" không tồn tại. Hãy kiểm tra lại phần sau dấu @.`,
        );
      }

      if (error?.code !== 'ENODATA') {
        throw new ConflictException(
          `Không thể kiểm tra tên miền email "${domain}" lúc này. Vui lòng thử lại sau.`,
        );
      }
    }

    // SMTP cho phép dùng A/AAAA khi domain không khai báo MX.
    const [ipv4, ipv6] = await Promise.all([
      resolve4(domain).catch(() => []),
      resolve6(domain).catch(() => []),
    ]);

    if (ipv4.length === 0 && ipv6.length === 0) {
      throw new ConflictException(
        `Tên miền email "${domain}" chưa cấu hình máy chủ nhận thư. Hãy dùng email thật như example@gmail.com.`,
      );
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user || !this.verifyPassword(dto.currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    this.validatePassword(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: this.hashPassword(dto.newPassword) },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data: { revoked: true },
      }),
    ]);

    return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }

  private signToken(payload: Record<string, string>) {
    const header = this.base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = this.base64Url(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.accessTokenTtlSeconds,
      }),
    );
    const signature = createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  private base64Url(value: string) {
    return Buffer.from(value).toString('base64url');
  }

  private validatePassword(password: string) {
    if (!password || password.length < 8) {
      throw new ConflictException('Mật khẩu phải có ít nhất 8 ký tự');
    }
  }
}
