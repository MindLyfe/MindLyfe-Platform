import { Controller, All, Req, Res, Param, UseGuards, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../services/proxy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(private readonly proxyService: ProxyService) {}

  // Auth Service Routes - Public routes
  @Public()
  @All('auth/*')
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', req, res);
  }

  // AI Service Routes
  @UseGuards(JwtAuthGuard)
  @All('ai/*')
  async proxyAi(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('ai', req, res);
  }

  // Journal Service Routes
  @UseGuards(JwtAuthGuard)
  @All('journal/*')
  async proxyJournal(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('journal', req, res);
  }

  // Recommender Service Routes
  @UseGuards(JwtAuthGuard)
  @All('recommender/*')
  async proxyRecommender(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('recommender', req, res);
  }

  // LyfBot Service Routes
  @UseGuards(JwtAuthGuard)
  @All('lyfbot/*')
  async proxyLyfbot(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('lyfbot', req, res);
  }

  // Chat Service Health Route - Public
  @Public()
  @All('chat/health')
  async proxyChatHealth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('chat', req, res);
  }

  // Chat Service Routes
  @UseGuards(JwtAuthGuard)
  @All('chat/*')
  async proxyChat(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('chat', req, res);
  }

  // Teletherapy Service Health Route - Public
  @Public()
  @All('teletherapy/health')
  async proxyTeletherapyHealth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('teletherapy', req, res);
  }

  // Teletherapy Service Routes
  @UseGuards(JwtAuthGuard)
  @All('teletherapy/*')
  async proxyTeletherapy(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('teletherapy', req, res);
  }

  // Community Service Routes - Handled by dedicated CommunityController
  // @UseGuards(JwtAuthGuard)
  // @All('community/*')
  // async proxyCommunity(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('community', req, res);
  // }

  // Notification Service Routes
  @UseGuards(JwtAuthGuard)
  @All('notifications/*')
  async proxyNotification(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('notification', req, res);
  }

  // Payment Service Routes - Handled by dedicated PaymentController
  // @Public()
  // @All('payments/detect-currency')
  // async proxyPaymentCurrencyDetection(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // @UseGuards(JwtAuthGuard)
  // @All('payments/convert-currency')
  // async proxyPaymentCurrencyConversion(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // @UseGuards(JwtAuthGuard)
  // @All('payments/exchange-rates')
  // async proxyPaymentExchangeRates(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // @UseGuards(JwtAuthGuard)
  // @All('payments/payment-methods/*')
  // async proxyPaymentMethods(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // @UseGuards(JwtAuthGuard)
  // @All('payments/config')
  // async proxyPaymentConfig(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // @UseGuards(JwtAuthGuard)
  // @All('payments/currencies')
  // async proxyPaymentCurrencies(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // @UseGuards(JwtAuthGuard)
  // @All('payments/gateways')
  // async proxyPaymentGateways(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // @Public()
  // @All('payments/webhook/*')
  // async proxyPaymentWebhooks(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // @UseGuards(JwtAuthGuard)
  // @All('payments/*')
  // async proxyPayment(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('payment', req, res);
  // }

  // Resources Service Routes - Handled by dedicated ResourcesController
  // @UseGuards(JwtAuthGuard)
  // @All('resources/*')
  // async proxyResources(@Req() req: Request, @Res() res: Response) {
  //   return this.proxyToService('resources', req, res);
  // }

  // User Service Routes (part of auth service)
  @UseGuards(JwtAuthGuard)
  @All('users/*')
  async proxyUser(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('user', req, res);
  }

  private async proxyToService(serviceName: string, req: Request, res: Response) {
    try {
      const path = req.url;
      const method = req.method;
      const body = req.body;
      const headers = { ...req.headers };
      const params = req.query;

      // Remove gateway-specific headers
      delete headers.host;
      delete headers.connection;
      delete headers['content-length'];

      this.logger.log(`Proxying ${method} ${path} to ${serviceName} service`);

      const response = await this.proxyService.forwardRequest(
        serviceName,
        path,
        method,
        body,
        headers as Record<string, string>,
        params as Record<string, any>
      );

      // Set response headers
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'transfer-encoding' && 
            key.toLowerCase() !== 'connection' &&
            key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Error proxying to ${serviceName}:`, error.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Service temporarily unavailable',
        service: serviceName,
      });
    }
  }
}