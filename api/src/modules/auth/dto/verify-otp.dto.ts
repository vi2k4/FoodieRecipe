export class VerifyOtpDto {
  email!: string;
  otp!: string;
  purpose?: 'register' | 'reset';
}
