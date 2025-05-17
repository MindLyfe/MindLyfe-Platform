import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AI_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AI_SERVICE_HOST || 'ai-service',
          port: parseInt(process.env.AI_SERVICE_PORT || '8000'),
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AiModule {} 