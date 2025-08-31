import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // --- SWAGGER CONFIGURATION ---
  const config = new DocumentBuilder()
    .setTitle('Krait Chess API')
    .setDescription('The official API for the Krait Chess application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management and profiles')
    // This part is key for authorizing protected endpoints in the UI
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used to reference the security scheme
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // This creates the /api endpoint for your docs
  // --- END SWAGGER CONFIGURATION ---
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
