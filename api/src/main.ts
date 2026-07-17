import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;

  await app.listen(port);

  console.log(`Backend đang chạy tại http://localhost:${port}/api`);
}

bootstrap();
