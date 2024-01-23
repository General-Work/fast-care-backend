import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('Fast Care API Documentation')
    .setDescription('Fast Care documentation Version 1')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { tagsSorter: 'alpha' },
  });

  await app.listen(process.env.PORT,"0.0.0.0");
}
bootstrap();
