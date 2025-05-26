import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('environment') === 'production';
        
        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            transport: isProduction 
              ? undefined 
              : { target: 'pino-pretty', options: { singleLine: true } },
            redact: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.headers["set-cookie"]',
              'req.body.password',
              'req.body.passwordConfirmation',
              'req.body.currentPassword',
              'req.body.newPassword',
              'req.body.newPasswordConfirmation'
            ],
            formatters: {
              level: (label) => {
                return { level: label };
              },
            },
            customProps: (req, res) => {
              const user = (req as any).user;
              return {
                context: 'HTTP',
                userId: user?.sub,
                correlationId: req.headers['x-correlation-id'],
              };
            },
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {} 