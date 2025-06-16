import { Module } from '@nestjs/common';
import { PaymentController } from '../controllers/payment.controller';
import { ProxyService } from '../services/proxy.service';

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class PaymentModule {} 