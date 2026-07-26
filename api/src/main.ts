import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformBigIntInterceptor } from './common/interceptors/transform-bigint.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép profile nhận ảnh data URL tối đa khoảng 2MB.
  app.use(json({ limit: '5mb' }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global BigInt interceptor
  app.useGlobalInterceptors(new TransformBigIntInterceptor());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('My Foodie Recipes API')
    .setDescription('API documentation for the Foodie Recipes Sharing Platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập token JWT của bạn',
        in: 'header',
      },
      'JWT-auth', // This name will be referenced in controllers using @ApiBearerAuth('JWT-auth')
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;

  await app.listen(port);

  console.log(`Backend đang chạy tại http://localhost:${port}/api`);
  console.log(`Tài liệu API Swagger tại http://localhost:${port}/api/docs`);
}

bootstrap();
