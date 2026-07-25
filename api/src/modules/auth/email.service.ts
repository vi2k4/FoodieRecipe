import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendOtp(email: string, otp: string, purpose: 'register' | 'reset') {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    // Local development vẫn trả OTP trong response để test không cần mail server.
    if (!apiKey || !from) {
      if (process.env.NODE_ENV !== 'production') return;
      throw new ServiceUnavailableException('Email service chưa được cấu hình');
    }

    const subject =
      purpose === 'register'
        ? 'Xác minh email FoodiRecipe'
        : 'Đặt lại mật khẩu FoodiRecipe';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html: `<div style="font-family:Arial,sans-serif"><h2>FoodiRecipe</h2><p>Mã OTP của bạn là:</p><strong style="font-size:28px;letter-spacing:8px">${otp}</strong><p>Mã có hiệu lực trong 10 phút.</p></div>`,
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException('Không thể gửi email OTP');
    }
  }
}
