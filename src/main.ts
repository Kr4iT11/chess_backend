import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { WebSocketJwtMiddleware } from './realtime/ws.jwt.middleware';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: 'http://localhost:5173',
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // --- SWAGGER CONFIGURATION ---
  const config = new DocumentBuilder()
    .setTitle('Krait Chess API')
    .setDescription('The official API for the Krait Chess application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management and profiles')
    .addTag('social', 'This is for social managment')
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
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const jwtService = app.get(JwtService);
  const wsAuth = new WebSocketJwtMiddleware(jwtService);

  const adapter = new IoAdapter(app);
  app.useWebSocketAdapter(adapter);

  const io = (adapter as any).httpServer?.io ?? (app as any).getHttpServer()?.io;

  if (io) {
    io.use((socket, next) => wsAuth.authenticateSocket(socket, next));
  }
  SwaggerModule.setup('api', app, document);
  // --- END SWAGGER CONFIGURATION ---
  app.use(cookieParser());
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
