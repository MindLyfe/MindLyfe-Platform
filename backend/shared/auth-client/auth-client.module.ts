import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthClientService } from './auth-client.service';

@Global()
@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class AuthClientModule {} 