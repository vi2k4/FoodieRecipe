import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsNotEmpty({ message: 'Google credential không được để trống' })
  @IsString({ message: 'Google credential không hợp lệ' })
  credential!: string;
}
