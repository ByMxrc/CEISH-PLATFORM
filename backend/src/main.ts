import 'reflect-metadata';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';

const appConfig = {
  port: Number(process.env.APP_PORT ?? 3000),
  host: process.env.APP_HOST ?? '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });
  app.enableCors({ origin: appConfig.corsOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('CEISH Platform API')
    .setDescription('API para gestión de evaluaciones éticas CEISH')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Investigations', 'Gestión de investigaciones')
    .addTag('Risk Assessment', 'Estratificación de riesgo')
    .addTag('Evaluation', 'Evaluación de investigaciones')
    .addTag('Annexes', 'Anexos y plantillas')
    .addTag('Documents', 'Gestión de documentos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(appConfig.port, appConfig.host);
  console.log(`CEISH Platform API running at http://localhost:${appConfig.port}/api/v1`);
}

void bootstrap();
