import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { EmailService } from './email.service';
import { S3Module } from '../../common/storage/s3.module';

@Global()
@Module({
  imports: [UsersModule, S3Module],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}

