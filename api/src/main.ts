import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép profile nhận ảnh data URL tối đa khoảng 2MB.
  app.use(json({ limit: '5mb' }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('My Foodie Recipes API Documentation')
    .setDescription('Tài liệu & Giao diện thử nghiệm Swagger API trực quan cho dự án FoodieRecipe')
    .setVersion('1.0')
    .addTag('Recipes', 'APIs Quản lý công thức nấu ăn')
    .addTag('Categories', 'APIs Quản lý danh mục món ăn')
    .addTag('Tags', 'APIs Quản lý thẻ tag phân loại')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;

  await app.listen(port);

  console.log(`Backend API: http://localhost:${port}/api`);
  console.log(`Swagger UI:  http://localhost:${port}/api/docs`);
}

void bootstrap();
