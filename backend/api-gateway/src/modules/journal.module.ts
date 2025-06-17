import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JournalController } from '../controllers/journal.controller';
import { JournalService } from '../services/journal.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    JournalController,
  ],
  providers: [
    JournalService,
  ],
  exports: [
    JournalService,
  ],
})
export class JournalModule {} 