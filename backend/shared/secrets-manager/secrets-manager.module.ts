import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecretsManagerService } from './secrets-manager.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SecretsManagerService],
  exports: [SecretsManagerService],
})
export class SecretsManagerModule {} 