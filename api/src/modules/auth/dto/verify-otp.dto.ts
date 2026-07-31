import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, IsIn } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString({ message: 'Mã OTP phải là chuỗi' })
  @Length(6, 6, { message: 'Mã OTP phải gồm đúng 6 ký tự' })
  otp!: string;

  @IsOptional()
  @IsIn(['register', 'reset'], { message: 'Mục đích không hợp lệ' })
  purpose?: 'register' | 'reset';
}
