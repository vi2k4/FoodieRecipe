/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(dto);
    this.setRefreshCookie(response, session.refreshToken);
    return this.withoutRefreshToken(session);
  }

  @Post('refresh')
  async refresh(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.readRefreshCookie(cookieHeader);
    if (!refreshToken) throw new UnauthorizedException('Thiếu refresh token');
    const session = await this.authService.refreshSession(refreshToken);
    this.setRefreshCookie(response, session.refreshToken);
    return this.withoutRefreshToken(session);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(this.refreshCookieName, this.cookieOptions());
    return { message: 'Đã đăng xuất' };
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(
      dto.email,
      dto.otp,
      dto.purpose || 'register',
    );
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const userId = this.getUserId(authorization);
    return { user: await this.authService.getProfile(userId) };
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateMe(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const userId = this.getUserId(authorization);
    return { user: await this.authService.updateProfile(userId, dto, avatar) };
  }

  @Post('google')
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.loginWithGoogle(dto.credential);
    this.setRefreshCookie(response, session.refreshToken);
    return this.withoutRefreshToken(session);
  }

  private getUserId(authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Thiếu access token');
    return this.authService.verifyAccessToken(token);
  }

  private readonly refreshCookieName = 'foodirecipe_refresh_token';

  private cookieOptions() {
    // HTTP deployments (for example, direct EC2 testing without a domain)
    // cannot store a Secure cookie. Set COOKIE_SECURE=true when HTTPS is enabled.
    const secure = process.env.COOKIE_SECURE === 'true';

    return {
      httpOnly: true,
      secure,
      sameSite: secure ? ('none' as const) : ('lax' as const),
      path: '/api/auth',
    };
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie(this.refreshCookieName, refreshToken, {
      ...this.cookieOptions(),
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private readRefreshCookie(cookieHeader?: string) {
    return cookieHeader
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${this.refreshCookieName}=`))
      ?.split('=')
      .slice(1)
      .join('=');
  }

  private withoutRefreshToken<T extends { refreshToken: string }>(session: T) {
    const { refreshToken: _refreshToken, ...safeSession } = session;
    return safeSession;
  }
}
