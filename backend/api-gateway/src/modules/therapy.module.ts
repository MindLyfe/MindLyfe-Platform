import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'THERAPY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.THERAPY_SERVICE_HOST || 'teletherapy-service',
          port: parseInt(process.env.THERAPY_SERVICE_PORT || '3002'),
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class TherapyModule {} 