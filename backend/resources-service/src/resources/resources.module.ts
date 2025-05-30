import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { Resource } from '../entities/resource.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource]),
    HttpModule,
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {} 