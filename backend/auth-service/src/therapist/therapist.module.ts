import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';
import { Therapist } from '../entities/therapist.entity';
import { User } from '../entities/user.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Therapist, User]),
    HttpModule,
    SharedModule,
  ],
  controllers: [TherapistController],
  providers: [TherapistService],
  exports: [TherapistService],
})
export class TherapistModule {}