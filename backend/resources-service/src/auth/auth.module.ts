import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [HttpModule],
  providers: [AuthGuard, AdminGuard],
  exports: [AuthGuard, AdminGuard],
})
export class AuthModule {} 