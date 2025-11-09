import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// CORS configuration based on environment
function getCorsConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  // Define allowed origins for different environments
  const productionOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://app.yourdomain.com',
    // Add your production domains here
  ];

  const developmentOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8080',
    // Add more local development URLs as needed
  ];

  // Allow additional origins from environment variable
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [];

  if (isDevelopment || isTest) {
    return {
      origin: [...developmentOrigins, ...envOrigins],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    };
  }

  // Production configuration - strict origin control
  return {
    origin: (origin, callback) => {
      const allowedOrigins = [...productionOrigins, ...envOrigins];

      // Allow requests with no origin (mobile apps, postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        console.log(`CORS allowed request from: ${origin}`);
        callback(null, true);
      } else {
        console.warn(
          `CORS blocked request from unauthorized origin: ${origin}`,
        );
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400, // Cache preflight requests for 24 hours
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Environment-based CORS configuration for security
  app.enableCors(getCorsConfig());

  console.log(
    `CORS configured for ${process.env.NODE_ENV || 'development'} environment`,
  );

  const config = new DocumentBuilder()
    .setTitle('Humbble API')
    .setDescription('Backend API for Humbble mobile app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server listening to http://localhost:${port}/api`);
}
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
