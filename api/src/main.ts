import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép profile nhận ảnh data URL tối đa khoảng 2MB.
  app.use(json({ limit: '5mb' }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;

  await app.listen(port);

  console.log(`Backend đang chạy tại http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap app', err);
});
