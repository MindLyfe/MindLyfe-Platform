import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CommunityClientService } from './community-client.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [CommunityClientService],
  exports: [CommunityClientService],
})
export class CommunityClientModule {} 