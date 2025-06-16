import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DocsAggregatorService } from './docs-aggregator.service';
import { DocsAggregatorController } from './docs-aggregator.controller';
import { AuthDocsController } from './auth-docs.controller';
import { TeletherapyDocsController } from './teletherapy-docs.controller';

@Module({
  imports: [HttpModule],
  controllers: [
    DocsAggregatorController,
    AuthDocsController,
    TeletherapyDocsController,
  ],
  providers: [DocsAggregatorService],
  exports: [DocsAggregatorService],
})
export class DocsModule {} 