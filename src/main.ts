import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { WsAuth } from './realtime/ws.jwt.middleware';
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
  // const jwtService = app.get(JwtService);
  // const wsAuth = new WsAuth(jwtService);

  const adapter = new IoAdapter(app);
  app.useWebSocketAdapter(adapter);
  const server: any = (adapter as any).httpServer?.io ?? (adapter as any).httpServer;
  const io = server?.io ?? (app as any).getHttpServer()?.io ?? (adapter as any).getServer?.();

  // If you can't find io this way, simpler: import socket.io directly where you create the server.
  const jwtService = app.get(JwtService);
  const wsAuth = new WsAuth(jwtService);

  // const io = (adapter as any).httpServer?.io ?? (app as any).getHttpServer()?.io;
  console.log('io instance:', io);
  if (io) {
    io.use((socket, next) => wsAuth.authenticateSocket(socket, next));
    console.log('WebSocket middleware for JWT authentication applied.');
  }
  else {
    console.log('WebSocket server not found; JWT authentication middleware not applied.');
  }
  SwaggerModule.setup('api', app, document);
  // --- END SWAGGER CONFIGURATION ---
  app.use(cookieParser());
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
