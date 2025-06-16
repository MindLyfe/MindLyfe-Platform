import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from '../entities/payment.entity';
import { Subscription } from '../entities/subscription.entity';
import { PaymentGatewayFactory } from '../services/payment-gateway-factory.service';
import { CurrencyConverterService } from '../services/currency-converter.service';
import { StripeGatewayService } from '../gateways/stripe/stripe-gateway.service';
import { PayPalGatewayService } from '../gateways/paypal/paypal-gateway.service';
import { DpoGatewayService } from '../gateways/dpo/dpo-gateway.service';
import { AuthModule } from '../auth/auth.module';
import { PaymentNotificationService } from '../common/services/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Subscription]),
    HttpModule,
    ConfigModule,
    AuthModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentGatewayFactory,
    CurrencyConverterService,
    DpoGatewayService,
    StripeGatewayService,
    PayPalGatewayService,
    PaymentNotificationService,
  ],
  exports: [PaymentService, PaymentGatewayFactory, CurrencyConverterService, PaymentNotificationService],
})
export class PaymentModule {} 