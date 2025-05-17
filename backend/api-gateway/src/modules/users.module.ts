import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'auth-service',
          port: parseInt(process.env.USER_SERVICE_PORT || '3001'),
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class UsersModule {} 